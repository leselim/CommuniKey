# Community Cloud Platform - Entity Relationship Diagram (ERD)

**Version:** 1.0  
**Last Updated:** 26 July 2026

---

# 1. Introduction

This document describes the Entity Relationship Diagram (ERD) for the Community Cloud Platform.

The ERD illustrates how the platform's database entities relate to one another and serves as the foundation for database implementation.

---

# 2. Main Entities

The core database entities are:

- Users
- Roles
- Communities
- Community Memberships
- Announcements
- Incident Reports
- SOS Alerts
- Events
- Community Feed Posts
- Comments
- Notifications

---

# 3. Entity Relationships

## Users ↔ Roles

Relationship:

**Many Users belong to one Role**

Example:

- Resident
- Community Administrator
- Safety Volunteer
- System Administrator

```
Role
 │
 └──────< User
```

---

## Users ↔ Communities

Relationship:

**Many Users can belong to many Communities**

This relationship is handled by the **Community Membership** table.

```
Users
   │
   │
Community Membership
   │
   │
Communities
```

---

## Communities ↔ Announcements

Relationship:

One Community

↓

Many Announcements

```
Community
    │
    ├──────< Announcement
```

---

## Communities ↔ Events

Relationship:

One Community

↓

Many Events

```
Community
    │
    ├──────< Event
```

---

## Communities ↔ Incident Reports

Relationship:

One Community

↓

Many Incident Reports

```
Community
    │
    ├──────< Incident Report
```

---

## Communities ↔ Community Feed Posts

Relationship:

One Community

↓

Many Posts

```
Community
    │
    ├──────< Feed Post
```

---

## Users ↔ Community Feed Posts

Relationship:

One User

↓

Many Posts

```
User
 │
 └──────< Feed Post
```

---

## Feed Posts ↔ Comments

Relationship:

One Post

↓

Many Comments

```
Feed Post
    │
    ├──────< Comment
```

---

## Users ↔ Comments

Relationship:

One User

↓

Many Comments

```
User
 │
 └──────< Comment
```

---

## Users ↔ Incident Reports

Relationship:

One User

↓

Many Incident Reports

```
User
 │
 └──────< Incident Report
```

---

## Users ↔ SOS Alerts

Relationship:

One User

↓

Many SOS Alerts

```
User
 │
 └──────< SOS Alert
```

---

## Communities ↔ SOS Alerts

Relationship:

One Community

↓

Many SOS Alerts

```
Community
     │
     └──────< SOS Alert
```

---

## Users ↔ Notifications

Relationship:

One User

↓

Many Notifications

```
User
 │
 └──────< Notification
```

---

# 4. High-Level ERD

```
                   +-------------+
                   |    Roles    |
                   +-------------+
                          |
                          |
                          v
                     +---------+
                     |  Users  |
                     +---------+
                          |
      -----------------------------------------
      |         |          |         |        |
      |         |          |         |        |
      v         v          v         v        v
 Membership  Incidents   Posts     SOS   Notifications
      |                    |
      |                    |
      v                    v
 Communities ---------> Comments
      |
      |
      |-------> Announcements
      |
      |-------> Events
```

---

# 5. Cardinality Summary

| Relationship | Cardinality |
|--------------|-------------|
| Role → Users | One-to-Many |
| User → Membership | One-to-Many |
| Community → Membership | One-to-Many |
| Community → Announcements | One-to-Many |
| Community → Events | One-to-Many |
| Community → Incident Reports | One-to-Many |
| Community → Feed Posts | One-to-Many |
| User → Feed Posts | One-to-Many |
| Feed Post → Comments | One-to-Many |
| User → Comments | One-to-Many |
| User → Incident Reports | One-to-Many |
| User → SOS Alerts | One-to-Many |
| Community → SOS Alerts | One-to-Many |
| User → Notifications | One-to-Many |

---

# 6. Future Database Expansion

The ERD is expected to expand as new platform features are introduced.

Potential future entities include:

- Marketplace Listings
- Local Businesses
- Business Reviews
- Volunteers
- Emergency Responders
- Municipality Requests
- Polls
- Poll Votes
- Visitor Management
- AI Conversations
- IoT Devices
- Sensor Data

---

# 7. Notes

This ERD represents the logical design of the Community Cloud Platform database.

The physical database implementation may evolve as development progresses, but the relationships described in this document provide the core structure for the MVP.