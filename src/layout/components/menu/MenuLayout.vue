<template>
  <!-- 一级menu菜单 -->
  <a-menu class="menu-container" theme="dark" mode="horizontal" @click="clickMenuItem" :selectedKeys="selectedKeys">
    <template v-for="item in routes" :key="item.path">
      <template v-if="item.children.length === 0">
        <a-menu-item :key="item.path">
          <template #icon>
            <!-- main.js中全局注册图标后可以这么使用 -->
            <component :is="item.meta.icon" />
          </template>
          {{ item.meta.title }}
        </a-menu-item>
      </template>
      <template v-else>
        <sub-menu-item :key="item.path" :menu-info="item" />
      </template>
    </template>
  </a-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { filterRouters, generateMenus } from '@/utils/route'
import SubMenuItem from './SubMenuItem.vue'
import { generateRouteTreeData } from '@/utils/common'
import { userStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userSettingStore = userStore()
const selectedKeys = computed(() => [route.path])
const routes = computed(() => {
  if (!userSettingStore.getUserRoutes) {
    return []
  }
  const res = generateRouteTreeData(userSettingStore.getUserRoutes)
  const filterRoutes = filterRouters(res)
  return generateMenus(filterRoutes)
})

const clickMenuItem = ({ item, key, keyPath }) => {
  // console.log(item)
  // console.log(key)
  // console.log(keyPath)
  router.push(key)
}
</script>

<style scoped>
.menu-container {
  line-height: 64px;
}
</style>
