import { apiClient } from './client';
import {
  AdminUser,
  AdminsQueryParams,
  AdminsResponse,
  CreateAdminPayload,
  UpdateAdminPayload
} from '../types';

export const fetchAdmins = async (params: AdminsQueryParams): Promise<AdminsResponse> => {
  const cleanParams: Record<string, string | number> = {};

  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;
  if (params.role && params.role !== 'all') cleanParams.role = params.role;
  if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params.sort) cleanParams.sort = params.sort;

  const response = await apiClient.get<AdminsResponse>('/admins', {
    params: cleanParams
  });

  return response.data;
};

export const fetchAdminById = async (id: string): Promise<AdminUser> => {
  const response = await apiClient.get<{ success: boolean; data: AdminUser }>(`/admins/${id}`);
  return response.data.data;
};

export const createAdmin = async (payload: CreateAdminPayload): Promise<AdminUser> => {
  const response = await apiClient.post<{ success: boolean; message: string; data: AdminUser }>(
    '/admins',
    payload
  );
  return response.data.data;
};

export const updateAdmin = async (id: string, payload: UpdateAdminPayload): Promise<AdminUser> => {
  const response = await apiClient.put<{ success: boolean; message: string; data: AdminUser }>(
    `/admins/${id}`,
    payload
  );
  return response.data.data;
};

export const toggleBlockAdmin = async (id: string, isBlocked?: boolean): Promise<AdminUser> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: AdminUser }>(
    `/admins/${id}/toggle-block`,
    isBlocked !== undefined ? { isBlocked } : {}
  );
  return response.data.data;
};

export const deleteAdmin = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/admins/${id}`);
  return response.data;
};

