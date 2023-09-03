<!-- 参考：https://blog.csdn.net/Dandrose/article/details/130194124 -->

<template>
  <div class="m-image-wrap">

    <Transition name="mask">
      <div class="m-preview-mask" v-show="showPreview"></div>
    </Transition>

    <Transition name="preview">
      <div class="m-preview-wrap" v-show="showPreview" @click.self="onClose" @wheel.prevent="onWheel">
        <div class="m-preview-body">

          <div class="m-preview-operations">
            <!-- <p class="u-name" :title="getImageName(images[previewIndex])">{{ getImageName(images[previewIndex]) }}</p> -->

            <!-- 缩放倍数 -->
            <div style="display:flex;align-items: center;column-gap:10px">
              <span class="scale-times">
                <span>{{ scale }}</span> X
              </span>
              <q-option-group v-model="scale" :options="scale_options" color="primary" inline dense />
            </div>

            <!-- 旋转、还原等操作 -->
            <div style="display:flex;align-items: center;column-gap:10px;flex-direction: row-reverse;">
              <div class="u-preview-operation" @click="onClose">
                <!-- <q-icon name="close" class="u-icon" color="white" size="22px"></q-icon> -->
                <svg class="u-icon" focusable="false" data-icon="close" aria-hidden="true" viewBox="64 64 896 896">
                  <path
                    d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z">
                  </path>
                </svg>
                <q-tooltip>关闭</q-tooltip>
              </div>
              <div class="u-preview-operation" :class="{ 'u-operation-disabled': scale === maxZoomScale }"
                @click="onZoomin">
                <!-- <q-icon name="zoom_in" class="u-icon" color="white" size="22px"></q-icon> -->
                <svg class="u-icon" focusable="false" data-icon="zoom-in" aria-hidden="true" viewBox="64 64 896 896">
                  <path
                    d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z">
                  </path>
                </svg>
                <q-tooltip>放大</q-tooltip>
              </div>
              <div class="u-preview-operation" :class="{ 'u-operation-disabled': scale === minZoomScale }"
                @click="onZoomout">
                <!-- <q-icon name="zoom_out" class="u-icon" color="white" size="22px"></q-icon> -->
                <svg class="u-icon" focusable="false" data-icon="zoom-out" aria-hidden="true" viewBox="64 64 896 896">
                  <path
                    d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z">
                  </path>
                </svg>
                <q-tooltip>缩小</q-tooltip>
              </div>
              <div class="u-preview-operation" @click="onResetOrigin">
                <!-- <q-icon name="crop_original" class="u-icon" color="white" size="22px"></q-icon> -->
                <!-- <svg class="u-icon" focusable="false" data-icon="expand" aria-hidden="true" viewBox="64 64 896 896">
                <path
                  d="M342 88H120c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V168h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm578 576h-48c-8.8 0-16 7.2-16 16v176H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V680c0-8.8-7.2-16-16-16zM342 856H168V680c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM904 88H682c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V120c0-17.7-14.3-32-32-32z">
                </path>
              </svg> -->
                <!-- <svg class="u-icon" focusable="false" data-icon="expand" aria-hidden="true" viewBox="0 0 1024 1024">
                <path
                  d="M79.189333 112.426667c10.709333-3.925333 856.576-3.584 868.010667 0.896a105.514667 105.514667 0 0 1 59.861333 61.354666c3.925333 10.709333 3.925333 663.936 0 674.645334a105.514667 105.514667 0 0 1-59.861333 61.354666c-11.434667 4.48-857.301333 4.821333-868.010667 0.896a105.557333 105.557333 0 0 1-62.250666-62.250666c-3.925333-10.709333-3.925333-663.936 0-674.645334a105.557333 105.557333 0 0 1 62.250666-62.250666z m868.565334 473.984l-378.922667 178.261333c-2.602667 1.066667-3.242667 1.450667-5.973333 2.133333a32 32 0 0 1-29.397334-7.594666l-189.909333-175.786667-254.677333 119.808-3.114667 1.28c-2.858667 0.810667-3.541333 1.152-6.485333 1.536a64.384 64.384 0 0 1-2.858667 0.213333c0.256 71.168 0.554667 120.917333 0.981333 121.984 4.224 10.666667 13.056 19.285333 23.808 23.253334 4.138667 1.493333 819.370667 0.981333 823.424-0.725334a41.045333 41.045333 0 0 0 22.314667-23.466666c0.64-1.706667 0.896-112.512 0.810667-240.896z m-0.042667-70.613334c-0.213333-158.976-0.896-319.658667-1.877333-321.834666a41.045333 41.045333 0 0 0-24.917334-22.058667C916.949333 170.666667 105.770667 170.837333 101.205333 172.501333a41.088 41.088 0 0 0-24.149333 24.192c-0.981333 2.645333-1.152 256.682667-0.810667 441.728l259.584-122.112a37.504 37.504 0 0 1 9.045334-2.730666 32.426667 32.426667 0 0 1 21.290666 4.394666c2.389333 1.493333 2.858667 2.005333 5.034667 3.797334l189.909333 175.829333 385.28-181.290667 1.322667-0.512z"
                  p-id="2359" />
                <path
                  d="M809.173333 234.666667c15.786667 0.597333 31.189333 4.096 45.44 10.965333a112.341333 112.341333 0 0 1 54.357334 57.045333 111.061333 111.061333 0 0 1 6.528 65.834667 112.469333 112.469333 0 0 1-63.317334 79.146667 111.104 111.104 0 0 1-86.784 2.133333 111.957333 111.957333 0 0 1-68.821333-84.010667 112.128 112.128 0 0 1-0.469333-36.608 112.256 112.256 0 0 1 54.698666-79.744 113.109333 113.109333 0 0 1 58.368-14.762666zM805.034667 298.666667a47.402667 47.402667 0 1 0 2.474666 94.805333A47.402667 47.402667 0 0 0 805.034667 298.666667z"
                  p-id="2360" />
              </svg> -->
                <svg class="u-icon" focusable="false" data-icon="expand" aria-hidden="true" viewBox="0 0 1024 1024">
                  <path
                    d="M365.714286 329.142857q0 45.714286-32 77.714286t-77.714286 32-77.714286-32-32-77.714286 32-77.714286 77.714286-32 77.714286 32 32 77.714286z m585.142857 219.428572v256H146.285714v-109.714286l182.857143-182.857143 91.428572 91.428571 292.571428-292.571428z m54.857143-402.285715H91.428571q-7.428571 0-12.857142 5.428572T73.142857 164.571429v694.857142q0 7.428571 5.428572 12.857143t12.857142 5.428572h914.285715q7.428571 0 12.857143-5.428572t5.428571-12.857143V164.571429q0-7.428571-5.428571-12.857143T1005.714286 146.285714z m91.428571 18.285715v694.857142q0 37.714286-26.857143 64.571429t-64.571428 26.857143H91.428571q-37.714286 0-64.571428-26.857143T0 859.428571V164.571429q0-37.714286 26.857143-64.571429t64.571428-26.857143h914.285715q37.714286 0 64.571428 26.857143t26.857143 64.571429z"
                    p-id="1435"></path>
                </svg>
                <q-tooltip>还原</q-tooltip>
              </div>
              <div class="u-preview-operation" @click="onClockwiseRotate">
                <!-- <q-icon name="rotate_90_degrees_cw" class="u-icon" color="white" size="22px"></q-icon> -->
                <svg class="u-icon" focusable="false" data-icon="rotate-right" aria-hidden="true" viewBox="64 64 896 896">
                  <path
                    d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2A399.75 399.75 0 00123.5 631h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z">
                  </path>
                  <path
                    d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z">
                  </path>
                </svg>
                <q-tooltip>向右旋转</q-tooltip>
              </div>
              <div class="u-preview-operation" @click="onAnticlockwiseRotate">
                <!-- <q-icon name="rotate_90_degrees_ccw" class="u-icon" color="white" size="22px"></q-icon> -->
                <svg class="u-icon" focusable="false" data-icon="rotate-left" aria-hidden="true" viewBox="64 64 896 896">
                  <path
                    d="M672 418H144c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H188V494h440v326z">
                  </path>
                  <path
                    d="M819.3 328.5c-78.8-100.7-196-153.6-314.6-154.2l-.2-64c0-6.5-7.6-10.1-12.6-6.1l-128 101c-4 3.1-3.9 9.1 0 12.3L492 318.6c5.1 4 12.7.4 12.6-6.1v-63.9c12.9.1 25.9.9 38.8 2.5 42.1 5.2 82.1 18.2 119 38.7 38.1 21.2 71.2 49.7 98.4 84.3 27.1 34.7 46.7 73.7 58.1 115.8a325.95 325.95 0 016.5 140.9h74.9c14.8-103.6-11.3-213-81-302.3z">
                  </path>
                </svg>
                <q-tooltip>向左旋转</q-tooltip>
              </div>
            </div>


          </div>

          <div class="m-preview-image" :style="`transform: translate3d(${dragX}px, ${dragY}px, 0px);`">
            <div class="u-spin-circle" v-show="!loaded"></div>
            <!-- v-show="previewIndex === index" 用于多P时切换 -->
            <img v-for="(image, index_) in images" :key="index_" v-show="previewIndex === index_" class="u-preview-image"
              :style="`transform: scale3d(${scale}, ${scale}, 1) rotate(${rotate}deg);`" :src="image"
              @mousedown.prevent="onMouseDown($event)" @load="onLoaded"
              @dblclick="resetOnDbclick ? onResetOrigin() : () => false" />
          </div>

          <template v-if="imageCount > 1">
            <div class="m-switch-left" :class="{ 'u-switch-disabled': previewIndex === 0 && !loop }"
              @click="onSwitchLeft">
              <svg focusable="false" class="u-switch" data-icon="left" aria-hidden="true" viewBox="64 64 896 896">
                <path
                  d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z">
                </path>
              </svg>
            </div>
            <div class="m-switch-right" :class="{ 'u-switch-disabled': previewIndex === imageCount - 1 && !loop }"
              @click="onSwitchRight">
              <svg focusable="false" class="u-switch" data-icon="right" aria-hidden="true" viewBox="64 64 896 896">
                <path
                  d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z">
                </path>
              </svg>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { serverImageURL } from 'src/constants';

