import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import rankingService, { EmployeeRanking } from '../api/rankingService';
import Loading from '../components/Loading';

// Podium styles
const podiumStyles = `
  .podium-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 16px;
    padding: 20px;
    margin-bottom: 30px;
  }

  .podium-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    padding: 24px 20px;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }

  .podium-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }

  .podium-card.gold {
    border-top: 4px solid #FFD700;
    order: 2;
    min-width: 220px;
    padding-top: 30px;
  }

  .podium-card.silver {
    border-top: 4px solid #C0C0C0;
    order: 1;
    min-width: 180px;
  }

  .podium-card.bronze {
    border-top: 4px solid #CD7F32;
    order: 3;
    min-width: 180px;
  }

  .podium-rank {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }

  .podium-rank.gold {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(255,215,0,0.4);
  }

  .podium-rank.silver {
    background: linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 100%);
    color: #555;
    box-shadow: 0 4px 15px rgba(192,192,192,0.4);
  }

  .podium-rank.bronze {
    background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
    color: #fff;
    box-shadow: 0 4px 15px rgba(205,127,50,0.4);
  }

  .podium-crown {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 28px;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-5px); }
  }

  .podium-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin: 0 auto 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    position: relative;
  }

  .podium-card.gold .podium-avatar {
    width: 100px;
    height: 100px;
    font-size: 40px;
    border: 4px solid #FFD700;
    background: linear-gradient(135deg, #FFF9E6 0%, #FFF3CD 100%);
    box-shadow: 0 0 20px rgba(255,215,0,0.3);
  }

  .podium-card.silver .podium-avatar {
    border: 3px solid #C0C0C0;
    background: linear-gradient(135deg, #F8F8F8 0%, #E8E8E8 100%);
  }

  .podium-card.bronze .podium-avatar {
    border: 3px solid #CD7F32;
    background: linear-gradient(135deg, #FFF5EB 0%, #FFE4D4 100%);
  }

  .podium-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .podium-name {
    font-weight: 700;
    font-size: 16px;
    color: #333;
    margin-bottom: 4px;
  }

  .podium-card.gold .podium-name {
    font-size: 18px;
    color: #B8860B;
  }

  .podium-store {
    font-size: 13px;
    color: #888;
    margin-bottom: 12px;
  }

  .podium-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #eee;
  }

  .podium-stat {
    text-align: center;
  }

  .podium-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #333;
  }

  .podium-card.gold .podium-stat-value {
    font-size: 28px;
    color: #B8860B;
  }

  .podium-stat-label {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .podium-score-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
  }

  .podium-card.gold .podium-score-badge {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #fff;
  }

  .podium-card.silver .podium-score-badge {
    background: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%);
    color: #555;
  }

  .podium-card.bronze .podium-score-badge {
    background: linear-gradient(135deg, #FFDAB9 0%, #CD7F32 100%);
    color: #fff;
  }

  @media (max-width: 768px) {
    .podium-container {
      flex-direction: column;
      align-items: center;
    }
    
    .podium-card {
      order: 0 !important;
      width: 100%;
      max-width: 280px;
    }
    
    .podium-card.gold {
      margin-bottom: 10px;
    }
  }
`;

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
              <div className="position-relative">
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
                <i className="bi bi-chevron-down position-absolute top-50 end-0 translate-middle-y me-3" style={{ pointerEvents: 'none', zIndex: 10 }}></i>
              </div>
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

      {/* Top 3 Podium */}
      {topPerformers.length >= 3 && (
        <>
          <style>{podiumStyles}</style>
          <div className="card card-coffee mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy-fill text-warning me-2"></i>
                Top 3 nhân viên xuất sắc
              </h5>
            </div>
            <div className="card-body">
              <div className="podium-container">
                {/* 2nd Place - Silver */}
                <div className="podium-card silver">
                  <div className="podium-rank silver">2</div>
                  <div className="podium-avatar">
                    <i className="bi bi-person-fill text-secondary"></i>
                  </div>
                  <div className="podium-name">{topPerformers[1]?.fullName}</div>
                  <div className="podium-store">{topPerformers[1]?.storeName}</div>
                  <div className="podium-score-badge">
                    {topPerformers[1]?.performanceScore?.toFixed(0)} điểm
                  </div>
                  <div className="podium-stats">
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[1]?.completedTasks}</div>
                      <div className="podium-stat-label">Hoàn thành</div>
                    </div>
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[1]?.totalTasks}</div>
                      <div className="podium-stat-label">Tổng NV</div>
                    </div>
                  </div>
                </div>

                {/* 1st Place - Gold */}
                <div className="podium-card gold">
                  <div className="podium-crown">👑</div>
                  <div className="podium-rank gold">1</div>
                  <div className="podium-avatar">
                    <i className="bi bi-person-fill text-warning"></i>
                  </div>
                  <div className="podium-name">{topPerformers[0]?.fullName}</div>
                  <div className="podium-store">{topPerformers[0]?.storeName}</div>
                  <div className="podium-score-badge">
                    {topPerformers[0]?.performanceScore?.toFixed(0)} điểm
                  </div>
                  <div className="podium-stats">
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[0]?.completedTasks}</div>
                      <div className="podium-stat-label">Hoàn thành</div>
                    </div>
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[0]?.totalTasks}</div>
                      <div className="podium-stat-label">Tổng NV</div>
                    </div>
                  </div>
                </div>

                {/* 3rd Place - Bronze */}
                <div className="podium-card bronze">
                  <div className="podium-rank bronze">3</div>
                  <div className="podium-avatar">
                    <i className="bi bi-person-fill" style={{ color: '#CD7F32' }}></i>
                  </div>
                  <div className="podium-name">{topPerformers[2]?.fullName}</div>
                  <div className="podium-store">{topPerformers[2]?.storeName}</div>
                  <div className="podium-score-badge">
                    {topPerformers[2]?.performanceScore?.toFixed(0)} điểm
                  </div>
                  <div className="podium-stats">
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[2]?.completedTasks}</div>
                      <div className="podium-stat-label">Hoàn thành</div>
                    </div>
                    <div className="podium-stat">
                      <div className="podium-stat-value">{topPerformers[2]?.totalTasks}</div>
                      <div className="podium-stat-label">Tổng NV</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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



