import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log("Request Interceptor - Token:", token ? "Present" : "Missing");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 422)) {
      const msg = error.response.data && error.response.data.msg ? error.response.data.msg : "Session expired";
      alert(`Authentication Error: ${msg}. Please log in again.`);
      localStorage.removeItem('token');
      window.location.href = '/login';
      console.error("Authentication error:", error.response.status);
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (username, email, password) => api.post('/auth/register', { username, email, password });
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

export const getPapers = () => api.get('/papers');
export const getPaperContent = (filename) => api.get(`/papers/${filename}`);
export const uploadPaper = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const searchPapers = (query) => api.post('/search', { query });
export const summarizePaper = (data) => api.post('/summarize', data);
export const askQuestion = (question, context) => {
  console.log("askQuestion API call:", { question, context });
  return api.post('/qa', { question, context })
    .catch(err => {
      console.error("API call failed:", err);
      throw err;
    });
};
export const getNews = (topic) => api.get(`/news?topic=${topic}`);
export const checkPlagiarism = (data) => {
  if (data instanceof FormData) {
    return api.post('/check-plagiarism', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/check-plagiarism', data);
};
export const getDashboardData = () => api.get('/dashboard');
export const getConferences = (topic) => api.get(`/conferences?topic=${topic}`);
export const visualizePaper = (data) => api.post('/visualize-paper', data);
export const deepWebResearch = (data) => api.post('/web-research', data);
export const getKnowledgeGraph = (data) => api.post('/knowledge-graph', data);
export const matchJournals = (data) => api.post('/journal-match', data);
export const getResearchTrends = (data) => api.post('/research-trends', data);
export const scoutFunding = (data) => api.post('/funding-scout', data);
export const checkIEEEFormat = (data) => api.post('/check-ieee', data);
export const draftAcademicSection = (data) => api.post('/draft-section', data);
export const synthesizePapers = (data) => api.post('/synthesize-papers', data);
export const createRoom = (data) => api.post('/collaboration/create-room', data);
export const getRoom = (roomId) => api.get(`/collaboration/rooms/${roomId}`);
export const addRoomMessage = (data) => api.post('/collaboration/add-message', data);
export const getMessages = (roomId) => api.get(`/collaboration/rooms/${roomId}/messages`);
export const listRooms = () => api.get('/collaboration/rooms');
export const saveChatHistory = (messages) => api.post('/save-chat', { messages });

export default api;
