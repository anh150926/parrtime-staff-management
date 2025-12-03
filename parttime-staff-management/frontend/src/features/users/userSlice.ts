import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService, {
  CreateUserRequest,
  UpdateUserRequest,
} from "../../api/userService";
import { User } from "../../api/authService";

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/create",
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/update",
  async (
    { id, data }: { id: number; data: UpdateUserRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await userService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.selectedUser = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const id = action.payload as number;
        const index = state.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          state.users[index].status = "INACTIVE";
        }
      });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
