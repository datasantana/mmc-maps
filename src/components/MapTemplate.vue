<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import path from '../assets/5k.json'; // Adjust the path to your GeoJSON file

export default {
  name: 'map-template',
  mounted() {
    // Replace with your actual Mapbox access token.
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg';
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/geostudio/cmbh999uh001901qt6te20agp', // Map style URL.
      center: [-76.5410942407, 3.4300127118], // Starting position [lng, lat].
      zoom: 18, // Starting zoom level.
      pitch: 45, // Set the pitch of the map.
    });

    this.map.on('load', () => {

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
        paint: {
          'line-color': '#888',
          'line-width': 8
        }
      });
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