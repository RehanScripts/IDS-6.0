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

const DOMAIN_PROFILES = {
  mechanical: {
    requiredSkills: {
      technical: ['Drawing Reading', 'Machine Handling', 'Safety Protocols', 'Quality Control'],
      soft: ['Communication', 'Teamwork', 'Problem Solving']
    },
    ratio: { technical: 72, soft: 28 },
    salaryBand: 'Rs 1.8L - Rs 2.6L',
    screeningProcess: 'Written test + Technical interview + HR',
    pastHiringPatterns: 'Strong focus on practical troubleshooting, safe operation, and quality compliance.'
  },
  automation: {
    requiredSkills: {
      technical: ['PLC Basics', 'Sensors and Actuators', 'Electrical Troubleshooting', 'Computer Basics'],
      soft: ['Communication', 'Adaptability', 'Collaboration']
    },
    ratio: { technical: 68, soft: 32 },
    salaryBand: 'Rs 2.0L - Rs 2.9L',
    screeningProcess: 'Online test + Technical interview + HR',
    pastHiringPatterns: 'Prefers automation fundamentals with structured problem solving and safe practices.'
  },
  project: {
    requiredSkills: {
      technical: ['Project Scheduling', 'Drawing Reading', 'Documentation', 'Problem Solving'],
      soft: ['Leadership', 'Communication', 'Stakeholder Management']
    },
    ratio: { technical: 60, soft: 40 },
    salaryBand: 'Rs 2.1L - Rs 3.0L',
    screeningProcess: 'Aptitude + Group discussion + Technical interview + HR',
    pastHiringPatterns: 'Looks for ownership, communication clarity, and on-ground execution discipline.'
  }
};

function buildIntelligence(domain, companyName, role) {
  const profile = DOMAIN_PROFILES[domain] || DOMAIN_PROFILES.mechanical;
  return {
    requiredSkills: profile.requiredSkills,
    pastHiringPatterns: profile.pastHiringPatterns,
    ratio: profile.ratio,
    salaryBand: profile.salaryBand,
    screeningProcess: profile.screeningProcess,
    interviewQuestions: [
      {
        type: 'Technical',
        question: `Which technical fundamentals matter most for the ${role} role?`,
        answer: 'I focus on core trade knowledge, process basics, and practical application with safety compliance.'
      },
      {
        type: 'Technical',
        question: 'How do you approach a real production or operations problem?',
        answer: 'I define the issue, gather data, identify root cause, apply corrective action, and verify outcomes.'
      },
      {
        type: 'Situational',
        question: 'What will you do when a deadline is tight and quality is at risk?',
        answer: 'Prioritize critical checks, communicate constraints early, and maintain safety and quality gates.'
      },
      {
        type: 'HR',
        question: `Why do you want to join ${companyName}?`,
        answer: 'The role aligns with my preparation and gives the right environment to grow through practical learning.'
      },
      {
        type: 'HR',
        question: 'How do you prepare consistently for interviews and assignments?',
        answer: 'I follow a structured daily plan, track weak areas, and improve with focused revisions and mock practice.'
      }
    ]
  };
}

function buildShortJD(config) {
  return `Position: ${config.role}\n\nCompany: ${config.company_name}\n\nEligibility: ${config.eligibility}\n\nKey Responsibilities:\n- Execute assigned domain tasks with process discipline and quality focus.\n- Collaborate with cross-functional teams to meet project or production targets.\n- Follow safety, compliance, and reporting standards during operations.\n\nPreferred Skills:\n- Fundamentals relevant to ${config.role}.\n- Problem solving and communication skills.\n- Willingness to learn and adapt to plant or project workflows.`;
}

function createCompany(config) {
  return {
    ...config,
    shortJD: buildShortJD(config),
    intelligence: buildIntelligence(config.domain, config.company_name, config.role)
  };
}

