<template>
  <!-- 改成 功能栏 -->
  <q-card inline-actions class="text-white bg-blue  flex justify-between items-center  "
    style="padding: 0 20px;height: 50px;position: fixed;z-index: 99;left: 0;right: 0;top: 50px;border-radius: 0;">

    <!-- 1、选择本地收藏夹 -->
    <div class=" flex items-center select-div">
      <span style="font-size: 16px;">收藏夹：</span>
      <q-select outlined dense v-model="options_store.dbName" :options="Object.values(props.dbNameList)"
        style="width:250px" />
      <span style="margin-left:20px">总数：{{ queryResult.length }}</span>
      <span style="margin-left:20px">未同步：{{ bookmarked_num > 0 ? (bookmarked_num - queryResult.length) : '...' }}</span>
    </div>
    <!-- <div v-if="queryResult.length > numPerPage"></div> -->


    <!--2、筛选方式：-->
    <div class="flex items-center " style="column-gap: 10px;">

      <q-input outlined v-model="queryString" dense options-dense @keyup.enter="executeQuery" clearable clear-icon="close"
        bg-color="white" input-style="font-size:20px;color:black;" style="width:300px" />

      <q-btn icon="help" size="sm" flat @click="getHelpText(); showHelp = !showHelp">
        <q-tooltip>帮助</q-tooltip>
      </q-btn>

    </div>

    <q-dialog v-model="showHelp">
      <q-card>
        <pre class="q-ma-md">{{ helpText }}</pre>
        <q-btn flat class="float-right q-ma-md" color="primary" @click="showHelp = false">关闭</q-btn>
      </q-card>
    </q-dialog>

    <q-pagination class=" flex justify-center" v-model="page" v-if="queryResult.length > numPerPage"
      :max="Math.ceil(queryResult.length / numPerPage)" :max-pages="8" gutter="20px" boundary-numbers color="white"
      active-color="primary" style="column-gap: 10px;">
    </q-pagination>

    <div class="flex items-center" style="column-gap:10px">
      <q-toggle v-model="settings_store.h_switch" keep-color color="red" :label="r18" left-label />

      <DatabaseActions :db-name="options_store.dbName" @update-subscrip="executeQuery" @update-num="executeQueryNum">
      </DatabaseActions>

    </div>

    <!-- <q-linear-progress :indeterminate="queryLoading"></q-linear-progress> -->

  </q-card>


  <CheckboxGroup v-model="selected">
    <template v-slot:default="{ toggle, getState }">

      <div class="row q-col-gutter-sm q-ma-md" style="margin-top:100px">
        <transition-group appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
          <!-- 展示图片card -->
          <div class="col-md-3 col-sm-6 col-xs-12 col-lg-2" v-for="[iid, score], index in displayed" :key="iid">
            <IllustCardLocal :iid="iid" :index='index' :db-name="options_store.dbName"
              @update:select="toggle(iid, $event)" :selected="getState(iid)" :score="score === -1 ? undefined : score"
              height="300px" :page="page">
            </IllustCardLocal>
          </div>
        </transition-group>
      </div>

    </template>
  </CheckboxGroup>

  <DatabaseToolbar v-model="selected" :db-name="options_store.dbName" :all="queryResult.map(v => v[0])"
    @delete="handleDelete">
  </DatabaseToolbar>

  <GotoTop></GotoTop>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import IllustCardLocal from '../components/IllustCardLocal.vue'
import * as wm from '../plugins/wahuBridge/methods'
import { pushNoti } from '../plugins/notifications';
import { numPerPage } from '../constants';
import DatabaseToolbar from 'src/components/DatabaseToolbar.vue';
import CheckboxGroup from 'src/components/CheckboxGroup.vue';
import GotoTop from 'src/components/GotoTop.vue';
import DatabaseActions from 'src/components/DatabaseActions.vue';

import { useSettingsStore } from 'src/stores/settings';
import { useOptionsStore } from 'src/stores/options';
import { storeToRefs } from 'pinia';
const settings_store = useSettingsStore();
const options_store = useOptionsStore();

const props = defineProps<{
  dbName: string,
  initialQueryString?: string
  dbNameList: string[]
}>()
const emits = defineEmits<{
  (e: 'updateProps', val: object): void,
  (e: 'updateTitle', val: string): void,
}>()


const bookmarked_num = ref(0)
// 查询当前用户pixiv收藏夹的数量
function executeQueryNum(name: string) {

  wm.ibd_get_config(name)
    .then(cfg => {
      if (cfg.subscribed_bookmark_uid[0]) {
        wm.p_user_detail(cfg.subscribed_bookmark_uid[0])
          .then(dtl => {
            // console.log('dtl', dtl);
            bookmarked_num.value = dtl.total_bookmarked_illust
          })
      }
    })
}

watch(() => options_store.dbName, (n, o) => {
  // console.log('options_store.dbName n', n);
  queryString.value = '-a'
  executeQueryNum(n)
  executeQuery()
})

let r18 = computed(() => { return settings_store.h_switch ? 'H哟西' : 'H哒咩' })

const showHelp = ref<boolean>(false)

const queryString = ref<string>('')
const queryStringError = ref<boolean>(false)

const queryResult = ref<Array<[number, number]>>([])

const queryLoading = ref<boolean>(false)

const page = ref<number>(1)

const selected = ref<Array<number>>([])


function executeQuery() {
  queryStringError.value = false

  // emits('updateTitle', props.dbName + ':' + queryString.value)
  emits('updateProps', { ...props, initialQueryString: queryString.value })

  queryLoading.value = true
  // console.log('queryString.value', queryString.value);
  wm.ibd_query(options_store.dbName, queryString.value)
    .then(ret => {
      // queryResult.value = ret.reverse()//数组翻转，最近收藏的显示在第一页
      // 不用翻转，后端已经翻转
      queryResult.value = ret
      queryLoading.value = false
    })
    .catch(e => {
      queryStringError.value = true
      queryLoading.value = false
      console.log(e)
    })

}

onMounted(() => {
  executeQueryNum(props.dbName)
  emits('updateTitle', '本地收藏夹')
  if (props.initialQueryString !== undefined) {
    queryString.value = props.initialQueryString
    executeQuery()
  }
})

const displayed = computed(() => {
  return queryResult.value.slice(
    numPerPage * (page.value - 1), numPerPage * page.value)
})


function handleDelete() {
  queryResult.value = queryResult.value.filter(v => !selected.value.includes(v[0]))
  selected.value = []
  executeQueryNum(props.dbName)//更新未同步数；
}

const helpText = ref<string>('')

function getHelpText() {
  wm.ibd_query_help().then(s => helpText.value = s)
}

</script>

<style scoped>
pre {
  white-space: pre-wrap;
}

:deep(.q-field__native span) {
  max-width: 110px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-dialog__inner--minimized>div {
  width: 900px;
}

@media screen and (min-width: 800px) {
  .select-div {
    display: none;
  }

}
</style>
