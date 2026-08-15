import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, communityService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error parsing stored user:', e);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userCommunities, setUserCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(() => {
    try {
      const savedComm = localStorage.getItem('activeCommunity');
      return savedComm ? JSON.parse(savedComm) : null;
    } catch (e) {
      console.error('Error parsing stored activeCommunity:', e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const loadCommunities = async () => {
    if (!token) return;
    try {
      const res = await communityService.getCommunities();
      const list = res.data?.results || res.data?.data || res.data || [];
      // Filter communities where user is member or created
      const joined = list.filter(c => c.is_member || c.created_by === user?.id);
      setUserCommunities(joined);
      if (joined.length > 0 && !activeCommunity) {
        selectCommunity(joined[0]);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      loadCommunities();
    }
    setLoading(false);
  }, [token]);

  const selectCommunity = (community) => {
    setActiveCommunity(community);
    if (community) {
      localStorage.setItem('activeCommunity', JSON.stringify(community));
    } else {
      localStorage.removeItem('activeCommunity');
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(access);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeCommunity');
    setToken(null);
    setUser(null);
    setActiveCommunity(null);
    setUserCommunities([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        userCommunities,
        activeCommunity,
        selectCommunity,
        loadCommunities,
        login,
        register,
        logout,
        fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
