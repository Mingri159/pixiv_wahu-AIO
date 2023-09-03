<template>
  <!-- @hide="settings_store.updateSubSInfo = '更新订阅..\n'" -->
  <q-dialog v-model="options_store.showUpdateSubs">
    <q-card style="width: 700px; max-width: 80vw;overflow-y: hidden;">
      <q-card-section><q-linear-progress
          :indeterminate="options_store.updateSubsLoading"></q-linear-progress></q-card-section>
      <q-card-section>
        <q-scroll-area style="height: 650px;" ref="infoScroller">
          <pre class="q-ma-md">{{ options_store.updateSubSInfo }}</pre>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, provide, watch } from 'vue'
import * as wm from '../plugins/wahuBridge/methods'
import { pushNoti } from '../plugins/notifications';
import { QScrollArea } from 'quasar';

import { useOptionsStore } from 'src/stores/options';
const options_store = useOptionsStore();


const props = defineProps<{
  dbName: string
}>()

const emits = defineEmits<{
  (e: 'updateSubscrip'): void
  (e: 'updateNum', name: string): void,
}>()

const updateSubSInfo = ref<string>('更新订阅..\n')
const infoScroller = ref<QScrollArea | null>(null)

async function consumePipedInfo(pipe: AsyncGenerator<string, undefined, string | null>) {

  while (true) {
    let value = await pipe.next()
    console.log(value.value);
    options_store.updateSubSInfo += '\n' + value.value; //更新信息窗口

    if (value.done) {
      options_store.updateSubsLoading = false
      emits('updateSubscrip')
      // emits('updateNum', props.dbName)
      emits('updateNum', options_store.dbName)

      return
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


defineExpose({
  consumePipedInfo,
  // update
});


onMounted(() => {
  console.log('---updateInfo---');
})

watch(() => options_store.updateSubSInfo, (n, o) => {
  if (infoScroller.value != null)
    infoScroller.value.setScrollPercentage('vertical', 1, 0.1)

})

</script>

<style lang=''>

</style>