const COMPANY_INTELLIGENCE = [
  createCompany({
    id: 'hal-ozar',
    domain: 'mechanical',
    industry: 'Automotive',
    company_name: 'Hindustan Aeronautics Limited (HAL)',
    role: 'Management Trainee - Aerospace Manufacturing',
    date: '2026-04-25',
    eligibility: 'Mechanical / Aerospace, CGPA >= 7.0',
    status: 'active',
    package: '8.5 LPA'
  }),
  createCompany({
    id: 'mahindra-nashik',
    domain: 'mechanical',
    industry: 'Automotive',
    company_name: 'Mahindra & Mahindra Ltd.',
    role: 'Graduate Engineer Trainee (Mechanical)',
    date: '2026-04-18',
    eligibility: 'Mechanical / Automobile, CGPA >= 6.5',
    status: 'active',
    package: '6.2 LPA'
  }),
  createCompany({
    id: 'jindal-saw',
    domain: 'mechanical',
    industry: 'Engineering',
    company_name: 'Jindal SAW Ltd.',
    role: 'Production Engineer - SAW Pipes',
    date: '2026-05-15',
    eligibility: 'Mechanical / Metallurgy, CGPA >= 6.5',
    status: 'active',
    package: '5.8 LPA'
  }),
  createCompany({
    id: 'pfizer',
    domain: 'project',
    industry: 'Pharma',
    company_name: 'Pfizer Ltd.',
    role: 'Quality Analyst - Pharma Operations',
    date: '2026-06-25',
    eligibility: 'Chemical / Pharmaceutical, CGPA >= 7.0',
    status: 'upcoming',
    package: '7.5 LPA'
  }),
  createCompany({
    id: 'siemens',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'Siemens Ltd.',
    role: 'Automation Engineer',
    date: '2026-05-10',
    eligibility: 'E&TC / Electrical / Instrumentation, CGPA >= 7.0',
    status: 'active',
    package: '9.0 LPA'
  }),
  createCompany({
    id: 'bosch',
    domain: 'automation',
    industry: 'Automotive',
    company_name: 'Bosch Ltd.',
    role: 'R&D Engineer - Automotive Systems',
    date: '2026-05-12',
    eligibility: 'Mechanical / E&TC, CGPA >= 7.5',
    status: 'active',
    package: '10.2 LPA'
  }),
  createCompany({
    id: 'abb',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'ABB Ltd.',
    role: 'Electrical Design Engineer',
    date: '2026-05-02',
    eligibility: 'Electrical / Electronics, CGPA >= 7.0',
    status: 'active',
    package: '7.8 LPA'
  }),
  createCompany({
    id: 'samsonite-gonde',
    domain: 'mechanical',
    industry: 'Engineering',
    company_name: 'Samsonite South Asia Pvt Ltd',
    role: 'Industrial Engineer - Manufacturing',
    date: '2026-05-20',
    eligibility: 'Mechanical / Production, CGPA >= 6.0',
    status: 'active',
    package: '5.0 LPA'
  }),
  createCompany({
    id: 'crompton-greaves',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'Crompton Greaves Consumer Electricals',
    role: 'Electrical Engineer',
    date: '2026-05-22',
    eligibility: 'Electrical / Electronics, CGPA >= 6.5',
    status: 'active',
    package: '6.5 LPA'
  }),
  createCompany({
    id: 'ashoka-buildcon',
    domain: 'project',
    industry: 'Infrastructure',
    company_name: 'Ashoka Buildcon Ltd.',
    role: 'Site Engineer - Infrastructure Projects',
    date: '2026-05-28',
    eligibility: 'Civil / Mechanical, CGPA >= 6.0',
    status: 'active',
    package: '5.5 LPA'
  }),
  createCompany({
    id: 'msrtc-workshop',
    domain: 'mechanical',
    industry: 'Automotive',
    company_name: 'MSRTC - Regional Workshop, Nashik',
    role: 'Workshop Engineer',
    date: '2026-06-12',
    eligibility: 'Mechanical / Automobile, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.2 LPA'
  }),
  createCompany({
    id: 'metalgenesis',
    domain: 'mechanical',
    industry: 'Engineering',
    company_name: 'Metalgenesis Industries Pvt. Ltd.',
    role: 'CNC Programmer / Machinist',
    date: '2026-06-14',
    eligibility: 'Mechanical / Production, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.0 LPA'
  }),
  createCompany({
    id: 'ring-plus-aqua',
    domain: 'mechanical',
    industry: 'Automotive',
    company_name: 'Ring Plus Aqua Ltd.',
    role: 'Design Engineer - Automotive Components',
    date: '2026-06-05',
    eligibility: 'Mechanical / Civil, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.5 LPA'
  }),
  createCompany({
    id: 'kupfertech',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'Kupfertech Corporation',
    role: 'Electrical Systems Engineer',
    date: '2026-06-18',
    eligibility: 'Electrical / E&TC, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.5 LPA'
  }),
  createCompany({
    id: 'ambar-forge-2',
    domain: 'mechanical',
    industry: 'Engineering',
    company_name: 'Ambar Forge Plant 2',
    role: 'Forging Process Engineer',
    date: '2026-06-20',
    eligibility: 'Mechanical / Metallurgy, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.8 LPA'
  }),
  createCompany({
    id: 'efacec-india',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'Efacec India Pvt. Ltd.',
    role: 'Transformers Design Engineer',
    date: '2026-06-22',
    eligibility: 'Electrical / Electronics, CGPA >= 6.5',
    status: 'upcoming',
    package: '5.5 LPA'
  }),
  createCompany({
    id: 'cipla',
    domain: 'project',
    industry: 'Pharma',
    company_name: 'Cipla Ltd.',
    role: 'Production Executive - Pharma Manufacturing',
    date: '2026-06-28',
    eligibility: 'Chemical / Pharmaceutical, CGPA >= 7.0',
    status: 'upcoming',
    package: '6.8 LPA'
  }),
  createCompany({
    id: 'sahyadri-farms',
    domain: 'project',
    industry: 'Pharma',
    company_name: 'Sahyadri Farms',
    role: 'Agri-Processing Engineer',
    date: '2026-07-01',
    eligibility: 'Mechanical / Agricultural, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.2 LPA'
  }),
  createCompany({
    id: 'sagar-industries-distilleries',
    domain: 'project',
    industry: 'Engineering',
    company_name: 'Sagar Industries & Distilleries Ltd.',
    role: 'Plant Operations Engineer',
    date: '2026-07-05',
    eligibility: 'Mechanical / Chemical, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.5 LPA'
  }),
  createCompany({
    id: 'capgemini',
    domain: 'automation',
    industry: 'IT',
    company_name: 'Capgemini',
    role: 'Associate Consultant - Technology',
    date: '2026-04-20',
    eligibility: 'CS / IT / E&TC, CGPA >= 6.5',
    status: 'active',
    package: '7.5 LPA'
  }),
  createCompany({
    id: 'infosys',
    domain: 'automation',
    industry: 'IT',
    company_name: 'Infosys',
    role: 'Systems Engineer',
    date: '2026-04-22',
    eligibility: 'All branches, CGPA >= 6.0',
    status: 'active',
    package: '6.5 LPA'
  }),
  createCompany({
    id: 'dreamsoft-it-solutions',
    domain: 'automation',
    industry: 'IT',
    company_name: 'DreamSoft IT Solutions Pvt. Ltd.',
    role: 'Junior Software Developer',
    date: '2026-07-08',
    eligibility: 'CS / IT, CGPA >= 6.0',
    status: 'upcoming',
    package: '4.0 LPA'
  }),
  createCompany({
    id: 'finiq-consulting',
    domain: 'automation',
    industry: 'IT',
    company_name: 'Finiq Consulting India Pvt Ltd',
    role: 'Business Analyst',
    date: '2026-07-10',
    eligibility: 'CS / IT / MBA, CGPA >= 6.5',
    status: 'upcoming',
    package: '5.0 LPA'
  })
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
    if (!raw) return COMPANY_INTELLIGENCE;

    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return COMPANY_INTELLIGENCE;

    const savedById = new Map(saved.map((company) => [company.id, company]));
    const merged = COMPANY_INTELLIGENCE.map((company) => {
      const savedCompany = savedById.get(company.id);
      return savedCompany ? { ...company, ...savedCompany } : company;
    });

    const extraCustomCompanies = saved.filter((company) => !merged.some((base) => base.id === company.id));
    return [...merged, ...extraCustomCompanies];
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
      shortJD: companyInput.shortJD || buildShortJD({
        role: companyInput.role,
        company_name: companyInput.company_name,
        eligibility: companyInput.eligibility
      }),
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

  const removeCompanyAnnouncement = (companyId) => {
    if (!companyId) return;
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
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
        addCompanyAnnouncement,
        removeCompanyAnnouncement
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
