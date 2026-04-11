const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildRoadmapPrompt } = require('../utils/promptBuilder');

const GEMINI_MODEL = 'gemini-2.0-flash';

function pickPhaseDuration(index) {
  const durations = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5-6', 'Week 7-8'];
  return durations[index] || `Phase ${index + 1}`;
}

function normalizeSkills(input) {
  const ordered = [];
  const pushUnique = (items) => {
    (items || []).forEach((item) => {
      const value = String(item || '').trim();
      if (value && !ordered.includes(value)) ordered.push(value);
    });
  };

  pushUnique(input.skillGaps);
  pushUnique(input.requiredSkills);
  pushUnique(input.strengths);

  if (!ordered.length) {
    ordered.push('Role fundamentals', 'Problem solving', 'Interview communication', 'Project execution');
  }
  return ordered;
}

function buildFallbackRoadmap(input, reason) {
  const focusSkills = normalizeSkills(input);
  const phaseCount = Math.min(5, Math.max(3, focusSkills.length >= 6 ? 5 : 4));
  const role = input.role || 'target role';
  const company = input.companyName ? ` for ${input.companyName}` : '';
  const readiness = input.readinessScore != null ? ` Current readiness is ${input.readinessScore}/100.` : '';
  const performance = input.performanceRating != null ? ` Self-rating: ${input.performanceRating}/10.` : '';

  const phases = Array.from({ length: phaseCount }).map((_, index) => {
    const skillA = focusSkills[index % focusSkills.length];
    const skillB = focusSkills[(index + 1) % focusSkills.length];
    const skillC = focusSkills[(index + 2) % focusSkills.length];
    return {
      phase: `Phase ${index + 1}: ${skillA} and ${skillB}`,
      duration: pickPhaseDuration(index),
      topics: [
        `${skillA} concepts and interview basics`,
        `${skillB} hands-on practice`,
        `${skillC} applied problem solving`,
        'Revision and confidence-building mock rounds',
      ],
      project: `Build a mini ${role} project focused on ${skillA} + ${skillB}, document trade-offs, and present key decisions.`,
      resources: [
        `${skillA}: official docs + curated tutorial series`,
        `${skillB}: role-specific interview problem sets`,
        `Weekly mock practice aligned to ${role}${company}`,
      ],
      videoLinks: [
        { title: `${skillA} Crash Course`, url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${skillA} tutorial`) },
        { title: `${skillB} Interview Practice`, url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${skillB} interview questions`) },
      ],
      platforms: ['YouTube', 'Coursera', 'Udemy', 'LeetCode/HackerRank', 'GitHub'],
    };
  });

  return {
    roadmapTitle: `${role} Readiness Roadmap${company}`,
    description: `Generated via internal fallback planner because Gemini output was unavailable (${reason}).${readiness}${performance} This roadmap is tailored using your readiness context and identified skill gaps.`,
    phases,
  };
}

function cleanModelOutput(rawText) {
  if (!rawText) return '';

  // Remove markdown fences if the model wraps JSON in code blocks.
  const withoutFences = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return withoutFences;
}

function extractJsonCandidate(text) {
  const cleaned = cleanModelOutput(text);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Model output did not contain a valid JSON object.');
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function validateRoadmapShape(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Roadmap response is not an object.');
  }

  if (!Array.isArray(parsed.phases)) {
    throw new Error('Roadmap response must include a phases array.');
  }

  parsed.phases = parsed.phases.map((phase) => ({
    phase: String(phase?.phase || ''),
    duration: String(phase?.duration || ''),
    topics: Array.isArray(phase?.topics) ? phase.topics.map(String) : [],
    project: String(phase?.project || ''),
    resources: Array.isArray(phase?.resources) ? phase.resources.map(String) : [],
    videoLinks: Array.isArray(phase?.videoLinks)
      ? phase.videoLinks
          .map((v) => ({ title: String(v?.title || ''), url: String(v?.url || '') }))
          .filter((v) => v.title || v.url)
      : [],
    platforms: Array.isArray(phase?.platforms) ? phase.platforms.map(String) : [],
  }));

  return {
    roadmapTitle: String(parsed.roadmapTitle || 'Personalized Career Roadmap'),
    description: String(parsed.description || ''),
    phases: parsed.phases,
  };
}

function parseRoadmapJson(rawText) {
  const jsonCandidate = extractJsonCandidate(rawText);

  try {
    const parsed = JSON.parse(jsonCandidate);
    return validateRoadmapShape(parsed);
  } catch (err) {
    throw new Error(`Unable to parse Gemini roadmap JSON: ${err.message}`);
  }
}

async function generateRoadmap(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackRoadmap(input, 'missing_api_key');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = buildRoadmapPrompt(input);

  let modelText = '';
  try {
    const result = await model.generateContent(prompt);
    modelText = result?.response?.text?.() || '';
  } catch (err) {
    return buildFallbackRoadmap(input, `gemini_request_failed: ${err.message}`);
  }

  try {
    return parseRoadmapJson(modelText);
  } catch (err) {
    return buildFallbackRoadmap(input, `gemini_parse_failed: ${err.message}`);
  }
}

module.exports = {
  generateRoadmap,
};
