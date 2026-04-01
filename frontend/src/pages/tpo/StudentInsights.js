import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function StudentInsights() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [branchFilter, readinessFilter]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (branchFilter) params.append('branch', branchFilter);
      if (readinessFilter) params.append('min_readiness', readinessFilter);
      
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tpo/students?${params.toString()}`,
        { withCredentials: true }
      );
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[200px]" data-testid="filter-branch">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Branches</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Mechanical">Mechanical</SelectItem>
            <SelectItem value="Civil">Civil</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readinessFilter} onValueChange={setReadinessFilter}>
          <SelectTrigger className="w-[200px]" data-testid="filter-readiness">
            <SelectValue placeholder="All Readiness" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Readiness</SelectItem>
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
