<template>
  <transition appear enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">
    <q-card class="dl-card scroll" v-show="modelValue">
      <q-checkbox v-model="showFinished" label="显示已完成"></q-checkbox>
      <!-- <span style="margin-left:50px">剩余任务：50</span> -->
      <q-markup-table>
        <thead>
          <tr align="center">
            <th style="width:50px">索引</th>
            <!-- <th style="width:100px">时间</th> -->
            <!-- <th style="width:100px">repo</th> -->
            <!-- <th>iid</th>
            <th>作者</th> -->
            <th style="width:200px">描述</th>
            <th style="width:200px">进度</th>
            <th style="width:50px">状态</th>
            <!-- <th style="width:100px">操作</th> -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="dl, index in dlProgList" :key="dl.gid" v-show="dl.status != 'finished' || showFinished"
            align="center">
            <td>{{ index }}</td>
            <!-- <td>YYYY-MM-DD hh-mm-ss</td> -->
            <!-- <td>repo name</td> -->
            <!-- <td>iid</td>
            <td>author</td> -->
            <td>{{ dl.descript }}</td>
            <td>
              <q-linear-progress
                :value="dl.total_size === null ? (dl.status == 'inprogress' ? undefined : 1) : dl.downloaded_size / dl.total_size"
                :color="getColor(dl.status)" :indeterminate="dl.total_size === null && dl.status == 'inprogress'">
              </q-linear-progress>
              <div class="text-body-2">
                {{ (dl.downloaded_size / 1024).toFixed(0) }} / {{ dl.total_size === null ? '' : (dl.total_size /
                  1024).toFixed(0) }} kb
              </div>
            </td>
            <td>
              {{ statusStringFor(dl.status) }}
            </td>
            <!-- <th>
              <q-btn v-if="dl.status === 'error'" color="secondary" label="重试" />
              <span v-else>-</span>
            </th> -->
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </transition>
</template>

<script setup lang="ts">
import * as wm from '../plugins/wahuBridge/methods'
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{ modelValue: boolean }>()
const emits = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const dlProgList = ref<Array<wm.DownloadProgress>>([])

const showFinished = ref<boolean>(false)


function listen() {
  wm.wahu_dl_status()
    .then(status => {
      // console.log('dlProgList.value status:', status);
      // descript : "106449882_0.png"
      // downloaded_size : 4390912
      // gid : "87jgalyp"
      // status : "finished"
      // total_size : 4390339
      dlProgList.value = status
    })
    .then(() => {
      setTimeout(listen, 500)
    })
}


onMounted(() => {
  listen()
})

function statusStringFor(val: string) {
  switch (val) {
    case 'inprogress':
      return '下载中'
    case 'finished':
      return '完成'
    case 'error':
      return '失败'
    case 'pending':
      return '等待中'
  }
}

function getColor(status: string) {
  switch (status) {
    case 'inprogress':
      return 'primary'
    case 'error':
      return 'red'
    case 'finished':
      return 'green'
    case 'pending':
      return 'primary'
  }
}

</script>

<style scoped lang="scss">
.dl-card {
  position: fixed;

  @media (min-width: $breakpoint-md-min) {
    width: 60vw;
  }

  @media (max-width: $breakpoint-sm-max) {
    width: 95vw;
  }

  min-width: 300px;
  right: 10px;
  top: 55px;
  z-index: 999;
  max-height: 80vh;
}
</style>
