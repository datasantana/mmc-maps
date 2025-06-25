<template>
  <div class="map">
    <Path10k />
  </div>
</template>

<script>
// @ is an alias to /src
import Path10k from '@/components/Path10k.vue'
export default {
  name: 'Path10kView',
  components: {
    Path10k
  }
}
</script>