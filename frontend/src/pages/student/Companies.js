import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';
import CompanyIntelligencePanel from '../../components/roadmaps/CompanyIntelligencePanel';

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
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Companies</h1>
        <p className="text-slate-500 mt-2">Browse upcoming companies and generate personalized roadmaps</p>
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
              Generate Roadmap
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
