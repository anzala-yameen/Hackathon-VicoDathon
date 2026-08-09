import axios from 'axios';

// Primary relative path for Vite proxy, with direct backend URL fallback
const API_BASE_URL = '/api';
const DIRECT_BACKEND_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

const directClient = axios.create({
  baseURL: DIRECT_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

export const api = {
  // Start a personalized interview
  async startInterview(candidateInput) {
    let payload = { action: 'start' };
    
    if (typeof candidateInput === 'object' && candidateInput !== null) {
      const cid = candidateInput.candidateId || candidateInput.member?.id;
      if (cid) {
        payload.candidateId = String(cid);
      } else {
        payload.candidate = candidateInput;
      }
    } else if (candidateInput) {
      payload.candidateId = String(candidateInput);
    } else {
      payload.candidateId = 'CAND-001';
    }

    try {
      const res = await apiClient.post('/interview', payload);
      return res.data;
    } catch (err) {
      console.warn('Proxy POST /api/interview failed, trying direct backend call...', err);
      try {
        const res = await directClient.post('/interview', payload);
        return res.data;
      } catch (err2) {
        console.warn('Direct POST /api/interview failed, trying /interview/start fallback', err2);
        const fallbackId = payload.candidateId || 'CAND-001';
        try {
          const res = await apiClient.post('/interview/start', { candidateId: fallbackId });
          return res.data;
        } catch (err3) {
          const res = await directClient.post('/interview/start', { candidateId: fallbackId });
          return res.data;
        }
      }
    }
  },

  // Submit candidate answer
  async respondInterview(sessionId, answer) {
    const payload = {
      sessionId,
      message: answer,
      answer: answer,
      action: 'respond'
    };

    try {
      const res = await apiClient.post('/interview', payload);
      return res.data;
    } catch (err) {
      try {
        const res = await directClient.post('/interview', payload);
        return res.data;
      } catch (err2) {
        const res = await apiClient.post('/interview/respond', { sessionId, answer });
        return res.data;
      }
    }
  },

  // Fetch feedback evaluation report
  async getFeedback(sessionId) {
    try {
      const res = await apiClient.get(`/interview/feedback/${sessionId}`);
      return res.data;
    } catch (err) {
      try {
        const res = await directClient.get(`/interview/feedback/${sessionId}`);
        return res.data;
      } catch (err2) {
        const res = await apiClient.post('/interview', { sessionId, action: 'feedback' });
        return res.data;
      }
    }
  },

  // Fetch list of candidate profiles
  async getCandidates() {
    try {
      const res = await apiClient.get('/candidates');
      return res.data.candidates;
    } catch (err) {
      const res = await directClient.get('/candidates');
      return res.data.candidates;
    }
  },

  // Fetch curriculum details
  async getCurriculum() {
    try {
      const res = await apiClient.get('/curriculum');
      return res.data;
    } catch (err) {
      const res = await directClient.get('/curriculum');
      return res.data;
    }
  },

  // Fetch active session info & transcript
  async getSessionInfo(sessionId) {
    try {
      const res = await apiClient.get(`/interview/session/${sessionId}`);
      return res.data;
    } catch (err) {
      const res = await directClient.get(`/interview/session/${sessionId}`);
      return res.data;
    }
  }
};
