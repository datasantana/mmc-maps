<template>
  <!-- PlayBack removed from here — now a sibling in the parent view for proper progress sync -->
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import turf from 'turf';

export default {
  name: 'RouteMap',
  props: {
    // GeoJSON FeatureCollection — features[0] must be a LineString
    pathData: {
      type: Object,
      required: true,
    },
    // GeoJSON FeatureCollection of Point features (marks) — kept for future use
    marksData: {
      type: Object,
      default: () => ({ type: 'FeatureCollection', features: [] }),
    },
    // Animation duration in milliseconds
    duration: {
      type: Number,
      default: 300000,
    },
    // Current progress (0–1) synced with parent for PlayBack coordination
    progress: {
      type: Number,
      default: 0,
    },
    // Whether the animation is currently playing (driven by parent)
    playing: {
      type: Boolean,
      default: true,
    },
    // Speed multiplier for animation (driven by parent)
    speed: {
      type: Number,
      default: 1,
    },
    // Toggle to activate marks rendering — disabled for now
    showMarks: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:progress'],
  mounted() {
    this.initMap();
  },
  beforeUnmount() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
    if (this._restartTimeout) {
      clearTimeout(this._restartTimeout);
    }
    if (this.map) {
      this.map.remove();
    }
  },
  watch: {
    // External seek — when PlayBack scrub changes progress significantly
    progress(newVal) {
      if (this._seekToPhase && Math.abs(newVal - (this._internalPhase || 0)) > 0.002) {
        this._seekToPhase(newVal);
      }
    },
    // React to play/pause from parent
    playing(newVal) {
      if (this._togglePause) {
        this._togglePause(newVal);
      }
    },
    // React to speed changes from parent
    speed(newVal) {
      if (this._setSpeed) {
        this._setSpeed(newVal);
      }
    },
  },
  methods: {
    initMap() {
      // Mapbox configuration from environment variables
      mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_ACCESS_TOKEN || '';
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: process.env.VUE_APP_MAPBOX_STYLE || 'mapbox://styles/mapbox/standard',
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

      // Extract the LineString feature (first feature in the FeatureCollection)
      const lineFeature = pathData.features[0];

      // Pre-calculate the total distance of the path (2D; turf ignores the 3rd coordinate)
      const totalDistance = turf.lineDistance(lineFeature);

      // Animation state variables
      let startTime;
      let isPaused = !this.playing;
      let pauseTimestamp = isPaused ? performance.now() : null;
      let speed = this.speed;

      // Internal phase tracking for external-seek detection
      this._internalPhase = 0;

      // --- Speed control (called from speed watcher) ---
      this._setSpeed = (newSpeed) => {
        const now = performance.now();
        const effectiveNow = isPaused ? pauseTimestamp : now;
        if (startTime !== undefined) {
          const elapsed = effectiveNow - startTime;
          const currentPhase = Math.min(elapsed / (duration / speed), 1);
          speed = newSpeed;
          startTime = effectiveNow - currentPhase * (duration / speed);
        } else {
          speed = newSpeed;
        }
      };

      // --- Pause / resume control (called from playing watcher) ---
      this._togglePause = (playing) => {
        if (playing && isPaused) {
          // Resume
          isPaused = false;
          if (startTime !== undefined && pauseTimestamp !== null) {
            startTime += performance.now() - pauseTimestamp;
          }
          pauseTimestamp = null;
          this._animationFrame = window.requestAnimationFrame(frame);
        } else if (!playing && !isPaused) {
          // Pause
          isPaused = true;
          pauseTimestamp = performance.now();
          if (this._animationFrame) {
            cancelAnimationFrame(this._animationFrame);
          }
        }
      };

      // --- Seek control (called from progress watcher) ---
      this._seekToPhase = (targetPhase) => {
        const clampedPhase = Math.max(0, Math.min(1, targetPhase));
        const now = performance.now();
        const effectiveNow = isPaused ? (pauseTimestamp || now) : now;

        // Adjust startTime so animation phase matches the target
        startTime = effectiveNow - clampedPhase * (duration / speed);
        this._internalPhase = clampedPhase;

        // Immediately update the map display at the new position
        updateDisplay(clampedPhase);

        // If animation had stopped (phase ≥ 1), restart the frame loop
        if (!isPaused && clampedPhase < 1) {
          if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
          if (this._restartTimeout) clearTimeout(this._restartTimeout);
          this._animationFrame = window.requestAnimationFrame(frame);
        }
      };

      // ---------------------------------------------------------------
      // Marks system — preserved for future use.
      // Set showMarks=true and provide marksData with Point features
      // to reactivate the markers layer.
      // ---------------------------------------------------------------
      if (this.showMarks && marksData && marksData.features && marksData.features.length > 0) {
        this.map.addSource('marks', {
          type: 'geojson',
          data: marksData,
        });
        this._loadMarkerImagesAndLayers();
      }

      // --- Route line source ---
      this.map.addSource('line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineFeature.geometry.coordinates,
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

      // --- Animated head marker (red circle at front of the path) ---
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

      // --- Camera position computation ---
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

      // --- Display update helper (used by both animation frame and seek) ---
      const updateDisplay = (phase) => {
        const currentDistance = totalDistance * phase;
        const { coordinates } = turf.along(lineFeature, currentDistance).geometry;
        const [lng, lat] = coordinates;
        const bearing = startBearing - phase * 300.0;

        computeCameraPosition(45, bearing, [lng, lat], 50, true);

        // Update the head circle
        this.map.getSource('head').setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });

        // Two-tone gradient on the route line
        const safePhase = Math.max(phase, 0.0001);
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
      };

      // --- Animation frame loop ---
      const frame = (time) => {
        if (!startTime) startTime = time;

        // Safety: if paused between RAF schedule and execution, stop
        if (isPaused) return;

        // Clamp animationPhase to 1 to avoid overshooting
        let animationPhase = Math.min((time - startTime) / (duration / speed), 1);

        // Track internal phase for seek-detection in the progress watcher
        this._internalPhase = animationPhase;

        // Notify parent of the current progress
        this.$emit('update:progress', animationPhase);

        updateDisplay(animationPhase);

        if (animationPhase < 1) {
          this._animationFrame = window.requestAnimationFrame(frame);
        } else {
          // Animation complete — restart after a short delay
          this._restartTimeout = setTimeout(() => {
            startTime = undefined;
            this._internalPhase = 0;
            this.$emit('update:progress', 0);
            this._animationFrame = window.requestAnimationFrame(frame);
          }, 1500);
        }
      };

      this._animationFrame = window.requestAnimationFrame(frame);
    },

    /**
     * Marks: image loading and layer creation.
     * Preserved intact for future use — currently inactive when showMarks=false.
     * To reactivate: set showMarks=true and ensure marksData has Point features
     * with a `name` property (e.g. "KM5", "Hidratacion", "Gatorade", "Salida", "Llegada").
     */
    _loadMarkerImagesAndLayers() {
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
