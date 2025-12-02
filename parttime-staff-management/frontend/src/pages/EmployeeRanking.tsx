import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import rankingService, { EmployeeRanking } from '../api/rankingService';
import Loading from '../components/Loading';

const EmployeeRankingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stores } = useSelector((state: RootState) => state.stores);

  const [rankings, setRankings] = useState<EmployeeRanking[]>([]);
  const [topPerformers, setTopPerformers] = useState<EmployeeRanking[]>([]);
  const [lowestPerformers, setLowestPerformers] = useState<EmployeeRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'bottom'>('all');

  useEffect(() => {
    dispatch(fetchStores());
    loadData();
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [selectedStoreId, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const [rankingsRes, topRes, bottomRes] = await Promise.all([
        rankingService.getRankings({ year, month, storeId: selectedStoreId }),
        rankingService.getTopPerformers(5, selectedStoreId),
        rankingService.getLowestPerformers(5, selectedStoreId),
      ]);

      setRankings(Array.isArray(rankingsRes.data) ? rankingsRes.data : 
                  (rankingsRes.data as any)?.data || []);
      setTopPerformers(Array.isArray(topRes.data) ? topRes.data : 
                       (topRes.data as any)?.data || []);
      setLowestPerformers(Array.isArray(bottomRes.data) ? bottomRes.data : 
                          (bottomRes.data as any)?.data || []);
    } catch (error) {
      console.error('Failed to load rankings:', error);
      setRankings([]);
      setTopPerformers([]);
      setLowestPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number, total: number) => {
    if (rank === 1) return { class: 'bg-warning text-dark', icon: '🥇' };
    if (rank === 2) return { class: 'bg-secondary', icon: '🥈' };
    if (rank === 3) return { class: 'bg-warning', icon: '🥉' };
    return { class: 'bg-light text-dark', icon: `#${rank}` };
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { class: 'bg-success', label: 'Xuất sắc' };
    if (score >= 80) return { class: 'bg-info', label: 'Tốt' };
    if (score >= 70) return { class: 'bg-primary', label: 'Khá' };
    if (score >= 60) return { class: 'bg-warning text-dark', label: 'TB' };
    return { class: 'bg-danger', label: 'Cần cải thiện' };
  };

  const displayRankings = activeTab === 'top' ? topPerformers :
                          activeTab === 'bottom' ? lowestPerformers :
                          rankings;

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-trophy me-2"></i>
            Xếp hạng nhân viên
          </h2>
          <p className="text-muted mb-0">Theo dõi hiệu suất và đánh giá nhân viên</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="row align-items-center g-3">
            <div className="col-md-3">
              <label className="form-label mb-1 small">Tháng</label>
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label mb-1 small">Cơ sở</label>
              <select
                className="form-select"
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Tất cả cơ sở</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{topPerformers[0]?.fullName || '-'}</div>
                <div className="stat-label">Chăm chỉ nhất 🏆</div>
              </div>
              <span className="stat-icon">
                {topPerformers[0]?.performanceScore?.toFixed(0) || 0}đ
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">{rankings.length}</div>
                <div className="stat-label">Tổng nhân viên</div>
              </div>
              <i className="bi bi-people stat-icon"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-value">
                  {rankings.length > 0 
                    ? (rankings.reduce((sum, r) => sum + r.performanceScore, 0) / rankings.length).toFixed(0)
                    : 0}đ
                </div>
                <div className="stat-label">Điểm TB hệ thống</div>
              </div>
              <i className="bi bi-graph-up stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <i className="bi bi-list-ol me-1"></i>
            Tất cả ({rankings.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'top' ? 'active' : ''}`}
            onClick={() => setActiveTab('top')}
          >
            <i className="bi bi-star me-1"></i>
            Chăm chỉ nhất ({topPerformers.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'bottom' ? 'active' : ''}`}
            onClick={() => setActiveTab('bottom')}
          >
            <i className="bi bi-exclamation-triangle me-1"></i>
            Cần cải thiện ({lowestPerformers.length})
          </button>
        </li>
      </ul>

      {/* Rankings Table */}
      <div className="card card-coffee">
        <div className="table-responsive">
          <table className="table table-coffee mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Hạng</th>
                <th>Nhân viên</th>
                <th>Cơ sở</th>
                <th className="text-center">Ca làm</th>
                <th className="text-center">Giờ làm</th>
                <th className="text-center">Đi làm %</th>
                <th className="text-center">Đúng giờ %</th>
                <th className="text-center">Nhiệm vụ</th>
                <th className="text-center">Điểm</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {displayRankings.map((emp) => {
                const rankBadge = getRankBadge(emp.rank, rankings.length);
                const scoreBadge = getScoreBadge(emp.performanceScore);
                return (
                  <tr key={emp.userId}>
                    <td>
                      <span className={`badge ${rankBadge.class}`}>
                        {rankBadge.icon}
                      </span>
                    </td>
                    <td>
                      <strong>{emp.fullName}</strong>
                    </td>
                    <td>{emp.storeName}</td>
                    <td className="text-center">
                      <span className="text-success">{emp.attendedShifts}</span>
                      <span className="text-muted">/{emp.totalShifts}</span>
                      {emp.missedShifts > 0 && (
                        <span className="text-danger ms-1">(-{emp.missedShifts})</span>
                      )}
                    </td>
                    <td className="text-center">{emp.totalHoursWorked}h</td>
                    <td className="text-center">
                      <span className={emp.attendanceRate >= 90 ? 'text-success' : 
                                      emp.attendanceRate >= 70 ? 'text-warning' : 'text-danger'}>
                        {emp.attendanceRate}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={emp.punctualityRate >= 90 ? 'text-success' : 
                                      emp.punctualityRate >= 70 ? 'text-warning' : 'text-danger'}>
                        {emp.punctualityRate}%
                      </span>
                      {emp.lateCheckIns > 0 && (
                        <small className="text-muted d-block">
                          (muộn: {emp.lateCheckIns})
                        </small>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="text-success">{emp.completedTasks}</span>
                      <span className="text-muted">/{emp.totalTasks}</span>
                    </td>
                    <td className="text-center">
                      <strong className={emp.performanceScore >= 80 ? 'text-success' : 
                                        emp.performanceScore >= 60 ? 'text-warning' : 'text-danger'}>
                        {emp.performanceScore}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge ${scoreBadge.class}`}>
                        {scoreBadge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {displayRankings.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p>Không có dữ liệu xếp hạng</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4">
        <small className="text-muted">
          <strong>Cách tính điểm:</strong> Điểm hiệu suất = (Tỷ lệ đi làm × 40%) + (Tỷ lệ đúng giờ × 30%) + (Tỷ lệ hoàn thành nhiệm vụ × 30%)
        </small>
      </div>
    </div>
  );
};

export default EmployeeRankingPage;



