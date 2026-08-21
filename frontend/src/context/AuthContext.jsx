import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const SEED_PASSWORD = 'Password123!';

export const SAMPLE_USERS = [
  {
    id: 1,
    email: 'thabo@example.com',
    aliases: ['resident@example.com', 'thabo@example.com'],
    password: SEED_PASSWORD,
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
    aliases: ['admin@example.com', 'marcus@example.com'],
    password: SEED_PASSWORD,
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'Estate Administrator',
    address: '1 Clubhouse Way, Section A',
    community_name: 'Riverside Estate',
    phone_number: '+27 82 111 2020',
    status: 'Verified',
  },
  {
    id: 3,
    email: 'sarah@example.com',
    aliases: ['volunteer@example.com', 'sarah@example.com'],
    password: SEED_PASSWORD,
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
    email: 'david@example.com',
    aliases: ['sysadmin@example.com', 'david@example.com'],
    password: SEED_PASSWORD,
    first_name: 'David',
    last_name: 'Chen',
    role: 'IT & App Support',
    address: 'Estate IT & Technical Support Office',
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
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
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

  const login = (emailInput, passwordInput) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const target = SAMPLE_USERS.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        (u.aliases && u.aliases.some((a) => a.toLowerCase() === cleanEmail))
    );

    if (target) {
      if (passwordInput && passwordInput !== SEED_PASSWORD) {
        return {
          success: false,
          message: `Invalid password for ${cleanEmail}. Default seed password is '${SEED_PASSWORD}'.`,
        };
      }
      setCurrentUser(target);
      localStorage.setItem(TOKEN_KEY, 'demo_token_' + target.role.toLowerCase());
      return { success: true, user: target };
    }

    // Fallback for custom accounts
    const handle = cleanEmail.split('@')[0];
    const parts = handle.split(/[._\-]/);
    const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : 'Resident';
    const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() : 'Member';

    const customUser = {
      id: Date.now(),
      email: cleanEmail,
      first_name: firstName,
      last_name: lastName,
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
    const target =
      SAMPLE_USERS.find((u) => u.role.toLowerCase() === roleName.toLowerCase()) ||
      SAMPLE_USERS[0];
    setCurrentUser(target);
    localStorage.setItem(TOKEN_KEY, 'demo_token_' + target.role.toLowerCase());
    return target;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const register = (newUserData) => {
    const firstNameRaw = newUserData.first_name ? newUserData.first_name.trim() : '';
    const lastNameRaw = newUserData.last_name ? newUserData.last_name.trim() : '';

    const formattedFirstName = firstNameRaw
      ? firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1).toLowerCase()
      : 'Resident';
    const formattedLastName = lastNameRaw
      ? lastNameRaw.charAt(0).toUpperCase() + lastNameRaw.slice(1).toLowerCase()
      : 'Member';

    const newUser = {
      id: Date.now(),
      email: newUserData.email.trim().toLowerCase(),
      first_name: formattedFirstName,
      last_name: formattedLastName,
      role: 'Resident', // Default role for new signups
      address: newUserData.address ? newUserData.address.trim() : '14 Riverside Drive, Section B',
      community_name: 'Riverside Estate',
      phone_number: newUserData.phone_number ? newUserData.phone_number.trim() : '+27 82 000 0000',
      status: 'Verified Resident',
    };

    setCurrentUser(newUser);
    localStorage.setItem(TOKEN_KEY, 'demo_token_resident');
    return { success: true, user: newUser };
  };

  const resetPassword = (emailInput) => {
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${emailInput.trim()}. Check your inbox to complete reset.`,
    };
  };

  const updateProfile = (updatedData) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedData }));
  };

  /**
   * Data Privacy & RBAC Permission Boundaries:
   * 1. Administrators cannot view private peer-to-peer chats between residents unless explicitly escalated as an Admin Ticket.
   * 2. Residents only have access to their own personal data and direct communications.
   * 3. Safety Volunteers are restricted strictly to active safety alerts, triage logs, and dispatching.
   * 4. System Admins manage technical configurations and audit logs without inspecting unredacted private messages.
   */
  const canAccessPrivateChat = (senderName, recipientName) => {
    if (!currentUser) return false;
    const myFullName = `${currentUser.first_name} ${currentUser.last_name}`;

    // Admin & SysAdmin privacy restriction: No reading private peer-to-peer resident chats unless Admin support is a participant
    if (
      currentUser.role === 'Estate Administrator' ||
      currentUser.role === 'Community Administrator' ||
      currentUser.role === 'IT & App Support' ||
      currentUser.role === 'System Administrator'
    ) {
      return (
        senderName.includes('Marcus') ||
        recipientName.includes('Marcus') ||
        senderName.includes('Admin') ||
        recipientName.includes('Admin')
      );
    }

    // Residents & Volunteers can only view chats they are directly part of
    return (
      senderName === myFullName ||
      recipientName === myFullName ||
      senderName.includes(currentUser.first_name) ||
      recipientName.includes(currentUser.first_name)
    );
  };

  const redactResidentProfile = (residentMember) => {
    if (!currentUser) return residentMember;
    const isSelf = currentUser.email === residentMember.email;
    const isVolunteer = currentUser.role === 'Safety Volunteer';

    // If viewing another resident's profile as Admin or another Resident, redact private gate access code & personal notes
    if (!isSelf && !isVolunteer) {
      return {
        ...residentMember,
        gate_access_code: '•••• [Protected Resident Privacy]',
        emergency_notes: 'Redacted: Accessible strictly to Safety Responders & Emergency Patrol during active alerts.',
      };
    }

    return residentMember;
  };

  const value = {
    currentUser,
    userRole: currentUser ? currentUser.role : null,
    isAuthenticated: Boolean(currentUser),
    login,
    loginAsPersona,
    logout,
    register,
    resetPassword,
    updateProfile,
    canAccessPrivateChat,
    redactResidentProfile,
    sampleUsers: SAMPLE_USERS,
    seedPassword: SEED_PASSWORD,
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
