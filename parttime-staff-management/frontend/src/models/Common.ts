/* file: frontend/src/models/Common.ts */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApprovalDto {
  approved: boolean;
  reason?: string;
}

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  message: string;
  path: string;
}
