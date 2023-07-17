<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
});
</script>
<style>
/* nav 底部阴影 */
.q-layout__shadow {
  display: none;
}
</style>
