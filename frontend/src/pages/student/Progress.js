import React from 'react';
import { useRoadmaps } from '../../contexts/RoadmapContext';

export default function Progress() {
  const { roadmaps } = useRoadmaps();

  const getRoadmapDays = (roadmap) => {
    if (Array.isArray(roadmap?.dayPlans)) return roadmap.dayPlans;
    if (Array.isArray(roadmap?.plan)) return roadmap.plan;
    return [];
  };

  const totalDays = roadmaps.reduce((sum, r) => {
    const days = getRoadmapDays(r);
    const roadmapTotal = Number.isFinite(r?.totalDays) ? r.totalDays : days.length;
    return sum + roadmapTotal;
  }, 0);

  const completedDays = roadmaps.reduce((sum, r) => {
    const days = getRoadmapDays(r);
    return sum + days.filter((d) => d.completed).length;
  }, 0);

  const progressPercentage = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  return (
    <div className="p-6 md:p-8 bg-emerald-50/40 min-h-screen" data-testid="progress-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>Progress</h1>
        <p className="text-slate-500 mt-2">Track roadmap completion and days left</p>
      </div>

      <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">Overall Progress</p>
          <p className="text-2xl font-semibold text-emerald-600">{progressPercentage}%</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="bg-emerald-600 h-3 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} data-testid="progress-bar"></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">{completedDays} of {totalDays} days completed</p>
      </div>

      <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Roadmap-wise Progress</h2>
        <div className="space-y-3">
          {roadmaps.map((roadmap, idx) => {
            const days = getRoadmapDays(roadmap);
            const done = days.filter((d) => d.completed).length;
            const roadmapTotal = Number.isFinite(roadmap?.totalDays) ? roadmap.totalDays : days.length;
            const pct = roadmapTotal ? Math.round((done / roadmapTotal) * 100) : 0;
            return (
              <div key={roadmap.id || `${roadmap.company_name || 'roadmap'}-${idx}`} data-testid={`roadmap-progress-${idx}`} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{roadmap.company_name}</p>
                    <p className="text-xs text-slate-500">{Number.isFinite(roadmap?.daysRemaining) ? roadmap.daysRemaining : roadmapTotal - done} days left</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">{pct}%</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
          {roadmaps.length === 0 && <p className="text-sm text-slate-500">No roadmap generated yet.</p>}
        </div>
      </div>
    </div>
  );
}
