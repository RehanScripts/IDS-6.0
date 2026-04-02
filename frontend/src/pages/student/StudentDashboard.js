import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Map, Target, ArrowRight, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';

const INDUSTRY_SLIDES = {
  Automotive: {
    image: '/images/automotive.png',
    promo: 'Factory tours, role briefings, and focused interview prep support.'
  },
  Engineering: {
    image: '/images/engineering.png',
    promo: 'High-growth manufacturing roles with practical assessment pathways.'
  },
  Pharma: {
    image: '/images/pharma.png',
    promo: 'Quality and operations tracks with process and compliance exposure.'
  },
  IT: {
    image: '/images/it.png',
    promo: 'Consulting and technology opportunities with business impact.'
  },
  Infrastructure: {
    image: '/images/infrastructure.png',
    promo: 'Project-driven careers with leadership and execution opportunities.'
  }
};

const INDUSTRY_COLORS = {
  Automotive: 'bg-blue-50',
  Engineering: 'bg-blue-50',
  Pharma: 'bg-blue-50',
  IT: 'bg-blue-50',
  Infrastructure: 'bg-blue-50'
};

const INDUSTRY_TAGS = {
  Automotive: 'Automotive and Aerospace',
  Engineering: 'Engineering and Manufacturing',
  Pharma: 'Pharma and Agro Processing',
  IT: 'IT and Professional Services',
  Infrastructure: 'Infrastructure and Construction'
};

const FLAGSHIP_COMPANY_IDS = [
  'hal-ozar',
  'mahindra-nashik',
  'siemens',
  'bosch',
  'abb',
  'jindal-saw',
  'pfizer',
  'capgemini',
  'infosys'
];

