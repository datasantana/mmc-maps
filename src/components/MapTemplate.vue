<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import path from '../assets/21k.json'; // Adjust the path to your GeoJSON file
import  turf from 'turf';

export default {
  name: 'map-template',
  mounted() {
    // Replace with your actual Mapbox access token.
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg';
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/geostudio/cmbh999uh001901qt6te20agp', // Map style URL.
      center: [-76.5410942407, 3.4300127118], // Starting position [lng, lat].
      zoom: 17, // Starting zoom level.
      pitch: 45, // Set the pitch of the map.
    });

    this.map.on('load', () => {
      // Define a startBearing for camera movement
      const startBearing = 0;
      
      // Add a GeoJSON source with a line string
      this.map.addSource('line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: path.features[0].geometry.coordinates // Use the coordinates from your GeoJSON file
          }
        },
        lineMetrics: true // Enable line metrics for accurate rendering
      });

      // Add a layer to visualize the line
      this.map.addLayer({
        id: 'lineLayer',
        type: 'line',
        source: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        // Initial dash settings set to a visible dash pattern
        paint: {
          'line-color': '#888',
          'line-width': 8,
        },
      });

      
      // Start the animation
      let startTime;
      const duration = 120000;
      
      const frame = (time) => {
        if (!startTime) startTime = time;
        const animationPhase = (time - startTime) / duration;
        
        // Calculate the length of the line
        const pathDistance = turf.lineDistance(path.features[0]);
        //console.log(`Path distance: ${pathDistance} km`);
        // Get the current coordinate along the line head
        const[lng, lat] = turf.along(path.features[0], pathDistance * animationPhase).geometry.coordinates;
        //console.log(`Current position: ${lng}, ${lat}`)
        const bearing = startBearing - animationPhase * 300.0;

        // Define a helper to compute the camera position
        const computeCameraPosition = (pitch, bearing, targetPosition, altitude, smooth = false) => {
          const bearingInRadian = bearing / 57.29;
          const pitchInRadian = (90 - pitch) / 57.29;

          const lngDiff = ((altitude * Math.tan(pitchInRadian)) * Math.sin(-bearingInRadian)) / 70000;
          const latDiff = ((altitude * Math.tan(pitchInRadian)) * Math.cos(-bearingInRadian)) / 110000;

          const correctedLng = targetPosition[0] + lngDiff;
          const correctedLat = targetPosition[1] - latDiff;

          const newCameraPosition = {
            center: [correctedLng, correctedLat],
            zoom: 17,
            pitch: pitch,
            bearing: bearing
          };
          if (smooth) {
            this.map.easeTo(newCameraPosition);
          } else {
            this.map.jumpTo(newCameraPosition);
          }
          return newCameraPosition;
        };
  
        // Update the line gradient to visually reveal the path
        this.map.setPaintProperty("lineLayer", "line-gradient", [
          "step",
          ["line-progress"],
          "red",
          animationPhase,
          "rgba(0, 0, 0, 0)"
        ]);

        // Update camera position using computed current position;
        // altitude can be adjusted as needed (e.g., 500)
        computeCameraPosition(45, bearing, [lng, lat], 50, false);

        if (animationPhase <= 1) {
          window.requestAnimationFrame(frame);
        }
      };

      window.requestAnimationFrame(frame);

      // repeat
      setInterval(() => {
        startTime = undefined;
        window.requestAnimationFrame(frame);
      }, duration + 1500);
    });
  }
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}
</style>