package com.coffee.management.repository;

import com.coffee.management.entity.Task;
import com.coffee.management.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find tasks by store
     */
    List<Task> findByStoreIdOrderByDueDateAsc(Long storeId);

    /**
     * Find tasks by shift
     */
    List<Task> findByShiftIdOrderByPriorityDescDueDateAsc(Long shiftId);

    /**
     * Find tasks assigned to a user
     */
    List<Task> findByAssignedToIdOrderByDueDateAsc(Long userId);

    /**
     * Find pending/in-progress tasks for a user
     */
    @Query("SELECT t FROM Task t " +
           "WHERE t.assignedTo.id = :userId " +
           "AND t.status IN ('PENDING', 'IN_PROGRESS') " +
           "ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findActiveTasksForUser(@Param("userId") Long userId);

    /**
     * Find pending/in-progress tasks for a user or unassigned tasks in their store
     */
    @Query("SELECT t FROM Task t " +
           "WHERE (t.assignedTo.id = :userId OR (t.assignedTo IS NULL AND t.store.id = :storeId)) " +
           "AND t.status IN ('PENDING', 'IN_PROGRESS') " +
           "ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findActiveTasksForUserOrStore(@Param("userId") Long userId, @Param("storeId") Long storeId);

    /**
     * Find all tasks (including completed) for a user or their store
     */
    @Query("SELECT t FROM Task t " +
           "WHERE (t.assignedTo.id = :userId OR (t.assignedTo IS NULL AND t.store.id = :storeId) OR (t.completedBy.id = :userId)) " +
           "AND t.status != 'CANCELLED' " +
           "ORDER BY t.status ASC, t.priority DESC, t.dueDate ASC")
    List<Task> findAllTasksForUserOrStore(@Param("userId") Long userId, @Param("storeId") Long storeId);

    /**
     * Find tasks by store and status
     */
    List<Task> findByStoreIdAndStatusOrderByDueDateAsc(Long storeId, TaskStatus status);

    /**
     * Find tasks due today for a store
     */
    @Query("SELECT t FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "AND t.status IN ('PENDING', 'IN_PROGRESS') " +
           "AND DATE(t.dueDate) = DATE(:date) " +
           "ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksDueToday(@Param("storeId") Long storeId, @Param("date") LocalDateTime date);

    /**
     * Find overdue tasks for a store
     */
    @Query("SELECT t FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "AND t.status IN ('PENDING', 'IN_PROGRESS') " +
           "AND t.dueDate < :now " +
           "ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks(@Param("storeId") Long storeId, @Param("now") LocalDateTime now);

    /**
     * Count tasks by status for a store
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "GROUP BY t.status")
    List<Object[]> countByStatusForStore(@Param("storeId") Long storeId);

    /**
     * Find tasks created by a user
     */
    List<Task> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find tasks assigned to a user within date range
     */
    @Query("SELECT t FROM Task t " +
           "WHERE t.assignedTo.id = :userId " +
           "AND t.createdAt >= :startDate " +
           "AND t.createdAt <= :endDate")
    List<Task> findByAssignedToIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Count tasks by store and date range
     */
    @Query("SELECT COUNT(t) FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "AND t.createdAt >= :startDate " +
           "AND t.createdAt <= :endDate")
    long countByStoreAndDateRange(@Param("storeId") Long storeId, 
                                  @Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);

    /**
     * Count completed tasks by store and date range
     */
    @Query("SELECT COUNT(t) FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "AND t.status = 'COMPLETED' " +
           "AND t.completedAt >= :startDate " +
           "AND t.completedAt <= :endDate")
    long countCompletedByStoreAndDateRange(@Param("storeId") Long storeId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Count overdue tasks by store and date range (not completed and due date passed)
     */
    @Query("SELECT COUNT(t) FROM Task t " +
           "WHERE t.store.id = :storeId " +
           "AND t.status != 'COMPLETED' " +
           "AND t.dueDate < :now " +
           "AND t.createdAt >= :startDate " +
           "AND t.createdAt <= :endDate")
    long countOverdueByStoreAndDateRange(@Param("storeId") Long storeId, 
                                         @Param("now") LocalDateTime now,
                                         @Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
}


