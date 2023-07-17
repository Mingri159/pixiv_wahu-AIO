import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('options', {
    state: () => ({
        dl_type_option: ['origin', 'large', 'medium', 'sqmedium'],
        // leftDrawerOpen: false,
        dbName: '',//本地收藏夹
        img_pre_state: true, //预览状态
        show_cancel: false,//只有pixivFavourite页面才显示【取消收藏】

    }
    ),

    getters: {

    },
    actions: {
    },
})
