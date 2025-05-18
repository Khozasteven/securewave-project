// This script loads the Dialogflow Messenger library and adds the chatbot element to the page.

// Load the Dialogflow Messenger bootstrap script
(function() {
    const script = document.createElement('script');
    script.src = "https://www.gstatic.com/dialogflow-console/fast/df-messenger/bootstrap.js?v=1";
    script.async = true; // Load asynchronously
    document.body.appendChild(script);
  })();
  
  // Create and append the df-messenger HTML element
  // This element displays the chatbot icon and handles the chat window
  const dfMessenger = document.createElement('df-messenger');
  dfMessenger.setAttribute('intent', 'WELCOME'); // Optional: Specify an initial intent
  dfMessenger.setAttribute('chat-title', 'SecureWave AI Chatbot'); // Title for the chat window
  // IMPORTANT: Replace "securewave-bot-project" with your actual Dialogflow Agent ID
  dfMessenger.setAttribute('agent-id', 'securewave-bot-project'); // Your Dialogflow Agent ID
  dfMessenger.setAttribute('language-code', 'en'); // Language code for your agent
  
  // Append the df-messenger element to the body
  document.body.appendChild(dfMessenger);
  
  // Note: Custom styling for df-messenger is handled in consultation-landing.css
  // using CSS variables like --df-messenger-button-titlebar-color
  