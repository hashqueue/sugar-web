<template>
  <a-button class="add-btn" type="primary" @click="createProject" v-permission="'新增项目'">新增项目</a-button>
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
          <a @click="updateProject(record)" v-permission="'修改项目'">修改</a>
          <a-divider type="vertical" />
          <a @click="addMembers(record)" v-permission="'修改项目部分信息'">添加项目成员</a>
          <a-divider type="vertical" />
          <a @click="viewProjectDetail(record)" v-permission="'查询项目详情'">详情</a>
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
      <template v-else-if="column.key === 'project_status'">
        <a-tag v-if="record.project_status === 0">{{ status[record.project_status] }}</a-tag>
        <a-tag color="geekblue" v-else-if="record.project_status === 1">{{ status[record.project_status] }}</a-tag>
        <a-tag color="green" v-else>{{ status[record.project_status] }}</a-tag>
      </template>
    </template>
  </standard-table>
  <project-create-update-form
    :visible="visible"
    :title="title"
    :project-id="projectId"
    :all-user-list="allUserDataList"
    @close-modal="closeModal"
    @get-latest-data-list="getProjectListData"
  />
  <a-drawer v-model:visible="drawerVisible" :title="drawerTitle" width="50%" :mask-closable="false">
    <standard-table
      :row-key="'id'"
      :data-source="allUserDataList"
      :row-selection="{ selectedRowKeys: memberSelectedRowKeys, onChange: onSelectChange }"
      :columns="allUserColumns"
      :pagination="{ hideOnSinglePage: true }"
    ></standard-table>
    <a-button @click="submitAddMembers" type="primary" v-permission="'修改项目部分信息'">提交</a-button>
  </a-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteProjectDetail, getProjectList, updateProjectWithPatch, getProjectDetail } from '@/apis/pm/project'
import ProjectCreateUpdateForm from './ProjectCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getAllUserList } from '@/apis/system/user'

const router = useRouter()
const dataList = ref([])
const allUserDataList = ref([])
const drawerVisible = ref(false)
const drawerTitle = ref('')
const status = { 0: '未开始', 1: '进行中', 2: '已完成' }
const visible = ref(false)
const title = ref('新增项目')
const projectId = ref(null)
const tableLoading = ref(false)
const addMembersProjectId = ref(null)
const paginationData = ref({})
const memberSelectedRowKeys = ref([])
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
    dataIndex: 'project_status',
    key: 'project_status'
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner'
  },
  {
    title: '迭代数量',
    dataIndex: 'sprint_count',
    key: 'sprint_count'
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
const allUserColumns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position'
  }
]

getAllUserList().then((res) => {
  allUserDataList.value = res.results
})

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
const addMembers = (record) => {
  getProjectDetail(record.id).then((res) => {
    const tmp = []
    for (const member of res.members) {
      tmp.push(member.id)
    }
    memberSelectedRowKeys.value = tmp
    drawerTitle.value = `为项目 ${record.name} 添加成员`
    drawerVisible.value = true
    addMembersProjectId.value = record.id
  })
}

const viewProjectDetail = (record) => {
  router.push({ name: `/pm/projects/:projectId`, params: { projectId: record.id } })
}

const submitAddMembers = () => {
  updateProjectWithPatch(addMembersProjectId.value, { members: memberSelectedRowKeys.value }).then(() => {
    drawerVisible.value = false
  })
}
const onSelectChange = (selectedRowKeys, selectedRows) => {
  memberSelectedRowKeys.value = selectedRowKeys
}
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  const params = {}
  params.page = pagination.current
  params.size = pagination.pageSize
  tableLoading.value = true
  getProjectList(params).then((res) => {
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
