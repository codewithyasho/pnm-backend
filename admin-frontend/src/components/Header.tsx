import React from 'react';
import type { SSEConnectionStatus } from '../types';
import {
  Menu,
  RotateCw,
  Download,
  ShieldCheck,
  Server,
  Layers,
  Radio,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onLockDashboard?: () => void;
  isRefreshing: boolean;
  isBackendHealthy: boolean | null;
  totalRecords: number;
  sseStatus?: SSEConnectionStatus;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onRefresh,
  onExport,
  onOpenSettings,
  onLockDashboard,
  isRefreshing,
  isBackendHealthy,
  totalRecords,
  sseStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: mobile hamburger + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <span>People Network Management</span>
                    <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      LLP
                    </span>
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-indigo-600">ADMIN DASHBOARD</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 bg-emerald-50 font-mono text-[11px] px-1.5 py-0.2 rounded border border-emerald-200">
                    OAS 3.1
                  </span>
                  <span className="hidden md:inline-flex items-center text-slate-400">
                    ({totalRecords} {totalRecords === 1 ? 'record' : 'records'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section: System health badge + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time SSE Stream status pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                sseStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                  : sseStatus === 'connecting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={
                sseStatus === 'connected'
                  ? 'Real-Time SSE Connected: New enquiries will stream in live automatically'
                  : sseStatus === 'connecting'
                  ? 'Connecting to real-time SSE stream (/admin/sse/stream)...'
                  : 'SSE stream disconnected / reconnecting'
              }
            >
              <span className="relative flex h-2 w-2">
                {sseStatus === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    sseStatus === 'connected'
                      ? 'bg-emerald-500'
                      : sseStatus === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
              </span>
              <Radio className={`w-3.5 h-3.5 ${sseStatus === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {sseStatus === 'connected' ? 'Live SSE' : sseStatus === 'connecting' ? 'Connecting...' : 'Stream Idle'}
              </span>
            </div>

            {/* Backend health status badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isBackendHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isBackendHealthy === false
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={
                isBackendHealthy === true
                  ? 'FastAPI Backend connected and healthy'
                  : isBackendHealthy === false
                  ? 'Cannot reach FastAPI backend (check server)'
                  : 'Checking backend status...'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-500'
                    : isBackendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <Server className="w-3.5 h-3.5" />
              <span>{isBackendHealthy ? 'API Online' : isBackendHealthy === false ? 'API Offline' : 'Checking'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Refresh all data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExport}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="API Key and Backend Settings"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">API Config</span>
            </button>

            {/* Lock Dashboard / Logout Button */}
            {onLockDashboard && (
              <button
                onClick={onLockDashboard}
                className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Lock Dashboard & Clear Authentication"
              >
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Lock Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
