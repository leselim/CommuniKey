# Community Cloud Platform - Cloud Design

**Version:** 2.0

---

# Cloud Provider

Amazon Web Services (AWS)

---

# Cloud Architecture

Internet

↓

Amazon S3 (React Frontend)

↓

Amazon EC2 (Django REST API)

↓

PostgreSQL Database

↓

Amazon S3 (Images & Documents)

---

# AWS Services

## Amazon EC2

Hosts the Django backend application.

Responsibilities:

- Business logic
- REST API
- Authentication
- Database connection

---

## Amazon S3

Stores:

- Frontend application
- User profile images
- Incident photos
- Community documents

---

## AWS IAM

Provides secure identity and access management.

---

## Security Groups

Control inbound and outbound network traffic.

---

# Infrastructure as Code

Terraform will provision AWS infrastructure.

---

# Containerisation

Docker will package the backend application.

---

# CI/CD

GitHub Actions will automate:

- Build
- Testing
- Deployment

---

# Future Cloud Services

Future versions may include:

- Amazon CloudWatch
- Amazon RDS
- Route 53
- AWS Certificate Manager

---

# Deployment Goals

- Scalability
- Security
- High availability
- Low operational cost