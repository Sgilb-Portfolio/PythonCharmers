# From your project root
mkdir backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install django djangorestframework django-cors-headers
pip freeze > requirements.txt

# Create Django project
django-admin startproject backend .
python manage.py startapp api