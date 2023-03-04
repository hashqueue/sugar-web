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
        <a-form-item name="intervals" label="采集次数(次)">
          <a-input-number
            v-model:value="createUpdateForm.intervals"
            addon-before="一共采集"
            addon-after="次"
            :min="5"
          />
        </a-form-item>
        <a-form-item name="count" label="间隔时间(秒)">
          <a-input-number
            v-model:value="createUpdateForm.count"
            :min="5"
            addon-before="每隔"
            addon-after="秒采集一次"
          />
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { ref } from 'vue'
import { collectDevicePerfData } from '@/apis/device/device'
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
const emit = defineEmits(['closeModal'])
const createUpdateForm = ref({
  intervals: null,
  count: null
})
const createUpdateFormRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 24 }
const createUpdateRules = {
  intervals: [{ required: true, trigger: 'change', message: '采集次数不能为空!' }],
  count: [{ required: true, trigger: 'change', message: '间隔时间不能为空!' }]
}
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      collectDevicePerfData(props.deviceId, values).then(() => {
        createUpdateFormRef.value.resetFields()
        emit('closeModal')
      })
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
