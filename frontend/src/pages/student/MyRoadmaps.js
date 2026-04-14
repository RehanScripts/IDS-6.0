import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Clock3, Trophy, X, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { useRoadmaps } from '../../contexts/RoadmapContext';

export default function MyRoadmaps() {
  const { roadmaps, toggleRoadmapTaskCompletion, completeRoadmapPostAssessment, getCompanyQuiz } = useRoadmaps();
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showPostQuizModal, setShowPostQuizModal] = useState(false);
  const [postQuizAnswers, setPostQuizAnswers] = useState({});
  const [showRewardCard, setShowRewardCard] = useState(false);

  useEffect(() => {
    if (!selectedRoadmap && roadmaps.length > 0) {
      setSelectedRoadmap(roadmaps[0]);
    }
  }, [roadmaps, selectedRoadmap]);

  const selected = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmap?.id) || selectedRoadmap,
    [roadmaps, selectedRoadmap]
  );

  const completedTasks = selected?.dayPlans?.reduce((sum, day) => sum + day.tasks.filter((task) => task.completed).length, 0) || 0;
  const totalTasks = selected?.dayPlans?.reduce((sum, day) => sum + day.tasks.length, 0) || 0;
  const completedDays = selected?.dayPlans?.filter((d) => d.completed).length || 0;
  const totalDays = selected?.totalDays || 0;
  const selectedProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streakDays = selected?.dayPlans?.reduce((streak, day) => (day.completed ? streak + 1 : streak), 0) || 0;
  const xpPoints = completedTasks * 15 + completedDays * 40;
  const postQuiz = useMemo(
    () => (selected?.companyId ? getCompanyQuiz(selected.companyId) : []),
    [getCompanyQuiz, selected?.companyId]
  );

  useEffect(() => {
    if (!selected || postQuiz.length === 0) return;
    if (selectedProgress !== 100) return;
    if (selected.postAssessment?.completedAt) return;
    setPostQuizAnswers({});
    setShowPostQuizModal(true);
  }, [selected, selectedProgress, postQuiz.length]);

  const submitPostQuiz = () => {
    if (!selected) return;
    if (postQuiz.some((_, idx) => postQuizAnswers[idx] == null)) return;

    const correctCount = postQuiz.reduce(
      (acc, q, idx) => (postQuizAnswers[idx] === q.correctIndex ? acc + 1 : acc),
      0
    );
    const scorePct = Math.round((correctCount / postQuiz.length) * 100);
    const finalReadiness = Math.min(
      100,
      Math.round((selected.readinessScore || 0) * 0.65 + scorePct * 0.35)
    );
    const improved = finalReadiness > (selected.readinessScore || 0);

    completeRoadmapPostAssessment(selected.id, {
      scorePct,
      finalReadiness,
      improved
    });

    setShowPostQuizModal(false);
    if (improved) {
      setShowRewardCard(true);
    }
  };

  if (roadmaps.length === 0) {
    return (
      <div className="p-6 md:p-8" data-testid="roadmaps-page">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
          <p className="text-slate-500 mt-2">Your personalized preparation roadmaps</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Outfit'}}>No Roadmaps Yet</h2>
          <p className="text-slate-600">Generate your first roadmap from Companies or Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[radial-gradient(circle_at_top_left,_#ecfdf5_0%,_#f7fef9_45%,_#ffffff_100%)] min-h-screen" data-testid="roadmaps-page">
      <style>{`
        .roadmap-pop { animation: roadmapPop 340ms ease-out both; }
        .roadmap-float { animation: roadmapFloat 3.8s ease-in-out infinite; }
        @keyframes roadmapPop { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes roadmapFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
      `}</style>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight" style={{fontFamily: 'Outfit'}}>My Roadmaps</h1>
        <p className="text-slate-500 mt-2">Dynamic personalized preparation plans with mission style progress tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white/95 border border-slate-200 rounded-xl p-6 shadow-sm backdrop-blur roadmap-pop">
            <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Select Company</h2>
            <div className="space-y-2">
              {roadmaps.map((roadmap, idx) => (
                <button
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  data-testid={`roadmap-selector-${idx}`}
                  className={`w-full text-left p-4 rounded-lg border transition-all roadmap-pop ${
                    selected?.id === roadmap.id
                      ? 'border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
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
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm roadmap-pop">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="text-xl font-medium text-slate-900" style={{fontFamily: 'Outfit'}}>{selected.totalDays}-Day Personalized Roadmap</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">{selected.modeBadge}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Total Days: <strong>{selected.totalDays}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Hours/Day: <strong>{selected.hoursPerDay}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Total Prep Hours: <strong>{selected.totalHours}</strong></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{selected.daysRemaining} days remaining</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50 px-3 py-2 roadmap-float">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">XP</p>
                    <p className="text-lg font-semibold text-emerald-900">{xpPoints}</p>
                  </div>
                  <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-3 py-2 roadmap-float">
                    <p className="text-[11px] uppercase tracking-wider text-teal-700 font-semibold">Mission Streak</p>
                    <p className="text-lg font-semibold text-teal-900">{streakDays} days</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2 roadmap-float">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold">Tasks Done</p>
                    <p className="text-lg font-semibold text-emerald-900">{completedTasks}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 roadmap-float">
                    <p className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold">Tasks Total</p>
                    <p className="text-lg font-semibold text-amber-900">{totalTasks}</p>
                  </div>
                </div>
                {selected.warnings?.map((w, idx) => (
                  <div key={idx} className="mb-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{w}</div>
                ))}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700">Overall Progress</p>
                  <p className="text-2xl font-semibold text-emerald-600">{selectedProgress}%</p>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 h-3 rounded-full transition-all" style={{ width: `${selectedProgress}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{completedDays} of {totalDays} days completed</p>
                {selected.postAssessment?.completedAt && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-semibold">Final Readiness: {selected.postAssessment.finalReadiness}%</span>
                      </div>
                      <span className="text-xs font-medium text-emerald-700">Post-quiz: {selected.postAssessment.scorePct}%</span>
                    </div>
                  </div>
                )}
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

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm roadmap-pop" data-testid="dynamic-plan-section">
                <h2 className="text-xl font-medium text-slate-900 mb-4" style={{fontFamily: 'Outfit'}}>Daily Plan</h2>
                <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                  {selected.dayPlans?.map((dayPlan, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200 roadmap-pop">
                      {(() => {
                        const completedTaskCount = dayPlan.tasks.filter((task) => task.completed).length;
                        const totalTaskCount = dayPlan.tasks.length;
                        return (
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <p className={`text-sm font-semibold ${dayPlan.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>Day {dayPlan.day}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                            {completedTaskCount}/{totalTaskCount} tasks
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{selected.totalDays - dayPlan.day + 1} days left</span>
                      </div>
                        );
                      })()}
                      <div className="space-y-2">
                        {dayPlan.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="bg-white border border-slate-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleRoadmapTaskCompletion(selected.id, dayPlan.day, task.id)}
                                  className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <p className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${task.type === 'technical' ? 'bg-teal-100 text-teal-700' : 'bg-lime-100 text-lime-700'}`}>{task.type}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{task.estimatedTime}</span>
                              <a href={task.resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
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
                        <span className={`text-xs px-2 py-0.5 rounded ${qa.type === 'Technical' ? 'bg-teal-100 text-teal-700' : qa.type === 'HR' ? 'bg-emerald-100 text-emerald-700' : 'bg-lime-100 text-lime-700'}`}>{qa.type}</span>
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

      {showPostQuizModal && selected && (
        <div className="fixed inset-0 z-[220] bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white border border-emerald-200 rounded-2xl shadow-2xl roadmap-pop">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900" style={{fontFamily: 'Outfit'}}>Final Readiness Check</h3>
                <p className="text-sm text-slate-500">Complete this post-quiz to calculate your final readiness score.</p>
              </div>
              <button
                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPostQuizModal(false)}
                aria-label="Close post quiz"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-4 max-h-[65vh] overflow-auto space-y-4">
              {postQuiz.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-800 mb-3">Q{idx + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={`${q.id}-${optIdx}`}
                        onClick={() => setPostQuizAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          postQuizAnswers[idx] === optIdx
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-emerald-100 flex items-center justify-end">
              <button
                onClick={submitPostQuiz}
                disabled={postQuiz.some((_, idx) => postQuizAnswers[idx] == null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit And Calculate Score
              </button>
            </div>
          </div>
        </div>
      )}

      {showRewardCard && selected?.postAssessment?.improved && (
        <div className="fixed inset-0 z-50 bg-emerald-950/30 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-100 p-6 shadow-2xl roadmap-pop text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center roadmap-float">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-900 mb-2" style={{fontFamily: 'Outfit'}}>Great Improvement</h3>
            <p className="text-sm text-emerald-800 mb-4">
              Your final readiness improved to {selected.postAssessment.finalReadiness}%. Keep this consistency for interview day.
            </p>
            <button
              onClick={() => setShowRewardCard(false)}
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-medium hover:bg-emerald-800 inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Close Reward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
