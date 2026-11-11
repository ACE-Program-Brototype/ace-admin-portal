import { EnquiryLifecycleStatus } from '../types';

export const VALID_STATUS_TRANSITIONS: Record<EnquiryLifecycleStatus, EnquiryLifecycleStatus[]> = {
  ENQUIRED: ['CONNECTED'],
  CONNECTED: ['PREPARATION', 'SCHEDULED', 'REJECTED'],
  PREPARATION: ['SCHEDULED', 'REJECTED'],
  SCHEDULED: ['SELECTED', 'REJECTED'],
  SELECTED: ['ONBOARDED'],
  REJECTED: ['CONNECTED'],
  ONBOARDED: []
};

export interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const STATUS_CONFIG: Record<EnquiryLifecycleStatus, StatusConfig> = {
  ENQUIRED: {
    label: 'Enquired',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    dotClass: 'bg-sky-400',
    description: 'Initial enquiry submitted through web form'
  },
  CONNECTED: {
    label: 'Connected',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    dotClass: 'bg-indigo-400',
    description: 'Admin established initial contact with candidate'
  },
  PREPARATION: {
    label: 'Preparation',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    dotClass: 'bg-amber-400',
    description: 'Candidate preparing for evaluation / interview'
  },
  SCHEDULED: {
    label: 'Scheduled',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    dotClass: 'bg-purple-400',
    description: 'Evaluation / interview session scheduled'
  },
  SELECTED: {
    label: 'Selected',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-400',
    description: 'Candidate passed evaluation and is selected'
  },
  REJECTED: {
    label: 'Rejected',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    dotClass: 'bg-rose-400',
    description: 'Candidate was rejected with documented feedback'
  },
  ONBOARDED: {
    label: 'Onboarded',
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    dotClass: 'bg-teal-400',
    description: 'Candidate enrolled and orientation completed'
  }
};

export const getStatusConfig = (status?: string): StatusConfig => {
  const upper = (status || 'ENQUIRED').toUpperCase() as EnquiryLifecycleStatus;
  return (
    STATUS_CONFIG[upper] || {
      label: status || 'Unknown',
      badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      dotClass: 'bg-zinc-400',
      description: 'Enquiry status'
    }
  );
};

