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

export const members = [
  {
    id: 1,
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'Estate Administrator',
    email: 'marcus.vance@riverside.co.za',
    phone_number: '+27 82 111 2020',
    address: '1 Clubhouse Way, Section A',
    status: 'Verified',
    joined_date: 'January 2024 (28 Months)',
    emergency_role: 'Estate Management Office',
    household_vehicle: 'Black Toyota Fortuner (Reg: RS 10 GP)',
    gate_access_code: 'GATE-ADMIN-001',
    emergency_notes: 'Main security desk coordinator. Access to estate control room.',
    events_attended: 24,
  },
  {
    id: 3,
    first_name: 'Sarah',
    last_name: 'Jenkins',
    role: 'Safety Volunteer',
    email: 'sarah.j@riverside.co.za',
    phone_number: '+27 83 456 7890',
    address: '8 Mill Road, Section B',
    status: 'Verified',
    joined_date: 'March 2024 (26 Months)',
    emergency_role: 'Neighborhood Watch / Safety Patrol',
    household_vehicle: 'Silver Ford Ranger (Reg: PATROL 01 GP)',
    gate_access_code: 'GATE-VOL-003',
    emergency_notes: 'Section B night patrol lead.',
    events_attended: 15,
  },
  {
    id: 4,
    first_name: 'Thabo',
    last_name: 'Mokoena',
    role: 'Resident',
    email: 'thabo.mokoena@riverside.co.za',
    phone_number: '+27 82 459 1029',
    address: '22 Riverside Drive, Section A',
    status: 'Verified',
    joined_date: 'January 2025 (18 Months)',
    emergency_role: null,
    household_vehicle: 'Silver Volkswagen Polo (Reg: AB 42 CD GP)',
    gate_access_code: 'GATE-KEY-8841',
    emergency_notes: 'Pets on property (2 dogs in back yard). Preferred contact: SMS & Chat.',
    events_attended: 12,
  },
  {
    id: 5,
    first_name: 'Elena',
    last_name: 'Rostova',
    role: 'Resident',
    email: 'elena.rostova@riverside.co.za',
    phone_number: '+27 82 654 9911',
    address: '16 Mill Road, Section B',
    status: 'Verified',
    joined_date: 'June 2024 (22 Months)',
    emergency_role: null,
    household_vehicle: 'Blue Hyundai i20 (Reg: EL 88 GP)',
    gate_access_code: 'GATE-KEY-9912',
    emergency_notes: 'Resident available for block announcements.',
    events_attended: 9,
  },
];

export const directMessages = [
  {
    id: 1,
    sender_name: 'Thabo Mokoena',
    recipient_role: 'Community Administrator',
    recipient_name: 'Marcus Vance',
    category: 'Urgent Neighbor Emergency',
    message: 'Water leak from property gate onto main road. Please notify maintenance.',
    status: 'In Progress',
    date_sent: isoDaysFromNow(-0.1),
    response: 'Maintenance team dispatched. Issue under control.',
  },
  {
    id: 2,
    sender_name: 'Elena Rostova',
    recipient_role: 'System Administrator',
    recipient_name: 'David Chen',
    category: 'Report Misconduct / Complaint',
    message: 'Persistent late night disturbance near section boundary. Requesting admin review.',
    status: 'Awaiting Response',
    date_sent: isoDaysFromNow(-0.5),
    response: '',
  },
];

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
    title: 'Neighbourhood Watch Briefing',
    event_name: 'Neighbourhood Watch Briefing',
    description: 'Quarterly briefing covering night patrol schedules and security gate access.',
    event_date: isoDaysFromNow(3),
    venue: 'Estate Clubhouse',
    location: 'Estate Clubhouse',
    event_location: 'Estate Clubhouse',
    organiser: 'Safety Committee',
    time: '18:30 to 19:30',
    attendees_count: 14,
    status: 'RSVP Open | 14 Attending',
    max_attendees: 80,
    attending: false,
  },
  {
    id: 2,
    title: 'Spring Park Clean Up',
    event_name: 'Spring Park Clean Up',
    description: 'Bring gardening gloves and bags. Refreshments provided at the pavilion.',
    event_date: isoDaysFromNow(9),
    venue: 'North Park Pavilion',
    location: 'North Park Pavilion',
    event_location: 'North Park Pavilion',
    organiser: 'Social Committee',
    time: '08:30 to 11:00',
    attendees_count: 28,
    status: 'RSVP Open | 28 Attending',
    max_attendees: 60,
    attending: true,
  },
  {
    id: 3,
    title: 'Home Fire Safety Workshop',
    event_name: 'Home Fire Safety Workshop',
    description: 'Basic home fire safety and first aid training run by local responders.',
    event_date: isoDaysFromNow(18),
    venue: 'Community Hall',
    location: 'Community Hall',
    event_location: 'Community Hall',
    organiser: 'Safety Volunteers',
    time: '17:30 to 19:00',
    attendees_count: 9,
    status: 'RSVP Open | 9 Attending',
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
