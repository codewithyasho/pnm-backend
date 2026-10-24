export type EnquiryStatus = 'pending' | 'completed';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

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

export type SenderRole = 'user' | 'admin';

export interface ChatMessage {
  id?: number;
  user_email: string;
  user_name: string;
  sender_role: SenderRole;
  message: string;
  is_broadcast: boolean;
  is_read_by_admin: boolean;
  created_at: string;
}

export interface ChatSessionThread {
  corporate_email: string;
  full_name: string;
  is_online: boolean;
  last_active_at: string;
  unread_count: number;
  messages: ChatMessage[];
}

export interface ConversationsResponse {
  status: string;
  online_users: string[];
  threads: ChatSessionThread[];
}

export interface UserPresenceEvent {
  event: 'user_presence';
  user_email: string;
  is_online: boolean;
  online_users: string[];
}

export interface ChatMessageEvent {
  event: 'chat_message';
  data: ChatMessage;
}

