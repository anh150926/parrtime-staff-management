/*
 * file: backend/src/main/java/com/company/ptsm/config/OpenApiConfig.java
 *
 * Cấu hình Swagger/OpenAPI 3 để hỗ trợ JWT.
 */
package com.company.ptsm.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth"; // Tên của lược đồ bảo mật

        return new OpenAPI()
                // 1. Thêm thành phần bảo mật (Security Scheme)
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP) // Kiểu HTTP
                                                .scheme("bearer") // Lược đồ là "bearer"
                                                .bearerFormat("JWT") // Định dạng là JWT
                                                .in(SecurityScheme.In.HEADER) // Nằm trong Header
                                                .name("Authorization") // Tên header là Authorization
                                ))
                // 2. Yêu cầu bảo mật toàn cục (bắt buộc nhập token)
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))

                // 3. Thêm thông tin chung cho API
                .info(new Info()
                        .title("Part-Time Staff Management API")
                        .version("v1.0.0")
                        .description("API cho hệ thống quản lý nhân viên bán thời gian."));
    }
}