<template>
  <q-drawer v-model="modelValue" elevated overlay>
    <q-scroll-area style="height: 100%">

      <q-list>
        <q-item v-ripple clickable
          @click="pushWindow({ component: 'Home', title: 'Home' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="terminal"></q-icon></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item v-ripple clickable
          @click="pushWindow({ component: 'CliScriptView', title: '命令行脚本' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="code"></q-icon></q-item-section>
          <q-item-section>命令行脚本</q-item-section>
        </q-item>

        <q-item-label header>本地</q-item-label>

        <q-expansion-item label="本地收藏夹" icon="data_array">
          <q-list>
            <div class="q-ml-lg">
              <!-- <q-item clickable v-ripple @click="clickDb('my_favourite')" style="margin-left: 50px;">
                ❤ &nbsp; - &nbsp; <span>my_favourite</span>
              </q-item> -->
              <q-item clickable v-for="dbn in dbNameList" :key="dbn" v-ripple style="margin-left: 50px;">
                <q-item-section @click="clickDb(dbn)">
                  ❤ &nbsp; - &nbsp; {{ dbn }}
                </q-item-section>
                <q-item-section side v-show="dbn !== 'my_favourite'">
                  <q-btn icon="backspace" @click="showDelDbDiag = true; dbNameToDel = dbn" flat size="xs" padding="5px">
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple style="margin-left: 45px;">
                <q-item-section avatar>
                  <q-icon name="add"></q-icon>
                  <q-tooltip>新建</q-tooltip>
                </q-item-section>
                <q-menu transition-show="slide-right" transition-hide="slide-left" v-model="newdb_show">
                  <q-input label="数据库名" underlined class="q-ma-md" @keyup.enter="newDb(newDbName)" v-model="newDbName"
                    :error="newDbInputError" @input="newDbInputError = false" autofocus></q-input>
                </q-menu>
              </q-item>
            </div>
          </q-list>
        </q-expansion-item>

        <q-dialog v-model="showDelDbDiag">
          <q-card>
            <q-card-section>
              <div class="text-h5">是否删除插画数据库 {{ dbNameToDel }}？</div>
            </q-card-section>
            <q-card-section>
              <div class="text-body-1">文件不会被移动到回收站，此操作不可逆</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" @click="deleteDb" v-close-popup>确认</q-btn>
              <q-btn flat color="primary" v-close-popup>取消</q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- storage -->
        <!-- <q-item v-ripple clickable
          @click="pushWindow({ component: 'IllustQueryLocal', title: '本地储存库' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="source"></q-icon></q-item-section>
          <q-item-section>本地储存库</q-item-section>
        </q-item> -->


        <q-expansion-item label='本地储存库' icon="source">
          <q-list>
            <div class="q-ml-lg">
              <q-item v-for="rpn in repoNameList" :key="rpn" v-ripple clickable style="margin-left: 50px;">
                <q-item-section @click="clickRepo(rpn)">
                  🔶 &nbsp; - &nbsp; {{ rpn }}
                </q-item-section>
                <q-item-section side v-show="rpn !== 'Favourite'">
                  <q-btn icon="backspace" @click="showDelRpDiag = true; repoNameToDel = rpn" flat size="xs" padding="5px">
                    <q-tooltip>删除</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple style="margin-left: 45px;">
                <q-item-section avatar>
                  <q-icon name="add"></q-icon>
                  <q-tooltip>新建</q-tooltip>
                </q-item-section>
                <q-menu transition-show="slide-right" transition-hide="slide-left" v-model="newrepo_show">
                  <q-input label="储存库名" underlined class="q-ma-md" v-model="newRepoName" :error="newRepoInputError"
                    @input="newRepoInputError = false" autofocus></q-input>
                  <q-input label="路径" underlined class="q-ma-md" @keyup.enter="newRepo" v-model="newRepoPrefix"
                    :error="newRepoInputError" @input="newRepoInputError = false" hide-hint hint="回车提交"></q-input>
                </q-menu>
              </q-item>
            </div>
          </q-list>
        </q-expansion-item>


        <q-item v-ripple clickable
          @click="pushWindow({ component: 'History', title: '浏览历史' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="history"></q-icon></q-item-section>
          <q-item-section>浏览历史</q-item-section>
        </q-item>

        <q-item v-ripple clickable
          @click="pushWindow({ component: 'TagRegression', title: '插画标签逻辑回归' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="analytics"></q-icon></q-item-section>
          <q-item-section>插画标签逻辑回归</q-item-section>
        </q-item>

        <q-dialog v-model="showDelRpDiag">
          <q-card>
            <q-card-section>
              <div class="text-h5 q-ma-none">是否删除插画储存库 {{ repoNameToDel }} ？</div>
            </q-card-section>
            <q-card-section>
              <div class="text-body-1">储存库目录不会被删除，仅是从 PixivWahu 的设置中移除</div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat color="primary" @click="deleteRepo" v-close-popup>确认</q-btn>
              <q-btn flat color="primary" v-close-popup>取消</q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-item-label header>Pixiv</q-item-label>

        <q-item clickable v-ripple
          @click="pushWindow({ component: 'PixivSearchIllust', title: 'Pixiv搜索', props: { initialQueryString: '-s', showNavBar: true } }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="search"></q-icon></q-item-section>
          <q-item-section>搜索<q-tooltip>插画</q-tooltip></q-item-section>

        </q-item>

        <q-item clickable v-ripple
          @click="pushWindow({ component: 'PixivFavorite', title: 'Pixiv收藏', props: { initialQueryString: '-b' } }); $emit('update:modelValue', false)">
          <!-- <q-item-section avatar><q-icon name="bookmark"></q-icon></q-item-section> -->
          <q-item-section avatar><q-icon name="favorite"></q-icon></q-item-section>
          <q-item-section>收藏</q-item-section>
        </q-item>

        <q-item clickable v-ripple
          @click="pushWindow({ component: 'PixivSearchIllust', title: '推荐', props: { initialQueryString: '-r', showNavBar: false } }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="recommend"></q-icon></q-item-section>
          <q-item-section>推荐</q-item-section>
        </q-item>

        <q-expansion-item label="插画" icon="panorama">
          <q-card class="q-ml-lg">
            <q-list>
              <q-item clickable v-ripple
                @click="pushWindow({ component: 'PixivSearchIllust', title: '大家的新作', props: { initialQueryString: '-n', showNavBar: false } }); $emit('update:modelValue', false)">
                <q-item-section avatar><q-icon name="newspaper"></q-icon></q-item-section>
                <q-item-section>大家的新作</q-item-section>
              </q-item>
              <q-item clickable v-ripple
                @click="pushWindow({ component: 'PixivSearchIllust', title: '关注画师的新作', props: { initialQueryString: '-f', showNavBar: false } }); $emit('update:modelValue', false)">
                <q-item-section avatar><q-icon name="account_box"></q-icon></q-item-section>
                <q-item-section>关注画师的新作</q-item-section>
              </q-item>


              <q-item clickable v-ripple
                @click="pushWindow({ component: 'TrendingTags' }); $emit('update:modelValue', false)">
                <q-item-section avatar><q-icon name="trending_up"></q-icon></q-item-section>
                <q-item-section>趋势标签</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-expansion-item>

        <q-item clickable v-ripple
          @click="pushWindow({ component: 'PixivSearchUser', title: '关注的画师', props: { initialQueryString: '-F' } }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="how_to_reg"></q-icon></q-item-section>
          <q-item-section>关注的画师</q-item-section>
          <q-tooltip>也可以在这里搜索其他画师</q-tooltip>
        </q-item>

        <q-item clickable
          @click="pushWindow({ component: 'GetToken', title: '获取 RefreshToken' }); $emit('update:modelValue', false)">
          <q-item-section avatar><q-icon name="token"></q-icon></q-item-section>
          <q-item-section>获取 Refresh Token</q-item-section>
        </q-item>

      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts">
