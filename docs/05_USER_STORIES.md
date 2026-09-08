# CommuniKey - User Stories

**Version:** 3.0
**Last Updated:** 7 September 2026

---

# Introduction

CommuniKey serves one residential estate: Riverside Estate. The platform
exists to solve fragmented communication. Today an estate's information is
scattered across a WhatsApp group nobody reads, a noticeboard at the gate, a
phone call to the guardhouse and a Facebook page. Nothing is verified and
nothing leaves a record.

These stories describe a single, verified channel where an announcement is
published once and reaches everyone, an incident is reported once and is
visible to the people who can act on it, and every action leaves an audit
trail the estate can report on afterwards.

Scope note: this is a single-estate platform. There is no community search,
join or leave flow, because there is only one community. Multi-tenancy is
listed under future work.

---

# Roles

| Role | Who they are |
|---|---|
| Resident | Lives at a verified address in the estate |
| Safety Volunteer | A resident who responds to alerts and walks patrol |
| Estate Administrator | Manages membership, publishes notices, reads reporting |
| Security Guard | Staffs the gate and verifies visitor passes |

---

# Accounts and verification

### US-001
**As a new resident, I want to register with my street address so that estate
management can confirm I live here.**

### US-002
**As a new resident, I want to upload proof of residence so that my
application can be verified against the resident register.**

### US-003
**As a resident, I want to sign in securely so that estate information is not
visible to outsiders.**

### US-004
**As a resident, I want to reset my password so that I can regain access.**

### US-005
**As a resident, I want to keep my address and phone number current so that
patrols can reach me in an emergency.**

### US-006
**As an estate administrator, I want to review a pending application and its
supporting document so that only genuine residents gain access.**

### US-007
**As an estate administrator, I want to approve or decline an application so
that the register stays accurate.**

---

# Notices

### US-008
**As an estate administrator, I want to publish a notice once so that every
verified resident receives it through one channel.**

### US-009
**As an estate administrator, I want to mark a notice as high priority so
that urgent items also trigger an alert.**

### US-010
**As a resident, I want to read estate notices in one place so that I am not
relying on a group chat I may have muted.**

### US-011
**As a resident, I want to filter notices by priority so that I can find
urgent items quickly.**

---

# Incidents

### US-012
**As a resident, I want to report an incident with a type and location so
that it reaches the people who can act on it.**

### US-013
**As a resident, I want to see the status of a report I submitted so that I
know whether it is being dealt with.**

### US-014
**As a safety volunteer, I want to see incoming reports so that I can triage
what needs a response.**

### US-015
**As a safety volunteer, I want to move a report to under review or resolved
so that its status reflects reality.**

### US-016
**As an estate administrator, I want to see the oldest reports still open so
that nothing is quietly forgotten.**

---

# Emergency

### US-017
**As a resident, I want to raise an SOS alert so that volunteers and the
guardhouse are notified immediately.**

### US-018
**As a resident, I want a short countdown before the alert is sent so that I
can cancel an accidental trigger.**

### US-019
**As a resident, I want to choose whether my location is shared so that I
stay in control of my privacy.**

### US-020
**As a safety volunteer, I want to move an alert through acknowledged, en
route, on scene and resolved so that everyone can see where the response is.**

---

# Access control

### US-021
**As a resident, I want to issue a visitor pass so that my guest is expected
at the gate.**

### US-022
**As a security guard, I want to verify a pass at the gate so that only
expected visitors are admitted.**

### US-023
**As a safety volunteer, I want to log patrol check-ins by zone so that
coverage is recorded.**

---

# Reporting

### US-024
**As an estate administrator, I want to see how many incidents were reported
and how many were closed so that I can judge whether the estate is coping.**

### US-025
**As an estate administrator, I want to see the typical time taken to close a
report so that I can spot categories that drag.**

### US-026
**As an estate administrator, I want to see what gets reported and where so
that patrol effort can be targeted.**

### US-027
**As an estate administrator, I want to see when reports come in across the
day so that volunteer shifts can be scheduled around demand.**

### US-028
**As an estate administrator, I want to change the reporting period so that I
can compare a week against a quarter.**

### US-029
**As an estate administrator, I want an audit trail of platform activity so
that decisions can be accounted for.**

---

# Directory

### US-030
**As a resident, I want to see who else is verified in the estate so that I
know who my neighbours are.**

### US-031
**As a resident, I want other residents' contact details to be partly masked
so that my privacy is protected.**

---

# Future work

Deliberately out of scope for this release:

- Multi-estate tenancy, with community search and join
- Direct messaging between residents. Free-form chat is another silo, and
  would work against the single verified channel this platform is for
- Native mobile applications
- Payment and levy management

---

# Summary

31 stories across seven areas and four roles. Every story listed above is
implemented in the application, which is the point: the scope was cut to
match what genuinely works rather than describing an aspiration.
