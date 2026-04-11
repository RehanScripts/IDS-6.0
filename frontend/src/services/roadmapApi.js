import axios from 'axios';

const ROADMAP_API_BASE_URL =
  process.env.REACT_APP_ROADMAP_API_URL || 'http://localhost:4000';

export async function generateGeminiRoadmap(payload) {
  try {
    const response = await axios.post(
      `${ROADMAP_API_BASE_URL}/api/roadmap/generate`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data?.roadmap;
  } catch (err) {
    if (!err.response) {
      throw new Error(
        `Network error: could not reach roadmap API at ${ROADMAP_API_BASE_URL}. Ensure backend/node-api is running on port 4000.`
      );
    }
    if (err.response?.status === 502 && /quota|Too Many Requests|429/i.test(String(err.response?.data?.error || ''))) {
      throw new Error('Gemini quota exceeded for the configured API key. Update billing/quota and try again.');
    }
    if (err.response?.data?.error) {
      throw new Error(String(err.response.data.error));
    }
    throw err;
  }
}
