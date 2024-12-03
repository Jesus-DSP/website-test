// Define the bounding coordinates
const southWest = L.latLng(27.56695, -99.44011);
const northEast = L.latLng(27.57606, -99.4294);
const bounds = L.latLngBounds(southWest, northEast);

// Initialize the map
const map = L.map("map", {
  center: bounds.getCenter(),
  zoom: 16,
  minZoom: 16, // Prevent zooming out beyond zoom level 16
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
});

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

/*
// Define the coordinates for the square (four corners)
var latb = [
  [27.57241, -99.43473], // Bottom-left
  [27.57241, -99.43446], // Bottom-right
  [27.57316, -99.43446], // Top-right
  [27.57316, -99.43473], // Top-left
];

// Create the square polygon with red color
var b = L.polygon(latb, {
  color: "red",
}).addTo(map);

// Add an event listener for the square click
b.on("click", function () {
  alert("You've touched the Bullock");
});

var latCowart = [
  [27.5724, -99.4358], // Bottom-left
  [27.5724, -99.43553], // Bottom-right
  [27.57314, -99.43553], // Top-right
  [27.57314, -99.4358], // Top-left
];

// Create the square polygon with red color
var Cowart = L.polygon(latCowart, {
  color: "red",
}).addTo(map);

// Add an event listener for the square click
Cowart.on("click", function () {
  alert("You've touched the Cowart");
});

var latLibrary = [
  [27.57333, -99.43572], // Bottom-left
  [27.57333, -99.4346], // Bottom-right
  [27.57365, -99.4346], // Top-right
  [27.57365, -99.43572], // Top-left
];

var library = L.polygon(latLibrary, {
  color: "red",
  opacity: "0%",
}).addTo(map);

// Add an event listener for the square click
library.on("click", function () {
  alert("You've touched the Library");
});

*/

// Initialize variables
let startMarker = null;
let endMarker = null;
let routeLayer = null;

// Function to create draggable markers
function createMarker(latlng, label) {
  const marker = L.marker(latlng, { draggable: true }).addTo(map);
  marker.bindPopup(label).openPopup();

  marker.on("dragend", function () {
    if (startMarker && endMarker) {
      getRoute();
    }
  });

  return marker;
}

// Function to fetch and display the route
async function getRoute() {
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  const apiKey = "5b3ce3597851110001cf6248626d2861289f4f8b9e88658864f9c14f"; // Replace with your OpenRouteService API key
  const url =
    "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";

  const coordinates = [
    [startMarker.getLatLng().lng, startMarker.getLatLng().lat],
    [endMarker.getLatLng().lng, endMarker.getLatLng().lat],
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ coordinates }),
    });

    const data = await response.json();

    routeLayer = L.geoJSON(data, {
      style: {
        color: "blue",
        weight: 4,
      },
    }).addTo(map);
  } catch (error) {
    console.error("Error fetching route:", error);
  }
}

// Function to handle adding markers
function handleMapClick(e) {
  if (!startMarker) {
    startMarker = createMarker(e.latlng, "Start");
  } else if (!endMarker) {
    endMarker = createMarker(e.latlng, "End");
    getRoute();
  }
}

// Map click event to add markers using Shift+Click on desktop
map.on("click", function (e) {
  if (e.originalEvent.shiftKey) {
    handleMapClick(e);
  }
});

// Map contextmenu event to add markers using long press on mobile and right-click on desktop
map.on("contextmenu", function (e) {
  e.originalEvent.preventDefault(); // Prevent the default context menu
  handleMapClick(e);
});

// Geolocation functionality
document
  .getElementById("setLocationBtn")
  .addEventListener("click", function () {
    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const userLatLng = L.latLng(
            position.coords.latitude,
            position.coords.longitude
          );

          // Check if user's location is within the map bounds
          if (bounds.contains(userLatLng)) {
            // If startMarker doesn't exist, create it
            if (!startMarker) {
              startMarker = createMarker(userLatLng, "Start");
            } else {
              // Move the existing startMarker to the new location
              startMarker.setLatLng(userLatLng);
            }
            // Optionally, move the map view to the user's location
            map.panTo(userLatLng);
          } else {
            // User is outside the map bounds
            alert("You're not within TAMIU map range");
          }
        },
        function (error) {
          // Handle geolocation errors
          alert("Unable to retrieve your location. Please make sure to have updated browser.");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  });

// Reset button functionality
document.getElementById("resetBtn").addEventListener("click", function () {
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
  }
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
  }
  if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
  }
});
