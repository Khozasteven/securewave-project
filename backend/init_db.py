#!/usr/bin/env python
# backend/init_db.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Initialize Flask app minimally to get the SQLAlchemy db instance
app = Flask(__name__)

# Use the DATABASE_URL environment variable as provided by Render
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL').replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# IMPORTANT: Import your models so SQLAlchemy knows which tables to create.
from app import Consultation, Subscriber

# Use app context to run db.create_all()
with app.app_context():
    db.create_all()
    print("Database tables created (from init_db.py)!")