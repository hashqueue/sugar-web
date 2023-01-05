// 引入vue中定义的指令对应的类型定义
import { userStore } from '@/stores/user'

export const permission = {
  // mounted是指令的一个生命周期
  mounted(el, binding, vnode, prevVnode) {
    const userSettingStore = userStore()
    // value 获取用户使用自定义指令绑定的内容
    const { value } = binding
    // console.log(value)
    // 获取用户所有的权限按钮
    const buttonPermissions = userSettingStore.getButtonPermissions
    // 判断用户使用自定义指令，是否使用正确了
    if (value && value !== '') {
      //判断自定义指令传递进来的按钮权限，用户是否拥有
      const hasPermission = buttonPermissions.includes(value)
      // console.log('permission', value, 'hasPermission', hasPermission)
      // 当用户没有这个按钮权限时，设置隐藏这个按钮
      if (!hasPermission) {
        el.style.display = 'none'
      }
    } else {
      throw new Error('need permissions! Like v-permission="\'新增部门\'"')
    }
  }
}
