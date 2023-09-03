<template>
  <transition appear enter-active-class="animated fadeInDown" leave-active-class="animated fadeOutUp">

    <q-card class="login-ctl-box" v-if="props.modelValue">

      <q-card-section v-if="accountSession !== null && accountSession != undefined">
        <div>昵称：<span class="text-h6">{{ accountSession.user_name }}</span></div>
        <div class="text-body-1 text-grey-8">
          uid = {{ accountSession.user_id }}
        </div>
        <div class="text-body-1 text-grey-8">
          将于 {{ accountSession.expire_at }} 过期
        </div>
      </q-card-section>

      <q-card-actions v-if="accountSession === null">
        <div class="text-subtitle-2 text-grey-8">无 Access Token ，无法使用 PixivAPI</div>
        <q-btn @click="attemptLogin" flat stretch :loading="loginLoading">
          获取 Access Token
          <q-tooltip>
            需要提供 Refresh Token
          </q-tooltip>
        </q-btn>
      </q-card-actions>

    </q-card>
  </transition>

  <q-dialog v-model="showDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          没有提供 Refresh Token
        </div>
      </q-card-section>
      <q-card-section v-if="loginExcep !== undefined">
        <div class="text-subtitle1">错误信息：</div>
        <pre style="white-space: pre-wrap;">{{ loginExcep.type }}: {{ loginExcep.repr }}</pre>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="pushWindow({ component: 'GetToken' }); showDialog = false">
          去获取 Refresh Token
        </q-btn>
        <q-btn @click="showDialog = false" flat color="primary">关闭</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as wm from '../plugins/wahuBridge/methods'
import { WahuBackendException } from '../plugins/wahuBridge/client'
import type { AccountSession } from 'src/plugins/wahuBridge/methods';
import { pushWindow } from 'src/plugins/windowManager';

import { useSettingsStore } from 'src/stores/settings';
const settings_store = useSettingsStore();

const loginLoading = ref<boolean>(false)

const props = defineProps<{
  modelValue: boolean
}>()

const accountSession = ref<AccountSession | null>()


function updateAS() {
  wm.p_account_session()
    .then(as => {
      accountSession.value = as;
      // console.log('as', as);
      settings_store.user_id = as.user_id //获取用户id
    })
}

// 自动登录
// onMounted(updateAS)
onMounted(() => {
  // console.log('accountSession.value:', accountSession.value);
  if (accountSession.value === undefined) attemptLogin()
  // updateAS()
})

watch(props, () => {
  if (props.modelValue) { updateAS() }
})

const showDialog = ref<boolean>(false)
const loginExcep = ref<WahuBackendException>()

// 登录
function attemptLogin() {
  loginLoading.value = true
  wm.p_attempt_login()
    .then(ac => {
      accountSession.value = ac
      loginLoading.value = false
    })
    .catch((e: WahuBackendException) => {
      if (e.type == 'AioPixivPyNoRefreshToken') {
        showDialog.value = true
        loginExcep.value = e
      } else {
        throw (e)
      }
    })
    .finally(() => { loginLoading.value = false })
}

const emits = defineEmits<{
  (e: 'update:modelValue', id: boolean): void
}>()

</script>

<style scoped>
.login-ctl-box {
  position: fixed;
  width: 300px;
  right: 10px;
  top: 55px;
  z-index: 999;
}
</style>
