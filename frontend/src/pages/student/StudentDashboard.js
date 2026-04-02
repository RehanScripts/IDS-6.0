import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { TrendingUp, Map, Target, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Calendar, BriefcaseBusiness } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, companiesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/dashboard/stats`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/student/companies`, { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setCompanies(companiesRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide every 4 seconds
  const slideCount = companies.length;
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(slideCount, 1));
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % Math.max(slideCount, 1));
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, slideCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: TrendingUp, label: 'Readiness Score', value: `${stats?.readiness_score || 0}%` },
          { icon: Map, label: 'Active Roadmap', value: stats?.active_roadmap || 0 },
          { icon: Target, label: 'Progress %', value: `${stats?.progress_percentage || 0}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Hero Ad Carousel ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>Upcoming Opportunities</h2>
          </div>
          <button onClick={() => navigate('/student/companies')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            View all ({companies.length}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {companies.length > 0 && (
          <div className="relative group">
            {/* Main card */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg"
              style={{ minHeight: 340 }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  backgroundImage: `url(${industryImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: industryGrad, opacity: 0.82 }} />

              {/* Content */}
              <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-10" style={{ minHeight: 340 }}>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide text-white/90 bg-white/20 backdrop-blur-sm mb-3">
                    {industryTag}
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      activeCompany.status === 'active' ? 'bg-green-400 text-green-900' : 'bg-yellow-300 text-yellow-900'
                    }`}>
                      {activeCompany.status}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mt-2" style={{fontFamily: 'Outfit'}}>
                    {activeCompany.company_name}
                  </h3>
                  <p className="text-lg text-white/80 mt-1">{activeCompany.role}</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
                  <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5"><BriefcaseBusiness className="w-4 h-4" /> {activeCompany.package}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {activeCompany.date}</span>
                    <span className="hidden md:flex items-center gap-1.5">📋 {activeCompany.eligibility}</span>
                  </div>
                  <button
                    onClick={() => navigate('/student/companies')}
                    className="bg-white text-slate-900 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>

            {/* Dot indicators */}
            <div className="flex justify-center gap-1.5 mt-4">
              {companies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Quick-glance company list ── */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>All Hiring Companies ({companies.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                idx === currentSlide ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200'
              }`}
            >
              {/* Tiny image strip */}
              <div
                className="h-16 w-full"
                style={{
                  backgroundImage: `url(${INDUSTRY_IMAGES[company.industry] || INDUSTRY_IMAGES.Engineering})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="h-full w-full" style={{ background: INDUSTRY_GRADIENTS[company.industry] || INDUSTRY_GRADIENTS.Engineering, opacity: 0.7 }} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{company.company_name}</h4>
                  <span className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {company.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{company.role}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1">{company.package}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
