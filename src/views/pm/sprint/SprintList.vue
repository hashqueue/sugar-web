<template>
  <a-card title="迭代列表" class="sprint-list">
    <standard-table
      :data-source="dataList"
      :columns="columns"
      :row-key="'id'"
      :scroll="{ x: '100%' }"
      :loading="tableLoading"
      :pagination="paginationData"
      @on-page-change="onPageChange"
    >
      <template #tableFilter>
        <a-form ref="filterFormRef" :model="filterForm" :wrapper-col="{ span: 18 }" @finish="handleFilterFinish">
          <a-row>
            <a-col :span="6">
              <a-form-item name="name" label="迭代名">
                <a-input v-model:value="filterForm.name" placeholder="迭代名" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="owner" label="负责人">
                <a-input v-model:value="filterForm.owner" placeholder="请输入负责人(英文用户名)" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="sprint_status" label="状态">
                <a-select
                  v-model:value="filterForm.sprint_status"
                  placeholder="请选择状态"
                  :options="statusOptions"
                  :allow-clear="true"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="creator" label="创建人">
                <a-input v-model:value="filterForm.creator" placeholder="请输入创建人" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-button type="primary" html-type="submit">查询</a-button>
            <a-button style="margin-left: 10px" @click="resetFilterForm">重置</a-button>
          </a-form-item>
        </a-form>
        <a-divider />
        <a-button type="primary" @click="createSprint" v-permission="'新增迭代'">新增迭代</a-button>
      </template>
      <template #action="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a @click="updateSprint(record)" v-permission="'修改迭代'">修改</a>
            <a-divider type="vertical" />
            <a @click="viewSprintDetail(record)" v-permission="'查询迭代详情'">详情</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定删除该迭代吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteSprint(record.id)"
            >
              <a v-permission="'删除迭代'">删除</a>
            </a-popconfirm>
          </span>
        </template>
        <template v-else-if="column.key === 'id'">#{{ record.id }}</template>
        <template v-else-if="column.key === 'owner'">{{ record.owner }} - {{ record.owner_name }}</template>
        <template v-else-if="column.key === 'sprint_status'">
          <a-tag v-if="record.sprint_status === 0">{{ status[record.sprint_status] }}</a-tag>
          <a-tag color="geekblue" v-else-if="record.sprint_status === 1">{{ status[record.sprint_status] }}</a-tag>
          <a-tag color="green" v-else>{{ status[record.sprint_status] }}</a-tag>
        </template>
      </template>
    </standard-table>
    <sprint-create-update-form
      v-if="projectInfo"
      :visible="visible"
      :all-user-list="allUserDataList"
      :title="title"
      :project-name="projectInfo.name"
      :project-id="projectId"
      :sprint-id="sprintId"
      @close-modal="closeModal"
      @get-latest-data-list="getSprintListData"
    />
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { deleteSprintDetail, getSprintList } from '@/apis/pm/sprint'
import SprintCreateUpdateForm from './SprintCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getProjectMembers } from '@/apis/pm/project'
import { projectStore } from '@/stores/project'

const props = defineProps({
  projectInfo: {
    type: [Object, undefined],
    required: false
  },
  projectId: {
    type: Number,
    required: true
  }
})
const projectSettingStore = projectStore()
const router = useRouter()
const sprintId = ref(null)
const allUserDataList = ref([])
const dataList = ref([])
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }
const statusOptions = [
  { value: 0, label: '未开始' },
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' }
]
const visible = ref(false)
const title = ref('新增迭代')
const sprintQueryParams = ref({ project_id: props.projectId })
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: '迭代名',
    dataIndex: 'name',
    key: 'name',
    width: 350,
    fixed: 'left'
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70
  },
  {
    title: '状态',
    dataIndex: 'sprint_status',
    key: 'sprint_status',
    width: 100
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
    width: 150
  },
  {
    title: '需求数量',
    dataIndex: 'feature_count',
    key: 'feature_count',
    width: 100
  },
  {
    title: '任务数量',
    dataIndex: 'task_count',
    key: 'task_count',
    width: 100
  },
  {
    title: '缺陷数量',
    dataIndex: 'bug_count',
    key: 'bug_count',
    width: 100
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
    key: 'start_time',
    width: 180
  },
  {
    title: '完成时间',
    dataIndex: 'finish_time',
    key: 'finish_time',
    width: 180
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator',
    width: 150
  },
  {
    title: '最后修改人',
    dataIndex: 'modifier',
    key: 'modifier',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 180
  },
  {
    title: '修改时间',
    dataIndex: 'update_time',
    key: 'update_time',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
    fixed: 'right'
  }
]

const filterFormRef = ref()
const filterForm = ref({
  name: '',
  owner: '',
  creator: '',
  sprint_status: null
})

const handleFilterFinish = (values) => {
  // const values = filterForm.value
  let tag = true
  for (const valuesKey in values) {
    if (values[valuesKey] === undefined || values[valuesKey] === '' || values[valuesKey] === null) {
      delete values[valuesKey]
    } else {
      tag = false
    }
  }
  if (!tag) {
    // console.log('valid', values)
    // 添加新的filter字段
    for (const valuesKey in values) {
      sprintQueryParams.value[valuesKey] = values[valuesKey]
    }
    // console.log(sprintQueryParams.value)
    // 删除不需要的filter字段
    for (const valueKey in sprintQueryParams.value) {
      if (valueKey in filterForm.value && !(valueKey in values)) {
        delete sprintQueryParams.value[valueKey]
      }
    }
    // console.log(sprintQueryParams.value)
    getSprintListData()
  } else {
    message.error('请至少填写一项，再进行筛选！')
  }
  // console.log('filterForm.value', filterForm.value)
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in sprintQueryParams.value) {
      delete sprintQueryParams.value[valueKey]
    }
  }
  getSprintListData()
}

getProjectMembers(props.projectId).then((res) => {
  allUserDataList.value = res.results
})

const getSprintListData = () => {
  tableLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    dataList.value = res.results
    paginationData.value = {
      total: res.count,
      current: res.current_page,
      pageSize: res.page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${res.count} 条`
    }
    tableLoading.value = false
  })
}
getSprintListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  sprintQueryParams.value.page = pagination.current
  sprintQueryParams.value.size = pagination.pageSize
  tableLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    dataList.value = res.results
    paginationData.value = {
      total: res.count,
      current: res.current_page,
      pageSize: res.page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${res.count} 条`
    }
    tableLoading.value = false
  })
}
const createSprint = () => {
  title.value = '新增迭代'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增迭代'
  visible.value = false
}
const updateSprint = (record) => {
  sprintId.value = record.id
  title.value = '修改迭代'
  visible.value = true
}
const viewSprintDetail = (record) => {
  router.push({ name: `/pm/sprints/:sprintId`, params: { sprintId: record.id } })
}
const deleteSprint = (scriptId) => {
  deleteSprintDetail(scriptId).then(() => {
    getSprintListData()
    // 通知ProjectDetail组件更新数据
    projectSettingStore.setNeedUpdateProjectInfo(true)
  })
}
</script>

<style scoped>
.sprint-list {
  margin-top: 20px;
}
</style>
