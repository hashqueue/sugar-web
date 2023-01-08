<template>
  <a-button class="add-btn" type="primary" @click="createRootPermission" v-permission="'新增权限'">新增根权限</a-button>
  <a-table
    v-if="dataList.length"
    :columns="columns"
    :data-source="dataList"
    row-key="id"
    bordered
    :scroll="{ x: '100%', y: '100%' }"
    :pagination="{ hideOnSinglePage: true }"
  >
    <!-- 默认展开table所有行  :default-expand-all-rows="true"  -->
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'is_menu'">
        <a-tag :color="record.is_menu ? 'geekblue' : 'green'">
          {{ record.is_menu ? '菜单' : 'API' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'icon'">
        <a-tag color="geekblue" v-if="record.icon">
          <template #icon>
            <component :is="record.icon" />
          </template>
          {{ record.icon }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'is_visible'">
        <a-tag color="geekblue" v-if="record.is_menu">
          {{ record.is_visible ? '是' : '否' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'method'">
        <a-tag color="green" v-if="record.method">
          {{ record.method }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'action'">
        <span>
          <a @click="createSubPermission(record)" v-permission="'新增权限'">添加子权限</a>
          <a-divider type="vertical" />
          <a @click="updatePermission(record)" v-permission="'修改权限'">修改</a>
          <a-divider type="vertical" />
          <a @click="deletePermission(record.id)" v-permission="'删除权限'">删除</a>
        </span>
      </template>
    </template>
  </a-table>
  <permission-create-update-form
    :visible="visible"
    :title="title"
    :permission-id="permissionId"
    @close-modal="closeModal"
    @get-latest-permission-list="getLatestPermissionList"
  />
  <a-modal v-model:visible="delVisible" title="提示" @ok="handleDeleteOk">
    <p>
      <exclamation-circle-two-tone
        :style="{ fontSize: '17px', marginRight: '10px' }"
        two-tone-color="#FF0000"
      />此操作将删除该权限下所有的数据，是否继续？
    </p>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { getPermissionTreeList, deletePermissionDetail } from '@/apis/permission'
import PermissionCreateUpdateForm from './PermissionCreateUpdateForm.vue'

const dataList = ref([])
const visible = ref(false)
const delVisible = ref(false)
const delPermissionId = ref(undefined)
const title = ref('新增根权限')
const permissionId = ref(null)

const getPermissionTreeListData = () => {
  getPermissionTreeList().then((res) => {
    dataList.value = res.results
  })
}
getPermissionTreeListData()
const columns = [
  {
    title: '名称',
    dataIndex: 'title',
    key: 'title',
    width: 350,
    fixed: 'left'
  },
  {
    title: '类型',
    dataIndex: 'is_menu',
    width: 70,
    key: 'is_menu'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 250,
    key: 'icon'
  },
  {
    title: '是否显示',
    dataIndex: 'is_visible',
    width: 100,
    key: 'is_visible'
  },
  {
    title: '路由path',
    dataIndex: 'path',
    width: 250,
    key: 'path'
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    width: 500,
    key: 'component'
  },
  {
    title: '路由重定向path',
    dataIndex: 'redirect',
    width: 200,
    key: 'redirect'
  },
  {
    title: '请求方法',
    dataIndex: 'method',
    width: 100,
    key: 'method'
  },
  {
    title: '请求路径',
    dataIndex: 'url_path',
    width: 400,
    key: 'url_path'
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right'
  }
]

const createRootPermission = () => {
  title.value = '新增根权限'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增根权限'
  visible.value = false
}
const getLatestPermissionList = () => {
  getPermissionTreeListData()
}
const createSubPermission = (record) => {
  permissionId.value = record.id
  title.value = '添加子权限'
  visible.value = true
}
const updatePermission = (record) => {
  permissionId.value = record.id
  title.value = '修改权限'
  visible.value = true
}
const handleDeleteOk = () => {
  deletePermissionDetail(delPermissionId.value).then(() => {
    delVisible.value = false
    getPermissionTreeListData()
  })
}
const deletePermission = (permissionId) => {
  // console.log(permissionId)
  delVisible.value = true
  delPermissionId.value = permissionId
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
