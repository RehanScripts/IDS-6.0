import React, { useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Map, TrendingUp, User, LogOut, ChevronDown,
  GraduationCap, Target, Brain, BarChart3, Compass, BookOpen, HelpCircle,
} from 'lucide-react';
import '../LandingPage.css';

const sidebarItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/companies', label: 'Companies', icon: Building2 },
  { path: '/student/assessment', label: 'Assessment', icon: Target },
  { path: '/student/roadmaps', label: 'My Roadmaps', icon: Map },
  { path: '/student/progress', label: 'Progress', icon: TrendingUp },
  { path: '/student/profile', label: 'Profile', icon: User },
];

/* ─── Dropdown ─── */
function HeaderDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);
  const handleEnter = () => { clearTimeout(timeout.current); setOpen(true); };
  const handleLeave = () => { timeout.current = setTimeout(() => setOpen(false), 200); };

  return (
    <div className="nav-dropdown-wrap" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="nav-link nav-link-dropdown">
        {label}
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} />
      </button>
      <div className={`nav-dropdown-panel ${open ? 'nav-dropdown-open' : ''}`}>
        {items.map((item, i) => (
          <NavLink key={i} to={item.href} className="nav-dropdown-item">
            {item.icon && <item.icon size={16} />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const servicesDropdown = [
    { label: 'Job Specific Roadmap', href: '/student/roadmaps', icon: Target },
    { label: 'AI Personalised Quiz', href: '/student/assessment', icon: Brain },
    { label: 'Readiness Score', href: '/student/progress', icon: BarChart3 },
    { label: 'Strategic Planning', href: '/student/roadmaps', icon: Compass },
    { label: 'Content', href: '/student/roadmaps', icon: BookOpen },
  ];

  const faqDropdown = [
    { label: 'Planning', href: '/student/roadmaps', icon: Compass },
    { label: 'How It Works', href: '/student/dashboard', icon: HelpCircle },
    { label: 'Quiz', href: '/student/assessment', icon: Brain },
    { label: 'Content', href: '/student/roadmaps', icon: BookOpen },
  ];

  return (
    <div className="sankalp-landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ═══ HEADER — Same as Landing ═══ */}
      <header className="sk-header">
        <div className="sk-header-inner">
          <Link to="/" className="sk-logo">
            <div className="sk-logo-icon"><GraduationCap size={22} color="#fff" /></div>
            <div className="sk-logo-text">
              <span className="sk-logo-name">Sankalp</span>
              <span className="sk-logo-tag">Student Portal</span>
            </div>
          </Link>

          <nav className="sk-nav">
            <NavLink to="/student/dashboard" className="nav-link">Dashboard</NavLink>
            <HeaderDropdown label="Services" items={servicesDropdown} />
            <HeaderDropdown label="FAQ" items={faqDropdown} />
            <NavLink to="/student/companies" className="nav-link">Companies</NavLink>
          </nav>

          <div className="sk-header-actions">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 14px', borderRadius: '50px',
              border: '2px solid var(--sk-ink)', background: 'var(--sk-cream)',
              boxShadow: '2px 2px 0 var(--sk-ink)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--sk-accent)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {user?.name?.[0] || 'S'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sk-ink)' }}>{user?.name || 'Student'}</span>
            </div>
            <button onClick={handleLogout} className="sketch-btn sketch-btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="sk-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            <span className={`hamburger-line ${sidebarOpen ? 'hl-open-1' : ''}`} />
            <span className={`hamburger-line ${sidebarOpen ? 'hl-open-2' : ''}`} />
            <span className={`hamburger-line ${sidebarOpen ? 'hl-open-3' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`sk-mobile-menu ${sidebarOpen ? 'sk-mobile-open' : ''}`}>
          {sidebarItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="sk-mobile-link" onClick={() => setSidebarOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <div className="sk-mobile-actions">
            <button onClick={handleLogout} className="sketch-btn sketch-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="sk-sidebar">
          <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid={`student-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={({ isActive }) => `sk-sidebar-item ${isActive ? 'sk-sidebar-item-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div style={{ padding: '1rem', borderTop: '2px dashed var(--sk-ink-muted)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', border: '1.5px solid var(--sk-ink)', background: 'var(--sk-cream)', marginBottom: '8px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sk-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {user?.name?.[0] || 'S'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--sk-ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} data-testid="student-logout-button" className="sk-sidebar-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minHeight: '100%', background: 'var(--sk-cream)' }}>
          <Outlet />
          <footer style={{ padding: '1.5rem 2rem', borderTop: '1px dashed var(--sk-ink-muted)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--sk-ink-muted)' }}>
            Sankalp Student Portal — Build your roadmap. Track progress. Crack placements.
          </footer>
        </main>
      </div>
    </div>
  );
}
