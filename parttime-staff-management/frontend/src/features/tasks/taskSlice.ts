import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService, { Task, CreateTaskRequest, UpdateTaskRequest } from '../../api/taskService';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  todaysTasks: Task[];
  overdueTasks: Task[];
  selectedTask: Task | null;
  stats: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  myTasks: [],
  todaysTasks: [],
  overdueTasks: [],
  selectedTask: null,
  stats: {},
  loading: false,
  error: null,
};

// Thunks
export const fetchTasksByStore = createAsyncThunk(
  'tasks/fetchByStore',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasksByStore(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTasksByShift = createAsyncThunk(
  'tasks/fetchByShift',
  async (shiftId: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasksByShift(shiftId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyTasks();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my tasks');
    }
  }
);

export const fetchTodaysTasks = createAsyncThunk(
  'tasks/fetchTodays',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getTodaysTasks(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s tasks');
    }
  }
);

export const fetchOverdueTasks = createAsyncThunk(
  'tasks/fetchOverdue',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getOverdueTasks(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (data: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: number; data: UpdateTaskRequest }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const startTask = createAsyncThunk(
  'tasks/start',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await taskService.startTask(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start task');
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/complete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await taskService.completeTask(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (storeId: number, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskStats(storeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch by store
      .addCase(fetchTasksByStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByStore.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTasksByStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tasks = [];
      })
      // Fetch by shift
      .addCase(fetchTasksByShift.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch my tasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.myTasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.myTasks = [];
      })
      // Fetch today's tasks
      .addCase(fetchTodaysTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.todaysTasks = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch overdue tasks
      .addCase(fetchOverdueTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.overdueTasks = Array.isArray(action.payload) ? action.payload : [];
      })
      // Fetch by id
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<Task>) => {
        state.selectedTask = action.payload;
      })
      // Create
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.unshift(action.payload);
      })
      // Update
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        const myIndex = state.myTasks.findIndex(t => t.id === action.payload.id);
        if (myIndex !== -1) {
          state.myTasks[myIndex] = action.payload;
        }
      })
      // Start
      .addCase(startTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        const myIndex = state.myTasks.findIndex(t => t.id === action.payload.id);
        if (myIndex !== -1) {
          state.myTasks[myIndex] = action.payload;
        }
      })
      // Complete
      .addCase(completeTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        const myIndex = state.myTasks.findIndex(t => t.id === action.payload.id);
        if (myIndex !== -1) {
          state.myTasks[myIndex] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.myTasks = state.myTasks.filter(t => t.id !== action.payload);
      })
      // Stats
      .addCase(fetchTaskStats.fulfilled, (state, action: PayloadAction<Record<string, number>>) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;


