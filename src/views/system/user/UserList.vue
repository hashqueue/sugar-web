<template>
  <a-button class="add-btn" type="primary" @click="createUser" v-permission="'新增用户'">新增用户</a-button>
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
          <a @click="updateUser(record)" v-permission="'修改用户'">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除该用户吗？" ok-text="确定" cancel-text="取消" @confirm="deleteUser(record.id)">
            <a v-permission="'删除用户'">删除</a>
          </a-popconfirm>
        </span>
      </template>
      <template v-if="column.key === 'roles'">
        <template v-for="(role, index) in record.roles" :key="index">
          <a-tag color="geekblue">{{ role }}</a-tag>
        </template>
      </template>
    </template>
  </standard-table>
  <user-create-update-form
    :visible="visible"
    :title="title"
    :user-id="userId"
    @close-modal="closeModal"
    @get-latest-user-list="getUserListData"
  />
</template>

<script setup>
import { ref } from 'vue'
import { deleteUserDetail, getUserList } from '@/apis/system/user'
import UserCreateUpdateForm from './UserCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'

const dataList = ref([])
const visible = ref(false)
const title = ref('新增用户')
const userId = ref(null)
const paginationData = ref({})
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department'
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position'
  },
  {
    title: '角色',
    dataIndex: 'roles',
    key: 'roles'
  },
  {
    title: '操作',
    key: 'action'
  }
]

const getUserListData = () => {
  getUserList().then((res) => {
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
getUserListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  const params = {}
  params.page = pagination.current
  params.size = pagination.pageSize
  getUserList(params).then((res) => {
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
const createUser = () => {
  title.value = '新增用户'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增用户'
  visible.value = false
}
const updateUser = (record) => {
  userId.value = record.id
  title.value = '修改用户'
  visible.value = true
}
const deleteUser = (userId) => {
  deleteUserDetail(userId).then(() => {
    getUserListData()
  })
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
