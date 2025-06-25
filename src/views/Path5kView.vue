<template>
  <div class="map">
    <Path5k />
  </div>
</template>

<script>
// @ is an alias to /src
import Path5k from '@/components/Path5k.vue'
export default {
  name: 'Path5kView',
  components: {
    Path5k
  }
}
</script>