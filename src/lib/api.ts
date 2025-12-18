// F:\Imtiaj Sajin\property-prospector\src\lib\api.ts

// API client for backend communication
// Change this to your VPS URL when deployed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backendproperty.bulkscraper.cloud';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Request failed' };
    }
    
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// User API
export const userApi = {
  getAll: () => fetchApi<User[]>('/api/users'),
  create: (username: string, pass: string) => 
    fetchApi<{ id: number; username: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ username, pass }),
    }),
  delete: (id: number) => 
    fetchApi<{ message: string }>(`/api/users/${id}`, { method: 'DELETE' }),
};

// Data API
export const dataApi = {
  upload: (rows: { name: string; address: string }[], batchCode?: string) =>
    fetchApi<{ insertedCount: number; batchCode: string }>('/api/data/upload', {
      method: 'POST',
      body: JSON.stringify({ rows, batchCode }),
    }),
  
  getAll: (params?: { status?: string; batch?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.batch) searchParams.set('batch', params.batch);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    return fetchApi<{ data: DataRow[]; total: number }>(`/api/data?${searchParams}`);
  },
  
  getStats: () => fetchApi<Stats>('/api/stats'),
  getBatches: () => fetchApi<Batch[]>('/api/batches'),
};

// Health check
export const healthCheck = () => fetchApi<{ status: string }>('/api/health');

// Types
export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface DataRow {
  id: number;
  raw_name: string | null;
  raw_address: string | null;
  fastpeoplesearch_url: string | null;
  truepeoplesearch_url: string | null;
  searchpeoplefree_url: string | null;
  scrapped_from: number | null;
  status: string | null;
  scraped_name: string | null;
  best_email: string | null;
  best_number: string | null;
  scraped_emails: string | null;
  scraped_numbers: string | null;
  batch: string | null;
  scraped_by: number | null;
  scraped_by_name: string | null;
  created_at: string;
  scraped_at: string | null;
}

export interface Stats {
  overall: {
    total: number;
    pending: number;
    completed: number;
    errors: number;
  };
  today: {
    total: number;
    completed: number;
    errors: number;
  };
  performance: Array<{
    username: string;
    date: string;
    completed: number;
    errors: number;
  }>;
  users: Array<{
    username: string;
  }>;
  byDate: Array<{
    date: string;
    total: number;
    completed: number;
    errors: number;
  }>;
  batches: Array<{
    batch_code: string;
    total_rows: number;
    created_at: string;
    scraped_at: string;
    completed: number;
    errors: number;
  }>;
}

export interface Batch {
  id: number;
  batch_code: string;
  total_rows: number;
  uploaded_by: number | null;
  created_at: string;
  completed: number;
  pending: number;
}
