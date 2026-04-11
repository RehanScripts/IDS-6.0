import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Map, Target, ArrowRight, ArrowLeft, CalendarClock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';
import '../LandingPage.css';

const INDUSTRY_SLIDES = {
  Automotive: { image: '/images/automotive.png', promo: 'Factory tours, role briefings, and focused interview prep support.' },
  Engineering: { image: '/images/engineering.png', promo: 'High-growth manufacturing roles with practical assessment pathways.' },
  Pharma: { image: '/images/pharma.png', promo: 'Quality and operations tracks with process and compliance exposure.' },
  IT: { image: '/images/it.png', promo: 'Consulting and technology opportunities with business impact.' },
  Infrastructure: { image: '/images/infrastructure.png', promo: 'Project-driven careers with leadership and execution opportunities.' }
};

const INDUSTRY_TAGS = {
  Automotive: 'Automotive and Aerospace',
  Engineering: 'Engineering and Manufacturing',
  Pharma: 'Pharma and Agro Processing',
  IT: 'IT and Professional Services',
  Infrastructure: 'Infrastructure and Construction'
};

const FLAGSHIP_COMPANY_IDS = ['klingelnberg', 'seiton', 'hal-ozar', 'mahindra-nashik', 'siemens', 'bosch', 'abb', 'jindal-saw', 'pfizer', 'capgemini', 'infosys'];
const MANDATORY_AD_IDS = ['klingelnberg', 'seiton'];

function shuffleList(items) { return [...items].sort(() => Math.random() - 0.5); }

/* Sketch wave divider */
function WaveDivider({ flip }) {
  return (
    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <path d="M0 30 Q120 5 240 30 Q360 55 480 30 Q600 5 720 30 Q840 55 960 30 Q1080 5 1200 30 Q1320 55 1440 30" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="8 6"/>
    </svg>
  );
}