import { useOptionsStore } from 'src/stores/options';
const options_store = useOptionsStore();
import { useSettingsStore } from 'src/stores/settings';
const settings_store = useSettingsStore();

interface Image {
  src: string // 图像地址
  name?: string // 图像名称
}
interface Props {
  name?: string // 图像名称，没有传入图片名时自动从图像地址src中读取
  width?: string | number // 图像宽度
  height?: string | number // 图像高度
  fit?: string // 图像如何适应容器高度和宽度
  // src?: string | Image[] // 图像地址 | 图像地址数组
  // src?: string | string[] // 图像地址 | 图像地址数组
  src?: string | any[] // 图像地址 | 图像地址数组
  preview?: string // 预览文本 string | slot
  zoomRatio?: number // 每次缩放比率
  minZoomScale?: number // 最小缩放比例
  maxZoomScale?: number // 最大缩放比例
  resetOnDbclick?: boolean // 缩放移动旋转图片后，是否可以双击还原
  loop?: boolean // 是否可以循环切换图片
}
const props = withDefaults(defineProps<Props>(), {
  name: '',
  width: 300,
  height: '100%',
  fit: 'contain', // 可选 fill(填充) | contain(等比缩放包含) | cover(等比缩放覆盖)
  src: '',
  preview: '预览',
  zoomRatio: 0.1,
  minZoomScale: 0.1,
  maxZoomScale: 10,
  resetOnDbclick: true,
  loop: false
})

