import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Building2, Map, TrendingUp, User, LogOut, Moon, Sun } from 'lucide-react';

const menuItems = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/companies', label: 'Companies', icon: Building2 },
  { path: '/student/roadmaps', label: 'My Roadmaps', icon: Map },
  { path: '/student/progress', label: 'Progress', icon: TrendingUp },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('placementhub.theme') || 'light');

  useEffect(() => {
    localStorage.setItem('placementhub.theme', theme);
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex md:w-64 lg:w-72 student-sidebar-panel flex-col fixed h-full" data-testid="student-sidebar">
        <div className="p-6 border-b border-slate-200/60">
          <div className="student-brand-wrap">
            <div className="student-brand-orb">PH</div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>PlacementHub</h1>
              <p className="text-xs text-slate-500 mt-1">Student Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`student-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `student-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'student-nav-item-active text-indigo-700'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <div className="student-profile-shell flex items-center gap-3 px-4 py-3 mb-2 rounded-xl">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {user?.name?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="student-logout-button"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 lg:ml-72 min-h-screen flex flex-col">
        <header className="student-top-header sticky top-0 z-20 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between border-b border-blue-100">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-blue-700">PlacementHub</p>
            <h2 className="text-lg md:text-xl font-semibold text-blue-950" style={{ fontFamily: 'Outfit' }}>Student Workspace</h2>
          </div>
          <button
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-900 hover:bg-blue-200 transition-colors active:scale-[0.97]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>

        <footer className="student-site-footer mt-auto border-t border-blue-100 px-4 md:px-8 py-4 text-xs text-blue-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <span>PlacementHub Student Portal</span>
          <span>Build your roadmap. Track progress. Crack placements.</span>
        </footer>
      </main>
    </div>
  );
}
