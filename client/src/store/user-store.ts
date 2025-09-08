import { create } from "zustand";
import type { AuthUser } from "@shared-types";
import { clearAuthToken } from "~/lib/utils";

type UserStore = {
  user: AuthUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: "idle" | "loading" | "failed") => void;
  setReason: (error: string | null) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  status: "loading",
  error: null,
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  setReason: (error) => set({ error }),
  logout: () => {
    clearAuthToken();
    set({ user: null, status: "idle", error: null });
  },
}));