export default function StudentDashboard() {
  const { dashboardStats, companies, roadmaps } = useRoadmaps();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [jdCompany, setJdCompany] = useState(null);

  const openAssessment = (companyId) => navigate(`/student/assessment?company=${companyId}`);
  const nearestDaysLeft = roadmaps.length ? Math.min(...roadmaps.map((r) => r.daysRemaining)) : 0;
  const openCompanyJD = (company) => { if (company?.jdDataUrl) { window.open(company.jdDataUrl, '_blank', 'noopener,noreferrer'); return; } setJdCompany(company); };

  const upcomingCompanies = useMemo(() => {
    const upcoming = companies.filter((c) => c.status === 'upcoming');
    const withFallback = upcoming.length >= 10 ? upcoming : [...upcoming, ...companies.filter((c) => c.status !== 'upcoming')];
    const mandatoryPinned = MANDATORY_AD_IDS.map((id) => withFallback.find((c) => c.id === id)).filter(Boolean);
    const mandatoryIds = new Set(mandatoryPinned.map((c) => c.id));
    const flagship = withFallback.filter((c) => FLAGSHIP_COMPANY_IDS.includes(c.id) && !mandatoryIds.has(c.id));
    const pinned = shuffleList(flagship).slice(0, Math.min(3, withFallback.length));
    const pinnedWithMandatory = [...mandatoryPinned, ...pinned];
    const pinnedIds = new Set(pinnedWithMandatory.map((c) => c.id));
    const remaining = withFallback.filter((c) => !pinnedIds.has(c.id));
    return [...pinnedWithMandatory, ...shuffleList(remaining).slice(0, Math.max(0, 10 - pinnedWithMandatory.length))].slice(0, 10);
  }, [companies]);

  useEffect(() => { setActiveSlide(0); }, [upcomingCompanies.length]);

  useEffect(() => {
    if (upcomingCompanies.length <= 1) return;
    const slider = setInterval(() => { setSlideDirection('next'); setActiveSlide((c) => (c + 1) % upcomingCompanies.length); }, 6200);
    return () => clearInterval(slider);
  }, [upcomingCompanies.length]);

  const highlighted = upcomingCompanies[activeSlide] || null;
  const goPrev = () => { setSlideDirection('prev'); setActiveSlide((c) => (c - 1 + upcomingCompanies.length) % upcomingCompanies.length); };
  const goNext = () => { setSlideDirection('next'); setActiveSlide((c) => (c + 1) % upcomingCompanies.length); };

  const metricCards = [
    { label: 'Readiness Score', value: `${dashboardStats.readiness_score || 0}%`, sub: 'Your interview confidence indicator', icon: TrendingUp, bg: '#E8F5E9', accent: '#2E7D32' },
    { label: 'Active Roadmap', value: dashboardStats.active_roadmap || 0, sub: 'Current structured preparation plans', icon: Map, bg: '#E3F2FD', accent: '#1565C0' },
    { label: 'Progress', value: `${dashboardStats.progress_percentage || 0}%`, sub: `Nearest target in ${nearestDaysLeft} days`, icon: Target, bg: '#FFF3E0', accent: '#E65100' },
  ];

  return (
    <div className="sankalp-landing" style={{ background: 'var(--sk-cream)' }} data-testid="student-dashboard">
      {/* ═══ METRICS ═══ */}
      <div style={{ padding: '2rem 2rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Sparkles size={20} color="var(--sk-accent)" />
          <h1 style={{ fontFamily: 'var(--sk-font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0, color: 'var(--sk-ink)' }}>
            Dashboard
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {metricCards.map((card, i) => (
            <div key={card.label} className="sk-service-card" style={{
              backgroundColor: card.bg, animationDelay: `${i * 100}ms`, cursor: 'pointer',
            }} data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '14px', border: `2px solid ${card.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)',
                }}>
                  <card.icon size={22} color={card.accent} />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: card.accent, margin: '0 0 6px' }}>{card.label}</p>
              <p style={{ fontFamily: 'var(--sk-font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--sk-ink)', margin: '0 0 6px' }}>{card.value}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--sk-ink-muted)', margin: 0 }}>{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ HERO COMPANY SPOTLIGHT ═══ */}
      <WaveDivider />
      <div style={{ padding: '0 2rem 2rem' }}>
        <h2 style={{ fontFamily: 'var(--sk-font-display)', fontSize: '1.8rem', fontWeight: 700, margin: '1.5rem 0 0.5rem', color: 'var(--sk-ink)' }}>
          Upcoming Companies
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--sk-ink-muted)', margin: '0 0 1.5rem' }}>Featured placement opportunity spotlight</p>

        {highlighted && (
          <div key={`${highlighted.id}-${activeSlide}`} style={{
            position: 'relative', borderRadius: 'var(--sk-border-radius)', overflow: 'hidden',
            border: '2px solid var(--sk-ink)', boxShadow: '5px 5px 0 var(--sk-ink)',
            marginBottom: '2rem', background: 'var(--sk-cream-light)', minHeight: '260px',
          }}>
            <img
              src={(INDUSTRY_SLIDES[highlighted.industry] || INDUSTRY_SLIDES.Engineering).image}
              alt={`${highlighted.company_name} banner`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
            />
            <div style={{ position: 'relative', zIndex: 2, padding: '2rem' }}>
              <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--sk-accent)', fontWeight: 700, marginBottom: '0.75rem' }}>Campus Placement Spotlight</p>
              <h3 style={{ fontFamily: 'var(--sk-font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--sk-ink)' }}>{highlighted.company_name}</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--sk-ink-light)', margin: '0 0 1rem' }}>{highlighted.role}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--sk-ink-muted)', margin: '0 0 1.5rem', maxWidth: '600px' }}>{(INDUSTRY_SLIDES[highlighted.industry] || INDUSTRY_SLIDES.Engineering).promo}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                {[INDUSTRY_TAGS[highlighted.industry] || highlighted.industry, `Drive Date: ${highlighted.date}`, `Package: ${highlighted.package || 'Not Disclosed'}`].map((tag) => (
                  <span key={tag} style={{ padding: '5px 14px', borderRadius: '50px', border: '1.5px solid var(--sk-ink)', fontSize: '0.75rem', fontWeight: 600, background: 'var(--sk-cream)', color: 'var(--sk-ink)' }}>{tag}</span>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={() => openCompanyJD(highlighted)} className="sketch-btn sketch-btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>View JD</button>
                <button onClick={() => openAssessment(highlighted.id)} className="sketch-btn sketch-btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Generate Roadmap <ArrowRight size={14} /></button>
              </div>
            </div>

            {/* Carousel Arrows */}
            <button onClick={goPrev} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--sk-ink)',
              background: 'var(--sk-cream-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--sk-ink)',
            }}><ChevronLeft size={18} /></button>
            <button onClick={goNext} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
              width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--sk-ink)',
              background: 'var(--sk-cream-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--sk-ink)',
            }}><ChevronRight size={18} /></button>

            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
              {upcomingCompanies.slice(0, 10).map((_, i) => (
                <button key={i} onClick={() => { setSlideDirection(i > activeSlide ? 'next' : 'prev'); setActiveSlide(i); }}
                  style={{
                    width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--sk-ink)', padding: 0, cursor: 'pointer',
                    background: i === activeSlide ? 'var(--sk-accent)' : 'var(--sk-cream-light)',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ COMPANY CARDS ═══ */}
      <WaveDivider flip />
      <div style={{ padding: '1rem 2rem 3rem', background: 'var(--sk-cream-light)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {upcomingCompanies.map((company, idx) => (
            <article key={company.id || idx} data-testid={`company-card-${idx}`}
              className="sk-service-card" style={{ backgroundColor: 'var(--sk-cream-light)', padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 140, position: 'relative', background: '#E8F0E3', overflow: 'hidden' }}>
                <img
                  src={(INDUSTRY_SLIDES[company.industry] || INDUSTRY_SLIDES.Engineering).image}
                  alt={`${company.company_name}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <span style={{
                  position: 'absolute', top: 10, left: 10, fontSize: '0.68rem', textTransform: 'uppercase',
                  letterSpacing: '0.1em', background: 'var(--sk-cream-light)', border: '1.5px solid var(--sk-ink)',
                  borderRadius: '50px', padding: '3px 10px', fontWeight: 700,
                }}>{company.status}</span>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--sk-font-display)', fontSize: '1.05rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--sk-ink)' }}>{company.company_name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sk-ink-light)', margin: '0 0 10px' }}>{company.role}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--sk-ink-muted)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CalendarClock size={12} />{company.date}</span>
                  <span>{Math.max(0, Math.floor((new Date(company.date) - new Date()) / (1000 * 60 * 60 * 24)))} days left</span>
                </div>
                <button onClick={() => openAssessment(company.id)} data-testid={`prepare-button-${idx}`}
                  className="sketch-btn sketch-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem', marginBottom: '6px' }}>
                  Generate Roadmap <ArrowRight size={14} />
                </button>
                <button onClick={() => openCompanyJD(company)}
                  className="sketch-btn sketch-btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.82rem' }}>
                  View JD
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* JD Modal */}
      {jdCompany && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setJdCompany(null)}>
          <div style={{ width: '100%', maxWidth: 640, background: 'var(--sk-cream-light)', border: '2px solid var(--sk-ink)', borderRadius: 'var(--sk-border-radius)', boxShadow: '6px 6px 0 var(--sk-ink)', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--sk-font-display)', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{jdCompany.company_name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--sk-accent)', fontWeight: 600, margin: '0 0 1rem' }}>Job Description</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: 'var(--sk-ink-light)', background: 'var(--sk-cream)', borderRadius: '10px', padding: '1.25rem', border: '1.5px solid var(--sk-ink)', lineHeight: 1.7 }}>
              {jdCompany.shortJD || 'JD will be published soon.'}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button onClick={() => setJdCompany(null)} className="sketch-btn sketch-btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
