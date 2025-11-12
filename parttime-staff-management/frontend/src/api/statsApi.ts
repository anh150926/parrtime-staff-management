/*
 * file: frontend/src/api/statsApi.ts
 *
 * File service cho API Module 4 (Thống kê).
 */

import axiosClient from "./axiosClient";
import { BestEmployeeResponse } from "../models/Stats";

export const statsApi = {
  getBestEmployees: (
    startDate: string,
    endDate: string
  ): Promise<BestEmployeeResponse[]> => {
    return axiosClient
      .get<BestEmployeeResponse[]>("/stats/best-employees", {
        params: { startDate, endDate },
      })
      .then((response) => response.data);
  },
};
