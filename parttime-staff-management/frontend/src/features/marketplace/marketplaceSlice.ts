import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import marketplaceService, { 
  MarketplaceListing, 
  SwapRequest, 
  CreateListingRequest, 
  ReviewListingRequest,
  CreateSwapRequest 
} from '../../api/marketplaceService';

interface MarketplaceState {
  listings: MarketplaceListing[];
  myListings: MarketplaceListing[];
  pendingApproval: MarketplaceListing[];
  swapRequests: SwapRequest[];
  pendingPeerSwaps: SwapRequest[];
  pendingManagerSwaps: SwapRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketplaceState = {
  listings: [],
  myListings: [],
  pendingApproval: [],
  swapRequests: [],
  pendingPeerSwaps: [],
  pendingManagerSwaps: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchAvailableListings = createAsyncThunk(
  'marketplace/fetchAvailable',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getAvailableListings(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch listings');
    }
  }
);

export const fetchAllListingsByStore = createAsyncThunk(
  'marketplace/fetchAllByStore',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getAllListingsByStore(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch listings');
    }
  }
);

export const fetchMyListings = createAsyncThunk(
  'marketplace/fetchMyListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getMyListings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my listings');
    }
  }
);

export const fetchPendingApproval = createAsyncThunk(
  'marketplace/fetchPendingApproval',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getPendingApproval(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approval');
    }
  }
);

export const createListing = createAsyncThunk(
  'marketplace/createListing',
  async (data: CreateListingRequest, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.createListing(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create listing');
    }
  }
);

export const claimListing = createAsyncThunk(
  'marketplace/claimListing',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.claimListing(listingId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim listing');
    }
  }
);

export const reviewListing = createAsyncThunk(
  'marketplace/reviewListing',
  async ({ listingId, data }: { listingId: number; data: ReviewListingRequest }, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.reviewListing(listingId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review listing');
    }
  }
);

export const cancelListing = createAsyncThunk(
  'marketplace/cancelListing',
  async (listingId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.cancelListing(listingId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel listing');
    }
  }
);

// Swap thunks
export const fetchMySwapRequests = createAsyncThunk(
  'marketplace/fetchMySwaps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getMySwapRequests();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch swap requests');
    }
  }
);

export const fetchPendingPeerSwaps = createAsyncThunk(
  'marketplace/fetchPendingPeerSwaps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getPendingPeerConfirmation();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending swaps');
    }
  }
);

export const fetchSwapsPendingApproval = createAsyncThunk(
  'marketplace/fetchSwapsPendingApproval',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getSwapsPendingApproval(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending swaps');
    }
  }
);

export const createSwapRequest = createAsyncThunk(
  'marketplace/createSwap',
  async (data: CreateSwapRequest, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.createSwapRequest(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create swap request');
    }
  }
);

export const confirmSwapRequest = createAsyncThunk(
  'marketplace/confirmSwap',
  async ({ swapId, confirm }: { swapId: number; confirm: boolean }, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.confirmSwapRequest(swapId, confirm);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm swap');
    }
  }
);

export const reviewSwapRequest = createAsyncThunk(
  'marketplace/reviewSwap',
  async ({ swapId, approve, note }: { swapId: number; approve: boolean; note?: string }, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.reviewSwapRequest(swapId, approve, note);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review swap');
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch available listings
      .addCase(fetchAvailableListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableListings.fulfilled, (state, action: PayloadAction<MarketplaceListing[]>) => {
        state.loading = false;
        state.listings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAvailableListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.listings = [];
      })
      // Fetch all by store
      .addCase(fetchAllListingsByStore.fulfilled, (state, action: PayloadAction<MarketplaceListing[]>) => {
        state.listings = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch my listings
      .addCase(fetchMyListings.fulfilled, (state, action: PayloadAction<MarketplaceListing[]>) => {
        state.myListings = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch pending approval
      .addCase(fetchPendingApproval.fulfilled, (state, action: PayloadAction<MarketplaceListing[]>) => {
        state.pendingApproval = Array.isArray(action.payload) ? action.payload : [];
      })
      // Create listing
      .addCase(createListing.fulfilled, (state, action: PayloadAction<MarketplaceListing>) => {
        state.myListings.unshift(action.payload);
      })
      // Claim listing
      .addCase(claimListing.fulfilled, (state, action: PayloadAction<MarketplaceListing>) => {
        const index = state.listings.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
      })
      // Review listing
      .addCase(reviewListing.fulfilled, (state, action: PayloadAction<MarketplaceListing>) => {
        state.pendingApproval = state.pendingApproval.filter(l => l.id !== action.payload.id);
        const index = state.listings.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.listings[index] = action.payload;
        }
      })
      // Cancel listing
      .addCase(cancelListing.fulfilled, (state, action: PayloadAction<MarketplaceListing>) => {
        state.listings = state.listings.filter(l => l.id !== action.payload.id);
        const myIndex = state.myListings.findIndex(l => l.id === action.payload.id);
        if (myIndex !== -1) {
          state.myListings[myIndex] = action.payload;
        }
      })
      // Swap requests
      .addCase(fetchMySwapRequests.fulfilled, (state, action: PayloadAction<SwapRequest[]>) => {
        state.swapRequests = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPendingPeerSwaps.fulfilled, (state, action: PayloadAction<SwapRequest[]>) => {
        state.pendingPeerSwaps = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchSwapsPendingApproval.fulfilled, (state, action: PayloadAction<SwapRequest[]>) => {
        state.pendingManagerSwaps = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(createSwapRequest.fulfilled, (state, action: PayloadAction<SwapRequest>) => {
        state.swapRequests.unshift(action.payload);
      })
      .addCase(confirmSwapRequest.fulfilled, (state, action: PayloadAction<SwapRequest>) => {
        state.pendingPeerSwaps = state.pendingPeerSwaps.filter(s => s.id !== action.payload.id);
        const index = state.swapRequests.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.swapRequests[index] = action.payload;
        }
      })
      .addCase(reviewSwapRequest.fulfilled, (state, action: PayloadAction<SwapRequest>) => {
        state.pendingManagerSwaps = state.pendingManagerSwaps.filter(s => s.id !== action.payload.id);
      });
  },
});

export const { clearError } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;


