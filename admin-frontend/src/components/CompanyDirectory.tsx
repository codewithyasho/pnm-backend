import { useState } from 'react';
import { Building2, Users, Search, ArrowRight } from 'lucide-react';
import type { UserEnquiry } from '../types';

interface CompanyDirectoryProps {
  companies: string[];
  enquiries: UserEnquiry[];
  onSelectCompany: (company: string) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  companies,
  enquiries,
  onSelectCompany,
}) => {
  const [search, setSearch] = useState('');

  const filteredCompanies = companies.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const getCompanyEnquiriesCount = (companyName: string) => {
    return enquiries.filter(
      (e) => e.company_name.toLowerCase() === companyName.toLowerCase()
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Clients & Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Companies Directory
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Live directory of client organizations submitting enquiries to People Network Management LLP.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
          <div className="text-3xl font-black">{companies.length}</div>
          <div className="text-xs text-sky-200 font-medium">Distinct Companies</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies by name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
        />
      </div>

      {/* Grid of Companies */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800">No Companies Found</h3>
          <p className="text-sm text-slate-500">No companies match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => {
            const count = getCompanyEnquiriesCount(company);
            return (
              <div
                key={company}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg border border-sky-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors capitalize">
                      {company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors capitalize">
                        {company}
                      </h4>
                      <span className="text-xs text-slate-400">Corporate Client</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {count} {count === 1 ? 'enquiry' : 'enquiries'}
                  </span>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>View associated leads</span>
                  </span>
                  <button
                    onClick={() => onSelectCompany(company)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
