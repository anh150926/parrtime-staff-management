package com.coffee.management.entity;

/**
 * Enum for shift marketplace listing status
 */
public enum MarketplaceStatus {
    PENDING,     // Waiting for someone to claim
    CLAIMED,     // Someone claimed, waiting for manager approval
    APPROVED,    // Manager approved the transfer
    REJECTED,    // Manager rejected the transfer
    CANCELLED,   // Original user cancelled the listing
    EXPIRED      // Listing expired (shift started or past deadline)
}




