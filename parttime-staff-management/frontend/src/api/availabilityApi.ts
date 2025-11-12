/*
 * file: frontend/src/api/availabilityApi.ts
 *
 * File service cho API Module 1 (Đăng ký lịch).
 */

import axiosClient from "./axiosClient";
import {
  AvailabilityRequest,
  AvailabilityResponse,
} from "../models/Availability";

export const availabilityApi = {
  getAvailability: (
    employeeId: number,
    date: string
  ): Promise<AvailabilityResponse> => {
    return axiosClient
      .get<AvailabilityResponse>("/availability", {
        params: { employeeId, date },
      })
      .then((response) => response.data);
  },

  saveAvailability: (
    data: AvailabilityRequest
  ): Promise<AvailabilityResponse> => {
    return axiosClient
      .post<AvailabilityResponse>("/availability", data)
      .then((response) => response.data);
  },
};
