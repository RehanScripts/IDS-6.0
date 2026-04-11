const { generateRoadmap } = require('../services/geminiService');

function normalizeInput(body = {}) {
  const toList = (value) => (Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : []);

  return {
    role: String(body.role || '').trim(),
    skillLevel: String(body.skillLevel || '').trim(),
    goal: String(body.goal || '').trim(),
    timeAvailable: String(body.timeAvailable || '').trim(),
    companyName: String(body.companyName || '').trim(),
    readinessScore: Number.isFinite(Number(body.readinessScore)) ? Number(body.readinessScore) : null,
    performanceRating: Number.isFinite(Number(body.performanceRating)) ? Number(body.performanceRating) : null,
    quizScore: Number.isFinite(Number(body.quizScore)) ? Number(body.quizScore) : null,
    strengths: toList(body.strengths),
    skillGaps: toList(body.skillGaps),
    requiredSkills: toList(body.requiredSkills),
  };
}

function validateInput(input) {
  const required = {
    role: input.role,
    skillLevel: input.skillLevel,
    goal: input.goal,
    timeAvailable: input.timeAvailable,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
}

async function generateRoadmapController(req, res, next) {
  try {
    const input = normalizeInput(req.body);
    validateInput(input);

    const roadmap = await generateRoadmap(input);

    return res.status(200).json({
      success: true,
      input,
      roadmap,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  generateRoadmapController,
};
