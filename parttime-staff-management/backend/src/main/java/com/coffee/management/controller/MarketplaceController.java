package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.marketplace.*;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for shift marketplace endpoints
 */
@RestController
@RequestMapping("/api/v1/marketplace")
@Tag(name = "Marketplace", description = "Shift marketplace endpoints")
public class MarketplaceController {

    @Autowired
    private MarketplaceService marketplaceService;

    // ==================== LISTINGS ====================

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get available marketplace listings for a store")
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponse>>> getAvailableListings(
            @PathVariable Long storeId) {
        List<MarketplaceListingResponse> listings = marketplaceService.getAvailableListings(storeId);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @GetMapping("/store/{storeId}/all")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get all marketplace listings for a store (manager view)")
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponse>>> getAllListingsByStore(
            @PathVariable Long storeId) {
        List<MarketplaceListingResponse> listings = marketplaceService.getAllListingsByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @GetMapping("/my-listings")
    @Operation(summary = "Get my marketplace listings")
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponse>>> getMyListings(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<MarketplaceListingResponse> listings = marketplaceService.getMyListings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @GetMapping("/pending-approval/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get listings pending manager approval")
    public ResponseEntity<ApiResponse<List<MarketplaceListingResponse>>> getPendingApproval(
            @PathVariable Long storeId) {
        List<MarketplaceListingResponse> listings = marketplaceService.getPendingApproval(storeId);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @PostMapping("/give")
    @Operation(summary = "Create a give-away listing")
    public ResponseEntity<ApiResponse<MarketplaceListingResponse>> createListing(
            @Valid @RequestBody CreateMarketplaceListingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MarketplaceListingResponse listing = marketplaceService.createListing(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã đăng ca lên Chợ Ca", listing));
    }

    @PostMapping("/claim/{listingId}")
    @Operation(summary = "Claim a marketplace listing")
    public ResponseEntity<ApiResponse<MarketplaceListingResponse>> claimListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MarketplaceListingResponse listing = marketplaceService.claimListing(listingId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã yêu cầu nhận ca. Chờ Manager duyệt.", listing));
    }

    @PostMapping("/review/{listingId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Review (approve/reject) a claimed listing")
    public ResponseEntity<ApiResponse<MarketplaceListingResponse>> reviewListing(
            @PathVariable Long listingId,
            @Valid @RequestBody ReviewMarketplaceRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MarketplaceListingResponse listing = marketplaceService.reviewListing(listingId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã xử lý yêu cầu", listing));
    }

    @PostMapping("/cancel/{listingId}")
    @Operation(summary = "Cancel a marketplace listing")
    public ResponseEntity<ApiResponse<MarketplaceListingResponse>> cancelListing(
            @PathVariable Long listingId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MarketplaceListingResponse listing = marketplaceService.cancelListing(listingId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy yêu cầu", listing));
    }

    // ==================== SWAP REQUESTS ====================

    @PostMapping("/swap")
    @Operation(summary = "Create a swap request")
    public ResponseEntity<ApiResponse<SwapRequestResponse>> createSwapRequest(
            @Valid @RequestBody CreateSwapRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SwapRequestResponse swapRequest = marketplaceService.createSwapRequest(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu đổi ca", swapRequest));
    }

    @GetMapping("/my-swaps")
    @Operation(summary = "Get my swap requests")
    public ResponseEntity<ApiResponse<List<SwapRequestResponse>>> getMySwapRequests(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<SwapRequestResponse> swaps = marketplaceService.getMySwapRequests(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(swaps));
    }

    @GetMapping("/pending-peer")
    @Operation(summary = "Get swap requests waiting for my confirmation")
    public ResponseEntity<ApiResponse<List<SwapRequestResponse>>> getPendingPeerConfirmation(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<SwapRequestResponse> swaps = marketplaceService.getPendingPeerConfirmation(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(swaps));
    }

    @GetMapping("/swaps/pending-approval/{storeId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Get swap requests pending manager approval")
    public ResponseEntity<ApiResponse<List<SwapRequestResponse>>> getSwapsPendingApproval(
            @PathVariable Long storeId) {
        List<SwapRequestResponse> swaps = marketplaceService.getSwapsPendingApproval(storeId);
        return ResponseEntity.ok(ApiResponse.success(swaps));
    }

    @PostMapping("/swap/{swapId}/confirm")
    @Operation(summary = "Peer confirms or declines a swap request")
    public ResponseEntity<ApiResponse<SwapRequestResponse>> confirmSwapRequest(
            @PathVariable Long swapId,
            @RequestParam boolean confirm,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SwapRequestResponse swap = marketplaceService.confirmSwapRequest(swapId, confirm, currentUser);
        String message = confirm ? "Đã xác nhận đổi ca. Chờ Manager duyệt." : "Đã từ chối yêu cầu đổi ca.";
        return ResponseEntity.ok(ApiResponse.success(message, swap));
    }

    @PostMapping("/swap/{swapId}/review")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @Operation(summary = "Manager approves or rejects a swap request")
    public ResponseEntity<ApiResponse<SwapRequestResponse>> reviewSwapRequest(
            @PathVariable Long swapId,
            @RequestParam boolean approve,
            @RequestParam(required = false) String note,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        SwapRequestResponse swap = marketplaceService.reviewSwapRequest(swapId, approve, note, currentUser);
        String message = approve ? "Đã duyệt yêu cầu đổi ca." : "Đã từ chối yêu cầu đổi ca.";
        return ResponseEntity.ok(ApiResponse.success(message, swap));
    }
}




