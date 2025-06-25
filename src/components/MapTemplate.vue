<template>
  <div ref="mapContainer" class="map"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import path from '../assets/21k.json'; // Adjust the path to your GeoJSON file
import marks from '../assets/marks_21k.json'; // Single JSON file with all marks
import turf from 'turf';

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

    // Add navigation control with a compass and zoom controls.
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      // Define a startBearing for camera movement
      const startBearing = 0;

      // Pre-calculate the total distance of the path
      const totalDistance = turf.lineDistance(path.features[0]);

      // Variables to control pause/resume state.
      let startTime;
      const duration = 550000;
      let isPaused = false;
      let pauseTimestamp = null;

      // Add click handler to pause/resume the animation.
      this.map.on('click', () => {
        if (!isPaused) {
          // Pause animation.
          isPaused = true;
          pauseTimestamp = performance.now();
        } else {
          // Resume animation, adjusting startTime so animation resumes smoothly.
          isPaused = false;
          if (startTime !== undefined) {
            startTime += performance.now() - pauseTimestamp;
          }
          pauseTimestamp = null;
        }
      });

      // Add single marks source
      this.map.addSource('marks', {
        type: 'geojson',
        data: marks,
      });

      // Load all marker images
      const markerImages = [
        { id: 'distance-marker', path: require('../assets/dist-mark.png') },
        { id: 'hydration-marker', path: require('../assets/punto-hidratacion-2.png') },
        { id: 'gatorade-marker', path: require('../assets/punto-hidratacion-1.png') },
        { id: 'start-marker', path: require('../assets/start-mark.png') },
        { id: 'finish-marker', path: require('../assets/finish-mark.png') }
      ];

      let imagesLoaded = 0;
      const totalImages = markerImages.length;

      const addMarkersLayers = () => {
        // Distance markers (KM%)
        this.map.addLayer({
          id: 'distanceMarkersLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['all', ['>=', ['index-of', 'KM', ['get', 'name']], 0]],
          layout: {
            "icon-image": "distance-marker",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "text-field": ["get", "name"],
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
          },
          paint: {
            "text-color": "#e4e4e4",
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          }
        });

        // Hydration markers
        this.map.addLayer({
          id: 'hydrationMarkersLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Hidratacion'],
          layout: {
            "icon-image": "hydration-marker",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
            //"text-field": 'Punto\nHidratación',
            "text-offset": [0, -0.5],
            "text-anchor": "bottom",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 12
          },
          paint: {
            "text-color": "#e4e4e4",
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          }
        });

        // Gatorade markers
        this.map.addLayer({
          id: 'gatoradeMarkersLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Gatorade'],
          layout: {
            "icon-image": "gatorade-marker",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
            //"text-field": 'Hidratación\nGatorade',
            "text-offset": [0, -0.5],
            "text-anchor": "bottom",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 10
          },
          paint: {
            "text-color": "#e4e4e4",
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          }
        });

        // Start marker
        this.map.addLayer({
          id: 'startMarkerLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Salida'],
          layout: {
            "icon-image": "start-marker",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "text-field": 'SALIDA',
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14
          },
          paint: {
            "text-color": "#00ff00",
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          }
        });

        // Finish marker
        this.map.addLayer({
          id: 'finishMarkerLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Llegada'],
          layout: {
            "icon-image": "finish-marker",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "text-field": 'META',
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14
          },
          paint: {
            "text-color": "#ff0000",
            "text-halo-color": "rgba(0, 0, 0, 0.7)",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          }
        });
      };

      // Load all images and add layers when complete
      markerImages.forEach(marker => {
        this.map.loadImage(
          marker.path,
          (error, image) => {
            if (error) {
              console.error(`Error loading ${marker.id} image:`, error);
              return;
            }
            if (!this.map.hasImage(marker.id)) {
              this.map.addImage(marker.id, image);
            }
            imagesLoaded++;
            
            // Add all layers once all images are loaded
            if (imagesLoaded === totalImages) {
              addMarkersLayers();
            }
          }
        );
      });
      
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

      // Add a source and layer for the red circle at the head of the path
      this.map.addSource('head', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [] // Initially empty
          }
        }
      });
      this.map.addLayer({
        id: 'headLayer',
        type: 'circle',
        source: 'head',
        paint: {
          'circle-radius': 15,
          'circle-color': 'red'
        }
      });
      
      const frame = (time) => {
        if (!startTime) startTime = time;

        // If paused, skip updating and request the next frame.
        if (isPaused) {
          window.requestAnimationFrame(frame);
          return;
        }

        // Clamp animationPhase to 1 to avoid overshooting
        let animationPhase = Math.min((time - startTime) / duration, 1);
        
        // Calculate current position along the path
        const currentDistance = totalDistance * animationPhase;
        const { coordinates } = turf.along(path.features[0], currentDistance).geometry;
        const [lng, lat] = coordinates;
        const bearing = startBearing - animationPhase * 300.0;
        
        // Update the camera position
        const computeCameraPosition = (pitch, bearing, targetPosition, altitude, smooth = false) => {
          const bearingInRadian = bearing / 57.29;
          const pitchInRadian = (90 - pitch) / 57.29;
          
          const lngDiff = ((altitude * Math.tan(pitchInRadian)) * Math.sin(-bearingInRadian)) / 70000;
          const latDiff = ((altitude * Math.tan(pitchInRadian)) * Math.cos(-bearingInRadian)) / 110000;
          
          const newCameraPosition = {
            center: [targetPosition[0] + lngDiff, targetPosition[1] - latDiff],
            zoom: 17,
            pitch: pitch,
            bearing: bearing
          };
          if (smooth) {
            this.map.jumpTo(newCameraPosition);
          } else {
            this.map.easeTo(newCameraPosition);
          }
          return newCameraPosition;
        };
        
        computeCameraPosition(45, bearing, [lng,lat], 50, true);
        
        // Update the head circle so it stays synchronized with the camera and path
        const headFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        };
        this.map.getSource('head').setData(headFeature);
        
        // Apply a two-tone gradient to the line layer:
        // For points along the revealed part of the line (line-progress < animationPhase)
        // interpolate from green at the start to red at the current head.
        // The unrevealed portion remains transparent.
        this.map.setPaintProperty("lineLayer", "line-gradient", [
          "case",
          [ "<", ["line-progress"], animationPhase ],
          [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0, "green",
            animationPhase, "red"
          ],
          "rgba(0, 0, 0, 0)"
        ]);
        
        if (animationPhase < 1) {
          window.requestAnimationFrame(frame);
        }
      };

      window.requestAnimationFrame(frame);

      // Repeat the animation after a delay
      // This will reset the startTime to allow the animation to restart smoothly.
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