package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing a finalized shift (locked registration)
 */
@Entity
@Table(name = "shift_finalizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftFinalization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private Shift shiftTemplate;

    @Column(name = "finalization_date", nullable = false)
    private LocalDate finalizationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finalized_by", nullable = false)
    private User finalizedBy;

    @CreationTimestamp
    @Column(name = "finalized_at", updatable = false)
    private LocalDateTime finalizedAt;
}


