import { defineStore } from 'pinia'
import { setItem, getItem } from '@/utils/storage'

export const workItemStore = defineStore('workItemSetting', {
  state: () => ({
    needUpdateWorkItemSummary: false
  }),
  getters: {
    getNeedUpdateWorkItemSummary(state) {
      if (!state.needUpdateWorkItemSummary) {
        const newNeedUpdateWorkItemSummary = getItem('needUpdateWorkItemSummary')
        this.needUpdateWorkItemSummary = newNeedUpdateWorkItemSummary
        return newNeedUpdateWorkItemSummary
      }
      return state.needUpdateWorkItemSummary
    }
  },
  actions: {
    setNeedUpdateWorkItemSummary(needUpdateWorkItemSummary) {
      this.needUpdateWorkItemSummary = needUpdateWorkItemSummary
      setItem('needUpdateWorkItemSummary', needUpdateWorkItemSummary)
    }
  }
})
