import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchMyShifts } from '../features/shifts/shiftSlice';
import {
  fetchAvailableListings,
  fetchMyListings,
  fetchPendingApproval,
  fetchPendingPeerSwaps,
  fetchSwapsPendingApproval,
  createListing,
  claimListing,
  reviewListing,
  cancelListing,
  confirmSwapRequest,
  reviewSwapRequest,
} from '../features/marketplace/marketplaceSlice';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import { formatDateTime, formatTime } from '../utils/formatters';
import { MarketplaceListing, SwapRequest } from '../api/marketplaceService';

interface MarketplaceProps {
  hideHeader?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ hideHeader = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { myShifts } = useSelector((state: RootState) => state.shifts);
  const { 
    listings, 
    myListings, 
    pendingApproval, 
    pendingPeerSwaps,
    pendingManagerSwaps,
    loading 
  } = useSelector((state: RootState) => state.marketplace);

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'my-listings' | 'pending' | 'swaps'>('available');
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);
  const [giveReason, setGiveReason] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const isStaff = user?.role === 'STAFF';
  const isManager = user?.role === 'MANAGER';
  const isOwner = user?.role === 'OWNER';
  
  // Owner chỉ được xem, không được tác động vào chợ ca
  const canReview = isManager; // Chỉ Manager có thể duyệt, Owner không được

  useEffect(() => {
    dispatch(fetchStores());
    if (user?.role === 'STAFF') {
      dispatch(fetchMyShifts());
      dispatch(fetchMyListings());
      dispatch(fetchPendingPeerSwaps());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      const defaultStore = user?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
    }
  }, [stores, user?.storeId, selectedStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      dispatch(fetchAvailableListings(selectedStoreId));
      if (isManager || isOwner) {
        dispatch(fetchPendingApproval(selectedStoreId));
        dispatch(fetchSwapsPendingApproval(selectedStoreId));
      }
    }
  }, [dispatch, selectedStoreId, isManager, isOwner]);

  const handleCreateListing = async () => {
    if (!selectedShiftId) return;
    try {
      await dispatch(createListing({
        shiftId: selectedShiftId,
        type: 'GIVE_AWAY',
        reason: giveReason,
      })).unwrap();
      setToast({ show: true, message: 'Đã đăng ca lên Chợ Ca!', type: 'success' });
      setShowGiveModal(false);
      setGiveReason('');
      setSelectedShiftId(null);
      // Refresh cả my listings và available listings
      dispatch(fetchMyListings());
      if (selectedStoreId) {
        dispatch(fetchAvailableListings(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleClaimListing = async (listingId: number) => {
    try {
      await dispatch(claimListing(listingId)).unwrap();
      setToast({ show: true, message: 'Đã yêu cầu nhận ca. Chờ Manager duyệt!', type: 'success' });
      if (selectedStoreId) {
        dispatch(fetchAvailableListings(selectedStoreId));
      }
      // Refresh myShifts để cập nhật số ca trong tuần (khi được duyệt)
      if (isStaff) {
        dispatch(fetchMyShifts());
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleReviewListing = async (approve: boolean) => {
    if (!selectedListing) return;
    try {
      await dispatch(reviewListing({
        listingId: selectedListing.id,
        data: { status: approve ? 'APPROVED' : 'REJECTED', note: reviewNote },
      })).unwrap();
      setToast({ show: true, message: approve ? 'Đã duyệt!' : 'Đã từ chối!', type: 'success' });
      setShowReviewModal(false);
      setReviewNote('');
      setSelectedListing(null);
      if (selectedStoreId) {
        dispatch(fetchPendingApproval(selectedStoreId));
        dispatch(fetchAvailableListings(selectedStoreId));
      }
      // Refresh myShifts để cập nhật số ca trong tuần khi manager duyệt
      if (isStaff && approve) {
        dispatch(fetchMyShifts());
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleCancelListing = async (listingId: number) => {
    try {
      await dispatch(cancelListing(listingId)).unwrap();
      setToast({ show: true, message: 'Đã hủy!', type: 'success' });
      dispatch(fetchMyListings());
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleConfirmSwap = async (swapId: number, confirm: boolean) => {
    try {
      await dispatch(confirmSwapRequest({ swapId, confirm })).unwrap();
      setToast({ show: true, message: confirm ? 'Đã xác nhận!' : 'Đã từ chối!', type: 'success' });
      dispatch(fetchPendingPeerSwaps());
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleReviewSwap = async (swapId: number, approve: boolean) => {
    try {
      await dispatch(reviewSwapRequest({ swapId, approve, note: reviewNote })).unwrap();
      setToast({ show: true, message: approve ? 'Đã duyệt!' : 'Đã từ chối!', type: 'success' });
      setSelectedSwap(null);
      setReviewNote('');
      if (selectedStoreId) {
        dispatch(fetchSwapsPendingApproval(selectedStoreId));
      }
    } catch (err: any) {
      setToast({ show: true, message: err || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { class: string; label: string }> = {
      PENDING: { class: 'bg-warning text-dark', label: 'Đang chờ' },
      CLAIMED: { class: 'bg-info', label: 'Đã có người nhận' },
      APPROVED: { class: 'bg-success', label: 'Đã duyệt' },
      REJECTED: { class: 'bg-danger', label: 'Từ chối' },
      CANCELLED: { class: 'bg-secondary', label: 'Đã hủy' },
      EXPIRED: { class: 'bg-dark', label: 'Hết hạn' },
      PENDING_PEER: { class: 'bg-warning text-dark', label: 'Chờ xác nhận' },
      PENDING_MANAGER: { class: 'bg-info', label: 'Chờ Manager' },
    };
    return badges[status] || { class: 'bg-secondary', label: status };
  };

  // Ensure arrays are always valid
  const safeListings = Array.isArray(listings) ? listings : [];
  const safeMyListings = Array.isArray(myListings) ? myListings : [];
  const safePendingApproval = Array.isArray(pendingApproval) ? pendingApproval : [];
  const safePendingPeerSwaps = Array.isArray(pendingPeerSwaps) ? pendingPeerSwaps : [];
  const safePendingManagerSwaps = Array.isArray(pendingManagerSwaps) ? pendingManagerSwaps : [];
  const safeMyShifts = Array.isArray(myShifts) ? myShifts : [];

  // Debug: Log listings to console (remove in production)
  useEffect(() => {
    if (selectedStoreId) {
      console.log('Marketplace Debug:', {
        selectedStoreId,
        listings: safeListings,
        listingsCount: safeListings.length,
        pendingListings: safeListings.filter(l => l.status === 'PENDING'),
        loading
      });
    }
  }, [selectedStoreId, safeListings, loading]);

  if (loading && safeListings.length === 0 && !selectedStoreId) {
    return <Loading />;
  }

  const confirmedShifts = safeMyShifts.filter(s => 
    s.assignments?.some((a: any) => a.userId === user?.id && a.status === 'CONFIRMED')
  );

  return (
    <div>
      {!hideHeader && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">
              <i className="bi bi-shop-window me-2"></i>
              Chợ Ca
            </h2>
            <p className="text-muted mb-0">Nhường, nhận và đổi ca làm việc</p>
          </div>
          {isStaff && (
            <button className="btn btn-coffee" onClick={() => setShowGiveModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>
              Đăng nhường ca
            </button>
          )}
        </div>
      )}
      {hideHeader && isStaff && (
        <div className="d-flex justify-content-end mb-4">
          <button className="btn btn-coffee" onClick={() => setShowGiveModal(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Đăng nhường ca
          </button>
        </div>
      )}

      {/* Store Filter */}
      {(isOwner || stores.length > 1) && (
        <div className="card card-coffee mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <label className="form-label mb-0">Chọn cơ sở:</label>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedStoreId || ''}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  disabled={isManager}
                >
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
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            <i className="bi bi-cart me-1"></i>
            Ca đang nhường ({safeListings.filter(l => l.status === 'PENDING').length})
          </button>
        </li>
        {isStaff && (
          <>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'my-listings' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-listings')}
              >
                <i className="bi bi-person me-1"></i>
                Ca của tôi ({safeMyListings.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'swaps' ? 'active' : ''}`}
                onClick={() => setActiveTab('swaps')}
              >
                <i className="bi bi-arrow-left-right me-1"></i>
                Đổi ca
                {safePendingPeerSwaps.length > 0 && (
                  <span className="badge bg-danger ms-1">{safePendingPeerSwaps.length}</span>
                )}
              </button>
            </li>
          </>
        )}
        {(isManager || isOwner) && (
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <i className="bi bi-clock-history me-1"></i>
              Chờ duyệt
              {(safePendingApproval.length + safePendingManagerSwaps.length) > 0 && (
                <span className="badge bg-danger ms-1">
                  {safePendingApproval.length + safePendingManagerSwaps.length}
                </span>
              )}
            </button>
          </li>
        )}
      </ul>

      {/* Tab Content */}
      {activeTab === 'available' && (
        <div className="row g-3">
          {safeListings.filter(l => l.status === 'PENDING').map((listing) => (
            <div key={listing.id} className="col-md-6 col-lg-4">
              <div className="card card-coffee h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{listing.shiftTitle}</h5>
                    <span className={`badge ${getStatusBadge(listing.status).class}`}>
                      {getStatusBadge(listing.status).label}
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDateTime(listing.shiftStart)}
                  </p>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-clock me-1"></i>
                    {formatTime(listing.shiftStart)} - {formatTime(listing.shiftEnd)}
                  </p>
                  <p className="small mb-3">
                    <i className="bi bi-person me-1"></i>
                    <strong>{listing.fromUserName}</strong> đang nhường
                  </p>
                  {listing.reason && (
                    <p className="small text-muted mb-3">
                      <i className="bi bi-chat-left-text me-1"></i>
                      {listing.reason}
                    </p>
                  )}
                  {isStaff && listing.fromUserId !== user?.id && (
                    <button 
                      className="btn btn-coffee w-100"
                      onClick={() => handleClaimListing(listing.id)}
                    >
                      <i className="bi bi-hand-index me-1"></i>
                      Nhận ca này
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {safeListings.filter(l => l.status === 'PENDING').length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-cart-x fs-1 d-block mb-3"></i>
              <p>Không có ca nào đang được nhường</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-listings' && isStaff && (
        <div className="row g-3">
          {safeMyListings.map((listing) => (
            <div key={listing.id} className="col-md-6 col-lg-4">
              <div className="card card-coffee h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{listing.shiftTitle}</h5>
                    <span className={`badge ${getStatusBadge(listing.status).class}`}>
                      {getStatusBadge(listing.status).label}
                    </span>
                  </div>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-calendar me-1"></i>
                    {formatDateTime(listing.shiftStart)}
                  </p>
                  {listing.toUserName && (
                    <p className="small mb-2">
                      <i className="bi bi-person-check me-1"></i>
                      {listing.toUserName} muốn nhận
                    </p>
                  )}
                  {listing.managerNote && (
                    <p className="small text-muted mb-2">
                      <i className="bi bi-chat me-1"></i>
                      Ghi chú: {listing.managerNote}
                    </p>
                  )}
                  {(listing.status === 'PENDING' || listing.status === 'CLAIMED') && (
                    <button 
                      className="btn btn-outline-danger btn-sm w-100 mt-2"
                      onClick={() => handleCancelListing(listing.id)}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {safeMyListings.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-3"></i>
              <p>Bạn chưa đăng nhường ca nào</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'swaps' && isStaff && (
        <div>
          {safePendingPeerSwaps.length > 0 && (
            <>
              <h5 className="mb-3">Yêu cầu đổi ca chờ xác nhận của bạn</h5>
              <div className="row g-3 mb-4">
                {safePendingPeerSwaps.map((swap) => (
                  <div key={swap.id} className="col-md-6">
                    <div className="card card-coffee border-warning">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>{swap.fromUserName}</strong>
                          <span className={`badge ${getStatusBadge(swap.status).class}`}>
                            {getStatusBadge(swap.status).label}
                          </span>
                        </div>
                        <p className="small mb-1">Muốn đổi: <strong>{swap.fromShiftTitle}</strong></p>
                        <p className="small text-muted mb-1">
                          {formatDateTime(swap.fromShiftStart)}
                        </p>
                        <p className="small mb-1">Với ca của bạn: <strong>{swap.toShiftTitle}</strong></p>
                        <p className="small text-muted mb-3">
                          {formatDateTime(swap.toShiftStart)}
                        </p>
                        {swap.reason && (
                          <p className="small text-muted mb-3">
                            Lý do: {swap.reason}
                          </p>
                        )}
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success btn-sm flex-fill"
                            onClick={() => handleConfirmSwap(swap.id, true)}
                          >
                            <i className="bi bi-check me-1"></i>
                            Đồng ý
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm flex-fill"
                            onClick={() => handleConfirmSwap(swap.id, false)}
                          >
                            <i className="bi bi-x me-1"></i>
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="text-center py-5 text-muted">
            <i className="bi bi-arrow-left-right fs-1 d-block mb-3"></i>
            <p>Tính năng đổi ca đang được phát triển</p>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (isManager || isOwner) && (
        <div>
          {/* Alert for Owner - View only mode */}
          {isOwner && (
            <div className="alert alert-warning mb-4">
              <i className="bi bi-eye me-2"></i>
              <strong>Chế độ xem:</strong> Với vai trò Chủ sở hữu, bạn chỉ có thể xem các yêu cầu. Các thao tác duyệt/từ chối do Quản lý thực hiện.
            </div>
          )}

          {/* Pending Listings - Chưa có người nhận (PENDING) */}
          {safePendingApproval.filter(l => l.status === 'PENDING').length > 0 && (
            <>
              <h5 className="mb-3">Ca mới đăng (chưa có người nhận)</h5>
              <div className="row g-3 mb-4">
                {safePendingApproval.filter(l => l.status === 'PENDING').map((listing) => (
                  <div key={listing.id} className="col-md-6 col-lg-4">
                    <div className="card card-coffee border-info">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0">{listing.shiftTitle}</h5>
                          <span className="badge bg-info">Mới đăng</span>
                        </div>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-calendar me-1"></i>
                          {formatDateTime(listing.shiftStart)}
                        </p>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-clock me-1"></i>
                          {formatTime(listing.shiftStart)} - {formatTime(listing.shiftEnd)}
                        </p>
                        <p className="small mb-2">
                          <i className="bi bi-person me-1"></i>
                          <strong>{listing.fromUserName}</strong> đang nhường
                        </p>
                        {listing.reason && (
                          <p className="small text-muted mb-3">Lý do: {listing.reason}</p>
                        )}
                        <p className="small text-muted mb-0">
                          <i className="bi bi-info-circle me-1"></i>
                          Đang chờ nhân viên khác nhận ca
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Claimed Listings - Đã có người nhận, chờ Manager duyệt (CLAIMED) */}
          {safePendingApproval.filter(l => l.status === 'CLAIMED').length > 0 && (
            <>
              <h5 className="mb-3">Yêu cầu nhường ca chờ duyệt</h5>
              <div className="row g-3 mb-4">
                {safePendingApproval.filter(l => l.status === 'CLAIMED').map((listing) => (
                  <div key={listing.id} className="col-md-6 col-lg-4">
                    <div className="card card-coffee">
                      <div className="card-body">
                        <h5 className="card-title">{listing.shiftTitle}</h5>
                        <p className="text-muted small">
                          <i className="bi bi-calendar me-1"></i>
                          {formatDateTime(listing.shiftStart)}
                        </p>
                        <div className="mb-2">
                          <span className="badge bg-secondary me-1">{listing.fromUserName}</span>
                          <i className="bi bi-arrow-right"></i>
                          <span className="badge bg-primary ms-1">{listing.toUserName || 'Chưa có'}</span>
                        </div>
                        {listing.reason && (
                          <p className="small text-muted">Lý do: {listing.reason}</p>
                        )}
                        {canReview && (
                          <div className="d-flex gap-2 mt-3">
                            <button 
                              className="btn btn-success btn-sm flex-fill"
                              onClick={() => {
                                setSelectedListing(listing);
                                setShowReviewModal(true);
                              }}
                            >
                              <i className="bi bi-check me-1"></i>
                              Duyệt
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm flex-fill"
                              onClick={() => {
                                setSelectedListing(listing);
                                handleReviewListing(false);
                              }}
                            >
                              <i className="bi bi-x me-1"></i>
                              Từ chối
                            </button>
                          </div>
                        )}
                        {isOwner && (
                          <div className="mt-3 text-center">
                            <span className="badge bg-secondary">
                              <i className="bi bi-eye me-1"></i>
                              Chỉ xem
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pending Swap Requests */}
          {safePendingManagerSwaps.length > 0 && (
            <>
              <h5 className="mb-3">Yêu cầu đổi ca chờ duyệt</h5>
              <div className="row g-3">
                {safePendingManagerSwaps.map((swap) => (
                  <div key={swap.id} className="col-md-6">
                    <div className="card card-coffee">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-5">
                            <strong>{swap.fromUserName}</strong>
                            <p className="small mb-0">{swap.fromShiftTitle}</p>
                            <p className="small text-muted">{formatDateTime(swap.fromShiftStart)}</p>
                          </div>
                          <div className="col-2 d-flex align-items-center justify-content-center">
                            <i className="bi bi-arrow-left-right fs-4 text-muted"></i>
                          </div>
                          <div className="col-5 text-end">
                            <strong>{swap.toUserName}</strong>
                            <p className="small mb-0">{swap.toShiftTitle}</p>
                            <p className="small text-muted">{formatDateTime(swap.toShiftStart)}</p>
                          </div>
                        </div>
                        {canReview && (
                          <div className="d-flex gap-2 mt-3">
                            <button 
                              className="btn btn-success btn-sm flex-fill"
                              onClick={() => handleReviewSwap(swap.id, true)}
                            >
                              <i className="bi bi-check me-1"></i>
                              Duyệt
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm flex-fill"
                              onClick={() => handleReviewSwap(swap.id, false)}
                            >
                              <i className="bi bi-x me-1"></i>
                              Từ chối
                            </button>
                          </div>
                        )}
                        {isOwner && (
                          <div className="mt-3 text-center">
                            <span className="badge bg-secondary">
                              <i className="bi bi-eye me-1"></i>
                              Chỉ xem
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {safePendingApproval.length === 0 && safePendingManagerSwaps.length === 0 && (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-check-circle fs-1 d-block mb-3"></i>
              <p>Không có yêu cầu nào chờ duyệt</p>
            </div>
          )}
        </div>
      )}

      {/* Give Away Modal */}
      {showGiveModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Đăng nhường ca</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowGiveModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chọn ca muốn nhường *</label>
                    <select
                      className="form-select"
                      value={selectedShiftId || ''}
                      onChange={(e) => setSelectedShiftId(Number(e.target.value))}
                    >
                      <option value="">-- Chọn ca --</option>
                      {confirmedShifts.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.title} - {formatDateTime(shift.startDatetime)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Lý do</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={giveReason}
                      onChange={(e) => setGiveReason(e.target.value)}
                      placeholder="Nhập lý do nhường ca..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowGiveModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-coffee"
                    onClick={handleCreateListing}
                    disabled={!selectedShiftId}
                  >
                    Đăng nhường
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedListing && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Duyệt yêu cầu</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowReviewModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Ca:</strong> {selectedListing.shiftTitle}</p>
                  <p><strong>Thời gian:</strong> {formatDateTime(selectedListing.shiftStart)}</p>
                  <p>
                    <strong>Chuyển từ:</strong> {selectedListing.fromUserName} → {selectedListing.toUserName}
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Ghi chú (tùy chọn)..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-danger" 
                    onClick={() => handleReviewListing(false)}
                  >
                    Từ chối
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => handleReviewListing(true)}
                  >
                    Duyệt
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
};

export default Marketplace;


