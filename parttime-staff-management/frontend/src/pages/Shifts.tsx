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

  // Disable template-based recurring shifts so each created shift only applies to the selected day/week
  const ENABLE_TEMPLATES = false;
  
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
    d.setHours(0, 0, 0, 0); // Reset to midnight to avoid timezone issues
    const day = d.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    // Calculate days to subtract to get to Monday
    // If day is 0 (Sunday), subtract 6 days to get Monday
    // If day is 1 (Monday), subtract 0 days
    // If day is 2 (Tuesday), subtract 1 day
    // etc.
    const daysToSubtract = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - daysToSubtract);
    return d;
  }

  function formatDate(date: Date): string {
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      loadShiftsForWeek();
    }
  }, [dispatch, selectedStoreId, weekStart]);

  const loadShiftsForWeek = async () => {
    if (!selectedStoreId) return;
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndDate = new Date(weekEnd);
      weekEndDate.setHours(23, 59, 59);
      
      // Format as local datetime string to avoid timezone conversion issues
      const formatDateTimeForAPI = (dt: Date): string => {
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        const seconds = String(dt.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };
      
      const startDateStr = formatDateTimeForAPI(weekStart);
      const endDateStr = formatDateTimeForAPI(weekEndDate);
      
      console.log('Loading shifts for week:', {
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEndDate),
        startDateStr,
        endDateStr,
        weekStartLocal: weekStart.toString(),
        weekEndLocal: weekEndDate.toString()
      });
      
      const result = await dispatch(fetchShiftsByStore({ 
        storeId: selectedStoreId,
        startDate: startDateStr,
        endDate: endDateStr
      })).unwrap();
      
      console.log('Shifts loaded:', {
        count: result?.length || shifts.length,
        shifts: result || shifts
      });
    } catch (error: any) {
      console.error('Failed to load shifts:', error);
    }
  };

  const loadTemplates = async () => {
    if (!ENABLE_TEMPLATES) {
      setTemplates([]);
      return;
    }
    if (!selectedStoreId) return;
    try {
      const response = await shiftRegistrationService.getShiftTemplates(selectedStoreId);
      setTemplates(response.data || []);
    } catch (error: any) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRegistrations = async () => {
    if (!ENABLE_TEMPLATES) {
      setRegistrations([]);
      setFinalizedShifts(new Set());
      return;
    }
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
    // Load shifts for current week when weekStart or selectedStoreId changes
    if (selectedStoreId) {
      loadShiftsForWeek();
    }
  }, [weekStart, selectedStoreId]);

  const storeStaff = users.filter(
    (u) => u.role === 'STAFF' && u.storeId === selectedStoreId
  );

  // Owner chỉ được xem, không được tác động
  const isOwner = currentUser?.role === 'OWNER';
  const canModify = !isOwner; // Manager và Staff có thể thực hiện các thao tác

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
    if (!selectedStoreId || !selectedDay || !selectedShiftType) {
      console.error('Missing required data:', { selectedStoreId, selectedDay, selectedShiftType });
      return;
    }

    try {
      // Tính toán ngày cụ thể trong tuần đang xem
      const date = getDateForDay(selectedDay);
      const dateStr = formatDate(date);
      
      console.log('=== Creating Shift ===', {
        selectedDay,
        selectedShiftType,
        dayName: getDayName(selectedDay),
        calculatedDate: dateStr,
        weekStart: formatDate(weekStart),
        dateObject: date.toString()
      });
      
      // Parse thời gian từ form
      const [startHours, startMinutes] = shiftTemplateForm.startTime.split(':').map(Number);
      const [endHours, endMinutes] = shiftTemplateForm.endTime.split(':').map(Number);
      
      // Create date objects and set time in local timezone
      const startDatetime = new Date(date);
      startDatetime.setHours(startHours, startMinutes, 0, 0);
      
      const endDatetime = new Date(date);
      endDatetime.setHours(endHours, endMinutes, 0, 0);
      
      // Format datetime for API - use local time components to avoid timezone conversion
      const formatDateTimeForAPI = (dt: Date): string => {
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        // Format as local datetime without timezone (backend should handle as local time)
        return `${year}-${month}-${day}T${hours}:${minutes}:00`;
      };
      
      const startDatetimeStr = formatDateTimeForAPI(startDatetime);
      const endDatetimeStr = formatDateTimeForAPI(endDatetime);
      
      console.log('Shift data to send:', {
        title: shiftTemplateForm.title,
        startDatetime: startDatetimeStr,
        endDatetime: endDatetimeStr,
        requiredSlots: shiftTemplateForm.requiredSlots || 1,
        startDatetimeLocal: startDatetime.toString(),
        endDatetimeLocal: endDatetime.toString()
      });
      
      // Tạo ca thực tế (không phải template) cho ngày cụ thể
      const result = await dispatch(createShift({
        storeId: selectedStoreId,
        data: {
          title: shiftTemplateForm.title,
          startDatetime: startDatetimeStr,
          endDatetime: endDatetimeStr,
          requiredSlots: shiftTemplateForm.requiredSlots || 1
        }
      })).unwrap();
      
      console.log('Shift created successfully:', result);
      
      setToast({ show: true, message: 'Tạo ca thành công!', type: 'success' });
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
      console.log('Refreshing shifts for week...');
      await loadShiftsForWeek();
      console.log('Shifts refreshed. Current shifts:', shifts.length);
    } catch (error: any) {
      console.error('Error creating shift:', error);
      setToast({ 
        show: true, 
        message: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo ca!', 
        type: 'error' 
      });
    }
  };

  const getDateForDay = (dayOfWeek: number): Date => {
    const date = new Date(weekStart);
    // dayOfWeek: 1=Monday, 2=Tuesday, ..., 7=Sunday
    // weekStart is Monday, so:
    // dayOfWeek=1 (Monday) → diff=0
    // dayOfWeek=2 (Tuesday) → diff=1
    // ...
    // dayOfWeek=7 (Sunday) → diff=6
    const diff = dayOfWeek - 1;
    date.setDate(date.getDate() + diff);
    // Debug log for Monday and Sunday
    if (dayOfWeek === 1 || dayOfWeek === 7) {
      console.log('getDateForDay:', {
        dayOfWeek,
        dayName: getDayName(dayOfWeek),
        weekStart: formatDate(weekStart),
        calculatedDate: formatDate(date),
        diff
      });
    }
    return date;
  };

  const getShiftsForDayAndType = (day: number, shiftType: string) => {
    const date = getDateForDay(day);
    const dateStr = formatDate(date);
    
    // Debug log for Monday and Sunday
    if (day === 1 || day === 7) {
      console.log('getShiftsForDayAndType called:', {
        day,
        dayName: getDayName(day),
        shiftType,
        expectedDate: dateStr,
        totalShifts: shifts.length
      });
    }
    
    const filtered = shifts.filter((shift: any) => {
      // Parse shift datetime - backend returns LocalDateTime as ISO string without timezone
      // When parsing, we need to treat it as local time, not UTC
      let shiftDate: Date;
      if (shift.startDatetime.includes('T') && !shift.startDatetime.includes('Z') && !shift.startDatetime.includes('+') && !shift.startDatetime.includes('-', 10)) {
        // LocalDateTime format: "2024-12-04T08:00:00" - parse as local time
        const [datePart, timePart] = shift.startDatetime.split('T');
        const [year, month, dayNum] = datePart.split('-').map(Number);
        const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
        shiftDate = new Date(year, month - 1, dayNum, hours, minutes, seconds);
      } else {
        // Fallback to standard Date parsing
        shiftDate = new Date(shift.startDatetime);
      }
      
      const shiftDateStr = formatDate(shiftDate);
      
      // Check if shift is on this day (compare date strings)
      if (shiftDateStr !== dateStr) {
        // Debug log for Monday and Sunday
        if ((day === 1 || day === 7) && (shiftType === 'MORNING' || shiftType === 'EVENING')) {
          console.log('Shift filtered out by date:', {
            shiftId: shift.id,
            shiftTitle: shift.title,
            shiftStartDatetime: shift.startDatetime,
            shiftDateStr,
            expectedDateStr: dateStr,
            day,
            dayName: getDayName(day),
            shiftType
          });
        }
        return false;
      }
      
      // Check if shift type matches (based on time ranges)
      // Use local hours to avoid timezone issues
      const shiftHour = shiftDate.getHours();
      let matchesType = false;
      if (shiftType === 'MORNING' && shiftHour >= 6 && shiftHour < 12) matchesType = true;
      if (shiftType === 'AFTERNOON' && shiftHour >= 12 && shiftHour < 17) matchesType = true;
      if (shiftType === 'EVENING' && shiftHour >= 17 && shiftHour < 23) matchesType = true;
      
      // Debug log for Monday and Sunday
      if ((day === 1 || day === 7) && (shiftType === 'MORNING' || shiftType === 'EVENING')) {
        console.log('Shift type check:', {
          shiftId: shift.id,
          shiftTitle: shift.title,
          shiftStartDatetime: shift.startDatetime,
          shiftHour,
          shiftType,
          matchesType,
          shiftDateStr,
          expectedDateStr: dateStr
        });
      }
      
      return matchesType;
    });
    
    // Debug log for Monday and Sunday
    if (day === 1 || day === 7) {
      console.log('getShiftsForDayAndType result:', {
        day,
        dayName: getDayName(day),
        shiftType,
        expectedDate: dateStr,
        foundShifts: filtered.length,
        shiftIds: filtered.map((s: any) => s.id)
      });
    }
    
    return filtered;
  };

  const getTemplatesForDayAndType = (day: number, shiftType: string): ShiftTemplate[] => {
    if (!ENABLE_TEMPLATES) return [];
    return templates.filter((template: ShiftTemplate) => {
      return template.dayOfWeek === day && template.shiftType === shiftType;
    });
  };

  const getRegistrationsForTemplateAndDate = (templateId: number, date: Date): ShiftRegistration[] => {
    if (!ENABLE_TEMPLATES) return [];
    const dateStr = formatDate(date);
    return registrations.filter((reg: ShiftRegistration) => {
      return reg.shiftId === templateId && reg.registrationDate === dateStr && reg.status === 'REGISTERED';
    });
  };

  const handleOpenRegistrationsModal = async (template: ShiftTemplate, day: number) => {
    if (!ENABLE_TEMPLATES) return;
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
    if (!ENABLE_TEMPLATES) return;
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
    // Chỉ chọn những nhân viên đã được xác nhận (CONFIRMED) để giữ trạng thái
    const confirmedIds = shift.assignments?.filter((a: any) => a.status === 'CONFIRMED').map((a: any) => a.userId) || [];
    setSelectedUserIds(confirmedIds);
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
        await loadShiftsForWeek();
      }
    } catch (err: any) {
      setToast({ show: true, message: err?.response?.data?.message || err?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedShift) return;
    
    try {
      // Lấy danh sách nhân viên đã được xác nhận (CONFIRMED)
      const confirmedIds = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').map((a: any) => a.userId) || [];
      const currentConfirmedCount = confirmedIds.length;
      // Lấy danh sách nhân viên được chọn nhưng chưa được xác nhận
      const newUserIds = selectedUserIds.filter(id => !confirmedIds.includes(id));
      const requiredSlots = selectedShift.requiredSlots || 1;
      const remainingSlots = requiredSlots - currentConfirmedCount;
      
      // Kiểm tra xem đã chọn đúng số người còn thiếu chưa (hoặc ít nhất 1 người nếu còn thiếu)
      if (remainingSlots > 0 && newUserIds.length === 0) {
        setToast({ 
          show: true, 
          message: `Ca này còn thiếu ${remainingSlots} người. Vui lòng chọn ít nhất 1 người để xác nhận.`, 
          type: 'warning' 
        });
        return;
      }
      
      // Kiểm tra không được chọn quá số người còn thiếu
      if (remainingSlots > 0 && newUserIds.length > remainingSlots) {
        setToast({ 
          show: true, 
          message: `Ca này còn thiếu ${remainingSlots} người. Bạn đã chọn ${newUserIds.length} người. Vui lòng chọn đúng số người còn thiếu.`, 
          type: 'warning' 
        });
        return;
      }
      
      if (newUserIds.length > 0) {
        await dispatch(
          assignStaffToShift({ shiftId: selectedShift.id, data: { userIds: newUserIds } })
        ).unwrap();
        
        // Đếm số người bị từ chối
        const allRegisteredIds = selectedShift.assignments?.filter((a: any) => a.status === 'ASSIGNED').map((a: any) => a.userId) || [];
        const declinedCount = allRegisteredIds.filter((id: number) => !newUserIds.includes(id)).length;
        
        let message = `Xác nhận phân công ${newUserIds.length} nhân viên thành công!`;
        if (declinedCount > 0) {
          message += ` ${declinedCount} nhân viên không được chọn đã nhận thông báo từ chối.`;
        }
        
        setToast({ show: true, message: message, type: 'success' });
      } else {
        setToast({ show: true, message: 'Không có nhân viên nào được chọn!', type: 'info' });
      }
      
      // Refresh shifts
      if (selectedStoreId) {
        await loadShiftsForWeek();
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
        await loadShiftsForWeek();
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
      // Refresh shifts after delete
      if (selectedStoreId) {
        await loadShiftsForWeek();
      }
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
    if (!ENABLE_TEMPLATES) return;
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
          <h2 className="mb-1">Quản lý ca làm việc</h2>
          <p className="text-muted mb-0">
            Tạo và quản lý ca làm việc cho từng tuần. Mỗi ca chỉ áp dụng cho ngày cụ thể trong tuần đang xem.
          </p>
        </div>
      </div>

      <div className="alert alert-info mb-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Lưu ý:</strong> Mỗi ca được tạo chỉ áp dụng cho ngày cụ thể trong tuần đang xem. Để tạo ca cho các tuần khác, 
        vui lòng chuyển sang tuần đó và tạo ca mới.
      </div>

      {isOwner && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-eye me-2"></i>
          <strong>Chế độ xem:</strong> Với vai trò Chủ sở hữu, bạn chỉ có thể xem lịch làm việc. Các thao tác tạo, sửa, xóa ca làm do Quản lý thực hiện.
        </div>
      )}

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
                        const dayShifts = getShiftsForDayAndType(day, shiftType);
                        
                        return (
                          <td key={day} className="text-center align-middle" style={{ verticalAlign: 'top' }}>
                            {dayShifts.map((shift: any) => {
                              const assignedCount = shift.assignments?.length || 0;
                              const requiredSlots = shift.requiredSlots || 1;
                              
                              return (
                                <div key={shift.id} className="mb-2 p-2 border rounded bg-light">
                                  <div className="small fw-bold mb-1">{shift.title}</div>
                                  <div className="small text-muted mb-1">
                                    {formatTime(shift.startDatetime)} - {formatTime(shift.endDatetime)}
                                  </div>
                                  <div className="small mb-1">
                                    <span className={`badge ${assignedCount >= requiredSlots ? 'bg-success' : assignedCount > 0 ? 'bg-warning' : 'bg-secondary'}`}>
                                      {assignedCount}/{requiredSlots} người
                                    </span>
                                  </div>
                                  <div className="d-flex gap-1 mt-1">
                                    <button
                                      className="btn btn-sm btn-outline-primary flex-grow-1"
                                      onClick={() => handleOpenAssignModal(shift)}
                                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                      title="Phân công nhân viên"
                                    >
                                      <i className="bi bi-people"></i>
                                    </button>
                                    {canModify && (
                                      <>
                                        <button
                                          className="btn btn-sm btn-outline-info flex-grow-1"
                                          onClick={() => handleOpenEditModal(shift)}
                                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                          title="Sửa ca"
                                        >
                                          <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-danger flex-grow-1"
                                          onClick={() => setConfirmDelete(shift.id)}
                                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                                          title="Xóa ca"
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {dayShifts.length === 0 && canModify && (
                              <button
                                className="btn btn-sm btn-outline-secondary w-100"
                                onClick={() => handleOpenCreateShiftModal(day, shiftType as 'MORNING' | 'AFTERNOON' | 'EVENING')}
                                style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                              >
                                <i className="bi bi-plus-circle me-1"></i>
                                Tạo ca
                              </button>
                            )}
                            {dayShifts.length === 0 && isOwner && (
                              <span className="text-muted small">
                                <i className="bi bi-dash-circle me-1"></i>
                                Chưa có ca
                              </span>
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
                  
                  {/* Danh sách nhân viên đã được phân công (CONFIRMED) */}
                  {selectedShift.assignments && selectedShift.assignments.filter((a: any) => a.status === 'CONFIRMED').length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-2">
                        <i className="bi bi-people-fill me-2"></i>
                        Nhân viên đã được phân công ({selectedShift.assignments.filter((a: any) => a.status === 'CONFIRMED').length})
                      </h6>
                      <div className="list-group">
                        {selectedShift.assignments
                          .filter((a: any) => a.status === 'CONFIRMED')
                          .map((assignment: any) => {
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
                                    <small className="text-success">
                                      ✓ Đã xác nhận
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

                  {/* Danh sách nhân viên đã đăng ký (ASSIGNED) - chờ quản lý xác nhận */}
                  <div>
                    {(() => {
                      const currentConfirmedCount = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').length || 0;
                      const requiredSlots = selectedShift.requiredSlots || 1;
                      const remainingSlots = requiredSlots - currentConfirmedCount;
                      
                      return (
                        <>
                          <h6 className="mb-2">
                            <i className="bi bi-person-plus me-2"></i>
                            Nhân viên đã đăng ký - Chọn {remainingSlots > 0 ? remainingSlots : 0} người để xác nhận phân công
                          </h6>
                          <div className="alert alert-info mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Lưu ý:</strong> Ca này cần <strong>{requiredSlots} người</strong>. 
                            Hiện đã có <strong>{currentConfirmedCount} người</strong> được xác nhận. 
                            {remainingSlots > 0 ? (
                              <>Cần thêm <strong>{remainingSlots} người</strong>. Vui lòng chọn {remainingSlots} người từ danh sách đăng ký. Những người không được chọn sẽ tự động bị từ chối.</>
                            ) : (
                              <>Ca này đã đủ người. Bạn vẫn có thể thay đổi phân công nếu cần.</>
                            )}
                          </div>
                        </>
                      );
                    })()}
                    {(() => {
                      // Lấy danh sách nhân viên đã đăng ký (có assignment với status ASSIGNED)
                      const registeredStaff = selectedShift.assignments
                        ?.filter((a: any) => a.status === 'ASSIGNED')
                        .map((a: any) => {
                          const staff = storeStaff.find((s) => s.id === a.userId);
                          return staff ? { ...staff, assignmentId: a.id } : null;
                        })
                        .filter((s: any) => s !== null) || [];

                      if (registeredStaff.length === 0) {
                        return (
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Chưa có nhân viên nào đăng ký ca này.
                          </div>
                        );
                      }

                      return (
                        <div className="list-group">
                          {registeredStaff.map((staff: any) => {
                            const currentConfirmedCount = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').length || 0;
                            const requiredSlots = selectedShift.requiredSlots || 1;
                            const remainingSlots = requiredSlots - currentConfirmedCount;
                            const isSelected = selectedUserIds.includes(staff.id);
                            const newUserIds = selectedUserIds.filter(id => {
                              const confirmedIds = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').map((a: any) => a.userId) || [];
                              return !confirmedIds.includes(id);
                            });
                            const newCount = newUserIds.length;
                            // Disable nếu đã đủ người và checkbox này chưa được chọn
                            const isDisabled = remainingSlots <= 0 && !isSelected;
                            
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
                                      // Kiểm tra trước khi thêm - không cho phép chọn quá số người còn thiếu
                                      if (newCount + 1 > remainingSlots) {
                                        setToast({ 
                                          show: true, 
                                          message: `Ca này còn thiếu ${remainingSlots} người. Bạn đã chọn ${newCount} người. Vui lòng bỏ chọn một số người trước khi chọn thêm.`, 
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
                                  <br />
                                  <small className="text-info">
                                    <i className="bi bi-clock-history me-1"></i>
                                    Đã đăng ký
                                  </small>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Danh sách nhân viên đã từ chối (DECLINED) - chỉ hiển thị thông tin */}
                  {selectedShift.assignments && selectedShift.assignments.filter((a: any) => a.status === 'DECLINED').length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-2">
                        <i className="bi bi-x-circle me-2"></i>
                        Nhân viên đã từ chối ({selectedShift.assignments.filter((a: any) => a.status === 'DECLINED').length})
                      </h6>
                      <div className="list-group">
                        {selectedShift.assignments
                          .filter((a: any) => a.status === 'DECLINED')
                          .map((assignment: any) => {
                            const staff = storeStaff.find((s) => s.id === assignment.userId);
                            if (!staff) return null;
                            return (
                              <div
                                key={assignment.id}
                                className="list-group-item d-flex align-items-center"
                              >
                                <div className="avatar me-2">{staff.fullName.charAt(0)}</div>
                                <div>
                                  <strong>{staff.fullName}</strong>
                                  <br />
                                  <small className="text-danger">
                                    ✗ Đã từ chối
                                  </small>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  
                  {storeStaff.length === 0 && (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Không có nhân viên nào tại cơ sở này
                    </div>
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
                      const currentConfirmedCount = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').length || 0;
                      const requiredSlots = selectedShift.requiredSlots || 1;
                      const remainingSlots = requiredSlots - currentConfirmedCount;
                      const newUserIds = selectedUserIds.filter(id => {
                        const confirmedIds = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').map((a: any) => a.userId) || [];
                        return !confirmedIds.includes(id);
                      });
                      // Cho phép xác nhận khi:
                      // - Còn thiếu người và đã chọn ít nhất 1 người (không quá số người còn thiếu)
                      // - Hoặc đã đủ người nhưng muốn thay đổi phân công
                      if (remainingSlots > 0) {
                        return newUserIds.length === 0 || newUserIds.length > remainingSlots;
                      }
                      // Nếu đã đủ người, vẫn cho phép xác nhận để thay đổi phân công
                      return newUserIds.length === 0;
                    })()}
                  >
                    Xác nhận phân công ({selectedUserIds.filter(id => {
                      const confirmedIds = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').map((a: any) => a.userId) || [];
                      return !confirmedIds.includes(id);
                    }).length}/{(() => {
                      const currentConfirmedCount = selectedShift.assignments?.filter((a: any) => a.status === 'CONFIRMED').length || 0;
                      const requiredSlots = selectedShift.requiredSlots || 1;
                      const remainingSlots = requiredSlots - currentConfirmedCount;
                      return remainingSlots > 0 ? remainingSlots : requiredSlots;
                    })()})
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* View Registrations and Approve Modal */}
      {ENABLE_TEMPLATES && showRegistrationsModal && selectedTemplate && selectedDate && (
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
                        <label className="form-label">
                          {isOwner ? 'Danh sách nhân viên đã đăng ký:' : 'Chọn nhân viên để duyệt/chốt ca:'}
                        </label>
                        <div className="list-group">
                          {templateRegistrations.map((reg: ShiftRegistration) => {
                            const staff = users.find((u) => u.id === reg.userId);
                            if (!staff) return null;
                            const isSelected = selectedUserIds.includes(reg.userId);
                            
                            return (
                              <label
                                key={reg.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center ${isSelected && !isOwner ? 'active' : ''}`}
                              >
                                {!isOwner && (
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
                                )}
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
                      {!isOwner && (
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Bạn đã chọn <strong>{selectedUserIds.length}</strong> / <strong>{selectedTemplate.requiredSlots || 1}</strong> người.
                          {selectedUserIds.length < (selectedTemplate.requiredSlots || 1) && (
                            <span className="ms-2">Vui lòng chọn đủ số người cần trước khi chốt ca.</span>
                          )}
                        </div>
                      )}
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
                    {isOwner ? 'Đóng' : 'Hủy'}
                  </button>
                  {templateRegistrations.length > 0 && canModify && (
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
                    Tạo ca - {getDayName(selectedDay)} {getDateForDay(selectedDay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {selectedShiftType === 'MORNING' ? 'Ca sáng' : selectedShiftType === 'AFTERNOON' ? 'Ca chiều' : 'Ca tối'}
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
                      <strong>Lưu ý:</strong> Ca này sẽ được tạo cho ngày <strong>{getDayName(selectedDay)} {getDateForDay(selectedDay).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong> trong tuần hiện tại.
                      Sau khi tạo, bạn có thể phân công nhân viên cho ca này.
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

