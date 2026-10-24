import { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Radio,
  Search,
  Megaphone,
  RotateCw,
  X,
  Copy,
  Check,
  Wifi,
  WifiOff,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import type { ChatSessionThread } from '../types';

interface LiveChatViewProps {
  threads: ChatSessionThread[];
  onlineUsers: string[];
  onSendMessage: (toEmail: string | null, message: string) => boolean;
  onMarkRead: (email: string) => Promise<void>;
  onDeleteThread: (email: string) => Promise<boolean>;
  onDeleteBroadcast: (messageId: number) => Promise<boolean>;
  wsStatus: 'connecting' | 'connected' | 'error' | 'disconnected';
  onRefresh: () => void;
  isLoading: boolean;
}

export const LiveChatView: React.FC<LiveChatViewProps> = ({
  threads,
  onlineUsers,
  onSendMessage,
  onMarkRead,
  onDeleteThread,
  onDeleteBroadcast,
  wsStatus,
  onRefresh,
  isLoading,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'unread'>('all');
  const [replyText, setReplyText] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [deletingBroadcastId, setDeletingBroadcastId] = useState<number | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-select first thread on desktop if none selected yet and threads exist
  useEffect(() => {
    if (!selectedEmail && threads.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      const firstEmail = threads[0].corporate_email;
      setSelectedEmail(firstEmail);
      if (threads[0].unread_count > 0) {
        onMarkRead(firstEmail);
      }
    }
  }, [threads, selectedEmail, onMarkRead]);

  // Selected thread data
  const currentThread = useMemo(() => {
    if (!selectedEmail) return null;
    return (
      threads.find(
        (t) => (t.corporate_email || '').toLowerCase() === selectedEmail.toLowerCase()
      ) || null
    );
  }, [threads, selectedEmail]);

  // Helper to scroll ONLY the messages container (never outer containers or the page)
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Scroll to bottom whenever selected conversation changes (instant)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(false);
    }, 30);
    return () => clearTimeout(timer);
  }, [selectedEmail]);

  // Scroll to bottom smoothly when new messages arrive in the active conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentThread?.messages?.length]);

  // Handle clicking a thread
  const handleSelectThread = (email: string) => {
    setSelectedEmail(email);
    const target = threads.find((t) => (t.corporate_email || '').toLowerCase() === email.toLowerCase());
    if (target && target.unread_count > 0) {
      onMarkRead(email);
    }
    // Prevent focus from scrolling any parent containers
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
  };

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const email = t.corporate_email || '';
      const name = t.full_name || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const isOnline = onlineUsers.includes(email.toLowerCase()) || t.is_online;

      if (!matchesSearch) return false;
      if (filterType === 'online') return isOnline;
      if (filterType === 'unread') return t.unread_count > 0;
      return true;
    });
  }, [threads, searchQuery, filterType, onlineUsers]);

  // Send 1-on-1 Reply
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentThread || !replyText.trim() || isSending) return;

    setIsSending(true);
    const success = onSendMessage(currentThread.corporate_email, replyText.trim());
    if (success) {
      setReplyText('');
    }
    setIsSending(false);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Send Global Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    const success = onSendMessage(null, broadcastText.trim());
    if (success) {
      setBroadcastText('');
      setIsBroadcastModalOpen(false);
    }
  };

  // Clear / Delete Thread and Session
  const handleClearCurrentThread = async () => {
    if (!currentThread || isDeletingThread) return;
    const emailToDelete = currentThread.corporate_email;
    const targetName = currentThread.full_name || emailToDelete;
    if (
      window.confirm(
        `Are you sure you want to delete the chat thread for "${targetName}"? This will permanently remove this visitor and all their messages from the sidebar feed.`
      )
    ) {
      setIsDeletingThread(true);
      const success = await onDeleteThread(emailToDelete);
      setIsDeletingThread(false);

      if (success) {
        // Immediately determine the next thread to select or show empty state
        const remaining = threads.filter(
          (t) => (t.corporate_email || '').toLowerCase() !== emailToDelete.toLowerCase()
        );
        if (remaining.length > 0) {
          setSelectedEmail(remaining[0].corporate_email);
        } else {
          setSelectedEmail(null);
        }
      }
    }
  };

  // Delete Global Broadcast Announcement
  const handleDeleteBroadcastMsg = async (messageId: number) => {
    if (deletingBroadcastId !== null) return;
    if (
      window.confirm(
        'Are you sure you want to delete this global announcement? It will be removed from all visitor chat histories.'
      )
    ) {
      setDeletingBroadcastId(messageId);
      await onDeleteBroadcast(messageId);
      setDeletingBroadcastId(null);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Format timestamp helper
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const onlineCount = useMemo(() => {
    return threads.filter(
      (t) => onlineUsers.includes((t.corporate_email || '').toLowerCase()) || t.is_online
    ).length;
  }, [threads, onlineUsers]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Real-Time Visitor Communication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Support Chat Inbox
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Chat live with landing page visitors, answer prospective client questions in real time, and broadcast instant announcements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* WebSocket status pill */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              wsStatus === 'connected'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : wsStatus === 'connecting'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {wsStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span className="capitalize">{wsStatus}</span>
          </div>

          {/* Broadcast CTA Button */}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all hover:scale-102 active:scale-98"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast to All</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            title="Refresh conversations"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Pane Chat Container (Flexbox side-by-side with responsive master-detail) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] max-h-[calc(100vh-200px)] min-h-[560px]">
        
        {/* LEFT COLUMN: Thread List */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col h-full border-r border-slate-200 bg-slate-50/50 ${
            selectedEmail ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Thread List Header */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Visitor Threads</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{onlineCount} online</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({threads.length})
              </button>
              <button
                onClick={() => setFilterType('online')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterType === 'online'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🟢 Online ({onlineCount})
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterType === 'unread'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Threads Scroll List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {searchQuery ? 'No visitors match your search' : 'No visitor chat sessions yet'}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const threadEmail = thread.corporate_email || '';
                const isSelected =
                  (selectedEmail || '').toLowerCase() === threadEmail.toLowerCase();
                const isOnline =
                  onlineUsers.includes(threadEmail.toLowerCase()) || thread.is_online;
                const lastMsg = thread.messages && thread.messages.length > 0
                  ? thread.messages[thread.messages.length - 1]
                  : null;

                return (
                  <button
                    key={threadEmail}
                    type="button"
                    onClick={() => handleSelectThread(threadEmail)}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 hover:bg-slate-100/80 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600 shadow-xs'
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* User Avatar with Presence Dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {thread.full_name ? thread.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isOnline ? 'Online now' : 'Offline'}
                      />
                    </div>

                    {/* Thread Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isSelected ? 'font-black text-indigo-950' : 'font-bold text-slate-900'}`}>
                          {thread.full_name || 'Anonymous Visitor'}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTime(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mb-1">
                        {threadEmail}
                      </div>

                      {/* Last message preview */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-600 truncate flex-1">
                          {lastMsg ? (
                            lastMsg.is_broadcast ? (
                              <span className="text-amber-600 font-medium">📢 Broadcast: {lastMsg.message}</span>
                            ) : (
                              lastMsg.message
                            )
                          ) : (
                            <span className="text-slate-400 italic">No messages yet</span>
                          )}
                        </p>
                        {thread.unread_count > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Pane */}
        <div
          className={`flex-1 min-w-0 flex flex-col h-full bg-white ${
            selectedEmail ? 'flex' : 'hidden md:flex'
          }`}
        >
          {currentThread ? (
            <>
              {/* Active Conversation Header (Sticky and always visible) */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button to return to thread list */}
                  <button
                    type="button"
                    onClick={() => setSelectedEmail(null)}
                    className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Back to all visitor threads"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {currentThread.full_name ? currentThread.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {currentThread.full_name}
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                          onlineUsers.includes((currentThread.corporate_email || '').toLowerCase()) ||
                          currentThread.is_online
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            onlineUsers.includes((currentThread.corporate_email || '').toLowerCase()) ||
                            currentThread.is_online
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span>
                          {onlineUsers.includes((currentThread.corporate_email || '').toLowerCase()) ||
                          currentThread.is_online
                            ? 'Active On Site'
                            : 'Offline'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                      <span className="truncate">{currentThread.corporate_email}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(currentThread.corporate_email)}
                        className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                        title="Copy email address"
                      >
                        {copiedEmail ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Broadcast</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCurrentThread}
                    disabled={isDeletingThread}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete this visitor thread and chat history"
                  >
                    <Trash2 className={`w-3.5 h-3.5 text-rose-500 ${isDeletingThread ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isDeletingThread ? 'Deleting...' : 'Delete Thread'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Message History Scroll Area (Only this container scrolls) */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40"
              >
                {!currentThread.messages || currentThread.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <MessageSquare className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No messages in this thread yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Send a message below to greet this visitor. They will receive it instantly in their chat widget.
                    </p>
                  </div>
                ) : (
                  currentThread.messages.map((msg, index) => {
                    const isUser = msg.sender_role === 'user';
                    const isBroadcast = msg.is_broadcast;

                    if (isBroadcast) {
                      return (
                        <div key={msg.id || `bc-${index}`} className="flex justify-center my-3 group">
                          <div className="max-w-md w-full bg-amber-50/90 border border-amber-200 rounded-2xl p-3 shadow-xs hover:border-amber-300 transition-all">
                            <div className="flex items-center justify-between text-amber-800 font-bold text-xs mb-1">
                              <div className="flex items-center gap-1.5">
                                <Megaphone className="w-3.5 h-3.5 text-amber-600" />
                                <span>Global Announcement</span>
                              </div>
                              {msg.id && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBroadcastMsg(msg.id!)}
                                  disabled={deletingBroadcastId === msg.id}
                                  className="p-1 rounded-lg text-amber-700/60 hover:text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
                                  title="Delete this broadcast announcement"
                                >
                                  <Trash2 className={`w-3.5 h-3.5 ${deletingBroadcastId === msg.id ? 'animate-spin text-rose-600' : ''}`} />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-amber-900 leading-relaxed">{msg.message}</p>
                            <div className="text-[10px] text-amber-700/80 text-right mt-1">
                              {formatDate(msg.created_at)} • {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id || `msg-${index}`}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {isUser ? currentThread.full_name : 'You (Admin)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isUser
                              ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-sm'
                              : 'bg-indigo-600 text-white rounded-tr-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSendReply}
                className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-end gap-2 shrink-0 z-10"
              >
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Reply to ${currentThread.full_name}... (Press Enter to send, Shift+Enter for newline)`}
                    className="w-full resize-none p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102 active:scale-98 shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1">
                Select a Visitor Conversation
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Choose a visitor thread from the sidebar to view their message history and reply in real time.
              </p>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Send Global Broadcast</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* GLOBAL BROADCAST MODAL */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Broadcast to All Visitors</h3>
                  <p className="text-amber-100 text-xs">Live Website Announcement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800">
                ⚡ <strong>Instant Delivery:</strong> This announcement will appear immediately on every active visitor&apos;s screen across the entire website and will be preserved in their chat history.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Announcement Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g. 👋 Hello everyone! Our Senior HR Advisors are offering complimentary 1-on-1 consultations today. Feel free to ask any question here!"
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                >
                  Publish Announcement 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
