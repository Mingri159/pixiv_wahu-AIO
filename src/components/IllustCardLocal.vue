<template>
  <q-card class="shadow-3" style="padding-bottom: 1px;">
    <q-item>
      <q-item-section>
        <q-item-label v-if="score !== undefined">
          <q-badge>
            <q-icon name="check"></q-icon>{{ score }}
          </q-badge>
          <q-tooltip>模糊匹配的分数</q-tooltip>
        </q-item-label>

        <q-item-label @click="clickTitle" class="cursor-pointer"
          style="overflow: hidden;    white-space: nowrap;    text-overflow: ellipsis;">
          {{ title }}
          <q-tooltip>{{ title }}</q-tooltip>
        </q-item-label>
        <q-item-label @click="clickUsername" caption class="cursor-pointer">

          <q-icon name="how_to_reg" v-if="is_followed" style="font-size: 18px;font-weight: bold;color: #81f3c4;"></q-icon>
          by <span style="color:#f27474;font-weight: bold;">{{ userName }}</span>
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-checkbox :model-value="selected" @update:model-value="handleUpdate"></q-checkbox>
      </q-item-section>
    </q-item>

    <q-img class="ani-img" loading="lazy" :alt="notfoundimageURL" :src="imageSrc" fit="cover" :height="height"
      :placeholder-src="lazyimageURL" @click="clickTitle" v-if="show_h()">
    </q-img>

    <q-img :src="no_h_URL" fit="cover" :height="height" @click="clickTitle" v-else />

    <div class="q-ma-sm">
      <div>
        <div class="text-body-2 text-grey-6"> / iid = {{ iid }} / uid = {{ uid }} </div>

        <div class="flex justify-between items-center">
          <div class="flex " style="column-gap: 8px; ">

            <!-- 判断失效作品 -->
            <q-badge rounded color="grey" v-if="!visible">
              <q-icon name="sentiment_dissatisfied"> </q-icon>
              已失效
            </q-badge>

            <!-- 已收藏 -->
            <span v-if="is_bookmarked" style="display:flex;align-items:center;zoom: 1.3;height: 16px;">
              <!-- <q-badge> <q-icon name="bookmark"></q-icon> </q-badge> -->
              <q-icon name="favorite" style="color:#f2361d"></q-icon>
            </span>


            <!-- 分P -->
            <q-badge v-if="pageCount != 1">
              <q-icon name="photo_library" style="margin-right:3px"></q-icon>
              {{ pageCount }}
            </q-badge>


            <!-- R-18 / R-18G -->
            <q-badge rounded color="red" v-show="x_restrict">
              {{ x_restrict == 1 ? 'R-18' : 'R-18G' }}
            </q-badge>

            <!-- AI -->
            <q-badge color="secondary" v-show="fun_AI()">AI</q-badge>

          </div>

          <q-badge outline color="teal" text-color="black"> {{ (page - 1) * numPerPage + (index + 1) }}</q-badge>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

import * as wm from '../plugins/wahuBridge/methods'
import { notfoundimageURL, lazyimageURL, invisibleURL, serverImageURL, no_h_URL, no_ai_URL } from '../constants'
import { pushWindow } from 'src/plugins/windowManager';
import { numPerPage } from '../constants';//用以计算card右下角数量

import { useSettingsStore } from 'src/stores/settings';
const settings_store = useSettingsStore();

interface Props {
  dbName: string,
  iid: number,
  selected: boolean,
  page: number,//当前页码
  index: number, //用于显示序号
  height: string,
  displayedPage?: number,
  score?: number
}

const props = defineProps<Props>()


const emits = defineEmits<{
  (e: 'update:select', val: boolean): void
}>()


const show = ref<boolean>(false)

const title = ref<string>('')
const userName = ref<string>('')
const uid = ref<number>(-1)
const pageCount = ref<number>(1)
const imageSrc = ref<string>('')
const visible = ref<boolean>(true)//是否可见，判断是否失效
const is_followed = ref<boolean>(false)//是否关注画师

const is_bookmarked = ref<boolean>() //是否收藏
const x_restrict = ref<number>() //R18 R18G
const tags = ref<object>({})

function loadDetail(): void {
  if (!show.value) {
    show.value = true
    wm.ibd_ilst_detail(props.dbName, props.iid)
      .then(ilst => {
        if (ilst === null) {
          title.value = 'Unknown'
          userName.value = 'Unknown'
          uid.value = -1
          imageSrc.value = notfoundimageURL
          return
        }

        is_bookmarked.value = ilst.is_bookmarked
        x_restrict.value = ilst.x_restrict
        tags.value = ilst.tags
        visible.value = ilst.visible

        title.value = ilst.title
        userName.value = ilst.user.name
        is_followed.value = ilst.user.is_followed
        uid.value = ilst.user.uid
        pageCount.value = ilst.page_count

        if (props.displayedPage === undefined) {
          imageSrc.value = `/ilstdbimage/${props.dbName}/${props.iid}/0`
        } else {
          imageSrc.value = `/ilstdbimage/${props.dbName}/${props.iid}/${props.displayedPage}`
        }

      })
  }
}

onMounted(loadDetail)

function clickTitle() {
  pushWindow({
    component: 'IllustDetailLocal',
    title: `${props.dbName}/${props.iid}`,
    props: { dbName: props.dbName, iid: props.iid }
  }, true)
}

function clickUsername() {
  pushWindow({
    component: 'IllustQueryLocal',
    title: props.dbName,
    props: { dbName: props.dbName, initialQueryString: '-U ' + uid.value }
  }, true)
}

function handleUpdate(val: boolean) {
  emits('update:select', val)
}

// 判断tags是否含有【AI】
const fun_AI = () => {
  if (tags.value) {
    // 法一
    for (let i = 0; i < Object.values(tags.value).length; i++) {
      // console.log(i + '---', Object.values(tags.value)[i], Object.values(tags.value)[i].name.toLowerCase().includes('ai'));
      if (Object.values(tags.value)[i].name.toLowerCase().includes('ai'))
        return true
    }

    // 法二
    // for (let item of Object.values(tags.value)) {
    //   console.log(item.name.toLowerCase(), item.name.toLowerCase().includes('ai'));
    // if(item.name.toLowerCase().includes('ai'))
    //   return true
    // }
  }
}

// 根据功能栏判断是否显示 r-18、AI
function show_h() {
  if (!settings_store.h_switch && x_restrict.value) {
    return false
  } else { return true }
}

</script>

<style >
.ani-img img {
  transition: all .3s ease .2s;
}

.ani-img img:hover {
  transform: scale(1.2);
}
</style>
