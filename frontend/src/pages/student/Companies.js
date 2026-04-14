import React, { useMemo, useState } from 'react';
import { MapPin, CalendarClock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';
import CompanyIntelligencePanel from '../../components/roadmaps/CompanyIntelligencePanel';

const INDUSTRY_IMAGES = {
  Automotive: '/images/automotive.png',
  Engineering: '/images/engineering.png',
  Pharma: '/images/pharma.png',
  IT: '/images/it.png',
  Infrastructure: '/images/infrastructure.png'
};

export default function Companies() {
  const { companies } = useRoadmaps();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get('company') || companies[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [jdCompany, setJdCompany] = useState(null);

  const industries = useMemo(
    () => ['all', ...Array.from(new Set(companies.map((company) => company.industry).filter(Boolean)))],
    [companies]
  );

  const filteredCompanies = useMemo(
    () => companies
      .filter((company) => (statusFilter === 'all' || company.status === statusFilter) && (industryFilter === 'all' || company.industry === industryFilter))
      .sort((a, b) => {
        if (a.id === 'aarti-pharmalabs-get') return -1;
        if (b.id === 'aarti-pharmalabs-get') return 1;
        if (a.id === 'esds-windows-admin') return -1;
        if (b.id === 'esds-windows-admin') return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }),
    [companies, statusFilter, industryFilter]
  );

  const selectedCompany = useMemo(
    () => filteredCompanies.find((company) => company.id === selectedCompanyId) || companies.find((company) => company.id === selectedCompanyId) || filteredCompanies[0] || null,
    [companies, filteredCompanies, selectedCompanyId]
  );

  const openAssessment = (companyId) => {
    navigate(`/student/assessment?company=${companyId}`);
  };

  const openCompanyJD = (company) => {
    if (company?.jdDataUrl) {
      window.open(company.jdDataUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setJdCompany(company);
  };

  return (
    <div className="p-6 md:p-8 bg-emerald-50/40 min-h-screen" data-testid="companies-page">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold text-emerald-950 tracking-tight" style={{ fontFamily: 'Outfit' }}>
          Companies
        </h1>
        <p className="text-emerald-900/70 mt-2">
          Browse all {companies.length} companies and generate personalized roadmaps
        </p>
      </div>

      <div className="mb-6 bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Status</span>
          {['all', 'active', 'upcoming'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-[0.96] ${statusFilter === status ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Industry</span>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setIndustryFilter(industry)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-[0.96] ${industryFilter === industry ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <CompanyIntelligencePanel company={selectedCompany} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, idx) => (
          <div
            key={company.id || idx}
            data-testid={`company-card-${idx}`}
            onClick={() => setSelectedCompanyId(company.id)}
            className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all cursor-pointer ${
              selectedCompanyId === company.id ? 'border-emerald-400 ring-1 ring-emerald-300' : 'border-emerald-100'
            }`}
          >
            <div className="h-36 relative bg-emerald-50">
              <img
                src={company.coverImage || INDUSTRY_IMAGES[company.industry] || INDUSTRY_IMAGES.Engineering}
                alt={`${company.company_name} cover`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <span
                className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-200"
              >
                {company.status}
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-medium text-emerald-950 mb-1">{company.company_name}</h3>
              <p className="text-sm text-emerald-900/80 mb-2">{company.role}</p>

              <div className="flex items-center justify-between gap-3 text-xs text-emerald-900/60 mb-2">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  {company.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {company.industry || 'General'}
                </span>
              </div>

              <p className="text-xs text-emerald-900/60 mb-4">{company.eligibility}</p>

              {company.package && <p className="text-sm font-medium text-emerald-700 mb-4">{company.package}</p>}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAssessment(company.id);
                }}
                data-testid={`generate-roadmap-button-${idx}`}
                className="w-full bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors shadow-sm active:scale-[0.97]"
              >
                Generate Roadmap
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCompanyJD(company);
                }}
                className="w-full mt-2 bg-emerald-100 text-emerald-900 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors active:scale-[0.97]"
              >
                View JD
              </button>
            </div>
          </div>
        ))}
      </div>

      {jdCompany && (
        <div className="fixed inset-0 z-50 bg-emerald-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setJdCompany(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-emerald-100 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-emerald-950 mb-2" style={{ fontFamily: 'Outfit' }}>{jdCompany.company_name}</h3>
            <p className="text-sm text-emerald-700 mb-4">Short Job Description</p>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-emerald-50 rounded-xl p-4 border border-emerald-100">{jdCompany.shortJD || 'JD will be published soon.'}</pre>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setJdCompany(null)}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors active:scale-[0.97]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
