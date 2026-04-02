import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RoadmapContext = createContext(null);

const QUIZ_BANK = {
  mechanical: [
    {
      question: 'Which tool is primarily used to measure outside diameter accurately?',
      options: ['Vernier caliper', 'Micrometer', 'Try square', 'Scriber'],
      correctIndex: 1
    },
    {
      question: 'What is the safest first action before machine maintenance?',
      options: ['Increase speed', 'Lockout power', 'Check paint code', 'Call vendor only'],
      correctIndex: 1
    },
    {
      question: 'A common purpose of tolerance in manufacturing is to:',
      options: ['Increase color quality', 'Control acceptable variation', 'Avoid lubrication', 'Reduce safety'],
      correctIndex: 1
    },
    {
      question: 'Which PPE is mandatory during grinding operation?',
      options: ['Sunglasses only', 'Helmet only', 'Safety goggles and gloves', 'No PPE required'],
      correctIndex: 2
    },
    {
      question: 'If a part repeatedly fails final inspection, best first method is:',
      options: ['Ignore and dispatch', 'Pareto + root cause check', 'Change supplier blindly', 'Skip inspection'],
      correctIndex: 1
    }
  ],
  automation: [
    {
      question: 'PLC primarily controls:',
      options: ['Payroll', 'Machine logic and IO', 'Office printer', 'Website traffic'],
      correctIndex: 1
    },
    {
      question: 'SCADA is mainly used for:',
      options: ['Welding only', 'Supervision and visualization', 'Mechanical cutting', 'Painting process'],
      correctIndex: 1
    },
    {
      question: 'A sensor does what in an automation line?',
      options: ['Stores attendance', 'Measures or detects conditions', 'Increases salary', 'Prints labels only'],
      correctIndex: 1
    },
    {
      question: 'Safe troubleshooting sequence starts with:',
      options: ['Guess and rewire', 'Bypass safety interlocks', 'Check alarms, logs, and wiring', 'Replace entire panel'],
      correctIndex: 2
    },
    {
      question: 'PID control helps in:',
      options: ['Color coding', 'Stable process response', 'Sheet cutting', 'HR screening'],
      correctIndex: 1
    }
  ],
  project: [
    {
      question: 'BOQ in project work stands for:',
      options: ['Book of Quality', 'Bill of Quantities', 'Balance of Queries', 'Board of Quotients'],
      correctIndex: 1
    },
    {
      question: 'Critical path affects:',
      options: ['Canteen menu', 'Project completion time', 'Resume format', 'Salary tax'],
      correctIndex: 1
    },
    {
      question: 'Most useful tool for basic schedule tracking is:',
      options: ['Gantt chart', 'Pie chart only', 'Poster board', 'Flow meter'],
      correctIndex: 0
    },
    {
      question: 'When a key vendor is delayed, first step is:',
      options: ['Ignore', 'Assess impact and resequence', 'Stop all work', 'Cancel project'],
      correctIndex: 1
    },
    {
      question: 'Project update communication should be:',
      options: ['Rare and informal', 'Clear, timely, and documented', 'Only verbal', 'Done after project ends'],
      correctIndex: 1
    }
  ]
};

