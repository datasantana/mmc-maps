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
          <span class="stat-value">{{ formattedElevation }} <small>m</small></span>
        </div>
      </div>

      <!-- Mini Elevation Chart / Progress Bar — click or drag to scrub -->
      <div
        class="progress-track"
        ref="progressTrack"
        @mousedown="onScrubStart"
        @touchstart.prevent="onTouchScrubStart"
      >
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
          <span class="stat-value accent">{{ formattedSlope }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">TOTAL ASC.</span>
          <span class="stat-value">{{ formattedTotalAscent }}<small>m</small></span>
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
    // Current progress (0–1) driven by parent, synced with RouteMap animation
    progress: {
      type: Number,
      default: 0,
    },
    // Parsed elevation profile data from CSV
    // Each object: { lat, lon, ele, time, segment_distance_km, distance_km_cum,
    //                segment_time_s, elev_delta_m, elev_gain_pos_m, elev_gain_pos_cum_m, slope_percent }
    elevationProfile: {
      type: Array,
      default: () => [],
    },
    // Total route distance in km (from the last profile point)
    totalDistance: {
      type: Number,
      default: 0,
    },
    // Mark highlights on the profile — kept for future use
    profileMarks: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['toggle-play', 'speed-change', 'update:progress'],
  data() {
    return {
      isLightTheme: false,
      speedOptions: [1, 1.5, 2, 3, 5],
      speedIndex: 0,
      isScrubbing: false,
    };
  },
  computed: {
    isPlaying() {
      return this.playing;
    },
    progressPercent() {
      return Math.min(this.progress * 100, 100);
    },
    // Find the nearest elevation profile point for the current progress
    currentProfilePoint() {
      if (!this.elevationProfile || this.elevationProfile.length === 0) {
        return null;
      }
      const currentDist = this.progress * this.totalDistance;
      return this._findNearestPoint(currentDist);
    },
    formattedDistance() {
      const dist = this.progress * this.totalDistance;
      return dist.toFixed(1);
    },
    formattedElevation() {
      if (!this.currentProfilePoint) return '0';
      return Math.round(this.currentProfilePoint.ele);
    },
    formattedSlope() {
      if (!this.currentProfilePoint) return '+0.0%';
      const slope = this.currentProfilePoint.slope_percent;
      const sign = slope >= 0 ? '+' : '';
      return `${sign}${slope.toFixed(1)}%`;
    },
    formattedTotalAscent() {
      if (!this.currentProfilePoint) return '0';
      return Math.round(this.currentProfilePoint.elev_gain_pos_cum_m);
    },
    formattedTime() {
      if (!this.elevationProfile || this.elevationProfile.length === 0 || !this.currentProfilePoint) {
        return '00:00:00';
      }
      // Compute elapsed time from route data timestamps
      const startTime = new Date(this.elevationProfile[0].time).getTime();
      const currentTime = new Date(this.currentProfilePoint.time).getTime();
      const totalSeconds = Math.max(0, Math.floor((currentTime - startTime) / 1000));
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
    // Generate SVG polyline points from real elevation profile data
    elevationPoints() {
      if (!this.elevationProfile || this.elevationProfile.length === 0) {
        // Fallback placeholder when no profile data is available (legacy routes)
        return '0,20 15,18 30,15 50,19 70,14 90,17 110,12 130,16 150,10 170,13 190,8 210,12 230,6 250,10 270,8 290,12 300,10';
      }

      const profile = this.elevationProfile;
      const maxDist = this.totalDistance || profile[profile.length - 1].distance_km_cum || 1;

      // Find elevation range for Y-axis scaling
      let minEle = Infinity, maxEle = -Infinity;
      for (const p of profile) {
        if (p.ele < minEle) minEle = p.ele;
        if (p.ele > maxEle) maxEle = p.ele;
      }
      const eleRange = maxEle - minEle || 1; // avoid division by zero

      // Downsample to ~150 points for a smooth SVG without excessive DOM nodes
      const maxPoints = 150;
      const step = Math.max(1, Math.floor(profile.length / maxPoints));

      const points = [];
      for (let i = 0; i < profile.length; i += step) {
        const p = profile[i];
        const x = (p.distance_km_cum / maxDist) * 300;
        const y = 40 - ((p.ele - minEle) / eleRange) * 34 - 3; // 3px top padding, 34px usable range
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      // Always include the last point for a complete profile
      const last = profile[profile.length - 1];
      const lastX = (last.distance_km_cum / maxDist) * 300;
      const lastY = 40 - ((last.ele - minEle) / eleRange) * 34 - 3;
      points.push(`${lastX.toFixed(1)},${lastY.toFixed(1)}`);

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
    // Clean up scrub listeners in case component unmounts during a drag
    if (this._onScrubMove) {
      document.removeEventListener('mousemove', this._onScrubMove);
    }
    if (this._onScrubEnd) {
      document.removeEventListener('mouseup', this._onScrubEnd);
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

    // --- Binary search for the nearest profile point by cumulative distance ---
    _findNearestPoint(distanceKm) {
      const profile = this.elevationProfile;
      if (!profile || profile.length === 0) return null;

      let lo = 0;
      let hi = profile.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (profile[mid].distance_km_cum < distanceKm) {
          lo = mid + 1;
        } else {
          hi = mid;
        }
      }
      return profile[lo];
    },

    // --- Scrub interaction: mouse ---
    onScrubStart(event) {
      this.isScrubbing = true;
      this._updateScrubProgress(event);

      this._onScrubMove = (e) => {
        if (this.isScrubbing) {
          this._updateScrubProgress(e);
        }
      };
      this._onScrubEnd = () => {
        this.isScrubbing = false;
        document.removeEventListener('mousemove', this._onScrubMove);
        document.removeEventListener('mouseup', this._onScrubEnd);
      };
      document.addEventListener('mousemove', this._onScrubMove);
      document.addEventListener('mouseup', this._onScrubEnd);
    },

    // --- Scrub interaction: touch ---
    onTouchScrubStart(event) {
      this.isScrubbing = true;
      this._updateScrubProgress(event.touches[0]);

      const onTouchMove = (e) => {
        if (this.isScrubbing) {
          this._updateScrubProgress(e.touches[0]);
        }
      };
      const onTouchEnd = () => {
        this.isScrubbing = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
      document.addEventListener('touchmove', onTouchMove, { passive: true });
      document.addEventListener('touchend', onTouchEnd);
    },

    // Compute progress (0–1) from pointer X position on the track
    _updateScrubProgress(event) {
      const track = this.$refs.progressTrack;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));
      this.$emit('update:progress', progress);
    },

    // --- Profile marks (kept for future use) ---
    // Call this method to compute X positions for marks on the profile chart.
    // Uncomment and use when marks are reactivated.
    // getProfileMarkPositions() {
    //   if (!this.profileMarks || this.profileMarks.length === 0) return [];
    //   return this.profileMarks.map(mark => ({
    //     ...mark,
    //     xPercent: (mark.distance_km_cum / this.totalDistance) * 100,
    //   }));
    // },
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
