# Backend

## Overview

The backend provides the business logic and REST APIs for the Community Cloud Platform. It is built with Django and Django REST Framework.

It is responsible for:

- User authentication & JWT session management
- Community structure & membership roles
- Incident reporting & triage tracking
- Emergency SOS processing
- Community announcements & discussion feeds
- Event scheduling
- Administrative management

---

## Technology Stack

- **Framework:** Python 3.11 / Django 4.2 / Django REST Framework
- **Database:** PostgreSQL 15
- **Authentication:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- **Server:** Gunicorn / Django Development Server

---

## Module Structure

- `apps/authentication/`: Authentication endpoints, JWT generation, user management
- `apps/communities/`: Community creation, membership, user roles
- `apps/announcements/`: Community announcements and push notifications
- `apps/incidents/`: Incident logging, photo attachment, status tracking
- `apps/emergency/`: Immediate SOS distress alert routing
- `apps/events/`: Community event creation, RSVPs, calendars

---

## Local Setup & Development

1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations and start development server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```