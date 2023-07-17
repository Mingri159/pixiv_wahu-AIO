<template>
  <!-- <div :style="props.initialQueryString == '-s' ? 'padding-top:50px' : 'padding-top:0'"> -->
  <div :style="{ 'margin-top': showNavBar ? '100px' : '50px' }" ref="pixivSearchRef" v-scroll="scrolled">


    <!-- -->
    <q-card v-show="showNavBar" inline-actions class="text-white bg-blue  flex justify-between items-center  "
      style="padding: 0 20px;height: 50px;position: fixed;z-index: 99;left: 0;right: 0;top: 50px;border-radius: 0;">
      <div></div>

      <div class="flex items-center" style="column-gap:10px">
        <q-radio keep-color left-label v-model="search_type" val="-i" label="iid" color="orange" />
        <q-radio keep-color left-label v-model="search_type" val="-u" label="uid" color="red" />
        <!-- <q-radio keep-color left-label v-model="search_type" val="-b" label="他人的收藏" color="cyan" /> -->
        <q-radio keep-color left-label v-model="search_type" val="-s ptag" label="tags"
          color="purple"><q-tooltip>部分tag搜索</q-tooltip></q-radio>

        <q-input outlined autofocus v-model="search_string" dense options-dense :error="queryStringError"
          @keyup.enter="fun_executeQuery(search_type, search_string)" @input="queryStringError = false"
          style="width:300px;margin-left:10px" bg-color="white" />

        <div>
          <q-btn icon="help" size="sm" flat @click="getHelpText(); showHelp = !showHelp">
            <q-tooltip>帮助</q-tooltip>
          </q-btn>
        </div>
        <q-dialog v-model="showHelp" full-width>
          <q-card>
            <pre class="q-ma-md">{{ helpText }}</pre>
            <q-btn flat class="float-right q-ma-md" color="primary" @click="showHelp = false">关闭</q-btn>
          </q-card>
        </q-dialog>
      </div>


      <q-toggle v-model="settings_store.h_switch" keep-color color="red" :label="r18" left-label />

    </q-card>

    <IllustListPixiv :illusts="illusts" :scores="scores"></IllustListPixiv>

  </div>
</template>

<script setup lang="ts">
import IllustListPixiv from "src/components/IllustListPixiv.vue";
import { onMounted, onUnmounted, ref, computed } from "vue";
import * as wm from '../plugins/wahuBridge/methods'
import { WahuStopIteration } from "src/plugins/wahuBridge/client";
import { pushNoti } from "src/plugins/notifications";

import { useSettingsStore } from 'src/stores/settings';
import { useOptionsStore } from 'src/stores/options';
const settings_store = useSettingsStore();
const options_store = useOptionsStore();
let r18 = computed(() => { return settings_store.h_switch ? 'H哟西' : 'H哒咩' })


const props = defineProps<{
  initialQueryString?: string,
  showNavBar: boolean,
  title: string
}>()

const emits = defineEmits<{
  (e: 'updateProps', val: object): void,
  (e: 'updateTitle', val: string): void,
}>()

const showHelp = ref<boolean>(false)

const queryString = ref<string>('')
const queryStringError = ref<boolean>(false)
const queryLoading = ref<boolean>(false)

const loading = ref<boolean>(false)
const illusts = ref<Array<wm.IllustDetail>>([])
const scores = ref<Array<number>>([])


const search_string = ref<string>('')
const search_type = ref<string>('-i')

const pixivSearchRef = ref()
const scroll_date = ref(0)//防抖
//滚动条接近页面底部时，发送请求下一页数据
function scrolled(position: number) {
  if (new Date().getTime() - scroll_date.value > 1000) {
    if (pixivSearchRef.value.scrollHeight - position - document.body.offsetHeight < 150) {
      invokeGenerator()
      scroll_date.value = new Date().getTime()
    }
  }
}

let generator = ref<AsyncGenerator<Array<[wm.IllustDetail, number]>>>()

function asignGenerator(gen: typeof generator.value) {
  if (generator.value !== undefined && generator.value.throw !== undefined) {
    generator.value.throw(new WahuStopIteration())
  }
  generator.value = gen
}

function invokeGenerator() {
  if (generator.value !== undefined) {

    loading.value = true
    generator.value.next().then(ret => {
      if (ret.done) {
        generator.value = undefined
        pushNoti({
          level: 'info',
          msg: '已加载所有插画'
        })
        return
      }

      illusts.value = illusts.value.concat(ret.value.map(item => item[0]))
      scores.value = scores.value.concat(ret.value.map(item => item[1]))
      loading.value = false
      pushNoti({
        level: 'success',
        msg: '获取了 ' + ret.value.length + ' 张插画'
      })
    })
  }
}

function asignAndInvokeGenerator(gen: typeof generator.value) {
  asignGenerator(gen)
  invokeGenerator()
}

function fun_executeQuery(type: string, str: string) {

  executeQuery(type, str)
  emits('updateProps', { initialQueryString: queryString.value, showNavBar: true })
}

// 不同的模块命令传到这里处理 已优化
function executeQuery(type: string, str: string = '') {
  queryStringError.value = false

  queryString.value = type + ' ' + str

  emits('updateProps', { initialQueryString: queryString.value })

  // if (search_type.value == '-b') emits('updateTitle', '收藏:' + search_string.value)
  // else emits('updateTitle', '搜索:' + search_string.value)
  emits('updateTitle', '搜索:' + search_string.value)

  queryLoading.value = true
  wm.p_query(queryString.value)
    .then(gen => {
      illusts.value = []
      scores.value = []
      asignAndInvokeGenerator(gen)
      queryLoading.value = false
    })
    .catch(e => {
      queryStringError.value = true
      queryLoading.value = false
      console.log(e)
    })

}

onMounted(() => {
  console.log('initialQueryString', props.initialQueryString);
  if (props.initialQueryString !== '-s') {
    executeQuery(props.initialQueryString)
  }
  // 这几个模块共用的组件 判断标题名称；
  console.log('props.title', props.title);
  // 【PixivUserDetail.vue】中导航按钮打开【插画作品】页面
  if (props.title) emits('updateTitle', props.title);
  else {
    switch (props.initialQueryString) {
      case '-s': emits('updateTitle', 'Pixiv搜索'); break
      case '-n': emits('updateTitle', '大家的新作'); break
      case '-f': emits('updateTitle', '关注画师的新作'); break
      case '-r': emits('updateTitle', '推荐'); break
    }
  }

  // emits('updateTitle', '插画:' + queryString.value)
})

// onMounted(() => {
//   emits('updateTitle', 'Pixiv搜索')
// })

onUnmounted(() => {
  if (generator.value !== undefined && generator.value.throw !== undefined) {
    generator.value.throw(new WahuStopIteration())
  }
})



const helpText = ref<string>('')

function getHelpText() {
  wm.p_query_help().then(t => { helpText.value = t })
}


</script>

<style scoped>
pre {
  white-space: pre-wrap;
}

:deep(.q-field--with-bottom) {
  padding-bottom: 0;
}
</style>
