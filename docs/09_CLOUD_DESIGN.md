# Community Cloud Platform - Cloud Design

**Version:** 2.0

**Last Updated:** 26 July 2026

---

# 1. Introduction

This document outlines the cloud architecture for the Community Cloud Platform.

The platform is designed using cloud-native principles to support scalability, reliability, security, and future growth while remaining suitable for deployment using AWS services.

---

# 2. Cloud Provider

**Amazon Web Services (AWS)**

AWS has been selected because it provides a comprehensive cloud ecosystem, strong support for modern web applications, extensive documentation, and services suitable for educational projects and production systems.

---

# 3. Cloud Design Principles

The platform is designed around the following principles:

- Scalability
- High availability
- Security
- Reliability
- Maintainability
- Cost awareness
- Cloud-native architecture

---

# 4. High Level Cloud Architecture

```
Residents (browser)
        |
        v
CloudFront  ->  S3 (React build, static)
        |
        v
Application Load Balancer
        |
        v
EC2 (Django in Docker)  ->  RDS PostgreSQL (single AZ, private subnet)
        |                        ^
        |                        |
        |                   nightly rollup
        |                        |
        +--> SNS topic --> Lambda (notify_residents) --> SES --> resident inbox
        |
        +--> S3 (verification documents, private, encrypted)
```

---

# 5. AWS Services and Why Each One

| Service | Role in the platform |
|---|---|
| S3 + CloudFront | Serves the compiled React build. Static hosting is cheap, fast and needs no server to patch. |
| EC2 | Runs Django in a container. Chosen over Lambda for the API because a long lived process avoids cold starts against a VPC database. |
| RDS PostgreSQL | System of record. The reporting queries aggregate here rather than in application code. |
| S3 (documents) | Proof of residence uploaded at registration. Private, versioned, encrypted, with a lifecycle rule that expires verification documents after a year. |
| SNS | Decouples publishing a notice from delivering it. Django publishes once and returns. |
| Lambda | Fans a published notice out to every verified resident by email. Event driven and idle most of the day, which is exactly what Lambda is for. |
| SES | Sends the email. Recipients are placed in BCC so residents never see each other's addresses. |
| EventBridge | Schedules the nightly analytics rollup. |
| IAM | A role per component, each scoped to what it actually needs. |
| SSM Parameter Store | Holds the database credentials and Django secret key. Nothing sensitive is baked into an image or a variable file. |

---

# 6. Why Lambda Here and Not Elsewhere

Lambda is used where work is event driven, short lived and spiky:

**Implemented.** Notification fan out. Publishing a notice or raising an SOS
puts one message on an SNS topic. Lambda receives it and sends the email in
batches. Without this, a resident waiting for a page to load would be waiting
on a mail provider, and a batch of two hundred and fifty addresses would time
out the request.

**Designed, not built.** Three further functions follow the same pattern and
are documented for future work:

- Verification document handling. An upload to S3 triggers validation, EXIF
  stripping and preview generation.
- Nightly analytics rollup on an EventBridge schedule, writing pre-aggregated
  rows so dashboards read a summary table instead of scanning the incidents
  table.
- Weekly estate digest, one email summarising the week's notices and incidents.

Lambda is deliberately **not** used to host Django itself. Cold starts, VPC
attachment latency to RDS, and the packaging overhead would cost more than
they return for an API that is queried continuously during the day.

---

# 7. Data Flow for a Published Notice

1. An administrator submits the notice form.
2. Django writes the Announcement row to RDS.
3. Django publishes a JSON message to the SNS topic, then returns. The
   administrator's browser is not waiting on email.
4. SNS invokes the Lambda function.
5. Lambda reads the recipient list, batches it to respect the SES limit of
   fifty destinations per call, and sends with all residents in BCC.
6. Failures are logged to CloudWatch and left to the SNS retry policy, so one
   rejected batch does not lose the rest.

---

# 8. Security

- The database sits in a private subnet with no route to the internet.
- Every bucket blocks public access. Documents are reached through short
  lived presigned URLs, never made public.
- Server side encryption on all buckets, encryption at rest on RDS, TLS in
  transit.
- IAM roles are scoped per component. The notification function can write
  logs and send email, and nothing else.
- Secrets live in Parameter Store, not in environment files or images.

---

# 9. Cost

The architecture is designed to sit inside the AWS Free Tier for the first
twelve months. The item to watch is RDS: the free allowance covers 750 hours
of a single db.t3.micro instance per month, which is one instance running
continuously and no more. Lambda's free tier of one million requests a month
is far beyond anything this estate will generate.
