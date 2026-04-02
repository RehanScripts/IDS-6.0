import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Clock3 } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { useRoadmaps } from '../../contexts/RoadmapContext';

export default function MyRoadmaps() {
  const { roadmaps, toggleRoadmapDayCompletion } = useRoadmaps();
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);

  useEffect(() => {
    if (!selectedRoadmap && roadmaps.length > 0) {
      setSelectedRoadmap(roadmaps[0]);
    }
  }, [roadmaps, selectedRoadmap]);

  const selected = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmap?.id) || selectedRoadmap,
    [roadmaps, selectedRoadmap]
  );

  const completedDays = selected?.dayPlans?.filter((d) => d.completed).length || 0;
  const totalDays = selected?.totalDays || 0;
  const selectedProgress = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  if (roadmaps.length === 0) {
    return (
      <div className="p-6 md:p-8" data-testid="roadmaps-page">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
          <p className="text-slate-500 mt-2">Your personalized preparation roadmaps</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit'}}>No Roadmaps Yet</h2>
          <p className="text-slate-600">Generate your first roadmap from Companies or Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8" data-testid="roadmaps-page">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
        <p className="text-slate-500 mt-2">Dynamic personalized preparation plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Select Company</h2>
            <div className="space-y-2">
              {roadmaps.map((roadmap, idx) => (
                <button
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  data-testid={`roadmap-selector-${idx}`}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selected?.id === roadmap.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-slate-900">{roadmap.company_name}</p>
                  <p className="text-sm text-slate-600">{roadmap.role}</p>
                  <p className="text-xs text-slate-500 mt-1">Readiness: {roadmap.readinessScore}%</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {selected && (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="text-xl font-medium text-slate-900" style={{fontFamily: 'Outfit'}}>{selected.totalDays}-Day Personalized Roadmap</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">{selected.modeBadge}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Total Days: <strong>{selected.totalDays}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Hours/Day: <strong>{selected.hoursPerDay}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Total Prep Hours: <strong>{selected.totalHours}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{selected.daysRemaining} days remaining</div>
                </div>
                {selected.warnings?.map((w, idx) => (
                  <div key={idx} className="mb-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{w}</div>
                ))}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Overall Progress</p>
                  <p className="text-2xl font-semibold text-indigo-600">{selectedProgress}%</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${selectedProgress}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{completedDays} of {totalDays} days completed</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="skill-gap-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Gap Analysis</h2>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Strong Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.strengths?.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 border border-green-200">{skill}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Skill Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {selected.skillGaps?.map((skill, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-200">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="dynamic-plan-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Daily Plan</h2>
                <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                  {selected.dayPlans?.map((dayPlan, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={dayPlan.completed}
                            onCheckedChange={() => toggleRoadmapDayCompletion(selected.id, dayPlan.day)}
                            className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          />
                          <p className={`text-sm font-semibold ${dayPlan.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>Day {dayPlan.day}</p>
                        </div>
                        <span className="text-xs text-slate-500">{selected.totalDays - dayPlan.day + 1} days left</span>
                      </div>
                      <div className="space-y-2">
                        {dayPlan.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="bg-white border border-slate-200 rounded-md p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm ${dayPlan.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded ${task.type === 'technical' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>{task.type}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{task.estimatedTime}</span>
                              <a href={task.resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
                                {task.resource.source}<ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" data-testid="interview-prep-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Mock Interview Prep</h2>
                <div className="space-y-3">
                  {selected.interviewQuestions?.map((qa, idx) => (
                    <details key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-900">{qa.question}</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${qa.type === 'Technical' ? 'bg-blue-100 text-blue-700' : qa.type === 'HR' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{qa.type}</span>
                      </summary>
                      <p className="text-sm text-slate-600 mt-3">{qa.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
