import { apiClient, setAuthToken } from "./api-client";
import { AuthLoginData, UserMe } from "@/shared/types/api";

export const authService = {
  login: async (identifier: string, password: string) => {
    const res = await apiClient.post<AuthLoginData>("/auth/login", {
      username: identifier,
      password,
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<UserMe>("/auth/me");
    return res.data;
  },

  gantiPassword: async (passwordLama: string, passwordBaru: string) => {
    const res = await apiClient.post<{ token: string }>("/auth/ganti-password", {
      passwordLama,
      passwordBaru,
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
    }
    return res;
  },

  logout: () => {
    setAuthToken(null);
  },
};
