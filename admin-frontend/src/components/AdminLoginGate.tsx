import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Lock,
  Eye,
  EyeOff,
  RotateCw,
  AlertCircle,
  ShieldCheck,
  Server,
  ArrowRight,
  Settings2,
  Check,
} from 'lucide-react';
import {
  api,
  setApiKey,
  getStoredApiBase,
  setStoredApiBase,
  DEFAULT_API_BASE,
} from '../services/api';

interface AdminLoginGateProps {
  onLoginSuccess: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({ onLoginSuccess }) => {
  const [enteredKey, setEnteredKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Advanced server URL adjustment toggle
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(getStoredApiBase());
  const [serverSavedNotice, setServerSavedNotice] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus key input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSaveServerUrl = () => {
    setStoredApiBase(serverUrl);
    setServerSavedNotice(true);
    setTimeout(() => setServerSavedNotice(false), 2500);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredKey.trim()) {
      setErrorMessage('Please enter your Administrator Security Key.');
      inputRef.current?.focus();
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // Save any custom endpoint first
      setStoredApiBase(serverUrl);

      // Verify key against FastAPI backend: GET /admin/list/users with x-api-key header
      await api.verifyAdminKey(enteredKey);

      // Store in memory ONLY
      setApiKey(enteredKey);
      onLoginSuccess();
    } catch (err: unknown) {
      // On failure, keep unauthenticated and clear in-memory key
      setApiKey('');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Invalid Admin Security Key. Access Denied.');
      }
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full px-6 py-6 sm:px-10 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                People Network Management
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                LLP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wider uppercase font-semibold">
              Enterprise Admin Portal
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>In-Memory Auth Gate</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
            {/* Top Icon Badge */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                Administrator Security Gate
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                Enter your Administrator Security Key to access live enquiries, chat management, and system operations.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span>Admin Security Key</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">x-api-key</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={enteredKey}
                    onChange={(e) => {
                      setEnteredKey(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter security key..."
                    disabled={isVerifying}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || !enteredKey.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 active:from-indigo-700 active:to-sky-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Security Key...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Unlock Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* In-Memory Security Info Pills */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Zero Disk Persistence
              </span>
              <span className="text-slate-800">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                In-Memory Session Only
              </span>
            </div>

            {/* Toggle Backend URL Config */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowServerConfig((prev) => !prev)}
                className="text-[11px] text-slate-400 hover:text-slate-300 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
              >
                <Settings2 className="w-3 h-3" />
                <span>{showServerConfig ? 'Hide Server Endpoint' : 'Server Connection Settings'}</span>
              </button>
            </div>

            {/* Expandable Server Config */}
            {showServerConfig && (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Server className="w-3 h-3 text-indigo-400" />
                    FastAPI Server URL
                  </span>
                  {serverSavedNotice && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://api.theseventhsip.online"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setServerUrl(DEFAULT_API_BASE)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 cursor-pointer"
                    >
                      VPS Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setServerUrl('http://127.0.0.1:8000')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer"
                    >
                      Localhost
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    className="text-[11px] px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Note below card */}
          <p className="text-center text-[11px] text-slate-400 mt-4">
            🔒 For security, your key is never saved to localStorage or cookies. Refreshing the browser or opening a new tab requires re-authentication.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400 border-t border-slate-900/60">
        &copy; {new Date().getFullYear()} People Network Management LLP. Authorized administrative access only.
      </footer>
    </div>
  );
};
