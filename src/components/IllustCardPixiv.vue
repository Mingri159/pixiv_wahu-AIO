<template>
  <q-card class="shadow-3" style="padding-bottom: 1px;">
    <q-item>
      <q-item-section>
        <q-item-label v-if="score !== undefined">
          <q-badge> <q-icon name="check"></q-icon>{{ score }} </q-badge>
          <q-tooltip>模糊匹配的分数</q-tooltip>
        </q-item-label>

        <!-- 标题不换行，多余显示省略号 -->
        <q-item-label @click="clickTitle" class="cursor-pointer"
          style="overflow: hidden;    white-space: nowrap;    text-overflow: ellipsis;">
          {{ detail.title }}
          <q-tooltip>{{ detail.title }}</q-tooltip>
        </q-item-label>
        <q-item-label @click="clickUsername" caption class="cursor-pointer">
          <q-icon name="how_to_reg" v-if="detail.user.is_followed"
            style="font-size: 18px;font-weight: bold;color: #81f3c4;"></q-icon>
          by <span style="color:#f27474;font-weight: bold;">{{ detail.user.name }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section side top v-if="!unselectable">
        <q-checkbox :model-value="selected" @update:model-value="$emit('update:select', $event)"></q-checkbox>
      </q-item-section>
    </q-item>

    <q-img class="ani-img" loading="lazy" :alt="notfoundimageURL"
      :src="detail.visible ? serverImageURL + detail.image_medium[0] : invisibleURL" fit="cover" :height="height"
      :placeholder-src="lazyimageURL" @click="clickTitle" v-if="show_h()">
    </q-img>

    <q-img :src="no_h_URL" fit="cover" :height="height" v-else />


    <!-- card 底部信息 -->
    <div class="q-ma-sm ">
      <div>
        <div class="text-body-2 text-grey-6"> / iid = {{ detail.iid }} / uid = {{ detail.user.uid }} </div>
        <div class="flex justify-between items-center">
          <div class="flex " style="column-gap: 8px; ">

            <!-- 判断失效作品 -->
            <q-badge rounded color="grey" v-if="!detail.visible">
              <q-icon name="sentiment_dissatisfied"> </q-icon>
              已失效
            </q-badge>

            <!-- 已收藏 -->
            <span v-if="detail.is_bookmarked" style="display:flex;align-items:center;zoom: 1.3;height: 16px;">
              <!-- <q-badge> <q-icon name="bookmark"></q-icon> </q-badge> -->
              <q-icon name="favorite" style="color:#f2361d"></q-icon>
            </span>

            <!-- 分P -->
            <!-- class="q-mx-sm" -->
            <q-badge v-if="detail.page_count != 1">
              <q-icon name="photo_library" style="margin-right:3px"></q-icon>
              {{ detail.page_count }}
            </q-badge>

            <!-- 总收藏数 -->
            <q-badge> <q-icon name="bookmarks" style="margin-right:3px"></q-icon> {{ detail.total_bookmarks }} </q-badge>

            <!-- R-18 / R-18G -->
            <q-badge rounded color="red" v-show="detail.x_restrict">{{ detail.x_restrict == 1 ? 'R-18' : 'R-18G'
            }}</q-badge>

            <!-- AI -->
            <q-badge color="secondary" v-show="fun_AI()"> <q-tooltip>仅供参考</q-tooltip>AI</q-badge>
          </div>

          <!-- 序号 -->
          <q-badge outline color="teal" text-color="black"> {{ index + 1 }} </q-badge>

        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as wm from '../plugins/wahuBridge/methods'
import { notfoundimageURL, lazyimageURL, invisibleURL, serverImageURL, no_h_URL, no_ai_URL } from '../constants'
import { pushWindow } from 'src/plugins/windowManager';

import { useSettingsStore } from 'src/stores/settings';
import { storeToRefs } from 'pinia';
const settings_store = useSettingsStore();

interface Props {
  detail: wm.IllustDetail,
  index: number, //用于显示序号
  height: string,
  selected: boolean,
  unselectable?: boolean,
  score?: number | string
}

const props = defineProps<Props>()

const emits = defineEmits<{ (e: 'update:select', val: boolean): void }>()

function clickTitle() {
  pushWindow({
    component: 'IllustDetailPixiv',
    title: `Pixiv/${props.detail.iid}`,
    props: { iid: props.detail.iid }
  }, true)
}

function clickUsername() {
  pushWindow({
    component: 'PixivUserDetail',
    title: 'User:' + props.detail.user.name,
    props: { uid: props.detail.user.uid }
  })
}

// 模拟同步状态
// const sync_state = ref(0)

// 判断tags是否含有【AI】
const fun_AI = () => {
  // 法一
  for (let i = 0; i < props.detail.tags.length; i++) {
    if (props.detail.tags[i].name.toLowerCase().includes('ai'))
      return true
  }

  // 法二
  // for (let item of props.detail.tags) {
  //    if(item.name.toLowerCase().includes('ai'))
  //    return true//有可能误伤tag单词中含有ai字符的；
  // }
}

function show_h() {
  if (!settings_store.h_switch && props.detail.x_restrict) {
    return false
  } else { return true }
}
</script>

<style >
/* //同步动画
.sync {
  animation: rotation 3s linear infinite;
}

@keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
  }
}

//同步设置对话框宽度
@media (min-width: 600px) {
  .q-dialog__inner--minimized>div {
    max-width: 900px !important;
  }
} */

.ani-img img {
  transition: all .3s ease .2s;
}

.ani-img img:hover {
  transform: scale(1.2);
}
</style>
