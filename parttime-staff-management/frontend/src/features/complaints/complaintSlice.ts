import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import complaintService, { 
  Complaint, 
  CreateComplaintRequest, 
  RespondComplaintRequest 
} from '../../api/complaintService';

interface ComplaintState {
  complaints: Complaint[];
  myComplaints: Complaint[];
  pendingComplaints: Complaint[];
  selectedComplaint: Complaint | null;
  pendingCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ComplaintState = {
  complaints: [],
  myComplaints: [],
  pendingComplaints: [],
  selectedComplaint: null,
  pendingCount: 0,
  loading: false,
  error: null,
};

// Thunks
export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (data: CreateComplaintRequest, { rejectWithValue }) => {
    try {
      const response = await complaintService.createComplaint(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create complaint');
    }
  }
);

export const fetchMyComplaints = createAsyncThunk(
  'complaints/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complaintService.getMyComplaints();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchComplaintsByStore = createAsyncThunk(
  'complaints/fetchByStore',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await complaintService.getComplaintsByStore(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchAllComplaints = createAsyncThunk(
  'complaints/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complaintService.getAllComplaints();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
    }
  }
);

export const fetchPendingComplaints = createAsyncThunk(
  'complaints/fetchPending',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await complaintService.getPendingComplaints(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending complaints');
    }
  }
);

export const fetchAllPendingComplaints = createAsyncThunk(
  'complaints/fetchAllPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await complaintService.getAllPendingComplaints();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending complaints');
    }
  }
);

export const respondToComplaint = createAsyncThunk(
  'complaints/respond',
  async ({ id, data }: { id: number; data: RespondComplaintRequest }, { rejectWithValue }) => {
    try {
      const response = await complaintService.respondToComplaint(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to complaint');
    }
  }
);

export const fetchPendingCount = createAsyncThunk(
  'complaints/fetchPendingCount',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await complaintService.getPendingCount(storeId);
      return response.data.count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch count');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedComplaint: (state, action: PayloadAction<Complaint | null>) => {
      state.selectedComplaint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create complaint
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        state.loading = false;
        state.myComplaints.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my complaints
      .addCase(fetchMyComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.loading = false;
        state.myComplaints = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.myComplaints = [];
      })
      // Fetch by store
      .addCase(fetchComplaintsByStore.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.complaints = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch all
      .addCase(fetchAllComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.complaints = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch pending
      .addCase(fetchPendingComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.pendingComplaints = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllPendingComplaints.fulfilled, (state, action: PayloadAction<Complaint[]>) => {
        state.pendingComplaints = Array.isArray(action.payload) ? action.payload : [];
      })
      // Respond
      .addCase(respondToComplaint.fulfilled, (state, action: PayloadAction<Complaint>) => {
        const index = state.complaints.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
        state.pendingComplaints = state.pendingComplaints.filter(c => c.id !== action.payload.id);
      })
      // Pending count
      .addCase(fetchPendingCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.pendingCount = action.payload;
      });
  },
});

export const { clearError, setSelectedComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;



