import { apiClient } from './client';
import { ContactSubmission, SubmissionsQueryParams, SubmissionsResponse } from '../types';

export const fetchSubmissions = async (params: SubmissionsQueryParams): Promise<SubmissionsResponse> => {
  const cleanParams: Record<string, string | number> = {};

  if (params.page) cleanParams.page = params.page;
  if (params.limit) cleanParams.limit = params.limit;
  if (params.status && params.status !== 'all') cleanParams.status = params.status;
  if (params.isBrototypeStudent && params.isBrototypeStudent !== 'all') {
    cleanParams.isBrototypeStudent = params.isBrototypeStudent;
  }
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