// 不需要 在页面上显示这个
const imageWidth = computed(() => {
  if (typeof props.width === 'number') {
    return props.width + 'px'
  } else {
    return props.width
  }
})
const imageHeight = computed(() => {
  if (typeof props.height === 'number') {
    return props.height + 'px'
  } else {
    return props.height
  }
})

const images = computed(() => {
  if (Array.isArray(props.src)) {
    let imgList: string[] = []
    for (let i = 0; i < props.src.length; i++) {
      imgList.push(serverImageURL + props.src[i])
    }
    console.log('images', imgList);
    return imgList //IllustDetailPixiv.vue
  } else {
    return [props.src] //IllustDetailLocal.vue
  }

})
const imageCount = computed(() => {
  return images.value.length
})
onMounted(() => {
  // 监听键盘切换事件
  document.addEventListener('keydown', keyboardSwitch)

})
onUnmounted(() => {
  // 移除键盘切换事件
  document.removeEventListener('keydown', keyboardSwitch)

})
const complete = ref(false) // 图片是否加载完成
const loaded = ref(false) // 预览图片是否加载完成
const previewIndex = ref(0) // 当前预览的图片索引
const showPreview = ref(false) // 是否显示预览
const rotate = ref(0) // 预览图片旋转角度
const scale = ref(1) // 缩放比例
const sourceX = ref(0) // 拖动开始时位置
const sourceY = ref(0) // 拖动开始时位置
const dragX = ref(0) // 拖动横向距离
const dragY = ref(0) // 拖动纵向距离

