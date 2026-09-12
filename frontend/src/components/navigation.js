/*
 * Navigation by role.
 *
 * Each role sees its own application, so a resident never sees moderation
 * tools and a guard sees the gate terminal first. Items are grouped the way
 * the work is organised on an estate, and labels are written the way a
 * person would say them out loud.
 */

export const ROLE_NAV = {
  Resident: [
    { group: 'Home', items: [{ to: '/', label: 'Home', icon: 'home' }] },
    { group: 'Safety', items: [{ to: '/incidents', label: 'Incidents', icon: 'alert' }] },
    {
      group: 'Community',
      items: [
        { to: '/announcements', label: 'Notices', icon: 'megaphone' },
        { to: '/events', label: 'Events', icon: 'calendar' },
        { to: '/directory', label: 'Directory', icon: 'users' },
      ],
    },
  ],
  'Safety Volunteer': [
    {
      group: 'Response',
      items: [
        { to: '/', label: 'Dispatch', icon: 'activity' },
        { to: '/volunteer/triage', label: 'Triage', icon: 'shield' },
        { to: '/volunteer/patrol', label: 'Patrol', icon: 'route' },
      ],
    },
    { group: 'Insight', items: [{ to: '/insights', label: 'Reporting', icon: 'chart' }] },
    {
      group: 'Community',
      items: [
        { to: '/announcements', label: 'Notices', icon: 'megaphone' },
        { to: '/events', label: 'Events', icon: 'calendar' },
        { to: '/directory', label: 'Directory', icon: 'users' },
      ],
    },
  ],
  'Estate Administrator': [
    { group: 'Home', items: [{ to: '/admin', label: 'Overview', icon: 'grid' }] },
    {
      group: 'Estate operations',
      items: [
        { to: '/admin/incidents', label: 'Incidents', icon: 'alert' },
        { to: '/admin/moderation', label: 'Members', icon: 'userCheck' },
      ],
    },
    {
      group: 'Communication',
      items: [
        { to: '/admin/announcements', label: 'Notices', icon: 'megaphone' },
        { to: '/admin/events', label: 'Events', icon: 'calendar' },
      ],
    },
    {
      group: 'Insight',
      items: [
        { to: '/insights', label: 'Reporting', icon: 'chart' },
        { to: '/directory', label: 'Directory', icon: 'users' },
      ],
    },
  ],
  'Security Guard': [
    { group: 'Gate', items: [{ to: '/', label: 'Gate terminal', icon: 'gate' }] },
    { group: 'Safety', items: [{ to: '/incidents', label: 'Incidents', icon: 'alert' }] },
    {
      group: 'Community',
      items: [
        { to: '/events', label: 'Events', icon: 'calendar' },
        { to: '/directory', label: 'Directory', icon: 'users' },
      ],
    },
  ],
};

const HOME_TITLES = {
  Resident: { title: 'Home', icon: 'home' },
  'Estate Administrator': { title: 'Overview', icon: 'grid' },
  'Safety Volunteer': { title: 'Dispatch', icon: 'activity' },
  'Security Guard': { title: 'Gate terminal', icon: 'gate' },
};

const TITLES = {
  '/dashboard': null,
  '/admin': { title: 'Overview', icon: 'grid' },
  '/incidents': { title: 'Incidents', icon: 'alert' },
  '/admin/incidents': { title: 'Incidents', icon: 'alert' },
  '/volunteer/triage': { title: 'Triage', icon: 'shield' },
  '/announcements': { title: 'Notices', icon: 'megaphone' },
  '/admin/announcements': { title: 'Notices', icon: 'megaphone' },
  '/volunteer/alerts': { title: 'Notices', icon: 'megaphone' },
  '/events': { title: 'Events', icon: 'calendar' },
  '/admin/events': { title: 'Events', icon: 'calendar' },
  '/directory': { title: 'Directory', icon: 'users' },
  '/insights': { title: 'Reporting', icon: 'chart' },
  '/volunteer/patrol': { title: 'Patrol', icon: 'route' },
  '/moderation': { title: 'Members', icon: 'userCheck' },
  '/admin/moderation': { title: 'Members', icon: 'userCheck' },
  '/profile': { title: 'Your profile', icon: 'user' },
};

export function titleFor(pathname, role) {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (path === '/' || path === '/dashboard') return HOME_TITLES[role] || HOME_TITLES.Resident;
  return TITLES[path] || { title: 'Page not found', icon: 'info' };
}

export function isActive(pathname, to) {
  const path = pathname.toLowerCase();
  if (to === '/') return path === '/' || path === '/dashboard';
  if (to === '/admin') return path === '/admin';
  return path === to || path.startsWith(`${to}/`);
}
