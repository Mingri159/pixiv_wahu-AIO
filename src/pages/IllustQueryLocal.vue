<template>
  <div style="margin-top:40px">
    <!-- 改成 功能栏 -->
    <!-- <q-card inline-actions class="text-white bg-blue  flex justify-between items-center  "
      style="padding: 5px 20px 0 20px;height: 50px;position: fixed;z-index: 99;left: 0;right: 0;top: 50px;border-radius: 0;">
      <div></div>
      <div class="flex items-center" style="column-gap: 10px;">

        <div class="flex items-center">
          <span>查询：</span>
          <q-input v-model="queryString" outlined dense options-dense style="width:200px"
            input-style="font-size:20px;color:white;" autofocus @keyup.enter="executeQuery" clearable
            clear-icon="close" />
        </div>
        <q-btn icon="help" size="sm" flat @click="getHelpText(); showHelp = !showHelp">
          <q-tooltip>帮助</q-tooltip>
        </q-btn>

        <q-dialog v-model="showHelp">
          <q-card>
            <pre class="q-ma-md">{{ helpText }}</pre>
            <q-btn flat class="float-right q-ma-md" color="primary" @click="showHelp = false">关闭</q-btn>
          </q-card>
        </q-dialog>
      </div>
      <q-pagination class=" flex justify-center" v-model="page" v-if="queryResult.length > numPerPage"
        :max="Math.ceil(queryResult.length / numPerPage)" :max-pages="6" gutter="md" boundary-numbers color="white"
        active-color="primary" style="column-gap: 10px;">
      </q-pagination>

      <q-toggle v-model="settings.h_switch" keep-color color="red" :label="r18" left-label />



    </q-card> -->
    <q-linear-progress :indeterminate="queryLoading"></q-linear-progress>

    <q-pagination class="q-ma-md flex justify-center" v-model="page" v-if="queryResult.length > numPerPage"
      :max="Math.ceil(queryResult.length / numPerPage)" style="margin-top:100px !important">
    </q-pagination>

    <CheckboxGroup v-model="selected">
      <template v-slot:default="{ toggle, getState }">

        <div class="row q-col-gutter-sm q-ma-md">
          <transition-group appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
            <div class="col-md-3 col-sm-6 col-xs-12 col-lg-2" v-for="[iid, score], index in displayed" :key="iid">
              <IllustCardLocal :iid="iid" :index='index' :db-name="props.dbName" @update:select="toggle(iid, $event)"
                :selected="getState(iid)" :score="score === -1 ? undefined : score" height="300px" :page="page">
              </IllustCardLocal>
            </div>
          </transition-group>
        </div>

      </template>
    </CheckboxGroup>

    <DatabaseToolbar v-model="selected" :db-name="dbName" :all="queryResult.map(v => v[0])" @delete="handleDelete">
    </DatabaseToolbar>

    <GotoTop></GotoTop>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import IllustCardLocal from '../components/IllustCardLocal.vue'
import * as wm from '../plugins/wahuBridge/methods'
import { pushNoti } from '../plugins/notifications';
import { numPerPage } from '../constants';
import DatabaseToolbar from 'src/components/DatabaseToolbar.vue';
import CheckboxGroup from 'src/components/CheckboxGroup.vue';
import GotoTop from 'src/components/GotoTop.vue';
import DatabaseActions from 'src/components/DatabaseActions.vue';


const props = defineProps<{
  dbName: string,
  initialQueryString?: string
}>()
const emits = defineEmits<{
  (e: 'updateProps', val: object): void,
  (e: 'updateTitle', val: string): void,
}>()


// const user_select = ref(null)
// const user_data = ['特日日rir日日日日日日日日', '阿稳同学', '彗星', '局长', '特日日rir日日日日日日日日', '阿稳同学', '彗星', '局长', '特日日rir日日日日日日日日', '阿稳同学', '彗星', '局长', '特日日rir日日日日日日日日', '阿稳同学', '彗星', '局长',]
// const user_option = ref(user_data)

// const tag_select = ref(null)
// const tag_data = ['Genshin1', '胡桃1', '芭芭拉1', '格蕾修1', 'Genshin', '胡桃', '芭芭拉', '格蕾修', 'Genshin', '胡桃', '芭芭拉', '格蕾修', 'Genshin', '胡桃', '芭芭拉', '格蕾修']
// const tags_option = ref(tag_data)


// function filterFn(val: string, update: any) {
//   if (val === '') {
//     update(() => {
//       user_option.value = user_data
//     })
//     return
//   }

//   update(() => {
//     const needle = val.toLowerCase()
//     user_option.value = user_data.filter(v => v.toLowerCase().indexOf(needle) > -1)
//   })
// }
const settings = ref({
  h_switch: false,
  ai_switch: false
})

let r18 = computed(() => { return settings.value.h_switch ? 'H哟西' : 'H哒咩' })

const showHelp = ref<boolean>(false)

const queryString = ref<string>('')
const queryStringError = ref<boolean>(false)

const queryResult = ref<Array<[number, number]>>([])

const queryLoading = ref<boolean>(false)

const page = ref<number>(1)

const selected = ref<Array<number>>([])

function executeQuery() {
  queryStringError.value = false

  emits('updateTitle', props.dbName + ':' + queryString.value)
  emits('updateProps', { ...props, initialQueryString: queryString.value })

  queryLoading.value = true
  wm.ibd_query(props.dbName, queryString.value)
    .then(ret => {
      queryResult.value = ret
      queryLoading.value = false
    })
    .catch(e => {
      queryStringError.value = true
      queryLoading.value = false
      console.log(e)
    })

}

// onMounted(() => {
//   emits('updateTitle', '本地储存库')
// })

onMounted(() => {
  emits('updateTitle', props.dbName)

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
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
