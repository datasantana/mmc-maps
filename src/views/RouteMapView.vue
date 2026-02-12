<template>
  <div class="route-view">
    <div v-if="loading" class="loading">Loading route...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <RouteMap
      v-else
      :pathData="pathData"
      :marksData="marksData"
      :duration="duration"
    />
  </div>
</template>

<script>
import RouteMap from '@/components/RouteMap.vue';

// Route configuration: maps routeId to asset files and animation duration
const ROUTE_CONFIG = {
  '5k': {
    path: () => import('@/assets/5k.json'),
    marks: () => import('@/assets/marks_5k.json'),
    duration: 180000,
  },
  '10k': {
    path: () => import('@/assets/10k.json'),
    marks: () => import('@/assets/marks_10k.json'),
    duration: 300000,
  },
  '21k': {
    path: () => import('@/assets/21k.json'),
    marks: () => import('@/assets/marks_21k.json'),
    duration: 550000,
  },
};

export default {
  name: 'RouteMapView',
  components: {
    RouteMap,
  },
  data() {
    return {
      pathData: null,
      marksData: null,
      duration: 300000,
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

      const config = ROUTE_CONFIG[routeId];
      if (!config) {
        this.error = `Route "${routeId}" not found.`;
        this.loading = false;
        return;
      }

      try {
        const [pathModule, marksModule] = await Promise.all([
          config.path(),
          config.marks(),
        ]);
        this.pathData = pathModule.default || pathModule;
        this.marksData = marksModule.default || marksModule;
        this.duration = config.duration;
      } catch (err) {
        console.error('Failed to load route data:', err);
        this.error = 'Failed to load route data.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.route-view {
  width: 100%;
  height: 100vh;
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
