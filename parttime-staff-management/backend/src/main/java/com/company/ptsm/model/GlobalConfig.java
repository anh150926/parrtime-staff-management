/*
 * file: backend/src/main/java/com/company/ptsm/model/GlobalConfig.java
 * (Giữ nguyên, dùng để lưu HOURLY_WAGE)
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String configKey; // "HOURLY_WAGE"

    @Column(nullable = false)
    private String configValue; // "25000"

    private String description;
}