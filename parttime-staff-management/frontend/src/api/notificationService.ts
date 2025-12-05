import api from './axios';
import { ApiResponse } from './authService';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  isRead: boolean;
  link?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface SendNotificationRequest {
  userId: number;
  title: string;
  message?: string;
  link?: string;
}

const notificationService = {
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },

  getUnread: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return response.data;
  },

  send: async (data: SendNotificationRequest): Promise<ApiResponse<Notification>> => {
    const response = await api.post<ApiResponse<Notification>>('/notifications/send', data);
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await api.put<ApiResponse<void>>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;

