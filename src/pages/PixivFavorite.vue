<template>
  <div ref="pixivFavRef" style="padding-top:50px" v-scroll="scrolled">

    <!-- 改成 功能栏 -->
    <q-card inline-actions class="text-white bg-blue  flex justify-between items-center "
      style="padding:0 20px;height: 50px;position: fixed;z-index: 99;left: 0;right: 0;top: 50px;border-radius: 0;">

      <!-- 1、数据 -->
      <div class="flex items-center">
        <span> Pixiv收藏夹总数：
          <span>{{ bookmarked_num }}</span>
        </span>
      </div>

      <div class="flex" style="column-gap: 30px;">

        <!--2、筛选方式：   作者 和 tag 不能同时使用 一个使用时自动禁用另一个  -->
        <div class="flex items-center flex-nowrap ">
          <span>作者：</span>
          <q-select outlined v-model="user_select" :disable="tag_select.length == 0 ? false : true" :options="user_option"
            use-input input-debounce="0" @filter="filterFn_user" transition-show="jump-up" transition-hide="jump-up" dense
            options-dense clearable style="width: 250px">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="flex flex-nowrap items-center">
          <span> Tags： </span>
          <q-select outlined v-model="tag_select" :disable="user_select.length == 0 ? false : true" :options="tags_option"
            use-input input-debounce="0" @filter="filterFn_tag" transition-show="jump-up" transition-hide="jump-up" dense
            options-dense clearable style="width: 250px">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <!-- <q-btn icon="help" size="sm" flat @click="getHelpText(); showHelp = !showHelp">
        <q-tooltip>帮助</q-tooltip>
      </q-btn>

      <q-dialog v-model="showHelp">
        <q-card>
          <pre class="q-ma-md">{{ helpText }}</pre>
          <q-btn flat class="float-right q-ma-md" color="primary" @click="showHelp = false">关闭</q-btn>
        </q-card>
      </q-dialog> -->


      <q-toggle v-model="settings_store.h_switch" keep-color color="red" :label="r18" left-label />

    </q-card>

    <IllustListPixiv :illusts="illusts" :scores="scores"></IllustListPixiv>

    <div class="row q-ma-lg" v-show="generator !== undefined">
      <div class="col-12">
        <q-btn @click="invokeGenerator" color="primary float-right" stretch :loading="loading">下一页</q-btn>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import IllustListPixiv from "src/components/IllustListPixiv.vue";
import { onMounted, onUnmounted, reactive, ref, computed, watch } from "vue";
import * as wm from '../plugins/wahuBridge/methods'
import { WahuStopIteration } from "src/plugins/wahuBridge/client";
import { pushNoti } from "src/plugins/notifications";

import { useSettingsStore } from 'src/stores/settings';
import { useOptionsStore } from 'src/stores/options';
import { storeToRefs } from 'pinia';
const settings_store = useSettingsStore();
const options_store = useOptionsStore();

