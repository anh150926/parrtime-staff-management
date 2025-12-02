import api from './axios';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

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
    api.get<Task[]>(`/tasks/store/${storeId}`),

  getTasksByShift: (shiftId: number) => 
    api.get<Task[]>(`/tasks/shift/${shiftId}`),

  getMyTasks: () => 
    api.get<Task[]>('/tasks/my-tasks'),

  getTodaysTasks: (storeId: number) => 
    api.get<Task[]>(`/tasks/today/${storeId}`),

  getOverdueTasks: (storeId: number) => 
    api.get<Task[]>(`/tasks/overdue/${storeId}`),

  getTaskById: (id: number) => 
    api.get<Task>(`/tasks/${id}`),

  createTask: (data: CreateTaskRequest) => 
    api.post<Task>('/tasks', data),

  updateTask: (id: number, data: UpdateTaskRequest) => 
    api.put<Task>(`/tasks/${id}`, data),

  completeTask: (id: number) => 
    api.post<Task>(`/tasks/${id}/complete`),

  deleteTask: (id: number) => 
    api.delete(`/tasks/${id}`),

  getTaskStats: (storeId: number) => 
    api.get<Record<string, number>>(`/tasks/stats/${storeId}`),
};

export default taskService;




