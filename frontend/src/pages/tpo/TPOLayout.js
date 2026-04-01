import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Building2, Users, Brain, UserCheck, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { path: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tpo/companies', label: 'Company Announcements', icon: Building2 },
  { path: '/tpo/students', label: 'Student Insights', icon: Users },
  { path: '/tpo/ai-reports', label: 'AI Reports', icon: Brain },
  { path: '/tpo/shortlisted', label: 'Shortlisted Candidates', icon: UserCheck },
  { path: '/tpo/settings', label: 'Settings', icon: Settings },
];

export default function TPOLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-slate-950 flex flex-col fixed h-full" data-testid="tpo-sidebar">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-semibold text-white" style={{fontFamily: 'Outfit'}}>PlacementHub</h1>
          <p className="text-xs text-slate-400 mt-1">TPO Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`tpo-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.[0] || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="tpo-logout-button"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
