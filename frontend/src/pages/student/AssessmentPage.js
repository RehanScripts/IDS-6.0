import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';

const TRADE_OPTIONS = ['Electrician', 'Fitter', 'Welder', 'COPA', 'Mechanic', 'Turner', 'Other'];
const PASSING_YEARS = ['2022', '2023', '2024', '2025', 'Appearing'];
const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule',
  'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban',
  'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri',
  'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

const TECH_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATION_CHIPS = [3, 7, 14, 21, 30];
const LOADING_MESSAGES = [
  'Analyzing your profile...',
  'Calculating skill gaps...',
  'Building your personalized roadmap...'
];

function modeLabel(totalDays) {
  if (totalDays <= 3) return '🔥 Crash';
  if (totalDays <= 7) return '⚡ Intensive';
  if (totalDays <= 14) return '📘 Standard';
  if (totalDays <= 30) return '🎯 Comprehensive';
  return '🚀 Advanced';
}

const initialState = {
  fullName: '',
  trade: '',
  passingYear: '',
  instituteName: '',
  district: '',
  interviewDate: '',
  roadmapDurationMode: 'interview-date',
  manualRoadmapDays: 14,
  todayDate: new Date().toISOString().slice(0, 10),
  technicalRatings: {
    blueprint: 'Beginner',
    machineHandling: 'Beginner',
    safetyProtocols: 'Beginner',
    computerBasics: 'Beginner',
    tradePractical: 'Beginner'
  },
  certifications: [],
  softRatings: {
    communicationRegional: 3,
    englishBasics: 3,
    teamwork: 3,
    punctuality: 3,
    problemSolving: 3
  },
  englishInterview: 'Somewhat',
  hasInternship: 'No',
  internshipWhere: '',
  internshipDuration: '',
  internshipRole: '',
  attendedInterviewBefore: 'No',
  hasResume: 'Yes',
  learningLanguage: 'Marathi',
  learningStyle: 'Watch videos',
  hoursPerDay: 1,
  internetAccess: 'Yes',
  mcqAnswers: {}
};

