import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { save, unwrap } from '../services/api';

export const DEMO_USERS = [
  {
    id: 1,
    first_name: 'Jane',
    last_name: 'Resident',
    email: 'resident@example.com',
    phone_number: '+27 82 111 2222',
    address: '14 Riverside Drive',
    role: 'Resident',
    verified: true,
    notify_emergency: true,
    notify_events: true,
    notify_announcements: true,
  },
  {
    id: 2,
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'admin@example.com',
    phone_number: '+27 82 333 4444',
    address: '1 Clubhouse Way',
    role: 'Community Administrator',
    verified: true,
    notify_emergency: true,
    notify_events: true,
    notify_announcements: true,
  },
  {
    id: 3,
    first_name: 'Sarah',
    last_name: 'Jenkins',
    email: 'volunteer@example.com',
    phone_number: '+27 82 555 6666',
    address: '8 Mill Road',
    role: 'Safety Volunteer',
    verified: true,
    notify_emergency: true,
    notify_events: true,
    notify_announcements: true,
  },
  {
    id: 4,
    first_name: 'David',
    last_name: 'Chen',
    email: 'sysadmin@example.com',
    phone_number: '+27 82 777 8888',
    address: 'CommuniKey HQ',
    role: 'System Administrator',
    verified: true,
    notify_emergency: true,
    notify_events: true,
    notify_announcements: true,
  },
];

const ACTIVE_USER_KEY = 'ccp_active_user';
const ALL_USERS_KEY = 'ccp_registered_users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      return stored ? JSON.parse(stored) : DEMO_USERS;
    } catch (e) {
      return DEMO_USERS;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return DEMO_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (email, password) => {
    // Attempt backend API login first if backend is running
    try {
      const response = await api.post('/auth/login/', { email, password });
      const data = unwrap(response);
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.user) {
          setUser(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch (err) {
      // Backend not running or demo fallback
    }

    // Match against local users or seed users
    const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      setUser(matched);
      return { success: true, user: matched };
    }

    // Default fallback if unknown email entered: create verified resident account
    const newUser = {
      id: Date.now(),
      first_name: email.split('@')[0] || 'User',
      last_name: 'Member',
      email: email.trim(),
      phone_number: '+27 82 000 0000',
      address: 'Riverside Estate',
      role: 'Resident',
      verified: true,
      notify_emergency: true,
      notify_events: true,
      notify_announcements: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const signup = async (userData) => {
    const newUser = {
      id: Date.now(),
      first_name: userData.first_name || 'Resident',
      last_name: userData.last_name || 'Member',
      email: userData.email,
      phone_number: userData.phone_number || '+27 82 000 0000',
      address: userData.address || 'Riverside Estate',
      role: userData.role || 'Resident',
      verified: true, // Verified member status
      notify_emergency: true,
      notify_events: true,
      notify_announcements: true,
    };

    try {
      await save('/auth/register/', userData);
    } catch (e) {}

    setUsers((prev) => [...prev.filter((u) => u.email !== newUser.email), newUser]);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const switchUser = (roleOrEmail) => {
    const target = users.find(
      (u) =>
        u.role.toLowerCase() === roleOrEmail.toLowerCase() ||
        u.email.toLowerCase() === roleOrEmail.toLowerCase()
    );
    if (target) {
      setUser(target);
    } else {
      const demo = DEMO_USERS.find((u) => u.role.toLowerCase() === roleOrEmail.toLowerCase());
      if (demo) {
        setUser(demo);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      setUsers((all) => all.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        switchUser,
        updateUserProfile,
        demoUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
