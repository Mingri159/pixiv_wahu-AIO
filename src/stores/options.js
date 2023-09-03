import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', {
  state: () => ({
    dl_type_option: ['origin', 'large', 'medium', 'sqmedium'],
    leftDrawerOpen: false,//左侧边栏
    dbName: '',//本地收藏夹
    img_pre_state: true, //预览状态
    show_cancel: false,//只有pixivFavourite页面才显示【取消收藏】
    showUpdateSubs: false,//更新订阅信息窗口
    updateSubsLoading: false,
    updateSubSInfo: '更新订阅..\n',
    // infoScroller: null,



  }
  ),

  getters: {

  },
  actions: {
  },
})
