import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import payrollService, { Payroll, UpdatePayrollRequest } from '../../api/payrollService';

interface PayrollState {
  payrolls: Payroll[];
  myPayrollHistory: Payroll[];
  selectedPayroll: Payroll | null;
  loading: boolean;
  error: string | null;
}

const initialState: PayrollState = {
  payrolls: [],
  myPayrollHistory: [],
  selectedPayroll: null,
  loading: false,
  error: null,
};

export const generatePayroll = createAsyncThunk(
  'payroll/generate',
  async ({ month, storeId }: { month: string; storeId?: number }, { rejectWithValue }) => {
    try {
      const response = await payrollService.generate(month, storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate payroll');
    }
  }
);

export const fetchPayrollsByMonth = createAsyncThunk(
  'payroll/fetchByMonth',
  async (month: string, { rejectWithValue }) => {
    try {
      const response = await payrollService.getByMonth(month);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payrolls');
    }
  }
);

export const fetchPayrollsByStoreAndMonth = createAsyncThunk(
  'payroll/fetchByStoreAndMonth',
  async ({ storeId, month }: { storeId: number; month: string }, { rejectWithValue }) => {
    try {
      const response = await payrollService.getByStoreAndMonth(storeId, month);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payrolls');
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'payroll/update',
  async ({ id, data }: { id: number; data: UpdatePayrollRequest }, { rejectWithValue }) => {
    try {
      const response = await payrollService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payroll');
    }
  }
);

export const fetchMyPayrollHistory = createAsyncThunk(
  'payroll/fetchMyHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await payrollService.getMyHistory();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll history');
    }
  }
);

export const batchApprovePayrolls = createAsyncThunk(
  'payroll/batchApprove',
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await payrollService.batchApprove(ids);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch approve payrolls');
    }
  }
);

export const batchMarkPaidPayrolls = createAsyncThunk(
  'payroll/batchMarkPaid',
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await payrollService.batchMarkPaid(ids);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch mark payrolls as paid');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPayroll: (state, action) => {
      state.selectedPayroll = action.payload;
    },
    clearSelectedPayroll: (state) => {
      state.selectedPayroll = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate payroll
      .addCase(generatePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by month
      .addCase(fetchPayrollsByMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollsByMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrollsByMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by store and month
      .addCase(fetchPayrollsByStoreAndMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollsByStoreAndMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrollsByStoreAndMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update payroll
      .addCase(updatePayroll.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payrolls.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
      })
      .addCase(updatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my history
      .addCase(fetchMyPayrollHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayrollHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.myPayrollHistory = action.payload;
      })
      .addCase(fetchMyPayrollHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Batch approve
      .addCase(batchApprovePayrolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(batchApprovePayrolls.fulfilled, (state, action) => {
        state.loading = false;
        // Update statuses in current payrolls
        action.payload.forEach((updated) => {
          const index = state.payrolls.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            state.payrolls[index] = updated;
          }
        });
      })
      .addCase(batchApprovePayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Batch mark paid
      .addCase(batchMarkPaidPayrolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(batchMarkPaidPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((updated) => {
          const index = state.payrolls.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            state.payrolls[index] = updated;
          }
        });
      })
      .addCase(batchMarkPaidPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedPayroll, clearSelectedPayroll } = payrollSlice.actions;
export default payrollSlice.reducer;
