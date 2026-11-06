export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export type SheetSyncStatus = 'pending' | 'synced' | 'failed';

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isBrototypeStudent: 'yes' | 'no';
  batchNumber?: string;
  counsellorName?: string;
  message?: string;
  sheetSyncStatus: SheetSyncStatus;
  sheetSyncError?: string | null;
  sheetSyncedAt?: string | null;
  sheetSyncAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: ContactSubmission[];
}

export interface SubmissionsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  isBrototypeStudent?: string;
  search?: string;
  sort?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: AdminUser;
}

