import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to filter contacts and DM conversations according to the active persona.
 * Enforces the strict rule: The currently active persona MUST NEVER appear in their own
 * contact list, DM threads, or dropdown selectors.
 */
export function useFilteredContacts(conversations = []) {
  const { currentUser, userRole, canAccessPrivateChat } = useAuth();

  return useMemo(() => {
    const activeEmail = currentUser?.email || '';
    const activeFirstName = currentUser?.first_name || '';
    const activeLastName = currentUser?.last_name || '';
    const activeFullName = `${activeFirstName} ${activeLastName}`.trim();

    return conversations.filter((c) => {
      // 1. Strict Self Exclusion Rule: Never show self in direct contacts or DM lists
      if (c.type === 'direct') {
        // Exclude matching active user email or ID
        if (activeEmail && c.email === activeEmail) return false;
        if (c.id === `d_${currentUser?.id}`) return false;

        // Exclude specific persona self-references
        if (userRole === 'Security Guard' || activeFirstName === 'Sipho') {
          if (c.id === 'd_guardhouse' || c.name.includes('Guardhouse') || c.name.includes('Sipho')) {
            return false;
          }
        }
        if (activeFirstName === 'Thabo' || c.id === 'd_thabo') {
          if (c.name.includes('Thabo')) return false;
        }
        if (activeFirstName === 'Marcus' || c.id === 'd_admin') {
          if (c.name.includes('Marcus')) return false;
        }
        if (activeFirstName === 'Sarah' || c.id === 'd_sarah') {
          if (c.name.includes('Sarah')) return false;
        }
        if (activeFullName && c.name === activeFullName) {
          return false;
        }
      }

      // 2. Role-Based Channel & DM Visibility Scope
      if (userRole === 'Security Guard') {
        if (c.type === 'group') {
          return c.id === 'ch_safety_ops' || c.id === 'ch_gate_dispatch';
        }
        if (c.type === 'direct') {
          return c.id === 'd_admin' || c.id === 'd_sarah' || c.name.includes('Marcus') || c.name.includes('Sarah');
        }
        return true;
      }

      // Hide tactical #safety-operations from regular Residents
      if (c.id === 'ch_safety_ops' && userRole === 'Resident') return false;

      // Filter private direct chats for regular users
      if (c.type === 'direct') {
        if (c.id === 'd_guardhouse') return true;
        if (canAccessPrivateChat) {
          return canAccessPrivateChat('Resident', c.name);
        }
      }

      return true;
    });
  }, [conversations, currentUser, userRole, canAccessPrivateChat]);
}

export default useFilteredContacts;
