// Leaflet Map Initialization Script

document.addEventListener('DOMContentLoaded', function() {
    // Check if the map container exists on the page
    const mapContainer = document.getElementById('leaflet-map');

    if (mapContainer) {
        // --- Map Configuration ---
        // ** IMPORTANT: Replace with your desired Latitude and Longitude **
        // You can find this using Google Maps or similar tools.
        const mapCenter = [-33.9249, 18.4241]; // Example: Cape Town city center coordinates
        const initialZoom = 13; // Adjust zoom level as needed (e.g., 10 for city view, 15 for street view)

        // --- Initialize the Map ---
        const map = L.map('leaflet-map').setView(mapCenter, initialZoom);

        // --- Add a Tile Layer (the actual map tiles) ---
        // OpenStreetMap is a common and free choice. You can use others.
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // --- Add a Marker for your Location ---
        // You can customize the marker icon if needed.
        const marker = L.marker(mapCenter).addTo(map);

        // Optional: Add a popup to the marker
        marker.bindPopup("<b>Securewave Location</b><br>Your approximate address here.").openPopup();

        // Handle map resize issues if AOS or other animations affect layout
        // It's often good practice to invalidateSize after the container becomes visible or its size changes.
        // This might require more advanced JS if the map is in a hidden tab/modal.
         setTimeout(function () {
            map.invalidateSize();
        }, 500); // Small delay to ensure container size is set

    } else {
        console.log("Leaflet map container not found on this page.");
    }
});