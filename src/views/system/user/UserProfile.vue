<template>
  <a-card :style="{ width: '50%' }">
    <template #actions>
      <a-tooltip>
        <template #title>修改个人信息</template>
        <edit-outlined @click="editProfile" />
      </a-tooltip>
      <a-tooltip>
        <template #title>重置密码</template>
        <unlock-outlined @click="resetPassword" />
      </a-tooltip>
    </template>
    <a-card-meta title="个人资料" description="心之所向，素履以往~">
      <template #avatar v-if="userInfo !== null">
        <a-avatar :size="96" shape="square" :src="userInfo.avatar" />
      </template>
    </a-card-meta>
    <a-descriptions class="content" v-if="userInfo !== null">
      <a-descriptions-item label="用户名">{{ userInfo.username }}</a-descriptions-item>
      <a-descriptions-item label="邮箱">{{ userInfo.email }}</a-descriptions-item>
      <a-descriptions-item label="姓名">{{ userInfo.name }}</a-descriptions-item>
      <a-descriptions-item label="生日">{{ userInfo.birthday }}</a-descriptions-item>
      <a-descriptions-item label="性别">{{ userInfo.gender === 'male' ? '男' : '女' }}</a-descriptions-item>
      <a-descriptions-item label="手机号">{{ userInfo.mobile }}</a-descriptions-item>
      <a-descriptions-item label="职位">{{ userInfo.position }}</a-descriptions-item>
      <!-- TODO: 待后端功能完全实现后此处的v-if可以移除 -->
      <a-descriptions-item label="部门" v-if="userInfo.department">{{ userInfo.department.name }}</a-descriptions-item>
      <a-descriptions-item label="加入时间">{{ userInfo.date_joined }}</a-descriptions-item>
      <a-descriptions-item label="角色">
        <template v-for="(role, index) in userInfo.roles" :key="index">
          <a-tag color="blue">{{ role.name }}</a-tag>
        </template>
      </a-descriptions-item>
    </a-descriptions>
  </a-card>
  <a-modal
    v-model:visible="resetVisible"
    title="重置密码"
    ok-text="提交"
    cancel-text="取消"
    @ok="onResetOk"
    @cancel="onResetCancel"
  >
    <a-form
      ref="resetFormRef"
      :model="resetPasswordForm"
      :rules="resetRules"
      :label-col="passwordLabelCol"
      :wrapper-col="passwordWrapperCol"
    >
      <a-form-item name="password" label="新密码">
        <a-input-password v-model:value="resetPasswordForm.password" placeholder="请输入新密码" />
      </a-form-item>
      <a-form-item name="password_confirm" label="确认密码">
        <a-input-password
          class="new-password"
          v-model:value="resetPasswordForm.password_confirm"
          placeholder="请再次输入新密码"
        />
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal
    v-model:visible="updateVisible"
    title="修改个人信息"
    ok-text="提交"
    cancel-text="取消"
    @ok="onUpdateOk"
    @cancel="onUpdateCancel"
  >
    <a-form
      ref="updateFormRef"
      :model="updateProfileForm"
      :rules="updateRules"
      :label-col="profileLabelCol"
      :wrapper-col="profileWrapperCol"
    >
      <a-form-item name="username" label="用户名">
        <a-input v-model:value="updateProfileForm.username" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item name="name" label="姓名">
        <a-input v-model:value="updateProfileForm.name" placeholder="请输入姓名" />
      </a-form-item>
      <a-form-item name="email" label="邮箱">
        <a-input v-model:value="updateProfileForm.email" type="email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item name="gender" label="性别">
        <a-radio-group v-model:value="updateProfileForm.gender">
          <a-radio value="male">男</a-radio>
          <a-radio value="female">女</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item name="mobile" label="手机号">
        <a-input v-model:value="updateProfileForm.mobile" placeholder="请输入手机号" />
      </a-form-item>
      <a-form-item name="position" label="职位">
        <a-input v-model:value="updateProfileForm.position" placeholder="请输入职位" />
      </a-form-item>
      <a-form-item name="birthday" label="生日">
        <a-date-picker
          v-model:value="updateProfileForm.birthday"
          :value-format="'YYYY-MM-DD'"
          placeholder="请选择生日"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, UnlockOutlined } from '@ant-design/icons-vue'
import { getUserProfile, resetUserPassword, updateUserProfile } from '@/apis/user'
import { removeAllItem } from '@/utils/storage'

const userInfo = ref(null)
const updateProfileForm = ref(null)
const getUserInfo = () => {
  getUserProfile().then((res) => {
    userInfo.value = res
    updateProfileForm.value = {
      username: userInfo.value.username,
      name: userInfo.value.name,
      email: userInfo.value.email,
      gender: userInfo.value.gender,
      mobile: userInfo.value.mobile,
      birthday: userInfo.value.birthday,
      position: userInfo.value.position
    }
  })
}
getUserInfo()
const router = useRouter()
const resetFormRef = ref()
const updateFormRef = ref()
const resetVisible = ref(false)
const updateVisible = ref(false)
const passwordLabelCol = { span: 5 }
const passwordWrapperCol = { span: 15 }
const profileLabelCol = { span: 4 }
const profileWrapperCol = { span: 16 }
const resetPasswordForm = reactive({
  password: '',
  password_confirm: ''
})
const resetRules = {
  password: [
    { required: true, trigger: 'change', message: '密码不能为空!' },
    { min: 8, trigger: 'change', message: '密码不能少于8位!' },
    { max: 128, trigger: 'change', message: '密码不能多于128位!' }
  ],
  password_confirm: [
    { required: true, trigger: 'change', message: '确认密码不能为空!' },
    { min: 8, trigger: 'change', message: '密码不能少于8位!' },
    { max: 128, trigger: 'change', message: '密码不能多于128位!' }
  ]
}
const updateRules = {
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
  mobile: [
    { min: 11, trigger: 'change', message: '手机号码不能少于11位!' },
    { max: 11, trigger: 'change', message: '手机号码不能多于11位!' }
  ],
  position: [{ max: 64, trigger: 'change', message: '职位不能多于64位!' }]
}

const editProfile = () => {
  updateVisible.value = true
}
const resetPassword = () => {
  resetVisible.value = true
}
const onResetOk = () => {
  resetFormRef.value
    .validateFields()
    .then((values) => {
      resetUserPassword(values).then(() => {
        message.success('您已成功修改密码, 请重新登录!')
        resetVisible.value = false
        resetFormRef.value.resetFields()
        // 导航到登录页面，并清除token
        removeAllItem()
        router.push('/login')
      })
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onResetCancel = () => {
  resetFormRef.value.resetFields()
}
const onUpdateOk = () => {
  updateFormRef.value
    .validateFields()
    .then((values) => {
      updateUserProfile(values).then(() => {
        // 重新获取一遍用户信息
        getUserInfo()
        updateVisible.value = false
        updateFormRef.value.resetFields()
      })
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onUpdateCancel = () => {
  updateFormRef.value.resetFields()
}
</script>

<style scoped>
.content {
  margin-top: 8px;
}
</style>
