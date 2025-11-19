/* file: frontend/src/models/Communication.ts */

export interface AnnouncementDto {
  id?: number;
  title: string;
  content: string;
  authorName?: string;
  createdAt?: string;
}

export interface ComplaintDto {
  id?: number;
  staffUserId?: number;
  staffName?: string;
  content: string;
  response?: string;
  status?: string;
  createdAt?: string;
}

export interface ComplaintResponseDto {
  response: string;
}

export interface PollDto {
  question: string;
  options: string[];
}

export interface PollVoteDto {
  selectedOption: string;
}

// [MỚI] Thêm interface này để sửa lỗi "any"
export interface Poll {
  id: number;
  question: string;
  options: string[];
  active: boolean;
  createdAt: string;
}
