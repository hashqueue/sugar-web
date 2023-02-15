<template>
  <standard-modal
    :modal-visible="visible"
    :modal-width="'80%'"
    :modal-title="title"
    :modal-ok-text="'提交'"
    :modal-cancel-text="'取消'"
    :modal-mask-closable="false"
    @on-modal-ok="onOk"
    @on-modal-cancel="onCancel"
  >
    <template #form>
      <div style="width: 100%; height: 1px; background-color: #586069"></div>
      <a-row :gutter="24">
        <a-col :span="18">
          <a-tabs v-model:activeKey="contentActiveKey">
            <a-tab-pane key="1" tab="详情">
              <a-divider orientation="left">基础信息</a-divider>
              <a-descriptions v-if="workItemInfo">
                <a-descriptions-item label="ID">{{ workItemInfo.id }}</a-descriptions-item>
                <a-descriptions-item label="类型">
                  <a-tag color="processing">{{ workItemTypeOptions[workItemInfo.type] }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="创建人">{{ workItemInfo.creator }}</a-descriptions-item>
                <a-descriptions-item label="最后修改人">{{ workItemInfo.modifier }}</a-descriptions-item>
                <a-descriptions-item label="创建时间">{{ workItemInfo.create_time }}</a-descriptions-item>
                <a-descriptions-item label="修改时间">{{ workItemInfo.update_time }}</a-descriptions-item>
              </a-descriptions>
              <a-divider orientation="left">属性</a-divider>
              <a-form ref="createUpdateFormRef" :model="createUpdateForm" :rules="createUpdateRules">
                <a-form-item name="name" label="标题">
                  <a-input v-model:value="createUpdateForm.name" placeholder="请输入标题" />
                </a-form-item>
                <a-form-item name="desc" label="描&nbsp&nbsp&nbsp述">
                  <markdown-editor v-model:content-value="createUpdateForm.desc" :editor-options="mdEditorOptions" />
                </a-form-item>
                <a-row :gutter="24">
                  <a-col :span="12">
                    <a-form-item label="所属项目">
                      <a-input :value="sprintInfo.project_name" disabled />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item label="所属迭代">
                      <a-input :value="sprintInfo.name" disabled />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12">
                    <a-form-item name="owner" label="&nbsp负责人">
                      <a-select
                        v-model:value="createUpdateForm.owner"
                        placeholder="请选择负责人"
                        :show-arrow="true"
                        :filter-option="false"
                        :options="ownerOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item name="priority" label="&nbsp优先级">
                      <a-select
                        v-model:value="createUpdateForm.priority"
                        placeholder="请选择优先级"
                        :options="priorityOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="24" v-if="createUpdateForm.type === 2">
                  <a-col :span="12">
                    <a-form-item name="bug_type" label="缺陷类型">
                      <a-select
                        v-model:value="createUpdateForm.bug_type"
                        placeholder="请选择缺陷类型"
                        :show-arrow="true"
                        :filter-option="false"
                        :options="bugTypeOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item name="severity" label="严重程度">
                      <a-select
                        v-model:value="createUpdateForm.severity"
                        placeholder="请选择严重程度"
                        :options="severityOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="24">
                  <a-col :span="12">
                    <a-form-item name="status" label="状&nbsp&nbsp&nbsp&nbsp&nbsp态">
                      <a-select
                        v-model:value="createUpdateForm.status"
                        placeholder="请选择工作项状态"
                        :options="statusOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="createUpdateForm.type === 2">
                    <a-form-item name="process_result" label="处理结果">
                      <a-select
                        v-model:value="createUpdateForm.process_result"
                        placeholder="请选择处理结果"
                        :options="processResultOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="createUpdateForm.type === 1">
                    <a-form-item name="deadline" label="截止日期" v-if="createUpdateForm.type === 1">
                      <a-date-picker
                        placeholder="请选择截止日期"
                        v-model:value="createUpdateForm.deadline"
                        :show-time="{ format: 'HH:mm' }"
                        format="YYYY-MM-DD HH:mm"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-divider orientation="left">关注者</a-divider>
                <a-form-item name="followers" label="&nbsp关&nbsp注&nbsp者&nbsp">
                  <a-select
                    v-model:value="createUpdateForm.followers"
                    mode="multiple"
                    style="width: 100%"
                    placeholder="请选择关注者"
                    :options="followersOptions"
                  ></a-select>
                </a-form-item>
              </a-form>
            </a-tab-pane>
            <a-tab-pane key="2" tab="文件" force-render>Content of Tab Pane 2</a-tab-pane>
          </a-tabs>
        </a-col>
        <a-col :span="6">
          <a-row :gutter="24" class="height-100">
            <a-col :span="1" class="height-100">
              <div style="height: 100%; width: 1px; background-color: #586069"></div>
            </a-col>
            <a-col :span="22" class="height-100">
              <a-tabs v-model:activeKey="activityActiveKey">
                <a-tab-pane key="x" tab="评论">
                  <a-card>as</a-card>
                  <a-card>as</a-card>
                  <a-comment class="comment">
                    <template #avatar>
                      <a-avatar :src="userSettingStore.getUserInfo.avatar" alt="User Avatar" />
                    </template>
                    <template #content>
                      <a-form-item>
                        <a-textarea v-model:value="commentValue" :rows="2" />
                      </a-form-item>
                      <a-form-item>
                        <a-button
                          html-type="submit"
                          :loading="commentSubmitting"
                          type="primary"
                          @click="handleCommentSubmit"
                          >添加</a-button
                        >
                      </a-form-item>
                    </template>
                  </a-comment>
                </a-tab-pane>
                <a-tab-pane key="y" tab="变更记录"></a-tab-pane>
              </a-tabs>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </template>
  </standard-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { userStore } from '@/stores/user'
import { updateWorkItem, getWorkItemDetail } from '@/apis/pm/workItem'
import StandardModal from '@/components/StandardModal.vue'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'

const props = defineProps({
  sprintInfo: {
    type: Object,
    required: true
  },
  workItemId: {
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
const userSettingStore = userStore()
// TODO 每次新增或删除通知SprintDetail.vue组件更新sprintInfo数据
const contentActiveKey = ref('1')
const activityActiveKey = ref('x')
const commentValue = ref('')
const commentSubmitting = ref(false)
const workItemTypeOptions = { 0: '需求', 1: '任务', 2: '缺陷' }
const processResultOptions = [
  { value: 0, label: '不予处理' },
  { value: 1, label: '延期处理' },
  { value: 2, label: '外部原因' },
  { value: 3, label: '需求变更' },
  { value: 4, label: '转需求' },
  { value: 5, label: '挂起' },
  { value: 6, label: '设计如此' },
  { value: 7, label: '重复缺陷' },
  { value: 8, label: '无法重现' }
]
const statusOptions = [
  { value: 0, label: '未开始' },
  { value: 1, label: '待处理' },
  { value: 2, label: '重新打开' },
  { value: 3, label: '进行中' },
  { value: 4, label: '实现中' },
  { value: 5, label: '已完成' },
  { value: 6, label: '修复中' },
  { value: 7, label: '已实现' },
  { value: 8, label: '关闭' },
  { value: 9, label: '已修复' },
  { value: 10, label: '已验证' },
  { value: 11, label: '已拒绝' }
]
const priorityOptions = [
  { value: 0, label: '最低' },
  { value: 1, label: '较低' },
  { value: 2, label: '普通' },
  { value: 3, label: '较高' },
  { value: 4, label: '最高' }
]
const bugTypeOptions = [
  { value: 0, label: '功能问题' },
  { value: 1, label: '性能问题' },
  { value: 2, label: '接口问题' },
  { value: 3, label: '安全问题' },
  { value: 4, label: 'UI界面问题' },
  { value: 5, label: '易用性问题' },
  { value: 6, label: '兼容问题' },
  { value: 7, label: '数据问题' },
  { value: 8, label: '逻辑问题' },
  { value: 9, label: '需求问题' }
]
const severityOptions = [
  { value: 0, label: '保留' },
  { value: 1, label: '建议' },
  { value: 2, label: '提示' },
  { value: 3, label: '一般' },
  { value: 4, label: '严重' },
  { value: 5, label: '致命' }
]
const mdEditorOptions = ref({ height: '500px', width: '100%' })
const ownerOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.username, label: `${item.username} - ${item.name}` })
  }
  return tmpOwnerArr
})
const followersOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.id, label: `${item.username} - ${item.name}` })
  }
  return tmpOwnerArr
})
const createUpdateForm = ref({
  name: '',
  owner: null,
  type: props.title === '修改需求' ? 0 : props.title === '修改任务' ? 1 : 2,
  priority: null,
  status: 0,
  severity: null,
  bug_type: null,
  process_result: null,
  desc: '',
  deadline: '',
  sprint: props.sprintInfo.id,
  followers: []
})
const workItemInfo = ref(null)
const createUpdateFormRef = ref()
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '标题不能为空!' },
    { max: 64, trigger: 'change', message: '标题不能多于64位!' }
  ],
  owner: [{ required: true, trigger: 'change', message: '负责人不能为空!' }],
  priority: [{ required: true, trigger: 'change', message: '优先级不能为空!' }],
  status: [{ required: true, trigger: 'change', message: '工作项状态不能为空!' }]
}
watch(
  () => props.visible,
  () => {
    if (props.visible) {
      getWorkItemDetail(props.workItemId).then((res) => {
        workItemInfo.value = res
        const { create_time, update_time, parent, id, creator, modifier, owner_name, sprint_name, ...workItemObj } = res
        if (workItemObj.deadline) {
          workItemObj.deadline = dayjs(workItemObj.deadline)
        } else {
          workItemObj.deadline = ''
        }
        createUpdateForm.value = workItemObj
      })
    }
  }
)
const handleCommentSubmit = () => {
  if (!commentValue.value) {
    message.error('评论内容不能为空！')
    return
  }
  commentSubmitting.value = true
  console.log(commentValue.value)
  commentSubmitting.value = false
}
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      // 设置截止日期
      if (values.deadline) {
        values.deadline = values.deadline.format('YYYY-MM-DD HH:mm')
      }
      values.sprint = createUpdateForm.value.sprint
      values.type = createUpdateForm.value.type
      values.status = createUpdateForm.value.status
      // console.log(values)
      updateWorkItem(props.workItemId, values).then(() => {
        emit('getLatestDataList')
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

<style scoped>
.height-100 {
  height: 100%;
}
.comment {
  margin-top: 20px;
}
</style>
