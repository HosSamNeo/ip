const searchForm = document.querySelector("form");
const searchInput = document.querySelector("#search");
let mapboxURL = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
let grayscale = L.tileLayer(mapboxURL, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: ""}),
    streets   = L.tileLayer(mapboxURL, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: ""}),
    satellite = L.tileLayer(mapboxURL, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: ""});


let customMarker;

let blackLocationMarker = L.icon({
    iconUrl: 'images/icon-location.svg',
    iconSize:     [46, 56],
    iconAnchor:   [22, 94],
});


let mymap = L.map('live-map', {
    zoomControl: false,
	layers: [streets]
}).setView([41.145767, -98.439308], 4);

L.control.layers({
    "Grayscale": grayscale,
    "Streets": streets,
    "Satellite": satellite
}, "", { position: "bottomright"}).addTo(mymap);




function searchTracker(event) {
    event.preventDefault();
    let searchValue = searchInput.value.trim();

    if (validIPAddress(searchValue)) {
        callIPifyAPI(searchValue);
        return
    }
    if (validDomain(searchValue)) {
        callIPifyAPI(searchValue, "domain");
        return
    }

    alert("Please enter a valid Domain or IP Address");
}

searchForm.addEventListener("submit", searchTracker);



function validIPAddress(value) {
    return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value);
}

function validDomain(value) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(value);
}


function callIPifyAPI(value, searchType = "ip") {
    searchQuery = "ipAddress=" + value;
    if (searchType == "domain") {
        searchQuery = searchQuery.replace("ipAddress", "domain");
    }

    fetch("https://geo.ipify.org/api/v1?apiKey=at_C92aBZ9a4WqwVYqDlf48yJIFglSNe&" + searchQuery)
        .then(response => {
            if (!response.ok) {
                throw response.statusText;
            }
            return response.json();
        })
        .then(data => {
            let lng = data.location.lng;
            let lat = data.location.lat;
            const ip = document.querySelector("#ip-api");
            const location = document.querySelector("#loc-api");
            const time = document.querySelector("#time-api");
            const internetSP = document.querySelector("#isp-api");
            ip.innerHTML = data.ip;
            location.innerHTML = data.location.city + ", " + data.location.region + " " + data.location.postalCode;
            time.innerHTML = "UTC" + data.location.timezone;
            internetSP.innerHTML = data.isp;

            mymap.setView([lat, lng], 15);
            if (customMarker != null) {
                customMarker.remove();
            }
            customMarker = new L.Marker([lat, lng], {icon: blackLocationMarker});
            customMarker.addTo(mymap);
        })
        .catch(error => {
            alert("Something went wrong\n" + error);
        });
}

function userLocationGranted(position) {
    

   fetch("https://api.ipify.org?format=json")
        .then(response => {
            if (!response.ok) {
                throw response.statusText;
            }
            return response.json();
        })
        .then(data => {
            callIPifyAPI(data.ip);
        })
        .catch(error => {
            alert("Something went wrong\n" + error);
        });
}
navigator.geolocation.getCurrentPosition(userLocationGranted);
