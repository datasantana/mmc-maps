/**
 * Theme Mixin — drop into any Options-API component that
 * needs to read or toggle the dark / light theme.
 *
 * What it provides:
 *   data:    isLightTheme (Boolean)
 *   methods: toggleTheme()
 *
 * On mount it reads localStorage → 'theme' key.
 * Falls back to the OS preference via prefers-color-scheme.
 * Keeps in sync across tabs via the `storage` event.
 *
 * The root `.light-theme` class is toggled on document.documentElement
 * so that the CSS variables in variables.css flip automatically.
 */

export default {
  data() {
    return {
      isLightTheme: false,
    };
  },

  watch: {
    isLightTheme: {
      immediate: false,
      handler(light) {
        // Keep <html> class in sync for global CSS vars
        document.documentElement.classList.toggle('light-theme', light);
      },
    },
  },

  mounted() {
    // 1. Restore from localStorage
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isLightTheme = saved === 'light';
    } else {
      this.isLightTheme = window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    // Apply immediately
    document.documentElement.classList.toggle('light-theme', this.isLightTheme);

    // 2. Cross-tab synchronisation
    this._themeStorageHandler = () => {
      const theme = localStorage.getItem('theme');
      if (theme) {
        this.isLightTheme = theme === 'light';
      }
    };
    window.addEventListener('storage', this._themeStorageHandler);
  },

  beforeUnmount() {
    if (this._themeStorageHandler) {
      window.removeEventListener('storage', this._themeStorageHandler);
    }
  },

  methods: {
    toggleTheme() {
      this.isLightTheme = !this.isLightTheme;
      localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
    },
  },
};
