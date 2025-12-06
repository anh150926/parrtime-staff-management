import api from './axios';
import { ApiResponse } from './authService';

export type MarketplaceType = 'GIVE_AWAY' | 'SWAP' | 'OPEN';
export type MarketplaceStatus = 'PENDING' | 'CLAIMED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export type SwapStatus = 'PENDING_PEER' | 'PENDING_MANAGER' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface MarketplaceListing {
  id: number;
  shiftId: number;
  shiftTitle: string;
  shiftStart: string;
  shiftEnd: string;
  storeId: number;
  storeName: string;
  type: MarketplaceType;
  status: MarketplaceStatus;
  fromUserId: number;
  fromUserName: string;
  toUserId: number | null;
  toUserName: string | null;
  reason: string | null;
  managerNote: string | null;
  reviewedById: number | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface SwapRequest {
  id: number;
  fromShiftId: number;
  fromShiftTitle: string;
  fromShiftStart: string;
  fromShiftEnd: string;
  toShiftId: number;
  toShiftTitle: string;
  toShiftStart: string;
  toShiftEnd: string;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  storeId: number;
  storeName: string;
  status: SwapStatus;
  reason: string | null;
  peerConfirmed: boolean;
  reviewedById: number | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CreateListingRequest {
  shiftId: number;
  type: MarketplaceType;
  reason?: string;
}

export interface ReviewListingRequest {
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}

export interface CreateSwapRequest {
  myShiftId: number;
  targetShiftId: number;
  targetUserId: number;
  reason?: string;
}

const marketplaceService = {
  // Listings
  getAvailableListings: async (storeId: number): Promise<ApiResponse<MarketplaceListing[]>> => {
    const response = await api.get<ApiResponse<MarketplaceListing[]>>(`/marketplace/store/${storeId}`);
    return response.data;
  },

  getAllListingsByStore: async (storeId: number): Promise<ApiResponse<MarketplaceListing[]>> => {
    const response = await api.get<ApiResponse<MarketplaceListing[]>>(`/marketplace/store/${storeId}/all`);
    return response.data;
  },

  getMyListings: async (): Promise<ApiResponse<MarketplaceListing[]>> => {
    const response = await api.get<ApiResponse<MarketplaceListing[]>>('/marketplace/my-listings');
    return response.data;
  },

  getPendingApproval: async (storeId: number): Promise<ApiResponse<MarketplaceListing[]>> => {
    const response = await api.get<ApiResponse<MarketplaceListing[]>>(`/marketplace/pending-approval/${storeId}`);
    return response.data;
  },

  createListing: async (data: CreateListingRequest): Promise<ApiResponse<MarketplaceListing>> => {
    const response = await api.post<ApiResponse<MarketplaceListing>>('/marketplace/give', data);
    return response.data;
  },

  claimListing: async (listingId: number): Promise<ApiResponse<MarketplaceListing>> => {
    const response = await api.post<ApiResponse<MarketplaceListing>>(`/marketplace/claim/${listingId}`);
    return response.data;
  },

  reviewListing: async (listingId: number, data: ReviewListingRequest): Promise<ApiResponse<MarketplaceListing>> => {
    const response = await api.post<ApiResponse<MarketplaceListing>>(`/marketplace/review/${listingId}`, data);
    return response.data;
  },

  cancelListing: async (listingId: number): Promise<ApiResponse<MarketplaceListing>> => {
    const response = await api.post<ApiResponse<MarketplaceListing>>(`/marketplace/cancel/${listingId}`);
    return response.data;
  },

  // Swap Requests
  getMySwapRequests: async (): Promise<ApiResponse<SwapRequest[]>> => {
    const response = await api.get<ApiResponse<SwapRequest[]>>('/marketplace/my-swaps');
    return response.data;
  },

  getPendingPeerConfirmation: async (): Promise<ApiResponse<SwapRequest[]>> => {
    const response = await api.get<ApiResponse<SwapRequest[]>>('/marketplace/pending-peer');
    return response.data;
  },

  getSwapsPendingApproval: async (storeId: number): Promise<ApiResponse<SwapRequest[]>> => {
    const response = await api.get<ApiResponse<SwapRequest[]>>(`/marketplace/swaps/pending-approval/${storeId}`);
    return response.data;
  },

  createSwapRequest: async (data: CreateSwapRequest): Promise<ApiResponse<SwapRequest>> => {
    const response = await api.post<ApiResponse<SwapRequest>>('/marketplace/swap', data);
    return response.data;
  },

  confirmSwapRequest: async (swapId: number, confirm: boolean): Promise<ApiResponse<SwapRequest>> => {
    const response = await api.post<ApiResponse<SwapRequest>>(`/marketplace/swap/${swapId}/confirm?confirm=${confirm}`);
    return response.data;
  },

  reviewSwapRequest: async (swapId: number, approve: boolean, note?: string): Promise<ApiResponse<SwapRequest>> => {
    const response = await api.post<ApiResponse<SwapRequest>>(`/marketplace/swap/${swapId}/review?approve=${approve}${note ? '&note=' + encodeURIComponent(note) : ''}`);
    return response.data;
  },
};

export default marketplaceService;




