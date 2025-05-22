import os
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # Import SQLAlchemy

# --- Flask App Setup ---
app = Flask(__name__)

# Enable CORS for all origins. In a production environment, you should restrict this
# to only the frontend origin(s) for security.
# For example: CORS(app, resources={r"/api/*": {"origins": "[https://your-frontend-domain.com](https://your-frontend-domain.com)"}})
CORS(app)

# --- Logging Configuration ---
# Configure logging to output informational messages and errors.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Database Configuration for PostgreSQL ---
# Render will provide DATABASE_URL in production.
# Locally, you'll need to set up a PostgreSQL DB or use a .env file.
# The `replace` is a common workaround for older psycopg2 versions that expect 'postgres://'
# while newer ones prefer 'postgresql://'. Render typically provides 'postgresql://'.
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/securewave_db').replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Disable tracking modifications overhead

db = SQLAlchemy(app) # Initialize SQLAlchemy

# --- TEMPORARY CODE TO CREATE DATABASE TABLES ---
# IMPORTANT: This block is for initial database setup on Render's free tier.
# After the first successful deployment where you see "Database tables created!" in Render logs,
# IMMEDIATELY REMOVE THIS BLOCK from your local app.py, commit, and push again.
with app.app_context():
    db.create_all()
    print("Database tables created!")
# --- END OF TEMPORARY CODE ---


# --- Define Database Models ---
# These Python classes represent your database tables.
class Consultation(db.Model):
    __tablename__ = 'consultations'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Text, nullable=False)
    name = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False)
    phone = db.Column(db.Text)
    company = db.Column(db.Text)
    message = db.Column(db.Text)
    source = db.Column(db.Text, default='Form')

class Subscriber(db.Model):
    __tablename__ = 'subscribers'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False, unique=True) # UNIQUE constraint
    service = db.Column(db.Text)
    source = db.Column(db.Text, default='Form')


# --- API Endpoint for Consultation Form Submission ---
@app.route('/api/consultation-submit', methods=['POST'])
def handle_consultation_submit():
    logging.info("Received request to /api/consultation-submit")
    if not request.is_json:
        logging.warning("Consultation submit request was not JSON.")
        return jsonify({"error": "Request must be JSON"}), 415

    data = request.get_json()
    logging.info(f"Request body is JSON: {data}")

    name = data.get('name', '')
    email = data.get('email', '')
    phone = data.get('phone', '')
    company = data.get('company', '')
    message = data.get('message', '')
    timestamp = datetime.now().isoformat()

    if not name or not email:
        logging.warning("Consultation submit request missing required fields (name or email).")
        return jsonify({"error": "Name and Email are required"}), 400

    try:
        # Create a new Consultation object and add it to the session
        new_consultation = Consultation(
            timestamp=timestamp,
            name=name,
            email=email,
            phone=phone,
            company=company,
            message=message,
            source='Form'
        )
        db.session.add(new_consultation)
        db.session.commit() # Commit the transaction to save the data
        logging.info(f"Consultation request saved to database for {email}")

        # --- Simulate Further Processing (Replace with actual logic) ---
        logging.info(f"Simulating sending consultation request for {email} to CRM.")
        logging.info(f"Simulating sending internal notification email for consultation request from {email}.")
        logging.info(f"Simulating sending automatic confirmation email to {email} for consultation request.")
        # --- End Simulation ---

        return jsonify({"message": "Consultation request submitted successfully!"}), 200
    except Exception as e:
        db.session.rollback() # Rollback the transaction if any error occurs
        logging.error(f"Error saving consultation request to database: {e}")
        return jsonify({"error": "Failed to save consultation request. Please try again."}), 500


