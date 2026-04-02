import React from 'react';
import { TrendingUp, Map, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';

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

const INDUSTRY_TAGS = {
  Automotive: '🚗 Automotive & Aerospace',
  Engineering: '⚙️ Engineering & Manufacturing',
  Pharma: '💊 Pharma & Agro',
  IT: '💻 IT & Consulting',
  Infrastructure: '🏗️ Infrastructure',
};

export default function StudentDashboard() {
  const { dashboardStats, companies, roadmaps } = useRoadmaps();
  const navigate = useNavigate();

  const openAssessment = (companyId) => {
    navigate(`/assessment?company=${companyId}`);
  };

  const nearestDaysLeft = roadmaps.length ? Math.min(...roadmaps.map((r) => r.daysRemaining)) : 0;

  const activeCompany = companies[currentSlide] || {};
  const industryImg = INDUSTRY_IMAGES[activeCompany.industry] || INDUSTRY_IMAGES.Engineering;
  const industryGrad = INDUSTRY_GRADIENTS[activeCompany.industry] || INDUSTRY_GRADIENTS.Engineering;
  const industryTag = INDUSTRY_TAGS[activeCompany.industry] || '';

  return (
    <div className="p-6 md:p-8" data-testid="student-dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Dashboard</h1>
        <p className="text-slate-500 mt-2">Track your placement preparation progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-readiness">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Readiness Score</p>
          <p className="text-2xl font-semibold text-slate-900">{dashboardStats.readiness_score || 0}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-roadmap">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Active Roadmap</p>
          <p className="text-2xl font-semibold text-slate-900">{dashboardStats.active_roadmap || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-progress">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Progress %</p>
          <p className="text-2xl font-semibold text-slate-900">{dashboardStats.progress_percentage || 0}%</p>
          <p className="text-xs text-slate-500 mt-1">{nearestDaysLeft} days left</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Upcoming Companies</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.slice(0, 6).map((company, idx) => (
          <div
            key={idx}
            data-testid={`company-card-${idx}`}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{company.company_name}</h3>
            <p className="text-sm text-slate-600 mb-4">{company.role}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>{company.date}</span>
              <span>{Math.max(0, Math.floor((new Date(company.date) - new Date()) / (1000 * 60 * 60 * 24)))} days left</span>
            </div>
            <button
              onClick={() => openAssessment(company.id)}
              data-testid={`prepare-button-${idx}`}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Generate Roadmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
