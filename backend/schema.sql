-- Drop tables if they exist (useful for development/resetting)
DROP TABLE IF EXISTS consultations;

DROP TABLE IF EXISTS subscribers;

-- Create the consultations table
CREATE TABLE consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique ID for each entry
    timestamp TEXT NOT NULL, -- When the entry was created (ISO format text)
    name TEXT NOT NULL, -- User's name
    email TEXT NOT NULL, -- User's email
    phone TEXT, -- User's phone number (optional)
    company TEXT, -- User's company (optional)
    message TEXT, -- User's message/needs (optional)
    source TEXT DEFAULT 'Form' -- Where the request came from (Form or Chatbot)
);

-- Create the subscribers table
CREATE TABLE subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Unique ID for each entry
    timestamp TEXT NOT NULL, -- When the entry was created (ISO format text)
    email TEXT NOT NULL UNIQUE, -- User's email (UNIQUE constraint ensures no duplicates)
    service TEXT, -- Which service they subscribed for (e.g., 'SecureAI Updates')
    source TEXT DEFAULT 'Form' -- Where the subscription came from (Form or Chatbot)
);