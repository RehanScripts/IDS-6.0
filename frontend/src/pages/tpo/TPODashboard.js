import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building2, TrendingUp, Award, Sparkles } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import '../LandingPage.css';

const MOCK_STATS = { total_students: 420, upcoming_companies: 12, avg_readiness_score: 68, placement_status: '186/420' };
const MOCK_SKILL_GAPS = [
  { skill: 'Aptitude', count: 146 }, { skill: 'English', count: 132 },
  { skill: 'Interview', count: 121 }, { skill: 'Technical', count: 109 }, { skill: 'Resume', count: 98 }
];
const MOCK_READINESS = [{ name: 'Ready', value: 164 }, { name: 'Need Prep', value: 256 }];
const MOCK_TREND = [
  { month: 'Jan', placed: 18, drives: 4 }, { month: 'Feb', placed: 24, drives: 5 },
  { month: 'Mar', placed: 31, drives: 6 }, { month: 'Apr', placed: 27, drives: 5 },
  { month: 'May', placed: 36, drives: 7 }, { month: 'Jun', placed: 42, drives: 8 }
];
const MOCK_BRANCH_READINESS = [
  { branch: 'Mechanical', score: 74 }, { branch: 'Electrical', score: 69 },
  { branch: 'Computer', score: 77 }, { branch: 'Civil', score: 58 }, { branch: 'Electronics', score: 64 }
];

/* Sketch wave divider */
function WaveDivider({ flip }) {
  return (
    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}>
      <path d="M0 30 Q120 5 240 30 Q360 55 480 30 Q600 5 720 30 Q840 55 960 30 Q1080 5 1200 30 Q1320 55 1440 30" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="8 6"/>
    </svg>
  );
}

const CHART_COLORS = ['#2D6A4F', '#D4E8D0'];
const BAR_COLOR = '#2D6A4F';
const LINE_COLORS = ['#2D6A4F', '#F4A261'];

