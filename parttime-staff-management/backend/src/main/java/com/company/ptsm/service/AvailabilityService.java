// file: backend/src/main/java/com/company/ptsm/service/AvailabilityService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.availability.AvailabilityRequest;
import com.company.ptsm.dto.availability.AvailabilityResponse;
import com.company.ptsm.dto.availability.AvailabilitySlotDto;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.AvailabilitySlot;
import com.company.ptsm.model.Employee;
import com.company.ptsm.model.WeeklyAvailability;
import com.company.ptsm.repository.EmployeeRepository;
import com.company.ptsm.repository.WeeklyAvailabilityRepository;
import com.company.ptsm.util.DateTimeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final WeeklyAvailabilityRepository availabilityRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Integer employeeId, LocalDate date) {
        LocalDate weekStartDate = DateTimeUtil.getStartOfWeek(date);
        WeeklyAvailability availability = availabilityRepository
                .findByEmployeeIdAndWeekStartDate(employeeId, weekStartDate)
                .orElse(null);

        if (availability == null) {
            return AvailabilityResponse.builder()
                    .employeeId(employeeId)
                    .weekStartDate(weekStartDate)
                    .status("NEW")
                    .slots(Set.of())
                    .build();
        }
        return mapEntityToResponse(availability);
    }

    @Transactional
    public AvailabilityResponse saveAvailability(AvailabilityRequest request) {
        LocalDate weekStartDate = DateTimeUtil.getStartOfWeek(request.getWeekStartDate());
        if (weekStartDate.isBefore(DateTimeUtil.getStartOfWeek(LocalDate.now()))) {
            throw new BusinessRuleException("Không thể đăng ký hoặc cập nhật cho tuần đã qua.");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(
                        () -> new NotFoundException("Không tìm thấy nhân viên với ID: " + request.getEmployeeId()));

        WeeklyAvailability availability = availabilityRepository
                .findByEmployeeIdAndWeekStartDate(employee.getId(), weekStartDate)
                .orElseGet(() -> WeeklyAvailability.builder()
                        .employee(employee)
                        .weekStartDate(weekStartDate)
                        .build());

        if (availability.getSlots() != null) {
            availability.getSlots().clear();
        }

        Set<AvailabilitySlot> newSlots = request.getSlots().stream()
                .map(slotDto -> AvailabilitySlot.builder()
                        .dayOfWeek(slotDto.getDayOfWeek())
                        .shiftType(slotDto.getShiftType())
                        .availability(availability)
                        .build())
                .collect(Collectors.toSet());

        availability.setSlots(newSlots);
        availability.setStatus("SUBMITTED");

        WeeklyAvailability savedAvailability = availabilityRepository.save(availability);
        return mapEntityToResponse(savedAvailability);
    }

    private AvailabilityResponse mapEntityToResponse(WeeklyAvailability entity) {
        Set<AvailabilitySlotDto> slotDtos = entity.getSlots().stream()
                .map(slot -> {
                    AvailabilitySlotDto dto = new AvailabilitySlotDto();
                    dto.setDayOfWeek(slot.getDayOfWeek());
                    dto.setShiftType(slot.getShiftType());
                    return dto;
                }).collect(Collectors.toSet());

        return AvailabilityResponse.builder()
                .availabilityId(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .weekStartDate(entity.getWeekStartDate())
                .status(entity.getStatus())
                .slots(slotDtos)
                .build();
    }
}