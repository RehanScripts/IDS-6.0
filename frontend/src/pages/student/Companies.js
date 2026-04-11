import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, CalendarClock, ExternalLink, Loader2, Trophy, Target, Brain } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useRoadmaps } from '../../contexts/RoadmapContext';
import CompanyIntelligencePanel from '../../components/roadmaps/CompanyIntelligencePanel';
import { generateGeminiRoadmap } from '../../services/roadmapApi';

const INDUSTRY_IMAGES = {
  Automotive: '/images/automotive.png',
  Engineering: '/images/engineering.png',
  Pharma: '/images/pharma.png',
  IT: '/images/it.png',
  Infrastructure: '/images/infrastructure.png'
};

const PREP_LEVELS = [
  { value: 'beginner', label: 'Beginner', score: 40 },
  { value: 'intermediate', label: 'Intermediate', score: 65 },
  { value: 'advanced', label: 'Advanced', score: 85 }
];

const flowDefaults = {
  step: 'profile',
  prepLevel: '',
  performanceRating: 5,
  timeAvailable: '',
  quizAnswers: [],
  quizIndex: 0,
  readinessScore: null,
  quizScore: null,
  strengths: [],
  skillGaps: []
};

const fallbackQuiz = [
  {
    question: 'How comfortable are you with the role fundamentals?',
    options: ['Not comfortable yet', 'Somewhat comfortable', 'Confident', 'Very strong'],
    correctIndex: 2
  },
  {
    question: 'Can you solve practical interview-style problems for this role?',
    options: ['Rarely', 'Sometimes', 'Often', 'Almost always'],
    correctIndex: 2
  },
  {
    question: 'How well can you explain your approach during interviews?',
    options: ['Needs major practice', 'Basic explanation', 'Clear explanation', 'Excellent articulation'],
    correctIndex: 2
  }
];