const COMPANY_INTELLIGENCE = [
  {
    id: 'mahindra',
    domain: 'mechanical',
    company_name: 'Mahindra & Mahindra Ltd.',
    role: 'Graduate Engineer Trainee (Mechanical)',
    date: '2026-04-18',
    eligibility: 'Mechanical / Automobile, CGPA >= 6.5',
    status: 'active',
    package: '6.2 LPA',
    intelligence: {
      requiredSkills: {
        technical: ['Drawing Reading', 'Machine Handling', 'Safety Protocols', 'Quality Control'],
        soft: ['Communication', 'Teamwork', 'Problem Solving']
      },
      pastHiringPatterns: 'Strong focus on practical troubleshooting and quality compliance in final rounds.',
      ratio: { technical: 70, soft: 30 },
      salaryBand: '₹1.8L - ₹2.4L',
      screeningProcess: 'Written test + Technical interview + HR',
      interviewQuestions: [
        { type: 'Technical', question: 'How do you read a simple machining drawing?', answer: 'I check title block, units, views, tolerances, and critical dimensions before planning operations.' },
        { type: 'Technical', question: 'How will you reduce shop-floor defects?', answer: 'I use Pareto, root-cause analysis, and control checks at high-risk process points.' },
        { type: 'Situational', question: 'Production target is high but quality is dropping. What will you do?', answer: 'Prioritize safety and critical quality checks, escalate with data, and optimize bottlenecks.' },
        { type: 'HR', question: 'Why this role?', answer: 'It aligns with my practical manufacturing skills and long-term growth in operations.' },
        { type: 'HR', question: 'How do you work in teams?', answer: 'I keep communication clear, share updates early, and support common targets.' }
      ]
    }
  },
  {
    id: 'bosch',
    domain: 'automation',
    company_name: 'Bosch',
    role: 'Graduate Trainee Engineer',
    date: '2026-04-28',
    eligibility: 'Mechanical / E&TC / Electrical, CGPA >= 7.0',
    status: 'active',
    package: '7.4 LPA',
    intelligence: {
      requiredSkills: {
        technical: ['PLC Basics', 'Sensors and Actuators', 'Computer Basics', 'Safety Protocols'],
        soft: ['Communication', 'Adaptability', 'Collaboration']
      },
      pastHiringPatterns: 'Prefers automation fundamentals with concise explanation and safe working practices.',
      ratio: { technical: 65, soft: 35 },
      salaryBand: '₹2.0L - ₹2.8L',
      screeningProcess: 'Online test + Group discussion + Technical interview',
      interviewQuestions: [
        { type: 'Technical', question: 'Difference between PLC and SCADA?', answer: 'PLC executes control logic, while SCADA supervises, visualizes, and logs operations.' },
        { type: 'Technical', question: 'How do sensors improve production reliability?', answer: 'They provide real-time input for control actions and prevent unsafe or off-spec operations.' },
        { type: 'Situational', question: 'How do you debug intermittent automation faults?', answer: 'Check alarms/logs, verify IO wiring and network, isolate module-level failure systematically.' },
        { type: 'HR', question: 'How do you learn new technical tools?', answer: 'By breaking concepts into modules and practicing quickly with small tasks.' },
        { type: 'HR', question: 'What is your biggest strength?', answer: 'Structured troubleshooting with clear communication under pressure.' }
      ]
    }
  },
  {
    id: 'bajaj-auto',
    domain: 'mechanical',
    company_name: 'Bajaj Auto',
    role: 'Production Graduate Engineer',
    date: '2026-05-06',
    eligibility: 'Mechanical / Automobile, CGPA >= 6.5',
    status: 'active',
    package: '6.8 LPA',
    intelligence: {
      requiredSkills: {
        technical: ['Machine Handling', 'Safety Protocols', 'Trade Practical Skills', 'Problem Solving'],
        soft: ['Discipline', 'Teamwork', 'Communication']
      },
      pastHiringPatterns: 'Checks on-ground readiness, process discipline, and basic quality tools usage.',
      ratio: { technical: 72, soft: 28 },
      salaryBand: '₹1.9L - ₹2.6L',
      screeningProcess: 'Written test + Direct interview',
      interviewQuestions: [
        { type: 'Technical', question: 'How do you ensure safe machine startup?', answer: 'Use pre-start checklist, verify guards, and confirm standard parameter settings.' },
        { type: 'Technical', question: 'How do you handle recurring quality defects?', answer: 'Contain, analyze causes, run corrective action, and monitor for recurrence.' },
        { type: 'Situational', question: 'If your line is delayed, what is your response?', answer: 'Identify bottleneck, re-sequence practical tasks, and communicate revised timeline.' },
        { type: 'HR', question: 'Why Bajaj Auto?', answer: 'Strong manufacturing ecosystem and opportunity to grow in production engineering.' },
        { type: 'HR', question: 'How do you stay disciplined?', answer: 'I follow standard work, track outcomes, and stay punctual for each handover.' }
      ]
    }
  },
  {
    id: 'siemens',
    domain: 'automation',
    company_name: 'Siemens Ltd.',
    role: 'Automation Engineer',
    date: '2026-05-10',
    eligibility: 'E&TC / Electrical / Instrumentation, CGPA >= 7.0',
    status: 'active',
    package: '9.0 LPA',
    intelligence: {
      requiredSkills: {
        technical: ['PLC Basics', 'Drawing Reading', 'Computer Basics', 'Problem Solving'],
        soft: ['Communication', 'Analytical Thinking', 'Adaptability']
      },
      pastHiringPatterns: 'Technical fundamentals first, then scenario-based problem-solving questions.',
      ratio: { technical: 75, soft: 25 },
      salaryBand: '₹2.2L - ₹3.0L',
      screeningProcess: 'Written test + Technical interview',
      interviewQuestions: [
        { type: 'Technical', question: 'How does PLC scan cycle impact output?', answer: 'Input read, logic execute, output update loop timing affects responsiveness and stability.' },
        { type: 'Technical', question: 'How do you read electrical drawings for troubleshooting?', answer: 'Trace power path and control logic from source to actuator using symbols and references.' },
        { type: 'Situational', question: 'Communication issue between modules: what next?', answer: 'Validate physical layer, protocol settings, and diagnostics before replacing hardware.' },
        { type: 'HR', question: 'Why automation?', answer: 'I enjoy combining electrical logic and process efficiency improvements.' },
        { type: 'HR', question: 'How do you approach unknown problems?', answer: 'Hypothesis, test small, verify data, and iterate with documentation.' }
      ]
    }
  },
  {
    id: 'lnt',
    domain: 'project',
    company_name: 'Larsen & Toubro (L&T)',
    role: 'Project Engineer Trainee',
    date: '2026-05-22',
    eligibility: 'Mechanical / Civil / Electrical, CGPA >= 7.0',
    status: 'upcoming',
    package: '8.2 LPA',
    intelligence: {
      requiredSkills: {
        technical: ['Drawing Reading', 'Computer Basics', 'Trade Practical Skills', 'Problem Solving'],
        soft: ['Leadership', 'Communication', 'Punctuality and Discipline']
      },
      pastHiringPatterns: 'Looks for project coordination ability and clear communication with execution discipline.',
      ratio: { technical: 60, soft: 40 },
      salaryBand: '₹2.1L - ₹2.9L',
      screeningProcess: 'Group discussion + Technical interview + HR',
      interviewQuestions: [
        { type: 'Technical', question: 'How do you plan work for a short deadline?', answer: 'Break tasks, estimate durations, mark dependencies, and protect critical path items first.' },
        { type: 'Technical', question: 'Why is documentation important in projects?', answer: 'It preserves decisions, supports coordination, and reduces execution ambiguity.' },
        { type: 'Situational', question: 'A vendor misses timeline. What do you do?', answer: 'Assess impact, activate alternate plan, and communicate revised schedule proactively.' },
        { type: 'HR', question: 'How do you manage stakeholders?', answer: 'Set clear expectations, update frequently, and maintain issue logs.' },
        { type: 'HR', question: 'Tell us about your responsibility style.', answer: 'I take ownership, report status transparently, and close tasks with quality checks.' }
      ]
    }
  }
];

