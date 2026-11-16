import { apiClient } from './client';
import {
  ContactSubmission,
  SubmissionsQueryParams,
  SubmissionsResponse,
  UpdateEnquiryStatusPayload
} from '../types';

export const fetchSubmissions = async (params: SubmissionsQueryParams): Promise<SubmissionsResponse> => {
  const cleanParams: Record<string, string | number> = {};

  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;
  if (params.status && params.status !== 'all') cleanParams.status = params.status;
  if (params.lifecycleStatus && params.lifecycleStatus !== 'all') {
    cleanParams.lifecycleStatus = params.lifecycleStatus;
  }
  if (params.isBrototypeStudent && params.isBrototypeStudent !== 'all') {
    cleanParams.isBrototypeStudent = params.isBrototypeStudent;
  }
  if (params.startDate && params.startDate.trim()) cleanParams.startDate = params.startDate.trim();
  if (params.endDate && params.endDate.trim()) cleanParams.endDate = params.endDate.trim();
  if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
  if (params.sort) cleanParams.sort = params.sort;

  const response = await apiClient.get<SubmissionsResponse>('/contact', {
    params: cleanParams
  });

  return response.data;
};

export const fetchSubmissionById = async (id: string): Promise<ContactSubmission> => {
  const response = await apiClient.get<{ success: boolean; data: ContactSubmission }>(`/contact/${id}`);
  return response.data.data;
};

export const updateEnquiryStatus = async (
  id: string,
  payload: UpdateEnquiryStatusPayload
): Promise<ContactSubmission> => {
  const response = await apiClient.patch<{ success: boolean; message: string; data: ContactSubmission }>(
    `/contact/${id}/status`,
    payload
  );
  return response.data.data;
};