export default function TPODashboard() {
  const [stats, setStats] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [readiness, setReadiness] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [placementTrend, setPlacementTrend] = useState([]);
  const [branchReadiness, setBranchReadiness] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, skillGapsRes, readinessRes, userProgressRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/stats`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/skill-gaps`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/readiness`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tpo/dashboard/user-progress`, { withCredentials: true }),
        ]);
        setStats(statsRes.data); setSkillGaps(skillGapsRes.data); setReadiness(readinessRes.data);
        setUserProgress(Array.isArray(userProgressRes.data) ? userProgressRes.data : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setStats(MOCK_STATS); setSkillGaps(MOCK_SKILL_GAPS); setReadiness(MOCK_READINESS); setUserProgress([]);
      } finally {
        setPlacementTrend(MOCK_TREND); setBranchReadiness(MOCK_BRANCH_READINESS); setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="sankalp-landing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--sk-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const metricCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, bg: '#EEF2FF', accent: '#4338CA' },
    { label: 'Active Users (24h)', value: stats?.active_users || 0, icon: Users, bg: '#ECFDF5', accent: '#047857' },
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, bg: '#E3F2FD', accent: '#1565C0' },
    { label: 'Upcoming Companies', value: stats?.upcoming_companies || 0, icon: Building2, bg: '#E8F5E9', accent: '#2E7D32' },
    { label: 'Avg Readiness', value: `${stats?.avg_readiness_score || 0}%`, icon: TrendingUp, bg: '#FFF3E0', accent: '#E65100' },
    { label: 'Placement Status', value: stats?.placement_status || '0/0', icon: Award, bg: '#FCE4EC', accent: '#AD1457' },
  ];

  const chartCardStyle = {
    border: '2px solid var(--sk-ink)',
    borderRadius: 'var(--sk-border-radius)',
    background: 'var(--sk-cream-light)',
    boxShadow: '4px 4px 0 var(--sk-ink)',
    padding: '1.5rem',
  };

  const chartTitleStyle = {
    fontFamily: 'var(--sk-font-display)',
    fontSize: '1.15rem',
    fontWeight: 600,
    margin: '0 0 1.25rem',
    color: 'var(--sk-ink)',
  };

  return (
    <div className="sankalp-landing" style={{ background: 'var(--sk-cream)', padding: '2rem' }} data-testid="tpo-dashboard">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <Sparkles size={20} color="var(--sk-accent)" />
        <h1 style={{ fontFamily: 'var(--sk-font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, margin: 0, color: 'var(--sk-ink)' }}>
          TPO Dashboard
        </h1>
      </div>
      <p style={{ fontSize: '0.92rem', color: 'var(--sk-ink-muted)', margin: '0 0 2rem' }}>
        Overview of placement activities and student readiness
      </p>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {metricCards.map((card, i) => (
          <div key={card.label} className="sk-service-card" style={{ backgroundColor: card.bg }} data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '14px', border: `2px solid ${card.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)',
              }}>
                <card.icon size={22} color={card.accent} />
              </div>
            </div>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: card.accent, margin: '0 0 6px' }}>{card.label}</p>
            <p style={{ fontFamily: 'var(--sk-font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--sk-ink)', margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <WaveDivider />

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
        <div style={chartCardStyle} data-testid="skill-gap-chart">
          <h2 style={chartTitleStyle}>Skill Gap Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={skillGaps}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--sk-ink-muted)" opacity={0.3} />
              <XAxis dataKey="skill" tick={{ fill: 'var(--sk-ink-light)', fontSize: 12, fontFamily: 'var(--sk-font-body)' }} />
              <YAxis tick={{ fill: 'var(--sk-ink-light)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--sk-cream-light)', border: '2px solid var(--sk-ink)', borderRadius: '8px', boxShadow: '2px 2px 0 var(--sk-ink)', fontFamily: 'var(--sk-font-body)' }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle} data-testid="readiness-chart">
          <h2 style={chartTitleStyle}>Ready vs Need Prep</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={readiness} cx="50%" cy="50%" innerRadius={55} outerRadius={95} fill="#8884d8" dataKey="value" label={(entry) => `${entry.name}: ${entry.value}`} stroke="var(--sk-ink)" strokeWidth={2}>
                {readiness.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--sk-cream-light)', border: '2px solid var(--sk-ink)', borderRadius: '8px', boxShadow: '2px 2px 0 var(--sk-ink)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem', margin: '1.25rem 0' }}>
        <div style={chartCardStyle} data-testid="placement-trend-chart">
          <h2 style={chartTitleStyle}>Placement Trend (Monthly)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={placementTrend}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--sk-ink-muted)" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: 'var(--sk-ink-light)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--sk-ink-light)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--sk-cream-light)', border: '2px solid var(--sk-ink)', borderRadius: '8px', boxShadow: '2px 2px 0 var(--sk-ink)' }} />
              <Legend />
              <Line type="monotone" dataKey="placed" stroke={LINE_COLORS[0]} strokeWidth={3} dot={{ r: 4, stroke: 'var(--sk-ink)', strokeWidth: 2 }} name="Students Placed" />
              <Line type="monotone" dataKey="drives" stroke={LINE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} name="Company Drives" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle} data-testid="branch-readiness-heat">
          <h2 style={chartTitleStyle}>Branch Readiness Snapshot</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {branchReadiness.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--sk-ink)' }}>{item.branch}</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--sk-accent)' }}>{item.score}%</p>
                </div>
                <div style={{ width: '100%', background: 'var(--sk-cream-dark)', borderRadius: '50px', height: 10, border: '1.5px solid var(--sk-ink)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.score}%`, height: '100%', borderRadius: '50px',
                    background: `linear-gradient(90deg, var(--sk-accent) 0%, var(--sk-accent-light) 100%)`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...chartCardStyle, marginTop: '1.5rem' }} data-testid="user-progress-table">
        <h2 style={chartTitleStyle}>Student Progress Overview</h2>
        {userProgress.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--sk-ink-muted)', fontSize: '0.9rem' }}>No student progress data available yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Branch', 'Readiness', 'Progress', 'Roadmaps', 'Status', 'Active'].map((head) => (
                    <th key={head} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid var(--sk-ink)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--sk-ink-muted)' }}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userProgress.map((student) => (
                  <tr key={student.id || student.email}>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)', fontWeight: 600 }}>{student.name || '-'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.email || '-'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.branch || '-'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.readiness_score || 0}%</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.progress_percentage || 0}%</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.active_roadmap || 0}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.placement_status || '-'}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px dashed var(--sk-ink-muted)' }}>{student.is_active ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
