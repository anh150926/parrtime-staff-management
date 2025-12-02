package com.coffee.management.entity;

/**
 * Enum for shift swap request status
 */
public enum SwapStatus {
    PENDING_PEER,      // Waiting for peer confirmation
    PENDING_MANAGER,   // Peer confirmed, waiting for manager approval
    APPROVED,          // Manager approved the swap
    REJECTED,          // Manager rejected or peer declined
    CANCELLED          // Requester cancelled
}




