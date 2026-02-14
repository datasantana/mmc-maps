import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Global design-token CSS variables (dark/light)
import './theme/variables.css'

createApp(App).use(router).mount('#app')
