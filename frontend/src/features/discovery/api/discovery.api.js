import { api } from '../../../shared/api/client';

export const discoveryApi = {
  getQuestions: () => api.get('/discovery/questions').then((r) => r.data),
  organize: (text) => api.post('/discovery/organize', { text }).then((r) => r.data),
  createDraft: (payload) => api.post('/discovery/drafts', payload).then((r) => r.data),
  updateDraft: (token, payload) => api.put(`/discovery/drafts/${token}`, payload).then((r) => r.data),
  getDraft: (token) => api.get(`/discovery/drafts/${token}`).then((r) => r.data),
  submit: (payload) => api.post('/discovery/submissions', payload).then((r) => r.data),
  requestConsultation: (payload) => api.post('/consultations', payload).then((r) => r.data),
};
