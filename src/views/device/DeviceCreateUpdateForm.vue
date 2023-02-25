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
        <a-form-item name="host" label="域名或IP">
          <a-input v-model:value="createUpdateForm.host" placeholder="请输入域名或IP" />
        </a-form-item>
        <a-form-item name="username" label="用户名">
          <a-input v-model:value="createUpdateForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item name="password" label="密码">
          <a-input-password v-model:value="createUpdateForm.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item name="device_type" label="设备类型">
          <a-select
            v-model:value="createUpdateForm.device_type"
            placeholder="请选择设备类型"
            :options="deviceTypeOptions"
          ></a-select>
        </a-form-item>
        <a-form-item label="设备状态" v-if="title === '修改设备'">
          <a-input :value="deviceStatus" disabled />
        </a-form-item>
        <a-form-item name="port" label="端口">
          <a-input-number v-model:value="createUpdateForm.port" :min="1" />
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createDevice, updateDevice, getDeviceDetail } from '@/apis/device/device'
import StandardModal from '@/components/StandardModal.vue'

const props = defineProps({
  deviceId: {
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
const emit = defineEmits(['closeModal', 'getLatestDataList'])
const deviceStatus = ref('')
const deviceTypeOptions = [
  { value: 0, label: '阿里云ECS' },
  { value: 1, label: '腾讯云ECS' },
  { value: 2, label: 'Raspberry Pi(树莓派)' }
]
const deviceStatusOptions = { 0: '离线', 1: '在线' }
const createUpdateForm = ref({
  username: '',
  password: '',
  host: '',
  port: null,
  device_type: 0
})
const createUpdateFormRef = ref()
const labelCol = { span: 4 }
const wrapperCol = { span: 20 }
const createUpdateRules = {
  username: [
    { required: true, trigger: 'change', message: '设备名不能为空!' },
    { max: 64, trigger: 'change', message: '设备名不能多于64位!' }
  ],
  password: [
    { required: true, trigger: 'change', message: '设备名不能为空!' },
    { max: 64, trigger: 'change', message: '设备名不能多于64位!' }
  ],
  host: [
    { required: true, trigger: 'change', message: '设备名不能为空!' },
    { max: 64, trigger: 'change', message: '设备名不能多于64位!' }
  ],
  port: [{ required: true, trigger: 'change', message: '设备端口号不能为空!' }]
}

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title === '修改设备') {
      getDeviceDetail(props.deviceId).then((res) => {
        deviceStatus.value = deviceStatusOptions[res.device_status]
        createUpdateForm.value = {
          username: res.username,
          password: res.password,
          host: res.host,
          port: res.port,
          device_type: res.device_type
        }
      })
    }
  }
)
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改设备') {
        updateDevice(props.deviceId, values).then(() => {
          // 重新获取一遍设备信息
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createDevice(values).then(() => {
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
