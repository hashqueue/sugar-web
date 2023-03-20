<template>
  <a-row type="flex" justify="space-between">
    <a-col :span="20">
      <a-row>
        <a-row>
          <a-col><img class="logo-img" src="@/assets/sugar.svg" alt="logo" /></a-col>
          <a-col><h1 class="logo-title">Sugar</h1></a-col>
        </a-row>
        <a-col :span="18">
          <MenuLayout />
        </a-col>
      </a-row>
    </a-col>
    <a-col :span="4">
      <a-row type="flex" justify="end">
        <a-col>
          <a-tooltip>
            <template #title>API文档</template>
            <component class="github-logo" :is="'api-outlined'" @click="goToApiDocs" />
          </a-tooltip>
        </a-col>
        <a-col>
          <a-tooltip>
            <template #title>Github</template>
            <component class="github-logo" :is="'github-outlined'" @click="goToGithub" />
          </a-tooltip>
        </a-col>
        <a-col>
          <screenfull-view />
        </a-col>
        <a-col>
          <a-popover :title="`Hello ${userInfo.username}!`">
            <template #content>
              <p class="popover-option"><a @click="showUserInfo">个人中心</a></p>
              <p class="popover-option"><a @click="logOut">登出</a></p>
            </template>
            <a-avatar class="avatar" shape="square" :src="userInfo.avatar" :size="32"></a-avatar>
          </a-popover>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { removeAllItem } from '@/utils/storage'
import MenuLayout from './menu/MenuLayout.vue'
import ScreenfullView from '@/components/ScreenfullView.vue'
import { userStore } from '@/stores/user'
import { getUserProfile } from '@/apis/system/user'

const router = useRouter()
const userSettingStore = userStore()
const userInfo = ref({
  username: '',
  avatar: ''
})

getUserProfile().then((res) => {
  userInfo.value = { username: res.username, email: res.username, avatar: res.avatar }
  userSettingStore.setUserInfo({ username: res.username, email: res.email, avatar: res.avatar })
})
const logOut = () => {
  // 删除当前登录用户拥有的动态路由权限
  for (const menuPermission of userSettingStore.getMenuPermissions) {
    if (router.hasRoute(menuPermission.path)) {
      router.removeRoute(menuPermission.path)
    }
  }
  // 重置store的数据
  userSettingStore.$reset()
  removeAllItem()
  router.push('/login')
}
const showUserInfo = () => {
  router.push('/userProfile')
}
const goToApiDocs = () => {
  if (import.meta.env.MODE === 'development') {
    window.open(`http://127.0.0.1:8000/api/v1/swagger/`)
    window.open(`http://127.0.0.1:8000/api/v1/redoc/`)
  } else {
    window.open(`http://${location.host}/api/v1/swagger/`)
    window.open(`http://${location.host}/api/v1/redoc/`)
  }
}
const goToGithub = () => {
  window.open('https://github.com/hashqueue/sugar')
}
</script>

<style lang="less" scoped>
.popover-option {
  margin-bottom: 5px;
}
.avatar {
  margin-left: 15px;
  cursor: pointer;
}

.logo-img {
  width: 36px;
  height: 36px;
}

.logo-title {
  color: #fff;
  margin-left: 16px;
  margin-right: 16px;
  font-weight: 600;
  font-size: 16px;
}
.github-logo {
  color: #fff;
  font-size: 24px;
  margin-top: 20px;
  margin-right: 10px;
  cursor: pointer;
  transition: background 0.3s;
  :hover {
    color: #1890ff;
  }
}
</style>
