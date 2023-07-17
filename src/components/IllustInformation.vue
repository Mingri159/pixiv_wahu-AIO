<template>
  <q-card class="q-ma-sm">
    <!-- <q-card-section class="pb-0 mb-0">信息</q-card-section> -->
    <q-card-section class="my-2 display: flex;">
      <span class="pb-0 mb-0" style="margin-right:50px">信息：</span>
      <span class="text-body-2 text-grey-8 flex items-center justify-center" style="column-gap:50px">
        <!-- / bookmarks = {{ detail.total_bookmarks }}
        / views = {{ detail.total_view }}
        / restrict = {{ detail.restrict }}
        / sanity_level = {{ detail.sanity_level }}
        / visible = {{ detail.visible }}
        / x_restrict = {{ detail.x_restrict }} -->

        <!-- <span>发布时间：{{ detail }}}</span> -->
        <span>总收藏： {{ detail.total_bookmarks }}</span>
        <span>总查看：{{ detail.total_view }}</span>
        <span>
          <q-badge rounded color="red" v-show="detail.x_restrict">{{ detail.x_restrict == 1 ? 'R-18' : 'R-18G'
          }}</q-badge>
        </span>
        <span style="margin-left:50px">分辨率：{{ detail.width }} X {{ detail.height }}</span>
      </span>
      <!-- R-18 / R-18G -->


    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { IllustDetail } from 'src/plugins/wahuBridge/methods';
const props = defineProps<{ detail: IllustDetail }>()
</script>
