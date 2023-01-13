<template>
  <a-layout class="root-container">
    <a-layout-header class="header-container">
      <HeaderLayout />
      <BreadcrumbLayout />
    </a-layout-header>
    <a-layout-content class="main-container">
      <ContentLayout />
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import HeaderLayout from './components/HeaderLayout.vue'
import ContentLayout from './components/ContentLayout.vue'
import BreadcrumbLayout from './components/BreadcrumbLayout.vue'
</script>

<style scoped>
.root-container {
  height: 100vh;
}
.ant-layout-header {
  padding: 0 16px;
}
.header-container {
  position: fixed;
  zindex: 1;
  width: 100%;
}
.main-container {
  padding: 0 16px;
  margin-top: 100px;
  overflow-y: auto;
}
</style>
