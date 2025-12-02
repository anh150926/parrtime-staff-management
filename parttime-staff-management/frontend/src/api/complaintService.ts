import api from './axios';

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
  createComplaint: (data: CreateComplaintRequest) =>
    api.post<Complaint>('/complaints', data),

  // Staff: Get my complaints
  getMyComplaints: () =>
    api.get<Complaint[]>('/complaints/my-complaints'),

  // Manager/Owner: Get complaints by store
  getComplaintsByStore: (storeId: number) =>
    api.get<Complaint[]>(`/complaints/store/${storeId}`),

  // Owner: Get all complaints
  getAllComplaints: () =>
    api.get<Complaint[]>('/complaints'),

  // Manager/Owner: Get pending complaints by store
  getPendingComplaints: (storeId: number) =>
    api.get<Complaint[]>(`/complaints/pending/store/${storeId}`),

  // Owner: Get all pending complaints
  getAllPendingComplaints: () =>
    api.get<Complaint[]>('/complaints/pending'),

  // Get complaint by ID
  getComplaintById: (id: number) =>
    api.get<Complaint>(`/complaints/${id}`),

  // Manager/Owner: Respond to complaint
  respondToComplaint: (id: number, data: RespondComplaintRequest) =>
    api.post<Complaint>(`/complaints/${id}/respond`, data),

  // Get pending count
  getPendingCount: (storeId: number) =>
    api.get<{ count: number }>(`/complaints/count/pending/store/${storeId}`),
};

export default complaintService;



