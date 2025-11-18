/*
 * file: backend/src/main/java/com/company/ptsm/PtsmApplication.java
 *
 * (CẢI TIẾN)
 * File khởi chạy chính của Spring Boot.
 */
package com.company.ptsm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PtsmApplication {

    public static void main(String[] args) {
        // Chạy ứng dụng
        SpringApplication.run(PtsmApplication.class, args);
    }

}