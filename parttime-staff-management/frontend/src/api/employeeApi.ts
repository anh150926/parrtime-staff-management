/*
 * file: frontend/src/api/employeeApi.ts
 *
 * File service cho API Employee (Module 1).
 */

import axiosClient from "./axiosClient";
import { EmployeeSearchResponse } from "../models/Employee";

export const employeeApi = {
  searchByName: (name: string): Promise<EmployeeSearchResponse[]> => {
    return axiosClient
      .get<EmployeeSearchResponse[]>(`/employees/search`, {
        params: { name },
      })
      .then((response) => response.data);
  },
};
