import api from './axios';
import { ApiResponse } from './authService';

export type ComplaintType = 'SALARY' | 'SCHEDULE' | 'WORKPLACE' | 'COLLEAGUE' | 'MANAGEMENT' | 'OTHER';
export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export interface Complaint {
  id: number;
  storeId: number;
  storeName: string;
  fromUserId: number;
  fromUserName: string;
  type: ComplaintType;
  subject: string;
  content: string;
  status: ComplaintStatus;
  response: string | null;
  respondedById: number | null;
  respondedByName: string | null;
  respondedAt: string | null;
  createdAt: string;
}

export interface CreateComplaintRequest {
  type: ComplaintType;
  subject: string;
  content: string;
}

export interface RespondComplaintRequest {
  status: ComplaintStatus;
  response: string;
}

const complaintService = {
  // Staff: Create complaint
  createComplaint: async (data: CreateComplaintRequest): Promise<ApiResponse<Complaint>> => {
    const response = await api.post<ApiResponse<Complaint>>('/complaints', data);
    return response.data;
  },

  // Staff: Get my complaints
  getMyComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints/my-complaints');
    return response.data;
  },

  // Manager/Owner: Get complaints by store
  getComplaintsByStore: async (storeId: number): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints/store/${storeId}`);
    return response.data;
  },

  // Owner: Get all complaints
  getAllComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints');
    return response.data;
  },

  // Manager/Owner: Get pending complaints by store
  getPendingComplaints: async (storeId: number): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints/pending/store/${storeId}`);
    return response.data;
  },

  // Owner: Get all pending complaints
  getAllPendingComplaints: async (): Promise<ApiResponse<Complaint[]>> => {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints/pending');
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id: number): Promise<ApiResponse<Complaint>> => {
    const response = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return response.data;
  },

  // Manager/Owner: Respond to complaint
  respondToComplaint: async (id: number, data: RespondComplaintRequest): Promise<ApiResponse<Complaint>> => {
    const response = await api.post<ApiResponse<Complaint>>(`/complaints/${id}/respond`, data);
    return response.data;
  },

  // Get pending count
  getPendingCount: async (storeId: number): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>(`/complaints/count/pending/store/${storeId}`);
    return response.data;
  },
};

export default complaintService;



