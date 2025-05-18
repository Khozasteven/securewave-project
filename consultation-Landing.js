// Wait for the DOM to be fully loaded before executing the script
// This ensures that all HTML elements are available before the script tries to access them.
document.addEventListener('DOMContentLoaded', function() {

    // --- Initialize AOS (Animate On Scroll) Library ---
    // AOS adds scroll animations to elements with the 'data-aos' attribute.
    // Configuration options are set here.
    AOS.init({
        duration: 1000, // Animation duration in milliseconds. Controls how long the animation takes.
        once: true, // Whether animation should happen only once - while scrolling down.
        // You can add more options here, e.g., easing: 'ease-in-out'
    });

    // --- Update Current Year in Footer ---
    // Finds the HTML element with the ID 'current-year' and sets its text content
    // to the current full year (e.g., 2025).
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    } else {
        // Log an error to the console if the element is not found, helpful for debugging.
        console.error("Element with ID 'current-year' not found in the HTML.");
    }

    // --- Backend URL Configuration ---
    // IMPORTANT: Replace this placeholder with the ACTUAL URL of your backend API endpoints.
    // During local development with ngrok, this will be your ngrok HTTPS forwarding URL.
    // When you deploy your website and backend, this should be your production backend API URL
    // (e.g., 'https://api.yourdomain.com').
    // Ensure this URL points to the base of your backend API.
    const BACKEND_URL = 'https://f081-41-56-231-94.ngrok-free.app'; // <-- !! UPDATE THIS !!

    // --- Consultation Form Submission Handling ---
    // Gets references to the consultation form and the div where messages will be displayed.
    const consultationForm = document.getElementById('consultation-form');
    const consultationMessageDiv = document.getElementById('consultationMessage');

    // Check if both the form and the message div exist before adding the event listener.
    if (consultationForm && consultationMessageDiv) {
        // Add an event listener for the form's 'submit' event.
        consultationForm.addEventListener('submit', async function(event) {
            // Prevent the browser's default form submission behavior (which causes a page reload).
            event.preventDefault();

            // Get the form element that triggered the event.
            const form = event.target;
            // Create a FormData object to easily get form values.
            const formData = new FormData(form);

            // Create a JSON object from the form data.
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'), // Include phone number
                company: formData.get('company'), // Include company name
                message: formData.get('message') // Include message
            };

            // --- Basic Frontend Validation ---
            // Check if required fields (Name and Email) are empty.
            if (!data.name || !data.email) {
                consultationMessageDiv.textContent = 'Please fill in all required fields (Name and Email).';
                // Use CSS classes for styling the message (assuming Tailwind classes based on HTML structure)
                consultationMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error
                return; // Stop the submission process if validation fails.
            }

            // --- Display Loading Indicator ---
            consultationMessageDiv.textContent = 'Sending your consultation request...';
            consultationMessageDiv.className = 'mt-4 text-center text-sm font-medium text-yellow-700'; // Yellow/Orange for loading

            try {
                // --- Send Data to Backend ---
                // Use the fetch API to send a POST request to your backend endpoint.
                // Corrected endpoint to match app_py_file_save: '/api/consultation-submit' (singular)
                const response = await fetch(`${BACKEND_URL}/api/consultation-submit`, {
                    method: 'POST', // Specify the HTTP method
                    headers: {
                        'Content-Type': 'application/json' // Indicate that the body is JSON
                    },
                    body: JSON.stringify(data) // Convert the JavaScript object to a JSON string
                });

                // --- Handle Backend Response ---
                // Check if the HTTP status code indicates success (2xx range).
                if (response.ok) {
                    // If successful, parse the JSON response from the backend.
                    const result = await response.json();
                    // Display the success message from the backend or a default one.
                    consultationMessageDiv.textContent = result.message || 'Consultation request submitted successfully! We will be in touch shortly.';
                    consultationMessageDiv.className = 'mt-4 text-center text-sm font-medium text-green-700'; // Green color for success
                    form.reset(); // Clear the form fields after successful submission.
                    console.log('Consultation form submission successful:', result); // Log success to console

                    // Optional: Clear message after a few seconds
                    setTimeout(() => {
                        consultationMessageDiv.textContent = '';
                        consultationMessageDiv.className = '';
                    }, 5000); // Clear after 5 seconds

                } else {
                    // If the response status is not OK, handle it as an error.
                    // Try to parse a JSON error message from the backend response body.
                    try {
                        const errorData = await response.json();
                        consultationMessageDiv.textContent = `Error: ${errorData.error || errorData.message || response.statusText}`;
                    } catch (jsonError) {
                        // If parsing JSON fails (e.g., backend returned non-JSON error), use status text.
                        consultationMessageDiv.textContent = `Error submitting request: ${response.statusText} (${response.status})`;
                    }
                    consultationMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error
                    console.error('Error submitting consultation form:', response.status, response.statusText); // Log error to console

                     // Optional: Clear message after a few seconds
                     setTimeout(() => {
                         consultationMessageDiv.textContent = '';
                         consultationMessageDiv.className = '';
                     }, 10000); // Clear error after 10 seconds

                }
            } catch (error) {
                // --- Handle Network Errors ---
                // Catch any errors that occur during the fetch operation (e.g., network issues).
                console.error('Network error during consultation form submission:', error);
                consultationMessageDiv.textContent = 'A network error occurred. Please check your connection and try again.';
                consultationMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error

                 // Optional: Clear message after a few seconds
                 setTimeout(() => {
                     consultationMessageDiv.textContent = '';
                     consultationMessageDiv.className = '';
                 }, 10000); // Clear error after 10 seconds
            }
        });
    } else {
        // Log an error if the form or message div is not found.
        console.error("Consultation form with ID 'consultation-form' or message div with ID 'consultationMessage' not found.");
    }


    // --- SecureAI Notify Form Submission Handling ---
    // Gets references to the SecureAI notification form and the div where messages will be displayed.
    const secureaiNotifyForm = document.getElementById('secureai-notify-form');
    const subscriptionMessageDiv = document.getElementById('subscriptionMessage'); // Reusing the subscription message div

    // Check if both the form and the message div exist.
    if (secureaiNotifyForm && subscriptionMessageDiv) {
        // Add an event listener for the form's 'submit' event.
        secureaiNotifyForm.addEventListener('submit', async function(event) {
            // Prevent the browser's default form submission behavior.
            event.preventDefault();

            // Get the form element.
            const form = event.target;
            // Create FormData and JSON object.
            const formData = new FormData(form);
            const data = {
                email: formData.get('email'), // Only need email for subscription
                // We don't have a specific service name for the main SecureAI subscription form
                service: 'SecureAI Updates' // Hardcode service name for this form
            };

            // --- Basic Frontend Validation ---
            // Check if the email field is empty.
            if (!data.email) {
                subscriptionMessageDiv.textContent = 'Please provide your email address to subscribe.';
                subscriptionMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error
                return; // Stop the submission.
            }

            // --- Display Loading Indicator ---
            subscriptionMessageDiv.textContent = 'Subscribing you...';
            subscriptionMessageDiv.className = 'mt-4 text-center text-sm font-medium text-yellow-700'; // Yellow/Orange for loading

            try {
                // --- Send Data to Backend ---
                // Send a POST request to your backend subscription endpoint.
                // Corrected endpoint to match app_py_file_save: '/api/secureai-subscribe' (singular)
                const response = await fetch(`${BACKEND_URL}/api/secureai-subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                // --- Handle Backend Response ---
                // Check for successful response status.
                if (response.ok) {
                    const result = await response.json();
                    subscriptionMessageDiv.textContent = result.message || 'Subscription successful. Thank you!';
                    subscriptionMessageDiv.className = 'mt-4 text-center text-sm font-medium text-green-700'; // Green color for success
                    form.reset(); // Clear the form on success.
                    console.log('Subscription form submission successful:', result); // Log success

                    // Optional: Clear message after a few seconds
                    setTimeout(() => {
                        subscriptionMessageDiv.textContent = '';
                        subscriptionMessageDiv.className = '';
                    }, 5000); // Clear after 5 seconds

                    // --- Automatic Response Trigger (Backend) ---
                    // IMPORTANT: The actual automatic email or message to the user
                    // should be triggered by your backend upon receiving and successfully
                    // processing this subscription request. The frontend just confirms
                    // the request was sent.

                } else {
                    // Handle errors from the backend.
                    try {
                         const errorData = await response.json();
                         subscriptionMessageDiv.textContent = `Error: ${errorData.error || errorData.message || response.statusText}`;
                    } catch (jsonError) {
                         subscriptionMessageDiv.textContent = `Error subscribing: ${response.statusText} (${response.status})`;
                    }
                    subscriptionMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error
                    console.error('Error submitting subscription form:', response.status, response.statusText, result); // Log error

                    // Optional: Clear message after a few seconds
                    setTimeout(() => {
                        subscriptionMessageDiv.textContent = '';
                        subscriptionMessageDiv.className = '';
                    }, 10000); // Clear error after 10 seconds
                }
            } catch (error) {
                // --- Handle Network Errors ---
                console.error('Network error during subscription form submission:', error);
                subscriptionMessageDiv.textContent = 'A network error occurred. Please check your connection and try again.';
                subscriptionMessageDiv.className = 'mt-4 text-center text-sm font-medium text-red-700'; // Red color for error

                // Optional: Clear message after a few seconds
                setTimeout(() => {
                    subscriptionMessageDiv.textContent = '';
                    subscriptionMessageDiv.className = '';
                }, 10000); // Clear error after 10 seconds
            }
        });
    } else {
        // Log an error if the form or message div is not found.
        console.error("SecureAI notify form with ID 'secureai-notify-form' or message div with ID 'subscriptionMessage' not found.");
    }

    // --- Basic Service Search Functionality - REMOVED ---
    // This section was removed as requested by the user.
    // const searchInput = document.getElementById('service-search');
    // const searchButton = document.querySelector('.search-bar button');
    // const searchResultsDiv = document.getElementById('search-results');
    // const solutionItems = document.querySelectorAll('.solution-item');

    // function performSearch() {
    //     const searchTerm = searchInput.value.toLowerCase();
    //     console.log(`Performing search for: "${searchTerm}"`);

    //     if (searchTerm.length < 2) {
    //          console.log("Search term too short. Showing all items.");
    //          solutionItems.forEach(item => {
    //              item.style.setProperty('display', 'grid', 'important');
    //              item.style.removeProperty('border');
    //          });
    //          if (searchResultsDiv) searchResultsDiv.innerHTML = '';
    //          return;
    //     }

    //     let resultsFound = false;

    //     solutionItems.forEach(item => {
    //         const serviceTitle = item.querySelector('h3') ? item.querySelector('h3').textContent.toLowerCase() : '';
    //         const serviceDescription = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
    //         const subServices = item.querySelectorAll('.sub-services li');
    //         let subServiceText = '';
    //         subServices.forEach(li => {
    //             subServiceText += li.textContent.toLowerCase() + ' ';
    //         });

    //         console.log(`Checking item: ${serviceTitle}`);
    //         console.log(`Content: ${serviceTitle} | ${serviceDescription.substring(0, 50)}... | ${subServiceText.substring(0, 50)}...`);

    //         if (serviceTitle.includes(searchTerm) || serviceDescription.includes(searchTerm) || subServiceText.includes(searchTerm)) {
    //             console.log(`Match found for "${searchTerm}" in "${serviceTitle}". Showing item.`);
    //             item.style.setProperty('display', 'grid', 'important');
    //             item.style.border = '2px solid green';
    //             resultsFound = true;
    //         } else {
    //             console.log(`No match found for "${searchTerm}" in "${serviceTitle}". Hiding item.`);
    //             item.style.setProperty('display', 'none', 'important');
    //             item.style.removeProperty('border');
    //         }
    //     });
    //      console.log(`Search complete. Results found: ${resultsFound}`);
    // }

    // --- Add Event Listeners for Search - REMOVED ---
    // These event listeners were removed as requested by the user.
    // if (searchInput) {
    //     searchInput.addEventListener('input', performSearch);
    //     if (searchButton) {
    //         searchButton.addEventListener('click', performSearch);
    //     }
    //     searchInput.addEventListener('keypress', function(event) {
    //         if (event.key === 'Enter') {
    //             event.preventDefault();
    //             performSearch();
    //         }
    //     });
    //     performSearch(); // Run on load
    // } else {
    //      console.error("Search input with ID 'service-search' not found.");
    // }

    // --- Service Specific Actions (Call, Subscribe, Get Quote) ---
    // Add event listeners to the action buttons within each service item.

    const callServiceButtons = document.querySelectorAll('.call-service-btn'); // Select all Call buttons
    const subscribeServiceButtons = document.querySelectorAll('.subscribe-service-btn'); // Select all Subscribe buttons
    const getQuoteButtons = document.querySelectorAll('.get-quote-btn'); // Select all Get a Quote buttons


    // Add event listeners for Call buttons
    if (callServiceButtons.length > 0) {
        callServiceButtons.forEach(button => {
            // The href attribute already contains the tel: link, so a simple click is enough.
            // We can add a console log for tracking.
            button.addEventListener('click', function() {
                 const serviceItem = button.closest('.solution-item');
                 const serviceName = serviceItem ? serviceItem.querySelector('h3').textContent.trim() : 'Unknown Service';
                 console.log(`User clicked Call button for service: ${serviceName}`);
                 // The browser handles the tel: link (e.g., opens phone app)
            });
        });
    } else {
         console.warn("No elements with class 'call-service-btn' found. Call buttons may be missing.");
    }


    // Add event listeners for Subscribe buttons
    if (subscribeServiceButtons.length > 0) {
        subscribeServiceButtons.forEach(button => {
            button.addEventListener('click', async function(event) {
                event.preventDefault(); // Prevent default button click behavior

                // Get the service name from a data attribute or parent element
                const serviceItem = event.target.closest('.solution-item');
                const serviceName = serviceItem ? serviceItem.querySelector('h3').textContent.trim() : 'Unknown Service';

                // Prompt the user for their email (can be replaced with a modal/form for better UX)
                const userEmail = prompt(`Enter your email to subscribe to updates for "${serviceName}":`);

                if (userEmail) {
                    // Basic email format validation (can be more robust)
                    if (!userEmail.includes('@') || !userEmail.includes('.')) {
                        alert('Please enter a valid email address.');
                        return;
                    }

                    // Prepare data to send to the backend
                    const data = {
                        email: userEmail,
                        service: serviceName // Include the service name
                    };

                    console.log(`Attempting to subscribe ${userEmail} to ${serviceName}`); // Debugging log

                    try {
                         // Send data to the backend subscription endpoint
                         // Corrected endpoint to match app_py_file_save: '/api/secureai-subscribe' (singular)
                         const response = await fetch(`${BACKEND_URL}/api/secureai-subscribe`, {
                             method: 'POST',
                             headers: {
                                 'Content-Type': 'application/json'
                             },
                             body: JSON.stringify(data)
                         });

                         const result = await response.json();

                         if (response.ok) {
                             alert(result.message || `Successfully subscribed to updates for "${serviceName}"!`);
                             console.log('Service subscription successful:', result);
                         } else {
                             alert(`Error subscribing: ${result.error || response.statusText}`);
                             console.error('Error subscribing to service:', response.status, response.statusText, result);
                         }

                    } catch (error) {
                        console.error('Network error during service subscription:', error);
                        alert('A network error occurred while subscribing. Please try again later.');
                    }
                } else {
                    console.log("Service subscription cancelled by user."); // Debugging log
                }
            });
        });
    } else {
        console.warn("No elements with class 'subscribe-service-btn' found. Subscribe buttons may be missing.");
    }

    // Add event listeners for Get a Quote buttons
    if (getQuoteButtons.length > 0) {
         getQuoteButtons.forEach(button => {
             button.addEventListener('click', function(event) {
                 // The href attribute already links to #lead-capture, so default behavior is fine.
                 // We can add a console log for tracking.
                 const serviceItem = button.closest('.solution-item');
                 const serviceName = serviceItem ? serviceItem.querySelector('h3').textContent.trim() : 'Unknown Service';
                 console.log(`User clicked Get a Quote button for service: ${serviceName}. Scrolling to consultation form.`);
                 // The browser handles the smooth scroll due to href="#lead-capture" and html { scroll-behavior: smooth; }
                 // If you wanted to pre-fill the form message with the service name, you'd add that logic here.
                 // Example:
                 // const messageField = document.getElementById('message');
                 // if (messageField) {
                 //     messageField.value = `Regarding a quote for: ${serviceName}\n\n`;
                 // }
             });
         });
    } else {
         console.warn("No elements with class 'get-quote-btn' found. Get a Quote buttons may be missing.");
    }


    // --- Initialize Leaflet Map ---
    // Get the map container element.
    const mapElement = document.getElementById('leaflet-map');

    // Check if the map element exists before initializing the map.
    if (mapElement) {
        // Define the coordinates for your location (11 Hilton Road, Lansdowne)
        const officeCoordinates = [-34.002546, 18.531969];
        const initialZoom = 15; // Adjust zoom level as needed (higher number means more zoomed in)
        const officeAddress = "11 Hilton Road, Lansdowne"; // Your address for the popup

        // Initialize the map
        const mymap = L.map('leaflet-map').setView(officeCoordinates, initialZoom);

        // Add a tile layer (the base map) - using OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

        // Add a marker at your office location
        const marker = L.marker(officeCoordinates).addTo(mymap);

        // Add a popup to the marker with your address
        marker.bindPopup(`<b>SecureWave Office</b><br>${officeAddress}`).openPopup();

        // Optional: Adjust map size on window resize
        // This helps ensure the map fills its container correctly if the window is resized
        window.addEventListener('resize', function() {
            mymap.invalidateSize();
        });

        console.log("Leaflet map initialized successfully."); // Log map initialization
    } else {
        console.error("Map container element with ID 'leaflet-map' not found. Map cannot be initialized."); // Log error if map element is missing
    }


    // --- Chatbot Setup and Guidance ---
    // The Dialogflow Messenger is integrated via the script tag in the HTML.
    // Ensure your Dialogflow agent is configured with intents for:
    // - SecureAIUpdatesIntent (handled by webhook, expects email parameter)
    // - ConsultationRequestIntent (handled by webhook, expects name, email, etc. parameters)
    // - CallIntent (handled by webhook, can provide phone number or guidance)
    // - QuotationIntent (handled by webhook, can guide to form or ask for details)
    //
    // The backend webhook (app.py) has placeholder logic for these intents.
    // You need to IMPLEMENT the actual logic in your backend to:
    // - Save data received via webhook (e.g., for chatbot-initiated consultations or subscriptions).
    // - Send appropriate responses back to Dialogflow (which the backend structure supports).
    // - Trigger internal notifications or automatic emails based on chatbot interactions.
    //
    // The frontend chatbot itself doesn't need much JS here beyond the bootstrap script.
    // Its behavior is primarily controlled by your Dialogflow agent configuration and the backend webhook.


}); // End of DOMContentLoaded
