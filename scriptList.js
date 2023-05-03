fetch("repsdata.json")
  .then((response) => response.json())
  .then((data) => {
    const repsList = document.getElementById("reps-list");
    data.features.forEach((feature) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <p><strong>${feature.properties.name}</strong></p>
        <p>${feature.properties.description}</p>
        <p>${feature.properties.address}</p>
        <p>${feature.properties.phone}</p>
        ${feature.properties.hours ? `<p>${feature.properties.hours}</p>` : ""}
      `;
      li.addEventListener("click", () => {
        const position = {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
        };
        map.panTo(position);
        map.setZoom(15);
        const content = `
          <div class="marker-card">
            <h2>${feature.properties.name}</h2>
            <p>${feature.properties.description}</p>
            <p><b>Open:</b> ${feature.properties.hours || "N/A"}<br/>
            <p><b>Address:</b> ${feature.properties.address}</p>
            <b>Phone:</b> ${feature.properties.phone}</p>
          </div>
        `;
        const infoWindow = new google.maps.InfoWindow({
          content: content,
          position: position,
          pixelOffset: new google.maps.Size(0, -30),
        });
        infoWindow.open(map);
      });
      repsList.appendChild(li);
    });
  })
  .catch((error) => console.error(error));
