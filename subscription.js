

// Function to validate the form (add your validation logic here)
function validateForm() {
    // Get the form elements
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
  
    // Basic validation example (you can add more complex validation)
    if (nameInput.value.trim() === '') {
      alert('Please enter your name.');
      nameInput.focus();// Subscription page specific scripts

      document.addEventListener('DOMContentLoaded', function() {
          const faqItems = document.querySelectorAll('.faq-item');
      
          faqItems.forEach(item => {
              const question = item.querySelector('.faq-question');
      
              question.addEventListener('click', () => {
                  // Toggle active class on the clicked item
                  item.classList.toggle('active');
      
                  // Optional: Close other open FAQs
                  faqItems.forEach(otherItem => {
                      if (otherItem !== item && otherItem.classList.contains('active')) {
                          otherItem.classList.remove('active');
                      }
                  });
              });
          });
      });
      return false;
    }
  
    if (emailInput.value.trim() === '') {
      alert('Please enter your email address.');
      emailInput.focus();
      return false;
    }
  
    if (phoneInput.value.trim() === '') {
      alert('Please enter your phone number.');
      phoneInput.focus();
      return false;
    }
  
    // If all validation passes, return true
    return true;
  }
  
  // Add an event listener to the form to call the validation function on submit
  const form = document.querySelector('.subscription-form form');
  form.addEventListener('submit', function(event) {
    if (!validateForm()) {
      event.preventDefault(); // Prevent form submission if validation fails
    }
  });

  document.getElementById('subscriptionForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;

    // Basic validation (you might want to add more robust validation)
    if (name === '' || email === '' || phone === '' || service === '') {
        alert('Please fill in all fields!');
        return;
    }

    // Create a data object to send to the server
    const data = {
        name: name,
        email: email,
        phone: phone,
        service: service
    };

    // Send the data to the server using fetch or XMLHttpRequest
    fetch('/process_subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            // Redirect to a thank you page or display a success message
            window.location.href = '/thank_you.html'; 
        } else {
            // Handle errors (e.g., display an error message)
            alert('Error submitting subscription!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting subscription!');
    });
});