<template>
  <!--  <a-card>-->
  <!--    <a-descriptions v-if="sprintInfo" :title="sprintInfo.name">-->
  <!--      <a-descriptions-item label="ID">{{ sprintInfo.id }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="负责人">{{ sprintInfo.owner }} - {{ sprintInfo.owner_name }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="状态">-->
  <!--        <a-tag color="green">-->
  <!--          {{ status[sprintInfo.status] }}-->
  <!--        </a-tag>-->
  <!--      </a-descriptions-item>-->
  <!--      <a-descriptions-item label="需求数量">{{ sprintInfo.feature_count }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="任务数量">{{ sprintInfo.task_count }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="缺陷数量">{{ sprintInfo.bug_count }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="开始时间">{{ sprintInfo.start_time }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="预计完成时间">{{ sprintInfo.finish_time }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="创建人">{{ sprintInfo.creator }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="最后修改人">{{ sprintInfo.modifier }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="创建时间">{{ sprintInfo.create_time }}</a-descriptions-item>-->
  <!--      <a-descriptions-item label="修改时间">{{ sprintInfo.update_time }}</a-descriptions-item>-->
  <!--    </a-descriptions>-->
  <!--  </a-card>-->
  <a-row type="flex" justify="space-between">
    <a-col :span="4">
      <a-card :title="sprintName" class="sprint-desc">
        <div class="card-content" v-for="(item, index) in sprintInfoData" :key="index">
          <a-tag color="geekblue">{{ item.title }}:</a-tag>{{ item.value }}
        </div>
      </a-card>
    </a-col>
    <a-col :span="20">
      <work-item-list />
    </a-col>
  </a-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSprintDetail } from '@/apis/pm/sprint'
import WorkItemList from '@/views/pm/workItem/WorkItemList.vue'

const route = useRoute()
const sprintId = route.params.sprintId
const sprintName = ref('')

// const sprintInfo = ref(undefined)
const sprintInfoData = ref([])
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }

getSprintDetail(sprintId).then((res) => {
  // sprintInfo.value = res
  sprintName.value = res.name
  sprintInfoData.value = [
    { title: '所属项目', value: res.project_name },
    { title: 'ID', value: res.id },
    { title: '负责人', value: `${res.owner} - ${res.owner_name}` },
    { title: '状态', value: status[res.status] },
    { title: '需求数量', value: res.feature_count },
    { title: '任务数量', value: res.task_count },
    { title: '缺陷数量', value: res.bug_count },
    { title: '开始时间', value: res.start_time },
    { title: '预计完成时间', value: res.finish_time },
    { title: '创建人', value: res.creator },
    { title: '最后修改人', value: res.modifier },
    { title: '创建时间', value: res.create_time },
    { title: '修改时间', value: res.update_time }
  ]
})
</script>

<style scoped>
.sprint-desc {
  height: 100vh;
}
.card-content {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
</style>
