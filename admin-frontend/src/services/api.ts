import type {
  UserEnquiry,
  ListUsersResponse,
  ListCompaniesResponse,
  ListEmailsResponse,
  ListPhonesResponse,
  ListNamesResponse,
  FilterParams,
  EnquiryStatus,
} from '../types';

export const DEFAULT_API_BASE = 'http://127.0.0.1:8000';
export const DEFAULT_API_KEY = '123';

export const getStoredApiKey = (): string => {
  return localStorage.getItem('pnm_admin_api_key') || DEFAULT_API_KEY;
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem('pnm_admin_api_key', key.trim());
};

export const getStoredApiBase = (): string => {
  return localStorage.getItem('pnm_admin_api_base') || DEFAULT_API_BASE;
};

export const setStoredApiBase = (url: string): void => {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  localStorage.setItem('pnm_admin_api_base', cleaned);
};

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const base = getStoredApiBase();
  const apiKey = getStoredApiKey();
  const url = `${base}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `Request failed (${response.status} ${response.statusText})`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          if (typeof errorJson.detail === 'string') {
            errorMsg = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorMsg = errorJson.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ');
          }
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Unknown network error occurred');
  }
};

export const api = {
  checkHealth: async (): Promise<{ status: string; message?: string }> => {
    const base = getStoredApiBase();
    try {
      const res = await fetch(`${base}/`, { method: 'GET' });
      if (!res.ok) throw new Error('Backend health check returned non-200');
      return await res.json();
    } catch {
      throw new Error('Could not connect to backend server at ' + base);
    }
  },

  getUsers: async (): Promise<ListUsersResponse> => {
    return makeRequest<ListUsersResponse>('/admin/list/users');
  },

  getCompanies: async (): Promise<ListCompaniesResponse> => {
    return makeRequest<ListCompaniesResponse>('/admin/list/companies');
  },

  getEmails: async (): Promise<ListEmailsResponse> => {
    return makeRequest<ListEmailsResponse>('/admin/list/emails');
  },

  getPhones: async (): Promise<ListPhonesResponse> => {
    return makeRequest<ListPhonesResponse>('/admin/list/numbers');
  },

  getNames: async (): Promise<ListNamesResponse> => {
    return makeRequest<ListNamesResponse>('/admin/list/names');
  },

  filterUsers: async (params: FilterParams): Promise<{ status: string; count: number; users: UserEnquiry[] }> => {
    const query = new URLSearchParams();
    if (params.full_name) query.append('full_name', params.full_name);
    if (params.corporate_email) query.append('corporate_email', params.corporate_email);
    if (params.phone_number) query.append('phone_number', params.phone_number);
    if (params.company_name) query.append('company_name', params.company_name);
    if (params.primary_interest) query.append('primary_interest', params.primary_interest);
    if (params.status) query.append('status', params.status);
    if (params.created_at) query.append('created_at', params.created_at);
    if (params.skip !== undefined) query.append('skip', params.skip.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    return makeRequest<{ status: string; count: number; users: UserEnquiry[] }>(`/admin/filter?${query.toString()}`);
  },

  updateStatus: async (id: number, status: EnquiryStatus): Promise<UserEnquiry> => {
    return makeRequest<UserEnquiry>(`/admin/update/status/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
