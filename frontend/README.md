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
- **Icons:** Lucide React
- **Styling:** Modular CSS3 Design Tokens
- **Routing:** React Router v6

---

## Directory Structure

```text
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Reusable UI components (Navbar, SOSButton)
│   ├── pages/            # View pages (Dashboard, Incidents)
│   ├── services/         # API client setup (api.js)
│   ├── App.jsx           # Root layout component
│   ├── index.js          # DOM rendering entrypoint
│   └── index.css         # Modern dark-mode global stylesheet
└── package.json
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