# --- API Endpoint for SecureAI Subscription Form Submission ---
@app.route('/api/secureai-subscribe', methods=['POST'])
def handle_secureai_subscribe():
    logging.info("Received request to /api/secureai-subscribe")
    if not request.is_json:
        logging.warning("SecureAI subscribe request was not JSON.")
        return jsonify({"error": "Request must be JSON"}), 415

    data = request.get_json()
    logging.info(f"Request body is JSON: {data}")

    email = data.get('email', '')
    service = data.get('service', 'General Subscription')
    timestamp = datetime.now().isoformat()

    if not email:
        logging.warning("SecureAI subscribe request missing email.")
        return jsonify({"error": "Email is required for subscription"}), 400

    try:
        # Create a new Subscriber object and add it to the session
        new_subscriber = Subscriber(
            timestamp=timestamp,
            email=email,
            service=service,
            source='Form'
        )
        db.session.add(new_subscriber)
        db.session.commit() # Commit the transaction
        logging.info(f"Subscriber saved to database: {email}")

        # --- Simulate Further Processing (Replace with actual logic) ---
        logging.info(f"Simulating adding subscriber {email} to email marketing service.")
        logging.info(f"Simulating sending automatic welcome email to {email}.")
        # --- End Simulation ---

        return jsonify({"message": "Subscription successful. Thank you for your interest!"}), 200
    except Exception as e:
        db.session.rollback()
        # Check for unique constraint violation (duplicate email)
        # The error message can vary slightly between database drivers, so a general check is used.
        if 'unique constraint' in str(e).lower() or 'duplicate key value' in str(e).lower():
            logging.warning(f"Duplicate subscription attempt for email: {email}")
            return jsonify({"message": "You are already subscribed with this email address."}), 409 # 409 Conflict
        else:
            logging.error(f"Error saving subscriber to database: {e}")
            return jsonify({"error": "Failed to subscribe. Please try again."}), 500


