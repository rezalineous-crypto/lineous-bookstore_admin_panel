import apiClient from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/admin/login", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    // Public endpoint: no Authorization header. Use a fresh axios call without interceptor.
    const response = await apiClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async (): Promise<{ message: string; status: string }> => {
    const response = await apiClient.post<{ message: string; status: string }>("/auth/logout");
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default authApi;
