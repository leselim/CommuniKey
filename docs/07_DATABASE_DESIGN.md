# Community Cloud Platform - Database Design

**Version:** 1.0  
**Last Updated:** 26 July 2026

---

# 1. Introduction

This document defines the initial database design for the Community Cloud Platform.

The platform will use a relational database to store structured information relating to users, communities, announcements, incidents, events, notifications, and emergency alerts.

The design is intended to support scalability, maintainability, and future feature expansion.

---

# 2. Database Overview

The Community Cloud Platform stores information about:

- Users
- Communities
- Memberships
- Announcements
- Incident Reports
- SOS Alerts
- Events
- Notifications
- Comments
- Roles

---

# 3. Core Entities

## 3.1 Users

Stores all registered platform users.

### Attributes

- User ID (Primary Key)
- First Name
- Last Name
- Email Address
- Password (hashed)
- Phone Number
- Profile Picture
- Address
- Status
- Date Created
- Last Login

---

## 3.2 Communities

Stores information about communities.

### Attributes

- Community ID (Primary Key)
- Community Name
- Description
- Province
- City
- Suburb
- Postal Code
- Community Type
- Date Created

---

## 3.3 Community Membership

Links users to communities.

### Attributes

- Membership ID (Primary Key)
- User ID (Foreign Key)
- Community ID (Foreign Key)
- Membership Status
- Join Date
- Approval Date

---

## 3.4 Roles

Defines platform permissions.

### Attributes

- Role ID (Primary Key)
- Role Name
- Description

Example Roles

- Resident
- Community Administrator
- Safety Volunteer
- System Administrator

---

## 3.5 Announcements

Stores official community announcements.

### Attributes

- Announcement ID
- Community ID
- Created By
- Title
- Content
- Date Published
- Last Updated

---

## 3.6 Incident Reports

Stores community incident reports.

### Attributes

- Incident ID
- Community ID
- User ID
- Incident Type
- Description
- Image URL
- Latitude
- Longitude
- Status
- Date Reported

---

## 3.7 SOS Alerts

Stores emergency alerts.

### Attributes

- SOS ID
- User ID
- Community ID
- Latitude
- Longitude
- Status
- Time Activated
- Time Resolved

---

## 3.8 Events

Stores community events.

### Attributes

- Event ID
- Community ID
- Created By
- Event Name
- Description
- Event Date
- Event Location
- Maximum Attendees

---

## 3.9 Notifications

Stores notifications sent to users.

### Attributes

- Notification ID
- User ID
- Notification Type
- Title
- Message
- Read Status
- Date Sent

---

## 3.10 Community Feed Posts

Stores community discussions.

### Attributes

- Post ID
- Community ID
- User ID
- Post Content
- Image URL
- Date Posted

---

## 3.11 Comments

Stores comments on community posts.

### Attributes

- Comment ID
- Post ID
- User ID
- Comment
- Date Posted

---

# 4. Entity Relationships

The following relationships exist within the database.

## Users

A User can:

- Join many Communities
- Create many Posts
- Submit many Incident Reports
- Trigger many SOS Alerts
- Receive many Notifications
- Attend many Events

---

## Communities

A Community can contain:

- Many Users
- Many Announcements
- Many Incidents
- Many Events
- Many Posts

---

## Posts

Each Post:

- Belongs to one Community
- Is created by one User
- Can have many Comments

---

## Comments

Each Comment:

- Belongs to one Post
- Is created by one User

---

## Events

Each Event:

- Belongs to one Community
- Is created by one Administrator

---

## Incident Reports

Each Incident:

- Belongs to one Community
- Is submitted by one User

---

## SOS Alerts

Each SOS Alert:

- Belongs to one User
- Belongs to one Community

---

# 5. Relationship Summary

| Entity | Relationship | Entity |
|---------|--------------|--------|
| User | Many-to-Many | Community (through Memberships) |
| Community | One-to-Many | Announcements |
| Community | One-to-Many | Events |
| Community | One-to-Many | Incident Reports |
| Community | One-to-Many | Feed Posts |
| User | One-to-Many | Incident Reports |
| User | One-to-Many | Notifications |
| User | One-to-Many | SOS Alerts |
| Post | One-to-Many | Comments |

---

# 6. Future Database Tables

Future versions of the platform may introduce additional tables such as:

- Local Businesses
- Marketplace Listings
- Business Reviews
- AI Conversations
- Polls
- Poll Votes
- Visitor Management
- Volunteers
- Emergency Responders
- IoT Devices
- Sensor Readings
- Municipality Requests

---

# 7. Database Considerations

The database should support:

- Secure authentication
- Fast search performance
- Scalable cloud deployment
- Data encryption
- Backup and disaster recovery
- High availability
- Role-based access control

---

# 8. Planned Database Technology

The initial implementation is expected to use:

- PostgreSQL
- SQL
- Cloud-hosted managed database service
- Automated backups

---

# 9. Conclusion

This database design provides the foundation for storing and managing all core platform data. It supports the MVP requirements while allowing the platform to grow with additional features and services in future releases.