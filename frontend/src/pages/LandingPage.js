import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Send,
  Target,
  Brain,
  BarChart3,
  Compass,
  BookOpen,
  HelpCircle,
  Sparkles,
  GraduationCap,
  Users,
  Award,
  Rocket,
  Plus,
  Minus,
} from 'lucide-react';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

/* ─── Data ─── */
const serviceCards = [
  {
    title: 'Job Specific',
    subtitle: 'Roadmap',
    description: 'Personalized daily preparation plans aligned with your dream role and company requirements.',
    icon: Target,
    bg: '#E8F5E9',
    accent: '#2E7D32',
  },
  {
    title: 'AI Personalised',
    subtitle: 'Quiz',
    description: 'Intelligent assessments that adapt to your level and identify precise knowledge gaps.',
    icon: Brain,
    bg: '#FFF3E0',
    accent: '#E65100',
  },
  {
    title: 'Readiness',
    subtitle: 'Score',
    description: 'Track your placement readiness with multi-dimensional scoring and trend insights.',
    icon: BarChart3,
    bg: '#E3F2FD',
    accent: '#1565C0',
  },
  {
    title: 'Strategic',
    subtitle: 'Planning',
    description: 'Long-term career strategy aligned with industry demands and your personal aspirations.',
    icon: Compass,
    bg: '#FCE4EC',
    accent: '#AD1457',
  },
  {
    title: 'Curated',
    subtitle: 'Content',
    description: 'Expert-selected resources, tutorials, and practice material for each preparation phase.',
    icon: BookOpen,
    bg: '#F3E5F5',
    accent: '#6A1B9A',
  },
];

const faqItems = [
  {
    category: 'planning',
    question: 'How does Sankalp create my personalized roadmap?',
    answer: 'Sankalp analyzes your profile, target role, current skill level, and timeline to generate a structured day-by-day preparation plan. The roadmap adapts as you progress and evolve.',
  },
  {
    category: 'planning',
    question: 'Can I switch my target role mid-preparation?',
    answer: 'Absolutely. Sankalp dynamically recalibrates your roadmap, assessments, and readiness score when you update your career goals. No preparation is ever wasted.',
  },
  {
    category: 'how-it-works',
    question: 'How does the AI quiz adapt to my level?',
    answer: 'Our AI engine uses adaptive testing algorithms. It starts with baseline questions and progressively adjusts difficulty based on your response patterns, speed, and accuracy.',
  },
  {
    category: 'how-it-works',
    question: 'What is the Readiness Score based on?',
    answer: 'The Readiness Score combines technical proficiency, soft skills assessment, resume quality, mock interview performance, and domain knowledge into a comprehensive metric.',
  },
  {
    category: 'quiz',
    question: 'How often should I take the AI Quiz?',
    answer: 'We recommend weekly assessments to track your growth trajectory. The AI needs regular data points to provide the most accurate readiness predictions.',
  },
  {
    category: 'content',
    question: 'Is the content updated for current hiring trends?',
    answer: 'Yes. Our content team and AI systems continuously monitor placement drives, interview patterns, and industry shifts to keep all materials current and relevant.',
  },
];

const stats = [
  { value: '2,400+', label: 'Students Guided' },
  { value: '94%', label: 'Placement Rate' },
  { value: '150+', label: 'Companies Connected' },
  { value: '4.9★', label: 'Student Rating' },
];

