export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export type SheetSyncStatus = 'pending' | 'synced' | 'failed';

export type EnquiryLifecycleStatus =
  | 'ENQUIRED'
  | 'CONNECTED'
  | 'PREPARATION'
  | 'SCHEDULED'
  | 'REJECTED'
  | 'SELECTED'
  | 'ONBOARDED';

export interface StatusHistoryItem {
  _id?: string;
  status: EnquiryLifecycleStatus;
  previousStatus?: EnquiryLifecycleStatus | null;
  changedBy?: string;
  changedByName?: string;
  changedByEmail?: string;
  changedAt: string;
  feedback?: string;
  notes?: string;
  scheduledAt?: string | null;
  meetLink?: string;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isBrototypeStudent: 'yes' | 'no';
  batchNumber?: string;
  domain?: string;
  counsellorName?: string;
  message?: string;
  status: EnquiryLifecycleStatus;
  scheduledAt?: string | null;
  meetLink?: string;
  feedback?: string;
  statusHistory?: StatusHistoryItem[];
  sheetSyncStatus: SheetSyncStatus;
  sheetSyncError?: string | null;
  sheetSyncedAt?: string | null;
  sheetSyncAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEnquiryStatusPayload {
  status: EnquiryLifecycleStatus;
  scheduledAt?: string;
  meetLink?: string;
  feedback?: string;
  notes?: string;
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
  lifecycleStatus?: string;
  isBrototypeStudent?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: AdminUser;
}

