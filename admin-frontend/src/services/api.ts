import type {
  UserEnquiry,
  ListUsersResponse,
  ListCompaniesResponse,
  ListEmailsResponse,
  ListPhonesResponse,
  ListNamesResponse,
  FilterParams,
  EnquiryStatus,
  SSEConnectionStatus,
  ConversationsResponse,
  ChatMessage,
  UserPresenceEvent,
  SessionModeChangedEvent,
} from '../types';

export const DEFAULT_API_BASE = 'https://yashodeep2006-finewavetech-api.hf.space';
export const DEFAULT_API_KEY = '123';

export const getStoredApiKey = (): string => {
  return localStorage.getItem('pnm_admin_api_key') || DEFAULT_API_KEY;
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem('pnm_admin_api_key', key.trim());
};

export const getStoredApiBase = (): string => {
  const stored = localStorage.getItem('pnm_admin_api_base');
  if (stored) return stored;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://127.0.0.1:8000';
  }
  return DEFAULT_API_BASE;
};

export const setStoredApiBase = (url: string): void => {
  let cleaned = url.trim();
  if (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  localStorage.setItem('pnm_admin_api_base', cleaned);
};

export const getWsBaseUrl = (httpUrl: string): string => {
  return httpUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
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

  deleteUser: async (id: number): Promise<{ status: string; message: string }> => {
    return makeRequest<{ status: string; message: string }>(`/admin/delete/user/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Real-time Server-Sent Events (SSE) Stream Subscription via fetch() ReadableStream.
   * Sends API key securely via "x-api-key" HTTP Header (NO query parameters in URL).
   * Endpoint: GET /admin/sse/stream
   * Headers: { "x-api-key": <ADMIN_KEY>, "Accept": "text/event-stream" }
   * Broadcasts: event: new_enquiry
   *
   * @param onNewEnquiry Callback invoked when a 'new_enquiry' event is received
   * @param onStatusChange Callback invoked when connection status changes
   * @returns Cleanup function to cleanly abort the stream connection
   */
  subscribeToEnquiries: (
    onNewEnquiry: (enquiry: UserEnquiry) => void,
    onStatusChange?: (status: SSEConnectionStatus) => void
  ): (() => void) => {
    const base = getStoredApiBase();
    const apiKey = getStoredApiKey();
    const sseUrl = `${base}/admin/sse/stream`;

    let abortController = new AbortController();
    let isAborted = false;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      if (isAborted) return;
      onStatusChange?.('connecting');

      // Create a fresh AbortController for each attempt
      abortController = new AbortController();

      try {
        const response = await fetch(sseUrl, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE HTTP Error ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported or response body empty');
        }

        onStatusChange?.('connected');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (!isAborted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE messages are separated by double newlines (\n\n or \r\n\r\n)
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split(/\r?\n/);
            let eventType = 'message';
            let eventData = '';

            for (const line of lines) {
              const trimmed = line.trim();
              // Ignore comments / heartbeats (lines starting with ':') or empty lines
              if (!trimmed || trimmed.startsWith(':')) continue;

              if (trimmed.startsWith('event:')) {
                eventType = trimmed.slice(6).trim();
              } else if (trimmed.startsWith('data:')) {
                const dataSlice = trimmed.slice(5).trim();
                eventData = eventData ? `${eventData}\n${dataSlice}` : dataSlice;
              }
            }

            // If it's a new_enquiry event and has data, parse JSON
            if (eventType === 'new_enquiry' && eventData) {
              try {
                const newEnquiry: UserEnquiry = JSON.parse(eventData);
                onNewEnquiry(newEnquiry);
              } catch (parseErr) {
                console.error('[SSE] Failed to parse new_enquiry JSON:', parseErr, eventData);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (isAborted || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        console.warn('[SSE] Stream disconnected or network error:', err);
        onStatusChange?.('error');
      }

      // If connection closed or broke and not aborted, auto-reconnect after 3 seconds
      if (!isAborted) {
        reconnectTimeout = setTimeout(() => {
          if (!isAborted) {
            connect();
          }
        }, 3000);
      }
    };

    connect();

    return () => {
      isAborted = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      abortController.abort();
      onStatusChange?.('disconnected');
    };
  },

  getConversations: async (): Promise<ConversationsResponse> => {
    return makeRequest<ConversationsResponse>('/admin/chat/conversations');
  },

  markMessagesRead: async (email: string): Promise<{ status: string; marked_read: number }> => {
    return makeRequest<{ status: string; marked_read: number }>(`/admin/chat/read/${encodeURIComponent(email)}`, {
      method: 'PATCH',
    });
  },

  deleteChatThread: async (email: string): Promise<{ status: string; message: string }> => {
    return makeRequest<{ status: string; message: string }>(`/admin/chat/thread/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  },

  deleteBroadcastMessage: async (messageId: number): Promise<{ status: string; message: string }> => {
    return makeRequest<{ status: string; message: string }>(`/admin/chat/broadcast/${messageId}`, {
      method: 'DELETE',
    });
  },

  returnThreadToAI: async (email: string): Promise<{ status: string; message: string }> => {
    return makeRequest<{ status: string; message: string }>(`/admin/chat/handback/${encodeURIComponent(email)}`, {
      method: 'PATCH',
    });
  },

  connectAdminChatWS: (
    onMessage: (msg: ChatMessage) => void,
    onPresence: (presence: UserPresenceEvent) => void,
    onStatusChange?: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void,
    onModeChange?: (mode: SessionModeChangedEvent) => void
  ): {
    send: (toEmail: string | null, message: string) => boolean;
    close: () => void;
  } => {
    const base = getStoredApiBase();
    const apiKey = getStoredApiKey();
    const wsBase = getWsBaseUrl(base);
    const wsUrl = `${wsBase}/admin/ws/admin?token=${encodeURIComponent(apiKey)}`;

    let ws: WebSocket | null = null;
    let isClosed = false;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (isClosed) return;
      onStatusChange?.('connecting');

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          onStatusChange?.('connected');
        };

        ws.onmessage = (event) => {
          try {
            const packet = JSON.parse(event.data);
            if (packet.event === 'chat_message' && packet.data) {
              onMessage(packet.data);
            } else if (packet.event === 'user_presence') {
              onPresence(packet as UserPresenceEvent);
            } else if (packet.event === 'session_mode_changed') {
              onModeChange?.(packet as SessionModeChangedEvent);
            }
          } catch (err) {
            console.error('[Admin Chat WS] Error parsing packet:', err);
          }
        };

        ws.onerror = (err) => {
          console.warn('[Admin Chat WS] Error:', err);
          onStatusChange?.('error');
        };

        ws.onclose = () => {
          onStatusChange?.('disconnected');
          if (!isClosed) {
            reconnectTimeout = setTimeout(() => {
              if (!isClosed) connect();
            }, 3000);
          }
        };
      } catch (err) {
        console.error('[Admin Chat WS] Failed to initialize WebSocket:', err);
        onStatusChange?.('error');
      }
    };

    connect();

    return {
      send: (toEmail: string | null, message: string): boolean => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          return false;
        }
        ws.send(JSON.stringify({ to_email: toEmail, message }));
        return true;
      },
      close: () => {
        isClosed = true;
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (ws) ws.close();
      },
    };
  },
};
