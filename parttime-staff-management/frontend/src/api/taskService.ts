import api from "./axios";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Task {
  id: number;
  storeId: number;
  storeName: string;
  shiftId: number | null;
  shiftTitle: string | null;
  shiftStart: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId: number | null;
  assignedToName: string | null;
  dueDate: string | null;
  completedAt: string | null;
  completedById: number | null;
  completedByName: string | null;
  createdById: number;
  createdByName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

export interface CreateTaskRequest {
  storeId: number;
  shiftId?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedToId?: number;
  dueDate?: string;
  notes?: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: number;
  dueDate?: string;
  notes?: string;
}

const taskService = {
  getTasksByStore: (storeId: number) =>
    api
      .get<any>(`/tasks/store/${storeId}`)
      .then((res) => ({ data: res.data.data || res.data })),

  getTasksByShift: (shiftId: number) =>
    api
      .get<any>(`/tasks/shift/${shiftId}`)
      .then((res) => ({ data: res.data.data || res.data })),

  getMyTasks: () =>
    api
      .get<any>("/tasks/my-tasks")
      .then((res) => ({ data: res.data.data || res.data })),

  getTodaysTasks: (storeId: number) =>
    api
      .get<any>(`/tasks/today/${storeId}`)
      .then((res) => ({ data: res.data.data || res.data })),

  getOverdueTasks: (storeId: number) =>
    api
      .get<any>(`/tasks/overdue/${storeId}`)
      .then((res) => ({ data: res.data.data || res.data })),

  getTaskById: (id: number) =>
    api
      .get<any>(`/tasks/${id}`)
      .then((res) => ({ data: res.data.data || res.data })),

  createTask: (data: CreateTaskRequest) =>
    api
      .post<any>("/tasks", data)
      .then((res) => ({ data: res.data.data || res.data })),

  updateTask: (id: number, data: UpdateTaskRequest) =>
    api
      .put<any>(`/tasks/${id}`, data)
      .then((res) => ({ data: res.data.data || res.data })),

  startTask: (id: number) =>
    api
      .post<any>(`/tasks/${id}/start`)
      .then((res) => ({ data: res.data.data || res.data })),

  completeTask: (id: number) =>
    api
      .post<any>(`/tasks/${id}/complete`)
      .then((res) => ({ data: res.data.data || res.data })),

  deleteTask: (id: number) => api.delete(`/tasks/${id}`),

  getTaskStats: (storeId: number) =>
    api
      .get<any>(`/tasks/stats/${storeId}`)
      .then((res) => ({ data: res.data.data || res.data })),
};

export default taskService;