/* ─── Sketch SVG Components ─── */
function SketchMountains({ className }) {
  return (
    <svg className={className} viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 300 L80 180 L120 220 L200 100 L280 200 L320 160 L400 80 L480 180 L520 140 L600 200 L680 120 L750 190 L800 150 L800 300 Z" fill="#E8F0E3" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="4 3"/>
      <path d="M0 300 L100 220 L180 260 L260 180 L340 240 L400 160 L500 230 L580 190 L660 250 L740 200 L800 240 L800 300 Z" fill="#F0EDD4" stroke="#1a1a1a" strokeWidth="1.5"/>
      <circle cx="650" cy="60" r="25" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="3 3"/>
      <line x1="650" y1="35" x2="650" y2="20" stroke="#1a1a1a" strokeWidth="1"/>
      <line x1="675" y1="60" x2="688" y2="55" stroke="#1a1a1a" strokeWidth="1"/>
      <line x1="670" y1="42" x2="680" y2="32" stroke="#1a1a1a" strokeWidth="1"/>
      {/* Trees */}
      <line x1="150" y1="200" x2="150" y2="170" stroke="#1a1a1a" strokeWidth="1.5"/>
      <path d="M135 185 L150 155 L165 185 Z" fill="#D4E8D0" stroke="#1a1a1a" strokeWidth="1"/>
      <path d="M138 195 L150 165 L162 195 Z" fill="#D4E8D0" stroke="#1a1a1a" strokeWidth="1"/>
      <line x1="500" y1="220" x2="500" y2="190" stroke="#1a1a1a" strokeWidth="1.5"/>
      <path d="M485 210 L500 180 L515 210 Z" fill="#D4E8D0" stroke="#1a1a1a" strokeWidth="1"/>
      {/* Hot air balloon */}
      <ellipse cx="350" cy="50" rx="18" ry="22" fill="#E57373" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="335" y1="68" x2="340" y2="80" stroke="#1a1a1a" strokeWidth="1"/>
      <line x1="365" y1="68" x2="360" y2="80" stroke="#1a1a1a" strokeWidth="1"/>
      <rect x="338" y="80" width="24" height="10" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
      {/* Birds */}
      <path d="M100 50 Q108 42 116 50" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
      <path d="M130 40 Q138 32 146 40" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
      <path d="M550 45 Q558 37 566 45" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
    </svg>
  );
}

function SketchWaveDivider({ flip }) {
  return (
    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <path d="M0 30 Q120 5 240 30 Q360 55 480 30 Q600 5 720 30 Q840 55 960 30 Q1080 5 1200 30 Q1320 55 1440 30" 
        fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="8 6"/>
    </svg>
  );
}

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ─── Dropdown Component ─── */
function NavDropdown({ label, items, isAnchor }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 200);
  };

  if (isAnchor) {
    return (
      <a
        href={items}
        className="nav-link"
        onMouseEnter={() => {}}
        style={{ position: 'relative' }}
      >
        {label}
      </a>
    );
  }

  return (
    <div
      className="nav-dropdown-wrap"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button className="nav-link nav-link-dropdown">
        {label}
        <ChevronDown
          className="nav-chevron"
          size={14}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}
        />
      </button>
      <div className={`nav-dropdown-panel ${open ? 'nav-dropdown-open' : ''}`}>
        {items.map((item, i) => (
          <a key={i} href={item.href} className="nav-dropdown-item">
            {item.icon && <item.icon size={16} />}
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`faq-card ${isOpen ? 'faq-card-open' : ''}`} onClick={onToggle}>
      <div className="faq-header">
        <h3 className="faq-question">{question}</h3>
        <div className="faq-toggle-icon">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </div>
      <div className={`faq-answer-wrap ${isOpen ? 'faq-answer-visible' : ''}`}>
        <p className="faq-answer">{answer}</p>
      </div>
    </div>
  );
}

