import { useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  Search,
  Copy,
  Check,
} from 'lucide-react';

interface ContactsDirectoryProps {
  names: string[];
  emails: string[];
  phones: string[];
  onSelectContact: (type: 'name' | 'email' | 'phone', value: string) => void;
  onCopyText: (text: string, label: string) => void;
}

type ContactTab = 'emails' | 'phones' | 'names';

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  names,
  emails,
  phones,
  onSelectContact,
  onCopyText,
}) => {
  const [activeTab, setActiveTab] = useState<ContactTab>('emails');
  const [search, setSearch] = useState('');
  const [copiedBulk, setCopiedBulk] = useState(false);

  const getList = () => {
    switch (activeTab) {
      case 'emails':
        return emails;
      case 'phones':
        return phones;
      case 'names':
        return names;
    }
  };

  const currentList = getList();
  const filtered = currentList.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyAll = () => {
    const text = filtered.join(activeTab === 'emails' ? ', ' : '\n');
    navigator.clipboard.writeText(text);
    setCopiedBulk(true);
    setTimeout(() => setCopiedBulk(false), 2000);
    onCopyText(text, `All ${activeTab}`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>FastAPI Directory Feeds</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Contacts & Directory Hub
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Quickly query, copy, and export distinct candidate and client contacts extracted directly from the database.
          </p>
        </div>

        {/* Tab switcher buttons in header */}
        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 gap-1">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'emails' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Emails ({emails.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('phones')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'phones' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phones ({phones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('names')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'names' ? 'bg-white text-indigo-900 shadow-md' : 'text-white/80 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Names ({names.length})</span>
          </button>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
          />
        </div>

        <button
          onClick={handleCopyAll}
          disabled={filtered.length === 0}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          {copiedBulk ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copiedBulk ? 'Copied to Clipboard!' : `Copy All ${filtered.length} ${activeTab}`}</span>
        </button>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No {activeTab} matched your search.
          </div>
        ) : (
          filtered.map((item, index) => (
            <div
              key={index}
              className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 text-sm font-mono">{item}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCopyText(item, activeTab)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const type = activeTab === 'emails' ? 'email' : activeTab === 'phones' ? 'phone' : 'name';
                    onSelectContact(type, item);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  Filter Enquiries
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
