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
                  <a-tag color="processing">{{ workItemTypeOptions[workItemInfo.work_item_type] }}</a-tag>
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
                <a-row :gutter="24" v-if="createUpdateForm.work_item_type === 2">
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
                    <a-form-item name="work_item_status" label="状&nbsp&nbsp&nbsp&nbsp&nbsp态">
                      <a-select
                        v-model:value="createUpdateForm.work_item_status"
                        placeholder="请选择工作项状态"
                        :options="statusOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="createUpdateForm.work_item_type === 2">
                    <a-form-item name="process_result" label="处理结果">
                      <a-select
                        v-model:value="createUpdateForm.process_result"
                        placeholder="请选择处理结果"
                        :options="processResultOptions"
                      ></a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12" v-if="createUpdateForm.work_item_type === 1">
                    <a-form-item name="deadline" label="截止日期" v-if="createUpdateForm.work_item_type === 1">
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
            <a-tab-pane key="2" tab="文件" force-render>
              <a-row :gutter="24" justify="space-between">
                <a-col :span="4">文件列表</a-col>
                <a-col :span="3" style="margin-right: 8px">
                  <a-upload
                    name="file"
                    :action="userFileUploadUrl"
                    :headers="userFileUploadHeaders"
                    :data="{ work_item: workItemId }"
                    :show-upload-list="false"
                    @change="handleFileUploadChange"
                  >
                    <a-button><upload-outlined></upload-outlined>上传文件</a-button>
                  </a-upload>
                </a-col>
              </a-row>
              <a-list
                class="demo-loadmore-list"
                :loading="initLoading"
                item-layout="horizontal"
                :data-source="userFileList"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <template #actions>
                      <a key="list-loadmore-edit" @click="downloadUserFile(item)">下载</a>
                      <a key="list-loadmore-preview" @click="previewFile(item.file)">预览</a>
                      <a-popconfirm
                        title="确定删除该文件吗？"
                        ok-text="确定"
                        cancel-text="取消"
                        @confirm="deleteFile(item.id)"
                      >
                        <a key="list-loadmore-delete">删除</a>
                      </a-popconfirm>
                    </template>
                    <a-skeleton avatar :title="false" :loading="!!item.loading" active>
                      <a-list-item-meta :description="`${item.size} 来自 ${item.creator} - ${item.creator_name}`">
                        <template #title>
                          <p>{{ item.file_name.split('/')[item.file_name.split('/').length - 1] }}</p>
                        </template>
                      </a-list-item-meta>
                      <div>{{ item.create_time }}</div>
                    </a-skeleton>
                  </a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
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
                  <a-list
                    v-if="comments.length"
                    :data-source="comments"
                    :header="`${comments.length} 条评论`"
                    item-layout="horizontal"
                  >
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-comment
                          :author="`${item.creator} - ${item.creator_name}`"
                          :content="item.content"
                          :datetime="item.create_time"
                        />
                      </a-list-item>
                      <a-list-item>
                        <template #actions>
                          <a-popconfirm
                            title="确定删除该评论吗？"
                            ok-text="确定"
                            cancel-text="取消"
                            @confirm="deleteComment(item.id)"
                          >
                            <a key="list-loadmore-delete">删除</a>
                          </a-popconfirm>
                        </template>
                      </a-list-item>
                    </template>
                  </a-list>
                  <a-comment class="comment">
                    <template #avatar>
                      <a-avatar :src="userSettingStore.getUserInfo.avatar" alt="User Avatar" />
                    </template>
                    <template #content>
                      <a-form-item>
                        <a-textarea v-model:value="commentValue" :rows="5" />
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
                <a-tab-pane key="y" tab="变更记录">
                  <a-list
                    v-if="changelogs.length"
                    :data-source="changelogs"
                    :header="`${changelogs.length} 条记录`"
                    item-layout="horizontal"
                  >
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <a-comment :author="`${item.creator} - ${item.creator_name}`" :datetime="item.create_time">
                          <template #content>
                            <a-form-item>
                              <template v-for="(changelogItem, index) in item.changelog" :key="index">
                                <div v-if="changelogItem.key !== 'desc'" style="margin-top: 2px">
                                  更新了 <a-tag color="processing">{{ changelogItem.desc }}</a-tag
                                  >:
                                  <span style="color: #ff4d4f"
                                    ><del>{{ changelogItem.origin }}</del></span
                                  >
                                  -> <span style="color: #52c41a">{{ changelogItem.current }}</span>
                                </div>
                              </template>
                            </a-form-item>
                          </template>
                        </a-comment>
                      </a-list-item>
                    </template>
                  </a-list>
                </a-tab-pane>
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
import { updateFileWithPatch, getFileList, deleteFileDetail } from '@/apis/pm/userFile'
import { createComment, getCommentList, deleteCommentDetail } from '@/apis/pm/comment'
import { getChangelogList } from '@/apis/pm/changelog'
import { downloadFile } from '@/utils/common'
import StandardModal from '@/components/StandardModal.vue'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'
import { bugTypeOptions, processResultOptions, statusOptions, priorityOptions, severityOptions } from '@/utils/common'

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

