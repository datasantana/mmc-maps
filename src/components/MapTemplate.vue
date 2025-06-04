<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';

export default {
  name: 'map-template',
  mounted() {
    // Replace with your actual Mapbox access token.
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg';
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: 'mapbox://styles/geostudio/cmbh999uh001901qt6te20agp', // Map style URL.
      center: [-74.006, 40.7128], // Starting position [lng, lat].
      zoom: 13 // Starting zoom level.
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