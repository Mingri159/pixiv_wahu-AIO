<template>
  <div>

    <q-btn-dropdown color="secondary" icon="menu">
      <q-list>
        <q-item clickable v-close-popup flat @click="showConfig = !showConfig">
          <q-item-section avatar><q-icon name="settings"></q-icon></q-item-section>
          <q-item-section>配置</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="updateSubscribe" :loading="updateSubsLoading">
          <q-item-section avatar><q-icon name="sync"></q-icon></q-item-section>
          <q-item-section>更新订阅</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="showUpdateSubs = !showUpdateSubs" :loading="updateSubsLoading">
          <q-item-section avatar><q-icon name="history"></q-icon></q-item-section>
          <q-item-section>订阅记录</q-item-section>
        </q-item>
        <!-- <q-item clickable @click="update">
          <q-item-section avatar><q-icon name="update"></q-icon></q-item-section>
          <q-item-section>更新详情</q-item-section>
        </q-item> -->
        <q-item clickable @click="exportJson">
          <q-item-section avatar><q-icon name="file_upload"></q-icon></q-item-section>
          <q-item-section>导出 JSON</q-item-section>
          <q-menu auto-close anchor="top right">
            <q-btn :href="objURLForExport" target="_blank" :loading="objURLForExport === undefined"
              @click="objURLForExport = undefined" label="下载"></q-btn>
          </q-menu>
        </q-item>
        <q-item clickable>
          <q-item-section avatar><q-icon name="file_download"></q-icon></q-item-section>
          <q-item-section>导入 JSON</q-item-section>
          <q-menu anchor="top right">
            <q-file :model-value="jsonUpload" @update:model-value="handleJsonUpload" label="上传 JSON 文件"></q-file>
          </q-menu>
        </q-item>

      </q-list>
    </q-btn-dropdown>

    <DatabaseConfig v-model="showConfig" :db-name="dbName"></DatabaseConfig>

    <!-- @hide="settings_store.updateSubSInfo = '更新订阅..\n'" -->
    <q-dialog v-model="showUpdateSubs">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section><q-linear-progress :indeterminate="updateSubsLoading"></q-linear-progress></q-card-section>
        <q-card-section>
          <q-scroll-area style="height: 650px;" ref="infoScroller">
            <pre class="q-ma-md">{{ updateSubSInfo }}</pre>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as wm from '../plugins/wahuBridge/methods'
import { pushNoti } from '../plugins/notifications';
import DatabaseConfig from 'src/components/DatabaseConfig.vue';
import { QScrollArea } from 'quasar';

const props = defineProps<{
  dbName: string,
}>()

const emits = defineEmits<{
  (e: 'updateSubscrip'): void
  (e: 'updateNum', name: string): void,
}>()

const showConfig = ref<boolean>(false)
const showUpdateSubs = ref<boolean>(false)
// const updateSubsPageCount = ref<number>(-1)
const updateSubSInfo = ref<string>('更新订阅..\n')

const infoScroller = ref<QScrollArea | null>(null)

const jsonUpload = ref<File>()

const updateSubsLoading = ref<boolean>(false)

async function consumePipedInfo(pipe: AsyncGenerator<string, undefined, string | null>) {
  while (true) {
    let value = await pipe.next()
    updateSubSInfo.value += '\n' + value.value; //更新信息窗口

    if (infoScroller.value != null)
      infoScroller.value.setScrollPercentage('vertical', 1, 0.1)
    if (value.done) {
      updateSubsLoading.value = false
      emits('updateSubscrip')
      emits('updateNum', props.dbName)
      return
    }
  }
}

function updateSubscribe() {
  showUpdateSubs.value = true

  // 获取配置中更新页数
  wm.ibd_get_config(props.dbName)
    .then(cfg => {
      // 更新订阅
      wm.ibd_update_subs(props.dbName, cfg.subscribe_pages)
        .then(consumePipedInfo)
    })

  updateSubsLoading.value = true

}

const objURLForExport = ref<string>()
function exportJson() {
  wm.ibd_export_json(props.dbName)
    .then(json => {
      objURLForExport.value = window.URL.createObjectURL(
        new Blob([json], { type: 'application/json' })
      )
    })
}

function handleJsonUpload(f: File) {
  jsonUpload.value = f
  const reader = new FileReader()
  reader.readAsText(f, 'utf-8')
  reader.onload = () => {
    if (typeof reader.result == 'string') {
      wm.ibd_import_json(props.dbName, reader.result)
        .then(() => {
          pushNoti({
            level: 'success',
            msg: '导入 JSON 到 ' + props.dbName + ' 成功'
          })
        })
    } else {
      pushNoti({
        level: 'error',
        msg: '读取文件失败'
      })
    }
  }
}

// function update() {
//   wm.ibd_update(props.dbName)
//     .then(num => {
//       pushNoti({
//         level: 'success',
//         msg: `更新了 ${props.dbName} 的 ${num} 条详情`
//       })
//     })
// }

</script>
