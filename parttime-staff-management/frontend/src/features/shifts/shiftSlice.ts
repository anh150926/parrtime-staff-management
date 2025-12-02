import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shiftService, { Shift, CreateShiftRequest, AssignShiftRequest } from '../../api/shiftService';

interface ShiftState {
  shifts: Shift[];
  myShifts: Shift[];
  selectedShift: Shift | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShiftState = {
  shifts: [],
  myShifts: [],
  selectedShift: null,
  loading: false,
  error: null,
};

export const fetchShiftsByStore = createAsyncThunk(
  'shifts/fetchByStore',
  async ({ storeId, startDate, endDate }: { storeId: number; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const response = await shiftService.getByStore(storeId, startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shifts');
    }
  }
);

export const fetchMyShifts = createAsyncThunk(
  'shifts/fetchMyShifts',
  async (startDate: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await shiftService.getMyShifts(startDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shifts');
    }
  }
);

export const createShift = createAsyncThunk(
  'shifts/create',
  async ({ storeId, data }: { storeId: number; data: CreateShiftRequest }, { rejectWithValue }) => {
    try {
      const response = await shiftService.create(storeId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create shift');
    }
  }
);

export const updateShift = createAsyncThunk(
  'shifts/update',
  async ({ id, data }: { id: number; data: CreateShiftRequest }, { rejectWithValue }) => {
    try {
      const response = await shiftService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update shift');
    }
  }
);

export const deleteShift = createAsyncThunk(
  'shifts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await shiftService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete shift');
    }
  }
);

export const assignStaffToShift = createAsyncThunk(
  'shifts/assignStaff',
  async ({ shiftId, data }: { shiftId: number; data: AssignShiftRequest }, { rejectWithValue }) => {
    try {
      const response = await shiftService.assignStaff(shiftId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign staff');
    }
  }
);

export const updateShiftAssignment = createAsyncThunk(
  'shifts/updateAssignment',
  async ({ shiftId, status }: { shiftId: number; status: 'CONFIRMED' | 'DECLINED' }, { rejectWithValue }) => {
    try {
      const response = await shiftService.updateAssignment(shiftId, status);
      return { shiftId, assignment: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update assignment');
    }
  }
);

const shiftSlice = createSlice({
  name: 'shifts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedShift: (state) => {
      state.selectedShift = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShiftsByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftsByStore.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = action.payload;
      })
      .addCase(fetchShiftsByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyShifts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.myShifts = action.payload;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.shifts.push(action.payload);
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.shifts = state.shifts.filter((s) => s.id !== action.payload);
      })
      .addCase(assignStaffToShift.fulfilled, (state, action) => {
        const index = state.shifts.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearSelectedShift } = shiftSlice.actions;
export default shiftSlice.reducer;

