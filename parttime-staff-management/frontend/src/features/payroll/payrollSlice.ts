import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import payrollService, { Payroll, UpdatePayrollRequest } from '../../api/payrollService';

interface PayrollState {
  payrolls: Payroll[];
  selectedPayroll: Payroll | null;
  loading: boolean;
  error: string | null;
}

const initialState: PayrollState = {
  payrolls: [],
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

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchPayrollsByMonth.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPayrollsByMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrollsByStoreAndMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payrolls.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
      });
  },
});

export const { clearError } = payrollSlice.actions;
export default payrollSlice.reducer;








