<template>
  <a-card class="work-item">
    <a-tabs v-model:activeKey="tabsActiveKey" centered>
      <a-tab-pane key="1" tab="需求">需求</a-tab-pane>
      <a-tab-pane key="2" tab="任务">任务</a-tab-pane>
      <a-tab-pane key="3" tab="缺陷">缺陷</a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'

const tabsActiveKey = ref('1')
</script>

<style scoped>
/*.work-item {*/
/*  margin-top: 8px;*/
/*}*/
</style>
