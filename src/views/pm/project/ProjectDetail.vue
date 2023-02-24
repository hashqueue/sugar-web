<template>
  <a-card>
    <a-descriptions v-if="projectInfo" :title="projectInfo.name" size="default">
      <a-descriptions-item label="ID">{{ projectInfo.id }}</a-descriptions-item>
      <a-descriptions-item label="负责人">{{ projectInfo.owner }} - {{ projectInfo.owner_name }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag color="green">
          {{ status[projectInfo.project_status] }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="迭代数量">{{ projectInfo.sprint_count }}</a-descriptions-item>
      <a-descriptions-item label="成员数量">{{ projectInfo.members.length }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ projectInfo.creator }}</a-descriptions-item>
      <a-descriptions-item label="最后修改人">{{ projectInfo.modifier }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ projectInfo.create_time }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ projectInfo.update_time }}</a-descriptions-item>
    </a-descriptions>
  </a-card>
  <sprint-list :project-id="Number(projectId)" :project-info="projectInfo" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail } from '@/apis/pm/project'
import SprintList from '@/views/pm/sprint/SprintList.vue'
import { projectStore } from '@/stores/project'

const route = useRoute()
const projectId = route.params.projectId
const projectInfo = ref(undefined)
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }
const projectSettingStore = projectStore()

const getProjectInfo = () => {
  getProjectDetail(projectId).then((res) => {
    projectInfo.value = res
  })
}
getProjectInfo()
watch(
  () => projectSettingStore.getNeedUpdateProjectInfo,
  (newNeedUpdateProjectInfo) => {
    if (newNeedUpdateProjectInfo) {
      getProjectInfo()
      // 更新完毕再设置为false
      projectSettingStore.setNeedUpdateProjectInfo(false)
    }
  }
)
</script>

<style scoped></style>
