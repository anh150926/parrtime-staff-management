// file: backend/src/main/java/com/company/ptsm/service/SchedulingService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.schedule.AssignedEmployeeDto;
import com.company.ptsm.dto.schedule.AssignShiftRequest;
import com.company.ptsm.dto.schedule.RegisteredEmployeeDto;
import com.company.ptsm.dto.schedule.ScheduleViewResponse;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ScheduleStatus;
import com.company.ptsm.model.enums.ShiftType;
import com.company.ptsm.repository.*;
import com.company.ptsm.util.DateTimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleAssignmentRepository assignmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final RestaurantRepository restaurantRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<RegisteredEmployeeDto> getRegisteredEmployeesForShift(
            Integer restaurantId, LocalDate weekStartDate,
            DayOfWeekEnum dayOfWeek, ShiftType shiftType) {

        LocalDate start = DateTimeUtil.getStartOfWeek(weekStartDate);
        LocalDate end = DateTimeUtil.getEndOfWeek(weekStartDate);

        List<AvailabilitySlot> registeredSlots = availabilitySlotRepository
                .findRegisteredSlots(restaurantId, start, dayOfWeek, shiftType);

        Schedule schedule = findOrCreateSchedule(restaurantId, start);
        Set<Integer> assignedEmployeeIds = schedule.getAssignments().stream()
                .filter(a -> a.getAssignmentDate().getDayOfWeek().name().equals(dayOfWeek.name())
                        && a.getShiftType() == shiftType)
                .map(a -> a.getEmployee().getId())
                .collect(Collectors.toSet());

        List<RegisteredEmployeeDto> dtoList = new ArrayList<>();
        for (AvailabilitySlot slot : registeredSlots) {
            Employee employee = slot.getAvailability().getEmployee();

            if (assignedEmployeeIds.contains(employee.getId())) {
                continue;
            }

            long totalShiftsScheduled = assignmentRepository
                    .countAssignmentsByEmployeeInWeek(employee.getId(), start, end);

            dtoList.add(
                    RegisteredEmployeeDto.builder()
                            .employeeId(employee.getId())
                            .name(employee.getName())
                            .phoneNumber(employee.getPhoneNumber())
                            .totalShiftsScheduled(totalShiftsScheduled)
                            .build());
        }

        dtoList.sort(Comparator.comparingLong(RegisteredEmployeeDto::getTotalShiftsScheduled));
        return dtoList;
    }

    @Transactional
    public ScheduleViewResponse assignEmployeesToShift(AssignShiftRequest request) {
        LocalDate weekStart = DateTimeUtil.getStartOfWeek(request.getWeekStartDate());
        Schedule schedule = findOrCreateSchedule(request.getRestaurantId(), weekStart);

        LocalDate assignmentDate = weekStart.plusDays(
                DayOfWeekEnum.valueOf(request.getDayOfWeek().name()).ordinal());

        schedule.getAssignments().removeIf(assignment -> assignment.getAssignmentDate().equals(assignmentDate) &&
                assignment.getShiftType() == request.getShiftType());

        List<Employee> employeesToAssign = employeeRepository
                .findAllById(request.getSelectedEmployeeIds());

        if (employeesToAssign.size() != request.getSelectedEmployeeIds().size()) {
            throw new BusinessRuleException("Một số ID nhân viên không hợp lệ.");
        }

        Set<ScheduleAssignment> newAssignments = new HashSet<>();
        for (Employee emp : employeesToAssign) {
            ScheduleAssignment newAssignment = ScheduleAssignment.builder()
                    .schedule(schedule)
                    .employee(emp)
                    .assignmentDate(assignmentDate)
                    .shiftType(request.getShiftType())
                    .build();
            newAssignments.add(newAssignment);
        }

        schedule.getAssignments().addAll(newAssignments);
        scheduleRepository.save(schedule);

        return getScheduleForWeek(request.getRestaurantId(), weekStart);
    }

    @Transactional(readOnly = true)
    public ScheduleViewResponse getScheduleForWeek(Integer restaurantId, LocalDate weekStartDate) {
        LocalDate start = DateTimeUtil.getStartOfWeek(weekStartDate);
        Schedule schedule = findOrCreateSchedule(restaurantId, start);

        Map<String, List<AssignedEmployeeDto>> gridData = schedule.getAssignments().stream()
                .collect(Collectors.groupingBy(
                        assignment -> assignment.getAssignmentDate().getDayOfWeek().name() + "_"
                                + assignment.getShiftType().name(),
                        Collectors.mapping(
                                assignment -> AssignedEmployeeDto.builder()
                                        .employeeId(assignment.getEmployee().getId())
                                        .name(assignment.getEmployee().getName())
                                        .build(),
                                Collectors.toList())));

        return ScheduleViewResponse.builder()
                .scheduleId(schedule.getId())
                .restaurantId(schedule.getRestaurant().getId())
                .weekStartDate(schedule.getWeekStartDate())
                .status(schedule.getStatus())
                .shiftAssignments(gridData)
                .build();
    }

    private Schedule findOrCreateSchedule(Integer restaurantId, LocalDate weekStartDate) {
        return scheduleRepository
                .findByRestaurantIdAndWeekStartDate(restaurantId, weekStartDate)
                .orElseGet(() -> {
                    Restaurant restaurant = restaurantRepository.findById(restaurantId)
                            .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà hàng " + restaurantId));

                    return Schedule.builder()
                            .restaurant(restaurant)
                            .weekStartDate(weekStartDate)
                            .status(ScheduleStatus.DRAFT)
                            .assignments(new HashSet<>())
                            .build();
                });
    }
}