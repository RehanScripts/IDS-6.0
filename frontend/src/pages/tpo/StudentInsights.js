import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function StudentInsights() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const mockStudents = [
          { id: 1, name: 'Aarav Kumar', branch: 'Computer Science', readiness_score: 85, weak_skills: ['DSA', 'System Design'] },
          { id: 2, name: 'Priya Singh', branch: 'Computer Science', readiness_score: 92, weak_skills: ['Networking'] },
          { id: 3, name: 'Rohan Patel', branch: 'Electronics', readiness_score: 68, weak_skills: ['DSA', 'Web Development', 'System Design'] },
          { id: 4, name: 'Neha Sharma', branch: 'Mechanical', readiness_score: 45, weak_skills: ['Programming', 'DSA', 'Database Design'] },
          { id: 5, name: 'Arjun Verma', branch: 'Civil', readiness_score: 55, weak_skills: ['Coding', 'DSA'] },
          { id: 6, name: 'Disha Gupta', branch: 'Computer Science', readiness_score: 78, weak_skills: ['System Design'] },
        ];

        let filtered = mockStudents;

        if (branchFilter) {
          filtered = filtered.filter(s => s.branch === branchFilter);
        }

        if (readinessFilter) {
          filtered = filtered.filter(s => s.readiness_score >= parseInt(readinessFilter));
        }

        setStudents(filtered);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [branchFilter, readinessFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8" data-testid="student-insights-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Student Insights</h1>
        <p className="text-slate-500 mt-2">Monitor student readiness and skill gaps</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={branchFilter || "all"} onValueChange={(val) => setBranchFilter(val === "all" ? "" : val)}>
          <SelectTrigger className="w-[200px]" data-testid="filter-branch">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Mechanical">Mechanical</SelectItem>
            <SelectItem value="Civil">Civil</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readinessFilter || "all"} onValueChange={(val) => setReadinessFilter(val === "all" ? "" : val)}>
          <SelectTrigger className="w-[200px]" data-testid="filter-readiness">
            <SelectValue placeholder="All Readiness" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Readiness</SelectItem>
            <SelectItem value="70">70% and above</SelectItem>
            <SelectItem value="60">60% and above</SelectItem>
            <SelectItem value="50">50% and above</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Name</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Branch</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Readiness %</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Weak Skills</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={idx} data-testid={`student-row-${idx}`} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">{student.name}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{student.branch}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px] bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${student.readiness_score || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 min-w-[40px]">{student.readiness_score || 0}%</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-1 flex-wrap">
                    {student.weak_skills?.map((skill, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
