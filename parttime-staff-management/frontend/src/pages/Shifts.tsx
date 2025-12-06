import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { fetchShiftsByStore, createShift, updateShift, deleteShift, assignStaffToShift } from '../features/shifts/shiftSlice';
import { fetchStores } from '../features/stores/storeSlice';
import { fetchUsers } from '../features/users/userSlice';
import { CreateShiftRequest } from '../api/shiftService';
import shiftService from '../api/shiftService';
import shiftRegistrationService, { CreateShiftTemplateRequest, ShiftTemplate, ShiftRegistration } from '../api/shiftRegistrationService';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { formatDateTime, formatTime } from '../utils/formatters';

const Shifts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { shifts, loading } = useSelector((state: RootState) => state.shifts);
  const { stores } = useSelector((state: RootState) => state.stores);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [registrations, setRegistrations] = useState<ShiftRegistration[]>([]);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [finalizedShifts, setFinalizedShifts] = useState<Set<string>>(new Set()); // Store "templateId_date" as key

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [formData, setFormData] = useState<CreateShiftRequest>({
    title: '',
    startDatetime: '',
    endDatetime: '',
    requiredSlots: 1,
  });
  const [editFormData, setEditFormData] = useState<{ startDatetime: string; endDatetime: string; requiredSlots: number }>({
    startDatetime: '',
    endDatetime: '',
    requiredSlots: 1,
  });
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' | 'info' }>({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedShiftType, setSelectedShiftType] = useState<'MORNING' | 'AFTERNOON' | 'EVENING' | null>(null);
  const [shiftTemplateForm, setShiftTemplateForm] = useState<CreateShiftTemplateRequest & { notes?: string }>({
    title: '',
    shiftType: 'MORNING',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '12:00',
    requiredSlots: 1,
    notes: ''
  });

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  function getDayName(dayOfWeek: number): string {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[dayOfWeek === 7 ? 0 : dayOfWeek];
  }

  useEffect(() => {
    dispatch(fetchStores());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    // Set default store
    if (stores.length > 0 && !selectedStoreId) {
      const defaultStore = currentUser?.storeId || stores[0].id;
      setSelectedStoreId(defaultStore);
    }
  }, [stores, currentUser?.storeId, selectedStoreId]);

  useEffect(() => {
    if (selectedStoreId) {
      loadTemplates();
    }
  }, [dispatch, selectedStoreId]);

  const loadTemplates = async () => {
    if (!selectedStoreId) return;
    try {
      const response = await shiftRegistrationService.getShiftTemplates(selectedStoreId);
      setTemplates(response.data || []);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRegistrations = async () => {
    if (!selectedStoreId) return;
    try {
      const response = await shiftRegistrationService.getRegistrationsForWeek(selectedStoreId, formatDate(weekStart));
      setRegistrations(response.data || []);
      
      // Load finalized status for all templates and dates in this week only
      const finalizedSet = new Set<string>();
      for (const template of templates) {
        for (let day = 1; day <= 7; day++) {
          const date = getDateForDay(day);
          try {
            const finalizedResponse = await shiftRegistrationService.isShiftFinalized(template.id, formatDate(date));
            if (finalizedResponse.data) {
              finalizedSet.add(`${template.id}_${formatDate(date)}`);
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }
      setFinalizedShifts(finalizedSet);
    } catch (error: any) {
      console.error('Failed to load registrations:', error);
    }
  };

  useEffect(() => {
    if (templates.length > 0) {
      loadRegistrations();
    }
  }, [templates, weekStart, selectedStoreId]);

  const storeStaff = users.filter(
    (u) => u.role === 'STAFF' && u.storeId === selectedStoreId
  );

  const handleOpenModal = () => {
    setFormData({
      title: '',
      startDatetime: '',
      endDatetime: '',
      requiredSlots: 1,
    });
    setShowModal(true);
  };

  const handleOpenCreateShiftModal = (day: number, shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING') => {
    console.log('Opening create shift modal:', { day, shiftType, selectedStoreId });
    if (!selectedStoreId) {
      setToast({ show: true, message: 'Vui lòng chọn cơ sở trước!', type: 'warning' });
      return;
    }
    setSelectedDay(day);
    setSelectedShiftType(shiftType);
    
    // Set default times based on shift type
    let defaultStart = '08:00';
    let defaultEnd = '12:00';
    if (shiftType === 'AFTERNOON') {
      defaultStart = '12:00';
      defaultEnd = '17:00';
    } else if (shiftType === 'EVENING') {
      defaultStart = '17:00';
      defaultEnd = '22:00';
    }

    setShiftTemplateForm({
      title: shiftType === 'MORNING' ? 'Ca sáng' : shiftType === 'AFTERNOON' ? 'Ca chiều' : 'Ca tối',
      shiftType: shiftType,
      dayOfWeek: day,
      startTime: defaultStart,
      endTime: defaultEnd,
      requiredSlots: 1,
      notes: ''
    });
    setShowCreateShiftModal(true);
    console.log('Modal state set:', { showCreateShiftModal: true, selectedDay: day, selectedShiftType: shiftType });
  };

  const handleCreateShiftTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId || !selectedDay || !selectedShiftType) return;

    try {
      await shiftRegistrationService.createShiftTemplate(selectedStoreId, {
        title: shiftTemplateForm.title,
        shiftType: shiftTemplateForm.shiftType,
        dayOfWeek: selectedDay,
        startTime: shiftTemplateForm.startTime,
        endTime: shiftTemplateForm.endTime,
        requiredSlots: shiftTemplateForm.requiredSlots || 1,
        notes: shiftTemplateForm.notes || undefined
      });
      
      setToast({ show: true, message: 'Tạo ca mẫu thành công!', type: 'success' });
      setShowCreateShiftModal(false);
      setSelectedDay(null);
      setSelectedShiftType(null);
      // Reset form
      setShiftTemplateForm({
        title: '',
        shiftType: 'MORNING',
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '12:00',
        requiredSlots: 1,
        notes: ''
      });
      // Refresh data
      await loadTemplates();
      await loadRegistrations();
    } catch (error: any) {
      setToast({ 
        show: true, 
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi tạo ca!', 
        type: 'error' 
      });
    }
  };

  const getDateForDay = (dayOfWeek: number): Date => {
    const date = new Date(weekStart);
    const diff = dayOfWeek - 1;
    date.setDate(date.getDate() + diff);
    return date;
  };

  const getTemplatesForDayAndType = (day: number, shiftType: string): ShiftTemplate[] => {
    return templates.filter((template: ShiftTemplate) => {
      return template.dayOfWeek === day && template.shiftType === shiftType;
    });
  };

  const getRegistrationsForTemplateAndDate = (templateId: number, date: Date): ShiftRegistration[] => {
    const dateStr = formatDate(date);
    return registrations.filter((reg: ShiftRegistration) => {
      return reg.shiftId === templateId && reg.registrationDate === dateStr && reg.status === 'REGISTERED';
    });
  };

  const handleOpenRegistrationsModal = async (template: ShiftTemplate, day: number) => {
    const date = getDateForDay(day);
    setSelectedTemplate(template);
    setSelectedDate(date);
    setSelectedUserIds([]); // Reset selected users
    setShowRegistrationsModal(true);
    // Load registrations for this template and date
    await loadRegistrationsForTemplate(template.id, date);
  };

  const [templateRegistrations, setTemplateRegistrations] = useState<ShiftRegistration[]>([]);

  const loadRegistrationsForTemplate = async (templateId: number, date: Date) => {
    try {
      const response = await shiftRegistrationService.getRegisteredUsersForShift(templateId, formatDate(date));
      setTemplateRegistrations(response.data || []);
    } catch (error: any) {
      console.error('Failed to load registrations:', error);
      setTemplateRegistrations([]);
    }
  };

  const handleOpenEditModal = (shift: any) => {
    setSelectedShift(shift);
    // Chuyển đổi datetime sang format datetime-local (YYYY-MM-DDTHH:mm)
    const formatDateTimeLocal = (dateTime: string) => {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    setEditFormData({
      startDatetime: formatDateTimeLocal(shift.startDatetime),
      endDatetime: formatDateTimeLocal(shift.endDatetime),
      requiredSlots: shift.requiredSlots || 1,
    });
    setShowEditModal(true);
  };

  const handleOpenAssignModal = (shift: any) => {
    setSelectedShift(shift);
    const assignedIds = shift.assignments?.map((a: any) => a.userId) || [];
    setSelectedUserIds(assignedIds);
    setShowAssignModal(true);
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) return;
    
    try {
      await dispatch(createShift({ storeId: selectedStoreId, data: formData })).unwrap();
      setToast({ show: true, message: 'Tạo ca làm thành công!', type: 'success' });
      setShowModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift) return;
    
    try {
      // Gửi startDatetime, endDatetime và requiredSlots để cập nhật
      const updateData: CreateShiftRequest = {
        title: selectedShift.title,
        startDatetime: editFormData.startDatetime,
        endDatetime: editFormData.endDatetime,
        requiredSlots: editFormData.requiredSlots,
      };
      await dispatch(updateShift({ id: selectedShift.id, data: updateData })).unwrap();
      setToast({ show: true, message: 'Cập nhật ca làm thành công!', type: 'success' });
      setShowEditModal(false);
      // Refresh shifts
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedShift) return;
    
    try {
      // Chỉ thêm những nhân viên mới (chưa được phân công)
      const currentAssignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
      const newUserIds = selectedUserIds.filter(id => !currentAssignedIds.includes(id));
      const currentCount = selectedShift.assignments?.length || 0;
      const requiredSlots = selectedShift.requiredSlots || 1;
      
      // Kiểm tra xem có vượt quá số người cần không
      if (currentCount + newUserIds.length > requiredSlots) {
        setToast({ 
          show: true, 
          message: `Không thể phân công thêm. Ca này chỉ cần ${requiredSlots} người, hiện đã có ${currentCount} người.`, 
          type: 'error' 
        });
        return;
      }
      
      if (newUserIds.length > 0) {
        await dispatch(
          assignStaffToShift({ shiftId: selectedShift.id, data: { userIds: newUserIds } })
        ).unwrap();
        setToast({ show: true, message: 'Phân công nhân viên thành công!', type: 'success' });
      } else {
        setToast({ show: true, message: 'Không có nhân viên mới để thêm!', type: 'info' });
      }
      
      // Refresh shifts
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
      setShowAssignModal(false);
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleRemoveAssignment = async (userId: number) => {
    if (!selectedShift) return;
    
    try {
      console.log('Removing assignment for userId:', userId, 'shiftId:', selectedShift.id);
      const response = await shiftService.removeAssignment(selectedShift.id, userId);
      console.log('Remove assignment response:', response);
      
      // response is ApiResponse<Shift>, so response.data is the Shift object
      const updatedShift = response.data;
      
      if (!updatedShift) {
        console.error('No data in response');
        setToast({ show: true, message: 'Không nhận được dữ liệu từ server!', type: 'error' });
        return;
      }
      
      setToast({ show: true, message: 'Đã xóa phân công nhân viên!', type: 'success' });
      
      // Update selectedShift with the updated data from response
      setSelectedShift(updatedShift);
      
      // Update selectedUserIds to match current assignments
      const assignedIds = updatedShift.assignments?.map((a: any) => a.userId) || [];
      setSelectedUserIds(assignedIds);
      
      // Refresh shifts list to update the main list
      if (selectedStoreId) {
        dispatch(fetchShiftsByStore({ storeId: selectedStoreId }));
      }
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteShift(id)).unwrap();
      setToast({ show: true, message: 'Xóa ca làm thành công!', type: 'success' });
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
    setConfirmDelete(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca mẫu này?')) return;
    
    try {
      // Delete template by deleting the shift
      await dispatch(deleteShift(templateId)).unwrap();
      setToast({ show: true, message: 'Xóa ca mẫu thành công!', type: 'success' });
      await loadTemplates();
      await loadRegistrations();
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleApproveAndCreateShift = async (userIds: number[]) => {
    if (!selectedTemplate || !selectedDate || !selectedStoreId) return;

    try {
      const date = new Date(selectedDate);
      const hours = parseInt(selectedTemplate.startTime.substring(0, 2));
      const minutes = parseInt(selectedTemplate.startTime.substring(3, 5));
      const endHours = parseInt(selectedTemplate.endTime.substring(0, 2));
      const endMinutes = parseInt(selectedTemplate.endTime.substring(3, 5));

      const startDatetime = new Date(date);
      startDatetime.setHours(hours, minutes, 0, 0);
      
      const endDatetime = new Date(date);
      endDatetime.setHours(endHours, endMinutes, 0, 0);

      // Format datetime for API
      const formatDateTimeForAPI = (dt: Date): string => {
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
      };

      // Create actual shift (only for this specific date, not template)
      const shiftResponse = await dispatch(createShift({
        storeId: selectedStoreId,
        data: {
          title: selectedTemplate.title,
          startDatetime: formatDateTimeForAPI(startDatetime),
          endDatetime: formatDateTimeForAPI(endDatetime),
          requiredSlots: userIds.length
        }
      })).unwrap();

      // Assign selected users
      if (userIds.length > 0) {
        await dispatch(assignStaffToShift({
          shiftId: shiftResponse.id,
          data: { userIds: userIds }
        })).unwrap();
      }

      // Finalize the shift template for this date (lock registrations)
      await shiftRegistrationService.finalizeShift(selectedTemplate.id, formatDate(selectedDate));

      // Update finalized status
      const finalizedKey = `${selectedTemplate.id}_${formatDate(selectedDate)}`;
      setFinalizedShifts(prev => {
        const newSet = new Set(prev);
        newSet.add(finalizedKey);
        return newSet;
      });

      setToast({ show: true, message: 'Đã tạo ca, phân công nhân viên và chốt ca thành công!', type: 'success' });
      setShowRegistrationsModal(false);
      setSelectedTemplate(null);
      setSelectedDate(null);
      setTemplateRegistrations([]);
      setSelectedUserIds([]);
      await loadRegistrations();
      await loadTemplates();
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const getAssignmentStatus = (shift: any) => {
    const confirmed = shift.confirmedCount || 0;
    const required = shift.requiredSlots || 1;
    if (confirmed >= required) return 'success';
    if (confirmed > 0) return 'warning';
    return 'secondary';
  };

  if (loading && shifts.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Tạo ca mẫu</h2>
          <p className="text-muted mb-0">
            Tạo ca mẫu cho nhân viên đăng ký. Mỗi tuần quản lý sẽ chốt ca riêng biệt.
          </p>
        </div>
      </div>

      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Lưu ý:</strong> Ca mẫu chỉ là mẫu cho nhân viên đăng ký. Mỗi tuần quản lý cần chốt ca riêng biệt để tạo ca thực tế. 
        Khi xóa ca mẫu, chỉ xóa mẫu, không ảnh hưởng đến các ca thực tế đã được tạo.
      </div>

      {/* Store Filter */}
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
                disabled={currentUser?.role === 'MANAGER'}
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

      {/* Week Navigation */}
      <div className="card card-coffee mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-outline-coffee"
              onClick={() => {
                const newWeek = new Date(weekStart);
                newWeek.setDate(newWeek.getDate() - 7);
                setWeekStart(newWeek);
              }}
            >
              <i className="bi bi-chevron-left me-2"></i>
              Tuần trước
            </button>
            <div className="text-center">
              <h5 className="mb-0">
                Tuần {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} -{" "}
                {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </h5>
            </div>
            <button
              className="btn btn-outline-coffee"
              onClick={() => {
                const newWeek = new Date(weekStart);
                newWeek.setDate(newWeek.getDate() + 7);
                setWeekStart(newWeek);
              }}
            >
              Tuần sau
              <i className="bi bi-chevron-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Week Table */}
      <div className="card card-coffee">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "120px" }}>Ca làm</th>
                  {[1, 2, 3, 4, 5, 6, 7].map(day => {
                    const date = getDateForDay(day);
                    const isToday = formatDate(date) === formatDate(new Date());
                    return (
                      <th
                        key={day}
                        className={`text-center ${isToday ? "bg-light" : ""}`}
                        style={{ minWidth: "150px" }}
                      >
                        <div>{getDayName(day)}</div>
                        <div className="small text-muted">
                          {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {["MORNING", "AFTERNOON", "EVENING"].map(shiftType => {
                  const shiftTypeLabels: Record<string, string> = {
                    MORNING: "Ca sáng",
                    AFTERNOON: "Ca chiều",
                    EVENING: "Ca tối"
                  };

                  return (
                    <tr key={shiftType}>
                      <td className="align-middle fw-bold">
                        {shiftTypeLabels[shiftType]}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map(day => {
                        const dayTemplates = getTemplatesForDayAndType(day, shiftType);
                        
                        return (
                          <td key={day} className="text-center align-middle" style={{ verticalAlign: 'top' }}>
                            {dayTemplates.map((template: ShiftTemplate) => {
                              const date = getDateForDay(day);
                              const templateRegs = getRegistrationsForTemplateAndDate(template.id, date);
                              const registrationCount = templateRegs.length;
                              const isFinalized = finalizedShifts.has(`${template.id}_${formatDate(date)}`);
                              
                              return (
                                <div key={template.id} className={`mb-2 p-2 border rounded ${isFinalized ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                                  <div className="small fw-bold mb-1">{template.title}</div>
                                  <div className="small text-muted mb-1">
                                    {template.startTime.substring(0, 5)} - {template.endTime.substring(0, 5)}
                                  </div>
                                  <div className="small mb-1">
                                    {isFinalized ? (
                                      <span className="badge bg-success">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Đã chốt
                                      </span>
                                    ) : (
                                      <span className="badge bg-info">
                                        {registrationCount}/{template.requiredSlots || 1} đăng ký
                                      </span>
                                    )}
                                  </div>
                                  <div className="d-flex gap-1 mt-1">
                                    <button
                                      className="btn btn-sm btn-outline-primary flex-grow-1"
                                      onClick={() => handleOpenRegistrationsModal(template, day)}
                                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                      title="Xem đăng ký"
                                      disabled={isFinalized}
                                    >
                                      <i className="bi bi-people"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger flex-grow-1"
                                      onClick={() => handleDeleteTemplate(template.id)}
                                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                      title="Xóa ca mẫu"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            {dayTemplates.length === 0 && (
                              <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => handleOpenCreateShiftModal(day, shiftType as 'MORNING' | 'AFTERNOON' | 'EVENING')}
                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Tạo ca
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Shift Modal */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo ca làm mới</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleCreateShift}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tên ca *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="VD: Ca sáng, Ca chiều..."
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.startDatetime}
                        onChange={(e) =>
                          setFormData({ ...formData, startDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.endDatetime}
                        onChange={(e) =>
                          setFormData({ ...formData, endDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Số nhân viên cần</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.requiredSlots}
                        onChange={(e) =>
                          setFormData({ ...formData, requiredSlots: Number(e.target.value) })
                        }
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Tạo ca
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa ca làm - {selectedShift.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleUpdateShift}>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Bạn có thể chỉnh sửa thời gian bắt đầu, kết thúc và số người cần của ca làm việc này.
                    </div>
                    {selectedShift.assignments && selectedShift.assignments.length > 0 && (
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Hiện đã có <strong>{selectedShift.assignments.length}</strong> người được phân công. 
                        Số người cần không được nhỏ hơn số người đã phân công.
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Tên ca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedShift.title}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editFormData.startDatetime}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, startDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={editFormData.endDatetime}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, endDatetime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Số nhân viên cần *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.requiredSlots}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          const minValue = selectedShift.assignments?.length || 0;
                          if (value >= minValue) {
                            setEditFormData({ ...editFormData, requiredSlots: value });
                          }
                        }}
                        min={selectedShift.assignments?.length || 0}
                        required
                      />
                      <small className="text-muted">
                        Tối thiểu: {selectedShift.assignments?.length || 0} (số người đã phân công)
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedShift && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">Phân công nhân viên - {selectedShift.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAssignModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="text-muted mb-0">
                        Quản lý phân công nhân viên cho ca này:
                      </p>
                      <span className={`badge ${(selectedShift.assignments?.length || 0) >= selectedShift.requiredSlots ? 'bg-success' : 'bg-warning'}`}>
                        {selectedShift.assignments?.length || 0} / {selectedShift.requiredSlots} người
                      </span>
                    </div>
                    {(selectedShift.assignments?.length || 0) >= selectedShift.requiredSlots && (
                      <div className="alert alert-success mb-0">
                        <i className="bi bi-check-circle me-2"></i>
                        Đã đủ số người cần cho ca này.
                      </div>
                    )}
                  </div>
                  
                  {/* Danh sách nhân viên đã được phân công */}
                  {selectedShift.assignments && selectedShift.assignments.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-2">
                        <i className="bi bi-people-fill me-2"></i>
                        Nhân viên đã được phân công ({selectedShift.assignments.length})
                      </h6>
                      <div className="list-group">
                        {selectedShift.assignments.map((assignment: any) => {
                          const staff = storeStaff.find((s) => s.id === assignment.userId);
                          if (!staff) return null;
                          return (
                            <div
                              key={assignment.id}
                              className="list-group-item d-flex align-items-center justify-content-between"
                            >
                              <div className="d-flex align-items-center">
                                <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                                <div>
                                  <strong>{staff.fullName}</strong>
                                  <br />
                                  <small className={`text-muted ${
                                    assignment.status === 'CONFIRMED' ? 'text-success' :
                                    assignment.status === 'DECLINED' ? 'text-danger' : 'text-warning'
                                  }`}>
                                    {assignment.status === 'CONFIRMED' ? '✓ Đã xác nhận' :
                                     assignment.status === 'DECLINED' ? '✗ Đã từ chối' : '⏳ Đang chờ'}
                                  </small>
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Bạn có chắc chắn muốn xóa phân công cho ${staff.fullName}?`)) {
                                    handleRemoveAssignment(assignment.userId);
                                  }
                                }}
                                title="Xóa phân công"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Danh sách nhân viên chưa được phân công */}
                  <div>
                    <h6 className="mb-2">
                      <i className="bi bi-person-plus me-2"></i>
                      Thêm nhân viên mới
                    </h6>
                    <div className="list-group">
                      {storeStaff
                        .filter((staff) => {
                          const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                          return !assignedIds.includes(staff.id);
                        })
                        .map((staff) => {
                          const currentCount = selectedShift.assignments?.length || 0;
                          const requiredSlots = selectedShift.requiredSlots || 1;
                          const isSelected = selectedUserIds.includes(staff.id);
                          const newUserIds = selectedUserIds.filter(id => {
                            const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                            return !assignedIds.includes(id);
                          });
                          const newCount = newUserIds.length;
                          // Disable nếu đã đủ người và checkbox này chưa được chọn
                          const isDisabled = currentCount >= requiredSlots && !isSelected;
                          
                          return (
                            <label
                              key={staff.id}
                              className={`list-group-item list-group-item-action d-flex align-items-center ${isDisabled ? 'opacity-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input me-3"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Kiểm tra trước khi thêm
                                    if (currentCount + newCount >= requiredSlots) {
                                      setToast({ 
                                        show: true, 
                                        message: `Ca này chỉ cần ${requiredSlots} người. Không thể thêm thêm nhân viên.`, 
                                        type: 'warning' 
                                      });
                                      return;
                                    }
                                    setSelectedUserIds([...selectedUserIds, staff.id]);
                                  } else {
                                    setSelectedUserIds(selectedUserIds.filter((id) => id !== staff.id));
                                  }
                                }}
                              />
                              <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                              <div>
                                <strong>{staff.fullName}</strong>
                                <br />
                                <small className="text-muted">{staff.email}</small>
                              </div>
                            </label>
                          );
                        })}
                      {storeStaff.filter((staff) => {
                        const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                        return !assignedIds.includes(staff.id);
                      }).length === 0 && (
                        <p className="text-muted text-center py-3">
                          Tất cả nhân viên đã được phân công
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {storeStaff.length === 0 && (
                    <p className="text-muted text-center py-3">
                      Không có nhân viên nào tại cơ sở này
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-coffee"
                    onClick={handleAssignStaff}
                    disabled={(() => {
                      const currentCount = selectedShift.assignments?.length || 0;
                      const requiredSlots = selectedShift.requiredSlots || 1;
                      const newUserIds = selectedUserIds.filter(id => {
                        const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                        return !assignedIds.includes(id);
                      });
                      return newUserIds.length === 0 || currentCount >= requiredSlots;
                    })()}
                  >
                    Thêm nhân viên ({selectedUserIds.filter(id => {
                      const assignedIds = selectedShift.assignments?.map((a: any) => a.userId) || [];
                      return !assignedIds.includes(id);
                    }).length})
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* View Registrations and Approve Modal */}
      {showRegistrationsModal && selectedTemplate && selectedDate && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Danh sách đăng ký - {selectedTemplate.title} - {selectedDate.toLocaleDateString('vi-VN')}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowRegistrationsModal(false);
                      setSelectedTemplate(null);
                      setSelectedDate(null);
                      setTemplateRegistrations([]);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <p className="text-muted mb-2">
                      <strong>Thời gian:</strong> {selectedTemplate.startTime.substring(0, 5)} - {selectedTemplate.endTime.substring(0, 5)}
                    </p>
                    <p className="text-muted mb-2">
                      <strong>Số người cần:</strong> {selectedTemplate.requiredSlots || 1}
                    </p>
                    <p className="text-muted mb-0">
                      <strong>Số người đã đăng ký:</strong> {templateRegistrations.length}
                    </p>
                  </div>

                  {templateRegistrations.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Chưa có nhân viên nào đăng ký ca này.
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Chọn nhân viên để duyệt/chốt ca:</label>
                        <div className="list-group">
                          {templateRegistrations.map((reg: ShiftRegistration) => {
                            const staff = users.find((u) => u.id === reg.userId);
                            if (!staff) return null;
                            const isSelected = selectedUserIds.includes(reg.userId);
                            
                            return (
                              <label
                                key={reg.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center ${isSelected ? 'active' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input me-3"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Check if adding would exceed required slots
                                      const currentSelected = selectedUserIds.length;
                                      const requiredSlots = selectedTemplate.requiredSlots || 1;
                                      if (currentSelected >= requiredSlots) {
                                        setToast({
                                          show: true,
                                          message: `Ca này chỉ cần ${requiredSlots} người. Vui lòng bỏ chọn một số người khác.`,
                                          type: 'warning'
                                        });
                                        return;
                                      }
                                      setSelectedUserIds([...selectedUserIds, reg.userId]);
                                    } else {
                                      setSelectedUserIds(selectedUserIds.filter((id) => id !== reg.userId));
                                    }
                                  }}
                                />
                                <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                                <div className="flex-grow-1">
                                  <strong>{staff.fullName}</strong>
                                  <br />
                                  <small className="text-muted">{staff.email}</small>
                                  <br />
                                  <small className="text-muted">
                                    Đăng ký lúc: {new Date(reg.registeredAt).toLocaleString('vi-VN')}
                                  </small>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="alert alert-warning">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Bạn đã chọn <strong>{selectedUserIds.length}</strong> / <strong>{selectedTemplate.requiredSlots || 1}</strong> người.
                        {selectedUserIds.length < (selectedTemplate.requiredSlots || 1) && (
                          <span className="ms-2">Vui lòng chọn đủ số người cần trước khi chốt ca.</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRegistrationsModal(false);
                      setSelectedTemplate(null);
                      setSelectedDate(null);
                      setTemplateRegistrations([]);
                      setSelectedUserIds([]);
                    }}
                  >
                    Hủy
                  </button>
                  {templateRegistrations.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-coffee"
                      onClick={() => handleApproveAndCreateShift(selectedUserIds)}
                      disabled={selectedUserIds.length === 0 || selectedUserIds.length !== (selectedTemplate.requiredSlots || 1)}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Chốt ca ({selectedUserIds.length}/{selectedTemplate.requiredSlots || 1})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Create Shift Template Modal */}
      {showCreateShiftModal && selectedDay && selectedShiftType && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content modal-coffee">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Tạo ca mẫu - {getDayName(selectedDay)} - {selectedShiftType === 'MORNING' ? 'Ca sáng' : selectedShiftType === 'AFTERNOON' ? 'Ca chiều' : 'Ca tối'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowCreateShiftModal(false);
                      setSelectedDay(null);
                      setSelectedShiftType(null);
                    }}
                  ></button>
                </div>
                <form onSubmit={handleCreateShiftTemplate}>
                  <div className="modal-body">
                    <div className="alert alert-info mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Lưu ý:</strong> Đây là ca mẫu cho nhân viên đăng ký. Ca mẫu sẽ hiển thị cho tất cả các tuần. 
                      Mỗi tuần quản lý cần chốt ca riêng biệt để tạo ca thực tế cho tuần đó.
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Tên ca *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shiftTemplateForm.title}
                        onChange={(e) =>
                          setShiftTemplateForm({ ...shiftTemplateForm, title: e.target.value })
                        }
                        placeholder="VD: Ca sáng, Ca chiều..."
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian bắt đầu *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={shiftTemplateForm.startTime}
                        onChange={(e) =>
                          setShiftTemplateForm({ ...shiftTemplateForm, startTime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Thời gian kết thúc *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={shiftTemplateForm.endTime}
                        onChange={(e) =>
                          setShiftTemplateForm({ ...shiftTemplateForm, endTime: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Số nhân viên cần *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={shiftTemplateForm.requiredSlots}
                        onChange={(e) =>
                          setShiftTemplateForm({ ...shiftTemplateForm, requiredSlots: Number(e.target.value) })
                        }
                        min="1"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={shiftTemplateForm.notes || ''}
                        onChange={(e) =>
                          setShiftTemplateForm({ ...shiftTemplateForm, notes: e.target.value })
                        }
                        placeholder="Nhập ghi chú cho ca làm này..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateShiftModal(false);
                        setSelectedDay(null);
                        setSelectedShiftType(null);
                      }}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-coffee">
                      Xác nhận
                    </button>
                  </div>
                </form>
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

      <ConfirmModal
        show={confirmDelete !== null}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa ca làm này?"
        confirmText="Xóa"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Shifts;

