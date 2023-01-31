<template>
  <a-breadcrumb separator="/">
    <a-breadcrumb-item v-for="(item, index) in breadcrumbData" :key="item.path">
      <!-- 不可点击项 -->
      <span v-if="index === breadcrumbData.length - 1" class="no-redirect">{{ item.meta.title }}</span>
      <!-- 可点击项 -->
      <a v-else class="redirect" @click.prevent="onLinkClick(item, route.params)">{{ item.meta.title }}</a>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup>
import { watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
// 生成数组数据
const breadcrumbData = ref([])
const getBreadcrumbData = () => {
  breadcrumbData.value = route.matched.filter((item) => item.meta && item.meta.title)
}
// 监听路由变化时触发
watch(
  () => route.path,
  () => {
    getBreadcrumbData()
  },
  {
    // 在侦听器创建时立即触发回调. 第一次调用时旧值是undefined
    immediate: true
  }
)
const onLinkClick = (item, params) => {
  // 替换路由path中的路径参数params
  let targetPath = item.path
  for (const paramsKey in params) {
    if (targetPath.includes(paramsKey)) {
      targetPath = targetPath.replace(`:${paramsKey}`, params[paramsKey])
    }
  }
  // console.log('item.path', item.path)
  // console.log('targetPath', targetPath)
  router.push(targetPath)
}
</script>

<style scoped>
.no-redirect {
  color: #97a8be;
}
.redirect {
  color: #666;
  font-weight: 600;
}
.redirect:hover {
  color: #1890ff;
}
</style>
