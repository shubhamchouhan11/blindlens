// Initialize Particles.js
particlesJS('particles-js', {
  particles: {
      number: { value: 150, density: { enable: true, value_area: 1000 } },
      color: { value: ["#00bcd4", "#ff5722", "#ffc107", "#4caf50"] },
      shape: { type: ["circle", "polygon", "star"], polygon: { nb_sides: 5 } },
      opacity: { value: 0.6, random: true },
      size: { value: 5, random: true },
      line_linked: { enable: true, distance: 120, color: "#ffffff", opacity: 0.4 },
      move: { enable: true, speed: 1.5, direction: "none", random: true, out_mode: "out" }
  },
  interactivity: {
      detect_on: "canvas",
      events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" }
      },
      modes: {
          repulse: { distance: 100, duration: 0.4 },
          push: { particles_nb: 6 }
      }
  },
  retina_detect: true
});

// Dynamic interaction with particles
document.addEventListener('click', (event) => {
  const canvas = document.querySelector('#particles-js canvas');
  const boundingRect = canvas.getBoundingClientRect();
  const clickX = event.clientX - boundingRect.left;
  const clickY = event.clientY - boundingRect.top;

  const particlesInstance = window.pJSDom[0].pJS;
  particlesInstance.particles.array.forEach(particle => {
      const dx = particle.x - clickX;
      const dy = particle.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          particle.vx = Math.cos(angle) * 2;
          particle.vy = Math.sin(angle) * 2;
      }
  });
  particlesInstance.fn.modes.pushParticles(10, { pos_x: clickX, pos_y: clickY });
});

// Modal control
function openModal(type) {
  const modal = document.getElementById(`${type}-modal`);
  modal.style.display = "flex";

  const audio = new Audio('button-click.mp3');
  audio.play();

  if (type === 'heartbeat') {
      renderHeartbeatChart();
  } else if (type === 'temperature') {
      renderTemperatureChart();
  } else if (type === 'location') {
      initializeMap();
  }
}

function closeModal(type) {
  const modal = document.getElementById(`${type}-modal`);
  modal.style.display = "none";
}

// Render charts for Heartbeat and Temperature
function renderHeartbeatChart() {
  const ctx = document.getElementById('heartbeat-chart').getContext('2d');
  new Chart(ctx, {
      type: 'line',
      data: {
          labels: Array.from({ length: 10 }, (_, i) => `T-${10 - i}`),
          datasets: [{
              label: 'Heartbeat',
              data: Array.from({ length: 10 }, () => (Math.random() * 10 + 70).toFixed(1)),
              borderColor: '#ff4081',
              borderWidth: 2,
              fill: false,
          }]
      },
      options: { responsive: true }
  });
}

function renderTemperatureChart() {
  const ctx = document.getElementById('temperature-chart').getContext('2d');
  new Chart(ctx, {
      type: 'line',
      data: {
          labels: Array.from({ length: 10 }, (_, i) => `T-${10 - i}`),
          datasets: [{
              label: 'Temperature',
              data: Array.from({ length: 10 }, () => (Math.random() * 1 + 36).toFixed(1)),
              borderColor: '#ff5722',
              borderWidth: 2,
              fill: false,
          }]
      },
      options: { responsive: true }
  });
}
// Google Maps API Key (replace with your key)
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

// Variables to store map and markers
let map;
let userMarker;
let stickMarker;

// Initialize Google Map
function initMap(lat = 0, lng = 0) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat, lng },
        zoom: 15,
    });

    userMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: "Your Location",
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
    });

    stickMarker = new google.maps.Marker({
        map: map,
        title: "Stick Location",
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
    });
}

// Fetch user's live location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    resolve(userCoords);
                },
                (error) => reject("Unable to fetch user's location.")
            );
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
}

// Simulate stick's location (replace with your backend API call)
async function getStickLocation() {
    try {
        const response = await fetch("https://your-backend-api.com/stick-location");
        const data = await response.json();
        return { lat: data.latitude, lng: data.longitude };
    } catch (error) {
        console.error("Error fetching stick location:", error);
        throw new Error("Failed to fetch stick location.");
    }
}

// Update user's location and stick's location on the map
async function updateLocations() {
    try {
        const userLocation = await getUserLocation();
        const stickLocation = await getStickLocation();

        // Update markers' positions
        userMarker.setPosition(userLocation);
        stickMarker.setPosition(stickLocation);

        // Update map bounds to fit both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(userLocation);
        bounds.extend(stickLocation);
        map.fitBounds(bounds);

        // Calculate and display distance
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            stickLocation.lat,
            stickLocation.lng
        );
        document.getElementById("distance").textContent = `Distance: ${distance} km`;

        // Update live coordinates on the web
        document.getElementById("user-location").textContent = `Your Location: Lat ${userLocation.lat.toFixed(
            5
        )}, Lng ${userLocation.lng.toFixed(5)}`;
        document.getElementById("stick-location").textContent = `Stick Location: Lat ${stickLocation.lat.toFixed(
            5
        )}, Lng ${stickLocation.lng.toFixed(5)}`;
    } catch (error) {
        console.error(error);
        document.getElementById("user-location").textContent = "Error fetching user location.";
        document.getElementById("stick-location").textContent = "Error fetching stick location.";
        document.getElementById("distance").textContent = "Unable to calculate distance.";
    }
}

// Calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Distance in kilometers
}

// Initialize map and update locations periodically
async function initializeMap() {
    try {
        const userLocation = await getUserLocation();
        initMap(userLocation.lat, userLocation.lng);

        // Update locations every 5 seconds
        setInterval(updateLocations, 5000);
    } catch (error) {
        console.error(error);
        document.getElementById("map").textContent = "Unable to load map.";
    }
}

// Update the time in the header
function updateTime() {
    const now = new Date();
    document.getElementById("time").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
setInterval(updateTime, 1000);
