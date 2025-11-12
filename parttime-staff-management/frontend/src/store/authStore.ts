/*
 * file: frontend/src/store/authStore.ts
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, AuthResponse } from "../models/Auth";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (data: AuthResponse) => {
        const user: AuthUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          restaurantId: data.restaurantId,
        };
        set({
          user: user,
          token: data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: AuthUser | null) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage", // Tên key trong localStorage
    }
  )
);
