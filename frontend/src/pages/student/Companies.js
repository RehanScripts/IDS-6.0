import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';
import CompanyIntelligencePanel from '../../components/roadmaps/CompanyIntelligencePanel';

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
  const { companies } = useRoadmaps();
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || null);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  const openAssessment = (companyId) => {
    navigate(`/assessment?company=${companyId}`);
  };

  return (
    <div className="p-6 md:p-8" data-testid="companies-page">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Companies</h1>
        <p className="text-slate-500 mt-2">Browse all {companies.length} companies hiring from Nashik &amp; generate personalized roadmaps</p>
      </div>

      <div className="mb-6">
        <CompanyIntelligencePanel company={selectedCompany} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company, idx) => (
          <div
            key={company.id}
            data-testid={`company-card-${idx}`}
            onClick={() => setSelectedCompanyId(company.id)}
            className={`bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
              selectedCompanyId === company.id ? 'border-indigo-400' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <span className="text-lg font-semibold text-indigo-600">{company.company_name[0]}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {company.status}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{company.company_name}</h3>
            <p className="text-sm text-slate-600 mb-2">{company.role}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{company.date}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{company.eligibility}</p>
            {company.package && (
              <p className="text-sm font-medium text-indigo-600 mb-4">{company.package}</p>
            )}
            <button
              onClick={() => openAssessment(company.id)}
              data-testid={`generate-roadmap-button-${idx}`}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
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
