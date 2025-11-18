/*
 * file: backend/src/main/java/com/company/ptsm/service/RequestService.java
 *
 * [MỚI]
 * Service này xử lý tất cả các nghiệp vụ "Yêu cầu & Phê duyệt".
 * (Xin nghỉ, Đăng ký ca, Chợ Ca, Báo bận).
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.common.ApprovalDto;
import com.company.ptsm.dto.schedule.LeaveRequestDto;
import com.company.ptsm.dto.schedule.ScheduleAssignmentDto;
import com.company.ptsm.dto.schedule.ShiftMarketDto;
import com.company.ptsm.dto.schedule.StaffAvailabilityDto;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.RequestStatus;
import com.company.ptsm.repository.LeaveRequestRepository;
import com.company.ptsm.repository.ScheduleAssignmentRepository;
import com.company.ptsm.repository.ShiftMarketRepository;
import com.company.ptsm.repository.StaffAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final ScheduleAssignmentRepository assignmentRepository;
    private final ShiftMarketRepository shiftMarketRepository;
    private final StaffAvailabilityRepository staffAvailabilityRepository;

    // Tiêm các service khác để dùng hàm Map DTO
    private final ScheduleService scheduleService;

    // --- Logic cho Đơn Xin Nghỉ (Leave Request) ---

    @Transactional
    public LeaveRequestDto createLeaveRequest(LeaveRequestDto dto, User staff) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BusinessRuleException("Ngày kết thúc không thể trước ngày bắt đầu.");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .user(staff)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status(RequestStatus.PENDING.name())
                .build();

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return mapToLeaveRequestDto(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> getPendingLeaveRequests(User manager) {
        Integer branchId = manager.getBranch().getId();
        List<LeaveRequest> requests = leaveRequestRepository.findPendingRequestsByBranch(branchId);

        return requests.stream()
                .map(this::mapToLeaveRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDto approveOrRejectLeave(Integer leaveId, ApprovalDto dto, User manager) {
        LeaveRequest request = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn xin nghỉ."));

        if (!request.getUser().getBranch().getId().equals(manager.getBranch().getId())) {
            throw new BusinessRuleException("Không có quyền duyệt đơn của cơ sở khác.");
        }

        if (dto.isApproved()) {
            request.setStatus(RequestStatus.APPROVED.name());
            request.setApprovedAt(OffsetDateTime.now());
            request.setManager(manager);
        } else {
            request.setStatus(RequestStatus.REJECTED.name());
            request.setManager(manager);
        }

        LeaveRequest savedRequest = leaveRequestRepository.save(request);
        return mapToLeaveRequestDto(savedRequest);
    }

    // --- Logic cho Đăng Ký Ca (Schedule Registration) ---

    @Transactional(readOnly = true)
    public List<ScheduleAssignmentDto> getPendingRegistrations(User manager) {
        Integer branchId = manager.getBranch().getId();
        List<ScheduleAssignment> assignments = assignmentRepository.findPendingAssignmentsByBranch(branchId);

        return assignments.stream()
                .map(scheduleService::mapToScheduleAssignmentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleAssignmentDto approveOrRejectRegistration(Integer assignmentId, ApprovalDto dto, User manager) {
        ScheduleAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lượt đăng ký ca."));

        if (!assignment.getSchedule().getBranch().getId().equals(manager.getBranch().getId())) {
            throw new BusinessRuleException("Không có quyền duyệt ca của cơ sở khác.");
        }

        if (dto.isApproved()) {
            assignment.setStatus(RequestStatus.APPROVED.name()); // "APPROVED" (Đã duyệt)
        } else {
            // Nếu từ chối, xóa luôn để NV có thể đăng ký ca khác
            assignmentRepository.delete(assignment);
            return scheduleService.mapToScheduleAssignmentDto(assignment);
        }

        ScheduleAssignment savedAssignment = assignmentRepository.save(assignment);
        return scheduleService.mapToScheduleAssignmentDto(savedAssignment);
    }

    // --- Logic cho Chợ Ca (Shift Market) ---

    @Transactional
    public ShiftMarketDto postShiftToMarket(Integer assignmentId, User staff) {
        ScheduleAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca làm này."));

        if (!assignment.getUser().getId().equals(staff.getId())) {
            throw new BusinessRuleException("Bạn không thể bán ca của người khác.");
        }
        if (assignment.getShiftMarket() != null) {
            throw new BusinessRuleException("Ca này đã được đăng bán.");
        }
        if (!RequestStatus.APPROVED.name().equals(assignment.getStatus())) {
            throw new BusinessRuleException("Chỉ có thể bán ca đã được Quản lý xác nhận.");
        }

        ShiftMarket marketEntry = ShiftMarket.builder()
                .assignment(assignment)
                .offeringUser(staff)
                .status("POSTED")
                .build();

        ShiftMarket savedEntry = shiftMarketRepository.save(marketEntry);
        return mapToShiftMarketDto(savedEntry);
    }

    @Transactional
    public ShiftMarketDto claimShiftFromMarket(Integer marketId, User claimingStaff) {
        ShiftMarket marketEntry = shiftMarketRepository.findById(marketId)
                .orElseThrow(() -> new NotFoundException("Ca đăng bán này không còn."));

        if (!"POSTED".equals(marketEntry.getStatus())) {
            throw new BusinessRuleException("Ca này đã có người nhận hoặc đã bị hủy.");
        }
        if (marketEntry.getOfferingUser().getId().equals(claimingStaff.getId())) {
            throw new BusinessRuleException("Bạn không thể tự nhận ca của chính mình.");
        }
        if (!marketEntry.getOfferingUser().getBranch().getId().equals(claimingStaff.getBranch().getId())) {
            throw new BusinessRuleException("Bạn chỉ có thể nhận ca trong cơ sở của mình.");
        }

        marketEntry.setClaimingUser(claimingStaff);
        marketEntry.setStatus("CLAIMED"); // Trạng thái: Chờ Manager duyệt

        ShiftMarket savedEntry = shiftMarketRepository.save(marketEntry);
        return mapToShiftMarketDto(savedEntry);
    }

    @Transactional
    public ShiftMarketDto approveOrRejectShiftMarket(Integer marketId, ApprovalDto dto, User manager) {
        ShiftMarket marketEntry = shiftMarketRepository.findById(marketId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu đổi ca."));

        if (!marketEntry.getOfferingUser().getBranch().getId().equals(manager.getBranch().getId())) {
            throw new BusinessRuleException("Không có quyền duyệt yêu cầu của cơ sở khác.");
        }
        if (!"CLAIMED".equals(marketEntry.getStatus())) {
            throw new BusinessRuleException("Yêu cầu này đã được xử lý hoặc bị hủy.");
        }

        if (dto.isApproved()) {
            // [LOGIC QUAN TRỌNG] Đổi người làm trong ca gốc
            ScheduleAssignment assignment = marketEntry.getAssignment();
            assignment.setUser(marketEntry.getClaimingUser()); // Đổi NV A -> NV B
            assignmentRepository.save(assignment);

            marketEntry.setStatus(RequestStatus.APPROVED.name());
            marketEntry.setManager(manager);
        } else {
            // Nếu Manager từ chối, trả ca về lại trạng thái "Đang bán"
            marketEntry.setStatus("POSTED");
            marketEntry.setClaimingUser(null); // Xóa người nhận
        }

        ShiftMarket savedEntry = shiftMarketRepository.save(marketEntry);
        return mapToShiftMarketDto(savedEntry);
    }

    @Transactional(readOnly = true)
    public List<ShiftMarketDto> getAvailableMarketShifts(User staff) {
        List<ShiftMarket> entries = shiftMarketRepository
                .findPostedShiftsByBranch(staff.getBranch().getId());
        return entries.stream()
                .map(this::mapToShiftMarketDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftMarketDto> getPendingMarketRequests(User manager) {
        List<ShiftMarket> entries = shiftMarketRepository
                .findClaimedShiftsByBranch(manager.getBranch().getId());
        return entries.stream()
                .map(this::mapToShiftMarketDto)
                .collect(Collectors.toList());
    }

    // --- Logic cho Đăng ký Bất khả dụng (Báo bận) ---

    @Transactional
    public StaffAvailabilityDto createUnavailability(StaffAvailabilityDto dto, User staff) {
        if (dto.getEndTime().isBefore(dto.getStartTime())) {
            throw new BusinessRuleException("Giờ kết thúc không thể trước giờ bắt đầu.");
        }

        StaffAvailability availability = StaffAvailability.builder()
                .user(staff)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .reason(dto.getReason())
                .build();

        StaffAvailability saved = staffAvailabilityRepository.save(availability);
        return mapToStaffAvailabilityDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffAvailabilityDto> getMyUnavailabilities(User staff) {
        return staffAvailabilityRepository.findByUserId(staff.getId()).stream()
                .map(this::mapToStaffAvailabilityDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUnavailability(Integer availabilityId, User staff) {
        StaffAvailability availability = staffAvailabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch bận."));

        if (!availability.getUser().getId().equals(staff.getId())) {
            throw new BusinessRuleException("Không có quyền xóa lịch bận của người khác.");
        }

        staffAvailabilityRepository.delete(availability);
    }

    // --- Hàm tiện ích (Helpers) ---

    private LeaveRequestDto mapToLeaveRequestDto(LeaveRequest entity) {
        return LeaveRequestDto.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .staffName(entity.getUser().getStaffProfile() != null ? entity.getUser().getStaffProfile().getFullName()
                        : "N/A")
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .build();
    }

    public ShiftMarketDto mapToShiftMarketDto(ShiftMarket entity) {
        ScheduleAssignment assignment = entity.getAssignment();
        Schedule schedule = assignment.getSchedule();
        ShiftTemplate template = schedule.getShiftTemplate();
        User offeringUser = entity.getOfferingUser();
        User claimingUser = entity.getClaimingUser();

        return ShiftMarketDto.builder()
                .marketId(entity.getId())
                .assignmentId(assignment.getId())
                .shiftName(template.getName())
                .shiftDate(schedule.getScheduleDate())
                .startTime(template.getStartTime())
                .endTime(template.getEndTime())
                .offeringUserId(offeringUser.getId())
                .offeringUserName(
                        offeringUser.getStaffProfile() != null ? offeringUser.getStaffProfile().getFullName() : "N/A")
                .claimingUserId(claimingUser != null ? claimingUser.getId() : null)
                .claimingUserName(
                        claimingUser != null
                                ? (claimingUser.getStaffProfile() != null ? claimingUser.getStaffProfile().getFullName()
                                        : "N/A")
                                : null)
                .status(entity.getStatus())
                .build();
    }

    private StaffAvailabilityDto mapToStaffAvailabilityDto(StaffAvailability entity) {
        StaffAvailabilityDto dto = new StaffAvailabilityDto();
        dto.setId(entity.getId());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setReason(entity.getReason());
        return dto;
    }
}