import * as wm from '../plugins/wahuBridge/methods'
import { pushWindow } from 'src/plugins/windowManager'
import { pushNoti } from 'src/plugins/notifications';
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';

import { useOptionsStore } from 'src/stores/options';
const options_store = useOptionsStore();

export default defineComponent({
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {

    const newdb_show = ref(false)
    const newrepo_show = ref(false)

    const dbNameList = ref<Array<string>>([])
    const repoNameList = ref<Array<string>>([])

    const $q = useQuasar()

    function updateContent() {
      wm.ibd_list().then(ls => {
        let index = ls.indexOf("my_favourite");
        if (index !== -1) {
          ls.unshift(ls.splice(index, 1)[0]);
        }
        dbNameList.value = ls
      })
      wm.ir_list().then(ls => {
        let index = ls.indexOf("Favourite");
        if (index !== -1) {
          ls.unshift(ls.splice(index, 1)[0]);
        }
        repoNameList.value = ls
      })
    }

    watch(props, () => {
      if (props.modelValue) { updateContent() }
    })

    onMounted(() => { updateContent() })

    function clickDb(dbn: string) {
      pushWindow({
        component: 'LocalFavorite',
        props: { dbName: dbn, initialQueryString: '-a', dbNameList: dbNameList },
        title: '本地收藏夹'
      }, true)
      emit('update:modelValue', false)
      options_store.dbName = dbn
    }

    const newDbName = ref<string>()
    const newDbInputError = ref<boolean>(false)

    function newDb(dbn: string | undefined) {
      if (dbn === undefined || dbn === '') {
        newDbInputError.value = true
        return
      }
      wm.ibd_new(dbn).then(() => {
        pushNoti({
          level: 'success',
          msg: '创建了新的插画数据库 ' + dbn
        })

        wm.ibd_list().then(ls => {
          let index = ls.indexOf("my_favourite");
          if (index !== -1) {
            ls.unshift(ls.splice(index, 1)[0]);
          }
          dbNameList.value = ls
        })

      })
      newdb_show.value = false
    }

    const showDelDbDiag = ref<boolean>(false)
    const dbNameToDel = ref<string>()

    function deleteDb() {
      if (dbNameToDel.value !== undefined) {
        wm.ibd_remove(dbNameToDel.value)
          .then(() => {
            pushNoti({
              level: 'info',
              msg: '删除了插画数据库 ' + dbNameToDel.value
            })
            dbNameToDel.value = undefined
            wm.ibd_list().then(ls => {
              let index = ls.indexOf("my_favourite");
              if (index !== -1) {
                ls.unshift(ls.splice(index, 1)[0]);
              }
              dbNameList.value = ls
            })
          })
      }
    }

    const showDelRpDiag = ref<boolean>(false)
    const repoNameToDel = ref<string>()

    function clickRepo(rpn: string) {
      pushWindow({
        component: 'RepoView',
        props: { repoName: rpn },
        title: rpn
      }, true)
      emit('update:modelValue', false)
    }

    function deleteRepo() {
      if (repoNameToDel.value !== undefined) {
        wm.ir_remove(repoNameToDel.value)
          .then(() => {
            pushNoti({
              level: 'info',
              msg: '删除了插画储存库 ' + repoNameToDel.value
            })
            repoNameToDel.value = undefined
            wm.ir_list().then(ls => {
              let index = ls.indexOf("Favourite");
              if (index !== -1) {
                ls.unshift(ls.splice(index, 1)[0]);
              }
              repoNameList.value = ls
            })
          })
      }
    }

    const newRepoName = ref<string>()
    const newRepoInputError = ref<boolean>(false)
    const newRepoPrefix = ref<string>()

    function newRepo() {
      if (newRepoName.value === undefined || newRepoName.value === ''
        || newRepoPrefix.value === undefined || newRepoPrefix.value === '') {
        newRepoInputError.value = true
        return
      } else {
        wm.ir_new(newRepoName.value, newRepoPrefix.value)
          .then(() => {
            pushNoti({
              level: 'success',
              msg: `创建了新的插画储存库 ${newRepoName.value} 在 ${newRepoPrefix.value}`
            })

            wm.ir_list().then(ls => {
              let index = ls.indexOf("Favourite");
              if (index !== -1) {
                ls.unshift(ls.splice(index, 1)[0]);
              }
              repoNameList.value = ls
            })
          })
      }
      newrepo_show.value = false
    }

    return {
      dbNameList, updateContent, clickDb, newDbName, newDb,
      showDelDbDiag, deleteDb, showDelRpDiag, repoNameToDel, clickRepo,
      deleteRepo, newRepoName, newRepoInputError, newRepoPrefix, newRepo,
      pushWindow, repoNameList, newDbInputError, dbNameToDel, options_store, newdb_show, newrepo_show
    }
  }
})


</script>
