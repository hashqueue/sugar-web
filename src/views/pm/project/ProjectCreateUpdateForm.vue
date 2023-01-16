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
        <a-form-item name="name" label="项目名">
          <a-input v-model:value="createUpdateForm.name" placeholder="请输入项目名" />
        </a-form-item>
        <a-form-item name="owner" label="项目负责人">
          <a-select
            v-model:value="createUpdateForm.owner"
            placeholder="请选择项目负责人"
            :show-arrow="true"
            :filter-option="false"
            :options="ownerOptions"
            @change="handleOwnerChange"
          ></a-select>
        </a-form-item>
        <a-form-item name="status" label="项目状态">
          <a-select
            v-model:value="createUpdateForm.status"
            placeholder="请选择项目状态"
            :options="statusOptions"
          ></a-select>
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createProject, updateProject, getProjectDetail } from '@/apis/pm/project'
import StandardModal from '@/components/StandardModal.vue'

const props = defineProps({
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
  status: 0
})
const createUpdateFormRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 20 }
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '项目名不能为空!' },
    { max: 64, trigger: 'change', message: '项目名不能多于64位!' }
  ],
  owner: [{ required: true, trigger: 'change', message: '项目负责人不能为空!' }]
}

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title === '修改项目') {
      getProjectDetail(props.projectId).then((res) => {
        createUpdateForm.value = {
          name: res.name,
          status: res.status,
          owner: res.owner
        }
      })
    }
  }
)

const handleOwnerChange = (val) => {
  // console.log(val)
  createUpdateForm.value.owner = val
}

const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改项目') {
        updateProject(props.projectId, values).then(() => {
          // 重新获取一遍项目信息
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createProject(values).then(() => {
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
