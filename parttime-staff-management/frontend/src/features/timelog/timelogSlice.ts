import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timeLogService, { TimeLog } from '../../api/timeLogService';

interface TimeLogState {
  timeLogs: TimeLog[];
  currentCheckIn: TimeLog | null;
  loading: boolean;
  error: string | null;
}

const initialState: TimeLogState = {
  timeLogs: [],
  currentCheckIn: null,
  loading: false,
  error: null,
};

export const fetchTimeLogsByUser = createAsyncThunk(
  'timelog/fetchByUser',
  async ({ userId, startDate, endDate }: { userId: number; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const response = await timeLogService.getByUser(userId, startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time logs');
    }
  }
);

export const fetchCurrentCheckIn = createAsyncThunk(
  'timelog/fetchCurrentCheckIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timeLogService.getCurrentCheckIn();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch check-in status');
    }
  }
);

export const checkIn = createAsyncThunk(
  'timelog/checkIn',
  async (shiftId: number | undefined, { rejectWithValue }) => {
    try {
      const response = await timeLogService.checkIn(shiftId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'timelog/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timeLogService.checkOut();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

const timelogSlice = createSlice({
  name: 'timelog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimeLogsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeLogsByUser.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs = action.payload;
      })
      .addCase(fetchTimeLogsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentCheckIn.fulfilled, (state, action) => {
        state.currentCheckIn = action.payload;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.currentCheckIn = action.payload;
      })
      .addCase(checkOut.fulfilled, (state) => {
        state.currentCheckIn = null;
      });
  },
});

export const { clearError } = timelogSlice.actions;
export default timelogSlice.reducer;








