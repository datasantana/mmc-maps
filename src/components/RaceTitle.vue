<template>
  <div :class="['race-title', { 'light-theme': isLightTheme }]">
    <div class="race-title__header">
      <span :class="['race-title__badge', difficultyClass]">{{ type }}</span>
      <span class="race-title__city">{{ city }}</span>
    </div>
    <h1 class="race-title__name">Route {{ name }}</h1>
    <p class="race-title__description">{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'RaceTitle',
  props: {
    /** Route display name, e.g. "21K" */
    name: {
      type: String,
      default: '',
    },
    /** Race type label, e.g. "Half Marathon", "Marathon" */
    type: {
      type: String,
      default: '',
    },
    /** City name, e.g. "Madrid" */
    city: {
      type: String,
      default: '',
    },
    /** Total distance in km, e.g. 21.097 */
    distance: {
      type: Number,
      default: 0,
    },
    /** Distance unit, e.g. "km" */
    distanceUnit: {
      type: String,
      default: 'km',
    },
    /** Route difficulty: "easy" | "moderate" | "challenging" */
    difficulty: {
      type: String,
      default: 'moderate',
    },
    /** Short description, e.g. "Castellana to Madrid Río" */
    description: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isLightTheme: false,
    };
  },
  computed: {
    /** Format total distance with locale separators, e.g. "21,097m" or "15km" */
    formattedTotalDistance() {
      if (!this.distance) return '';
      // Show metres when there are meaningful decimals, otherwise km
      const isWholeKm = this.distance === Math.floor(this.distance);
      if (isWholeKm) {
        return `${this.distance.toLocaleString()}${this.distanceUnit}`;
      }
      const metres = Math.round(this.distance * 1000);
      return `${metres.toLocaleString()}m`;
    },
    difficultyClass() {
      return `race-title__badge--${this.difficulty}`;
    },
  },
  mounted() {
    // Inherit theme from localStorage (same pattern as PlayBack)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isLightTheme = savedTheme === 'light';
    } else {
      this.isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    // Listen for theme changes from other components
    this._storageHandler = () => {
      const theme = localStorage.getItem('theme');
      if (theme) {
        this.isLightTheme = theme === 'light';
      }
    };
    window.addEventListener('storage', this._storageHandler);
  },
  beforeUnmount() {
    if (this._storageHandler) {
      window.removeEventListener('storage', this._storageHandler);
    }
  },
};
</script>

<style scoped>
.race-title {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
  padding: 16px 20px;
  background: rgba(18, 18, 18, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  max-width: 320px;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Light theme */
.race-title.light-theme {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Header row: badge + distance */
.race-title__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

/* Type badge */
.race-title__badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  line-height: 1.4;
  white-space: nowrap;
}

/* Difficulty colour variants */
.race-title__badge--easy {
  background: rgba(0, 230, 118, 0.2);
  color: #00e676;
}

.race-title__badge--moderate {
  background: rgba(255, 82, 82, 0.2);
  color: #ff5252;
}

.race-title__badge--challenging {
  background: rgba(255, 171, 64, 0.2);
  color: #ffab40;
}

.light-theme .race-title__badge--easy {
  background: rgba(0, 200, 83, 0.15);
  color: #00a152;
}

.light-theme .race-title__badge--moderate {
  background: rgba(211, 47, 47, 0.12);
  color: #c62828;
}

.light-theme .race-title__badge--challenging {
  background: rgba(230, 126, 34, 0.12);
  color: #e65100;
}

/* City text next to badge */
.race-title__city {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.55;
}

/* Route name */
.race-title__name {
  margin: 0 0 4px;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.3px;
}

/* Description */
.race-title__description {
  margin: 0;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.6;
  line-height: 1.3;
}

/* ─── Mobile: notch centrado ─── */
@media (max-width: 768px) {
  .race-title {
    top: 12px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    max-width: calc(100% - 48px);
    width: auto;
    border-radius: 14px;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .race-title__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .race-title__name {
    font-size: 18px;
    margin: 0;
    white-space: nowrap;
  }

  .race-title__description {
    display: none;
  }
}
</style>
