# backend/init_db.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Initialize Flask app minimally to get the SQLAlchemy db instance
app = Flask(__name__)

# Use the DATABASE_URL environment variable as provided by Render
# The .replace() is for compatibility with older psycopg2 versions
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL').replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# IMPORTANT: Import your models so SQLAlchemy knows which tables to create.
# Assumes Consultation and Subscriber classes are defined in your main app.py
from app import Consultation, Subscriber

# Use app context to run db.create_all()
with app.app_context():
    db.create_all()
    print("Database tables created (from init_db.py)!")