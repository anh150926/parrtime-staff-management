/*
 * file: frontend/src/api/worklogApi.ts
 *
 * File service cho API Chấm công.
 */

import axiosClient from "./axiosClient";
import { CheckInRequest, WorkLogResponse } from "../models/WorkLog";

export const worklogApi = {
  checkIn: (data: CheckInRequest): Promise<WorkLogResponse> => {
    return axiosClient
      .post<WorkLogResponse>("/worklog/check-in", data)
      .then((response) => response.data);
  },

  checkOut: (workLogId: number): Promise<WorkLogResponse> => {
    return axiosClient
      .post<WorkLogResponse>(`/worklog/check-out/${workLogId}`)
      .then((response) => response.data);
  },
};
