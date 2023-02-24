<template>
  <standard-modal
    :modal-visible="visible"
    :modal-width="600"
    :modal-title="title"
    :modal-ok-text="'提交'"
    :modal-cancel-text="'取消'"
    @on-modal-ok="onOk"
    @on-modal-cancel="onCancel"
  >
    <template #form>
      <a-form
        ref="createUpdateFormRef"
        :model="createUpdateForm"
        :rules="createUpdateRules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item name="name" label="迭代名">
          <a-input v-model:value="createUpdateForm.name" placeholder="请输入迭代名" />
        </a-form-item>
        <a-form-item label="所属项目">
          <a-input :value="projectName" disabled />
        </a-form-item>
        <a-form-item name="owner" label="迭代负责人">
          <a-select
            v-model:value="createUpdateForm.owner"
            placeholder="请选择迭代负责人"
            :show-arrow="true"
            :filter-option="false"
            :options="ownerOptions"
          ></a-select>
        </a-form-item>
        <a-form-item name="sprint_status" label="迭代状态">
          <a-select
            v-model:value="createUpdateForm.sprint_status"
            placeholder="请选择迭代状态"
            :options="statusOptions"
          ></a-select>
        </a-form-item>
        <a-form-item name="start_time" label="迭代周期">
          <a-range-picker
            v-model:value="createUpdateForm.start_time"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="['开始时间', '完成时间']"
          />
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { createSprint, updateSprint, getSprintDetail } from '@/apis/pm/sprint'
import StandardModal from '@/components/StandardModal.vue'
import { projectStore } from '@/stores/project'

const props = defineProps({
  projectName: {
    type: String,
    required: true
  },
  sprintId: {
    type: [Number, null],
    required: false
  },
  projectId: {
    type: [Number, null],
    required: false
  },
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  allUserList: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['closeModal', 'getLatestDataList'])
const projectSettingStore = projectStore()
const statusOptions = [
  { value: 0, label: '未开始' },
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' }
]
const ownerOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.username, label: `${item.username} - ${item.name}` })
  }
  return tmpOwnerArr
})
const createUpdateForm = ref({
  name: '',
  owner: undefined,
  start_time: [],
  finish_time: '',
  sprint_status: 0,
  project: props.projectId
})
const createUpdateFormRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 20 }
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '迭代名不能为空!' },
    { max: 64, trigger: 'change', message: '迭代名不能多于64位!' }
  ],
  owner: [{ required: true, trigger: 'change', message: '迭代负责人不能为空!' }]
}

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title === '修改迭代') {
      getSprintDetail(props.sprintId).then((res) => {
        if (res.start_time && res.finish_time) {
          createUpdateForm.value = {
            name: res.name,
            owner: res.owner,
            sprint_status: res.sprint_status,
            project: res.project,
            start_time: [dayjs(res.start_time), dayjs(res.finish_time)],
            finish_time: ''
          }
        } else {
          createUpdateForm.value = {
            name: res.name,
            owner: res.owner,
            sprint_status: res.sprint_status,
            project: res.project,
            start_time: [],
            finish_time: ''
          }
        }
      })
    }
  }
)
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      // 添加projectId
      values.project = props.projectId
      // 设置迭代周期的起止时间
      const dateTimes = values.start_time
      if (values.start_time && values.start_time.length) {
        values.start_time = dateTimes[0].format('YYYY-MM-DD HH:mm')
        values.finish_time = dateTimes[1].format('YYYY-MM-DD HH:mm')
      } else {
        delete values.start_time
      }
      if (props.title === '修改迭代') {
        updateSprint(props.sprintId, values).then(() => {
          // 重新获取一遍迭代信息
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createSprint(values).then(() => {
          // 通知ProjectDetail组件更新数据
          projectSettingStore.setNeedUpdateProjectInfo(true)
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      }
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onCancel = () => {
  createUpdateFormRef.value.resetFields()
  emit('closeModal')
}
</script>

<style scoped></style>
