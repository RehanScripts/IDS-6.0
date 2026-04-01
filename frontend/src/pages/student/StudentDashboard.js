import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, Map, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <p className="text-2xl font-semibold text-slate-900">{stats?.readiness_score || 0}%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-roadmap">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Active Roadmap</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.active_roadmap || 0}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all" data-testid="stat-card-progress">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Progress %</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.progress_percentage || 0}%</p>
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
                <span className="text-lg font-semibold text-indigo-600">{company.company_name[0]}</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                {company.status}
              </span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">{company.company_name}</h3>
            <p className="text-sm text-slate-600 mb-4">{company.role}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>{company.date}</span>
            </div>
            <button
              onClick={() => navigate('/student/companies')}
              data-testid={`prepare-button-${idx}`}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Prepare
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
