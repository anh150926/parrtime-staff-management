package com.coffee.management.service;

import com.coffee.management.dto.marketplace.*;
import com.coffee.management.entity.*;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for shift marketplace operations
 */
@Service
@Transactional
public class MarketplaceService {

    @Autowired
    private ShiftMarketplaceRepository marketplaceRepository;

    @Autowired
    private ShiftSwapRequestRepository swapRequestRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftAssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    // ==================== MARKETPLACE LISTINGS ====================

    /**
     * Get available marketplace listings for a store
     */
    public List<MarketplaceListingResponse> getAvailableListings(Long storeId) {
        return marketplaceRepository.findAvailableByStore(storeId, LocalDateTime.now())
                .stream()
                .map(MarketplaceListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all marketplace listings for a store (manager view)
     */
    public List<MarketplaceListingResponse> getAllListingsByStore(Long storeId) {
        return marketplaceRepository.findAllByStore(storeId)
                .stream()
                .map(MarketplaceListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get my listings
     */
    public List<MarketplaceListingResponse> getMyListings(Long userId) {
        return marketplaceRepository.findByFromUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(MarketplaceListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get listings pending manager approval
     */
    public List<MarketplaceListingResponse> getPendingApproval(Long storeId) {
        return marketplaceRepository.findPendingApprovalByStore(storeId)
                .stream()
                .map(MarketplaceListingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a marketplace listing (give away or open shift)
     */
    public MarketplaceListingResponse createListing(CreateMarketplaceListingRequest request, UserPrincipal currentUser) {
        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", request.getShiftId()));

        User fromUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Validate shift hasn't started
        if (shift.getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot list a shift that has already started");
        }

        // Get store settings for minimum hours
        Store store = shift.getStore();
        int minHours = store.getMinHoursBeforeGive() != null ? store.getMinHoursBeforeGive() : 2;
        
        if (shift.getStartDatetime().isBefore(LocalDateTime.now().plusHours(minHours))) {
            throw new BadRequestException("Must list shift at least " + minHours + " hours before start");
        }

        // Check if user is assigned to this shift (for GIVE_AWAY type)
        if (request.getType() == MarketplaceType.GIVE_AWAY) {
            boolean isAssigned = assignmentRepository.existsByShiftIdAndUserId(request.getShiftId(), currentUser.getId());
            if (!isAssigned) {
                throw new BadRequestException("You are not assigned to this shift");
            }
        }

        // Check if there's already an active listing for this shift
        marketplaceRepository.findActiveByShiftId(request.getShiftId())
                .ifPresent(existing -> {
                    throw new BadRequestException("There is already an active listing for this shift");
                });

        // Create listing
        ShiftMarketplace listing = ShiftMarketplace.builder()
                .shift(shift)
                .type(request.getType())
                .fromUser(fromUser)
                .status(MarketplaceStatus.PENDING)
                .reason(request.getReason())
                .expiresAt(shift.getStartDatetime().minusHours(1))
                .build();

        ShiftMarketplace saved = marketplaceRepository.save(listing);

        auditService.log(currentUser.getId(), "CREATE", "MARKETPLACE_LISTING", saved.getId(),
                "Created listing for shift: " + shift.getTitle());

        // Notify manager
        if (store.getManager() != null) {
            notificationService.sendNotification(store.getManager().getId(),
                    "Ca làm mới trên Chợ Ca",
                    fromUser.getFullName() + " đã đăng nhường ca " + shift.getTitle(),
                    "/marketplace");
        }

        return MarketplaceListingResponse.fromEntity(saved);
    }

    /**
     * Claim a marketplace listing
     */
    public MarketplaceListingResponse claimListing(Long listingId, UserPrincipal currentUser) {
        ShiftMarketplace listing = marketplaceRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        // Validate listing status
        if (listing.getStatus() != MarketplaceStatus.PENDING) {
            throw new BadRequestException("This listing is no longer available");
        }

        // Validate shift hasn't started
        if (listing.getShift().getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This shift has already started");
        }

        // Cannot claim own listing
        if (listing.getFromUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot claim your own listing");
        }

        User claimer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Check user is in same store
        if (claimer.getStore() == null || !claimer.getStore().getId().equals(listing.getShift().getStore().getId())) {
            throw new BadRequestException("You must belong to the same store to claim this shift");
        }

        // Check for conflicting shifts
        List<Shift> userShifts = shiftRepository.findByUserAssignment(currentUser.getId(), listing.getShift().getStartDatetime().minusHours(1));
        for (Shift s : userShifts) {
            if (isOverlapping(s.getStartDatetime(), s.getEndDatetime(), 
                             listing.getShift().getStartDatetime(), listing.getShift().getEndDatetime())) {
                throw new BadRequestException("You already have a shift during this time");
            }
        }

        // Update listing
        listing.setToUser(claimer);
        listing.setStatus(MarketplaceStatus.CLAIMED);
        ShiftMarketplace updated = marketplaceRepository.save(listing);

        auditService.log(currentUser.getId(), "CLAIM", "MARKETPLACE_LISTING", listingId,
                "Claimed listing for shift: " + listing.getShift().getTitle());

        // Notify original user and manager
        notificationService.sendNotification(listing.getFromUser().getId(),
                "Có người nhận ca của bạn",
                claimer.getFullName() + " đã yêu cầu nhận ca " + listing.getShift().getTitle() + ". Chờ Manager duyệt.",
                "/marketplace");

        Store store = listing.getShift().getStore();
        if (store.getManager() != null) {
            notificationService.sendNotification(store.getManager().getId(),
                    "Yêu cầu chuyển ca cần duyệt",
                    claimer.getFullName() + " muốn nhận ca " + listing.getShift().getTitle() + " từ " + listing.getFromUser().getFullName(),
                    "/marketplace");
        }

        return MarketplaceListingResponse.fromEntity(updated);
    }

    /**
     * Manager approves or rejects a listing
     */
    public MarketplaceListingResponse reviewListing(Long listingId, ReviewMarketplaceRequest request, UserPrincipal currentUser) {
        ShiftMarketplace listing = marketplaceRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        // Validate permission
        if (!currentUser.getRole().equals("OWNER")) {
            if (!listing.getShift().getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only review listings for your store");
            }
        }

        // Validate listing status
        if (listing.getStatus() != MarketplaceStatus.CLAIMED) {
            throw new BadRequestException("This listing cannot be reviewed in its current state");
        }

        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        listing.setStatus(request.getStatus());
        listing.setManagerNote(request.getNote());
        listing.setReviewedBy(reviewer);
        listing.setReviewedAt(LocalDateTime.now());

        // If approved, transfer the shift assignment
        if (request.getStatus() == MarketplaceStatus.APPROVED) {
            // Remove assignment from original user
            assignmentRepository.deleteByShiftIdAndUserId(listing.getShift().getId(), listing.getFromUser().getId());
            
            // Create assignment for new user
            ShiftAssignment newAssignment = ShiftAssignment.builder()
                    .shift(listing.getShift())
                    .user(listing.getToUser())
                    .status(AssignmentStatus.CONFIRMED)
                    .build();
            assignmentRepository.save(newAssignment);

            auditService.log(currentUser.getId(), "APPROVE", "MARKETPLACE_LISTING", listingId,
                    "Approved shift transfer from " + listing.getFromUser().getFullName() + 
                    " to " + listing.getToUser().getFullName());

            // Notify users
            notificationService.sendNotification(listing.getFromUser().getId(),
                    "Đã duyệt nhường ca",
                    "Yêu cầu nhường ca " + listing.getShift().getTitle() + " cho " + listing.getToUser().getFullName() + " đã được duyệt",
                    "/my-shifts");

            notificationService.sendNotification(listing.getToUser().getId(),
                    "Đã nhận ca mới",
                    "Bạn đã được nhận ca " + listing.getShift().getTitle(),
                    "/my-shifts");
        } else if (request.getStatus() == MarketplaceStatus.REJECTED) {
            auditService.log(currentUser.getId(), "REJECT", "MARKETPLACE_LISTING", listingId,
                    "Rejected shift transfer: " + (request.getNote() != null ? request.getNote() : ""));

            notificationService.sendNotification(listing.getFromUser().getId(),
                    "Từ chối nhường ca",
                    "Yêu cầu nhường ca " + listing.getShift().getTitle() + " đã bị từ chối" + 
                    (request.getNote() != null ? ": " + request.getNote() : ""),
                    "/marketplace");

            notificationService.sendNotification(listing.getToUser().getId(),
                    "Yêu cầu nhận ca bị từ chối",
                    "Yêu cầu nhận ca " + listing.getShift().getTitle() + " đã bị từ chối" +
                    (request.getNote() != null ? ": " + request.getNote() : ""),
                    "/marketplace");
        }

        ShiftMarketplace updated = marketplaceRepository.save(listing);
        return MarketplaceListingResponse.fromEntity(updated);
    }

    /**
     * Cancel a listing
     */
    public MarketplaceListingResponse cancelListing(Long listingId, UserPrincipal currentUser) {
        ShiftMarketplace listing = marketplaceRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        // Only owner of listing or manager can cancel
        if (!listing.getFromUser().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals("OWNER") &&
            !currentUser.getRole().equals("MANAGER")) {
            throw new ForbiddenException("You can only cancel your own listings");
        }

        if (listing.getStatus() != MarketplaceStatus.PENDING && listing.getStatus() != MarketplaceStatus.CLAIMED) {
            throw new BadRequestException("This listing cannot be cancelled in its current state");
        }

        listing.setStatus(MarketplaceStatus.CANCELLED);
        ShiftMarketplace updated = marketplaceRepository.save(listing);

        auditService.log(currentUser.getId(), "CANCEL", "MARKETPLACE_LISTING", listingId,
                "Cancelled listing for shift: " + listing.getShift().getTitle());

        return MarketplaceListingResponse.fromEntity(updated);
    }

    // ==================== SWAP REQUESTS ====================

    /**
     * Create a swap request
     */
    public SwapRequestResponse createSwapRequest(CreateSwapRequest request, UserPrincipal currentUser) {
        // Get my assignment
        ShiftAssignment myAssignment = assignmentRepository.findByShiftIdAndUserId(request.getMyShiftId(), currentUser.getId())
                .orElseThrow(() -> new BadRequestException("You are not assigned to this shift"));

        // Get target assignment
        ShiftAssignment targetAssignment = assignmentRepository.findByShiftIdAndUserId(request.getTargetShiftId(), request.getTargetUserId())
                .orElseThrow(() -> new BadRequestException("Target user is not assigned to the specified shift"));

        // Validate both shifts are in the future
        if (myAssignment.getShift().getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot swap a shift that has already started");
        }
        if (targetAssignment.getShift().getStartDatetime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot swap with a shift that has already started");
        }

        // Check for existing swap requests
        if (swapRequestRepository.hasActiveSwapRequest(myAssignment.getId())) {
            throw new BadRequestException("Your shift already has a pending swap request");
        }

        User fromUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
        User toUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getTargetUserId()));

        ShiftSwapRequest swapRequest = ShiftSwapRequest.builder()
                .fromAssignment(myAssignment)
                .toAssignment(targetAssignment)
                .fromUser(fromUser)
                .toUser(toUser)
                .status(SwapStatus.PENDING_PEER)
                .reason(request.getReason())
                .peerConfirmed(false)
                .build();

        ShiftSwapRequest saved = swapRequestRepository.save(swapRequest);

        auditService.log(currentUser.getId(), "CREATE", "SWAP_REQUEST", saved.getId(),
                "Requested swap: " + myAssignment.getShift().getTitle() + " <-> " + targetAssignment.getShift().getTitle());

        // Notify target user
        notificationService.sendNotification(toUser.getId(),
                "Yêu cầu đổi ca",
                fromUser.getFullName() + " muốn đổi ca " + myAssignment.getShift().getTitle() + " với ca " + targetAssignment.getShift().getTitle() + " của bạn",
                "/marketplace");

        return SwapRequestResponse.fromEntity(saved);
    }

    /**
     * Get swap requests for current user
     */
    public List<SwapRequestResponse> getMySwapRequests(Long userId) {
        return swapRequestRepository.findByUserId(userId)
                .stream()
                .map(SwapRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get swap requests pending peer confirmation
     */
    public List<SwapRequestResponse> getPendingPeerConfirmation(Long userId) {
        return swapRequestRepository.findPendingPeerConfirmation(userId)
                .stream()
                .map(SwapRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get swap requests pending manager approval
     */
    public List<SwapRequestResponse> getSwapsPendingApproval(Long storeId) {
        return swapRequestRepository.findPendingManagerApprovalByStore(storeId)
                .stream()
                .map(SwapRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Peer confirms or rejects swap request
     */
    public SwapRequestResponse confirmSwapRequest(Long swapId, boolean confirm, UserPrincipal currentUser) {
        ShiftSwapRequest swapRequest = swapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("SwapRequest", "id", swapId));

        // Validate user is the target
        if (!swapRequest.getToUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not the target of this swap request");
        }

        if (swapRequest.getStatus() != SwapStatus.PENDING_PEER) {
            throw new BadRequestException("This request is not pending your confirmation");
        }

        if (confirm) {
            swapRequest.setPeerConfirmed(true);
            swapRequest.setStatus(SwapStatus.PENDING_MANAGER);

            // Notify requester and manager
            notificationService.sendNotification(swapRequest.getFromUser().getId(),
                    "Đồng nghiệp đồng ý đổi ca",
                    swapRequest.getToUser().getFullName() + " đã đồng ý đổi ca. Chờ Manager duyệt.",
                    "/marketplace");

            Store store = swapRequest.getFromAssignment().getShift().getStore();
            if (store.getManager() != null) {
                notificationService.sendNotification(store.getManager().getId(),
                        "Yêu cầu đổi ca cần duyệt",
                        swapRequest.getFromUser().getFullName() + " và " + swapRequest.getToUser().getFullName() + " muốn đổi ca",
                        "/marketplace");
            }
        } else {
            swapRequest.setStatus(SwapStatus.REJECTED);

            notificationService.sendNotification(swapRequest.getFromUser().getId(),
                    "Từ chối đổi ca",
                    swapRequest.getToUser().getFullName() + " đã từ chối yêu cầu đổi ca của bạn",
                    "/marketplace");
        }

        ShiftSwapRequest updated = swapRequestRepository.save(swapRequest);
        return SwapRequestResponse.fromEntity(updated);
    }

    /**
     * Manager approves or rejects swap request
     */
    public SwapRequestResponse reviewSwapRequest(Long swapId, boolean approve, String note, UserPrincipal currentUser) {
        ShiftSwapRequest swapRequest = swapRequestRepository.findById(swapId)
                .orElseThrow(() -> new ResourceNotFoundException("SwapRequest", "id", swapId));

        // Validate permission
        if (!currentUser.getRole().equals("OWNER")) {
            Long storeId = swapRequest.getFromAssignment().getShift().getStore().getId();
            if (!storeId.equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only review swap requests for your store");
            }
        }

        if (swapRequest.getStatus() != SwapStatus.PENDING_MANAGER) {
            throw new BadRequestException("This request is not pending manager approval");
        }

        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        swapRequest.setReviewedBy(reviewer);
        swapRequest.setReviewedAt(LocalDateTime.now());

        if (approve) {
            swapRequest.setStatus(SwapStatus.APPROVED);

            // Swap the assignments
            ShiftAssignment fromAssignment = swapRequest.getFromAssignment();
            ShiftAssignment toAssignment = swapRequest.getToAssignment();

            User fromUser = fromAssignment.getUser();
            User toUser = toAssignment.getUser();

            fromAssignment.setUser(toUser);
            toAssignment.setUser(fromUser);

            assignmentRepository.save(fromAssignment);
            assignmentRepository.save(toAssignment);

            auditService.log(currentUser.getId(), "APPROVE", "SWAP_REQUEST", swapId,
                    "Approved swap between " + swapRequest.getFromUser().getFullName() + 
                    " and " + swapRequest.getToUser().getFullName());

            // Notify both users
            notificationService.sendNotification(swapRequest.getFromUser().getId(),
                    "Đổi ca được duyệt",
                    "Yêu cầu đổi ca với " + swapRequest.getToUser().getFullName() + " đã được duyệt",
                    "/my-shifts");

            notificationService.sendNotification(swapRequest.getToUser().getId(),
                    "Đổi ca được duyệt",
                    "Yêu cầu đổi ca với " + swapRequest.getFromUser().getFullName() + " đã được duyệt",
                    "/my-shifts");
        } else {
            swapRequest.setStatus(SwapStatus.REJECTED);

            auditService.log(currentUser.getId(), "REJECT", "SWAP_REQUEST", swapId,
                    "Rejected swap: " + (note != null ? note : ""));

            notificationService.sendNotification(swapRequest.getFromUser().getId(),
                    "Đổi ca bị từ chối",
                    "Yêu cầu đổi ca đã bị từ chối" + (note != null ? ": " + note : ""),
                    "/marketplace");

            notificationService.sendNotification(swapRequest.getToUser().getId(),
                    "Đổi ca bị từ chối",
                    "Yêu cầu đổi ca đã bị từ chối" + (note != null ? ": " + note : ""),
                    "/marketplace");
        }

        ShiftSwapRequest updated = swapRequestRepository.save(swapRequest);
        return SwapRequestResponse.fromEntity(updated);
    }

    // ==================== HELPER METHODS ====================

    private boolean isOverlapping(LocalDateTime start1, LocalDateTime end1, LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}




