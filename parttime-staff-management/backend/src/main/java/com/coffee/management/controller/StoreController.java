package com.coffee.management.controller;

import com.coffee.management.dto.ApiResponse;
import com.coffee.management.dto.store.CreateStoreRequest;
import com.coffee.management.dto.store.StoreResponse;
import com.coffee.management.dto.store.UpdateStoreRequest;
import com.coffee.management.security.UserPrincipal;
import com.coffee.management.service.StoreService;
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
 * REST Controller for store management endpoints
 */
@RestController
@RequestMapping("/api/v1/stores")
@Tag(name = "Stores", description = "Store management endpoints")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @GetMapping
    @Operation(summary = "Get all stores")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getAllStores() {
        List<StoreResponse> stores = storeService.getAllStores();
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store by ID")
    public ResponseEntity<ApiResponse<StoreResponse>> getStoreById(@PathVariable Long id) {
        StoreResponse store = storeService.getStoreById(id);
        return ResponseEntity.ok(ApiResponse.success(store));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Create a new store")
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(
            @Valid @RequestBody CreateStoreRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        StoreResponse store = storeService.createStore(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Store created successfully", store));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update an existing store")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStoreRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        StoreResponse store = storeService.updateStore(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Store updated successfully", store));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Delete a store")
    public ResponseEntity<ApiResponse<Void>> deleteStore(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        storeService.deleteStore(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Store deleted successfully", null));
    }
}








