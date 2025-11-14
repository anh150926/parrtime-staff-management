/*
 * file: backend/src/main/java/com/company/ptsm/config/WebConfig.java
 *
 * Cấu hình CORS toàn cục cho ứng dụng.
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
                registry.addMapping("/api/**") // Chỉ áp dụng cho các API
                        .allowedOrigins("http://localhost:5173") // Cho phép domain của Frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức cho phép
                        .allowedHeaders("*") // Cho phép tất cả các header
                        .allowCredentials(true); // Cho phép gửi cookie/token
            }
        };
    }
}