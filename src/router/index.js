import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MapTemplateView from '@/views/MapTemplateView.vue'
import Path21kView from '@/views/Path21kView.vue'
import Path10kView from '@/views/Path10kView.vue'
import Path5kView from '@/views/Path5kView.vue'


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/map-template',
    name: 'map-template',
    component: MapTemplateView
  },
  {
    path: '/21k',
    name: '21k',
    component: Path21kView
  },
  {
    path: '/10k',
    name: '10k',
    component: Path10kView
  },
  {
    path: '/5k',
    name: '5k',
    component: Path5kView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
