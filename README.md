# CommuniKey

A production-ready, cloud-native community engagement platform designed to provide residents with a secure, centralised hub for communication, safety, emergency response, and neighbourhood collaboration.

The platform replaces fragmented communication channels such as WhatsApp groups by providing structured announcements, emergency alerts, incident reporting, community events, and role-based administration.

---

## Project Status

**Current Phase:** Production-Ready MVP Complete

---

## Core Features

- **Emergency SOS Distress Button:** Real-time activation with location dispatch to neighbourhood patrol.
- **Incident Reporting & Status Tracking:** Log suspicious activity, streetlight faults, or hazards with automated triage.
- **Official Community Announcements:** Priority-sorted noticeboard for management alerts and municipality updates.
- **Event Scheduling & RSVPs:** Community event calendar with attendance tracking.
- **Role-Based Administration & Moderation:** Granular RBAC supporting Residents, Estate Administrators, Safety Volunteers, and System Administrators.
- **Privacy-First Messaging & Profiling:** Redacted sensitive details (gate codes, emergency notes) based on persona permissions.

---

## Technology Stack

- **Frontend:** React 18, React Router v6, Axios, Modular Dark-Mode CSS Design Tokens.
- **Backend:** Python 3.11+, Django 4.2, Django REST Framework, SimpleJWT Authentication.
- **Database:** SQLite (local dev) / PostgreSQL (production).
- **Testing:** Django TestCase suite (13 unit tests), React Testing Library / Jest.
- **DevOps & Cloud:** Docker, Terraform, GitHub Actions, AWS Free Tier compatible.

---

## Local Setup & Development

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed sample data
python3 manage.py makemigrations authentication communities announcements incidents events emergency
python3 manage.py migrate
python3 manage.py seed_data

# Start Django backend server
python3 manage.py runserver
```
The Django REST API will be accessible at `http://localhost:8000/api/v1/`.

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start React development server
npm start
```
The application UI will be accessible at `http://localhost:3000`.

---

## Running Automated Tests

### Backend Unit Tests
```bash
cd backend
python3 manage.py test
```

### Frontend Unit Tests
```bash
cd frontend
npm test -- --watchAll=false
```

### Production Build
```bash
cd frontend
npm run build
```

---

## Repository Structure

```text
CommuniKey/
├── backend/                  # Django REST Framework backend API
│   ├── apps/                 # Modular Django apps (auth, communities, incidents, announcements, events, emergency)
│   ├── config/               # Settings, WSGI, root URL routing
│   └── manage.py
├── frontend/                 # React 18 SPA frontend
│   ├── src/
│   │   ├── components/       # Reusable modular UI components
│   │   ├── context/          # AuthContext and RBAC logic
│   │   ├── pages/            # Views (Dashboard, Incidents, Announcements, Events, Members, Profile, etc.)
│   │   └── services/         # API client & local demo data fallback
│   └── package.json
├── docs/                     # Full system architecture, ERD, and API design specifications
└── README.md
```

---

## License

This project is developed for educational and portfolio purposes.

## Repository Verification

**Verification Code:** `WTC-59PV9ZVN`