const contentActiveKey = ref('1')
const createUpdateForm = ref({
  name: '',
  owner: null,
  work_item_type: props.title === '修改需求' ? 0 : props.title === '修改任务' ? 1 : 2,
  priority: null,
  work_item_status: 0,
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
  work_item_status: [{ required: true, trigger: 'change', message: '工作项状态不能为空!' }]
}
const userFileUploadUrl = `http://${location.host}${import.meta.env.VITE_BASE_URL}/pm/files/`
const userFileUploadHeaders = { Authorization: `Bearer ${userSettingStore.getToken}` }
const userFileList = ref([])
const initLoading = ref(false)
const userUploadFileIds = ref([])

const activityActiveKey = ref('x')
const comments = ref([])
const commentValue = ref('')
const commentSubmitting = ref(false)

const changelogs = ref([])

const workItemTypeOptions = { 0: '需求', 1: '任务', 2: '缺陷' }
const mdEditorOptions = ref({
  height: '650px',
  width: '100%',
  upload: {
    url: `${import.meta.env.VITE_BASE_URL}/pm/files/`,
    headers: { Authorization: `Bearer ${userSettingStore.getToken}` },
    fieldName: 'file',
    max: 500 * 1024 * 1024,
    format(files, responseText) {
      const resp = JSON.parse(responseText)
      const result = {
        code: 0,
        msg: resp.message,
        data: {
          errFiles: [],
          succMap: {}
        }
      }
      if (resp.code === 20000) {
        const fileNameList = resp.data.file_name.split('/')
        result.data.succMap[fileNameList[fileNameList.length - 1]] = resp.data.file
        userUploadFileIds.value.push(resp.data.id)
      } else {
        result.code = 1
      }
      return JSON.stringify(result)
    }
  }
})
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
      getUserFileList()
      getUserCommentList()
      getChangelogList({ size: 50, work_item_id: props.workItemId }).then((res) => {
        changelogs.value = res.results
      })
    }
  }
)
const getUserFileList = () => {
  initLoading.value = true
  getFileList({ size: 50, work_item_id: props.workItemId }).then((res) => {
    userFileList.value = res.results
    initLoading.value = false
  })
}
const downloadUserFile = (item) => {
  message.info('已经开始下载文件(无文件后缀的文件下载时会被自动添加.txt文件后缀)，请稍等片刻...')
  const originUrlArr = item.file.split('/')
  const url = `http://${location.host}/${originUrlArr.slice(3, originUrlArr.length).join('/')}`
  downloadFile(url, item.file_name.split('/')[item.file_name.split('/').length - 1])
}
const previewFile = (url) => {
  window.open(url)
}
const deleteFile = (fileId) => {
  deleteFileDetail(fileId).then(() => {
    getUserFileList()
  })
}
const handleFileUploadChange = (info) => {
  if (info.file.status === 'done') {
    // 文件上传成功
    message.success(`文件 <${info.file.name}> 上传成功.`)
    getUserFileList()
  } else if (info.file.status === 'error') {
    message.error(`文件 <${info.file.name}> 上传失败.`)
  }
}
const handleCommentSubmit = () => {
  if (!commentValue.value) {
    message.error('评论内容不能为空！')
    return
  }
  commentSubmitting.value = true
  createComment({ content: commentValue.value, work_item: props.workItemId }).then(() => {
    commentValue.value = ''
    getUserCommentList()
    commentSubmitting.value = false
  })
}
const getUserCommentList = () => {
  getCommentList({ size: 50, work_item_id: props.workItemId }).then((res) => {
    comments.value = res.results
  })
}
const deleteComment = (commentId) => {
  deleteCommentDetail(commentId).then(() => {
    getUserCommentList()
  })
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
      values.work_item_type = createUpdateForm.value.work_item_type
      values.work_item_status = createUpdateForm.value.work_item_status
      // console.log(values)
      updateWorkItem(props.workItemId, values).then(() => {
        emit('getLatestDataList')
        createUpdateFormRef.value.resetFields()
        emit('closeModal')
        // 将上传的文件跟workItem关联起来
        const formData = new FormData()
        formData.append('work_item', props.workItemId)
        for (const userUploadFileId of userUploadFileIds.value) {
          updateFileWithPatch(userUploadFileId, formData)
        }
        // 手动重置数据
        userUploadFileIds.value = []
        contentActiveKey.value = '1'
        activityActiveKey.value = 'x'
        comments.value = []
        commentValue.value = ''
        changelogs.value = []
      })
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onCancel = () => {
  createUpdateFormRef.value.resetFields()
  emit('closeModal')
  userUploadFileIds.value = []
  contentActiveKey.value = '1'
  activityActiveKey.value = 'x'
  comments.value = []
  commentValue.value = ''
  changelogs.value = []
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
