import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type {
  UserEnquiry,
  EnquiryStatus,
  SSEConnectionStatus,
  ChatSessionThread,
  ChatMessage,
  UserPresenceEvent,
} from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import type { ActiveTab } from './components/Sidebar';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { EnquiriesTable } from './components/EnquiriesTable';
import { EnquiryDetailModal } from './components/EnquiryDetailModal';
import { CompanyDirectory } from './components/CompanyDirectory';
import { ContactsDirectory } from './components/ContactsDirectory';
import { SettingsModal } from './components/SettingsModal';
import { OverviewView } from './components/OverviewView';
import { LiveChatView } from './components/LiveChatView';
import { ToastContainer } from './components/Toast';
import type { ToastMessage, ToastType } from './components/Toast';
import { AlertCircle, RotateCw } from 'lucide-react';

export function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<UserEnquiry | null>(null);

  // Data state
  const [enquiries, setEnquiries] = useState<UserEnquiry[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [phones, setPhones] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);

  // Loading & sync state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Real-time SSE state
  const [sseStatus, setSseStatus] = useState<SSEConnectionStatus>('connecting');
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [configVersion, setConfigVersion] = useState(0);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Live Support Chat State
  const [chatThreads, setChatThreads] = useState<ChatSessionThread[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [chatWsStatus, setChatWsStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSenderRef = useRef<((toEmail: string | null, message: string) => boolean) | null>(null);

  // Total unread chat messages across all threads
  const totalUnreadChat = useMemo(() => {
    return chatThreads.reduce((sum, t) => sum + (t.unread_count || 0), 0);
  }, [chatThreads]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all initial data from endpoints
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setLoadError(null);

    try {
      // Check health
      try {
        await api.checkHealth();
        setBackendHealthy(true);
      } catch {
        setBackendHealthy(false);
      }

      // Fetch users list
      const usersRes = await api.getUsers();
      setEnquiries(usersRes.users || []);

      // Fetch auxiliary distinct lists in parallel
      const [companiesRes, emailsRes, phonesRes, namesRes] = await Promise.allSettled([
        api.getCompanies(),
        api.getEmails(),
        api.getPhones(),
        api.getNames(),
      ]);

      if (companiesRes.status === 'fulfilled') {
        setCompanies(companiesRes.value.companies || []);
      }
      if (emailsRes.status === 'fulfilled') {
        setEmails(emailsRes.value.emails || []);
      }
      if (phonesRes.status === 'fulfilled') {
        setPhones(phonesRes.value.phones || []);
      }
      if (namesRes.status === 'fulfilled') {
        setNames(namesRes.value.names || []);
      }

      if (isSilent) {
        addToast('Dashboard data refreshed successfully', 'success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setLoadError(msg);
      setBackendHealthy(false);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, configVersion]);

  // Real-Time Server-Sent Events (SSE) Stream Subscription
  useEffect(() => {
    const unsubscribe = api.subscribeToEnquiries(
      (newEnquiry) => {
        // 1. Prepend newly received enquiry into memory immediately
        setEnquiries((prev) => {
          const exists = prev.some((e) => e.id === newEnquiry.id);
          if (exists) {
            return prev.map((e) => (e.id === newEnquiry.id ? newEnquiry : e));
          }
          return [newEnquiry, ...prev];
        });

        // 2. Incrementally add any new company, email, phone, or name into filter dropdowns
        if (newEnquiry.company_name) {
          setCompanies((prev) =>
            prev.some((c) => c.toLowerCase() === newEnquiry.company_name.toLowerCase())
              ? prev
              : [newEnquiry.company_name, ...prev]
          );
        }
        if (newEnquiry.corporate_email) {
          setEmails((prev) =>
            prev.includes(newEnquiry.corporate_email) ? prev : [newEnquiry.corporate_email, ...prev]
          );
        }
        if (newEnquiry.phone_number) {
          setPhones((prev) =>
            prev.includes(newEnquiry.phone_number) ? prev : [newEnquiry.phone_number, ...prev]
          );
        }
        if (newEnquiry.full_name) {
          setNames((prev) =>
            prev.includes(newEnquiry.full_name) ? prev : [newEnquiry.full_name, ...prev]
          );
        }

        // 3. Briefly highlight the new row/card so the admin's attention is drawn to it
        setHighlightedId(newEnquiry.id);
        setTimeout(() => {
          setHighlightedId((curr) => (curr === newEnquiry.id ? null : curr));
        }, 8000);

        // 4. Alert with instant real-time notification
        addToast(
          `🔔 Real-Time Enquiry: ${newEnquiry.full_name} (${newEnquiry.company_name || 'Individual'})`,
          'success'
        );
      },
      (status) => {
        setSseStatus(status);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [addToast, configVersion]);

  // Load chat conversations from backend SQLite tables
  const loadChatConversations = useCallback(async () => {
    setIsChatLoading(true);
    try {
      const res = await api.getConversations();
      if (res && res.threads) {
        setChatThreads(res.threads);
        setOnlineUsers(res.online_users || []);
      }
    } catch (err) {
      console.warn('Failed to load chat conversations:', err);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  // Fetch initial chat data
  useEffect(() => {
    loadChatConversations();
  }, [loadChatConversations, configVersion]);

  // Connect Admin Chat WebSocket for live presence and messaging
  useEffect(() => {
    const wsClient = api.connectAdminChatWS(
      // onMessage
      (msg: ChatMessage) => {
        setChatThreads((prev) => {
          if (msg.is_broadcast) {
            // Append broadcast message to all threads
            return prev.map((t) => ({
              ...t,
              messages: [...t.messages, msg],
              last_active_at: msg.created_at,
            }));
          }

          const targetEmail = msg.user_email.toLowerCase();
          const threadExists = prev.some((t) => t.corporate_email.toLowerCase() === targetEmail);

          if (!threadExists) {
            // New visitor conversation! Reload threads
            loadChatConversations();
            return prev;
          }

          return prev.map((t) => {
            if (t.corporate_email.toLowerCase() === targetEmail) {
              const isUserSender = msg.sender_role === 'user';
              return {
                ...t,
                messages: [...t.messages, msg],
                last_active_at: msg.created_at,
                unread_count: isUserSender ? t.unread_count + 1 : t.unread_count,
              };
            }
            return t;
          });
        });

        // Show toast alert for incoming visitor message
        if (msg.sender_role === 'user') {
          addToast(
            `💬 Message from ${msg.user_name || msg.user_email}: "${msg.message.length > 35 ? msg.message.slice(0, 35) + '...' : msg.message}"`,
            'info'
          );
        }
      },
      // onPresence
      (presence: UserPresenceEvent) => {
        const onlineList = presence.online_users || [];
        setOnlineUsers(onlineList);
        setChatThreads((prev) =>
          prev.map((t) => ({
            ...t,
            is_online: onlineList.includes(t.corporate_email.toLowerCase()),
          }))
        );
      },
      // onStatusChange
      (status) => {
        setChatWsStatus(status);
      }
    );

    chatSenderRef.current = wsClient.send;

    return () => {
      wsClient.close();
      chatSenderRef.current = null;
    };
  }, [addToast, loadChatConversations, configVersion]);

  // Send Chat message action (1-on-1 reply or global broadcast)
  const handleSendChatMessage = useCallback((toEmail: string | null, message: string): boolean => {
    if (!chatSenderRef.current) {
      addToast('Chat server is reconnecting. Please try again.', 'error');
      return false;
    }
    const success = chatSenderRef.current(toEmail, message);
    if (!success) {
      addToast('Failed to deliver message via WebSocket.', 'error');
      return false;
    }
    if (toEmail === null) {
      addToast('📢 Global announcement broadcast to all visitors!', 'success');
    }
    return true;
  }, [addToast]);

  // Mark chat as read
  const handleMarkChatRead = useCallback(async (email: string) => {
    setChatThreads((prev) =>
      prev.map((t) =>
        t.corporate_email.toLowerCase() === email.toLowerCase()
          ? { ...t, unread_count: 0 }
          : t
      )
    );
    try {
      await api.markMessagesRead(email);
    } catch (err) {
      console.warn('Failed to mark messages as read on backend:', err);
    }
  }, []);

  // Handle Enquiry Status Update (Calls PATCH /admin/update/status/{id})
  const handleUpdateStatus = async (id: number, newStatus: EnquiryStatus) => {
    setUpdatingId(id);
    try {
      const updated = await api.updateStatus(id, newStatus);

      // Update in memory
      setEnquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
      );

      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: updated.status } : null));
      }

      addToast(
        `Enquiry #${id} marked as ${updated.status}`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      addToast(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Enquiry Deletion (Calls DELETE /admin/delete/user/{id})
  const handleDeleteUser = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await api.deleteUser(id);

      // Remove from memory immediately
      setEnquiries((prev) => prev.filter((item) => item.id !== id));

      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry(null);
      }

      addToast(res.message || `User with id ${id} has been deleted.`, 'success');

      // Refresh auxiliary distinct lists in background
      Promise.allSettled([
        api.getCompanies(),
        api.getEmails(),
        api.getPhones(),
        api.getNames(),
      ]).then(([compRes, emailRes, phoneRes, nameRes]) => {
        if (compRes.status === 'fulfilled') setCompanies(compRes.value.companies || []);
        if (emailRes.status === 'fulfilled') setEmails(emailRes.value.emails || []);
        if (phoneRes.status === 'fulfilled') setPhones(phoneRes.value.phones || []);
        if (nameRes.status === 'fulfilled') setNames(nameRes.value.names || []);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user';
      addToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`Copied ${label} to clipboard`, 'success');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setSelectedCompany('');
    setSelectedInterest('');
    addToast('All filters reset', 'info');
  };

  // Filtered enquiries computation
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // Status filter
      if (statusFilter && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Company filter
      if (
        selectedCompany &&
        item.company_name.toLowerCase() !== selectedCompany.toLowerCase()
      ) {
        return false;
      }

      // Interest filter
      if (
        selectedInterest &&
        (!item.primary_interest ||
          item.primary_interest.toLowerCase() !== selectedInterest.toLowerCase())
      ) {
        return false;
      }

      // Search term filter (full_name, email, phone, company, requirements, interest)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          item.full_name?.toLowerCase().includes(term) ||
          item.corporate_email?.toLowerCase().includes(term) ||
          item.phone_number?.toLowerCase().includes(term) ||
          item.company_name?.toLowerCase().includes(term) ||
          item.primary_interest?.toLowerCase().includes(term) ||
          item.specific_requirements?.toLowerCase().includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [enquiries, statusFilter, selectedCompany, selectedInterest, searchTerm]);

  // Derived unique lists for dropdowns
  const uniqueInterests = useMemo(() => {
    const set = new Set<string>();
    enquiries.forEach((e) => {
      if (e.primary_interest) set.add(e.primary_interest);
    });
    return Array.from(set);
  }, [enquiries]);

  // Metrics
  const pendingCount = useMemo(
    () => enquiries.filter((e) => e.status.toLowerCase() === 'pending').length,
    [enquiries]
  );
  const completedCount = useMemo(
    () => enquiries.filter((e) => e.status.toLowerCase() === 'completed').length,
    [enquiries]
  );

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEnquiries.length === 0) {
      addToast('No enquiries to export', 'error');
      return;
    }

    const headers = [
      'ID',
      'Full Name',
      'Corporate Email',
      'Phone Number',
      'Company Name',
      'Employee Count',
      'Primary Interest',
      'Specific Requirements',
      'Status',
      'Created At',
    ];

    const rows = filteredEnquiries.map((e) => [
      e.id,
      `"${(e.full_name || '').replace(/"/g, '""')}"`,
      `"${(e.corporate_email || '').replace(/"/g, '""')}"`,
      `"${(e.phone_number || '').replace(/"/g, '""')}"`,
      `"${(e.company_name || '').replace(/"/g, '""')}"`,
      `"${(e.employee_count || '').replace(/"/g, '""')}"`,
      `"${(e.primary_interest || '').replace(/"/g, '""')}"`,
      `"${(e.specific_requirements || '').replace(/"/g, '""')}"`,
      e.status,
      e.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PNM_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${filteredEnquiries.length} records to CSV`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onRefresh={() => loadDashboardData(true)}
        onExport={handleExportCSV}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
        isBackendHealthy={backendHealthy}
        totalRecords={enquiries.length}
        sseStatus={sseStatus}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Responsive Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pendingCount={pendingCount}
          completedCount={completedCount}
          totalCompanies={companies.length}
          unreadChatCount={totalUnreadChat}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Error Banner when connection fails */}
          {loadError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Failed to connect to FastAPI Backend</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{loadError}</p>
                  <p className="text-[11px] text-rose-600 mt-1">
                    Please ensure the backend is available at <span className="font-mono">https://yashodeep2006-finewavetech-api.hf.space</span> and the API Key is valid.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold hover:bg-rose-100/50"
                >
                  Configure API
                </button>
                <button
                  onClick={() => loadDashboardData()}
                  className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                  title="Retry"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StatsCards
                total={enquiries.length}
                pending={pendingCount}
                completed={completedCount}
                companiesCount={companies.length}
                onFilterStatus={(st) => {
                  setStatusFilter(st);
                  setActiveTab('enquiries');
                }}
                activeStatusFilter={statusFilter}
              />

              <OverviewView
                enquiries={enquiries}
                companies={companies}
                onNavigateToTab={setActiveTab}
                onSelectEnquiry={setSelectedEnquiry}
                onUpdateStatus={handleUpdateStatus}
                updatingId={updatingId}
              />
            </div>
          )}

          {/* Client Enquiries Tab */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              <StatsCards
                total={enquiries.length}
                pending={pendingCount}
                completed={completedCount}
                companiesCount={companies.length}
                onFilterStatus={setStatusFilter}
                activeStatusFilter={statusFilter}
              />

              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                selectedCompany={selectedCompany}
                onCompanyChange={setSelectedCompany}
                selectedInterest={selectedInterest}
                onInterestChange={setSelectedInterest}
                companiesList={companies}
                interestList={uniqueInterests}
                onReset={handleResetFilters}
              />

              <EnquiriesTable
                enquiries={filteredEnquiries}
                isLoading={isLoading}
                onSelectEnquiry={setSelectedEnquiry}
                onUpdateStatus={handleUpdateStatus}
                updatingId={updatingId}
                onCopyText={handleCopyText}
                onDeleteUser={handleDeleteUser}
                deletingId={deletingId}
                highlightedId={highlightedId}
              />
            </div>
          )}

          {/* Companies Directory Tab */}
          {activeTab === 'companies' && (
            <CompanyDirectory
              companies={companies}
              enquiries={enquiries}
              onSelectCompany={(comp) => {
                setSelectedCompany(comp);
                setActiveTab('enquiries');
                addToast(`Filtered by ${comp}`, 'info');
              }}
            />
          )}

          {/* Contacts Hub Tab */}
          {activeTab === 'contacts' && (
            <ContactsDirectory
              names={names}
              emails={emails}
              phones={phones}
              onSelectContact={(type, val) => {
                setSearchTerm(val);
                setActiveTab('enquiries');
                addToast(`Filtered by ${type}: ${val}`, 'info');
              }}
              onCopyText={handleCopyText}
            />
          )}

          {/* Live Support Chat Tab */}
          {activeTab === 'chat' && (
            <LiveChatView
              threads={chatThreads}
              onlineUsers={onlineUsers}
              onSendMessage={handleSendChatMessage}
              onMarkRead={handleMarkChatRead}
              wsStatus={chatWsStatus}
              onRefresh={loadChatConversations}
              isLoading={isChatLoading}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">API & System Settings</h3>
              <p className="text-sm text-slate-500 mb-6">
                Manage backend connection string, security tokens, and view available endpoints.
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
              >
                Open API Configuration Dialog
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Enquiry Detail Modal */}
      <EnquiryDetailModal
        enquiry={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updatingId === selectedEnquiry?.id}
        onCopyText={handleCopyText}
        onDeleteUser={handleDeleteUser}
        isDeleting={deletingId === selectedEnquiry?.id}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          addToast('API settings saved successfully', 'success');
          setConfigVersion((v) => v + 1);
          loadDashboardData();
        }}
      />
    </div>
  );
}

export default App;
