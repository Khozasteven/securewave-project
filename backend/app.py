import sqlite3
import os
from flask import Flask, request, jsonify, g # Import g
from flask_cors import CORS
import logging
from datetime import datetime

# --- Flask App Setup ---
app = Flask(__name__)
# Enable CORS for all origins. In a production environment, you should restrict this
# to only the frontend origin(s) for security.
CORS(app)

# --- Logging Configuration ---
# Configure logging to output informational messages and errors.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Database Configuration ---
# Define the path for the SQLite database file.
# Using os.path.join makes the path platform-independent.
DATABASE = os.path.join(app.root_path, 'securewave.db')

# --- Database Helper Functions ---

# Function to get a database connection.
# This function will be used to open a connection to the SQLite database.
def get_db():
    # Check if the database connection is already in Flask's application context.
    # This prevents creating multiple connections for a single request.
    db = getattr(g, '_database', None)
    if db is None:
        # If no connection exists, create a new one to the DATABASE file.
        db = g._database = sqlite3.connect(DATABASE)
        # Configure the connection to return rows as dictionaries, which is often more convenient.
        db.row_factory = sqlite3.Row
    return db

# Function to close the database connection at the end of a request.
# This is registered with Flask to run automatically after each request.
@app.teardown_appcontext
def close_db(e=None):
    # Get the database connection from the application context.
    db = getattr(g, '_database', None)
    if db is not None:
        # If a connection exists, close it.
        db.close()

# Function to initialize the database (create tables).
# This should be run once when the application starts or before the first request.
def init_db():
    db = get_db() # Get a database connection.
    # Open the schema file and read its contents.
    try:
        with app.open_resource('schema.sql', mode='r') as f:
            # Execute the SQL commands in the schema file.
            db.cursor().executescript(f.read())
        db.commit() # Commit the changes to the database.
        logging.info("Database initialized (tables created if they didn't exist).")
    except FileNotFoundError:
        logging.error("schema.sql not found! Database tables were not created.")
        # You might want to raise an exception or handle this more robustly
        # in a production application.
    except Exception as e:
        db.rollback()
        logging.error(f"Error initializing database: {e}")


# --- Flask CLI Commands (for use with 'flask' command) ---

# Command to initialize the database
@app.cli.command('init-db')
def init_db_command():
    """Clear existing data and create new tables."""
    init_db() # Call your existing init_db function
    print('Initialized the database.') # Optional confirmation message


# --- API Endpoint for Consultation Form Submission ---
# This route handles POST requests from the consultation form on the landing page.
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

    db = get_db() # Get a database connection.
    try:
        # Execute an SQL INSERT statement to add the data to the 'consultations' table.
        db.execute(
            "INSERT INTO consultations (timestamp, name, email, phone, company, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (timestamp, name, email, phone, company, message, 'Form') # Pass data as a tuple
        )
        db.commit() # Commit the transaction to save the data.
        logging.info(f"Consultation request saved to database for {email}")

        # --- Simulate Further Processing (Replace with actual logic) ---
        logging.info(f"Simulating sending consultation request for {email} to CRM.")
        logging.info(f"Simulating sending internal notification email for consultation request from {email}.")
        logging.info(f"Simulating sending automatic confirmation email to {email} for consultation request.")
        # --- End Simulation ---

        return jsonify({"message": "Consultation request submitted successfully!"}), 200
    except Exception as e:
        # Rollback the transaction if any error occurs.
        db.rollback()
        logging.error(f"Error saving consultation request to database: {e}")
        return jsonify({"error": "Failed to save consultation request. Please try again."}), 500


# --- API Endpoint for SecureAI Subscription Form Submission ---
# This route handles POST requests from the SecureAI notification form.
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

    db = get_db() # Get a database connection.
    try:
        # Execute an SQL INSERT statement to add the data to the 'subscribers' table.
        # The UNIQUE constraint on email in the schema will prevent duplicates.
        db.execute(
            "INSERT INTO subscribers (timestamp, email, service, source) VALUES (?, ?, ?, ?)",
            (timestamp, email, service, 'Form') # Pass data as a tuple
        )
        db.commit() # Commit the transaction.
        logging.info(f"Subscriber saved to database: {email}")

        # --- Simulate Further Processing (Replace with actual logic) ---
        logging.info(f"Simulating adding subscriber {email} to email marketing service.")
        logging.info(f"Simulating sending automatic welcome email to {email}.")
        # --- End Simulation ---

        return jsonify({"message": "Subscription successful. Thank you for your interest!"}), 200
    except sqlite3.IntegrityError:
        # Handle the case where the email already exists (UNIQUE constraint violation).
        db.rollback()
        logging.warning(f"Duplicate subscription attempt for email: {email}")
        return jsonify({"message": "You are already subscribed with this email address."}), 409 # 409 Conflict
    except Exception as e:
        # Handle other potential database errors.
        db.rollback()
        logging.error(f"Error saving subscriber to database: {e}")
        return jsonify({"error": "Failed to subscribe. Please try again."}), 500


