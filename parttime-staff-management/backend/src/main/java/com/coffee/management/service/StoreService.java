package com.coffee.management.service;

import com.coffee.management.dto.store.CreateStoreRequest;
import com.coffee.management.dto.store.StoreResponse;
import com.coffee.management.dto.store.UpdateStoreRequest;
import com.coffee.management.entity.Role;
import com.coffee.management.entity.Store;
import com.coffee.management.entity.User;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.StoreRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for store management operations
 */
@Service
@Transactional
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    /**
     * Get all stores
     */
    public List<StoreResponse> getAllStores() {
        return storeRepository.findAllWithManager().stream()
                .map(StoreResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get store by ID
     */
    public StoreResponse getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));
        return StoreResponse.fromEntity(store);
    }

    /**
     * Create a new store (Owner only)
     */
    public StoreResponse createStore(CreateStoreRequest request, UserPrincipal currentUser) {
        if (storeRepository.existsByName(request.getName())) {
            throw new BadRequestException("Store name already exists");
        }

        Store store = Store.builder()
                .name(request.getName())
                .address(request.getAddress())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .build();

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            
            if (manager.getRole() != Role.MANAGER) {
                throw new BadRequestException("Selected user is not a manager");
            }
            store.setManager(manager);
        }

        Store savedStore = storeRepository.save(store);
        
        auditService.log(currentUser.getId(), "CREATE", "STORE", savedStore.getId(), 
                "Created store: " + savedStore.getName());

        return StoreResponse.fromEntity(savedStore);
    }

    /**
     * Update an existing store (Owner only)
     */
    public StoreResponse updateStore(Long id, UpdateStoreRequest request, UserPrincipal currentUser) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        if (request.getName() != null && !request.getName().equals(store.getName())) {
            if (storeRepository.existsByName(request.getName())) {
                throw new BadRequestException("Store name already exists");
            }
            store.setName(request.getName());
        }
        if (request.getAddress() != null) {
            store.setAddress(request.getAddress());
        }
        if (request.getOpeningTime() != null) {
            store.setOpeningTime(request.getOpeningTime());
        }
        if (request.getClosingTime() != null) {
            store.setClosingTime(request.getClosingTime());
        }
        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getManagerId()));
            
            if (manager.getRole() != Role.MANAGER) {
                throw new BadRequestException("Selected user is not a manager");
            }
            store.setManager(manager);
        }

        Store updatedStore = storeRepository.save(store);
        
        auditService.log(currentUser.getId(), "UPDATE", "STORE", updatedStore.getId(), 
                "Updated store: " + updatedStore.getName());

        return StoreResponse.fromEntity(updatedStore);
    }

    /**
     * Delete a store (Owner only)
     */
    public void deleteStore(Long id, UserPrincipal currentUser) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        // Check if store has staff
        long staffCount = userRepository.countStaffByStore(id);
        if (staffCount > 0) {
            throw new BadRequestException("Cannot delete store with assigned staff. Please reassign or remove staff first.");
        }

        storeRepository.delete(store);
        
        auditService.log(currentUser.getId(), "DELETE", "STORE", id, 
                "Deleted store: " + store.getName());
    }
}








