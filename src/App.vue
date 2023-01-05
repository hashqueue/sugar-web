<template>
  <a-config-provider :locale="locale">
    <RouterView />
  </a-config-provider>
</template>
<script setup>
import { RouterView } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
// 全局国际化语言配置为zh-cn
import locale from 'ant-design-vue/es/locale/zh_CN'
dayjs.locale('zh-cn')
</script>
<style scoped></style>
