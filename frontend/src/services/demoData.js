/**
 * Local demo data.
 *
 * The backend API routes described in docs/12_API_DESIGN.md are still
 * scaffolds during the current project phase, so the UI falls back to this
 * data whenever an endpoint is unavailable. Field names follow the entity
 * attributes in docs/07_DATABASE_DESIGN.md.
 */

const DAY = 24 * 60 * 60 * 1000;

const isoDaysFromNow = (days) => new Date(Date.now() + days * DAY).toISOString();

export const community = {
  id: 1,
  community_name: 'Riverside Estate',
  suburb: 'Riverside',
  city: 'Pretoria',
  province: 'Gauteng',
  member_count: 248,
};

export const profile = {
  id: 1,
  first_name: 'Resident',
  last_name: 'Member',
  email: 'resident@example.com',
  phone_number: '+27 82 000 0000',
  address: '14 Riverside Drive',
  role: 'Resident',
  notify_emergency: true,
  notify_events: true,
  notify_announcements: true,
  share_location: true,
};

export const announcements = [
  {
    id: 1,
    title: 'Neighbourhood Watch general meeting',
    content:
      'The quarterly Neighbourhood Watch meeting takes place on Saturday at 10:00 in the clubhouse. Patrol schedules and the new gate access procedure will be discussed.',
    created_by: 'Community Administrator',
    date_published: isoDaysFromNow(-1),
    priority: 'normal',
  },
  {
    id: 2,
    title: 'Planned water interruption on Tuesday',
    content:
      'The municipality will interrupt supply between 09:00 and 15:00 on Tuesday for pipe replacement work on Riverside Drive. Please store water in advance.',
    created_by: 'Community Administrator',
    date_published: isoDaysFromNow(-3),
    priority: 'high',
  },
  {
    id: 3,
    title: 'New visitor access procedure',
    content:
      'Visitors must now be pre-registered at the gate. Residents can register a visitor up to 24 hours before arrival.',
    created_by: 'Community Administrator',
    date_published: isoDaysFromNow(-9),
    priority: 'normal',
  },
];

export const incidents = [
  {
    id: 1,
    incident_type: 'Suspicious activity',
    description:
      'Unfamiliar vehicle parked at the corner of Riverside Drive and Mill Road for over an hour.',
    status: 'Under review',
    date_reported: isoDaysFromNow(-0.4),
    reported_by: 'Resident Member',
    location: 'Riverside Drive',
  },
  {
    id: 2,
    incident_type: 'Streetlight fault',
    description: 'Three streetlights out between house 22 and the park entrance.',
    status: 'Reported',
    date_reported: isoDaysFromNow(-2),
    reported_by: 'Resident Member',
    location: 'Mill Road',
  },
  {
    id: 3,
    incident_type: 'Attempted break-in',
    description:
      'Damage to a back gate latch reported overnight. Security patrol has increased night rounds in the section.',
    status: 'Resolved',
    date_reported: isoDaysFromNow(-6),
    reported_by: 'Safety Volunteer',
    location: 'Section C',
  },
  {
    id: 4,
    incident_type: 'Suspicious activity',
    description: 'Tailgating incident reported at main security gate entry.',
    status: 'Resolved',
    date_reported: isoDaysFromNow(-14),
    reported_by: 'Gate Security',
    location: 'Riverside Drive Gate',
  },
  {
    id: 5,
    incident_type: 'Suspicious activity',
    description: 'Person looking over boundary wall near north perimeter.',
    status: 'Resolved',
    date_reported: isoDaysFromNow(-28),
    reported_by: 'Resident Member',
    location: 'Riverside Drive',
  },
  {
    id: 6,
    incident_type: 'Streetlight fault',
    description: 'Power surge blew streetlight transformer on Mill Road.',
    status: 'Resolved',
    date_reported: isoDaysFromNow(-42),
    reported_by: 'Maintenance Team',
    location: 'Mill Road',
  },
  {
    id: 7,
    incident_type: 'Noise disturbance',
    description: 'Loud music past 23:00 near clubhouse area.',
    status: 'Resolved',
    date_reported: isoDaysFromNow(-55),
    reported_by: 'Resident Member',
    location: 'Section B',
  },
];

export const events = [
  {
    id: 1,
    event_name: 'Neighbourhood Watch meeting',
    description: 'Quarterly meeting covering patrol schedules and gate access.',
    event_date: isoDaysFromNow(3),
    event_location: 'Riverside Clubhouse',
    max_attendees: 80,
    attending: false,
  },
  {
    id: 2,
    event_name: 'Community clean-up morning',
    description: 'Bring gloves and bags. Refreshments provided at the park.',
    event_date: isoDaysFromNow(9),
    event_location: 'Riverside Park',
    max_attendees: 60,
    attending: true,
  },
  {
    id: 3,
    event_name: 'Emergency preparedness workshop',
    description: 'Basic first aid and fire safety training run by local responders.',
    event_date: isoDaysFromNow(18),
    event_location: 'Riverside Clubhouse',
    max_attendees: 40,
    attending: false,
  },
];

export const notifications = [
  {
    id: 1,
    notification_type: 'incident',
    title: 'Incident update',
    message: 'Your suspicious activity report is now under review.',
    read_status: false,
    date_sent: isoDaysFromNow(-0.2),
  },
  {
    id: 2,
    notification_type: 'announcement',
    title: 'New announcement',
    message: 'Neighbourhood Watch general meeting on Saturday at 10:00.',
    read_status: false,
    date_sent: isoDaysFromNow(-1),
  },
  {
    id: 3,
    notification_type: 'event',
    title: 'Event reminder',
    message: 'Community clean-up morning starts in one week.',
    read_status: true,
    date_sent: isoDaysFromNow(-2),
  },
];

export const INCIDENT_TYPES = [
  'Suspicious activity',
  'Attempted break-in',
  'Vandalism',
  'Streetlight fault',
  'Road hazard',
  'Lost pet',
  'Other',
];

export const INCIDENT_STATUSES = ['Reported', 'Under review', 'Resolved'];
