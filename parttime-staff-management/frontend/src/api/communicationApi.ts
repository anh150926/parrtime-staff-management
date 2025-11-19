/* file: frontend/src/api/communicationApi.ts */
import axiosClient from "./axiosClient";
import {
  AnnouncementDto,
  ComplaintDto,
  ComplaintResponseDto,
  Poll,
  PollDto,
  PollVoteDto,
} from "../models/Communication";

export const communicationApi = {
  // --- Thông báo ---
  createAnnouncement: async (
    data: AnnouncementDto
  ): Promise<AnnouncementDto> => {
    const response = await axiosClient.post<AnnouncementDto>(
      "/communication/announcements",
      data
    );
    return response.data;
  },
  getAnnouncements: async (): Promise<AnnouncementDto[]> => {
    const response = await axiosClient.get<AnnouncementDto[]>(
      "/communication/announcements"
    );
    return response.data;
  },

  // --- Khiếu nại ---
  createComplaint: async (data: ComplaintDto): Promise<ComplaintDto> => {
    const response = await axiosClient.post<ComplaintDto>(
      "/communication/complaints",
      data
    );
    return response.data;
  },
  getMyComplaints: async (): Promise<ComplaintDto[]> => {
    const response = await axiosClient.get<ComplaintDto[]>(
      "/communication/complaints/my-complaints"
    );
    return response.data;
  },
  getBranchComplaints: async (): Promise<ComplaintDto[]> => {
    const response = await axiosClient.get<ComplaintDto[]>(
      "/communication/complaints/branch"
    );
    return response.data;
  },
  respondToComplaint: async (
    id: number,
    data: ComplaintResponseDto
  ): Promise<ComplaintDto> => {
    const response = await axiosClient.put<ComplaintDto>(
      `/communication/complaints/${id}/respond`,
      data
    );
    return response.data;
  },

  // --- Khảo sát (Polls) ---
  createPoll: async (data: PollDto): Promise<void> => {
    await axiosClient.post("/communication/polls", data);
  },
  // [SỬA LỖI] Thay 'any' bằng 'Poll'
  getActivePolls: async (): Promise<Poll[]> => {
    const response = await axiosClient.get<Poll[]>(
      "/communication/polls/active"
    );
    return response.data;
  },
  votePoll: async (id: number, data: PollVoteDto): Promise<void> => {
    await axiosClient.post(`/communication/polls/${id}/vote`, data);
  },
};