const RESOURCE_LIBRARY = {
  video: [
    { title: 'YouTube: Mechanical Basics for ITI Interviews', url: 'https://www.youtube.com/watch?v=7N8f0kFJw4s', source: 'YouTube' },
    { title: 'YouTube: PLC Basics', url: 'https://www.youtube.com/watch?v=QwF9a56WFWA', source: 'YouTube' },
    { title: 'NPTEL: Soft Skills', url: 'https://nptel.ac.in/courses/109107121', source: 'NPTEL' }
  ],
  notes: [
    { title: 'NPTEL: Manufacturing Processes', url: 'https://nptel.ac.in/courses/112105126', source: 'NPTEL' },
    { title: 'Skill India Courses', url: 'https://www.skillindia.gov.in/courses', source: 'Skill India' },
    { title: 'Govt ITI Curriculum PDFs (NCVT)', url: 'https://www.ncvtmis.gov.in/Pages/ITI/Course.aspx', source: 'Govt ITI' }
  ],
  practice: [
    { title: 'Skill India Practical Modules', url: 'https://www.skillindia.gov.in/', source: 'Skill India' },
    { title: 'Govt ITI Trade Practice PDFs', url: 'https://www.ncvtmis.gov.in/Pages/ITI/Course.aspx', source: 'Govt ITI' },
    { title: 'YouTube: Interview Mock Practice', url: 'https://www.youtube.com/watch?v=Ji46s5BHdr0', source: 'YouTube' }
  ]
};