// 缩放倍数
const scale_options = ref([{
  label: '1X',
  value: 1
}, {
  label: '2X',
  value: 2
}, {
  label: '3X',
  value: 3
}, {
  label: '4X',
  value: 4
}, {
  label: '5X',
  value: 5
}])


function keyboardSwitch(e: KeyboardEvent) {
  e.preventDefault()
  if (showPreview.value && imageCount.value > 1) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      onSwitchLeft()
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      onSwitchRight()
    }
  }
}
function onComplete() { // 图片加载完成
  complete.value = true
}
function onLoaded() { // 预览图片加载完成
  loaded.value = true
}
function getImageName(image: Image) { // 从图像地址src中获取图像名称
  console.log('image', image);
  if (image.name) {
    return image.name
  } else {
    const res = image.src.split('?')[0].split('/')
    return res[res.length - 1]
  }
}
function onPreview(index: number = 0) {
  scale.value = 1
  rotate.value = 0
  dragX.value = 0
  dragY.value = 0
  showPreview.value = true
  previewIndex.value = index//多P时当前点击图片
  // 预览状态
  options_store.img_pre_state = false
  // 关闭侧边栏
  options_store.leftDrawerOpen = false
}
// 消除js加减精度问题的加法函数
function add(num1: number, num2: number) {
  const num1DeciStr = String(num1).split('.')[1]
  const num2DeciStr = String(num2).split('.')[1]
  let maxLen = Math.max(num1DeciStr?.length || 0, num2DeciStr?.length || 0) // 两数中最长的小数位长度
  let num1Str = num1.toFixed(maxLen) // 补零，返回字符串
  let num2Str = num2.toFixed(maxLen)
  const result = +(num1Str.replace('.', '')) + +(num2Str.replace('.', '')) // 转换为整数相加
  return result / Math.pow(10, maxLen)

}
function onClose() {
  showPreview.value = false
  // 预览状态
  options_store.img_pre_state = true
}
function onZoomin() { // 放大
  if (scale.value + props.zoomRatio > props.maxZoomScale) {
    scale.value = props.maxZoomScale
  } else {
    scale.value = add(scale.value, props.zoomRatio)
  }
}
function onZoomout() { // 缩小
  if (scale.value - props.zoomRatio < props.minZoomScale) {
    scale.value = props.minZoomScale
  } else {
    scale.value = add(scale.value, -props.zoomRatio)
  }
}
function onResetOrigin() { // 重置图片为初始状态
  scale.value = 1
  rotate.value = 0
  dragX.value = 0
  dragY.value = 0
}
function onWheel(e: WheelEvent) { // 鼠标滚轮缩放
  // 这里有问题  ---> 直接跳到最大、直接跳到最小
  // // e.preventDefault() // 禁止浏览器捕获滑动事件
  // const scrollZoom = e.deltaY * props.zoomRatio // 滚轮的纵向滚动量
  // console.log('scrollZoom', scrollZoom); // 10
  // if (scale.value === props.minZoomScale && scrollZoom > 0) {
  //   return
  // }
  // if (scale.value === props.maxZoomScale && scrollZoom < 0) {
  //   return
  // }
  // if (scale.value - scrollZoom < props.minZoomScale) {
  //   scale.value = props.minZoomScale
  // } else if (scale.value - scrollZoom > props.maxZoomScale) {
  //   scale.value = props.maxZoomScale
  // } else {
  //   scale.value = add(scale.value, -scrollZoom)
  // }

  if (e.deltaY < 0) onZoomin()
  else onZoomout()


}

