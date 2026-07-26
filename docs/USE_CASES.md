# Community Cloud Platform - Use Cases

**Version:** 1.0  
**Last Updated:** 26 July 2026

---

# Introduction

This document describes the primary use cases for the Community Cloud Platform.

Use cases explain how different users interact with the system to accomplish specific goals. They provide a detailed description of system behaviour and serve as a foundation for implementation, testing, and future enhancements.

---

# Actors

The platform has four primary actors:

- Resident
- Community Administrator
- Safety Volunteer
- System Administrator

---

# UC-001 - Register an Account

## Primary Actor

Resident

## Goal

Create a new account on the platform.

## Preconditions

- The resident is not already registered.
- The resident has internet access.

## Main Flow

1. Resident selects **Register**.
2. Resident enters personal information.
3. Resident provides an email address.
4. Resident creates a password.
5. System validates the information.
6. System creates the account.
7. Resident receives confirmation.

## Alternative Flow

- Email already exists.
- Password does not meet security requirements.
- Required fields are missing.

## Postconditions

The resident account is successfully created.

---

# UC-002 - Log In

## Primary Actor

Resident

## Goal

Access the platform securely.

## Preconditions

- User account exists.

## Main Flow

1. Resident enters email.
2. Resident enters password.
3. System validates credentials.
4. Resident is redirected to the dashboard.

## Alternative Flow

- Incorrect password.
- Account locked.
- Network unavailable.

## Postconditions

Resident is authenticated.

---

# UC-003 - Join a Community

## Primary Actor

Resident

## Goal

Become a member of a community.

## Preconditions

- Resident is logged in.
- Community exists.

## Main Flow

1. Resident searches for a community.
2. Resident views community information.
3. Resident selects **Join**.
4. Request is sent to administrators.
5. Administrator approves the request.
6. Resident becomes a member.

## Alternative Flow

- Request rejected.
- Community is full.
- Resident already belongs to the community.

## Postconditions

Resident joins the selected community.

---

# UC-004 - Publish an Announcement

## Primary Actor

Community Administrator

## Goal

Share official information with residents.

## Preconditions

- Administrator is authenticated.

## Main Flow

1. Administrator opens announcements.
2. Selects **Create Announcement**.
3. Enters title and content.
4. Publishes announcement.
5. Residents receive notifications.

## Postconditions

Announcement is visible to all community members.

---

# UC-005 - Report an Incident

## Primary Actor

Resident

## Goal

Report a community incident.

## Preconditions

- Resident is logged in.

## Main Flow

1. Resident selects **Report Incident**.
2. Selects incident category.
3. Enters description.
4. Uploads images (optional).
5. Shares location (optional).
6. Submits report.
7. System stores report.
8. Administrator receives notification.

## Alternative Flow

- Image upload fails.
- Required information missing.
- Internet connection lost before submission.

## Postconditions

Incident is successfully recorded.

---

# UC-006 - Trigger SOS Alert

## Primary Actor

Resident

## Goal

Request immediate assistance during an emergency.

## Preconditions

- Resident is logged in.

## Main Flow

1. Resident presses the SOS button.
2. System asks for confirmation.
3. Resident confirms.
4. System records the alert.
5. Nearby community members are notified.
6. Safety volunteers are notified.
7. Administrators are notified.
8. Alert remains active until resolved.

## Alternative Flow

- Resident cancels before confirmation.
- GPS location unavailable.
- Notification service temporarily unavailable.

## Postconditions

Emergency alert is active.

---

# UC-007 - Manage Membership Requests

## Primary Actor

Community Administrator

## Goal

Approve or reject membership requests.

## Preconditions

- Membership requests exist.

## Main Flow

1. Administrator opens pending requests.
2. Reviews resident information.
3. Approves or rejects request.
4. System updates membership.
5. Resident receives notification.

## Postconditions

Membership status is updated.

---

# UC-008 - Create a Community Event

## Primary Actor

Community Administrator

## Goal

Organise a community event.

## Preconditions

- Administrator is logged in.

## Main Flow

1. Administrator creates event.
2. Adds title.
3. Adds description.
4. Selects date and time.
5. Publishes event.
6. Residents receive notifications.

## Postconditions

Event becomes available to community members.

---

# UC-009 - Respond to an Emergency

## Primary Actor

Safety Volunteer

## Goal

Respond to an active SOS alert.

## Preconditions

- Active SOS alert exists.

## Main Flow

1. Volunteer receives notification.
2. Opens alert details.
3. Accepts the response.
4. Travels to the reported location.
5. Updates incident status.
6. Marks incident resolved.

## Postconditions

Emergency response is completed.

---

# UC-010 - Manage Platform

## Primary Actor

System Administrator

## Goal

Maintain the overall platform.

## Preconditions

- Administrator is authenticated.

## Main Flow

1. Administrator accesses the management dashboard.
2. Reviews platform health.
3. Monitors active communities.
4. Reviews reports.
5. Manages user accounts.
6. Performs maintenance tasks.

## Postconditions

Platform continues operating correctly.

---

# Summary

These use cases define the core interactions between users and the Community Cloud Platform. Together with the project requirements and user stories, they provide a clear blueprint for system development, testing, and future enhancements.