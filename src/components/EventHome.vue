<template>
  <div :class="['event-home', { 'light-theme': isLightTheme }]">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">Madrid Race 2024</span>
        </div>
        
        <nav class="nav">
          <a href="#routes" class="nav-link">Routes</a>
          <a href="#schedule" class="nav-link">Schedule</a>
          <a href="#faq" class="nav-link">FAQ</a>
          <a href="#contact" class="nav-link">Contact</a>
        </nav>
        
        <div class="header-actions">
          <button class="theme-toggle" @click="toggleTheme" :aria-label="isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'">
            <svg v-if="!isLightTheme" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="register-btn">Register Now</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <h1 class="hero-title">Madrid</h1>
      <div class="hero-date">
        <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>24 de Noviembre, 2024</span>
      </div>
    </section>

    <!-- Routes Section -->
    <section id="routes" class="routes-section">
      <div class="routes-grid">
        <!-- 5K Card -->
        <div class="route-card">
          <div class="card-image">
            <img src="https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-3.7038,40.4168,11,0/400x200?access_token=pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg" alt="5K Route Map" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h2 class="card-title">5K</h2>
              <span class="badge badge-easy">Easy</span>
            </div>
            <p class="card-subtitle">SHORT DISTANCE</p>
            <p class="card-description">
              Flat terrain through the historic Retiro Park. Perfect for beginners or those looking for a fast, scenic run under the autumn sun.
            </p>
            <router-link to="/5k" class="card-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Ver detalles de la ruta
            </router-link>
          </div>
        </div>

        <!-- 10K Card -->
        <div class="route-card">
          <div class="card-image">
            <img src="https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-3.7538,40.4368,10.5,0/400x200?access_token=pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg" alt="10K Route Map" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h2 class="card-title">10K</h2>
              <span class="badge badge-moderate">Moderate</span>
            </div>
            <p class="card-subtitle">MEDIUM DISTANCE</p>
            <p class="card-description">
              Hilly terrain across Casa de Campo. Challenge yourself with elevation changes and breathtaking views of the Royal Palace skyline.
            </p>
            <router-link to="/10k" class="card-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Ver detalles de la ruta
            </router-link>
          </div>
        </div>

        <!-- 21K Card -->
        <div class="route-card">
          <div class="card-image">
            <img src="https://api.mapbox.com/styles/v1/mapbox/light-v11/static/-3.6838,40.4068,10,0/400x200?access_token=pk.eyJ1IjoiZ2Vvc3R1ZGlvIiwiYSI6ImNrYndtazR3OTA5cmEycHFxcTl4MWs1aHgifQ.nJvUs7kTlQCzb_-Fda2RSg" alt="21K Route Map" />
          </div>
          <div class="card-content">
            <div class="card-header">
              <h2 class="card-title">21K</h2>
              <span class="badge badge-challenging">Challenging</span>
            </div>
            <p class="card-subtitle">HALF MARATHON</p>
            <p class="card-description">
              Varied terrain through the heart of the city. A demanding course passing by major landmarks from Castellana to Madrid Río.
            </p>
            <router-link to="/21k" class="card-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 22v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Ver detalles de la ruta
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 8L8 10.5V15.5L12 18L16 15.5V10.5L12 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>Madrid Race 2024</span>
        </div>
        <div class="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact</a>
        </div>
        <p class="footer-copyright">© 2024 Madrid Race. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'EventHome',
  data() {
    return {
      isLightTheme: false
    }
  },
  mounted() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isLightTheme = savedTheme === 'light';
    } else {
      // Check system preference
      this.isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
  },
  methods: {
    toggleTheme() {
      this.isLightTheme = !this.isLightTheme;
      localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
    }
  }
}
</script>

<style scoped>
/* Base styles */
.event-home {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Light theme */
.event-home.light-theme {
  background-color: #ffffff;
  color: #1a1a1a;
}

/* Header */
.header {
  border-bottom: 1px solid #222;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  background-color: #0a0a0a;
  z-index: 100;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.light-theme .header {
  background-color: #ffffff;
  border-bottom-color: #e5e5e5;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #22c55e;
}

.logo-text {
  font-weight: 600;
  font-size: 1.1rem;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #a1a1a1;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #ffffff;
}

.light-theme .nav-link {
  color: #666;
}

.light-theme .nav-link:hover {
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle .icon {
  width: 24px;
  height: 24px;
  color: #a1a1a1;
  transition: color 0.2s ease;
}

.theme-toggle:hover .icon {
  color: #ffffff;
}

.light-theme .theme-toggle .icon {
  color: #666;
}

.light-theme .theme-toggle:hover .icon {
  color: #1a1a1a;
}

.register-btn {
  background-color: #22c55e;
  color: #000;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.register-btn:hover {
  background-color: #16a34a;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
}

.hero-title {
  font-size: 6rem;
  font-weight: 800;
  margin: 0 0 1rem;
  letter-spacing: -2px;
}

.hero-date {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #22c55e;
  font-size: 1.1rem;
}

.calendar-icon {
  width: 20px;
  height: 20px;
}

/* Routes Section */
.routes-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 1024px) {
  .routes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .routes-grid {
    grid-template-columns: 1fr;
  }
  
  .nav {
    display: none;
  }
  
  .hero-title {
    font-size: 4rem;
  }
}

/* Route Card */
.route-card {
  background-color: #141414;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.route-card:hover {
  transform: translateY(-4px);
}

.light-theme .route-card {
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.route-card:hover .card-image img {
  filter: grayscale(50%);
}

.card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-easy {
  background-color: transparent;
  border: 1px solid #a1a1a1;
  color: #a1a1a1;
}

.light-theme .badge-easy {
  border-color: #666;
  color: #666;
}

.badge-moderate {
  background-color: transparent;
  border: 1px solid #a1a1a1;
  color: #a1a1a1;
}

.light-theme .badge-moderate {
  border-color: #666;
  color: #666;
}

.badge-challenging {
  background-color: #22c55e;
  color: #000;
  border: none;
}

.card-subtitle {
  color: #22c55e;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0 0 1rem;
}

.card-description {
  color: #a1a1a1;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.light-theme .card-description {
  color: #666;
}

.card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: transparent;
  border: 1px solid #333;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.card-btn:hover {
  background-color: #222;
  border-color: #444;
}

.light-theme .card-btn {
  border-color: #ddd;
  color: #1a1a1a;
}

.light-theme .card-btn:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

/* Footer */
.footer {
  border-top: 1px solid #222;
  padding: 3rem 2rem;
  margin-top: 4rem;
  transition: border-color 0.3s ease;
}

.light-theme .footer {
  border-top-color: #e5e5e5;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.footer-logo .logo-icon {
  width: 24px;
  height: 24px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.footer-links a {
  color: #a1a1a1;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #ffffff;
}

.light-theme .footer-links a {
  color: #666;
}

.light-theme .footer-links a:hover {
  color: #1a1a1a;
}

.footer-copyright {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

.light-theme .footer-copyright {
  color: #999;
}
</style>
