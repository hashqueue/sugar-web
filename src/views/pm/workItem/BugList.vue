<template>
  <work-item-list :sprint-id="Number(sprintId)" :work-item-type="2" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import WorkItemList from '@/views/pm/workItem/WorkItemList.vue'

const route = useRoute()
const sprintId = route.params.sprintId
</script>

<style scoped></style>
