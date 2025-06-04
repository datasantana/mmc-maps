<template>
  <div class="map">
    <MapTemplate />
  </div>
</template>

<script>
// @ is an alias to /src
import MapTemplate from '@/components/MapTemplate.vue'

export default {
  name: 'MapTemplateView',
  components: {
    MapTemplate
  }
}
</script>