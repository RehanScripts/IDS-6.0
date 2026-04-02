import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

const INDUSTRY_IMAGES = {
  Automotive: '/images/automotive.png',
  Engineering: '/images/engineering.png',
  Pharma: '/images/pharma.png',
  IT: '/images/it.png',
  Infrastructure: '/images/infrastructure.png',
};

const INDUSTRY_GRADIENTS = {
  Automotive: 'linear-gradient(135deg, #1e3a5f 0%, #4a90d9 100%)',
  Engineering: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
  Pharma: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
  IT: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)',
  Infrastructure: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
};

const INDUSTRY_LABELS = {
  Automotive: '🚗 Automotive',
  Engineering: '⚙️ Engineering',
  Pharma: '💊 Pharma',
  IT: '💻 IT',
  Infrastructure: '🏗️ Infra',
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('All');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/companies`, { withCredentials: true });
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (company) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/student/roadmaps`,
        {
          company_id: company.id,
          company_name: company.company_name,
          role: company.role
        },
        { withCredentials: true }
      );
      toast.success(`Roadmap generated for ${company.company_name}!`);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      toast.error('Failed to generate roadmap');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const industries = ['All', ...new Set(companies.map((c) => c.industry).filter(Boolean))];

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'All' || c.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="p-6 md:p-8" data-testid="companies-page">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Companies</h1>
        <p className="text-slate-500 mt-2">Browse all {companies.length} companies hiring from Nashik &amp; generate personalized roadmaps</p>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setFilterIndustry(ind)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterIndustry === ind
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ind === 'All' ? 'All' : (INDUSTRY_LABELS[ind] || ind)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="flex gap-4 mb-6 text-xs">
        <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-semibold">
          🟢 Active: {filtered.filter((c) => c.status === 'active').length}
        </span>
        <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full font-semibold">
          🟡 Upcoming: {filtered.filter((c) => c.status === 'upcoming').length}
        </span>
        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
          Showing {filtered.length} of {companies.length}
        </span>
      </div>

      {/* ── Company Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((company, idx) => {
          const img = INDUSTRY_IMAGES[company.industry] || INDUSTRY_IMAGES.Engineering;
          const grad = INDUSTRY_GRADIENTS[company.industry] || INDUSTRY_GRADIENTS.Engineering;
          return (
            <div
              key={idx}
              data-testid={`company-card-${idx}`}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              {/* Image header */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={img}
                  alt={company.industry}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0" style={{ background: grad, opacity: 0.65 }} />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      company.status === 'active' ? 'bg-green-400 text-green-900' : 'bg-yellow-300 text-yellow-900'
                    }`}>
                      {company.status}
                    </span>
                    <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">
                      {INDUSTRY_LABELS[company.industry] || ''}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">{company.company_name}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-sm text-slate-700 font-medium mb-2">{company.role}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{company.date}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{company.eligibility}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-600">{company.package}</span>
                  <button
                    onClick={() => handleGenerateRoadmap(company)}
                    data-testid={`generate-roadmap-button-${idx}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Generate Roadmap
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No companies match your search.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
