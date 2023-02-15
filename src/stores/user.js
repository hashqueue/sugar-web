import { defineStore } from 'pinia'
import { setItem, getItem } from '@/utils/storage'

export const userStore = defineStore('userSetting', {
  state: () => ({
    token: null,
    userInfo: null,
    menuPermissions: null,
    buttonPermissions: null,
    userRoutes: null
  }),
  getters: {
    getToken(state) {
      if (!state.token) {
        const newToken = getItem('token')
        this.token = newToken
        return newToken
      }
      return state.token
    },
    getUserInfo(state) {
      if (!state.userInfo) {
        const newUserInfo = getItem('userInfo')
        this.userInfo = newUserInfo
        return newUserInfo
      }
      return state.userInfo
    },
    getMenuPermissions(state) {
      if (!state.menuPermissions) {
        const newMenuPermissions = getItem('menuPermissions')
        this.menuPermissions = newMenuPermissions
        return newMenuPermissions
      }
      return state.menuPermissions
    },
    getButtonPermissions(state) {
      if (!state.buttonPermissions) {
        const newButtonPermissions = getItem('buttonPermissions')
        this.buttonPermissions = newButtonPermissions
        return newButtonPermissions
      }
      return state.buttonPermissions
    },
    getUserRoutes(state) {
      if (!state.userRoutes) {
        const newUserRoutes = getItem('userRoutes')
        this.userRoutes = newUserRoutes
        return newUserRoutes
      }
      return state.userRoutes
    }
  },
  actions: {
    setToken(token) {
      this.token = token
      setItem('token', token)
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      setItem('userInfo', userInfo)
    },
    setMenuPermissions(pMenuPermissions) {
      this.menuPermissions = pMenuPermissions
      setItem('menuPermissions', pMenuPermissions)
    },
    setButtonPermissions(pButtonPermissions) {
      this.buttonPermissions = pButtonPermissions
      setItem('buttonPermissions', pButtonPermissions)
    },
    setUserRoutes(pUserRoutes) {
      this.userRoutes = pUserRoutes
      setItem('userRoutes', pUserRoutes)
    }
  }
})
