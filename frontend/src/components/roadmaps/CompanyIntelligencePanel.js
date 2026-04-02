import React from 'react';

export default function CompanyIntelligencePanel({ company }) {
  if (!company) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Outfit' }}>Company Intelligence Panel</h2>
        <p className="text-sm text-slate-500">Select a company to view AI-scraped profile, hiring pattern, and skill expectations.</p>
      </div>
    );
  }

  const technical = company.intelligence.requiredSkills.technical;
  const soft = company.intelligence.requiredSkills.soft;
  const ratio = company.intelligence.ratio;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="company-intelligence-panel">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>{company.company_name}</h2>
          <p className="text-sm text-slate-600 mt-1">{company.role}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          {company.intelligence.screeningProcess}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Required Technical Skills</p>
          <div className="flex flex-wrap gap-2">
            {technical.map((skill) => (
              <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Required Soft Skills</p>
          <div className="flex flex-wrap gap-2">
            {soft.map((skill) => (
              <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Salary Band</p>
          <p className="text-sm font-semibold text-slate-900">{company.intelligence.salaryBand}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 md:col-span-2">
          <p className="text-xs text-slate-500 mb-1">Past Hiring Patterns</p>
          <p className="text-sm text-slate-700">{company.intelligence.pastHiringPatterns}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Soft Skill vs Technical Ratio</p>
          <p className="text-xs text-slate-600">Tech {ratio.technical}% / Soft {ratio.soft}%</p>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className="h-full bg-indigo-600" style={{ width: `${ratio.technical}%` }}></div>
        </div>
      </div>
    </div>
  );
}
