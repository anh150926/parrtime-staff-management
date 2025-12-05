package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing in-app notifications
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(length = 500)
    private String link;

    @Lob
    @Column(name = "attachment_url", columnDefinition = "LONGTEXT")
    private String attachmentUrl;

    @Column(name = "attachment_name", length = 255)
    private String attachmentName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit getter for IDE recognition (Lombok @Getter also generates this)
    public User getUser() {
        return user;
    }

    // Explicit builder method for IDE recognition (Lombok @Builder also generates this)
    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    // Builder class for IDE recognition (Lombok @Builder also generates this)
    public static class NotificationBuilder {
        private Long id;
        private User user;
        private String title;
        private String message;
        private Boolean isRead = false; // Default value from @Builder.Default
        private String link;
        private String attachmentUrl;
        private String attachmentName;
        private LocalDateTime createdAt;

        public NotificationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public NotificationBuilder user(User user) {
            this.user = user;
            return this;
        }

        public NotificationBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationBuilder message(String message) {
            this.message = message;
            return this;
        }

        public NotificationBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public NotificationBuilder link(String link) {
            this.link = link;
            return this;
        }

        public NotificationBuilder attachmentUrl(String attachmentUrl) {
            this.attachmentUrl = attachmentUrl;
            return this;
        }

        public NotificationBuilder attachmentName(String attachmentName) {
            this.attachmentName = attachmentName;
            return this;
        }

        public NotificationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Notification build() {
            return new Notification(id, user, title, message, isRead, link, attachmentUrl, attachmentName, createdAt);
        }
    }
}








