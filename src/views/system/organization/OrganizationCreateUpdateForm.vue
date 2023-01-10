<template>
  <a-modal
    :visible="visible"
    :width="600"
    :title="title"
    ok-text="提交"
    cancel-text="取消"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-form
      ref="createUpdateFormRef"
      :model="createUpdateForm"
      :rules="createUpdateRules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="createUpdateForm.name" placeholder="请输入组织架构名称" />
      </a-form-item>
      <a-form-item name="type" label="类型">
        <a-select v-model:value="createUpdateForm.type" placeholder="请选择组织架构类型" :options="typeOptions">
        </a-select>
      </a-form-item>
      <a-form-item name="parent" label="父组织架构" v-if="title !== '新增根组织架构'">
        <a-select
          v-model:value="createUpdateForm.parent"
          show-search
          placeholder="输入组织架构名称以进行(模糊)搜索"
          :default-active-first-option="false"
          :show-arrow="true"
          :filter-option="false"
          :options="parentOptions"
          @search="handleSearch"
          @change="handleChange"
        ></a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  getOrganizationList,
  createOrganization,
  updateOrganization,
  getOrganizationDetail
} from '@/apis/system/organization'
import { isSelectOptionsIncludeItemData } from '@/utils/common'

const props = defineProps({
  organizationId: {
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
  }
})
const emit = defineEmits(['closeModal', 'getLatestOrganizationList'])
const createUpdateForm = ref({
  name: '',
  type: undefined,
  parent: undefined
})
const createUpdateFormRef = ref()
const labelCol = { span: 4 }
const wrapperCol = { span: 20 }
const typeOptions = ref([
  {
    value: 'company',
    label: '公司'
  },
  {
    value: 'department',
    label: '部门'
  }
])
const parentOptions = ref([])
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '组织架构名称不能为空!' },
    { max: 128, trigger: 'change', message: '组织架构名称不能多于128位!' }
  ],
  type: [{ required: true, trigger: 'change', message: '组织架构类型不能为空!' }]
}

getOrganizationList({ page: 1, size: 50 }).then((res) => {
  let currentOrgans = []
  for (const originOrgan of res.results) {
    currentOrgans.push({ label: originOrgan.name, value: originOrgan.id })
  }
  parentOptions.value = currentOrgans
})

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title !== '新增根组织架构') {
      getOrganizationDetail(props.organizationId).then((res) => {
        if (props.title === '添加子组织架构') {
          if (!isSelectOptionsIncludeItemData(parentOptions.value, res.id, 'value')) {
            parentOptions.value.push({ label: res.name, value: res.id })
          }
          createUpdateForm.value = {
            name: '',
            type: undefined,
            parent: res.id
          }
        } else if (props.title === '修改组织架构') {
          if (res.parent !== null) {
            if (!isSelectOptionsIncludeItemData(parentOptions.value, res.parent.id, 'value')) {
              parentOptions.value.push({ label: res.parent.name, value: res.parent.id })
            }
            createUpdateForm.value = {
              name: res.name,
              type: res.type,
              parent: res.parent.id
            }
          } else {
            createUpdateForm.value = {
              name: res.name,
              type: res.type,
              parent: undefined
            }
          }
        }
      })
    }
  }
)
const handleSearch = (val) => {
  getOrganizationList({ name: val }).then((res) => {
    let currentOrgans = []
    for (const originOrgan of res.results) {
      currentOrgans.push({ label: originOrgan.name, value: originOrgan.id })
    }
    parentOptions.value = currentOrgans
  })
}

const handleChange = (val) => {
  // console.log(val)
  createUpdateForm.value.parent = val
}
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改组织架构') {
        updateOrganization(props.organizationId, values).then(() => {
          // 重新获取一遍组织架构信息
          emit('getLatestOrganizationList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createOrganization(values).then(() => {
          emit('getLatestOrganizationList')
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
