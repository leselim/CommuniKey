import React, { createContext, useContext, useEffect, useState } from 'react';
import { members, profile as demoProfile } from '../services/demoData';

const AuthContext = createContext(null);

export const SAMPLE_USERS = [
  {
    id: 1,
    email: 'resident@example.com',
    first_name: 'Thabo',
    last_name: 'Mokoena',
    role: 'Resident',
    address: '22 Riverside Drive, Section A',
    community_name: 'Riverside Estate',
    phone_number: '+27 82 459 1029',
    status: 'Verified',
  },
  {
    id: 2,
    email: 'admin@example.com',
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'Community Administrator',
    address: '1 Clubhouse Way, Section A',
    community_name: 'Riverside Estate',
    phone_number: '+27 82 111 2020',
    status: 'Verified',
  },
  {
    id: 3,
    email: 'volunteer@example.com',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    role: 'Safety Volunteer',
    address: '8 Mill Road, Section B',
    community_name: 'Riverside Estate',
    phone_number: '+27 83 456 7890',
    status: 'Verified',
  },
  {
    id: 4,
    email: 'sysadmin@example.com',
    first_name: 'David',
    last_name: 'Chen',
    role: 'System Administrator',
    address: 'CommuniKey HQ, Tech Hub',
    community_name: 'Riverside Estate',
    phone_number: '+27 82 999 4040',
    status: 'Verified',
  },
];

const AUTH_USER_KEY = 'ccp_auth_user';
const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : SAMPLE_USERS[0];
    } catch (e) {
      return SAMPLE_USERS[0];
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
      if (!localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(TOKEN_KEY, 'demo_token_' + currentUser.role.toLowerCase());
      }
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [currentUser]);

  const login = (email, password) => {
    const target = SAMPLE_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (target) {
      setCurrentUser(target);
      localStorage.setItem(TOKEN_KEY, 'demo_token_' + target.role.toLowerCase());
      return { success: true, user: target };
    }

    // Fallback for custom emails
    const customUser = {
      id: Date.now(),
      email: email.trim(),
      first_name: email.split('@')[0],
      last_name: 'Member',
      role: 'Resident',
      address: '14 Riverside Drive',
      community_name: 'Riverside Estate',
      phone_number: '+27 82 000 0000',
      status: 'Verified',
    };
    setCurrentUser(customUser);
    localStorage.setItem(TOKEN_KEY, 'demo_token_resident');
    return { success: true, user: customUser };
  };

  const loginAsPersona = (roleName) => {
    const target = SAMPLE_USERS.find(
      (u) => u.role.toLowerCase() === roleName.toLowerCase()
    ) || SAMPLE_USERS[0];
    setCurrentUser(target);
    localStorage.setItem(TOKEN_KEY, 'demo_token_' + target.role.toLowerCase());
    return target;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateProfile = (updatedData) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    currentUser,
    userRole: currentUser ? currentUser.role : null,
    isAuthenticated: Boolean(currentUser),
    login,
    loginAsPersona,
    logout,
    updateProfile,
    sampleUsers: SAMPLE_USERS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
