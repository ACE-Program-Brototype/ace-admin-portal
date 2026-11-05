import { apiClient } from './client';
import { AdminUser, LoginResponse } from '../types';

export const loginAdmin = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const getAdminProfile = async (): Promise<AdminUser> => {
  const response = await apiClient.get<{ success: boolean; data: AdminUser }>('/auth/me');
  return response.data.data;
};

