package com.coffee.management.service;

import com.coffee.management.dto.request.CreateRequestRequest;
import com.coffee.management.dto.request.RequestResponse;
import com.coffee.management.dto.request.ReviewRequestRequest;
import com.coffee.management.entity.Request;
import com.coffee.management.entity.RequestStatus;
import com.coffee.management.entity.User;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.RequestRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for leave/shift change request operations
 */
@Service
@Transactional
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    /**
     * Create a new request (leave or shift change)
     */
    public RequestResponse createRequest(CreateRequestRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Validate datetime
        if (request.getEndDatetime().isBefore(request.getStartDatetime())) {
            throw new BadRequestException("End time must be after start time");
        }

        Request newRequest = Request.builder()
                .user(user)
                .type(request.getType())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .reason(request.getReason())
                .status(RequestStatus.PENDING)
                .build();

        Request saved = requestRepository.save(newRequest);

        // Notify manager
        if (user.getStore() != null && user.getStore().getManager() != null) {
            notificationService.sendNotification(
                    user.getStore().getManager().getId(),
                    "Yêu cầu mới từ nhân viên",
                    user.getFullName() + " đã gửi yêu cầu " + 
                            (request.getType().name().equals("LEAVE") ? "nghỉ phép" : "đổi ca"),
                    "/requests"
            );
        }

        return RequestResponse.fromEntity(saved);
    }

    /**
     * Get all requests (filtered by role)
     */
    public List<RequestResponse> getRequests(RequestStatus status, UserPrincipal currentUser) {
        List<Request> requests;

        if (currentUser.getRole().equals("OWNER")) {
            requests = status != null ? 
                    requestRepository.findByStatus(status) : 
                    requestRepository.findAll();
        } else if (currentUser.getRole().equals("MANAGER")) {
            if (currentUser.getStoreId() == null) {
                throw new BadRequestException("Manager is not assigned to any store");
            }
            requests = status != null ?
                    requestRepository.findByStoreIdAndStatus(currentUser.getStoreId(), status) :
                    requestRepository.findByStoreId(currentUser.getStoreId());
        } else {
            requests = requestRepository.findByUserId(currentUser.getId());
        }

        return requests.stream()
                .map(RequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get request by ID
     */
    public RequestResponse getRequestById(Long id, UserPrincipal currentUser) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));

        // Check permission
        if (!currentUser.getRole().equals("OWNER")) {
            if (currentUser.getRole().equals("MANAGER")) {
                if (request.getUser().getStore() == null || 
                        !request.getUser().getStore().getId().equals(currentUser.getStoreId())) {
                    throw new ForbiddenException("You can only view requests from your store");
                }
            } else if (!request.getUser().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You can only view your own requests");
            }
        }

        return RequestResponse.fromEntity(request);
    }

    /**
     * Get requests by user
     */
    public List<RequestResponse> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId).stream()
                .map(RequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Review (approve/reject) a request
     */
    public RequestResponse reviewRequest(Long id, ReviewRequestRequest reviewRequest, UserPrincipal currentUser) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request", "id", id));

        // Check if already reviewed
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed");
        }

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (request.getUser().getStore() == null || 
                    !request.getUser().getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only review requests from your store");
            }
        }

        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        request.setStatus(reviewRequest.getStatus());
        request.setReviewedBy(reviewer);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNote(reviewRequest.getNote());

        Request updated = requestRepository.save(request);

        // Notify the requester
        String statusText = reviewRequest.getStatus() == RequestStatus.APPROVED ? "đã được duyệt" : "bị từ chối";
        notificationService.sendNotification(
                request.getUser().getId(),
                "Yêu cầu " + statusText,
                "Yêu cầu " + (request.getType().name().equals("LEAVE") ? "nghỉ phép" : "đổi ca") + 
                        " của bạn " + statusText + 
                        (reviewRequest.getNote() != null ? ". Ghi chú: " + reviewRequest.getNote() : ""),
                "/requests"
        );

        auditService.log(currentUser.getId(), 
                reviewRequest.getStatus() == RequestStatus.APPROVED ? "APPROVE" : "REJECT", 
                "REQUEST", id, 
                "Reviewed request for user: " + request.getUser().getUsername());

        return RequestResponse.fromEntity(updated);
    }

    /**
     * Get pending requests count
     */
    public long getPendingRequestsCount(UserPrincipal currentUser) {
        if (currentUser.getRole().equals("OWNER")) {
            return requestRepository.countPendingRequests();
        } else if (currentUser.getRole().equals("MANAGER") && currentUser.getStoreId() != null) {
            return requestRepository.countPendingRequestsByStore(currentUser.getStoreId());
        }
        return 0;
    }
}