const props = defineProps<{
  initialQueryString?: string
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
const illusts_copy = ref<Array<wm.IllustDetail>>([])//在 invokeGenerator()里，先对其赋值
const scores = ref<Array<number>>([])


// -----------------------------------------------------------------------------------------------------
let r18 = computed(() => { return settings_store.h_switch ? 'H哟西' : 'H哒咩' })

const user_select = ref([])
let all_users: string[] = []
const user_option = ref(all_users)

const tag_select = ref([])
let all_tags: string[] = []
const tags_option = ref(all_tags)

// 输入选择作者名称筛选
function filterFn_user(val: string, update: any) {
  if (val === '') {
    update(() => {
      user_option.value = all_users
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    user_option.value = all_users.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}
// 输入的tag筛选
function filterFn_tag(val: string, update: any) {
  if (val === '') {
    update(() => {
      tags_option.value = all_tags
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    tags_option.value = all_tags.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}

// 根据选择的作者名称查找对应数据   单选-->只需找出对应数据
watch(() => user_select.value, (n, o) => {
  console.log('watch user_select n', n);
  if (n == null) user_select.value = [] //Q-selece clearable时 ，会把v-model变成null 导致其它地方出错
  else if (n.length == 0) illusts.value = illusts_copy.value
  else illusts.value = illusts_copy.value.filter(item => item.user.name == n)

})

// 根据选择的tags查找对应数据  多选--> 找到添加的tags数据，删除取消的tags的数据
watch(() => tag_select.value, (n, o) => {
  console.log('watch tag_select n', n);
  if (n == null) tag_select.value = []
  else if (n.length == 0) illusts.value = illusts_copy.value
  else illusts.value = illusts_copy.value.filter(item => item.tags.map(tag => Object.values(tag)).flat(2).includes(tag_select.value))

})

// 找出两数组不同的元素
function getArrDifference(arr1: string[], arr2: string[]) {
  return arr1.concat(arr2).filter(function (v, i, arr) {
    return arr.indexOf(v) === arr.lastIndexOf(v);
  });
}


const pixivFavRef = ref()
const scroll_date = ref(0)//防抖
//滚动条接近页面底部时，发送请求下一页数据
function scrolled(position: number) {
  if (new Date().getTime() - scroll_date.value > 1000) {
    if (pixivFavRef.value.scrollHeight - position - document.body.offsetHeight < 150) {
      invokeGenerator()
      scroll_date.value = new Date().getTime()
    }
  }
}

// ------------------------------------------

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

      // illusts.value = illusts.value.concat(ret.value.map(item => item[0]))
      // ------------------------------------------------------------------------------------------------------------
      illusts_copy.value = illusts_copy.value.concat(ret.value.map(item => item[0]))
      // console.log(' illusts_copy.value', illusts_copy.value);
      // console.log('user_select.value', user_select.value);
      // console.log('tag_select.value', tag_select.value);

      if (!user_select.value.length && !tag_select.value.length) {
        // 1、没有筛选时
        illusts.value = illusts_copy.value
      } else {
        if (user_select.value.length) {
          // 2、当选择了作者时，过滤数据
          illusts.value = illusts.value.concat(ret.value.map(item => item[0])).filter(item => item.user.name == user_select.value)
        }
        if (tag_select.value.length) {
          // 3、当选择了tag时，过滤数据
          illusts.value = illusts.value.concat(ret.value.map(item => item[0])).filter(item => item.tags.map(tag => Object.values(tag)).flat(2).includes(tag_select.value))
        }
      }

      // 获取所有作者和tags
      all_users = all_users.concat(ret.value.map(item => item[0].user.name)).filter((item, index, array) => {
        return array.indexOf(item) === index
      })
      // console.log('all_users.value', all_users);

      all_tags = all_tags.concat(ret.value.map(item => item[0].tags.map(tag => Object.values(tag)))).flat(Infinity).filter((item, index, array) => {
        return array.indexOf(item) === index
      }).filter(item => item)
      // 降维、去重、去空字符串
      // console.log('all_tags.value', all_tags.value);

      // -----------------------------------------------------------------------------------------------------------------------------------------

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

onUnmounted(() => {
  if (generator.value !== undefined && generator.value.throw !== undefined) {
    generator.value.throw(new WahuStopIteration())
  }
  options_store.show_cancel = false
})


function executeQuery() {
  queryStringError.value = false

  emits('updateProps', { initialQueryString: queryString.value })
  // emits('updateTitle', '插画:' + queryString.value)

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

const bookmarked_num = ref(0)
// 查询当前用户pixiv收藏夹的数量
function executeQueryNum() {
  wm.p_user_detail(settings_store.user_id)
    .then(dtl => {
      bookmarked_num.value = dtl.total_bookmarked_illust
    })
}

// onMounted(() => {
//   if (props.initialQueryString !== undefined) {
//     queryString.value = props.initialQueryString
//     executeQuery()
//   }
//   emits('updateTitle', '插画:' + queryString.value)
// })

onMounted(() => {
  executeQueryNum()
  if (props.initialQueryString !== undefined) {
    queryString.value = props.initialQueryString
    executeQuery() //获取收藏夹数据
  }
  emits('updateTitle', 'Pixiv收藏')
  options_store.show_cancel = true
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

/* 同步动画 */
.sync {
  animation: rotation 3s linear infinite;
}

/* Select */
:deep(.q-field__native span) {
  max-width: 110px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes rotation {
  0% {
    -webkit-transform: rotate(0deg);
  }

  100% {
    -webkit-transform: rotate(360deg);
  }
}

@media (min-width: 600px) {
  .q-dialog__inner--minimized>div {
    max-width: 900px !important;
  }
}
</style>
