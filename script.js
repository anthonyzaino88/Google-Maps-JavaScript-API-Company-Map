function initMap() {
  // This function initializes the map and sets up the Google Maps API. It also fetches data and calls the `displayStores` function to display store data on the map and in a list.
  const map = new google.maps.Map(document.getElementById("map"), {
    mapId: "Your Map ID",
    center: { lat: 53.818946, lng: -88.831067 },
    zoom: 4,
  });

  const apiKey = Your API;
  const infoWindow = new google.maps.InfoWindow();
  const storesList = document.getElementById("reps-list");
  let zipCode = null;

  fetch("repsdata.json")
    .then((response) => response.json())
    .then((data) => {
      displayStores(data, storesList, infoWindow, map);
    })
    .catch((error) => console.error(error));

  function displayStores(data, storesList, infoWindow, map) {
    // This function displays the store data on the map and in a list. It takes in the data, the HTML element for the store list, the info window object, and the map object as parameters.
    const stores = data.features;
    let storesHTML = "";

    // Create an array of markers for each store location
    const markers = stores.map((feature) => {
      const position = {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      };
      const marker = new google.maps.Marker({
        position: position,
        map: map,
      });

      const repsListWrapper = document.querySelector(".reps-list-wrapper");
      const mapWrapper = document.querySelector(".map-wrapper");
      const searchContainer = document.querySelector("#search-container");

      marker.addListener("click", () => {
        displayStoreInfo(feature, infoWindow, map);
        mapWrapper.classList.toggle("map-wrapper--expanded");
        repsListWrapper.classList.toggle("hidden");
        searchContainer.style.display = "none";
      });

      return marker;
    });

    const markerClusterOptions = {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
      zoomOnClick: true,
    };

    const markerCluster = new MarkerClusterer(
      map,
      markers,
      markerClusterOptions
    );

    // Create HTML for each store and add it to the store list element

    stores.forEach((feature, index) => {
      const Div = document.createElement("div");
      Div.classList.add("card");
      Div.setAttribute("data-address", feature.properties.address);

      Div.innerHTML = `
        <div class="card-header">
          <h3 class="marker-card__title">${feature.properties.name}</h3>
        </div>
        <div class="card-body">
          <div class="card-description">${feature.properties.description}</div>
          <div class="card-details">
            <div class="card-details__item">
              <i class="fas fa-clock"></i>
              <span>${feature.properties.hours || "N/A"}</span>
            </div>
            <div class="card-details__item">
              <i class="fas fa-map-marker-alt"></i>
              <span>${feature.properties.address}</span>
            </div>
            <div class="card-details__item">
              <i class="fas fa-phone"></i>
              <span>${feature.properties.phone}</span>
            </div>
          </div>
        </div>
      `;

      // Add a click event listener to each store card that displays information about the store

      const repsListWrapper = document.querySelector(".reps-list-wrapper");
      const mapWrapper = document.querySelector(".map-wrapper");
      const searchContainer = document.querySelector("div#search-container");

      Div.addEventListener("click", () => {
        displayStoreInfo(feature, infoWindow, map);
        mapWrapper.classList.toggle("map-wrapper--expanded");
        repsListWrapper.classList.toggle("hidden");
        searchContainer.style.display = "none";
      });

      storesList.appendChild(Div);
    });
  }

  function displayStoreInfo(feature, infoWindow, map) {
    const position = {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    };
    const address = feature.properties.address;
    const name = feature.properties.name;

    const content = `
      <div class="marker-card">
        <h2 class="marker-card__title">${name}</h2>
        <div class="marker-card__info">
          <div class="marker-card__icon"><i class="fas fa-clock"></i></div>
          <p class="marker-card__text">${
            feature.properties.hours || "Call for more information"
          }</p>
        </div>
        <div class="marker-card__info">
          <div class="marker-card__icon"><i class="fas fa-map-marker-alt"></i></div>
          <p class="marker-card__text">${address}</p>
        </div>
        <div class="marker-card__info">
          <div class="marker-card__icon"><i class="fas fa-phone"></i></div>
          <p class="marker-card__text">${feature.properties.phone}</p>
        </div>
        <button id="directions-btn">Get Directions</button>
      </div>
    `;

    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.setOptions({
      maxWidth: 400,
      pixelOffset: new google.maps.Size(0, 100),
    });
    infoWindow.open(map);

    google.maps.event.addListener(infoWindow, "closeclick", () => {
      const repsListWrapper = document.querySelector(".reps-list-wrapper");
      const mapWrapper = document.querySelector(".map-wrapper--expanded");
      const searchContainer = document.querySelector("#search-container");
      repsListWrapper.classList.remove("hidden");
      searchContainer.style.display = "flex";
      map.setCenter({ lat: 52.5790893, lng: -91.1316417 });
      map.setZoom(4);
      const storesList = document.getElementById("reps-list");
      const cards = storesList.querySelectorAll(".card");
      cards.forEach((card) => {
        card.style.opacity = 1;
        card.classList.remove("active");
      });
      storesList.scrollLeft = 0;
      mapWrapper.classList.remove("map-wrapper--expanded"); // remove the class from the mapWrapper element
    });

    // Add event listener to infoWindow's domready event to access the directions button
    google.maps.event.addListener(infoWindow, "domready", () => {
      const directionsBtn = document.getElementById("directions-btn");
      directionsBtn.addEventListener("click", () => {
        const destination = encodeURI(address);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, "_blank");
      });
    });

    google.maps.event.addListener(infoWindow, "closeclick", () => {
      map.setCenter({ lat: 52.5790893, lng: -91.1316417 });
      map.setZoom(4);
      const storesList = document.getElementById("reps-list");
      const cards = storesList.querySelectorAll(".card");
      cards.forEach((card) => {
        card.style.opacity = 1;
        card.classList.remove("active");
      });
      storesList.scrollLeft = 0;
    });

    // Scroll to the card that corresponds to the clicked marker
    const storesList = document.getElementById("reps-list");
    const cards = storesList.querySelectorAll(".card");

    cards.forEach((card) => {
      const cardAddress = card.querySelector(
        "div.card-details__item:nth-of-type(2) span"
      ).textContent;
      if (cardAddress === address) {
        // Highlight the card corresponding to the clicked marker
        card.classList.add("active");
        card.style.opacity = 1;

        // Scroll to the active card
        card.scrollIntoView({ behavior: "smooth" });
      } else {
        // Dim the other cards
        card.classList.remove("active");
        card.style.opacity = 0.5;
      }
    });

    map.panTo(position);
    map.setZoom(15);
  }

  // Add closeclick event listener to info window to reset map zoom and position, and reset opacity for all

  const searchInput = document.getElementById("store-search");
  const zipInput = document.getElementById("zip-search");
  const zipSearchButton = document.getElementById("zip-search-button");

  // Add event listener for search input
  searchInput.addEventListener("input", () => {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const stores = document.querySelectorAll("#reps-list .card");

    stores.forEach((store) => {
      const storeName = store
        .querySelector(".card-header h3")
        .textContent.toLowerCase();
      const storeAddress = store
        .querySelector(".card-details__item:nth-of-type(2) span")
        .textContent.toLowerCase();

      if (
        storeName.includes(searchQuery) ||
        storeAddress.includes(searchQuery)
      ) {
        store.style.display = "block";
      } else {
        store.style.display = "none";
      }
    });
  });

  // Add event listener for zip code search button
  zipSearchButton.addEventListener("click", () => {
    const zip = zipInput.value.trim();
    if (zip.length !== 6) {
      alert("Please enter a valid 6-digit zip code.");
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: zip }, (results, status) => {
      if (status === "OK") {
        const position = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        map.setCenter(position);
        map.setZoom(10);
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          animation: google.maps.Animation.DROP,
        });
        setTimeout(() => marker.setAnimation(null), 2000);
        infoWindow.close();

        searchStoresNearby(position);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  });

  // Add event listener for scrolling left
  const scrollLeftButton = document.getElementById("scroll-left-button");
  scrollLeftButton.addEventListener("click", () => {
    const storesList = document.getElementById("reps-list");
    storesList.scrollBy({
      left: -800, // You can adjust the value to change the amount of scrolling
      behavior: "smooth", // Add this line to make the scrolling smooth
    });
  });

  // Add event listener for scrolling right
  const scrollRightButton = document.getElementById("scroll-right-button");
  scrollRightButton.addEventListener("click", () => {
    const storesList = document.getElementById("reps-list");
    storesList.scrollBy({
      left: 800, // You can adjust the value to change the amount of scrolling
      behavior: "smooth", // Add this line to make the scrolling smooth
    });
  });
}
