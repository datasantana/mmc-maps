<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>
    <PlayBack
      :playing="isPlaying"
      :progress="animationProgress"
      :distance="currentDistance"
      :elapsedTime="elapsedTime"
      @toggle-play="handleTogglePlay"
      @speed-change="handleSpeedChange"
    />
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import turf from 'turf';
import PlayBack from './PlayBack.vue';

export default {
  name: 'RouteMap',
  components: {
    PlayBack,
  },
  props: {
    pathData: {
      type: Object,
      required: true,
    },
    marksData: {
      type: Object,
      required: true,
    },
    duration: {
      type: Number,
      default: 300000,
    },
  },
  data() {
    return {
      isPlaying: true,
      animationProgress: 0,
      currentDistance: 0,
      elapsedTime: 0,
    };
  },
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
    if (this._repeatInterval) {
      clearInterval(this._repeatInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    initMap() {
      // Mapbox configuration from environment variables
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: process.env.VUE_APP_MAPBOX_STYLE || 'mapbox://styles/mapbox/streets-v11',
        center: [
          parseFloat(process.env.VUE_APP_MAPBOX_CENTER_LNG) || -76.5410942407,
          parseFloat(process.env.VUE_APP_MAPBOX_CENTER_LAT) || 3.4300127118,
        ],
        zoom: parseInt(process.env.VUE_APP_MAPBOX_ZOOM) || 17,
        pitch: parseInt(process.env.VUE_APP_MAPBOX_PITCH) || 45,
      });

      // Add navigation control with a compass and zoom controls.
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      this.map.on('load', () => {
        this.setupAnimation();
      });
    },

    setupAnimation() {
      const pathData = this.pathData;
      const marksData = this.marksData;
      const duration = this.duration;

      // Define a startBearing for camera movement
      const startBearing = 0;

      // Pre-calculate the total distance of the path
      const totalDistance = turf.lineDistance(pathData.features[0]);

      // Variables to control pause/resume state.
      let startTime;
      let isPaused = false;
      let pauseTimestamp = null;
      let speed = 1;

      // Expose speed control so PlayBack can drive it
      this._setSpeed = (newSpeed) => {
        const now = performance.now();
        const effectiveNow = isPaused ? pauseTimestamp : now;
        if (startTime !== undefined) {
          // Calculate current phase at old speed, then recompute startTime for new speed
          const elapsed = effectiveNow - startTime;
          const currentPhase = Math.min(elapsed / (duration / speed), 1);
          speed = newSpeed;
          // Set startTime so that (effectiveNow - startTime) / (duration / speed) === currentPhase
          startTime = effectiveNow - currentPhase * (duration / speed);
        } else {
          speed = newSpeed;
        }
      };

      // Expose pause/resume control so PlayBack can drive it
      this._togglePause = (playing) => {
        if (playing && isPaused) {
          // Resume
          isPaused = false;
          this.isPlaying = true;
          if (startTime !== undefined && pauseTimestamp !== null) {
            startTime += performance.now() - pauseTimestamp;
          }
          pauseTimestamp = null;
          this._animationFrame = window.requestAnimationFrame(frame);
        } else if (!playing && !isPaused) {
          // Pause
          isPaused = true;
          this.isPlaying = false;
          pauseTimestamp = performance.now();
        }
      };

      // Add click handler to pause/resume the animation.
      this.map.on('click', () => {
        this._togglePause(!this.isPlaying);
      });

      // Add single marks source
      this.map.addSource('marks', {
        type: 'geojson',
        data: marksData,
      });

      // Load all marker images
      const markerImages = [
        { id: 'distance-marker', path: require('../assets/dist-mark.png') },
        { id: 'hydration-marker', path: require('../assets/punto-hidratacion-2.png') },
        { id: 'gatorade-marker', path: require('../assets/punto-hidratacion-1.png') },
        { id: 'start-marker', path: require('../assets/start-mark.png') },
        { id: 'finish-marker', path: require('../assets/finish-mark.png') },
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
            'icon-image': 'distance-marker',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          },
          paint: {
            'text-color': '#e4e4e4',
            'text-halo-color': 'rgba(0, 0, 0, 0.7)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          },
        });

        // Hydration markers
        this.map.addLayer({
          id: 'hydrationMarkersLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Hidratacion'],
          layout: {
            'icon-image': 'hydration-marker',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom',
            'text-offset': [0, -0.5],
            'text-anchor': 'bottom',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#e4e4e4',
            'text-halo-color': 'rgba(0, 0, 0, 0.7)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          },
        });

        // Gatorade markers
        this.map.addLayer({
          id: 'gatoradeMarkersLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Gatorade'],
          layout: {
            'icon-image': 'gatorade-marker',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'icon-anchor': 'bottom',
            'text-offset': [0, -0.5],
            'text-anchor': 'bottom',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
          },
          paint: {
            'text-color': '#e4e4e4',
            'text-halo-color': 'rgba(0, 0, 0, 0.7)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          },
        });

        // Start marker
        this.map.addLayer({
          id: 'startMarkerLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Salida'],
          layout: {
            'icon-image': 'start-marker',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'text-field': 'SALIDA',
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14,
          },
          paint: {
            'text-color': '#00ff00',
            'text-halo-color': 'rgba(0, 0, 0, 0.7)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          },
        });

        // Finish marker
        this.map.addLayer({
          id: 'finishMarkerLayer',
          type: 'symbol',
          source: 'marks',
          filter: ['==', ['get', 'name'], 'Llegada'],
          layout: {
            'icon-image': 'finish-marker',
            'icon-size': 0.2,
            'icon-allow-overlap': true,
            'text-field': 'META',
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14,
          },
          paint: {
            'text-color': '#ff0000',
            'text-halo-color': 'rgba(0, 0, 0, 0.7)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          },
        });
      };

      // Load all images and add layers when complete
      markerImages.forEach((marker) => {
        this.map.loadImage(marker.path, (error, image) => {
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
        });
      });

      // Add a GeoJSON source with a line string
      this.map.addSource('line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: pathData.features[0].geometry.coordinates,
          },
        },
        lineMetrics: true,
      });

      // Add a layer to visualize the line
      this.map.addLayer({
        id: 'lineLayer',
        type: 'line',
        source: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
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
            coordinates: [],
          },
        },
      });
      this.map.addLayer({
        id: 'headLayer',
        type: 'circle',
        source: 'head',
        paint: {
          'circle-radius': 15,
          'circle-color': 'red',
        },
      });

      const frame = (time) => {
        if (!startTime) startTime = time;

        // If paused, skip updating and request the next frame.
        if (isPaused) {
          this._animationFrame = window.requestAnimationFrame(frame);
          return;
        }

        // Clamp animationPhase to 1 to avoid overshooting
        let animationPhase = Math.min((time - startTime) / (duration / speed), 1);

        // Update reactive state for PlayBack
        this.animationProgress = animationPhase;
        const currentDistance = totalDistance * animationPhase;
        this.currentDistance = currentDistance;
        this.elapsedTime = time - startTime;
        const { coordinates } = turf.along(pathData.features[0], currentDistance).geometry;
        const [lng, lat] = coordinates;
        const bearing = startBearing - animationPhase * 300.0;

        // Update the camera position
        const computeCameraPosition = (pitch, bearing, targetPosition, altitude, smooth = false) => {
          const bearingInRadian = bearing / 57.29;
          const pitchInRadian = (90 - pitch) / 57.29;

          const lngDiff =
            ((altitude * Math.tan(pitchInRadian)) * Math.sin(-bearingInRadian)) / 70000;
          const latDiff =
            ((altitude * Math.tan(pitchInRadian)) * Math.cos(-bearingInRadian)) / 110000;

          const newCameraPosition = {
            center: [targetPosition[0] + lngDiff, targetPosition[1] - latDiff],
            zoom: 17,
            pitch: pitch,
            bearing: bearing,
          };
          if (smooth) {
            this.map.jumpTo(newCameraPosition);
          } else {
            this.map.easeTo(newCameraPosition);
          }
          return newCameraPosition;
        };

        computeCameraPosition(45, bearing, [lng, lat], 50, true);

        // Update the head circle so it stays synchronized with the camera and path
        const headFeature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        };
        this.map.getSource('head').setData(headFeature);

        // Apply a two-tone gradient to the line layer
        const safePhase = Math.max(animationPhase, 0.0001);
        this.map.setPaintProperty('lineLayer', 'line-gradient', [
          'case',
          ['<', ['line-progress'], safePhase],
          [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            'green',
            safePhase,
            'red',
          ],
          'rgba(0, 0, 0, 0)',
        ]);

        if (animationPhase < 1) {
          this._animationFrame = window.requestAnimationFrame(frame);
        }
      };

      this._animationFrame = window.requestAnimationFrame(frame);

      // Repeat the animation after a delay
      this._repeatInterval = setInterval(() => {
        startTime = undefined;
        this.animationProgress = 0;
        this.currentDistance = 0;
        this.elapsedTime = 0;
        this._animationFrame = window.requestAnimationFrame(frame);
      }, duration + 1500);
    },

    handleTogglePlay(playing) {
      if (this._togglePause) {
        this._togglePause(playing);
      }
    },

    handleSpeedChange(newSpeed) {
      if (this._setSpeed) {
        this._setSpeed(newSpeed);
      }
    },
  },
};
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}
.map {
  width: 100%;
  height: 100%;
}
</style>
