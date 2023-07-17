<template>
  <CheckboxGroup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <template v-slot:default="{ getState, toggle }">
      <q-card v-for="page, index in pageCount" :key="page" class="q-ma-sm">
        <q-card-actions>
          <q-checkbox :model-value="getState(page - 1)" @update:model-value="toggle(page - 1, $event)"
            :label="`收藏 ${page}`" :val="page - 1" :disable="disabled"></q-checkbox>
        </q-card-actions>
        <!-- IllustCardLocal.vue   这里不用预览传参  -->
        <div v-if="dbName !== undefined">
          <q-img :src="`${illustDbImageURL}/${dbName}/${iid}/${page - 1}`" class="image" fit="contain"
            @click="$emit('onPreview_local', `${illustDbImageURL}/${dbName}/${iid}/${page - 1}`)">
          </q-img>
        </div>
        <!-- IllustCardPixiv.vue  点击图片预览 -->
        <div v-if="dbName === undefined && imageSrcList !== undefined">
          <q-img :src="`${serverImageURL}${imageSrcList[page - 1]}`" class="image" fit="contain"
            @click="$emit('onPreview', index)"></q-img>
        </div>
      </q-card>
    </template>
  </CheckboxGroup>
</template>


<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { illustDbImageURL, serverImageURL } from 'src/constants';
import CheckboxGroup from './CheckboxGroup.vue';

// import { defineEmits } from 'vue'
defineEmits(["onPreview"]) //父组件方法

const props = defineProps<{
  pageCount: number,
  dbName?: string,
  iid: number,
  modelValue: Array<number>,
  imageSrcList?: Array<string>,
  disabled: boolean
}>()
// const emits = defineEmits<{ (e: 'update:modelValue', val: Array<number>): void }>()

</script>

<style scoped>
.image {
  max-height: 90vh;
}
</style>
