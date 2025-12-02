import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requestService, { Request, CreateRequestRequest, ReviewRequestRequest } from '../../api/requestService';

interface RequestState {
  requests: Request[];
  selectedRequest: Request | null;
  pendingCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  selectedRequest: null,
  pendingCount: 0,
  loading: false,
  error: null,
};

export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  async (status: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await requestService.getAll(status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const fetchPendingCount = createAsyncThunk(
  'requests/fetchPendingCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestService.getPendingCount();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending count');
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (data: CreateRequestRequest, { rejectWithValue }) => {
    try {
      const response = await requestService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request');
    }
  }
);

export const reviewRequest = createAsyncThunk(
  'requests/review',
  async ({ id, data }: { id: number; data: ReviewRequestRequest }, { rejectWithValue }) => {
    try {
      const response = await requestService.review(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review request');
    }
  }
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(reviewRequest.fulfilled, (state, action) => {
        const index = state.requests.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
        if (action.payload.status !== 'PENDING') {
          state.pendingCount = Math.max(0, state.pendingCount - 1);
        }
      });
  },
});

export const { clearError, clearSelectedRequest } = requestSlice.actions;
export default requestSlice.reducer;

