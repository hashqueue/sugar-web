<template>
  <div>
    <component
      class="fullscreen"
      :is="isFullscreen ? 'fullscreen-exit-outlined' : 'fullscreen-outlined'"
      @click="onToggle"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import screenfull from 'screenfull'

// 是否全屏
const isFullscreen = ref(false)

// 监听变化
const change = () => {
  isFullscreen.value = screenfull.isFullscreen
}

// 切换事件
const onToggle = () => {
  screenfull.toggle()
}

// 设置侦听器
onMounted(() => {
  screenfull.on('change', change)
})

// 删除侦听器
onUnmounted(() => {
  screenfull.off('change', change)
})
</script>

<style lang="less" scoped>
.fullscreen {
  color: #fff;
  font-size: 24px;
  margin-top: 20px;
  cursor: pointer;
  transition: background 0.3s;
  :hover {
    color: #1890ff;
  }
}
</style>
