document.addEventListener('DOMContentLoaded', () => {

    // --- AOS (Animate On Scroll) Initialization ---
    AOS.init({
        duration: 700,      // Duration of animation
        offset: 100,        // Offset (in px) from the original trigger point
        once: true,         // Animation happens only once
        easing: 'ease-out-cubic', // Animation easing
    });

    // --- Sticky Header & Scrolled State ---
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Pixels to scroll before adding 'scrolled' class

    function handleScrollHeader() {
        if (window.pageYOffset > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScrollHeader);
    handleScrollHeader(); // Initial check in case page is loaded scrolled down

    // --- Mobile Navigation Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-active');
            menuToggle.classList.toggle('is-active'); // Optional: for styling hamburger icon itself
            body.classList.toggle('mobile-nav-open'); // Prevent body scroll when menu is open
        });

        // Close menu if user clicks outside of it (optional)
        // document.addEventListener('click', (event) => {
        //     const isClickInsideNav = mainNav.contains(event.target);
        //     const isClickOnToggler = menuToggle.contains(event.target);
        //
        //     if (!isClickInsideNav && !isClickOnToggler && mainNav.classList.contains('mobile-active')) {
        //         mainNav.classList.remove('mobile-active');
        //         menuToggle.classList.remove('is-active');
        //         body.classList.remove('mobile-nav-open');
        //     }
        // });

         // Close menu when a nav link is clicked (useful for SPAs or same-page links)
         mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close immediately if it's linking elsewhere
                // If linking to the *same page* with a hash, you might want to close it.
                const targetHref = link.getAttribute('href');
                 if (targetHref && targetHref.startsWith('#') && mainNav.classList.contains('mobile-active')) {
                     // It's a hash link on the same page
                      mainNav.classList.remove('mobile-active');
                      menuToggle.classList.remove('is-active');
                      body.classList.remove('mobile-nav-open');
                 } else if (mainNav.classList.contains('mobile-active')) {
                    // If linking to another page, maybe delay closing slightly or let page load handle it
                     // For simplicity, we can close it anyway
                     // mainNav.classList.remove('mobile-active');
                     // menuToggle.classList.remove('is-active');
                     // body.classList.remove('mobile-nav-open');
                 }
            });
        });

    }


    // --- Active Navigation Link Highlighting ---
    const currentLocation = window.location.href;
    const navLinks = mainNav.querySelectorAll('ul li a');

    navLinks.forEach(link => {
        // Simple check: if the link's href is part of the current URL
        // More robust checking might be needed for complex URLs or index pages
        if (link.href === currentLocation ||
            (link.href.endsWith('index.html') && (currentLocation.endsWith('/') || currentLocation.endsWith('index.html')) ) )
             {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Ensure others are not active
        }
    });


    // --- Dynamic Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Newsletter Form Placeholder (No actual submission logic) ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add simple feedback - replace with actual submission logic
            alert('Thank you for subscribing! (Demo only)');
            newsletterForm.reset(); // Clear the form
        });
    }

    // --- Chatbot Trigger Placeholder ---
    const chatbotTrigger = document.getElementById('chatbot-trigger');
    if (chatbotTrigger) {
        chatbotTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            // Add logic here to open your chatbot window/widget
            alert('Chatbot interaction placeholder.');
        });
    }


}); // End DOMContentLoaded