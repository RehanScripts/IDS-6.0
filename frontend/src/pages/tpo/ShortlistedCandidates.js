import React from 'react';
import { UserCheck } from 'lucide-react';

export default function ShortlistedCandidates() {
  const mockShortlisted = [
    { name: 'Rahul Sharma', company: 'Sahyadri Farms', role: 'Software Engineer', status: 'Interview Scheduled' },
    { name: 'Priya Singh', company: 'Aress Software', role: 'Software Engineer', status: 'Offer Received' },
    { name: 'Amit Kumar', company: 'ESDS', role: 'Software Engineer', status: 'Final Round' },
  ];

  return (
    <div className="p-6 md:p-8" data-testid="shortlisted-candidates-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Shortlisted Candidates</h1>
        <p className="text-slate-500 mt-2">Track students who have been shortlisted by companies</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Student Name</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Company</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Role</th>
              <th className="text-left py-4 px-6 text-xs uppercase tracking-wider font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockShortlisted.map((candidate, idx) => (
              <tr key={idx} data-testid={`shortlisted-row-${idx}`} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-slate-900">{candidate.name}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{candidate.company}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{candidate.role}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {candidate.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
