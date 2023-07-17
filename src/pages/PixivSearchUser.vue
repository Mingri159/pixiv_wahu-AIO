<template>
  <div ref="pixivUserRef" style="margin-top:100px">
    <!-- v-scroll="scrolled" -->

    <q-card inline-actions class="text-white bg-blue  flex justify-evenly items-center  "
      style="padding:0 20px;height: 50px;position: fixed;z-index: 99;left: 0;right: 0;top: 50px;border-radius: 0;">

      <div class="flex items-center" style="column-gap:10px">
        <q-radio keep-color left-label v-model="search_type" val="-n" label="用户名"
          color="cyan"><q-tooltip>用户名模糊搜索</q-tooltip></q-radio>
        <q-radio keep-color left-label v-model="search_type" val="-u" label="uid" color="red" />

        <q-input outlined autofocus dense options-dense v-model="search_string"
          @keyup.enter="executeQuery(search_type, search_string)" style="width:300px;margin-left:10px" bg-color="white" />

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
    </q-card>
    <PixivUserPreviewList :user-previews="userPreviews"></PixivUserPreviewList>

    <div class="row q-ma-lg" v-show="generator !== undefined">
      <div class="col-12">
        <q-btn @click="invokeGenerator" color="primary float-right" stretch :loading="loading">下一页</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as wm from '../plugins/wahuBridge/methods'
import { WahuStopIteration } from 'src/plugins/wahuBridge/client';
import { pushNoti } from 'src/plugins/notifications';
import PixivUserPreviewList from 'src/components/PixivUserPreviewList.vue';
import { replaceCurrentWindow } from 'src/plugins/windowManager';


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
const queryLoading = ref<boolean>(false)
const queryError = ref<boolean>(false)

const userPreviews = ref<Array<wm.PixivUserPreview>>([])

const generator = ref<AsyncIterator<Array<wm.PixivUserPreview>, undefined, null>>()

const loading = ref<boolean>(false)

// 输入框 搜索作者
const search_string = ref<string>('')
const search_type = ref<string>('-n')

const pixivUserRef = ref()
// const scroll_date = ref(0)//防抖
// //滚动条接近页面底部时，发送请求下一页数据
// function scrolled(position: number) {
//   if (new Date().getTime() - scroll_date.value > 1000) {
//     if (pixivUserRef.value.scrollHeight - position - document.body.offsetHeight < 150) {
//       executeQuery()
//       scroll_date.value = new Date().getTime()
//     }
//   }
// }

onMounted(() => {
  console.log('initialQueryString', props.initialQueryString);
  console.log('props.showNavBar', props.showNavBar);
  console.log('props.title', props.title);

  if (props.initialQueryString !== undefined)
    executeQuery(props.initialQueryString)


  //默认查询自己关注的作者
  // executeQuery()

  if (props.title) {
    emits('updateTitle', props.title)
  } else
    emits('updateTitle', '关注的画师')
})

function cutStringWith(str: string, subStr: string): [string, string | null] {
  let at = str.indexOf(subStr)
  if (at == -1) {
    return [str, null]
  }
  return [str.slice(0, at), str.slice(at + 1)]
}


function executeQuery(type: string, str: string = '') {
  queryError.value = false

  queryString.value = type + ' ' + str

  emits('updateProps', { initialQueryString: queryString.value })
  // emits('updateTitle', '用户:' + search_string.value)

  //默认查询自己关注的作者
  if (!search_string.value) queryString.value = '-F'

  queryLoading.value = true
  wm.p_query_user(queryString.value)
    .then(ret => {
      if (typeof (ret) == 'number') {
        replaceCurrentWindow({
          component: 'PixivUserDetail',
          props: { uid: ret },
          title: '用户:' + ret
        })
      } else {
        queryLoading.value = false
        asignAndInvokeGenerator(ret)
      }

    })
    .catch(e => {
      queryError.value = true
      queryLoading.value = false
      console.log(e)
    })

}


onUnmounted(() => {
  if (generator.value !== undefined) {
    if (generator.value.throw !== undefined) {
      generator.value.throw(new WahuStopIteration())
    }
  }
})



function asignGenerator(gen: typeof generator.value) {

  if (generator.value !== undefined) {
    if (generator.value.throw !== undefined) {
      generator.value.throw(new WahuStopIteration())
    }
    userPreviews.value = []
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
          msg: '已加载所有用户预览'
        })
        return
      }

      userPreviews.value = userPreviews.value.concat(ret.value)
      // console.log('userPreviews', userPreviews.value);
      loading.value = false
      pushNoti({
        level: 'success',
        msg: '获取了 ' + ret.value.length + ' 个用户预览'
      })
    })
  }
}

function asignAndInvokeGenerator(gen: typeof generator.value) {
  asignGenerator(gen)
  invokeGenerator()
}

const helpText = ref<string>('')
function getHelpText() {
  wm.p_query_user_help().then(s => { helpText.value = s })
}


</script>

<style scoped>
pre {
  white-space: pre-wrap;
}
</style>
