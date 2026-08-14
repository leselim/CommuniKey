import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for automatic token handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken });
          const newAccessToken = res.data.access;
          localStorage.setItem('token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Service Endpoints
export const authService = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

export const communityService = {
  getCommunities: (params) => api.get('/communities/', { params }),
  getCommunity: (id) => api.get(`/communities/${id}/`),
  createCommunity: (data) => api.post('/communities/', data),
  joinCommunity: (id) => api.post(`/communities/${id}/join/`),
  leaveCommunity: (id) => api.post(`/communities/${id}/leave/`),
  getMembers: (id) => api.get(`/communities/${id}/members/`),
  approveMember: (id, membershipId, action) => api.post(`/communities/${id}/members/${membershipId}/approve/`, { action }),
  getFeed: (communityId) => api.get(`/communities/feed/?community=${communityId || ''}`),
  createFeedPost: (data) => api.post('/communities/feed/', data),
  getComments: (postId) => api.get(`/communities/feed/${postId}/comments/`),
  addComment: (postId, comment) => api.post(`/communities/feed/${postId}/comments/`, { comment }),
};

export const incidentService = {
  getIncidents: (params) => api.get('/incidents/', { params }),
  getIncident: (id) => api.get(`/incidents/${id}/`),
  createIncident: (data) => api.post('/incidents/', data),
  updateIncident: (id, data) => api.put(`/incidents/${id}/`, data),
  deleteIncident: (id) => api.delete(`/incidents/${id}/`),
};

export const announcementService = {
  getAnnouncements: (params) => api.get('/announcements/', { params }),
  createAnnouncement: (data) => api.post('/announcements/', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}/`),
};

export const emergencyService = {
  getSOSAlerts: (params) => api.get('/emergency/sos/', { params }),
  triggerSOS: (data) => api.post('/emergency/sos/', data),
  resolveSOS: (id, status) => api.put(`/emergency/sos/${id}/resolve/`, { status }),
};

export const eventService = {
  getEvents: (params) => api.get('/events/', { params }),
  createEvent: (data) => api.post('/events/', data),
  rsvpEvent: (id, status) => api.post(`/events/${id}/rsvp/`, { status }),
  deleteEvent: (id) => api.delete(`/events/${id}/`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.put(`/notifications/${id}/read/`),
  markAllAsRead: () => api.put('/notifications/read-all/'),
};

export const servicesService = {
  getLostAndFound: (params) => api.get('/services/lost-and-found/', { params }),
  createLostAndFound: (data) => api.post('/services/lost-and-found/', data),
  updateLostAndFoundStatus: (id, status) => api.patch(`/services/lost-and-found/${id}/`, { status }),
  getServiceProviders: (params) => api.get('/services/providers/', { params }),
  createServiceProvider: (data) => api.post('/services/providers/', data),
};

export default api;
