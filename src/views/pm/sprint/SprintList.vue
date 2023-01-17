<template>
  <a-card title="迭代列表" class="sprint-list">
    <a-button class="add-btn" type="primary" @click="createSprint" v-permission="'新增迭代'">新增迭代</a-button>
    <standard-table
      :data-source="dataList"
      :columns="columns"
      :row-key="'id'"
      :loading="tableLoading"
      :pagination="paginationData"
      @on-page-change="onPageChange"
    >
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
        <template v-else-if="column.key === 'status'">
          <a-tag color="geekblue">{{ status[record.status] }}</a-tag>
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
import { deleteSprintDetail, getSprintList } from '@/apis/pm/sprint'
import SprintCreateUpdateForm from './SprintCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getAllUserList } from '@/apis/system/user'

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
const router = useRouter()
const sprintId = ref(null)
const allUserDataList = ref([])
const dataList = ref([])
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }
const visible = ref(false)
const title = ref('新增迭代')
const sprintQueryParams = ref({ project_id: props.projectId })
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '迭代名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner'
  },
  {
    title: '需求数量',
    dataIndex: 'feature_count',
    key: 'feature_count'
  },
  {
    title: '任务数量',
    dataIndex: 'task_count',
    key: 'task_count'
  },
  {
    title: '缺陷数量',
    dataIndex: 'bug_count',
    key: 'bug_count'
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time'
  },
  {
    title: '操作',
    key: 'action'
  }
]

getAllUserList().then((res) => {
  allUserDataList.value = res.results
})

const getSprintListData = () => {
  getSprintList(sprintQueryParams.value).then((res) => {
    dataList.value = res.results
    paginationData.value = {
      total: res.count,
      current: res.current_page,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${res.count} 条`
    }
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
      pageSize: pagination.pageSize,
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
  })
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
.sprint-list {
  margin-top: 20px;
}
</style>
