import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

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

const COMPANY_QUIZ_OVERRIDES = {
  'neilsoft-get-civil': [
    {
      question: 'In precast workflow, what is the most critical first check before element production?',
      options: ['Paint shade selection', 'Drawing and bar bending schedule validation', 'Invoice approval', 'Site photography'],
      correctIndex: 1
    },
    {
      question: 'For rebar detailing, which output is used directly by fabrication teams?',
      options: ['Mood board', 'Bar Bending Schedule (BBS)', 'Site attendance sheet', 'Material invoice'],
      correctIndex: 1
    },
    {
      question: 'Which AutoCAD practice reduces errors in civil drafting?',
      options: ['Drawing without layers', 'Using proper layers, scale, and annotation standards', 'Avoiding dimensions', 'Exploding all blocks'],
      correctIndex: 1
    },
    {
      question: 'In engineering drawings, sectional views are mainly used to:',
      options: ['Decorate layout', 'Show internal construction details clearly', 'Reduce file size only', 'Avoid dimensions'],
      correctIndex: 1
    },
    {
      question: 'In Excel for engineering reporting, which feature helps summarize large datasets quickly?',
      options: ['WordArt', 'Pivot Table', 'Theme color', 'Spell check only'],
      correctIndex: 1
    }
  ],
  'aarti-pharmalabs-get': [
    {
      question: 'Which concept is most essential before scaling pharma unit operations?',
      options: ['Office automation macros', 'Mass and energy balance closure', 'Only vendor manuals', 'Marketing analytics'],
      correctIndex: 1
    },
    {
      question: 'In process role screening, PFD and P&ID are mainly used for:',
      options: ['Payroll planning', 'Process understanding and control loop interpretation', 'Website hosting', 'Sales forecasting'],
      correctIndex: 1
    },
    {
      question: 'For GET electrical role, which area is directly relevant?',
      options: ['Relay and protection fundamentals', 'Only web UI testing', 'Chemical assay only', 'Packaging graphics'],
      correctIndex: 0
    },
    {
      question: 'A strong instrumentation baseline includes:',
      options: ['Control philosophy and final control elements', 'HR policy drafting', 'Cloud billing APIs', 'CNC tooling only'],
      correctIndex: 0
    },
    {
      question: 'Best first response to hazardous process deviation is:',
      options: ['Ignore and continue batch', 'Apply process safety protocol and isolate risk', 'Change schedule only', 'Skip documentation'],
      correctIndex: 1
    }
  ],
  'esds-windows-admin': [
    {
      question: 'Which Windows Server role is commonly used for centralized user authentication?',
      options: ['WSUS', 'AD DS', 'IIS', 'Hyper-V'],
      correctIndex: 1
    },
    {
      question: 'If website by IP works but hostname fails, likely issue is:',
      options: ['SMTP config', 'DNS resolution', 'CPU thermal limit', 'IIS app pool'],
      correctIndex: 1
    },
    {
      question: 'Before patching a production Windows server, best first step is:',
      options: ['Direct reboot', 'Snapshot/backup and rollback plan', 'Disable logs', 'Turn off firewall'],
      correctIndex: 1
    },
    {
      question: 'Which utility helps inspect adapter and DNS details on Windows?',
      options: ['diskpart', 'ipconfig /all', 'chkdsk /f', 'sfc /verifyonly'],
      correctIndex: 1
    },
    {
      question: 'What should be checked first when repeated updates fail in enterprise setup?',
      options: ['Wallpaper policy', 'WSUS connectivity and update services', 'Mouse driver', 'Browser cache'],
      correctIndex: 1
    }
  ],
  klingelnberg: [
    {
      question: 'In JavaScript, what is the output type of Promise.all([...])?',
      options: ['Array', 'Promise', 'Object', 'String'],
      correctIndex: 1
    },
    {
      question: 'Which SQL clause is best to limit returned records?',
      options: ['FILTER', 'TOP', 'LIMIT', 'ORDER'],
      correctIndex: 2
    },
    {
      question: 'What does REST recommend for updating an existing resource fully?',
      options: ['GET', 'POST', 'PUT', 'PATCH'],
      correctIndex: 2
    },
    {
      question: 'Which data structure gives O(1) average lookup by key?',
      options: ['Array', 'Linked List', 'Hash Map', 'Stack'],
      correctIndex: 2
    },
    {
      question: 'Most effective first step when a production API latency spikes?',
      options: ['Restart everything', 'Check logs/metrics and isolate bottleneck', 'Rewrite endpoint', 'Disable auth'],
      correctIndex: 1
    }
  ],
  seiton: [
    {
      question: 'What is the primary use of Git branching?',
      options: ['Store binaries', 'Parallel feature development', 'Run tests', 'Deploy to prod'],
      correctIndex: 1
    },
    {
      question: 'Which HTTP status indicates resource was created successfully?',
      options: ['200', '201', '204', '301'],
      correctIndex: 1
    },
    {
      question: 'In OOP, encapsulation means:',
      options: ['Repeating methods', 'Combining data and behavior with access control', 'Only using inheritance', 'Avoiding classes'],
      correctIndex: 1
    },
    {
      question: 'Which is a good practice for secure password storage?',
      options: ['Plain text', 'Base64', 'Hashed with salt', 'Encrypted in frontend only'],
      correctIndex: 2
    },
    {
      question: 'When a bug is not reproducible locally, what should you do first?',
      options: ['Close issue', 'Collect environment details and logs', 'Force deploy', 'Change framework'],
      correctIndex: 1
    }
  ]
};

