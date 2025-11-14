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
    private String configKey;
    @Column(nullable = false)
    private String configValue;
    private String description;
}