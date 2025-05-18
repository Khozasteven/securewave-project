const mainServices = document.querySelectorAll('.main-service');

mainServices.forEach(service => {
  service.addEventListener('click', () => {
    const subList = service.nextElementSibling;
    subList.classList.toggle('show');
    service.querySelector('.toggle-icon').textContent = subList.classList.contains('show') ? '-' : '+';
  });
});

// Add the new JavaScript code BELOW the existing code
const subListLinks = document.querySelectorAll('.sub-list a'); 

subListLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    // 1. Get the service name
    const service = link.dataset.service;

    // 2. Show the service details (replace with your actual content)
    const serviceDetails = getServiceDetails(service); // Function to get content (see below)
    showServiceDetails(serviceDetails); // Function to display content (see below)

    // 3. Add event listeners to the subscription buttons
    const onlineSubBtn = document.getElementById('online-sub-btn');
    const agentSubBtn = document.getElementById('agent-sub-btn');

    onlineSubBtn.addEventListener('click', () => {
      localStorage.setItem('selectedService', service);
      window.location.href = 'subscribe.html';
    });

    agentSubBtn.addEventListener('click', () => {
      window.location.href = 'book-consultation.html';
    });
  });
});

// --- Helper functions ---

// Function to get the service details content (replace with your actual content)
function getServiceDetails(service) {
  // ... (your code to get service details) ...
}

// Function to display the service details in a modal or designated area
function showServiceDetails(details) {
  // ... (your code to display service details) ...
}