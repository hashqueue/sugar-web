import { defineStore } from 'pinia'
import { setItem, getItem } from '@/utils/storage'

export const projectStore = defineStore('projectSetting', {
  state: () => ({
    needUpdateProjectInfo: false
  }),
  getters: {
    getNeedUpdateProjectInfo(state) {
      if (!state.needUpdateProjectInfo) {
        const newNeedUpdateProjectInfo = getItem('needUpdateProjectInfo')
        this.needUpdateProjectInfo = newNeedUpdateProjectInfo
        return newNeedUpdateProjectInfo
      }
      return state.needUpdateProjectInfo
    }
  },
  actions: {
    setNeedUpdateProjectInfo(needUpdateProjectInfo) {
      this.needUpdateProjectInfo = needUpdateProjectInfo
      setItem('needUpdateProjectInfo', needUpdateProjectInfo)
    }
  }
})
