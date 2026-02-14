<template>
  <router-view/>
</template>

<script>
import { themeMixin } from '@/theme';

export default {
  name: 'App',
  mixins: [themeMixin],
};
</script>

<style>
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: var(--transition-theme);
}
</style>
