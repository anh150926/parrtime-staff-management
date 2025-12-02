package com.coffee.management.service;

import com.coffee.management.dto.complaint.*;
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
 * Service for complaint operations
 */
@Service
@Transactional
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    /**
     * Create a new complaint (Staff only)
     */
    public ComplaintResponse createComplaint(CreateComplaintRequest request, UserPrincipal currentUser) {
        User fromUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        if (fromUser.getStore() == null) {
            throw new BadRequestException("You must belong to a store to submit a complaint");
        }

        Store store = fromUser.getStore();

        Complaint complaint = Complaint.builder()
                .store(store)
                .fromUser(fromUser)
                .type(request.getType())
                .subject(request.getSubject())
                .content(request.getContent())
                .status(ComplaintStatus.PENDING)
                .build();

        Complaint saved = complaintRepository.save(complaint);

        auditService.log(currentUser.getId(), "CREATE", "COMPLAINT", saved.getId(),
                "Created complaint: " + request.getSubject());

        // Notify store manager
        if (store.getManager() != null) {
            notificationService.sendNotification(store.getManager().getId(),
                    "Khiếu nại mới",
                    fromUser.getFullName() + " gửi khiếu nại: " + request.getSubject(),
                    "/complaints");
        }

        return ComplaintResponse.fromEntity(saved);
    }

    /**
     * Get my complaints (Staff)
     */
    public List<ComplaintResponse> getMyComplaints(Long userId) {
        return complaintRepository.findByFromUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints by store (Manager)
     */
    public List<ComplaintResponse> getComplaintsByStore(Long storeId, UserPrincipal currentUser) {
        // Validate permission
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only view complaints for your store");
        }

        return complaintRepository.findByStoreIdOrderByCreatedAtDesc(storeId)
                .stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all complaints (Owner)
     */
    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get pending complaints by store
     */
    public List<ComplaintResponse> getPendingComplaints(Long storeId) {
        return complaintRepository.findPendingByStore(storeId)
                .stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending complaints (Owner)
     */
    public List<ComplaintResponse> getAllPendingComplaints() {
        return complaintRepository.findAllPending()
                .stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get complaint by ID
     */
    public ComplaintResponse getComplaintById(Long id, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Validate access
        if (currentUser.getRole().equals("STAFF")) {
            if (!complaint.getFromUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only view your own complaints");
            }
        } else if (currentUser.getRole().equals("MANAGER")) {
            if (!complaint.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only view complaints for your store");
            }
        }

        return ComplaintResponse.fromEntity(complaint);
    }

    /**
     * Respond to a complaint (Manager/Owner)
     */
    public ComplaintResponse respondToComplaint(Long id, RespondComplaintRequest request, UserPrincipal currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Validate permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (!complaint.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only respond to complaints for your store");
            }
        }

        User responder = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        complaint.setStatus(request.getStatus());
        complaint.setResponse(request.getResponse());
        complaint.setRespondedBy(responder);
        complaint.setRespondedAt(LocalDateTime.now());

        Complaint updated = complaintRepository.save(complaint);

        auditService.log(currentUser.getId(), "RESPOND", "COMPLAINT", id,
                "Responded to complaint: " + request.getStatus());

        // Notify the complaint owner
        String statusText = getStatusText(request.getStatus());
        notificationService.sendNotification(complaint.getFromUser().getId(),
                "Phản hồi khiếu nại",
                "Khiếu nại \"" + complaint.getSubject() + "\" đã được " + statusText,
                "/complaints");

        return ComplaintResponse.fromEntity(updated);
    }

    /**
     * Count pending complaints for a store
     */
    public long countPendingComplaints(Long storeId) {
        return complaintRepository.countPendingByStore(storeId);
    }

    private String getStatusText(ComplaintStatus status) {
        return switch (status) {
            case IN_PROGRESS -> "đang xử lý";
            case RESOLVED -> "giải quyết";
            case REJECTED -> "từ chối";
            case CLOSED -> "đóng";
            default -> "cập nhật";
        };
    }
}