function toDate(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(today, interview) {
  const diff = Math.floor((toDate(interview).getTime() - toDate(today).getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { companies, getCompanyQuiz, generateRoadmapFromAssessment } = useRoadmaps();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialState);
  const [loadingPhase, setLoadingPhase] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [mcqResult, setMcqResult] = useState(null);
  const [mcqIndex, setMcqIndex] = useState(0);

  const companyId = searchParams.get('company') || companies[0]?.id;
  const selectedCompany = companies.find((c) => c.id === companyId) || companies[0];
  const quiz = getCompanyQuiz(selectedCompany?.id);

  useEffect(() => {
    if (!selectedCompany) {
      navigate('/student/companies');
    }
  }, [navigate, selectedCompany]);

  useEffect(() => {
    if (step === 6) {
      setMcqIndex(0);
    }
  }, [step, selectedCompany?.id]);

  const prepDaysRaw = useMemo(() => {
    if (form.roadmapDurationMode !== 'interview-date' || !form.interviewDate) return 0;
    return daysBetween(form.todayDate, form.interviewDate);
  }, [form.todayDate, form.interviewDate, form.roadmapDurationMode]);

  const totalDays = form.roadmapDurationMode === 'manual'
    ? Number(form.manualRoadmapDays || 1)
    : (form.interviewDate ? Math.max(1, prepDaysRaw) : 0);
  const totalHours = totalDays > 0 ? Number((totalDays * Number(form.hoursPerDay || 0)).toFixed(1)) : 0;

  const progressPct = Math.round((step / 6) * 100);

  useEffect(() => {
    if (!loadingPhase) return undefined;
    const interval = setInterval(() => {
      setLoadingMsgIndex((idx) => (idx + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, [loadingPhase]);

  const stepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(
        form.fullName &&
        form.trade &&
        form.passingYear &&
        form.instituteName &&
        form.district &&
        (form.roadmapDurationMode === 'manual' ? form.manualRoadmapDays >= 1 : form.interviewDate)
      );
    }

    if (step === 2) {
      return form.certifications.length > 0;
    }

    if (step === 3) {
      return Boolean(form.englishInterview);
    }

    if (step === 4) {
      if (form.hasInternship === 'Yes') {
        return Boolean(form.internshipWhere && form.internshipDuration && form.internshipRole && form.attendedInterviewBefore && form.hasResume);
      }
      return Boolean(form.attendedInterviewBefore && form.hasResume);
    }

    if (step === 5) {
      return Boolean(form.learningLanguage && form.learningStyle && form.hoursPerDay >= 0.5 && form.internetAccess);
    }

    if (step === 6) {
      return quiz.length === 5 && quiz.every((_, idx) => form.mcqAnswers[idx] != null);
    }

    return false;
  }, [step, form, quiz]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setTechnical = (key, value) => {
    setForm((prev) => ({ ...prev, technicalRatings: { ...prev.technicalRatings, [key]: value } }));
  };

  const setSoft = (key, value) => {
    setForm((prev) => ({ ...prev, softRatings: { ...prev.softRatings, [key]: Number(value) } }));
  };

  const toggleCertification = (name) => {
    setForm((prev) => {
      const exists = prev.certifications.includes(name);
      const certifications = exists
        ? prev.certifications.filter((x) => x !== name)
        : [...prev.certifications.filter((x) => x !== 'None'), name];
      return { ...prev, certifications: name === 'None' ? ['None'] : certifications };
    });
  };

  const submitAssessment = () => {
    const mcqScore = quiz.reduce((acc, q, idx) => (form.mcqAnswers[idx] === q.correctIndex ? acc + 1 : acc), 0);
    setMcqResult(mcqScore);

    const roadmap = generateRoadmapFromAssessment(selectedCompany.id, {
      ...form,
      mcqScore,
      mcqTotal: 5,
      prepDaysRaw,
      totalDays: Math.max(1, totalDays),
      totalHours,
      generatedAt: new Date().toISOString()
    });

    setLoadingPhase(true);

    setTimeout(() => {
      setLoadingPhase(false);
      if (roadmap) {
        navigate('/roadmaps');
      }
    }, 2800);
  };

  if (!selectedCompany) return null;

  if (loadingPhase) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-xl w-full text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Outfit' }}>5-Minute Self-Assessment</h1>
          <p className="text-slate-600">{LOADING_MESSAGES[loadingMsgIndex]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6" data-testid="assessment-page">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit' }}>5-Minute Self-Assessment</h1>
            <span className="text-sm text-slate-600">Step {step} of 6</span>
          </div>
          <p className="text-sm text-slate-600 mb-3">Target Company: <span className="font-medium text-slate-900">{selectedCompany.company_name}</span></p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm min-h-[62vh] flex flex-col justify-between">
          <div>
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Full Name" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                <select className="border border-slate-200 rounded-lg px-3 py-2" value={form.trade} onChange={(e) => setField('trade', e.target.value)}>
                  <option value="">ITI Trade / Course</option>
                  {TRADE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <select className="border border-slate-200 rounded-lg px-3 py-2" value={form.passingYear} onChange={(e) => setField('passingYear', e.target.value)}>
                  <option value="">Year of Passing</option>
                  {PASSING_YEARS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Institute Name" value={form.instituteName} onChange={(e) => setField('instituteName', e.target.value)} />
                <select className="border border-slate-200 rounded-lg px-3 py-2" value={form.district} onChange={(e) => setField('district', e.target.value)}>
                  <option value="">District</option>
                  {MAHARASHTRA_DISTRICTS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-100" value={form.todayDate} readOnly />

                <div className="md:col-span-2 border border-slate-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-800 mb-2">Roadmap Duration</p>
                  <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setField('roadmapDurationMode', 'interview-date')}
                      className={`px-3 py-2 text-sm ${form.roadmapDurationMode === 'interview-date' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      Use Interview Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setField('roadmapDurationMode', 'manual')}
                      className={`px-3 py-2 text-sm border-l border-slate-200 ${form.roadmapDurationMode === 'manual' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      I&apos;ll choose manually
                    </button>
                  </div>

                  {form.roadmapDurationMode === 'interview-date' ? (
                    <div className="mt-3 space-y-2">
                      <input
                        className="border border-slate-200 rounded-lg px-3 py-2 w-full md:w-72"
                        type="date"
                        min={form.todayDate}
                        value={form.interviewDate}
                        onChange={(e) => setField('interviewDate', e.target.value)}
                      />
                      <div className="border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 text-sm text-indigo-800">
                        You have <strong>{Math.max(0, prepDaysRaw)}</strong> days to prepare
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <label className="text-sm text-slate-700">How many days do you want your roadmap to be?</label>
                      <input
                        type="range"
                        min="1"
                        max="90"
                        value={form.manualRoadmapDays}
                        onChange={(e) => setField('manualRoadmapDays', Number(e.target.value))}
                        className="w-full"
                      />
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={form.manualRoadmapDays}
                        onChange={(e) => setField('manualRoadmapDays', Math.min(90, Math.max(1, Number(e.target.value) || 1)))}
                        className="border border-slate-200 rounded-lg px-3 py-2 w-28"
                      />
                      <div className="flex flex-wrap gap-2">
                        {DURATION_CHIPS.map((d) => (
                          <button
                            type="button"
                            key={d}
                            onClick={() => setField('manualRoadmapDays', d)}
                            className={`px-3 py-1 text-xs rounded-full border ${form.manualRoadmapDays === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}
                          >
                            {d} days
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 text-sm text-indigo-800">
                    Your roadmap will be: <strong>{Math.max(1, totalDays || 1)} days</strong> | Mode: <strong>{modeLabel(Math.max(1, totalDays || 1))}</strong>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {[
                  ['blueprint', 'Blueprint/Drawing Reading'],
                  ['machineHandling', 'Tool & Machine Handling'],
                  ['safetyProtocols', 'Safety Protocols'],
                  ['computerBasics', 'Computer Basics (MS Office, email)'],
                  ['tradePractical', 'Trade-specific practical skills']
                ].map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-700">{label}</p>
                    <select className="border border-slate-200 rounded-md px-2 py-1 text-sm" value={form.technicalRatings[k]} onChange={(e) => setTechnical(k, e.target.value)}>
                      {TECH_LEVELS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <p className="text-sm text-slate-700 mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-3">
                    {['NCVT', 'SCVT', 'NAC', 'NAPS', 'None'].map((c) => (
                      <label key={c} className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" checked={form.certifications.includes(c)} onChange={() => toggleCertification(c)} />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {[
                  ['communicationRegional', 'Communication in Hindi/Marathi'],
                  ['englishBasics', 'Basic English reading/writing'],
                  ['teamwork', 'Teamwork'],
                  ['punctuality', 'Punctuality & discipline'],
                  ['problemSolving', 'Problem-solving attitude']
                ].map(([k, label]) => (
                  <div key={k}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-indigo-700 font-medium">{form.softRatings[k]}</span>
                    </div>
                    <input type="range" min="1" max="5" value={form.softRatings[k]} onChange={(e) => setSoft(k, e.target.value)} className="w-full" />
                  </div>
                ))}
                <div>
                  <p className="text-sm text-slate-700 mb-1">Can you speak English in an interview?</p>
                  <select className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full md:w-72" value={form.englishInterview} onChange={(e) => setField('englishInterview', e.target.value)}>
                    <option>Yes</option>
                    <option>Somewhat</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-700 mb-1">Prior internship or apprenticeship?</p>
                  <select className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full md:w-72" value={form.hasInternship} onChange={(e) => setField('hasInternship', e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>

                {form.hasInternship === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Where" value={form.internshipWhere} onChange={(e) => setField('internshipWhere', e.target.value)} />
                    <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Duration" value={form.internshipDuration} onChange={(e) => setField('internshipDuration', e.target.value)} />
                    <input className="border border-slate-200 rounded-lg px-3 py-2" placeholder="Role" value={form.internshipRole} onChange={(e) => setField('internshipRole', e.target.value)} />
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-700 mb-1">Attended a job fair or interview before?</p>
                  <select className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full md:w-72" value={form.attendedInterviewBefore} onChange={(e) => setField('attendedInterviewBefore', e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-slate-700 mb-1">Do you have a resume/CV?</p>
                  <select className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full md:w-72" value={form.hasResume} onChange={(e) => setField('hasResume', e.target.value)}>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Need help making one</option>
                  </select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select className="border border-slate-200 rounded-lg px-3 py-2" value={form.learningLanguage} onChange={(e) => setField('learningLanguage', e.target.value)}>
                    <option>Marathi</option>
                    <option>Hindi</option>
                    <option>English</option>
                  </select>
                  <select className="border border-slate-200 rounded-lg px-3 py-2" value={form.learningStyle} onChange={(e) => setField('learningStyle', e.target.value)}>
                    <option>Watch videos</option>
                    <option>Read notes</option>
                    <option>Hands-on practice</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700">Hours available per day</span>
                    <span className="font-medium text-indigo-700">{form.hoursPerDay < 1 ? `${Math.round(form.hoursPerDay * 60)} min` : `${form.hoursPerDay} hours`}</span>
                  </div>
                  <input type="range" min="0.5" max="6" step="0.5" value={form.hoursPerDay} onChange={(e) => setField('hoursPerDay', Number(e.target.value))} className="w-full" />
                  {form.hoursPerDay < 0.5 && <p className="text-xs text-amber-600 mt-1">We recommend at least 30 minutes daily</p>}
                </div>

                <div className="border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 text-sm text-indigo-800">
                  Total preparation time: <strong>{totalHours}</strong> hours across <strong>{Math.max(1, totalDays || 0)}</strong> days
                </div>

                <div>
                  <p className="text-sm text-slate-700 mb-1">Smartphone + internet access?</p>
                  <select className="border border-slate-200 rounded-md px-3 py-2 text-sm w-full md:w-72" value={form.internetAccess} onChange={(e) => setField('internetAccess', e.target.value)}>
                    <option>Yes</option>
                    <option>Limited</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Question {mcqIndex + 1} of 5</p>
                  <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${((mcqIndex + 1) / 5) * 100}%` }}></div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-900 mb-2">Q{mcqIndex + 1}. {quiz[mcqIndex]?.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quiz[mcqIndex]?.options.map((opt, oIdx) => (
                      <label key={oIdx} className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="radio"
                          name={`mcq-${mcqIndex}`}
                          checked={form.mcqAnswers[mcqIndex] === oIdx}
                          onChange={() => setForm((prev) => ({ ...prev, mcqAnswers: { ...prev.mcqAnswers, [mcqIndex]: oIdx } }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMcqIndex((i) => Math.max(0, i - 1))}
                    disabled={mcqIndex === 0}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Previous Question
                  </button>
                  <button
                    type="button"
                    onClick={() => setMcqIndex((i) => Math.min(4, i + 1))}
                    disabled={mcqIndex === 4}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-700 disabled:opacity-40"
                  >
                    Next Question
                  </button>
                </div>

                {mcqResult != null && (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-2 text-sm text-emerald-800">
                    Score: {mcqResult} / 5
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-5">
            <button
              type="button"
              onClick={() => (step === 1 ? navigate('/student/companies') : setStep((s) => s - 1))}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!stepValid}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitAssessment}
                disabled={!stepValid}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit & Generate Roadmap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
