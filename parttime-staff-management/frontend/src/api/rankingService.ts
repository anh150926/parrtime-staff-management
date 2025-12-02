import api from './axios';

export interface EmployeeRanking {
  userId: number;
  fullName: string;
  storeName: string;
  storeId: number;
  
  // Working statistics
  totalShifts: number;
  totalHoursWorked: number;
  attendedShifts: number;
  missedShifts: number;
  attendanceRate: number;
  
  // Performance metrics
  completedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  
  // Punctuality
  lateCheckIns: number;
  earlyCheckOuts: number;
  punctualityRate: number;
  
  // Overall
  performanceScore: number;
  rank: number;
  rankLabel: string;
}

const rankingService = {
  // Get all rankings
  getRankings: (params?: { year?: number; month?: number; storeId?: number }) =>
    api.get<EmployeeRanking[]>('/rankings', { params }),

  // Get top performers
  getTopPerformers: (limit: number = 10, storeId?: number) =>
    api.get<EmployeeRanking[]>('/rankings/top', { params: { limit, storeId } }),

  // Get lowest performers
  getLowestPerformers: (limit: number = 10, storeId?: number) =>
    api.get<EmployeeRanking[]>('/rankings/bottom', { params: { limit, storeId } }),
};

export default rankingService;



