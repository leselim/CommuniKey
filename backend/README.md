# Backend - CommuniKey

## Overview

The backend provides the business logic and REST APIs for the CommuniKey platform. It is built with Django and Django REST Framework.

---

## Getting Started

1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run migrations and seed sample data:
   ```bash
   python3 manage.py makemigrations
   python3 manage.py migrate
   python3 manage.py seed_data
   ```

4. Run unit test suite:
   ```bash
   python3 manage.py test
   ```

5. Start local server:
   ```bash
   python3 manage.py runserver
   ```
   Access API at `http://localhost:8000/api/v1/`.