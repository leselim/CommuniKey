# Community Cloud Platform

A cloud-native community engagement platform designed to provide residents with a secure, centralised hub for communication, safety, emergency response, and neighbourhood collaboration.

The platform replaces fragmented communication channels (such as informal WhatsApp groups) with a structured, role-based application for announcements, emergency SOS alerts, incident reporting, community discussion feeds, and events.

---

## Technical Stack

- **Backend:** Python 3.11, Django 4.2, Django REST Framework, SimpleJWT (Authentication), Pytest
- **Frontend:** React 18, React Router v6, Axios, Custom CSS Design Tokens (Vanilla CSS)
- **Database:** PostgreSQL (Production / Docker) & SQLite (Local Standalone fallback)
- **Containerization:** Docker & Docker Compose
- **Infrastructure as Code:** HashiCorp Terraform (AWS provider ~> 5.0)
- **CI/CD:** GitHub Actions

---

## AWS Cloud Architecture

The platform infrastructure is defined in `infrastructure/terraform/` using Infrastructure as Code (Terraform):

- **Amazon VPC:** Custom VPC (`10.0.0.0/16`) with Public and Private subnets across multiple availability zones.
- **Amazon EC2:** EC2 Instance in public subnet running Docker/Gunicorn for Backend API hosting.
- **Amazon RDS (PostgreSQL):** Managed PostgreSQL database (`db.t3.micro`) isolated in private subnets with Security Group access restricted to the backend application server.
- **Amazon S3:** Dedicated S3 bucket for frontend asset deployment and media uploads (incident photos, profile pictures).
- **Security Groups:** Granular network isolation allowing HTTP (80), HTTPS (443), API (8000), SSH (22) for EC2, and PostgreSQL (5432) for RDS.

---

## Local Development Setup

### 1. Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL (or SQLite for standalone testing)
- Docker & Docker Compose (optional for containerized execution)

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Backend Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py makemigrations
python backend/manage.py migrate

# Seed Realistic South African Mock Data (Pinelands & Cape Town communities)
python backend/manage.py seed_data

# Start backend development server (Port 8000)
python backend/manage.py runserver 0.0.0.0:8000
```

### Demo Accounts (South African Mock Profiles)

After running `python backend/manage.py seed_data`, you can sign in with the following seeded demo accounts (Password for all demo accounts: `Password123!`):

| Role | Email | Name | Community Focus |
|---|---|---|---|
| Community Admin | `pinelands.admin@communitycloud.co.za` | Sibusiso Dlamini | Pinelands Neighborhood Watch |
| Safety Volunteer | `thabo.mokoena@communitycloud.co.za` | Thabo Mokoena | Pinelands Neighborhood Watch |
| Resident | `fatima.patel@communitycloud.co.za` | Fatima Patel | Pinelands Neighborhood Watch |
| Community Admin | `johan.vandermerwe@communitycloud.co.za` | Johan van der Merwe | Rondebosch Safety Initiative |
| Resident | `nomvula.khumalo@communitycloud.co.za` | Nomvula Khumalo | Woodstock & Observatory Ratepayers |

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start React development server (Port 3000)
npm start
```

Access the application in your browser at `http://localhost:3000`.

---

## Docker Execution

To start the complete application stack (PostgreSQL + Backend API + React Frontend) using Docker Compose:

```bash
docker-compose up --build
```

- **Frontend App:** `http://localhost:3000`
- **Backend API Base:** `http://localhost:8000/api/v1/`
- **PostgreSQL Database:** `localhost:5432`

---

## Running Automated Tests

### Backend Unit & Integration Tests

```bash
# Run pytest test suite
./venv/bin/pytest
```

---

## AWS Deployment with Terraform

### 1. Configure AWS Credentials

Ensure your AWS CLI credentials or environment variables are set:

```bash
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY"
export AWS_DEFAULT_REGION="eu-west-1"
```

### 2. Provision Infrastructure

```bash
cd infrastructure/terraform

# Initialize Terraform plugins
terraform init

# Plan infrastructure changes
terraform plan

# Apply infrastructure deployment
terraform apply -auto-approve
```

Outputs will display the provisioned **EC2 Public IP**, **RDS Endpoint**, and **S3 Bucket Name**.

---

## CI/CD Pipeline

The GitHub Actions workflow in `.github/workflows/ci.yml` automatically triggers on push or pull request to `main` / `develop` branches:

1. **Backend Job:** Installs dependencies, runs database migrations, and executes pytest test suites.
2. **Frontend Job:** Installs Node dependencies and validates React production build (`npm run build`).
3. **Terraform Job:** Runs syntax verification and validation (`terraform validate`).

---

## Troubleshooting

- **Database Connection Failure:** Ensure PostgreSQL service is running on port 5432 or set `USE_POSTGRES=0` in `.env` to fallback to local SQLite.
- **Port 8000 or 3000 Already in Use:** Stop existing processes or modify port bindings in `docker-compose.yml` or dev server commands.
- **JWT Token Expiration:** If an API call returns `401 Unauthorized`, sign in again at `/login` or check `REACT_APP_API_URL` configuration.

---

## Verification Code

`WTC-59PV9ZVN`