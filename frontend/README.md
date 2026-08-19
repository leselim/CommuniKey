# Frontend

## Overview

The frontend provides the user interface for the Community Cloud Platform. It is built as a single-page web application using React.

Key user capabilities:
- Interactive dashboard for community alerts
- Instant Emergency SOS button dispatch
- Incident reporting with status tracking
- Community announcement feed & event calendar
- Profile & notification settings management

---

## Technology Stack

- **Framework:** React 18
- **HTTP Client:** Axios (configured with JWT auth interceptor)
- **Styling:** Modular CSS3 Design Tokens
- **Typefaces:** IBM Plex Sans and IBM Plex Mono
- **Routing:** React Router v6

---

## Directory Structure

```text
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Reusable UI (Navbar, SOSButton, Notifications, Modal, StatusBadge)
│   ├── pages/            # View pages (Dashboard, Incidents, Announcements, Events, Profile)
│   ├── hooks/            # Data hooks (useCollection)
│   ├── services/         # API client (api.js) and local demo data
│   ├── utils/            # Date formatting helpers
│   ├── App.jsx           # Root layout and route definitions
│   ├── index.js          # DOM rendering entrypoint
│   └── index.css         # Modern dark-mode global stylesheet
└── package.json
```

---

## Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Dashboard | Emergency SOS, community figures, latest announcements, recent incidents, next event |
| `/incidents` | Incidents | Report an incident and track report status |
| `/announcements` | Announcements | Search and read official announcements |
| `/events` | Events | Month calendar, upcoming events and RSVP |
| `/profile` | Profile | Personal details and notification settings |

---

## Design System

All colour, spacing, radius, typography and elevation values are declared once as CSS
custom properties on `:root` in `src/index.css`. Components reference the tokens only,
so the theme can be adjusted from a single place.

**Colour.** Two signals carry meaning and nothing else is coloured:

| Token | Value | Meaning |
|-------|-------|---------|
| `--signal` | `#d1462c` | Emergency and priority: SOS, urgent announcements |
| `--affirm` | `#7f9c86` | Settled state: resolved, verified, attending |
| `--ink` / `--panel` | `#0d0f0f` / `#121514` | Graphite grounds with a faint green bias |
| `--paper` / `--dim` / `--faint` | `#e9ecea` / `#929894` / `#666c68` | Three-step text scale |

Because the palette is otherwise neutral, a red marker on screen always means an
emergency, which matters on a safety platform.

**Type.** IBM Plex Sans for interface text and IBM Plex Mono for anything measured:
times, dates, coordinates and counts. Figures use tabular numerals so columns align.

**Layout.** Hairline rules and whitespace instead of boxes and drop shadows. A single
1120px column, a sticky top bar, and two-column splits that collapse below 880px.

---

## Backend Integration

API calls go through `src/services/api.js`, which targets the versioned base URL defined
in `docs/12_API_DESIGN.md` and attaches the JWT access token from `localStorage`.
Responses are unwrapped from the documented `{ success, message, data }` envelope.

The backend API routes are still scaffolds during the current project phase. Each screen
therefore loads through `useCollection`, which uses the API response when an endpoint
answers and otherwise falls back to the local demo data in `src/services/demoData.js`.
Creates and updates are applied optimistically and mirrored to the API when it is
available, so no screen depends on unimplemented endpoints.

Override the API location with an environment variable:

```bash
REACT_APP_API_URL=http://localhost:8000/api/v1
```

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local development server:
   ```bash
   npm start
   ```
   Access the app at `http://localhost:3000`.