const TECH_RATE_MAP = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const normalize = (v) => String(v || '').toLowerCase().trim();

function getInitialRoadmaps() {
  try {
    const raw = localStorage.getItem('placementhub.roadmaps');
    return raw ? JSON.parse(raw) : [];
  } catch (_err) {
    return [];
  }
}

function getInitialCompanies() {
  try {
    const raw = localStorage.getItem('placementhub.companies');
    return raw ? JSON.parse(raw) : COMPANY_INTELLIGENCE;
  } catch (_err) {
    return COMPANY_INTELLIGENCE;
  }
}

function computeMode(totalDays) {
  if (totalDays <= 3) return { badge: '🔥 Crash Mode', key: 'crash' };
  if (totalDays <= 7) return { badge: '⚡ Intensive Mode', key: 'intensive' };
  if (totalDays <= 14) return { badge: '📘 Standard Mode', key: 'standard' };
  if (totalDays <= 30) return { badge: '🎯 Comprehensive Mode', key: 'comprehensive' };
  return { badge: '🚀 Advanced Mode', key: 'advanced' };
}

function tasksPerDay(hoursPerDay) {
  if (hoursPerDay <= 0.5) return [1, 2];
  if (hoursPerDay <= 1) return [2, 3];
  return [4, 5];
}

function translateIfNeeded(text, englishConfidence) {
  if (englishConfidence === 'Yes') return text;

  const dictionary = {
    'Revision': 'पुनरावृत्ती / Revision',
    'Mock Interview': 'मॉक मुलाखत / Mock Interview',
    'Safety Protocols': 'सुरक्षा नियम / Safety Protocols',
    'Drawing Reading': 'ड्रॉईंग वाचन / Drawing Reading',
    'Tool Practice': 'साधन सराव / Tool Practice',
    'Communication': 'संवाद कौशल्य / Communication',
    'Resume': 'रेझ्युमे / Resume',
    'Aptitude': 'अ‍ॅप्टिट्यूड / Aptitude'
  };

  const key = Object.keys(dictionary).find((k) => text.includes(k));
  return key ? text.replace(key, dictionary[key]) : text;
}

function pickResource(learningStyle, day, taskIndex) {
  const styleKey = learningStyle === 'Watch videos' ? 'video' : learningStyle === 'Read notes' ? 'notes' : 'practice';
  const pool = RESOURCE_LIBRARY[styleKey];
  return pool[(day + taskIndex) % pool.length];
}

function computeReadiness(assessment) {
  const techValues = Object.values(assessment.technicalRatings || {}).map((v) => TECH_RATE_MAP[v] || 1);
  const techAvg = techValues.length ? techValues.reduce((a, b) => a + b, 0) / techValues.length : 1;
  const techScore = (techAvg / 3) * 100;

  const softValues = Object.values(assessment.softRatings || {}).map((v) => Number(v) || 1);
  const softAvg = softValues.length ? softValues.reduce((a, b) => a + b, 0) / softValues.length : 1;
  const softScore = (softAvg / 5) * 100;

  let workScore = 40;
  if (assessment.hasInternship === 'Yes') workScore += 30;
  if (assessment.attendedInterviewBefore === 'Yes') workScore += 15;
  if (assessment.hasResume === 'Yes') workScore += 15;
  if (assessment.hasResume === 'Need help making one') workScore += 5;
  workScore = Math.min(100, workScore);

  const mcqScore = assessment.mcqTotal ? (assessment.mcqScore / assessment.mcqTotal) * 100 : 0;

  return Math.round(
    techScore * 0.4 +
    softScore * 0.2 +
    workScore * 0.15 +
    mcqScore * 0.25
  );
}

