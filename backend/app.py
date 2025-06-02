import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# --- Import and load dotenv for local environment variables ---
from dotenv import load_dotenv
load_dotenv() # This will load environment variables from a .env file if it exists
# --- End dotenv setup ---

# --- Flask App Setup ---
app = Flask(__name__)

# Enable CORS for all origins. In a production environment, you should restrict this
# to only the frontend origin(s) for security.
CORS(app)

# --- Logging Configuration ---
# Configure logging to output informational messages and errors.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Database Configuration for MySQL ---
# PythonAnywhere will provide DATABASE_URL in production.
# Locally, you'll need to set up a MySQL DB or use a .env file.
# We're using 'mysql+pymysql' as the driver.
# The default here is a placeholder for local development if you set up MySQL locally.
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql+pymysql://user:password@localhost/your_local_mysql_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Disable tracking modifications overhead

db = SQLAlchemy(app) # Initialize SQLAlchemy

# --- DATABASE TABLE CREATION (For Reliability on PythonAnywhere) ---
# This ensures tables are created/checked every time the app starts.
# It's idempotent, so it won't re-create if they already exist.
with app.app_context():
    db.create_all()
    print("Database tables created/checked on app startup!")
# --- END OF DATABASE TABLE CREATION ---

# ... (rest of your app.py content) ...
