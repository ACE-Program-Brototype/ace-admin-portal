# ACE Admin Portal - Frontend

Modern, responsive web dashboard built with React, Vite, TypeScript, and Tailwind CSS for managing ACE candidate inquiries and form submissions.

## Tech Stack
- **Framework**: React 18 + Vite (ESM)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management & Caching**: TanStack Query (React Query v5)
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

## Features
- **Admin JWT Authentication**:
  - Secure login with email and password
  - Auto-injection of JWT Bearer tokens in Axios interceptors
  - Protected route guard redirecting unauthenticated traffic to `/login`
- **Candidate Submissions Console**:
  - Live data caching, background refetching, and window focus sync via TanStack Query
  - Debounced search bar (matches name, email, phone, or batch)
  - Filtering by student affiliation (All / Brototype Students / General Inquiries)
  - Filtering by Google Sheets sync status (`synced`, `pending`, `failed`)
  - Configurable page size (10, 20, 50 per page) and pagination
- **Submission Detail Modal**:
  - Comprehensive candidate profile, contact information, affiliation, inquiry message, and Google Sheets replication status
  - One-click copy ID and email utilities
- **Metrics Overview**:
  - Summary cards for total inquiries, Brototype student counts, synchronization stats, and pending jobs

## Scripts

```bash
# Install dependencies
npm install

# Start development server on http://localhost:5173
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