function buildDynamicDayPlans(company, assessment, skillGaps) {
  const warnings = [];
  const usingInterviewDate = assessment.roadmapDurationMode === 'interview-date';
  const interviewDateInvalid = usingInterviewDate && assessment.prepDaysRaw <= 0;
  const totalDays = interviewDateInvalid ? 1 : assessment.totalDays;
  if (interviewDateInvalid) {
    warnings.push('Interview date has passed. Showing 1-day crash prep plan.');
  }
  if (assessment.totalHours < 5) {
    warnings.push('Very limited prep time. Focusing only on must-know topics.');
  }

  const hoursPerDay = Number(assessment.hoursPerDay || 0.5);
  const [minTasks, maxTasks] = tasksPerDay(hoursPerDay);
  const mode = computeMode(totalDays);

  const domainFocus = company.intelligence.requiredSkills.technical;
  const focusPool = (skillGaps.length ? skillGaps : domainFocus).slice(0, 6);

  const revisionStart = Math.max(1, totalDays - Math.ceil(totalDays * 0.2) + 1);

  const dayPlans = [];
  for (let day = 1; day <= totalDays; day += 1) {
    const withinRevision = day >= revisionStart;
    const count = minTasks + ((day + totalDays) % (maxTasks - minTasks + 1));
    const tasks = [];

    for (let t = 0; t < count; t += 1) {
      let title;
      let type;

      if (withinRevision) {
        title = t % 2 === 0 ? 'Revision: key weak topics' : 'Mock Interview + HR answers';
        type = t % 2 === 0 ? 'technical' : 'soft';
      } else if (mode.key === 'crash') {
        title = `${focusPool[(day + t) % focusPool.length] || 'Critical Topic'} quick drill + MCQ`;
        type = 'technical';
      } else {
        const softBlock = mode.key !== 'crash' && t % 3 === 2;
        if (softBlock) {
          title = t % 2 === 0 ? 'Communication practice for interview' : 'Resume and self-introduction practice';
          type = 'soft';
        } else {
          title = `${focusPool[(day + t) % focusPool.length] || domainFocus[(day + t) % domainFocus.length]} practice`;
          type = 'technical';
        }
      }

      title = translateIfNeeded(title, assessment.englishInterview);

      tasks.push({
        id: `${day}-${t + 1}`,
        title,
        type,
        estimatedTime: hoursPerDay <= 0.5 ? '20-25 min' : hoursPerDay <= 1 ? '25-35 min' : '35-50 min',
        resource: pickResource(assessment.learningStyle, day, t),
        completed: false
      });
    }

    dayPlans.push({
      day,
      completed: false,
      tasks
    });
  }

  return {
    dayPlans,
    mode,
    warnings,
    totalDays,
    totalHours: Number((totalDays * hoursPerDay).toFixed(1))
  };
}

function flattenTasks(dayPlans) {
  return dayPlans.flatMap((d) => d.tasks.map((t) => ({ ...t, day: d.day }))); // for progress list
}

