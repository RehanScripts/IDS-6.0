import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building2, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const MOCK_STATS = {
  total_students: 420,
  upcoming_companies: 12,
  avg_readiness_score: 68,
  placement_status: '186/420'
};

const MOCK_SKILL_GAPS = [
  { skill: 'Aptitude', count: 146 },
  { skill: 'English', count: 132 },
  { skill: 'Interview', count: 121 },
  { skill: 'Technical', count: 109 },
  { skill: 'Resume', count: 98 }
];

const MOCK_READINESS = [
  { name: 'Ready', value: 164 },
  { name: 'Need Prep', value: 256 }
];

const MOCK_TREND = [
  { month: 'Jan', placed: 18, drives: 4 },
  { month: 'Feb', placed: 24, drives: 5 },
  { month: 'Mar', placed: 31, drives: 6 },
  { month: 'Apr', placed: 27, drives: 5 },
  { month: 'May', placed: 36, drives: 7 },
  { month: 'Jun', placed: 42, drives: 8 }
];

const MOCK_BRANCH_READINESS = [
  { branch: 'Mechanical', score: 74 },
  { branch: 'Electrical', score: 69 },
  { branch: 'Computer', score: 77 },
  { branch: 'Civil', score: 58 },
  { branch: 'Electronics', score: 64 }
];

export default function TPODashboard() {
  const [stats, setStats] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [readiness, setReadiness] = useState([]);
  const [placementTrend, setPlacementTrend] = useState([]);
  const [branchReadiness, setBranchReadiness] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, skillGapsRes, readinessRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/stats`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/skill-gaps`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/readiness`, { withCredentials: true }),
        ]);
        setStats(statsRes.data);
        setSkillGaps(skillGapsRes.data);
        setReadiness(readinessRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats(MOCK_STATS);
        setSkillGaps(MOCK_SKILL_GAPS);
        setReadiness(MOCK_READINESS);
      } finally {
        setPlacementTrend(MOCK_TREND);
        setBranchReadiness(MOCK_BRANCH_READINESS);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ['#4f46e5', '#cbd5e1'];

  return (
    <div className="p-6 md:p-8" data-testid="tpo-dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Dashboard</h1>
        <p className="text-slate-500 mt-2">Overview of placement activities and student readiness</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-total-students">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Students</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.total_students || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-upcoming-companies">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Upcoming Companies</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.upcoming_companies || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-avg-readiness">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Avg Readiness Score</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.avg_readiness_score || 0}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-placement-status">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Placement Status</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.placement_status || '0/0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="skill-gap-chart">
          <h2 className="text-xl font-medium text-slate-900 mb-6" style={{fontFamily: 'Outfit'}}>Skill Gap Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillGaps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="readiness-chart">
          <h2 className="text-xl font-medium text-slate-900 mb-6" style={{fontFamily: 'Outfit'}}>Ready vs Not Ready Students</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={readiness}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {readiness.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="placement-trend-chart">
          <h2 className="text-xl font-medium text-slate-900 mb-6" style={{fontFamily: 'Outfit'}}>Placement Trend (Monthly)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={placementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="placed" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} name="Students Placed" />
              <Line type="monotone" dataKey="drives" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Company Drives" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="branch-readiness-heat">
          <h2 className="text-xl font-medium text-slate-900 mb-6" style={{fontFamily: 'Outfit'}}>Branch Readiness Snapshot</h2>
          <div className="space-y-4">
            {branchReadiness.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-700">{item.branch}</p>
                  <p className="text-sm font-semibold text-indigo-700">{item.score}%</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
