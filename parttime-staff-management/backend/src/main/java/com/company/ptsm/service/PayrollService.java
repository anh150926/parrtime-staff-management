// file: backend/src/main/java/com/company/ptsm/service/PayrollService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.payroll.PayrollDetailResponse;
import com.company.ptsm.dto.payroll.PayrollRangeRequest;
import com.company.ptsm.dto.payroll.PayrollSummaryResponse;

import com.company.ptsm.model.*;
import com.company.ptsm.repository.*;
import com.company.ptsm.util.PayrollFormula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

        private final PayrollRepository payrollRepository;
        private final WorkLogRepository workLogRepository;
        private final GlobalConfigRepository configRepository;
        private final PayrollRuleRepository ruleRepository;

        @Transactional
        public List<PayrollSummaryResponse> calculateAndSaveWeeklyPayroll(PayrollRangeRequest request) {

                BigDecimal hourlyWage = new BigDecimal(
                                configRepository.findByConfigKey("HOURLY_WAGE").get().getConfigValue());
                PayrollRule rule = ruleRepository.findByRuleName("Default Rule").get();

                List<WorkLog> allLogs = workLogRepository
                                .findByShiftDateBetween(request.getStartDate(), request.getEndDate());

                Map<Employee, List<WorkLog>> logsByEmployee = allLogs.stream()
                                .collect(Collectors.groupingBy(WorkLog::getEmployee));

                payrollRepository.deleteAll(
                                payrollRepository.findByWeekStartDateAndWeekEndDate(
                                                request.getStartDate(), request.getEndDate()));

                List<Payroll> savedPayrolls = new java.util.ArrayList<>();

                for (Map.Entry<Employee, List<WorkLog>> entry : logsByEmployee.entrySet()) {
                        Employee employee = entry.getKey();
                        List<WorkLog> employeeLogs = entry.getValue();

                        BigDecimal totalBaseHours = BigDecimal.ZERO;
                        BigDecimal totalOvertimeHours = BigDecimal.ZERO;
                        Integer totalLateMinutes = 0;
                        Integer totalEarlyLeaveMinutes = 0;
                        BigDecimal totalBasePay = BigDecimal.ZERO;
                        BigDecimal totalOvertimePay = BigDecimal.ZERO;
                        BigDecimal totalPenalty = BigDecimal.ZERO;

                        for (WorkLog log : employeeLogs) {
                                totalBaseHours = totalBaseHours
                                                .add(log.getBaseHours() != null ? log.getBaseHours() : BigDecimal.ZERO);
                                totalOvertimeHours = totalOvertimeHours
                                                .add(log.getOvertimeHours() != null ? log.getOvertimeHours()
                                                                : BigDecimal.ZERO);
                                totalLateMinutes += (log.getLateMinutes() != null ? log.getLateMinutes() : 0);
                                totalEarlyLeaveMinutes += (log.getEarlyLeaveMinutes() != null
                                                ? log.getEarlyLeaveMinutes()
                                                : 0);

                                PayrollFormula formula = new PayrollFormula(log, rule, hourlyWage);
                                totalBasePay = totalBasePay.add(formula.getBasePay());
                                totalOvertimePay = totalOvertimePay.add(formula.getOvertimePay());
                                totalPenalty = totalPenalty.add(formula.getPenaltyAmount());
                        }

                        BigDecimal finalPay = totalBasePay.add(totalOvertimePay).subtract(totalPenalty);

                        Payroll payroll = Payroll.builder()
                                        .employee(employee)
                                        .weekStartDate(request.getStartDate())
                                        .weekEndDate(request.getEndDate())
                                        .totalBaseHours(totalBaseHours)
                                        .totalOvertimeHours(totalOvertimeHours)
                                        .totalLateMinutes(totalLateMinutes)
                                        .totalEarlyLeaveMinutes(totalEarlyLeaveMinutes + totalLateMinutes)
                                        .basePay(totalBasePay)
                                        .overtimePay(totalOvertimePay)
                                        .penaltyAmount(totalPenalty)
                                        .totalPay(finalPay)
                                        .status("CALCULATED")
                                        .build();

                        savedPayrolls.add(payroll);
                }

                payrollRepository.saveAll(savedPayrolls);
                return mapPayrollsToSummary(savedPayrolls);
        }

        @Transactional(readOnly = true)
        public List<PayrollSummaryResponse> getPayrollSummary(LocalDate startDate, LocalDate endDate) {
                List<Payroll> payrolls = payrollRepository
                                .findByWeekStartDateAndWeekEndDate(startDate, endDate);
                return mapPayrollsToSummary(payrolls);
        }

        @Transactional(readOnly = true)
        public List<PayrollDetailResponse> getPayrollDetail(Integer employeeId, LocalDate startDate,
                        LocalDate endDate) {
                List<WorkLog> logs = workLogRepository
                                .findByEmployeeIdAndShiftDateBetweenOrderByShiftDateAsc(employeeId, startDate, endDate);

                BigDecimal hourlyWage = new BigDecimal(
                                configRepository.findByConfigKey("HOURLY_WAGE").get().getConfigValue());
                PayrollRule rule = ruleRepository.findByRuleName("Default Rule").get();

                return logs.stream().map(log -> {
                        PayrollFormula formula = new PayrollFormula(log, rule, hourlyWage);

                        return PayrollDetailResponse.builder()
                                        .dayOfWeek(log.getShiftDate().getDayOfWeek().name())
                                        .shiftDate(log.getShiftDate())
                                        .shift(log.getShiftType())
                                        .checkIn(log.getCheckIn())
                                        .checkOut(log.getCheckOut())
                                        .baseHours(log.getBaseHours())
                                        .overtimeHours(log.getOvertimeHours())
                                        .lateAndEarlyMinutes((log.getLateMinutes() != null ? log.getLateMinutes() : 0) +
                                                        (log.getEarlyLeaveMinutes() != null ? log.getEarlyLeaveMinutes()
                                                                        : 0))
                                        .basePay(formula.getBasePay())
                                        .overtimePay(formula.getOvertimePay())
                                        .penaltyAmount(formula.getPenaltyAmount())
                                        .totalPayForShift(formula.getTotalPayForShift())
                                        .build();
                }).collect(Collectors.toList());
        }

        private List<PayrollSummaryResponse> mapPayrollsToSummary(List<Payroll> payrolls) {
                return payrolls.stream().map(p -> PayrollSummaryResponse.builder()
                                .payrollId(p.getId())
                                .employeeId(p.getEmployee().getId())
                                .employeeCode(p.getEmployee().getId().toString())
                                .employeeName(p.getEmployee().getName())
                                .phoneNumber(p.getEmployee().getPhoneNumber())
                                .totalBaseHours(p.getTotalBaseHours())
                                .totalOvertimeHours(p.getTotalOvertimeHours())
                                .totalLateAndEarlyMinutes(p.getTotalLateMinutes() + p.getTotalEarlyLeaveMinutes())
                                .basePay(p.getBasePay())
                                .overtimePay(p.getOvertimePay())
                                .totalPenalty(p.getPenaltyAmount())
                                .finalPay(p.getTotalPay())
                                .build()).collect(Collectors.toList());
        }
}