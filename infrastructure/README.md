# Infrastructure

## Overview

The infrastructure directory contains cloud infrastructure definitions, deployment configurations, and Infrastructure as Code (IaC) resources for the Community Cloud Platform targeting **Amazon Web Services (AWS)**.

---

## Infrastructure as Code (IaC)

The cloud architecture is defined using **Terraform** in `infrastructure/terraform/`.

Provisioned Resources:
- Custom AWS Virtual Private Cloud (VPC) & Subnets
- Internet Gateway & Routing Tables
- Security Groups for Django Backend & PostgreSQL
- Amazon S3 Bucket for frontend hosting and media uploads

---

## Terraform Provisioning Steps

1. Navigate to the terraform directory:
   ```bash
   cd infrastructure/terraform
   ```

2. Initialize Terraform and install provider plugins:
   ```bash
   terraform init
   ```

3. Review execution plan:
   ```bash
   terraform plan
   ```

4. Apply configuration to provision AWS resources:
   ```bash
   terraform apply
   ```