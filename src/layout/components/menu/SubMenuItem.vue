<template>
  <a-sub-menu :key="menuInfo.path">
    <template #icon>
      <component :is="menuInfo.meta.icon" />
    </template>
    <template #title>{{ menuInfo.meta.title }}</template>
    <template v-for="item in menuInfo.children" :key="item.path">
      <template v-if="item.children.length === 0">
        <a-menu-item :key="item.path">
          <template #icon>
            <component :is="item.meta.icon" />
          </template>
          {{ item.meta.title }}
        </a-menu-item>
      </template>
      <template v-else>
        <!-- 循环渲染 -->
        <sub-menu-item :menu-info="item" :key="item.path" />
      </template>
    </template>
  </a-sub-menu>
</template>

<script setup>
const props = defineProps({
  menuInfo: {
    type: Object,
    required: true
  }
})
</script>

<style scoped></style>
