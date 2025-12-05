package com.coffee.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for Coffee Shop Staff Management System
 * Manages part-time employees across 3 coffee shops in Hanoi
 */
@SpringBootApplication
@EnableScheduling
public class CoffeeManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoffeeManagementApplication.class, args);
    }
}