# --- Webhook Endpoint for Dialogflow ---
# This is the endpoint that your Dialogflow agent will send requests to.
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
    db = get_db() # Get a database connection for potential database operations.

    # --- Intent Handling Logic ---

    if intent == 'SecureAIUpdatesIntent':
        email = parameters.get('email')
        if email:
            timestamp = datetime.now().isoformat()
            try:
                # Insert chatbot subscription into the 'subscribers' table.
                db.execute(
                    "INSERT INTO subscribers (timestamp, email, service, source) VALUES (?, ?, ?, ?)",
                    (timestamp, email, 'SecureAI Updates (Chatbot)', 'Chatbot')
                )
                db.commit()
                response_text = f"Thank you! I've added {email} to the list for SecureAI updates. You'll be notified when it's ready."
                logging.info(f"Chatbot processed SecureAI subscription for {email}")
                # --- Simulate Further Processing ---
                logging.info(f"Simulating adding chatbot subscriber {email} to email marketing service.")
                logging.info(f"Simulating sending automatic welcome email to {email} (chatbot).")
                # --- End Simulation ---
            except sqlite3.IntegrityError:
                db.rollback()
                response_text = "You are already subscribed with this email address."
                logging.warning(f"Chatbot: Duplicate subscription attempt for email: {email}")
            except Exception as e:
                db.rollback()
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
                # Insert chatbot consultation request into the 'consultations' table.
                db.execute(
                    "INSERT INTO consultations (timestamp, name, email, phone, company, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (timestamp, name, email, phone, company, message, 'Chatbot')
                )
                db.commit()
                response_text = f"Thank you, {name}! I've submitted your consultation request. A SecureWave expert will be in touch with you shortly at {email}."
                logging.info(f"Chatbot processed consultation request for {name} ({email})")
                # --- Simulate Further Processing ---
                logging.info(f"Simulating sending chatbot consultation request for {email} to CRM.")
                logging.info(f"Simulating sending internal notification email for chatbot request from {email}.")
                logging.info(f"Simulating sending automatic confirmation email to {email} for consultation request.")
                # --- End Simulation ---
            except Exception as e:
                db.rollback()
                response_text = "I apologize, but I encountered an issue while trying to submit your consultation request. Please try again later or use the form on the website."
                logging.error(f"Chatbot failed to save consultation request for {name} ({email}): {e}")
        else:
            response_text = "I can help you with scheduling a consultation. What is your name and email address?"
            logging.warning("Chatbot received ConsultationRequestIntent but missing required parameters (name or email).")

    # --- Add more elif blocks here for other intents (ServiceInquiry, ContactInfo, Location, GetQuote) ---
    # Remember to implement the logic to set response_text based on the intent and parameters.
    # You can also interact with the database in these blocks if needed (e.g., looking up service details).

    elif intent == 'ServiceInquiryIntent':
        service_type = parameters.get('service_type')
        if service_type:
            # TODO: Implement logic to provide information about the requested service
            # This could involve looking up details in the database or a predefined structure
            response_text = f"You're interested in our {service_type} services? That's great! We offer comprehensive solutions in that area. Would you like to schedule a free consultation to discuss your specific needs?"
            logging.info(f"Chatbot handling inquiry for service: {service_type}")
        else:
            response_text = "I can provide information about our services, such as Custom Software Development, AI Integration, Cybersecurity, Web Designing, or Digital Marketing. Which service are you interested in?"
            logging.warning("Chatbot received ServiceInquiryIntent but no service_type parameter.")

    elif intent == 'ContactInfoIntent':
        # TODO: Implement logic to provide contact details
        response_text = "You can reach us by phone at +27 00 000 0000, or by email at info@securewave.com. You can also fill out the consultation form on our website." # Replace with actual contact info
        logging.info("Chatbot providing contact information.")

    elif intent == 'LocationIntent':
        # TODO: Implement logic to provide location details
        response_text = "Our office is located at 11 Hilton Road, Lansdowne. You can find our location on the map at the bottom of our website." # Replace with actual address
        logging.info("Chatbot providing location information.")

    elif intent == 'GetQuoteIntent':
        # TODO: Implement logic to guide user to the form or collect info
        response_text = "To get a personalized quote, please fill out the consultation form on our website. It helps us understand your needs better. You can find the form by scrolling down or by clicking the 'Get a Quote' buttons on our service items."
        logging.info("Chatbot guiding user to get a quote.")

    # --- End Intent Handling Logic ---

    # Prepare the Dialogflow response JSON.
    webhook_response = {
        'fulfillmentText': response_text
    }

    logging.info(f"Sending Dialogflow Response: {webhook_response}")
    return jsonify(webhook_response)

# --- Root Route (Optional) ---
@app.route('/')
def index():
    return "SecureWave Backend is running with SQLite!"

# --- Run the Flask App ---
if __name__ == '__main__':
    # Initialize the database when the script is run directly (e.g., python app.py).
    # When using 'flask run', you will use the 'flask init-db' command instead.
    with app.app_context():
        init_db()

    # Now run the Flask application.
    # app.run(debug=True) # Use debug=True during development
    app.run(host='0.0.0.0', port=5000, debug=True) # Running on all IPs on port 5000 for ngrok