export default function Companies() {
  const { companies, getCompanyQuiz } = useRoadmaps();
  const [searchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get('company') || companies[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [jdCompany, setJdCompany] = useState(null);
  const [activeGeneratorCompanyId, setActiveGeneratorCompanyId] = useState(null);
  const [flowsByCompany, setFlowsByCompany] = useState({});
  const [loadingCompanyId, setLoadingCompanyId] = useState(null);
  const [roadmapsByCompany, setRoadmapsByCompany] = useState({});
  const [errorsByCompany, setErrorsByCompany] = useState({});
  const shouldAutoGenerate = searchParams.get('generate') === '1';

  const industries = useMemo(
    () => ['all', ...Array.from(new Set(companies.map((company) => company.industry).filter(Boolean)))],
    [companies]
  );

  const filteredCompanies = useMemo(
    () => companies.filter((company) => (statusFilter === 'all' || company.status === statusFilter) && (industryFilter === 'all' || company.industry === industryFilter)),
    [companies, statusFilter, industryFilter]
  );

  const selectedCompany = useMemo(
    () => filteredCompanies.find((company) => company.id === selectedCompanyId) || companies.find((company) => company.id === selectedCompanyId) || filteredCompanies[0] || null,
    [companies, filteredCompanies, selectedCompanyId]
  );

  const getQuizForCompany = useCallback((companyId) => {
    try {
      const quiz = getCompanyQuiz?.(companyId);
      return Array.isArray(quiz) && quiz.length ? quiz : fallbackQuiz;
    } catch (_err) {
      return fallbackQuiz;
    }
  }, [getCompanyQuiz]);

  useEffect(() => {
    if (!shouldAutoGenerate || !selectedCompanyId) return;
    const company = companies.find((item) => item.id === selectedCompanyId);
    if (!company) return;
    const quiz = getQuizForCompany(company.id);
    setActiveGeneratorCompanyId(company.id);
    setErrorsByCompany((prev) => ({ ...prev, [company.id]: '' }));
    setFlowsByCompany((prev) => ({
      ...prev,
      [company.id]: {
        ...flowDefaults,
        quizAnswers: Array(quiz.length).fill(null)
      }
    }));
  }, [shouldAutoGenerate, selectedCompanyId, companies, getQuizForCompany]);

  const getCompanyFlow = (companyId) => {
    const quiz = getQuizForCompany(companyId);
    return (
      flowsByCompany[companyId] || {
        ...flowDefaults,
        quizAnswers: Array(quiz.length).fill(null)
      }
    );
  };

  const updateCompanyFlow = (companyId, updates) => {
    setFlowsByCompany((prev) => {
      const current = getCompanyFlow(companyId);
      return {
        ...prev,
        [companyId]: {
          ...current,
          ...updates
        }
      };
    });
  };

  const openGenerator = (company) => {
    const quiz = getQuizForCompany(company.id);
    setActiveGeneratorCompanyId(company.id);
    setErrorsByCompany((prev) => ({ ...prev, [company.id]: '' }));
    setFlowsByCompany((prev) => ({
      ...prev,
      [company.id]: {
        ...flowDefaults,
        quizAnswers: Array(quiz.length).fill(null)
      }
    }));
  };

  const closeGenerator = () => {
    setActiveGeneratorCompanyId(null);
  };

  const proceedToQuiz = (companyId) => {
    const flow = getCompanyFlow(companyId);
    if (!flow.prepLevel || !flow.timeAvailable) {
      setErrorsByCompany((prev) => ({
        ...prev,
        [companyId]: 'Please select preparation level and time available.'
      }));
      return;
    }

    setErrorsByCompany((prev) => ({ ...prev, [companyId]: '' }));
    updateCompanyFlow(companyId, { step: 'quiz', quizIndex: 0 });
  };

  const selectQuizAnswer = (companyId, questionIndex, optionIndex) => {
    const flow = getCompanyFlow(companyId);
    const answers = [...flow.quizAnswers];
    answers[questionIndex] = optionIndex;
    updateCompanyFlow(companyId, { quizAnswers: answers });
  };

  const finishQuiz = (company) => {
    const quiz = getQuizForCompany(company.id);
    const flow = getCompanyFlow(company.id);

    if (flow.quizAnswers.some((answer) => answer === null || answer === undefined)) {
      setErrorsByCompany((prev) => ({
        ...prev,
        [company.id]: 'Please answer all quiz questions before continuing.'
      }));
      return;
    }

    const correctCount = quiz.reduce((count, question, index) => {
      return count + (flow.quizAnswers[index] === question.correctIndex ? 1 : 0);
    }, 0);

    const quizScore = Math.round((correctCount / quiz.length) * 100);
    const prepLevelScore = PREP_LEVELS.find((item) => item.value === flow.prepLevel)?.score || 40;
    const performanceScore = Math.max(1, Math.min(10, Number(flow.performanceRating || 5))) * 10;
    const readinessScore = Math.round(quizScore * 0.5 + prepLevelScore * 0.3 + performanceScore * 0.2);

    const requiredSkills = company?.intelligence?.requiredSkills?.technical || [];
    const mappedSkills = quiz.map((_, index) => requiredSkills[index % (requiredSkills.length || 1)] || `Skill ${index + 1}`);
    const skillGaps = Array.from(
      new Set(
        mappedSkills.filter((skill, index) => flow.quizAnswers[index] !== quiz[index].correctIndex)
      )
    );
    const strengths = requiredSkills.filter((skill) => !skillGaps.includes(skill));

    setErrorsByCompany((prev) => ({ ...prev, [company.id]: '' }));
    updateCompanyFlow(company.id, {
      step: 'analysis',
      quizScore,
      readinessScore,
      strengths,
      skillGaps
    });
  };

  const handleGenerateRoadmap = async (company) => {
    const flow = getCompanyFlow(company.id);
    setErrorsByCompany((prev) => ({ ...prev, [company.id]: '' }));

    if (flow.readinessScore == null) {
      setErrorsByCompany((prev) => ({
        ...prev,
        [company.id]: 'Complete the assessment and quiz before generating the roadmap.'
      }));
      return;
    }

    try {
      setLoadingCompanyId(company.id);
      const roadmap = await generateGeminiRoadmap({
        companyName: company.company_name,
        role: company.role,
        skillLevel: `${flow.prepLevel} (self-rating ${flow.performanceRating}/10)`,
        goal: `Prepare for ${company.role}. Readiness score: ${flow.readinessScore}/100. Focus on skill gaps: ${(flow.skillGaps || []).join(', ') || 'none'}.`,
        timeAvailable: flow.timeAvailable,
        readinessScore: flow.readinessScore,
        performanceRating: Number(flow.performanceRating),
        quizScore: flow.quizScore,
        strengths: flow.strengths,
        skillGaps: flow.skillGaps,
        requiredSkills: company?.intelligence?.requiredSkills?.technical || []
      });

      setRoadmapsByCompany((prev) => ({ ...prev, [company.id]: roadmap }));
      updateCompanyFlow(company.id, { step: 'result' });
    } catch (err) {
      const message = err?.message || err?.response?.data?.error || 'Failed to generate roadmap.';
      setErrorsByCompany((prev) => ({ ...prev, [company.id]: message }));
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const openCompanyJD = (company) => {
    if (company?.jdDataUrl) {
      window.open(company.jdDataUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setJdCompany(company);
  };

  return (
    <div className="p-6 md:p-8 bg-blue-50/40 min-h-screen" data-testid="companies-page">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold text-blue-950 tracking-tight" style={{ fontFamily: 'Outfit' }}>
          Companies
        </h1>
        <p className="text-blue-900/70 mt-2">
          Browse all {companies.length} companies and generate personalized roadmaps
        </p>
      </div>

      <div className="mb-6 bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Status</span>
          {['all', 'active', 'upcoming'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-[0.96] ${statusFilter === status ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Industry</span>
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setIndustryFilter(industry)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-[0.96] ${industryFilter === industry ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <CompanyIntelligencePanel company={selectedCompany} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company, idx) => {
          const flow = getCompanyFlow(company.id);
          const quiz = getQuizForCompany(company.id);
          const currentQuestion = quiz[flow.quizIndex];
          const roadmap = roadmapsByCompany[company.id];

          return (
            <div
              key={company.id || idx}
              data-testid={`company-card-${idx}`}
              onClick={() => setSelectedCompanyId(company.id)}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.99] transition-all cursor-pointer ${
                selectedCompanyId === company.id ? 'border-blue-400 ring-1 ring-blue-300' : 'border-blue-100'
              }`}
            >
              <div className="h-36 relative bg-blue-50">
                <img
                  src={INDUSTRY_IMAGES[company.industry] || INDUSTRY_IMAGES.Engineering}
                  alt={`${company.company_name} cover`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">
                  {company.status}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-medium text-blue-950 mb-1">{company.company_name}</h3>
                <p className="text-sm text-blue-900/80 mb-2">{company.role}</p>

                <div className="flex items-center justify-between gap-3 text-xs text-blue-900/60 mb-2">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" />
                    {company.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {company.industry || 'General'}
                  </span>
                </div>

                <p className="text-xs text-blue-900/60 mb-4">{company.eligibility}</p>
                {company.package && <p className="text-sm font-medium text-blue-700 mb-4">{company.package}</p>}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openGenerator(company);
                  }}
                  data-testid={`generate-roadmap-button-${idx}`}
                  className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm active:scale-[0.97]"
                >
                  Generate Roadmap
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCompanyJD(company);
                  }}
                  className="w-full mt-2 bg-blue-100 text-blue-900 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors active:scale-[0.97]"
                >
                  View JD
                </button>

                {activeGeneratorCompanyId === company.id && (
                  <div className="mt-4 border border-blue-200 rounded-lg bg-blue-50 p-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                    {flow.step === 'profile' && (
                      <>
                        <p className="text-sm font-semibold text-blue-900">Step 1: Self Assessment</p>
                        <p className="text-xs text-blue-800">Set your preparation level before quiz validation.</p>

                        <div className="flex gap-2 flex-wrap">
                          {PREP_LEVELS.map((level) => (
                            <button
                              key={level.value}
                              onClick={() => updateCompanyFlow(company.id, { prepLevel: level.value })}
                              className={`px-3 py-1 rounded-full text-xs border ${flow.prepLevel === level.value ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-900 border-blue-200'}`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>

                        <label className="block text-xs text-blue-800">
                          Performance Rating: <strong>{flow.performanceRating}/10</strong>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={flow.performanceRating}
                          onChange={(e) => updateCompanyFlow(company.id, { performanceRating: Number(e.target.value) })}
                          className="w-full"
                        />

                        <input
                          type="text"
                          placeholder="Time available (e.g. 2 hours/day)"
                          className="w-full border border-blue-200 rounded-md px-3 py-2 text-sm"
                          value={flow.timeAvailable}
                          onChange={(e) => updateCompanyFlow(company.id, { timeAvailable: e.target.value })}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => proceedToQuiz(company.id)}
                            className="flex-1 bg-blue-700 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-800"
                          >
                            Validate & Start Quiz
                          </button>
                          <button
                            onClick={closeGenerator}
                            className="px-3 bg-white text-blue-900 border border-blue-200 py-2 rounded-md text-sm font-medium"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    )}

                    {flow.step === 'quiz' && currentQuestion && (
                      <>
                        <p className="text-sm font-semibold text-blue-900">Step 2: Company Skill Quiz</p>
                        <p className="text-xs text-blue-800">Question {flow.quizIndex + 1} of {quiz.length}</p>
                        <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-700" style={{ width: `${((flow.quizIndex + 1) / quiz.length) * 100}%` }} />
                        </div>

                        <p className="text-sm text-slate-800">{currentQuestion.question}</p>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option, optionIndex) => (
                            <button
                              key={optionIndex}
                              onClick={() => selectQuizAnswer(company.id, flow.quizIndex, optionIndex)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm border ${flow.quizAnswers[flow.quizIndex] === optionIndex ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateCompanyFlow(company.id, { quizIndex: Math.max(0, flow.quizIndex - 1) })}
                            disabled={flow.quizIndex === 0}
                            className="px-3 py-2 rounded-md text-sm border border-blue-200 bg-white text-blue-900 disabled:opacity-40"
                          >
                            Previous
                          </button>

                          {flow.quizIndex < quiz.length - 1 ? (
                            <button
                              onClick={() => updateCompanyFlow(company.id, { quizIndex: Math.min(quiz.length - 1, flow.quizIndex + 1) })}
                              className="flex-1 px-3 py-2 rounded-md text-sm bg-blue-700 text-white"
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              onClick={() => finishQuiz(company)}
                              className="flex-1 px-3 py-2 rounded-md text-sm bg-blue-700 text-white"
                            >
                              Finish Quiz
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {(flow.step === 'analysis' || flow.step === 'result') && (
                      <>
                        <p className="text-sm font-semibold text-blue-900">Step 3: Readiness & Skill Gap Analysis</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 rounded-md border border-blue-200 bg-white">
                            <p className="text-slate-500">Readiness</p>
                            <p className="text-base font-semibold text-blue-800">{flow.readinessScore}/100</p>
                          </div>
                          <div className="p-2 rounded-md border border-blue-200 bg-white">
                            <p className="text-slate-500">Quiz Score</p>
                            <p className="text-base font-semibold text-blue-800">{flow.quizScore}/100</p>
                          </div>
                          <div className="p-2 rounded-md border border-blue-200 bg-white">
                            <p className="text-slate-500">Rating</p>
                            <p className="text-base font-semibold text-blue-800">{flow.performanceRating}/10</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-md bg-white border border-blue-200">
                          <p className="text-xs font-semibold text-emerald-700 mb-1 inline-flex items-center gap-1"><Trophy className="w-3 h-3" />Strengths</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(flow.strengths || []).map((item, index) => (
                              <span key={index} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{item}</span>
                            ))}
                            {!flow.strengths?.length && <span className="text-[11px] text-slate-500">No mapped strengths yet</span>}
                          </div>
                        </div>

                        <div className="p-2 rounded-md bg-white border border-blue-200">
                          <p className="text-xs font-semibold text-rose-700 mb-1 inline-flex items-center gap-1"><Target className="w-3 h-3" />Skill Gaps</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(flow.skillGaps || []).map((item, index) => (
                              <span key={index} className="text-[11px] px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">{item}</span>
                            ))}
                            {!flow.skillGaps?.length && <span className="text-[11px] text-slate-500">No major gaps detected</span>}
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateRoadmap(company)}
                          disabled={loadingCompanyId === company.id}
                          className="w-full bg-blue-700 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-800 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          {loadingCompanyId === company.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                          {loadingCompanyId === company.id ? 'Generating Personalized Roadmap...' : 'Generate Roadmap From Assessment'}
                        </button>
                      </>
                    )}

                    {errorsByCompany[company.id] && (
                      <p className="text-xs text-red-600">{errorsByCompany[company.id]}</p>
                    )}
                  </div>
                )}

                {roadmap && (
                  <div className="mt-4 border border-blue-200 rounded-xl bg-gradient-to-br from-white to-blue-50 p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-blue-950">{roadmap.roadmapTitle}</h4>
                        <p className="text-xs text-slate-600 mt-1">{roadmap.description}</p>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full border border-blue-300 bg-blue-100 text-blue-800 font-medium">
                        {roadmap.phases?.length || 0} phases
                      </span>
                    </div>

                    <div className="space-y-3">
                      {roadmap.phases?.map((phase, phaseIndex) => (
                        <details key={`${company.id}-phase-${phaseIndex}`} className="group rounded-lg border border-slate-200 bg-white p-3" open={phaseIndex === 0}>
                          <summary className="list-none cursor-pointer flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-700 text-white text-[11px] font-semibold">{phaseIndex + 1}</span>
                              <p className="text-sm font-medium text-slate-900 truncate">{phase.phase}</p>
                            </div>
                            <span className="text-xs text-blue-700 bg-blue-100 border border-blue-200 rounded px-2 py-0.5">{phase.duration}</span>
                          </summary>

                          <div className="pt-3 space-y-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Key Topics</p>
                              <div className="flex flex-wrap gap-1.5">
                                {(phase.topics || []).map((topic, topicIndex) => (
                                  <span key={topicIndex} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">{topic}</span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Mini Project</p>
                              <p className="text-xs text-slate-700">{phase.project || 'Project details unavailable.'}</p>
                            </div>

                            {!!phase.resources?.length && (
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Resources</p>
                                <ul className="list-disc ml-4 text-xs text-slate-700 space-y-0.5">
                                  {phase.resources.map((resource, resourceIndex) => (
                                    <li key={resourceIndex}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {!!phase.videoLinks?.length && (
                              <div className="space-y-1">
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold">Videos</p>
                                {phase.videoLinks.map((video, videoIndex) => (
                                  <a
                                    key={videoIndex}
                                    href={video.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 mr-3"
                                  >
                                    {video.title}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ))}
                              </div>
                            )}

                            {!!phase.platforms?.length && (
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-1">Recommended Platforms</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {phase.platforms.map((platform, platformIndex) => (
                                    <span key={platformIndex} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">{platform}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {jdCompany && (
        <div className="fixed inset-0 z-50 bg-blue-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setJdCompany(null)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-blue-100 shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-blue-950 mb-2" style={{ fontFamily: 'Outfit' }}>{jdCompany.company_name}</h3>
            <p className="text-sm text-blue-700 mb-4">Short Job Description</p>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-blue-50 rounded-xl p-4 border border-blue-100">{jdCompany.shortJD || 'JD will be published soon.'}</pre>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setJdCompany(null)}
                className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors active:scale-[0.97]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
