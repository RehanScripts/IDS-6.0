const express = require('express');
const { generateRoadmapController } = require('../controllers/roadmapController');

const router = express.Router();

router.post('/generate', generateRoadmapController);

module.exports = router;