function onAnticlockwiseRotate() { // 逆时针旋转
  rotate.value -= 90
}
function onClockwiseRotate() { // 顺时针旋转
  rotate.value += 90
}
function onMouseDown(event: MouseEvent) {
  // event.preventDefault() // 消除拖动元素时的阴影
  const el = event.target // 当前点击的元素
  const imageRect = (el as Element).getBoundingClientRect()
  const top = imageRect.top // 图片上边缘距浏览器窗口上边界的距离
  const bottom = imageRect.bottom // 图片下边缘距浏览器窗口上边界的距离
  const right = imageRect.right // 图片右边缘距浏览器窗口左边界的距离
  const left = imageRect.left // 图片左边缘距浏览器窗口左边界的距离
  const viewportWidth = document.body.clientWidth
  const viewportHeight = document.body.clientHeight
  sourceX.value = event.clientX // 鼠标按下时相对于视口左边缘的X坐标
  sourceY.value = event.clientY // 鼠标按下时相对于视口上边缘的Y坐标
  const sourceDragX = dragX.value // 鼠标按下时图片的X轴偏移量
  const sourceDragY = dragY.value // 鼠标按下时图片的Y轴偏移量
  document.onmousemove = (e: MouseEvent) => {
    // e.clientX返回事件被触发时鼠标指针相对于浏览器可视窗口的水平坐标
    dragX.value = sourceDragX + e.clientX - sourceX.value
    dragY.value = sourceDragY + e.clientY - sourceY.value
  }

  document.onmouseup = () => {
    // 放大图片后，一旦上下超出窗口，松开鼠标就会但回来，很不爽，故注释掉
    // if (dragX.value > sourceDragX + viewportWidth - right) { // 溢出视口右边缘
    //   dragX.value = sourceDragX + viewportWidth - right
    // }
    // if (dragX.value < sourceDragX - left) { // 溢出视口左边缘
    //   dragX.value = sourceDragX - left
    // }


    // if (dragY.value > sourceDragY + viewportHeight - bottom) { // 溢出视口下边缘
    //   dragY.value = sourceDragY + viewportHeight - bottom
    // }
    // if (dragY.value < sourceDragY - top) { // 溢出视口上边缘
    //   dragY.value = sourceDragY - top
    // }

    document.onmousemove = null
  }
}
function onSwitchLeft() {
  if (props.loop) {
    previewIndex.value = (previewIndex.value - 1 + imageCount.value) % imageCount.value
  } else {
    if (previewIndex.value > 0) {
      previewIndex.value--
    }
  }
  loaded.value = false
}
function onSwitchRight() {
  if (props.loop) {
    previewIndex.value = (previewIndex.value + 1) % imageCount.value
  } else {
    if (previewIndex.value < imageCount.value - 1) {
      previewIndex.value++
    }
  }
  loaded.value = false
}


defineExpose({
  onPreview
})

</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.preview-enter-active,
.preview-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}

.u-spin-circle {
  position: absolute;
  inset: 0;
  margin: auto;
  pointer-events: none;
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border-width: 4px;
  border-style: solid;
  // border-color: @themeColor;
  border-top-color: transparent; // 隐藏1/4圆
  animation: loadingCircle 1s infinite linear;
  -webkit-animation: loadingCircle 1s infinite linear;
}

