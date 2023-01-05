<template>
  <a-modal
    :visible="visible"
    :width="800"
    :title="title"
    ok-text="提交"
    cancel-text="取消"
    @ok="onOk"
    @cancel="onCancel"
  >
    <a-alert
      message="新增用户后默认密码为88888888，用户可自行去个人中心重置密码。"
      type="success"
      style="margin-bottom: 30px"
      v-if="title === '新增用户'"
    />
    <a-form
      ref="createUpdateFormRef"
      :model="createUpdateForm"
      :rules="createUpdateRules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item name="username" label="用户名">
        <a-input v-model:value="createUpdateForm.username" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item name="email" label="邮箱">
        <a-input v-model:value="createUpdateForm.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item name="name" label="姓名">
        <a-input v-model:value="createUpdateForm.name" placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item name="position" label="职位">
        <a-input v-model:value="createUpdateForm.position" placeholder="请输入职位" />
      </a-form-item>
      <a-form-item name="roles" label="角色">
        <a-select
          v-model:value="createUpdateForm.roles"
          mode="multiple"
          style="width: 100%"
          placeholder="请选择角色"
          :options="roleOptions"
        ></a-select>
      </a-form-item>
      <a-form-item name="department" label="部门">
        <a-tree-select
          v-model:value="createUpdateForm.department"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择部门"
          allow-clear
          tree-default-expand-all
          :tree-data="departmentTreeData"
        >
        </a-tree-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createUser, updateUser, getUserDetail } from '@/apis/user'
import { getRoleList } from '@/apis/role'
import { generateObjectTreeData } from '@/utils/common'
import { getOrganizationTreeList } from '@/apis/organization'

const props = defineProps({
  userId: {
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
const emit = defineEmits(['closeModal', 'getLatestUserList'])
const roleOptions = ref([])
const departmentTreeData = ref([])
getRoleList().then((res) => {
  const tmpRoleArr = []
  for (const item of res.results) {
    tmpRoleArr.push({ value: item.id, label: item.name })
  }
  roleOptions.value = tmpRoleArr
})
getOrganizationTreeList().then((res) => {
  departmentTreeData.value = generateObjectTreeData(res.results, 'organization')
})
const createUpdateForm = ref({
  username: '',
  email: '',
  name: '',
  position: '',
  department: undefined,
  roles: []
})
const createUpdateFormRef = ref()
const labelCol = { span: 3 }
const wrapperCol = { span: 20 }
const createUpdateRules = {
  username: [
    { required: true, trigger: 'change', message: '用户名不能为空!' },
    { max: 150, trigger: 'change', message: '用户名不能多于150位!' }
  ],
  email: [
    { required: true, trigger: 'change', message: '邮箱不能为空!' },
    { max: 254, trigger: 'change', message: '邮箱不能多于254位!' }
  ],
  name: [
    { required: true, trigger: 'change', message: '姓名不能为空!' },
    { max: 20, trigger: 'change', message: '姓名不能多于20位!' }
  ],
  position: [{ max: 64, trigger: 'change', message: '职位不能多于64位!' }]
}

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title === '修改用户') {
      getUserDetail(props.userId).then((res) => {
        const tmpRoleList = []
        for (const role of res.roles) {
          tmpRoleList.push(role.id)
        }
        createUpdateForm.value = {
          username: res.username,
          email: res.email,
          name: res.name,
          position: res.position,
          department: res.department !== null ? res.department.id : res.department,
          roles: tmpRoleList
        }
      })
    }
  }
)

const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改用户') {
        updateUser(props.userId, values).then(() => {
          // 重新获取一遍用户信息
          emit('getLatestUserList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createUser(values).then(() => {
          emit('getLatestUserList')
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