function shuffleList(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function StudentDashboard() {
  const { dashboardStats, companies, roadmaps } = useRoadmaps();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [jdCompany, setJdCompany] = useState(null);

  const openAssessment = (companyId) => {
    navigate(`/assessment?company=${companyId}`);
  };

  const nearestDaysLeft = roadmaps.length ? Math.min(...roadmaps.map((r) => r.daysRemaining)) : 0;

  const openCompanyDetails = (companyId) => {
    navigate(`/student/companies?company=${companyId}`);
  };

  const openCompanyJD = (company) => {
    setJdCompany(company);
  };

  const upcomingCompanies = useMemo(() => {
    const upcoming = companies.filter((company) => company.status === 'upcoming');
    const withFallback = upcoming.length >= 10 ? upcoming : [...upcoming, ...companies.filter((company) => company.status !== 'upcoming')];

    const flagship = withFallback.filter((company) => FLAGSHIP_COMPANY_IDS.includes(company.id));
    const pinned = shuffleList(flagship).slice(0, Math.min(3, withFallback.length));
    const pinnedIds = new Set(pinned.map((company) => company.id));
    const remaining = withFallback.filter((company) => !pinnedIds.has(company.id));

    return shuffleList([...pinned, ...shuffleList(remaining).slice(0, Math.max(0, 10 - pinned.length))]).slice(0, 10);
  }, [companies]);

  useEffect(() => {
    setActiveSlide(0);
  }, [upcomingCompanies.length]);

  useEffect(() => {
    if (upcomingCompanies.length <= 1) return undefined;

    const slider = setInterval(() => {
      setSlideDirection('next');
      setActiveSlide((current) => (current + 1) % upcomingCompanies.length);
    }, 4500);

    return () => clearInterval(slider);
  }, [upcomingCompanies.length]);

  const highlighted = upcomingCompanies[activeSlide] || null;

  const goPreviousSlide = () => {
    if (!upcomingCompanies.length) return;
    setSlideDirection('prev');
    setActiveSlide((current) => (current - 1 + upcomingCompanies.length) % upcomingCompanies.length);
  };

  const goNextSlide = () => {
    if (!upcomingCompanies.length) return;
    setSlideDirection('next');
    setActiveSlide((current) => (current + 1) % upcomingCompanies.length);
  };

  return (
    <div className="p-6 md:p-8 bg-blue-50/40 min-h-screen" data-testid="student-dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-blue-950 tracking-tight" style={{fontFamily: 'Outfit'}}>Dashboard</h1>
        <p className="text-blue-800/80 mt-2">Track your placement preparation progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card metric-card-readiness rounded-2xl p-6 cursor-pointer hover:-translate-y-1 active:scale-[0.98]" data-testid="stat-card-readiness">
          <div className="flex items-center justify-between mb-4">
            <div className="metric-icon-shell">
              <TrendingUp className="w-6 h-6 text-indigo-700" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-1">Readiness Score</p>
          <p className="text-3xl font-semibold text-blue-950">{dashboardStats.readiness_score || 0}%</p>
          <p className="text-xs text-blue-800/70 mt-2">Your interview confidence indicator</p>
        </div>

        <div className="metric-card metric-card-roadmap rounded-2xl p-6 cursor-pointer hover:-translate-y-1 active:scale-[0.98]" data-testid="stat-card-roadmap">
          <div className="flex items-center justify-between mb-4">
            <div className="metric-icon-shell">
              <Map className="w-6 h-6 text-indigo-700" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-1">Active Roadmap</p>
          <p className="text-3xl font-semibold text-blue-950">{dashboardStats.active_roadmap || 0}</p>
          <p className="text-xs text-blue-800/70 mt-2">Your current structured preparation plans</p>
        </div>

        <div className="metric-card metric-card-progress rounded-2xl p-6 cursor-pointer hover:-translate-y-1 active:scale-[0.98]" data-testid="stat-card-progress">
          <div className="flex items-center justify-between mb-4">
            <div className="metric-icon-shell">
              <Target className="w-6 h-6 text-indigo-700" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-1">Progress %</p>
          <p className="text-3xl font-semibold text-blue-950">{dashboardStats.progress_percentage || 0}%</p>
          <p className="text-xs text-blue-800/70 mt-2">Nearest target in {nearestDaysLeft} days</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-blue-950 mb-2" style={{fontFamily: 'Outfit'}}>Upcoming Companies</h2>
        <p className="text-sm text-blue-900/70">Showing a random set of 10 opportunities as featured campaign cards.</p>
      </div>

      {highlighted && (
        <div
          key={`${highlighted.id}-${activeSlide}`}
          className={`marketing-hero relative rounded-2xl overflow-hidden mb-8 shadow-md border border-blue-100 bg-white ${slideDirection === 'prev' ? 'slide-enter-left' : 'slide-enter-right'}`}
        >
          <img
            src={(INDUSTRY_SLIDES[highlighted.industry] || INDUSTRY_SLIDES.Engineering).image}
            alt={`${highlighted.company_name} banner`}
            className="absolute inset-0 w-full h-full object-cover marketing-hero-image"
          />
          <div className="absolute inset-0 bg-blue-950/35 backdrop-blur-[3px]" />
          <div className="relative z-10 p-6 md:p-8 lg:p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700 mb-3">Campus Placement Spotlight</p>
              <h3 className="text-2xl md:text-4xl font-semibold leading-tight mb-2 text-white" style={{ fontFamily: 'Outfit' }}>{highlighted.company_name}</h3>
              <p className="text-sm md:text-base text-blue-50 mb-4">{highlighted.role}</p>
              <p className="text-sm text-blue-100/90 mb-6">{(INDUSTRY_SLIDES[highlighted.industry] || INDUSTRY_SLIDES.Engineering).promo}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs mb-6">
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/35 text-white">{INDUSTRY_TAGS[highlighted.industry] || highlighted.industry || 'Industry Opportunity'}</span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/35 text-white">Drive Date: {highlighted.date}</span>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/35 text-white">Package: {highlighted.package || 'Not Disclosed'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openCompanyJD(highlighted)}
                  className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/35 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/25 transition-colors active:scale-[0.97]"
                >
                  View JD
                </button>
                <button
                  onClick={() => openAssessment(highlighted.id)}
                  className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors active:scale-[0.97]"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          <button
            onClick={goPreviousSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full"
            aria-label="Previous company"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full"
            aria-label="Next company"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingCompanies.map((company, idx) => (
          <article
            key={company.id || idx}
            data-testid={`company-card-${idx}`}
            className="group rounded-xl overflow-hidden border border-blue-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all"
          >
            <div className="h-40 relative bg-blue-50">
              <img
                src={(INDUSTRY_SLIDES[company.industry] || INDUSTRY_SLIDES.Engineering).image}
                alt={`${company.company_name} preview`}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 text-[11px] tracking-wide uppercase bg-blue-100 text-blue-900 px-2 py-1 rounded border border-blue-200">
                {company.status}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-base font-semibold text-blue-950 mb-1">{company.company_name}</h3>
              <p className="text-sm text-blue-900/80 mb-3">{company.role}</p>
              <div className="flex items-center justify-between text-xs text-blue-900/60 mb-4">
                <span className="inline-flex items-center gap-1"><CalendarClock className="w-3 h-3" />{company.date}</span>
                <span>{Math.max(0, Math.floor((new Date(company.date) - new Date()) / (1000 * 60 * 60 * 24)))} days left</span>
              </div>
              <button
                onClick={() => openAssessment(company.id)}
                data-testid={`prepare-button-${idx}`}
                className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-[0.97]"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => openCompanyJD(company)}
                className="w-full mt-2 bg-blue-100 text-blue-900 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors active:scale-[0.97]"
              >
                View JD
              </button>
            </div>
          </article>
        ))}
      </div>

      {jdCompany && (
        <div className="fixed inset-0 z-50 bg-blue-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setJdCompany(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-blue-100 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-blue-950 mb-2" style={{ fontFamily: 'Outfit' }}>{jdCompany.company_name}</h3>
            <p className="text-sm text-blue-700 mb-4">Short Job Description</p>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-blue-50 rounded-xl p-4 border border-blue-100">{jdCompany.shortJD || 'JD will be published soon.'}</pre>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setJdCompany(null)}
                className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors active:scale-[0.97]"
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