@keyframes loadingCircle {
  100% {
    transform: rotate(360deg);
  }
}

.m-image-wrap {
  // display: none;

  .image-hover-mask {
    &:hover {
      .m-image-mask {
        opacity: 1;
        pointer-events: auto;
      }
    }
  }

  .m-image {
    position: relative;
    display: inline-block;
    display: none;

    .u-image {
      width: 100%;
      height: 100%;
      vertical-align: middle;
    }

    .m-image-mask {
      // top right bottom left 简写为 inset: 0
      // insert 无论元素的书写模式、行内方向和文本朝向如何，其所定义的都不是逻辑偏移而是实体偏移
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;

      .m-image-mask-info {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0 4px;

        .u-eye {
          display: inline-flex;
          align-items: center;
          margin-right: 4px;
          vertical-align: -0.125em;
          width: 14px;
          height: 14px;
          fill: #FFF;
        }
      }
    }
  }

  .m-preview-mask {
    position: fixed;
    inset: 0;
    z-index: 1000;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.45);
  }

  .m-preview-wrap {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;
    outline: 0;
    z-index: 1080;
    height: 100%;
    text-align: center;

    .m-preview-body {
      position: absolute;
      // padding-top: 50px;
      inset: 0;
      overflow: hidden;
      pointer-events: none;

      .m-preview-operations {
        position: relative;
        z-index: 9;
        display: flex;
        flex-direction: row;
        align-items: center;
        background: rgba(0, 0, 0, 0.1);
        height: 42px;
        pointer-events: auto;
        justify-content: space-between;

        .u-name {
          position: absolute;
          left: 12px;
          color: rgba(255, 255, 255, 0.88);
          font-size: 16px;
          max-width: calc(100vw - 414px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scale-times {
          color: rgba(255, 255, 255, 0.88);
          font-size: 16px;
          margin-left: 20px;
          margin-right: 50px;

          span {
            width: 20px;
            display: inline-block;
          }
        }

        :deep(.q-radio__inner, .q-radio__label) {
          color: rgba(255, 255, 255, 0.88);
        }

        :deep(.q-radio__label) {
          color: rgba(255, 255, 255, 0.88);
        }

        .u-preview-operation {
          line-height: 1;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:not(:last-child) {
            margin-left: 12px;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.25);
          }

          .u-icon {
            width: 21px;
            height: 18px;
            vertical-align: bottom;
            fill: #FFF;
          }
        }

        .u-operation-disabled {
          color: rgba(255, 255, 255, 0.25);
          pointer-events: none;

          .u-icon {
            fill: rgba(255, 255, 255, 0.25);
          }
        }
      }

      .m-preview-image {
        position: absolute;
        z-index: 3;
        inset: 0;
        transition: transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
        display: flex;
        justify-content: center;
        align-items: center;

        .u-preview-image {
          display: inline-block;
          vertical-align: middle;
          max-width: 100%;
          max-height: 100%;
          transform: scale3d(1, 1, 1);
          cursor: grab;
          transition: transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
          user-select: none;
          pointer-events: auto;
        }
      }

      .m-switch-left {
        inset-inline-start: 12px;
        position: fixed;
        inset-block-start: 50%;
        z-index: 1081;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-top: -20px;
        color: rgb(255, 255, 255);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        transition: all 0.3s;
        pointer-events: auto;

        .u-switch {
          width: 18px;
          height: 18px;
          fill: #FFF;
        }
      }

      .m-switch-right {
        inset-inline-end: 12px;
        position: fixed;
        inset-block-start: 50%;
        z-index: 1081;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-top: -20px;
        color: rgb(255, 255, 255);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        transition: all 0.3s;
        pointer-events: auto;

        .u-switch {
          width: 18px;
          height: 18px;
          fill: #FFF;
        }
      }

      .u-switch-disabled {
        color: rgba(255, 255, 255, 0.25);
        background: transparent;
        cursor: not-allowed;

        .u-switch {
          fill: rgba(255, 255, 255, 0.25);
        }
      }
    }
  }
}
</style>