/* ─── Carousel ─── */
function ServiceCarousel() {
  const [current, setCurrent] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('right');

  const goTo = (idx, dir) => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 400);
  };

  const prev = () => {
    const idx = current === 0 ? serviceCards.length - 1 : current - 1;
    goTo(idx, 'left');
  };
  const next = () => {
    const idx = current === serviceCards.length - 1 ? 0 : current + 1;
    goTo(idx, 'right');
  };

  const getVisible = () => {
    const len = serviceCards.length;
    const leftIdx = (current - 1 + len) % len;
    const rightIdx = (current + 1) % len;
    return [leftIdx, current, rightIdx];
  };

  const [leftIdx, centerIdx, rightIdx] = getVisible();

  return (
    <div className="carousel-container">
      <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Previous">
        <ArrowLeft size={28} />
      </button>

      <div className="carousel-track">
        {[leftIdx, centerIdx, rightIdx].map((idx, pos) => {
          const card = serviceCards[idx];
          const posClass = pos === 0 ? 'carousel-card-left' : pos === 1 ? 'carousel-card-center' : 'carousel-card-right';
          const animClass = isAnimating ? (direction === 'right' ? 'carousel-slide-left' : 'carousel-slide-right') : '';

          return (
            <div key={`${idx}-${pos}`} className={`carousel-card ${posClass} ${animClass}`}>
              <div className="carousel-card-inner" style={{ backgroundColor: card.bg }}>
                <h3 className="carousel-card-title">{card.title}</h3>
                <p className="carousel-card-subtitle">{card.subtitle}</p>
                <div className="carousel-card-illustration">
                  <card.icon size={80} strokeWidth={1} color={card.accent} />
                </div>
                <p className="carousel-card-desc">{card.description}</p>
                <a href="#services" className="sketch-btn sketch-btn-sm" style={{ '--btn-accent': card.accent }}>
                  Learn more <ArrowRight size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Next">
        <ArrowRight size={28} />
      </button>

      <div className="carousel-dots">
        {serviceCards.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? 'carousel-dot-active' : ''}`}
            onClick={() => goTo(i, i > current ? 'right' : 'left')}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [queryForm, setQueryForm] = useState({ name: '', email: '', message: '' });
  const [queryStatus, setQueryStatus] = useState('');
  const [querySending, setQuerySending] = useState(false);

  const [heroRef, heroInView] = useInView(0.1);
  const [servicesRef, servicesInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.2);
  const [faqRef, faqInView] = useInView(0.1);
  const [aboutRef, aboutInView] = useInView(0.1);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (querySending) return;

    setQuerySending(true);
    setQueryStatus('Sending your message...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/public/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: queryForm.name.trim(),
          email: queryForm.email.trim(),
          message: queryForm.message.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || 'Unable to send query');
      }

      if (payload?.delivery === 'mailto_fallback' && payload?.fallbackMailto) {
        window.location.href = payload.fallbackMailto;
      }

      setQueryStatus('Your query has been sent successfully.');
      setQueryForm({ name: '', email: '', message: '' });
    } catch (error) {
      setQueryStatus(error.message || 'Unable to send query right now. Please try again later.');
    } finally {
      setQuerySending(false);
      setTimeout(() => setQueryStatus(''), 5000);
    }
  };

  const servicesDropdown = [
    { label: 'Job Specific Roadmap', href: '#services', icon: Target },
    { label: 'AI Personalised Quiz', href: '#services', icon: Brain },
    { label: 'Readiness Score', href: '#services', icon: BarChart3 },
    { label: 'Strategic Planning', href: '#services', icon: Compass },
    { label: 'Content', href: '#services', icon: BookOpen },
  ];

  const faqDropdown = [
    { label: 'Planning', href: '#faq', icon: Compass },
    { label: 'How It Works', href: '#faq', icon: HelpCircle },
    { label: 'Quiz', href: '#faq', icon: Brain },
    { label: 'Content', href: '#faq', icon: BookOpen },
  ];

  return (
    <div className="sankalp-landing">
      {/* ═══ HEADER ═══ */}
      <header className="sk-header">
        <div className="sk-header-inner">
          <Link to="/" className="sk-logo">
            <div className="sk-logo-icon">
              <GraduationCap size={22} color="#fff" />
            </div>
            <div className="sk-logo-text">
              <span className="sk-logo-name">Sankalp</span>
              <span className="sk-logo-tag">Career Readiness</span>
            </div>
          </Link>

          <nav className="sk-nav">
            <a href="#hero" className="nav-link">My Guide</a>
            <NavDropdown label="Services" items={servicesDropdown} />
            <NavDropdown label="FAQ" items={faqDropdown} />
            <a href="#about" className="nav-link">About</a>
          </nav>

          <div className="sk-header-actions">
            <Link to="/login" className="sketch-btn sketch-btn-outline">
              Login
            </Link>
            <Link to="/register" className="sketch-btn sketch-btn-primary">
              Sign Up <ArrowRight size={16} />
            </Link>
          </div>

          <button
            className="sk-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'hl-open-1' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'hl-open-2' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'hl-open-3' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`sk-mobile-menu ${mobileMenuOpen ? 'sk-mobile-open' : ''}`}>
          <a href="#hero" className="sk-mobile-link" onClick={() => setMobileMenuOpen(false)}>My Guide</a>
          <a href="#services" className="sk-mobile-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#faq" className="sk-mobile-link" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <a href="#about" className="sk-mobile-link" onClick={() => setMobileMenuOpen(false)}>About</a>
          <div className="sk-mobile-actions">
            <Link to="/login" className="sketch-btn sketch-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Login</Link>
            <Link to="/register" className="sketch-btn sketch-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign Up <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section id="hero" className="sk-hero" ref={heroRef}>
          <SketchWaveDivider />
          <div className={`sk-hero-content ${heroInView ? 'animate-fade-up' : 'pre-animate'}`}>
            <div className="sk-hero-badge">
              <Sparkles size={16} />
              <span>Built for placement-ready students</span>
            </div>
            <h1 className="sk-hero-title">My Guide</h1>
            <p className="sk-hero-subtitle">
              Every career path matters. Which one are you preparing for today?
            </p>
          </div>

          <div className={`sk-hero-illustration ${heroInView ? 'animate-fade-up-delay' : 'pre-animate'}`}>
            <SketchMountains className="sk-mountains-svg" />
          </div>

          {/* Service Carousel */}
          <div className={`sk-carousel-section ${heroInView ? 'animate-fade-up-delay2' : 'pre-animate'}`}>
            <ServiceCarousel />
          </div>

          <SketchWaveDivider flip />
        </section>

        {/* ═══ SERVICES DETAIL ═══ */}
        <section id="services" className="sk-services" ref={servicesRef}>
          <div className="sk-section-container">
            <div className={`sk-section-header ${servicesInView ? 'animate-fade-up' : 'pre-animate'}`}>
              <p className="sk-section-label">Our Services</p>
              <h2 className="sk-section-title">Everything you need to prepare with clarity</h2>
              <p className="sk-section-desc">
                Each feature is designed to reduce confusion, improve consistency, and increase your placement readiness.
              </p>
            </div>

            <div className="sk-services-grid">
              {serviceCards.map((service, i) => (
                <article
                  key={service.title}
                  className={`sk-service-card ${servicesInView ? 'animate-fade-up' : 'pre-animate'}`}
                  style={{ animationDelay: `${i * 100 + 150}ms`, backgroundColor: service.bg }}
                >
                  <div className="sk-service-icon" style={{ color: service.accent }}>
                    <service.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="sk-service-name">{service.title} {service.subtitle}</h3>
                  <p className="sk-service-desc">{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="sk-stats" ref={statsRef}>
          <SketchWaveDivider />
          <div className="sk-stats-inner">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`sk-stat-card ${statsInView ? 'animate-fade-up' : 'pre-animate'}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <p className="sk-stat-value">{stat.value}</p>
                <p className="sk-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
          <SketchWaveDivider flip />
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="sk-how-it-works">
          <div className="sk-section-container">
            <div className="sk-section-header animate-fade-up">
              <p className="sk-section-label">How It Works</p>
              <h2 className="sk-section-title">Your journey in three simple steps</h2>
            </div>
            <div className="sk-steps-row">
              {[
                { num: '01', title: 'Create Your Profile', desc: 'Sign up, upload your resume, set goals and start with a readiness baseline tailored for you.', icon: Users },
                { num: '02', title: 'Follow Smart Guidance', desc: 'Use AI-driven roadmaps, adaptive quizzes, and progress tracking to stay focused every week.', icon: Compass },
                { num: '03', title: 'Land Your Dream Role', desc: 'Apply to matching opportunities with confidence and measurable interview readiness.', icon: Award },
              ].map((step, i) => (
                <div key={step.num} className="sk-step-card" style={{ animationDelay: `${i * 150}ms` }}>
                  <span className="sk-step-num">{step.num}</span>
                  <div className="sk-step-icon-wrap">
                    <step.icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="sk-step-title">{step.title}</h3>
                  <p className="sk-step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section id="faq" className="sk-faq" ref={faqRef}>
          <div className="sk-section-container">
            <div className={`sk-section-header ${faqInView ? 'animate-fade-up' : 'pre-animate'}`}>
              <p className="sk-section-label">FAQ</p>
              <h2 className="sk-section-title">Questions students ask first</h2>
            </div>
            <div className={`sk-faq-list ${faqInView ? 'animate-fade-up' : 'pre-animate'}`}>
              {faqItems.map((item, idx) => (
                <FAQItem
                  key={idx}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === idx}
                  onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section id="about" className="sk-about" ref={aboutRef}>
          <div className="sk-section-container">
            <div className={`sk-about-grid ${aboutInView ? 'animate-fade-up' : 'pre-animate'}`}>
              <div className="sk-about-content">
                <p className="sk-section-label">About Us</p>
                <h2 className="sk-section-title">Empowering every student's career journey</h2>
                <p className="sk-about-text">
                  Sankalp is an AI-powered career readiness platform designed for engineering students and campus placement teams.
                  We combine structured preparation, intelligent assessments, and opportunity discovery into one seamless experience.
                </p>
                <p className="sk-about-text">
                  Our mission is to ensure no student feels underprepared or lost during their placement journey.
                  Built with passion by students, for students.
                </p>
                <div className="sk-about-contact">
                  <div className="sk-contact-item">
                    <Mail size={18} />
                    <a href="mailto:aasuryavanshi370724@kkwagh.edu.in">aasuryavanshi370724@kkwagh.edu.in</a>
                  </div>
                  <div className="sk-contact-item">
                    <MapPin size={18} />
                    <span>K.K. Wagh Institute, Nashik, India</span>
                  </div>
                </div>
              </div>
              <div className="sk-about-visual">
                <div className="sk-about-card-stack">
                  <div className="sk-about-float-card sk-afc-1">
                    <Rocket size={24} />
                    <span>2,400+ Students Guided</span>
                  </div>
                  <div className="sk-about-float-card sk-afc-2">
                    <Award size={24} />
                    <span>94% Placement Rate</span>
                  </div>
                  <div className="sk-about-float-card sk-afc-3">
                    <GraduationCap size={24} />
                    <span>Built by Students</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="sk-cta">
          <SketchWaveDivider />
          <div className="sk-section-container">
            <div className="sk-cta-inner">
              <h2 className="sk-cta-title">Start your placement journey today</h2>
              <p className="sk-cta-desc">Join thousands of students building confidence with structured preparation and readiness visibility.</p>
              <div className="sk-cta-actions">
                <Link to="/register" className="sketch-btn sketch-btn-primary sketch-btn-lg">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="sketch-btn sketch-btn-outline sketch-btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="sk-footer">
        <div className="sk-footer-inner">
          <div className="sk-footer-grid">
            {/* Brand */}
            <div className="sk-footer-brand">
              <div className="sk-logo" style={{ marginBottom: '1rem' }}>
                <div className="sk-logo-icon">
                  <GraduationCap size={20} color="#fff" />
                </div>
                <div className="sk-logo-text">
                  <span className="sk-logo-name" style={{ color: '#fff' }}>Sankalp</span>
                  <span className="sk-logo-tag" style={{ color: 'rgba(255,255,255,0.6)' }}>Career Readiness</span>
                </div>
              </div>
              <p className="sk-footer-brand-desc">
                AI-powered placement readiness and career intelligence for engineering campuses.
              </p>
            </div>

            {/* Links */}
            <div className="sk-footer-col">
              <h4 className="sk-footer-heading">Platform</h4>
              <ul className="sk-footer-links">
                <li><a href="#services">Roadmaps</a></li>
                <li><a href="#services">AI Quizzes</a></li>
                <li><a href="#services">Readiness Score</a></li>
                <li><a href="#services">Strategic Planning</a></li>
              </ul>
            </div>

            <div className="sk-footer-col">
              <h4 className="sk-footer-heading">Quick Links</h4>
              <ul className="sk-footer-links">
                <li><a href="#hero">My Guide</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#about">About Us</a></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>

            <div className="sk-footer-col">
              <h4 className="sk-footer-heading">Contact</h4>
              <ul className="sk-footer-links">
                <li><a href="mailto:aasuryavanshi370724@kkwagh.edu.in">aasuryavanshi370724@kkwagh.edu.in</a></li>
                <li>K.K. Wagh Institute</li>
                <li>Nashik, Maharashtra, India</li>
              </ul>
            </div>
          </div>

          {/* Query Form */}
          <div className="sk-footer-query">
            <h4 className="sk-footer-query-title">Have a question? Send us a message</h4>
            <form className="sk-query-form" onSubmit={handleQuerySubmit}>
              <div className="sk-query-row">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={queryForm.name}
                  onChange={(e) => setQueryForm({ ...queryForm, name: e.target.value })}
                  required
                  className="sk-query-input"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={queryForm.email}
                  onChange={(e) => setQueryForm({ ...queryForm, email: e.target.value })}
                  required
                  className="sk-query-input"
                />
              </div>
              <textarea
                placeholder="Write your message..."
                value={queryForm.message}
                onChange={(e) => setQueryForm({ ...queryForm, message: e.target.value })}
                required
                rows={3}
                className="sk-query-input sk-query-textarea"
              />
              <div className="sk-query-submit-row">
                <button type="submit" className="sketch-btn sketch-btn-primary" disabled={querySending}>
                  <Send size={16} />
                  {querySending ? 'Sending...' : 'Send Message'}
                </button>
                {queryStatus && <span className="sk-query-status">{queryStatus}</span>}
              </div>
            </form>
          </div>

          <div className="sk-footer-bottom">
            <p>© 2026 Sankalp — Career Readiness Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