export function RoadmapProvider({ children }) {
  const [companies, setCompanies] = useState(getInitialCompanies);
  const [roadmaps, setRoadmaps] = useState(getInitialRoadmaps);

  useEffect(() => {
    localStorage.setItem('placementhub.roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  useEffect(() => {
    localStorage.setItem('placementhub.companies', JSON.stringify(companies));
  }, [companies]);

  const getCompanyQuiz = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    const domain = company?.domain || 'mechanical';
    return QUIZ_BANK[domain] || QUIZ_BANK.mechanical;
  };

  const generateRoadmapFromAssessment = (companyId, assessment) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return null;

    const readinessScore = computeReadiness(assessment);

    const skillGaps = company.intelligence.requiredSkills.technical.filter((skill) => {
      const test = normalize(skill);
      const toolText = normalize(assessment.toolsKnown || '');
      const tradeText = normalize(assessment.tradeSkill || assessment.trade || '');
      return !(toolText.includes(test.split(' ')[0]) || tradeText.includes(test.split(' ')[0]));
    });

    const strengths = company.intelligence.requiredSkills.technical.filter((s) => !skillGaps.includes(s));
    const { dayPlans, mode, warnings, totalDays, totalHours } = buildDynamicDayPlans(company, assessment, skillGaps);

    const now = new Date();
    const interviewDate = new Date(assessment.interviewDate);
    interviewDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const daysRemaining = Math.max(0, Math.floor((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const roadmap = {
      id: `${company.id}-${Date.now()}`,
      companyId: company.id,
      company_name: company.company_name,
      role: company.role,
      generatedAt: new Date().toISOString(),
      assessment,
      readinessScore,
      strengths,
      skillGaps,
      intelligence: company.intelligence,
      modeBadge: mode.badge,
      totalDays,
      hoursPerDay: assessment.hoursPerDay,
      totalHours,
      daysRemaining,
      warnings,
      dayPlans,
      plan: flattenTasks(dayPlans),
      interviewQuestions: company.intelligence.interviewQuestions
    };

    setRoadmaps((prev) => [roadmap, ...prev]);
    return roadmap;
  };

  const toggleRoadmapDayCompletion = (roadmapId, day) => {
    setRoadmaps((prev) =>
      prev.map((roadmap) => {
        if (roadmap.id !== roadmapId) return roadmap;

        const dayPlans = roadmap.dayPlans.map((d) => {
          if (d.day !== day) return d;
          const nextCompleted = !d.completed;
          return {
            ...d,
            completed: nextCompleted,
            tasks: d.tasks.map((task) => ({ ...task, completed: nextCompleted }))
          };
        });

        return {
          ...roadmap,
          dayPlans,
          plan: flattenTasks(dayPlans)
        };
      })
    );
  };

  const addCompanyAnnouncement = (companyInput) => {
    const idBase = normalize(companyInput.company_name).replace(/[^a-z0-9]+/g, '-');
    const roleText = normalize(companyInput.role);
    const domain = roleText.includes('automation') || roleText.includes('electrical') ? 'automation' : roleText.includes('project') ? 'project' : 'mechanical';

    const company = {
      id: `${idBase || 'company'}-${Date.now()}`,
      domain,
      company_name: companyInput.company_name,
      role: companyInput.role,
      date: companyInput.date,
      eligibility: companyInput.eligibility,
      status: companyInput.status || 'active',
      package: companyInput.package || 'Not Disclosed',
      jdFileName: companyInput.jdFileName || '',
      jdFileType: companyInput.jdFileType || '',
      jdFileSize: companyInput.jdFileSize || 0,
      jdDataUrl: companyInput.jdDataUrl || '',
      intelligence: {
        requiredSkills: {
          technical: domain === 'automation'
            ? ['PLC Basics', 'Computer Basics', 'Safety Protocols', 'Problem Solving']
            : domain === 'project'
              ? ['Drawing Reading', 'Computer Basics', 'Trade Practical Skills', 'Problem Solving']
              : ['Drawing Reading', 'Machine Handling', 'Safety Protocols', 'Trade Practical Skills'],
          soft: ['Communication', 'Teamwork', 'Problem Solving']
        },
        pastHiringPatterns: 'Practical interview focus with trade fundamentals and confidence checks.',
        ratio: { technical: 68, soft: 32 },
        salaryBand: '₹1.8L - ₹2.5L',
        screeningProcess: 'Written test + Interview',
        interviewQuestions: [
          { type: 'Technical', question: `What core skills are required for ${companyInput.role}?`, answer: 'Focus on trade fundamentals, safe practices, and practical examples from training.' },
          { type: 'Technical', question: 'How do you approach a practical technical task?', answer: 'Understand requirement, prepare tools, follow process steps, and verify output quality.' },
          { type: 'Situational', question: 'How do you handle time pressure in practical rounds?', answer: 'Prioritize critical steps and communicate status while maintaining safety.' },
          { type: 'HR', question: 'Why are you suitable for this role?', answer: 'My skill base and disciplined preparation align with this role requirements.' },
          { type: 'HR', question: 'How do you keep improving?', answer: 'Daily practice, review weak topics, and seek feedback after mock interviews.' }
        ]
      }
    };

    setCompanies((prev) => [company, ...prev]);
    return company;
  };

  const dashboardStats = useMemo(() => {
    const activeRoadmap = roadmaps.length;
    const allDays = roadmaps.flatMap((r) => r.dayPlans || []);
    const completedDays = allDays.filter((d) => d.completed).length;
    const progressPercentage = allDays.length ? Math.round((completedDays / allDays.length) * 100) : 0;
    const readinessScore = roadmaps.length
      ? Math.round(roadmaps.reduce((sum, r) => sum + (r.readinessScore || 0), 0) / roadmaps.length)
      : 0;

    return {
      readiness_score: readinessScore,
      active_roadmap: activeRoadmap,
      progress_percentage: progressPercentage
    };
  }, [roadmaps]);

  return (
    <RoadmapContext.Provider
      value={{
        companies,
        roadmaps,
        dashboardStats,
        getCompanyQuiz,
        generateRoadmapFromAssessment,
        toggleRoadmapDayCompletion,
        addCompanyAnnouncement
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
}

export function useRoadmaps() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmaps must be used inside RoadmapProvider');
  }
  return context;
}
