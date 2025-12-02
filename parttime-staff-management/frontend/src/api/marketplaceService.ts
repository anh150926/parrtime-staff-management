import api from './axios';

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
  getAvailableListings: (storeId: number) => 
    api.get<MarketplaceListing[]>(`/marketplace/store/${storeId}`),

  getAllListingsByStore: (storeId: number) => 
    api.get<MarketplaceListing[]>(`/marketplace/store/${storeId}/all`),

  getMyListings: () => 
    api.get<MarketplaceListing[]>('/marketplace/my-listings'),

  getPendingApproval: (storeId: number) => 
    api.get<MarketplaceListing[]>(`/marketplace/pending-approval/${storeId}`),

  createListing: (data: CreateListingRequest) => 
    api.post<MarketplaceListing>('/marketplace/give', data),

  claimListing: (listingId: number) => 
    api.post<MarketplaceListing>(`/marketplace/claim/${listingId}`),

  reviewListing: (listingId: number, data: ReviewListingRequest) => 
    api.post<MarketplaceListing>(`/marketplace/review/${listingId}`, data),

  cancelListing: (listingId: number) => 
    api.post<MarketplaceListing>(`/marketplace/cancel/${listingId}`),

  // Swap Requests
  getMySwapRequests: () => 
    api.get<SwapRequest[]>('/marketplace/my-swaps'),

  getPendingPeerConfirmation: () => 
    api.get<SwapRequest[]>('/marketplace/pending-peer'),

  getSwapsPendingApproval: (storeId: number) => 
    api.get<SwapRequest[]>(`/marketplace/swaps/pending-approval/${storeId}`),

  createSwapRequest: (data: CreateSwapRequest) => 
    api.post<SwapRequest>('/marketplace/swap', data),

  confirmSwapRequest: (swapId: number, confirm: boolean) => 
    api.post<SwapRequest>(`/marketplace/swap/${swapId}/confirm?confirm=${confirm}`),

  reviewSwapRequest: (swapId: number, approve: boolean, note?: string) => 
    api.post<SwapRequest>(`/marketplace/swap/${swapId}/review?approve=${approve}${note ? '&note=' + encodeURIComponent(note) : ''}`),
};

export default marketplaceService;




