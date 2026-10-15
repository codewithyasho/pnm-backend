export type EnquiryStatus = 'pending' | 'completed';

export interface UserEnquiry {
  id: number;
  full_name: string;
  corporate_email: string;
  phone_number: string;
  company_name: string;
  employee_count?: string | null;
  primary_interest?: string | null;
  specific_requirements?: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface ListUsersResponse {
  status: string;
  count: number;
  users: UserEnquiry[];
}

export interface ListCompaniesResponse {
  status: string;
  count: number;
  companies: string[];
}

export interface ListEmailsResponse {
  status: string;
  count: number;
  emails: string[];
}

export interface ListPhonesResponse {
  status: string;
  count: number;
  phones: string[];
}

export interface ListNamesResponse {
  status: string;
  count: number;
  names: string[];
}

export interface FilterParams {
  full_name?: string;
  corporate_email?: string;
  phone_number?: string;
  company_name?: string;
  primary_interest?: string;
  status?: EnquiryStatus;
  created_at?: string;
  skip?: number;
  limit?: number;
}
