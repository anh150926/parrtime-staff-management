/*
 * file: backend/src/main/java/com/company/ptsm/service/ScheduleService.java
 *
 * [CẢI TIẾN]
 * Service chính xử lý nghiệp vụ Lịch làm việc (Scheduling).
 * Thay thế SchedulingService và AvailabilityService cũ.
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.schedule.*;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.RequestStatus;
import com.company.ptsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

        // Repositories
        private final ScheduleRepository scheduleRepository;
        private final ScheduleAssignmentRepository assignmentRepository;
        private final ShiftTemplateRepository shiftTemplateRepository;
        private final UserRepository userRepository;

        // --- VAI TRÒ 2 (Manager): Quản lý Mẫu Ca (VAI TRÒ 2, Mục 2) ---

        @Transactional
        public ShiftTemplateDto createShiftTemplate(ShiftTemplateDto dto, User manager) {
                Branch branch = manager.getBranch();
                if (branch == null) {
                        throw new BusinessRuleException("Tài khoản Quản lý phải thuộc 1 Cơ sở.");
                }

                ShiftTemplate template = ShiftTemplate.builder()
                                .branch(branch)
                                .name(dto.getName())
                                .startTime(dto.getStartTime())
                                .endTime(dto.getEndTime())
                                .build();

                ShiftTemplate savedTemplate = shiftTemplateRepository.save(template);
                return mapToShiftTemplateDto(savedTemplate);
        }

        @Transactional(readOnly = true)
        public List<ShiftTemplateDto> getShiftTemplatesForBranch(User manager) {
                List<ShiftTemplate> templates = shiftTemplateRepository.findByBranchId(manager.getBranch().getId());
                return templates.stream()
                                .map(this::mapToShiftTemplateDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deleteShiftTemplate(Integer templateId, User manager) {
                ShiftTemplate template = shiftTemplateRepository.findById(templateId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy Mẫu ca."));

                // (Bảo mật) Đảm bảo Manager chỉ xóa Mẫu ca của cơ sở mình
                if (!template.getBranch().getId().equals(manager.getBranch().getId())) {
                        throw new BusinessRuleException("Không có quyền xóa Mẫu ca của cơ sở khác.");
                }

                // (Check logic) Có thể kiểm tra xem Mẫu ca này đã được gán vào Schedule nào
                // chưa

                shiftTemplateRepository.delete(template);
        }

        // --- VAI TRÒ 2 (Manager): Tạo Lịch Trống (VAI TRÒ 2, Mục 2) ---

        @Transactional
        public ScheduleViewDto createSchedule(ScheduleCreateRequest request, User manager) {
                Branch branch = manager.getBranch();

                ShiftTemplate template = shiftTemplateRepository.findById(request.getShiftTemplateId())
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy Mẫu ca."));

                if (!template.getBranch().getId().equals(branch.getId())) {
                        throw new BusinessRuleException("Không thể tạo lịch từ Mẫu ca của cơ sở khác.");
                }

                Schedule schedule = Schedule.builder()
                                .branch(branch)
                                .shiftTemplate(template)
                                .scheduleDate(request.getScheduleDate())
                                .requiredStaff(request.getRequiredStaff())
                                .build();

                Schedule savedSchedule = scheduleRepository.save(schedule);
                return mapToScheduleViewDto(savedSchedule);
        }

        // --- VAI TRÒ 2 & 3: Xem Lịch Tổng (Calendar View) (VAI TRÒ 2, Mục 2) ---

        @Transactional(readOnly = true)
        public List<ScheduleViewDto> getScheduleForWeek(User user, LocalDate weekStartDate) {
                Branch userBranch = user.getBranch();
                if (userBranch == null) {
                        throw new BusinessRuleException("Tài khoản không thuộc cơ sở nào.");
                }

                LocalDate weekEndDate = weekStartDate.plusDays(6); // Lấy cả tuần

                List<Schedule> schedules = scheduleRepository
                                .findByBranchIdAndScheduleDateBetweenOrderByScheduleDateAsc(userBranch.getId(),
                                                weekStartDate, weekEndDate);

                return schedules.stream()
                                .map(this::mapToScheduleViewDto)
                                .collect(Collectors.toList());
        }

        // --- VAI TRÒ 3 (Staff): Đăng ký Ca (VAI TRÒ 3, Mục 2) ---

        @Transactional
        public ScheduleAssignmentDto staffRegisterForShift(Integer scheduleId, User staff) {
                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca làm này."));

                if (!schedule.getBranch().getId().equals(staff.getBranch().getId())) {
                        throw new BusinessRuleException("Bạn không thể đăng ký ca ở cơ sở khác.");
                }

                // Đếm số người đã được CONFIRMED (đã duyệt)
                long confirmedAssignments = schedule.getAssignments().stream()
                                .filter(sa -> "CONFIRMED".equals(sa.getStatus()))
                                .count();

                if (confirmedAssignments >= schedule.getRequiredStaff()) {
                        throw new BusinessRuleException("Ca này đã đủ người.");
                }

                boolean alreadyRegistered = schedule.getAssignments().stream()
                                .anyMatch(sa -> sa.getUser().getId().equals(staff.getId()));
                if (alreadyRegistered) {
                        throw new BusinessRuleException("Bạn đã đăng ký ca này rồi.");
                }

                ScheduleAssignment assignment = ScheduleAssignment.builder()
                                .schedule(schedule)
                                .user(staff)
                                .status(RequestStatus.PENDING.name()) // Chờ Manager duyệt
                                .build();

                ScheduleAssignment savedAssignment = assignmentRepository.save(assignment);
                return mapToScheduleAssignmentDto(savedAssignment);
        }

        /**
         * VAI TRÒ 2 (Manager): Tự gán nhân viên vào ca (Xếp lịch thủ công)
         */
        @Transactional
        public ScheduleAssignmentDto managerAssignStaffToShift(Integer scheduleId, Integer staffId, User manager) {
                Schedule schedule = scheduleRepository.findById(scheduleId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca làm này."));

                User staff = userRepository.findById(staffId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân viên này."));

                // (Bảo mật & Logic) Đảm bảo Manager và Staff cùng 1 cơ sở
                if (!manager.getBranch().getId().equals(staff.getBranch().getId()) ||
                                !manager.getBranch().getId().equals(schedule.getBranch().getId())) {
                        throw new BusinessRuleException("Chỉ có thể gán nhân viên trong cùng cơ sở.");
                }

                // (Tương tự logic staffRegisterForShift, kiểm tra ca đầy, ca trùng...)

                ScheduleAssignment assignment = ScheduleAssignment.builder()
                                .schedule(schedule)
                                .user(staff)
                                .status(RequestStatus.APPROVED.name()) // Manager gán = tự động duyệt
                                .build();

                ScheduleAssignment savedAssignment = assignmentRepository.save(assignment);
                return mapToScheduleAssignmentDto(savedAssignment);
        }

        // --- Hàm tiện ích (Helpers) ---

        // (Các hàm mapTo...Dto được dùng chung bởi nhiều service khác)

        public ScheduleViewDto mapToScheduleViewDto(Schedule schedule) {
                List<AssignedStaffDto> assignedStaffList = schedule.getAssignments().stream()
                                .map(assignment -> AssignedStaffDto.builder()
                                                .userId(assignment.getUser().getId())
                                                .fullName(assignment.getUser().getStaffProfile() != null
                                                                ? assignment.getUser().getStaffProfile().getFullName()
                                                                : "N/A")
                                                .status(assignment.getStatus())
                                                .build())
                                .collect(Collectors.toList());

                return ScheduleViewDto.builder()
                                .scheduleId(schedule.getId())
                                .shiftName(schedule.getShiftTemplate().getName())
                                .shiftDate(schedule.getScheduleDate())
                                .startTime(schedule.getShiftTemplate().getStartTime())
                                .endTime(schedule.getShiftTemplate().getEndTime())
                                .requiredStaff(schedule.getRequiredStaff())
                                .assignedStaffCount(assignedStaffList.size())
                                .assignedStaff(assignedStaffList)
                                .build();
        }

        public ScheduleAssignmentDto mapToScheduleAssignmentDto(ScheduleAssignment entity) {
                return ScheduleAssignmentDto.builder()
                                .assignmentId(entity.getId())
                                .status(entity.getStatus())
                                .userId(entity.getUser().getId())
                                .staffName(entity.getUser().getStaffProfile() != null
                                                ? entity.getUser().getStaffProfile().getFullName()
                                                : "N/A")
                                .scheduleId(entity.getSchedule().getId())
                                .shiftName(entity.getSchedule().getShiftTemplate().getName())
                                .shiftDate(entity.getSchedule().getScheduleDate())
                                .startTime(entity.getSchedule().getShiftTemplate().getStartTime())
                                .endTime(entity.getSchedule().getShiftTemplate().getEndTime())
                                .build();
        }

        private ShiftTemplateDto mapToShiftTemplateDto(ShiftTemplate template) {
                ShiftTemplateDto dto = new ShiftTemplateDto();
                dto.setId(template.getId());
                dto.setName(template.getName());
                dto.setStartTime(template.getStartTime());
                dto.setEndTime(template.getEndTime());
                return dto;
        }
}