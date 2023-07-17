<template>
  <q-btn flat
    @click="pushWindow({ component: 'PixivSearchIllust', props: { initialQueryString: '-u ' + uid, title: '[' + props.name + '] 作品' } })">
    插画作品
  </q-btn>
  <q-btn flat
    @click="pushWindow({ component: 'PixivSearchIllust', props: { initialQueryString: '-b ' + uid, title: '[' + props.name + '] 收藏' } })">
    收藏插画
  </q-btn>
  <!-- <q-btn flat
    @click="pushWindow({ component: 'PixivSearchUser', props: { initialQueryString: '-F ' + uid, title: '[' + props.name + '] 关注', showNavBar: false } })">
    {{ name }} 关注的用户
  </q-btn>
  <q-btn flat
    @click="pushWindow({ component: 'PixivSearchUser', props: { initialQueryString: '-f ' + uid, title: '[' + props.name + '] 被关注', showNavBar: false } })">
    关注 {{ name }} 的用户
  </q-btn>
  <q-btn flat
    @click="pushWindow({ component: 'PixivSearchUser', props: { initialQueryString: '-r ' + uid, title: '[' + props.name + '] 相关用户', showNavBar: false } })">
    相关用户
  </q-btn> -->
</template>

<script setup lang="ts">
import { pushWindow } from 'src/plugins/windowManager';

const props = defineProps<{
  name: string, uid: number
}>()
</script>
