<template>
  <a-button class="add-btn" type="primary" @click="createUser" v-permission="'新增用户'">新增用户</a-button>
  <a-table
    :columns="columns"
    :data-source="dataList"
    row-key="id"
    bordered
    :pagination="paginationData"
    @change="onPageChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <span>
          <a @click="updateUser(record)" v-permission="'修改用户'">修改</a>
          <a-divider type="vertical" />
          <a @click="deleteUser(record.id)" v-permission="'删除用户'">删除</a>
        </span>
      </template>
      <template v-if="column.key === 'roles'">
        <template v-for="(role, index) in record.roles" :key="index">
          <a-tag color="geekblue">{{ role }}</a-tag>
        </template>
      </template>
    </template>
  </a-table>
  <user-create-update-form
    :visible="visible"
    :title="title"
    :user-id="userId"
    @close-modal="closeModal"
    @get-latest-user-list="getLatestUserList"
  />
  <a-modal v-model:visible="delVisible" title="提示" @ok="handleDeleteOk">
    <p>
      <exclamation-circle-two-tone
        :style="{ fontSize: '17px', marginRight: '10px' }"
        two-tone-color="#FF0000"
      />此操作将删除该用户下所有的数据，是否继续？
    </p>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { deleteUserDetail, getUserList } from '@/apis/user'
import UserCreateUpdateForm from './UserCreateUpdateForm.vue'

const dataList = ref([])
const visible = ref(false)
const title = ref('新增用户')
const userId = ref(null)
const delVisible = ref(false)
const delUserId = ref(undefined)
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
const getLatestUserList = () => {
  getUserListData()
}
const onPageChange = (pagination, filters, sorter, { currentDataSource }) => {
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
const handleDeleteOk = () => {
  deleteUserDetail(delUserId.value).then(() => {
    delVisible.value = false
    getUserListData()
  })
}
const deleteUser = (userId) => {
  // console.log(userId)
  delVisible.value = true
  delUserId.value = userId
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