# --- Webhook Endpoint for Dialogflow ---
@app.route('/webhook', methods=['POST'])
def webhook():
    logging.info("Received Dialogflow webhook request.")
    if not request.is_json:
        logging.warning("Webhook request was not JSON.")
        return jsonify({"fulfillmentText": "An error occurred. Please try again."}), 415

    req = request.get_json()
    logging.info(f"Dialogflow Request: {req}")

    try:
        intent = req['queryResult']['intent']['displayName']
        parameters = req['queryResult']['parameters']
        logging.info(f"Detected Intent: {intent}")
        logging.info(f"Parameters: {parameters}")
    except KeyError as e:
        logging.error(f"Could not extract intent or parameters from Dialogflow request: {e}")
        return jsonify({"fulfillmentText": "Sorry, I didn't understand that. Could you please rephrase?"}), 400

    response_text = "I'm sorry, I don't have information on that at the moment." # Default response

    # --- Intent Handling Logic ---

    if intent == 'SecureAIUpdatesIntent':
        email = parameters.get('email')
        if email:
            timestamp = datetime.now().isoformat()
            try:
                # Insert chatbot subscription into the 'subscribers' table using model
                new_subscriber = Subscriber(
                    timestamp=timestamp,
                    email=email,
                    service='SecureAI Updates (Chatbot)',
                    source='Chatbot'
                )
                db.session.add(new_subscriber)
                db.session.commit()
                response_text = f"Thank you! I've added {email} to the list for SecureAI updates. You'll be notified when it's ready."
                logging.info(f"Chatbot processed SecureAI subscription for {email}")
                # --- Simulate Further Processing ---
                logging.info(f"Simulating adding chatbot subscriber {email} to email marketing service.")
                logging.info(f"Simulating sending automatic welcome email to {email} (chatbot).")
                # --- End Simulation ---
            except Exception as e:
                db.session.rollback()
                if 'unique constraint' in str(e).lower() or 'duplicate key value' in str(e).lower():
                    response_text = "You are already subscribed with this email address."
                    logging.warning(f"Chatbot: Duplicate subscription attempt for email: {email}")
                else:
                    response_text = "I apologize, but I encountered an issue while trying to add you to the SecureAI updates list. Please try again later or use the form on the website."
                    logging.error(f"Chatbot failed to save SecureAI subscription for {email}: {e}")
        else:
            response_text = "I can help you with that! What is your email address so I can add you to the SecureAI updates list?"
            logging.warning("Chatbot received SecureAIUpdatesIntent but no email parameter.")

    elif intent == 'ConsultationRequestIntent':
        name = parameters.get('person', {}).get('name', '')
        email = parameters.get('email')
        phone = parameters.get('phone-number')
        company = parameters.get('company')
        message = parameters.get('message')

        if name and email:
            timestamp = datetime.now().isoformat()
            try:
                # Insert chatbot consultation request into the 'consultations' table using model
                new_consultation = Consultation(
                    timestamp=timestamp,
                    name=name,
                    email=email,
                    phone=phone,
                    company=company,
                    message=message,
                    source='Chatbot'
                )
                db.session.add(new_consultation)
                db.session.commit()
                response_text = f"Thank you, {name}! I've submitted your consultation request. A SecureWave expert will be in touch with you shortly at {email}."
                logging.info(f"Chatbot processed consultation request for {name} ({email})")
                # --- Simulate Further Processing ---
                logging.info(f"Simulating sending chatbot consultation request for {email} to CRM.")
                logging.info(f"Simulating sending internal notification email for chatbot request from {email}.")
                logging.info(f"Simulating sending automatic confirmation email to {email} for consultation request.")
                # --- End Simulation ---
            except Exception as e:
                db.session.rollback()
                response_text = "I apologize, but I encountered an issue while trying to submit your consultation request. Please try again later or use the form on the website."
                logging.error(f"Chatbot failed to save consultation request for {name} ({email}): {e}")
        else:
            response_text = "I can help you with scheduling a consultation. What is your name and email address?"
            logging.warning("Chatbot received ConsultationRequestIntent but missing required parameters (name or email).")

    elif intent == 'ServiceInquiryIntent':
        service_type = parameters.get('service_type')
        if service_type:
            # TODO: Implement logic to provide information about the requested service
            response_text = f"You're interested in our {service_type} services? That's great! We offer comprehensive solutions in that area. Would you like to schedule a free consultation to discuss your specific needs?"
            logging.info(f"Chatbot handling inquiry for service: {service_type}")
        else:
            response_text = "I can provide information about our services, such as Custom Software Development, AI Integration, Cybersecurity, Web Designing, or Digital Marketing. Which service are you interested in?"
            logging.warning("Chatbot received ServiceInquiryIntent but no service_type parameter.")

    elif intent == 'ContactInfoIntent':
        response_text = "You can reach us by phone at +27 00 000 0000, or by email at info@securewave.com. You can also fill out the consultation form on our website."
        logging.info("Chatbot providing contact information.")

    elif intent == 'LocationIntent':
        response_text = "Our office is located at 11 Hilton Road, Lansdowne. You can find our location on the map at the bottom of our website."
        logging.info("Chatbot providing location information.")

    elif intent == 'GetQuoteIntent':
        response_text = "To get a personalized quote, please fill out the consultation form on our website. It helps us understand your needs better. You can find the form by scrolling down or by clicking the 'Get a Quote' buttons on our service items."
        logging.info("Chatbot guiding user to get a quote.")

    # Prepare the Dialogflow response JSON.
    webhook_response = {
        'fulfillmentText': response_text
    }

    logging.info(f"Sending Dialogflow Response: {webhook_response}")
    return jsonify(webhook_response)

# --- Root Route (Optional) ---
@app.route('/')
def index():
    return "SecureWave Backend is running!" # Updated message

# --- Run the Flask App (for local development only, Gunicorn will run in production) ---
# This block is mainly for local testing with `python app.py`
# For production, Gunicorn will run the app.
if __name__ == '__main__':
    print("Running Flask app in development mode directly...")
    # For local PostgreSQL testing, you would typically run 'flask db upgrade'
    # or 'with app.app_context(): db.create_all()' once to create tables.
    # The temporary db.create_all() above handles the Render initial setup.
    # app.run(host='0.0.0.0', port=5000, debug=True) # This line should be removed or commented out for Render