const COMPANY_PREP_PROFILES = {
  'neilsoft-get-civil': {
    focus: [
      'Precast Detailing Fundamentals',
      'Rebar Detailing and BBS',
      'Engineering Drawing Interpretation',
      'AutoCAD for Civil Engineering',
      'Tekla Modelling Basics',
      'QA Checks for Drawings and Detailing',
      'Quantity and Coordination Basics',
      'Excel for Engineering Documentation'
    ],
    soft: ['Structured communication', 'Detail orientation', 'Deadline discipline']
  },
  'aarti-pharmalabs-get': {
    focus: [
      'Unit Operations in Chemical Engineering',
      'Heat and Mass Transfer',
      'Mass and Energy Balance',
      'Chemical Reaction Engineering Fundamentals',
      'PFD and P&ID Interpretation',
      'Process Optimization and Pipe Sizing',
      'Chemical Manufacturing Safety',
      'Electrical Fundamentals for Plant Operations',
      'Instrumentation Basics and Control Philosophy'
    ],
    soft: ['Analytical problem-solving', 'Technical communication', 'Presentation clarity']
  },
  'esds-windows-admin': {
    focus: [
      'Windows Server Administration',
      'Active Directory and Group Policy',
      'Networking Protocols and DNS',
      'IIS and Web Hosting Basics',
      'OS and Hardware Troubleshooting',
      'Virtualization and Hyper-V'
    ],
    soft: ['SOP writing', 'Problem-solving communication', 'Workplace communication and escalation']
  },
  klingelnberg: {
    focus: ['Data Structures', 'JavaScript/TypeScript', 'REST API Design', 'SQL Querying', 'Debugging and Logging', 'System Basics'],
    soft: ['Stakeholder communication', 'Requirement clarification', 'Incident response updates']
  },
  seiton: {
    focus: ['OOP Fundamentals', 'Git Workflow', 'Backend API Basics', 'Testing Fundamentals', 'Database CRUD', 'Code Review Readiness'],
    soft: ['Daily status communication', 'Team collaboration', 'Interview self-introduction']
  }
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
    intelligence: config.intelligence || buildIntelligence(config.domain, config.company_name, config.role)
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
    id: 'klingelnberg',
    domain: 'automation',
    industry: 'Engineering',
    company_name: 'Klingelnberg India Pvt. Ltd.',
    role: 'Junior Software Engineer',
    date: '2026-07-12',
    eligibility: 'CS / IT / E&TC, CGPA >= 6.5',
    status: 'upcoming',
    package: '6.2 LPA',
    jdDataUrl: '/jd/klingelnberg-jd-junior-software-engineer.pdf',
    intelligence: {
      requiredSkills: {
        technical: ['JavaScript/TypeScript', 'REST APIs', 'SQL', 'Data Structures', 'Debugging'],
        soft: ['Communication', 'Problem Solving', 'Team Collaboration']
      },
      pastHiringPatterns: 'Rounds typically assess coding fundamentals, API/backend understanding, and practical debugging approach.',
      ratio: { technical: 75, soft: 25 },
      salaryBand: 'Rs 4.8L - Rs 6.5L',
      screeningProcess: 'Online assessment + Technical interview + HR',
      interviewQuestions: [
        { type: 'Technical', question: 'How would you optimize a slow API endpoint?', answer: 'Profile DB calls, add indexes, reduce payload, cache where suitable, and monitor latency improvements.' },
        { type: 'Technical', question: 'Explain when to use async/await over callbacks.', answer: 'Async/await improves readability for sequential async flows with structured error handling.' },
        { type: 'Situational', question: 'Production bug before deadline. What is your process?', answer: 'Reproduce quickly, isolate root cause, patch safely, add tests, and communicate timeline transparently.' },
        { type: 'HR', question: 'Why Klingelnberg?', answer: 'The role offers strong engineering exposure and practical software problem-solving in a high-impact domain.' },
        { type: 'HR', question: 'How do you prepare for a new codebase?', answer: 'I read architecture docs, run locally, trace key flows, and contribute small, reviewed changes first.' }
      ]
    }
  }),
  createCompany({
    id: 'seiton',
    domain: 'automation',
    industry: 'IT',
    company_name: 'Seiton Technologies Pvt. Ltd.',
    role: 'Trainee Engineer (Software)',
    date: '2026-07-16',
    eligibility: 'CS / IT / E&TC, CGPA >= 6.0',
    status: 'upcoming',
    package: '5.4 LPA',
    jdDataUrl: '/jd/seiton-jd-2511jdte-job-description.pdf',
    intelligence: {
      requiredSkills: {
        technical: ['Core Java/Python', 'OOP', 'Git', 'API Integration', 'Basic Testing'],
        soft: ['Communication', 'Ownership', 'Learning Agility']
      },
      pastHiringPatterns: 'Focuses on practical coding basics, version control habits, and clear communication during problem solving.',
      ratio: { technical: 70, soft: 30 },
      salaryBand: 'Rs 4.2L - Rs 5.8L',
      screeningProcess: 'Aptitude + Technical interview + Managerial round',
      interviewQuestions: [
        { type: 'Technical', question: 'How does inheritance help in software design?', answer: 'It enables reusable base behavior while allowing specialized child classes with clear abstraction.' },
        { type: 'Technical', question: 'What is your approach to unit testing?', answer: 'Test core logic paths, edge cases, and expected failures with small independent tests.' },
        { type: 'Situational', question: 'Teammate submits buggy code before release. What do you do?', answer: 'Review with evidence, pair to fix critical issues, retest impacted modules, and support timely release.' },
        { type: 'HR', question: 'Why Seiton?', answer: 'It provides the right trainee environment to build strong engineering fundamentals and delivery discipline.' },
        { type: 'HR', question: 'How do you learn under pressure?', answer: 'I break tasks into short milestones, learn quickly from docs/examples, and validate incrementally.' }
      ]
    }
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
  }),
  createCompany({
    id: 'esds-windows-admin',
    domain: 'automation',
    industry: 'IT',
    company_name: 'ESDS',
    role: 'Windows Server Administrator',
    date: '2026-07-20',
    eligibility: 'BCA / BSc IT / CS / E&TC / Any graduate with infra fundamentals, CGPA >= 6.0',
    status: 'upcoming',
    package: '5.5 LPA',
    coverImage: '/images/esds-cover.png',
    intelligence: {
      requiredSkills: {
        technical: ['Windows Server Administration', 'Active Directory', 'DNS / SMTP / POP3 / IMAP', 'IIS Server', 'WSUS and Antivirus', 'Virtualization and Hyper-V', 'OS and Hardware Troubleshooting', 'MySQL Basics'],
        soft: ['SOP writing', 'Problem-solving communication', 'Workplace communication']
      },
      pastHiringPatterns: 'Hands-on troubleshooting and production support thinking are prioritized over theory-heavy answers.',
      ratio: { technical: 78, soft: 22 },
      salaryBand: 'Rs 4.5L - Rs 6.5L',
      screeningProcess: 'Technical screen + practical troubleshooting round + HR',
      interviewQuestions: [
        { type: 'Technical', question: 'How do you diagnose DNS resolution failure for internal users?', answer: 'Validate client DNS settings, run nslookup tests, inspect DNS zones/forwarders, and verify service/network dependencies.' },
        { type: 'Technical', question: 'How would you use Group Policy in a mid-size organization?', answer: 'Apply baseline security and operational policies through scoped OUs with testing before broad rollout.' },
        { type: 'Situational', question: 'A production server suddenly slows down. What is your first response?', answer: 'Collect evidence from event logs/performance counters, isolate likely causes, and apply low-risk corrective actions with rollback readiness.' },
        { type: 'HR', question: 'Why do you want to join ESDS as a Windows Server Administrator?', answer: 'The role matches my infrastructure skill path and offers real production exposure where I can contribute and grow quickly.' },
        { type: 'HR', question: 'How do you document post-incident fixes?', answer: 'I prepare SOP-style notes with symptoms, root cause, exact fix steps, validation checks, and preventive controls.' }
      ]
    }
  }),
  createCompany({
    id: 'neilsoft-get-civil',
    domain: 'project',
    industry: 'Engineering',
    company_name: 'Neilsoft Ltd.',
    role: 'Graduate Engineer Trainee (GET) - Civil (Precast & Rebar)',
    date: '2026-08-01',
    eligibility: 'BE/B.Tech Civil (2025 pass-out), minimum 55% in SSC/HSC/Diploma/Degree, no backlogs, no education gaps',
    status: 'upcoming',
    package: '3.0 LPA',
    coverImage: '/images/neil.png',
    intelligence: {
      requiredSkills: {
        technical: [
          'Precast Detailing',
          'Rebar Detailing and BBS',
          'Engineering Drawing Reading',
          'AutoCAD for Civil',
          'Tekla Basic Modelling',
          'MS Office and Excel Fundamentals'
        ],
        soft: ['Technical communication', 'Accuracy and documentation', 'Team coordination']
      },
      pastHiringPatterns: 'Selection emphasizes practical detailing fundamentals, drawing interpretation accuracy, and readiness to join immediately.',
      ratio: { technical: 78, soft: 22 },
      salaryBand: 'Rs 3.0 LPA',
      screeningProcess: 'Online Test -> F2F Interview',
      interviewQuestions: [
        { type: 'Technical', question: 'How do you verify precast drawing readiness before release?', answer: 'I check dimensions, reinforcement callouts, section consistency, and coordination notes against standards before issue.' },
        { type: 'Technical', question: 'What is your approach for accurate rebar quantity extraction?', answer: 'I validate bar marks, spacing, bends and lap rules, then cross-check the BBS against drawing sheets.' },
        { type: 'Situational', question: 'You find a drawing mismatch near deadline. What do you do?', answer: 'I escalate with clear marked evidence, suggest corrected detail, and close the loop after approval to avoid site/fabrication errors.' },
        { type: 'HR', question: 'Why do you want to join Neilsoft?', answer: 'Neilsoft offers strong engineering services exposure where I can apply civil fundamentals in precast and rebar projects from day one.' },
        { type: 'HR', question: 'Are you ready for immediate joining and agreement terms?', answer: 'Yes, I am ready to join immediately and I understand the 2-year training agreement requirement.' }
      ]
    }
  }),
  createCompany({
    id: 'aarti-pharmalabs-get',
    domain: 'project',
    industry: 'Pharma',
    company_name: 'Aarti Pharmalabs',
    role: 'Graduate Engineer Trainee (Production / Process / Electrical / Instrumentation)',
    date: '2026-07-25',
    eligibility: 'Engineering graduates with minimum CGPA 6.0 - 6.5',
    status: 'upcoming',
    package: 'Rs 3.0 LPA stipend (Year 1), Rs 4.0 LPA post-confirmation',
    coverImage: '/images/aarti-pharmalabs-cover.png',
    intelligence: {
      requiredSkills: {
        technical: [
          'Unit Operations',
          'Heat and Mass Transfer',
          'Mass and Energy Balance',
          'Reaction Engineering',
          'PFD and P&ID Reading',
          'Process Optimization',
          'Pipe Sizing',
          'Plant Electrical Fundamentals',
          'Instrumentation and Control Basics',
          'Process Safety'
        ],
        soft: ['Analytical problem-solving', 'Communication', 'Presentation']
      },
      pastHiringPatterns: 'Screens for fundamentals depth, process safety mindset, and practical plant troubleshooting approach.',
      ratio: { technical: 76, soft: 24 },
      salaryBand: 'Rs 3.0 LPA training stipend -> Rs 4.0 LPA post-confirmation',
      screeningProcess: 'Technical screening + role-aligned interview + HR; 1-year GET program with post-confirmation bond',
      interviewQuestions: [
        { type: 'Technical', question: 'How do mass and energy balances improve production/process decisions?', answer: 'They quantify losses, support bottleneck diagnosis, and validate process stability before scale-up.' },
        { type: 'Technical', question: 'How do you use P&ID during troubleshooting?', answer: 'I trace process paths, control loops, and safety interlocks to isolate probable failure points safely.' },
        { type: 'Situational', question: 'A hazardous chemical handling deviation occurs in a shift. What do you do first?', answer: 'Follow plant safety SOP, isolate risk source, communicate escalation quickly, and document corrective action.' },
        { type: 'HR', question: 'Why Aarti Pharmalabs GET program?', answer: 'It provides structured technical exposure across critical plant disciplines with a clear growth pathway.' },
        { type: 'HR', question: 'How will you improve in the first training year?', answer: 'I will track daily learning against role topics, practice calculations/diagram reading, and review feedback weekly.' }
      ]
    }
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

const ESDS_RESOURCE_LIBRARY = {
  video: [
    { title: 'Windows Server 16 Course Part 1', url: 'https://youtu.be/MP1wXs1muws?si=qAIQ98lxroxgGRxU', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 2', url: 'https://youtu.be/OP-rPidxZX8?si=9ivo-YoieibnkW4J', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 3', url: 'https://youtu.be/aM_umAWcEXI?si=ooYBBGACjbcc-zob', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 4', url: 'https://youtu.be/fiPMNzSTeRI?si=pQ_fMmJnLwOd2Ayd', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 5', url: 'https://youtu.be/GQQRMY2nMIc?si=Z4Ths8_2M5z3AdoU', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 6', url: 'https://youtu.be/AsiXQiXtQJY?si=yAW56dB7h3FrONJd', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 7', url: 'https://youtu.be/KEhvmWcBdPM?si=KybJ8oK5ZIlnZ0Uq', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 8', url: 'https://youtu.be/IDpnpjrc3lw?si=e6fUalvrg8J3u6QQ', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 9', url: 'https://youtu.be/YgRoO1Lu4co?si=aCHkLjf7jfnPZwpx', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 10', url: 'https://youtu.be/YtxAnh65laA?si=BPud_B9Zn9uzptcg', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 11', url: 'https://youtu.be/dsjoQuMfTno?si=AQ2nfooC3abP1wmb', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 12', url: 'https://youtu.be/3yMUBz_0xUU?si=D63UYP8cPYgsK8jS', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 13', url: 'https://youtu.be/9b7F0haHKX4?si=TLUTB7FHGi4U_IWr', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 14', url: 'https://youtu.be/d5zKkyTchdA?si=x48TKZrO-8UjGDsv', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 15', url: 'https://youtu.be/gEn8j9vkaMU?si=BZrlbUOx6u3_Icou', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 16', url: 'https://youtu.be/eZAQqUmVK9w?si=p2sWlkZZEoBP1ZIZ', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 17', url: 'https://youtu.be/qbk2_LfcID4?si=8mHC1azCdRjJy_I-', source: 'YouTube' },
    { title: 'Windows Server 16 Course Part 18', url: 'https://youtu.be/a1SmLYKiDcE?si=jfHcQ9Xgkcm8ra5l', source: 'YouTube' },
    { title: 'Networking Protocols Intro', url: 'https://youtu.be/1zVZ9cWFnCc?si=5s72pvfZdF_KN7l2', source: 'YouTube' },
    { title: 'Networking Protocols Deep Dive', url: 'https://youtu.be/z_CU-IeOEzU?si=ufc9HaSaCxpK_4BJ', source: 'YouTube' },
    { title: 'DNS Fundamentals', url: 'https://youtu.be/nyH0nYhMW9M?si=gLYHgsDqlJ1t0ECc', source: 'YouTube' },
    { title: 'SMTP POP3 IMAP Explained', url: 'https://youtu.be/aria5gmElSc?si=E1MmTcIaHtRrGyVm', source: 'YouTube' },
    { title: 'Web Server Basics', url: 'https://youtu.be/AB0VMbvEz7g?si=OpACZZOgaQGJmIBT', source: 'YouTube' },
    { title: 'FTP Basics', url: 'https://youtu.be/hhGgYI580WE?si=lMWGNi5YKKNbplG2', source: 'YouTube' },
    { title: 'Hardware Troubleshooting', url: 'https://youtu.be/L2E7vpj3Iq8?si=OP0DD-r0s0Um9ZXe', source: 'YouTube' },
    { title: 'OS Troubleshooting', url: 'https://youtu.be/0Pk08wucjU8?si=dgiNVO07EeKovX7F', source: 'YouTube' },
    { title: 'IIS Server Playlist', url: 'https://youtube.com/playlist?list=PLS0spxc8nUsBZXueaeu22gtcbzXoGsK8F&si=4JxSVIfWcZlnAxp_', source: 'YouTube Playlist' },
    { title: 'MySQL Basics', url: 'https://youtu.be/Cz3WcZLRaWc?si=jrS7cNpTNARxCI64', source: 'YouTube' },
    { title: 'Virtualization Fundamentals', url: 'https://youtu.be/7m3f-P-WWbg?si=PXWkyZVfBSuGtAJ2', source: 'YouTube' },
    { title: 'Hyper-V Basics', url: 'https://youtu.be/LMAEbB2a50M?si=Kx1S6EEz6-BLF4ko', source: 'YouTube' },
    { title: 'WSUS Tutorial', url: 'https://youtu.be/DGIS83oA2Tg?si=n4Q1xEpbCdjd2YaZ', source: 'YouTube' },
    { title: 'Antivirus Essentials', url: 'https://youtu.be/SfdzO0o9604?si=trd0klRLnmIYOwyL', source: 'YouTube' },
    { title: 'Active Directory Basics', url: 'https://youtu.be/85-bp7XxWDQ?si=DINC5v15hQIjrPVE', source: 'YouTube' },
    { title: 'HTML Basics', url: 'https://youtu.be/salY_Sm6mv4?si=esD9dAY4Ym_ea9FC', source: 'YouTube' },
    { title: 'Monitoring and Maintenance Playlist', url: 'https://youtube.com/playlist?list=PLcDrg04OfcPN2nJziqWPGsKUA2sSpC8uh&si=SzPDmbXKIXz67l96', source: 'YouTube Playlist' },
    { title: 'Master Writing SOPs', url: 'https://youtu.be/qhBgvVMvPH8?si=Syp-KunH75pochcR', source: 'YouTube' },
    { title: 'Problem Solving Skills', url: 'https://youtu.be/ehRNriENFic?si=M0G8TyCXyuQVkP9G', source: 'YouTube' },
    { title: 'Workplace Communication', url: 'https://youtu.be/fm6PtyM4qMw?si=PfBaTnYjYoqd2JtJ', source: 'YouTube' }
  ]
};

ESDS_RESOURCE_LIBRARY.notes = ESDS_RESOURCE_LIBRARY.video;
ESDS_RESOURCE_LIBRARY.practice = ESDS_RESOURCE_LIBRARY.video;

const AARTI_RESOURCE_LIBRARY = {
  video: [
    { title: 'Unit Operations - Session 1', url: 'https://youtu.be/CDiBS0w1Z5M?si=GZ4MKACbFjQO5O3-', source: 'YouTube' },
    { title: 'Unit Operations - Session 2', url: 'https://youtu.be/Vz2la3947I0?si=L5wdLzq2MouUxz7J', source: 'YouTube' },
    { title: 'Heat and Mass Transfer - Intro', url: 'https://youtu.be/6jQsLAqrZGQ?si=X54VmsSnYLuvhW50', source: 'YouTube' },
    { title: 'Heat and Mass Transfer - Concepts', url: 'https://youtu.be/7Bj3N1E7vZk?si=nlwGs7TEovDAthXQ', source: 'YouTube' },
    { title: 'Heat and Mass Transfer - Applications', url: 'https://youtu.be/gcgFTGEE2mk?si=gw1VVtbuvm8-cMef', source: 'YouTube' },
    { title: 'Mass and Energy Balance Playlist', url: 'https://youtube.com/playlist?list=PL7GITJ_xbUTUoUEbZW7YUibr6C4oZd7hZ&si=8Vi26SUyXxxRwnhy', source: 'YouTube Playlist' },
    { title: 'Reaction Engineering Playlist', url: 'https://youtube.com/playlist?list=PL_UhBh-E8IOL69InxwFwYwSiF5yoYkm4L&si=UCQW3uvbD3b0m8A6', source: 'YouTube Playlist' },
    { title: 'PFD and P&ID Basics', url: 'https://youtu.be/Pov2sMx2E_s?si=-YfLqDGvP1eJquQS', source: 'YouTube' },
    { title: 'Process Optimization Basics', url: 'https://youtu.be/bTtzePtRCv0?si=mb1bAF6wd-skejcR', source: 'YouTube' },
    { title: 'Pipe Sizing Fundamentals', url: 'https://youtu.be/bhCf0HR61iY?si=Y1qXlOGDdjFD18JP', source: 'YouTube' },
    { title: 'Chemical Manufacturing Safety', url: 'https://youtu.be/sdsiQ0b0GEI?si=gsGWyL6YjWrCX628', source: 'YouTube' },
    { title: 'Electrical Fundamentals for Plant Role - Part 1', url: 'https://youtu.be/X1r9NbgPYYE?si=TdQYPm1e-g6uYexY', source: 'YouTube' },
    { title: 'Electrical Fundamentals for Plant Role - Part 2', url: 'https://youtu.be/1h3OYZJ5Ssc?si=WdCrVHO5o_Ed06fr', source: 'YouTube' },
    { title: 'Electrical Fundamentals for Plant Role - Part 3', url: 'https://youtu.be/60eGatXK9lU?si=D0eoIq6Qr66ehdTt', source: 'YouTube' },
    { title: 'Instrumentation Basics - Part 1', url: 'https://youtu.be/tY50mpZtdM8?si=VvgUWOUFprrEhmxi', source: 'YouTube' },
    { title: 'Instrumentation Basics - Part 2', url: 'https://youtu.be/KtsiM1st0KA?si=hSByVW9OvvEibuws', source: 'YouTube' },
    { title: 'Instrumentation Playlist', url: 'https://youtube.com/playlist?list=PL7GITJ_xbUTUoUEbZW7YUibr6C4oZd7hZ&si=8Vi26SUyXxxRwnhy', source: 'YouTube Playlist' },
    { title: 'Instrumentation Basics - Part 3', url: 'https://youtu.be/uOtdWHMKhnw?si=QPn6fju72XNWOZA9', source: 'YouTube' },
    { title: 'Reading Industrial Diagrams', url: 'https://youtu.be/j4EOTerfyTY?si=LHZuI1XY8ULr9RRk', source: 'YouTube' }
  ]
};

AARTI_RESOURCE_LIBRARY.notes = AARTI_RESOURCE_LIBRARY.video;
AARTI_RESOURCE_LIBRARY.practice = AARTI_RESOURCE_LIBRARY.video;

const NEILSOFT_RESOURCE_LIBRARY = {
  video: [
    { title: 'Precast', url: 'https://youtu.be/Rz057MfqH0c?si=wLLjfY7oa_B-O0dd', source: 'YouTube' },
    { title: 'Rebar', url: 'https://youtu.be/AI_kmzZZUZ4?si=02d51yoNRwlxrYbT', source: 'YouTube' },
    { title: 'Engineering Drawing', url: 'https://youtu.be/B1TtyMXqqCo?si=O5f-1KpnQDuEvkdj', source: 'YouTube' },
    { title: 'AutoCAD for Civil Engineering', url: 'https://youtu.be/ySQLJ41L_t4?si=ckJddUmaq-tUBkP2', source: 'YouTube' },
    { title: 'Tekla Modelling Basics', url: 'https://www.youtube.com/results?search_query=tekla+modelling+for+civil+engineering', source: 'YouTube Search' },
    { title: 'Fundamentals of Excel', url: 'https://youtu.be/Jl0Qk63z2ZY?si=qK9r0MhVUCIGJZzd', source: 'YouTube' }
  ]
};

NEILSOFT_RESOURCE_LIBRARY.notes = NEILSOFT_RESOURCE_LIBRARY.video;
NEILSOFT_RESOURCE_LIBRARY.practice = NEILSOFT_RESOURCE_LIBRARY.video;

const TECH_RATE_MAP = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const normalize = (v) => String(v || '').toLowerCase().trim();

function getRoadmapStorageKey(user) {
  if (!user) return 'placementhub.roadmaps.guest';
  return `placementhub.roadmaps.${user.id || user.email || 'guest'}`;
}

function getInitialCompanies() {
  return [...COMPANY_INTELLIGENCE].sort((a, b) => {
    if (a?.id === 'neilsoft-get-civil') return -1;
    if (b?.id === 'neilsoft-get-civil') return 1;
    return new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime();
  });
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

function pickResource(learningStyle, day, taskIndex, company) {
  if (company?.id === 'neilsoft-get-civil') {
    const neilsoftStyleKey = learningStyle === 'Watch videos' ? 'video' : learningStyle === 'Read notes' ? 'notes' : 'practice';
    const neilsoftPool = NEILSOFT_RESOURCE_LIBRARY[neilsoftStyleKey] || NEILSOFT_RESOURCE_LIBRARY.video;
    return neilsoftPool[(day + taskIndex) % neilsoftPool.length];
  }
  if (company?.id === 'aarti-pharmalabs-get') {
    const aartiStyleKey = learningStyle === 'Watch videos' ? 'video' : learningStyle === 'Read notes' ? 'notes' : 'practice';
    const aartiPool = AARTI_RESOURCE_LIBRARY[aartiStyleKey] || AARTI_RESOURCE_LIBRARY.video;
    return aartiPool[(day + taskIndex) % aartiPool.length];
  }
  if (company?.id === 'esds-windows-admin') {
    const esdsStyleKey = learningStyle === 'Watch videos' ? 'video' : learningStyle === 'Read notes' ? 'notes' : 'practice';
    const esdsPool = ESDS_RESOURCE_LIBRARY[esdsStyleKey] || ESDS_RESOURCE_LIBRARY.video;
    return esdsPool[(day + taskIndex) % esdsPool.length];
  }
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

  const companyProfile = COMPANY_PREP_PROFILES[company.id] || null;
  const domainFocus = companyProfile?.focus || company.intelligence.requiredSkills.technical;
  const focusPool = (skillGaps.length ? skillGaps : domainFocus).slice(0, 6);
  const softFocusPool = companyProfile?.soft || ['Communication practice for interview', 'Resume and self-introduction practice'];

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
          title = softFocusPool[(day + t) % softFocusPool.length] || (t % 2 === 0 ? 'Communication practice for interview' : 'Resume and self-introduction practice');
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
        resource: pickResource(assessment.learningStyle, day, t, company),
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
  const { user, apiBaseUrl, getAuthToken } = useAuth();
  const [companies, setCompanies] = useState(getInitialCompanies);
  const [roadmaps, setRoadmaps] = useState([]);
  const roadmapStorageKey = useMemo(() => getRoadmapStorageKey(user), [user]);

  useEffect(() => {
    // Cleanup legacy cache so old stale company lists don't override current defaults.
    localStorage.removeItem('placementhub.companies');
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(roadmapStorageKey);
      setRoadmaps(raw ? JSON.parse(raw) : []);
    } catch (_err) {
      setRoadmaps([]);
    }
  }, [roadmapStorageKey]);

  useEffect(() => {
    localStorage.setItem(roadmapStorageKey, JSON.stringify(roadmaps));
  }, [roadmaps, roadmapStorageKey]);

  const getCompanyQuiz = (companyId) => {
    if (COMPANY_QUIZ_OVERRIDES[companyId]) {
      return COMPANY_QUIZ_OVERRIDES[companyId];
    }
    const company = companies.find((c) => c.id === companyId);
    const domain = company?.domain || 'mechanical';
    return QUIZ_BANK[domain] || QUIZ_BANK.mechanical;
  };

  const generateRoadmapFromAssessment = (companyId, assessment) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return null;

    const readinessScore = computeReadiness(assessment);

    const baselineSkillGaps = company.intelligence.requiredSkills.technical.filter((skill) => {
      const test = normalize(skill);
      const toolText = normalize(assessment.toolsKnown || '');
      const tradeText = normalize(assessment.tradeSkill || assessment.trade || '');
      return !(toolText.includes(test.split(' ')[0]) || tradeText.includes(test.split(' ')[0]));
    });

    const miniQuizGaps = Array.isArray(assessment.extraSkillGaps) ? assessment.extraSkillGaps : [];
    const skillGaps = [...new Set([...baselineSkillGaps, ...miniQuizGaps])];

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

  const toggleRoadmapTaskCompletion = (roadmapId, day, taskId) => {
    setRoadmaps((prev) =>
      prev.map((roadmap) => {
        if (roadmap.id !== roadmapId) return roadmap;

        const dayPlans = roadmap.dayPlans.map((d) => {
          if (d.day !== day) return d;

          const tasks = d.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return { ...task, completed: !task.completed };
          });

          return {
            ...d,
            tasks,
            completed: tasks.every((task) => task.completed)
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

  const completeRoadmapPostAssessment = (roadmapId, result) => {
    setRoadmaps((prev) =>
      prev.map((roadmap) => {
        if (roadmap.id !== roadmapId) return roadmap;
        return {
          ...roadmap,
          postAssessment: {
            ...(roadmap.postAssessment || {}),
            ...result,
            completedAt: new Date().toISOString()
          }
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

  useEffect(() => {
    if (!user || user.role !== 'student' || !apiBaseUrl) return;

    const payload = {
      readiness_score: dashboardStats.readiness_score || 0,
      active_roadmap: dashboardStats.active_roadmap || 0,
      progress_percentage: dashboardStats.progress_percentage || 0
    };

    const authToken = getAuthToken?.();
    fetch(`${apiBaseUrl}/api/student/progress-summary`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Keep local UX responsive even if summary sync fails.
    });
  }, [user, apiBaseUrl, getAuthToken, dashboardStats]);

  return (
    <RoadmapContext.Provider
      value={{
        companies,
        roadmaps,
        dashboardStats,
        getCompanyQuiz,
        generateRoadmapFromAssessment,
        toggleRoadmapDayCompletion,
        toggleRoadmapTaskCompletion,
        completeRoadmapPostAssessment,
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
