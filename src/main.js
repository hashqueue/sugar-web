import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import * as AntdIcons from '@ant-design/icons-vue'
import { permission } from '@/permission'

import pinia from '@/stores'
import App from './App.vue'
import router from './router'

const app = createApp(App)
// 注册ant-design的所有图标
for (const [name, component] of Object.entries(AntdIcons)) {
  app.component(name, component)
}
// 按钮级别权限控制通过自定义指令v-permission实现，Usage：v-permission="'新增部门'"
app.directive('permission', permission)
app.use(pinia).use(router).use(Antd).mount('#app')
