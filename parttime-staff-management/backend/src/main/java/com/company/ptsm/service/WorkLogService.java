// file: backend/src/main/java/com/company/ptsm/service/WorkLogService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.worklog.CheckInRequest;
import com.company.ptsm.dto.worklog.WorkLogResponse;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.repository.*;
import com.company.ptsm.util.PayrollFormula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class WorkLogService {

        private final WorkLogRepository workLogRepository;
        private final EmployeeRepository employeeRepository;
        private final GlobalConfigRepository configRepository;
        private final PayrollRuleRepository ruleRepository;

        @Transactional
        public WorkLogResponse checkIn(CheckInRequest request) {
                Employee employee = employeeRepository.findById(request.getEmployeeId())
                                .orElseThrow(() -> new NotFoundException(
                                                "Không tìm thấy nhân viên: " + request.getEmployeeId()));

                WorkLog newLog = WorkLog.builder()
                                .employee(employee)
                                .shiftDate(request.getShiftDate())
                                .shiftType(request.getShiftType())
                                .checkIn(OffsetDateTime.now())
                                .build();

                WorkLog savedLog = workLogRepository.save(newLog);
                return mapEntityToResponse(savedLog);
        }

        @Transactional
        public WorkLogResponse checkOut(Integer workLogId) {
                WorkLog log = workLogRepository.findById(workLogId)
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy WorkLog: " + workLogId));

                if (log.getCheckOut() != null) {
                        throw new BusinessRuleException("Đã check-out ca này rồi.");
                }

                log.setCheckOut(OffsetDateTime.now());

                PayrollRule rule = ruleRepository.findByRuleName("Default Rule")
                                .orElseThrow(() -> new NotFoundException(
                                                "Không tìm thấy Luật tính lương 'Default Rule'"));

                GlobalConfig configWage = configRepository.findByConfigKey("HOURLY_WAGE")
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy cấu hình 'HOURLY_WAGE'"));
                BigDecimal hourlyWage = new BigDecimal(configWage.getConfigValue());

                PayrollFormula formula = new PayrollFormula(log, rule, hourlyWage);

                log.setActualHours(formula.getActualHours());
                log.setBaseHours(formula.getBaseHours());
                log.setOvertimeHours(formula.getOvertimeHours());
                log.setLateMinutes(formula.getLateMinutes());
                log.setEarlyLeaveMinutes(formula.getEarlyLeaveMinutes());

                WorkLog savedLog = workLogRepository.save(log);
                return mapEntityToResponse(savedLog);
        }

        private WorkLogResponse mapEntityToResponse(WorkLog log) {
                return WorkLogResponse.builder()
                                .workLogId(log.getId())
                                .employeeId(log.getEmployee().getId())
                                .employeeName(log.getEmployee().getName())
                                .checkIn(log.getCheckIn())
                                .checkOut(log.getCheckOut())
                                .shiftDate(log.getShiftDate())
                                .shiftType(log.getShiftType())
                                .actualHours(log.getActualHours())
                                .baseHours(log.getBaseHours())
                                .overtimeHours(log.getOvertimeHours())
                                .lateMinutes(log.getLateMinutes())
                                .earlyLeaveMinutes(log.getEarlyLeaveMinutes())
                                .build();
        }
}