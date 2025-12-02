import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storeService, { Store, CreateStoreRequest, UpdateStoreRequest } from '../../api/storeService';

interface StoreState {
  stores: Store[];
  selectedStore: Store | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreState = {
  stores: [],
  selectedStore: null,
  loading: false,
  error: null,
};

export const fetchStores = createAsyncThunk(
  'stores/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await storeService.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stores');
    }
  }
);

export const fetchStoreById = createAsyncThunk(
  'stores/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await storeService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch store');
    }
  }
);

export const createStore = createAsyncThunk(
  'stores/create',
  async (data: CreateStoreRequest, { rejectWithValue }) => {
    try {
      const response = await storeService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create store');
    }
  }
);

export const updateStore = createAsyncThunk(
  'stores/update',
  async ({ id, data }: { id: number; data: UpdateStoreRequest }, { rejectWithValue }) => {
    try {
      const response = await storeService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update store');
    }
  }
);

export const deleteStore = createAsyncThunk(
  'stores/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await storeService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete store');
    }
  }
);

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedStore: (state) => {
      state.selectedStore = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        state.selectedStore = action.payload;
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.stores.push(action.payload);
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        const index = state.stores.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.stores[index] = action.payload;
        }
        state.selectedStore = action.payload;
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.stores = state.stores.filter((s) => s.id !== action.payload);
      });
  },
});

export const { clearError, clearSelectedStore } = storeSlice.actions;
export default storeSlice.reducer;








