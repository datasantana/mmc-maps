<template>
  <div :class="['playback-bar', { 'light-theme': isLightTheme }]">
    <!-- Play/Pause Button -->
    <button class="play-pause-btn" @click="togglePlay" :aria-label="isPlaying ? 'Pause' : 'Play'">
      <!-- Pause icon -->
      <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor" class="play-icon">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
      <!-- Play icon -->
      <svg v-else viewBox="0 0 24 24" fill="currentColor" class="play-icon">
        <path d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
      </svg>
    </button>

    <!-- Speed Toggle -->
    <button class="speed-btn" @click="cycleSpeed">
      {{ currentSpeed }}x
    </button>

    <!-- Progress Section -->
    <div class="progress-section">
      <!-- Stats Left -->
      <div class="stats-group">
        <div class="stat">
          <span class="stat-label">DISTANCE</span>
          <span class="stat-value">{{ formattedDistance }} <small>km</small></span>
        </div>
        <div class="stat">
          <span class="stat-label">ELEVATION</span>
          <span class="stat-value">0 <small>m</small></span>
        </div>
      </div>

      <!-- Mini Elevation Chart / Progress Bar -->
      <div class="progress-track">
        <div class="elevation-line">
          <svg viewBox="0 0 300 40" preserveAspectRatio="none" class="elevation-svg">
            <polyline
              :points="elevationPoints"
              fill="none"
              stroke="url(#progressGradient)"
              stroke-width="2"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#00e676" />
                <stop :offset="progressPercent + '%'" stop-color="#00e676" />
                <stop :offset="progressPercent + '%'" stop-color="rgba(255,255,255,0.2)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
              </linearGradient>
            </defs>
          </svg>
          <!-- Progress head indicator -->
          <div class="progress-head" :style="{ left: progressPercent + '%' }">
            <div class="head-line"></div>
            <div class="head-dot"></div>
          </div>
        </div>
        <!-- Progress bar beneath elevation -->
        <div class="progress-bar-track">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <!-- Stats Right -->
      <div class="stats-group stats-right">
        <div class="stat">
          <span class="stat-label">GRADE</span>
          <span class="stat-value accent">+0.0%</span>
        </div>
        <div class="stat">
          <span class="stat-label">TOTAL ASC.</span>
          <span class="stat-value">0<small>m</small></span>
        </div>
        <div class="stat">
          <span class="stat-label">TIME</span>
          <span class="stat-value">{{ formattedTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayBack',
  props: {
    playing: {
      type: Boolean,
      default: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
    },
    elapsedTime: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isLightTheme: false,
      speedOptions: [1, 1.5, 2, 3, 5],
      speedIndex: 0,
    };
  },
  computed: {
    isPlaying() {
      return this.playing;
    },
    progressPercent() {
      return Math.min(this.progress * 100, 100);
    },
    formattedDistance() {
      return this.distance.toFixed(1);
    },
    formattedTime() {
      const totalSeconds = Math.floor(this.elapsedTime / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return [
        String(h).padStart(2, '0'),
        String(m).padStart(2, '0'),
        String(s).padStart(2, '0'),
      ].join(':');
    },
    currentSpeed() {
      const speed = this.speedOptions[this.speedIndex];
      return Number.isInteger(speed) ? speed : speed.toFixed(1);
    },
    elevationPoints() {
      // Placeholder elevation profile for UI preview
      const points = [
        0,20, 15,18, 30,15, 50,19, 70,14, 90,17, 110,12,
        130,16, 150,10, 170,13, 190,8, 210,12, 230,6,
        250,10, 270,8, 290,12, 300,10
      ];
      return points.join(' ');
    },
  },
  mounted() {
    // Inherit theme from localStorage (same as EventHome)
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
  methods: {
    togglePlay() {
      this.$emit('toggle-play', !this.isPlaying);
    },
    cycleSpeed() {
      this.speedIndex = (this.speedIndex + 1) % this.speedOptions.length;
      this.$emit('speed-change', this.speedOptions[this.speedIndex]);
    },
  },
};
</script>

<style scoped>
.playback-bar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(18, 18, 18, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  color: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 680px;
  max-width: 95vw;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* Light theme */
.playback-bar.light-theme {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Play/Pause Button */
.play-pause-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #00e676;
  color: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.15s ease;
}

.play-pause-btn:hover {
  background: #00ff84;
  transform: scale(1.08);
}

.play-pause-btn:active {
  transform: scale(0.95);
}

.play-icon {
  width: 18px;
  height: 18px;
}

/* Speed Button */
.speed-btn {
  min-width: 36px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.light-theme .speed-btn {
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(0, 0, 0, 0.05);
}

.light-theme .speed-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Progress Section */
.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

/* Stats Groups */
.stats-group {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.stats-right .stat {
  align-items: flex-end;
}

.stat-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  opacity: 0.5;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.stat-value small {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.6;
  margin-left: 2px;
}

.stat-value.accent {
  color: #00e676;
}

.light-theme .stat-value.accent {
  color: #00c853;
}

/* Progress Track */
.progress-track {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.elevation-line {
  position: relative;
  height: 36px;
}

.elevation-svg {
  width: 100%;
  height: 100%;
}

.progress-head {
  position: absolute;
  top: 0;
  bottom: -6px;
  width: 2px;
  transform: translateX(-50%);
  pointer-events: none;
}

.head-line {
  width: 2px;
  height: 100%;
  background: #00e676;
  border-radius: 1px;
}

.head-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00e676;
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 6px rgba(0, 230, 118, 0.5);
}

/* Progress Bar */
.progress-bar-track {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.light-theme .progress-bar-track {
  background: rgba(0, 0, 0, 0.08);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00e676, #00c853);
  border-radius: 2px;
  transition: width 0.1s linear;
}

/* Responsive */
@media (max-width: 768px) {
  .playback-bar {
    min-width: unset;
    width: calc(100% - 32px);
    padding: 6px 12px;
    gap: 8px;
    bottom: 16px;
  }

  .stats-group {
    gap: 10px;
  }

  .stat-value {
    font-size: 13px;
  }

  .progress-track {
    min-width: 80px;
  }
}

@media (max-width: 550px) {
  .stats-right {
    display: none;
  }

  .stats-group {
    gap: 8px;
  }
}
</style>
