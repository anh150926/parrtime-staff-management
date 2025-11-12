// file: backend/src/main/java/com/company/ptsm/service/StatsService.java
package com.company.ptsm.service;

import com.company.ptsm.dto.stats.BestEmployeeResponse;
import com.company.ptsm.dto.stats.StatsRequest;
import com.company.ptsm.model.Employee;
import com.company.ptsm.model.PayrollRule;
import com.company.ptsm.model.WorkLog;
import com.company.ptsm.repository.GlobalConfigRepository;
import com.company.ptsm.repository.PayrollRuleRepository;
import com.company.ptsm.repository.WorkLogRepository;
import com.company.ptsm.util.PayrollFormula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final WorkLogRepository workLogRepository;
    private final GlobalConfigRepository configRepository;
    private final PayrollRuleRepository ruleRepository;

    @Transactional(readOnly = true)
    public List<BestEmployeeResponse> getBestEmployees(StatsRequest request) {

        BigDecimal hourlyWage = new BigDecimal(
                configRepository.findByConfigKey("HOURLY_WAGE").get().getConfigValue());
        PayrollRule rule = ruleRepository.findByRuleName("Default Rule").get();

        List<WorkLog> allLogs = workLogRepository
                .findByShiftDateBetween(request.getStartDate(), request.getEndDate());

        Map<Employee, List<WorkLog>> logsByEmployee = allLogs.stream()
                .collect(Collectors.groupingBy(WorkLog::getEmployee));

        List<BestEmployeeResponse> employeeStatsList = new ArrayList<>();

        for (Map.Entry<Employee, List<WorkLog>> entry : logsByEmployee.entrySet()) {
            Employee employee = entry.getKey();
            List<WorkLog> employeeLogs = entry.getValue();

            BigDecimal totalActualHours = BigDecimal.ZERO;
            BigDecimal totalPay = BigDecimal.ZERO;
            Integer totalLateAndEarlyMinutes = 0;
            BigDecimal totalPenalty = BigDecimal.ZERO;

            for (WorkLog log : employeeLogs) {
                totalActualHours = totalActualHours.add(
                        log.getActualHours() != null ? log.getActualHours() : BigDecimal.ZERO);

                totalLateAndEarlyMinutes += ((log.getLateMinutes() != null ? log.getLateMinutes() : 0) +
                        (log.getEarlyLeaveMinutes() != null ? log.getEarlyLeaveMinutes() : 0));

                PayrollFormula formula = new PayrollFormula(log, rule, hourlyWage);
                totalPay = totalPay.add(formula.getTotalPayForShift());
                totalPenalty = totalPenalty.add(formula.getPenaltyAmount());
            }

            BestEmployeeResponse stats = BestEmployeeResponse.builder()
                    .employeeId(employee.getId())
                    .employeeCode(employee.getId().toString())
                    .employeeName(employee.getName())
                    .phoneNumber(employee.getPhoneNumber())
                    .totalActualHours(totalActualHours)
                    .totalPay(totalPay)
                    .totalLateAndEarlyMinutes(totalLateAndEarlyMinutes)
                    .totalPenalty(totalPenalty)
                    .build();

            employeeStatsList.add(stats);
        }

        employeeStatsList.sort(Comparator.comparingInt(BestEmployeeResponse::getTotalLateAndEarlyMinutes));

        return employeeStatsList;
    }
}