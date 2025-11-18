/*
 * file: backend/src/main/java/com/company/ptsm/model/Position.java
 * [MỚI] - Hỗ trợ Đề 2 (Mã chức vụ)
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "positions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name; // "Pha chế (Barista)"

    @Column(nullable = false)
    private String positionCode; // "PC"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @OneToMany(mappedBy = "position")
    private Set<User> users;
}