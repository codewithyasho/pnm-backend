import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Contact,
  SlidersHorizontal,
  X,
  ExternalLink,
  Clock,
  CheckCircle,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'enquiries' | 'companies' | 'contacts' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  pendingCount: number;
  completedCount: number;
  totalCompanies: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  pendingCount,
  completedCount,
  totalCompanies,
}) => {
  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview & Insights',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'enquiries',
      label: 'Client Enquiries',
      icon: <Users className="w-5 h-5" />,
      badge: pendingCount > 0 ? `${pendingCount} pending` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'companies',
      label: 'Companies Directory',
      icon: <Building2 className="w-5 h-5" />,
      badge: totalCompanies,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'contacts',
      label: 'Contacts Hub',
      icon: <Contact className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'API & Security Settings',
      icon: <SlidersHorizontal className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:static lg:shadow-none lg:z-auto`}
      >
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">PNM Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick status summary in sidebar */}
        <div className="p-3 m-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
            <span>Enquiry Status</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Live</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-amber-900">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pending Review
              </span>
              <span className="font-bold">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-emerald-900">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Completed
              </span>
              <span className="font-bold">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-100 text-slate-400 text-[11px] flex items-center justify-between">
          <span className="font-mono">FastAPI + SQLite</span>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <span>Swagger API</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
};
