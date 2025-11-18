/*
 * file: backend/src/main/java/com/company/ptsm/config/WebConfig.java
 *
 * (CẢI TIẾN)
 * Cấu hình CORS (Cross-Origin Resource Sharing) toàn cục.
 */
package com.company.ptsm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Áp dụng cho tất cả các API bắt đầu bằng /api/
                registry.addMapping("/api/**")
                        // Cho phép domain của Frontend (ví dụ: cổng 5173)
                        .allowedOrigins("http://localhost:5173")
                        // Các phương thức cho phép
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*") // Cho phép tất cả các header
                        .allowCredentials(true); // Cho phép gửi token/cookie
            }
        };
    }
}