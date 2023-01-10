<template>
  <a-button class="add-btn" type="primary" @click="createProject" v-permission="'新增项目'">新增项目</a-button>
  <standard-table
    :data-source="dataList"
    :columns="columns"
    :row-key="'id'"
    :pagination="paginationData"
    @on-page-change="onPageChange"
  >
    <template #action="{ column, record }">
      <template v-if="column.key === 'action'">
        <span>
          <a @click="updateProject(record)" v-permission="'修改项目'">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除该项目吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="deleteProject(record.id)"
          >
            <a v-permission="'删除项目'">删除</a>
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
  <project-create-update-form
    :visible="visible"
    :title="title"
    :project-id="projectId"
    @close-modal="closeModal"
    @get-latest-project-list="getLatestProjectList"
  />
</template>

<script setup>
import { ref } from 'vue'
import { deleteProjectDetail, getProjectList } from '@/apis/pm/project'
import ProjectCreateUpdateForm from './ProjectCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'

const dataList = ref([])
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }
const visible = ref(false)
const title = ref('新增项目')
const projectId = ref(null)
const paginationData = ref({})
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '项目名',
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
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator'
  },
  {
    title: '最后修改人',
    dataIndex: 'modifier',
    key: 'modifier'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time'
  },
  {
    title: '修改时间',
    dataIndex: 'update_time',
    key: 'update_time'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const getProjectListData = () => {
  getProjectList().then((res) => {
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
getProjectListData()
const getLatestProjectList = () => {
  getProjectListData()
}
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  const params = {}
  params.page = pagination.current
  params.size = pagination.pageSize
  getProjectList(params).then((res) => {
    // console.log(pagination)
    dataList.value = res.results
    paginationData.value = {
      total: res.count,
      current: res.current_page,
      pageSize: pagination.pageSize,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${res.count} 条`
    }
  })
}
const createProject = () => {
  title.value = '新增项目'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增项目'
  visible.value = false
}
const updateProject = (record) => {
  projectId.value = record.id
  title.value = '修改项目'
  visible.value = true
}
const deleteProject = (projectId) => {
  deleteProjectDetail(projectId).then(() => {
    getProjectListData()
  })
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
