<template>
  <div class="route-view">
    <div v-if="loading" class="loading">Loading route...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <!--
      RouteMap and PlayBack are siblings inside the parent so that progress,
      playing and speed state can be managed here and passed via props.
      PlayBack overlays on the map using absolute positioning.
    -->
    <template v-else>
      <RouteMap
        :pathData="pathData"
        :marksData="marksData"
        :duration="duration"
        :progress="progress"
        :playing="isPlaying"
        :speed="currentSpeed"
        :showMarks="false"
        @update:progress="onMapProgress"
      />
      <PlayBack
        :playing="isPlaying"
        :progress="progress"
        :elevationProfile="elevationProfile"
        :totalDistance="totalDistance"
        @toggle-play="onTogglePlay"
        @speed-change="onSpeedChange"
        @update:progress="onPlaybackScrub"
      />
    </template>
  </div>
</template>

<script>
import RouteMap from '@/components/RouteMap.vue';
import PlayBack from '@/components/PlayBack.vue';
import { parseElevationCsv } from '@/utils/parseElevationCsv';

// Route configuration: maps routeId to asset files and animation duration.
// New routes use combined GeoJSON + elevation CSV.
// Legacy routes use separate path JSON + marks JSON.
const ROUTE_CONFIG = {
  // --- New routes (GeoJSON with LineString + Points, CSV elevation profile) ---
  '15k': {
    geojson: () => import('@/assets/mc15k_route.geojson'),
    csv: () => import('@/assets/mc15k_perfil_elevacion.csv'),
    duration: 300000,
  },
  '42k': {
    geojson: () => import('@/assets/mc42k_route.geojson'),
    csv: () => import('@/assets/mc42k_perfil_elevacion.csv'),
    duration: 600000,
  },
  // --- Legacy routes (preserved for backward compatibility) ---
  '5k': {
    path: () => import('@/assets/5k.json'),
    marks: () => import('@/assets/marks_5k.json'),
    duration: 180000,
    legacy: true,
  },
  '10k': {
    path: () => import('@/assets/10k.json'),
    marks: () => import('@/assets/marks_10k.json'),
    duration: 300000,
    legacy: true,
  },
  '21k': {
    path: () => import('@/assets/21k.json'),
    marks: () => import('@/assets/marks_21k.json'),
    duration: 550000,
    legacy: true,
  },
};

export default {
  name: 'RouteMapView',
  components: {
    RouteMap,
    PlayBack,
  },
  data() {
    return {
      // Route data
      pathData: null,
      marksData: null,
      elevationProfile: [],
      totalDistance: 0,
      duration: 300000,
      // Shared playback state — single source of truth for both children
      progress: 0,
      isPlaying: true,
      currentSpeed: 1,
      // Loading state
      loading: true,
      error: null,
    };
  },
  watch: {
    '$route.params.routeId': {
      immediate: true,
      handler(routeId) {
        this.loadRouteData(routeId);
      },
    },
  },
  methods: {
    async loadRouteData(routeId) {
      this.loading = true;
      this.error = null;
      this.pathData = null;
      this.marksData = null;
      this.elevationProfile = [];
      this.totalDistance = 0;
      this.progress = 0;
      this.isPlaying = true;
      this.currentSpeed = 1;

      const config = ROUTE_CONFIG[routeId];
      if (!config) {
        this.error = `Route "${routeId}" not found.`;
        this.loading = false;
        return;
      }

      try {
        if (config.legacy) {
          // Legacy route: separate path + marks JSON files
          const [pathModule, marksModule] = await Promise.all([
            config.path(),
            config.marks(),
          ]);
          this.pathData = pathModule.default || pathModule;
          this.marksData = marksModule.default || marksModule;
          // No elevation CSV for legacy routes — PlayBack will use its placeholder
          this.elevationProfile = [];
          this.totalDistance = 0;
        } else {
          // New route: combined GeoJSON + elevation CSV
          const [geojsonModule, csvModule] = await Promise.all([
            config.geojson(),
            config.csv(),
          ]);

          const geojson = geojsonModule.default || geojsonModule;
          const csvText = csvModule.default || csvModule;

          // Split GeoJSON into:
          //   - pathData:  FeatureCollection with the LineString (route geometry)
          //   - marksData: FeatureCollection with Point features (enriched waypoints)
          const lineFeature = geojson.features.find(f => f.geometry.type === 'LineString');
          const pointFeatures = geojson.features.filter(f => f.geometry.type === 'Point');

          this.pathData = {
            type: 'FeatureCollection',
            features: lineFeature ? [lineFeature] : [],
          };

          // Marks preserved for future use (currently showMarks=false on RouteMap)
          this.marksData = {
            type: 'FeatureCollection',
            features: pointFeatures,
          };

          // Parse elevation CSV into numeric-typed array
          this.elevationProfile = parseElevationCsv(csvText);

          // Total distance from the last profile point
          if (this.elevationProfile.length > 0) {
            this.totalDistance = this.elevationProfile[this.elevationProfile.length - 1].distance_km_cum;
          }
        }

        this.duration = config.duration;
      } catch (err) {
        console.error('Failed to load route data:', err);
        this.error = 'Failed to load route data.';
      } finally {
        this.loading = false;
      }
    },

    // Animation drives progress updates — RouteMap → parent → PlayBack
    onMapProgress(val) {
      this.progress = val;
    },

    // Scrub drives progress updates — PlayBack → parent → RouteMap
    onPlaybackScrub(val) {
      this.progress = val;
    },

    // Play/pause state — PlayBack → parent → RouteMap (via playing prop)
    onTogglePlay(playing) {
      this.isPlaying = playing;
    },

    // Speed change — PlayBack → parent → RouteMap (via speed prop)
    onSpeedChange(speed) {
      this.currentSpeed = speed;
    },
  },
};
</script>

<style scoped>
.route-view {
  width: 100%;
  height: 100vh;
  position: relative;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.2rem;
  color: #a1a1a1;
  background: #0a0a0a;
}

.error {
  color: #ff5252;
}
</style>
