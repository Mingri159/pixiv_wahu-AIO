import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        h_switch: false,
        ai_switch: false,
        // dl_type: 'medium',
        // dl_type_option: ['origin', 'large', 'medium', 'sqmedium'],
        // is_compress: false,
        // compress_scale: 0.75,
        // save_route: '',
        // auto_sync: false,
        user_id: 0, //用户id
        leftDrawerOpen: false,//左侧边栏
    }

    ),
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'Wahu-settings',
                storage: localStorage,
                // paths: ['name']
            },
        ],
    },
    getters: {

    },
    actions: {
    },
})
