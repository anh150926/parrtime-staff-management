package com.coffee.management.service;

import com.coffee.management.dto.notification.NotificationResponse;
import com.coffee.management.dto.notification.SendNotificationRequest;
import com.coffee.management.dto.notification.BroadcastNotificationRequest;
import com.coffee.management.entity.Notification;
import com.coffee.management.entity.Role;
import com.coffee.management.entity.User;
import com.coffee.management.entity.UserStatus;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.NotificationRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for notification operations
 */
@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get notifications for current user
     */
    public List<NotificationResponse> getNotifications(UserPrincipal currentUser) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications for current user
     */
    public List<NotificationResponse> getUnreadNotifications(UserPrincipal currentUser) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(UserPrincipal currentUser) {
        return notificationRepository.countUnreadByUser(currentUser.getId());
    }

    /**
     * Send notification to a user
     */
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getMessage())
                .link(request.getLink())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.fromEntity(saved);
    }

    /**
     * Send notification (internal use)
     */
    public void sendNotification(Long userId, String title, String message, String link) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .link(link)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(Long notificationId, UserPrincipal currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notificationRepository.markAsRead(notificationId);
    }

    /**
     * Mark all notifications as read
     */
    public void markAllAsRead(UserPrincipal currentUser) {
        notificationRepository.markAllAsReadByUser(currentUser.getId());
    }

    /**
     * Broadcast notification to multiple users (Owner/Manager)
     * Owner: can send to all stores or specific store
     * Manager: can only send to their own store
     */
    public int broadcastNotification(BroadcastNotificationRequest request, UserPrincipal currentUser) {
        List<User> recipients = new ArrayList<>();

        if (currentUser.getRole().equals("OWNER")) {
            // Owner can send to all or specific stores
            if (request.getStoreId() == null) {
                // Send to all active users (except Owner)
                recipients = userRepository.findByStatusAndRoleNot(UserStatus.ACTIVE, Role.OWNER);
            } else {
                // Send to specific store
                recipients = userRepository.findByStoreIdAndStatus(request.getStoreId(), UserStatus.ACTIVE);
            }
        } else if (currentUser.getRole().equals("MANAGER")) {
            // Manager can only send to their store
            if (request.getStoreId() != null && !request.getStoreId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only send notifications to your store");
            }
            recipients = userRepository.findByStoreIdAndStatus(currentUser.getStoreId(), UserStatus.ACTIVE);
            // Remove self from recipients
            recipients = recipients.stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        // Filter by role if specified
        if (request.getTargetRole() != null) {
            Role targetRole = Role.valueOf(request.getTargetRole());
            recipients = recipients.stream()
                    .filter(u -> u.getRole() == targetRole)
                    .collect(Collectors.toList());
        }

        // Send notifications
        int sentCount = 0;
        for (User recipient : recipients) {
            Notification notification = Notification.builder()
                    .user(recipient)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .link(request.getLink())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            sentCount++;
        }

        return sentCount;
    }

    /**
     * Send notification to all staff in a store
     */
    public int sendToStore(Long storeId, String title, String message, String link) {
        List<User> staffInStore = userRepository.findByStoreIdAndStatus(storeId, UserStatus.ACTIVE);
        
        int sentCount = 0;
        for (User staff : staffInStore) {
            Notification notification = Notification.builder()
                    .user(staff)
                    .title(title)
                    .message(message)
                    .link(link)
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
            sentCount++;
        }
        
        return sentCount;
    }
}






