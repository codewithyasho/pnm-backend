import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Save,
} from 'lucide-react';
import {
  getStoredApiBase,
  getStoredApiKey,
  setStoredApiBase,
  setStoredApiKey,
  api,
  DEFAULT_API_BASE,
  DEFAULT_API_KEY,
} from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiBase, setApiBase] = useState(getStoredApiBase());
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiBase(apiBase);
    setStoredApiKey(apiKey);
    onSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Temporarily store to test
      setStoredApiBase(apiBase);
      setStoredApiKey(apiKey);

      await api.checkHealth();
      const usersRes = await api.getUsers();

      // Test SSE stream connectivity via header-authenticated fetch (no URL query params)
      let sseSuccess = true;
      try {
        const testController = new AbortController();
        const testTimer = setTimeout(() => testController.abort(), 2000);
        const sseRes = await fetch(`${apiBase.replace(/\/$/, '')}/admin/sse/stream`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Accept': 'text/event-stream',
          },
          signal: testController.signal,
        });
        clearTimeout(testTimer);
        testController.abort();
        sseSuccess = sseRes.ok;
      } catch {
        sseSuccess = false;
      }

      setTestResult({
        success: true,
        message: `Success! Connected to FastAPI backend (${usersRes.count} records). SSE Stream: ${
          sseSuccess ? 'Connected (Ready for real-time live events)' : 'Pending backend SSE deployment'
        }.`,
      });
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setApiBase(DEFAULT_API_BASE);
    setApiKey(DEFAULT_API_KEY);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">API & Security Configuration</h3>
                <p className="text-xs text-slate-400">Manage backend endpoint & authentication credentials</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-6 space-y-4 text-sm">
            {/* Backend URL input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-600" />
                <span>Backend Base URL</span>
              </label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="https://api.theseventhsip.online"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                FastAPI address (default: <span className="font-mono">https://api.theseventhsip.online</span>)
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => setApiBase('https://api.theseventhsip.online')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
                >
                  VPS Cloud
                </button>
                <button
                  type="button"
                  onClick={() => setApiBase('http://127.0.0.1:8000')}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
                >
                  Local (127.0.0.1:8000)
                </button>
              </div>
            </div>

            {/* Admin API Key input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin API Key (x-api-key)</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Value matching <span className="font-mono">ADMIN_KEY</span> in backend/.env (default: <span className="font-mono">123</span>)
              </p>
            </div>

            {/* Test result status message */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="font-medium">{testResult.message}</div>
              </div>
            )}

            {/* Test Button & Reset */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Reset to Defaults
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{testing ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
