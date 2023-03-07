<template>
  <a-button type="primary" @click="createRole" v-permission="'新增角色'">新增角色</a-button>
  <standard-table
    :data-source="dataList"
    :loading="tableLoading"
    :columns="columns"
    :row-key="'id'"
    @on-page-change="onPageChange"
  >
    <template #action="{ column, record }">
      <!--  record: 具名插槽作用域传值(父插槽内容中获取子组件数据record)  -->
      <template v-if="column.key === 'action'">
        <span>
          <a @click="updateRole(record)" v-permission="'修改角色'">修改</a>
          <a-divider type="vertical" />
          <a @click="setPermissions(record)" v-permission="'修改角色部分信息'">设置权限</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除该角色吗？" ok-text="确定" cancel-text="取消" @confirm="deleteRole(record.id)">
            <a v-permission="'删除角色'">删除</a>
          </a-popconfirm>
        </span>
      </template>
    </template>
  </standard-table>
  <role-create-update-form
    :visible="visible"
    :title="title"
    :role-id="roleId"
    @close-modal="closeModal"
    @get-latest-role-list="getRoleListData"
  />
  <a-drawer
    v-model:visible="drawerVisible"
    :title="drawerTitle"
    width="40%"
    :mask-closable="false"
    @close="closeDrawer"
  >
    <a-alert
      message="提示"
      description="蓝色为菜单权限，绿色为按钮权限。"
      type="info"
      show-icon
      style="margin-bottom: 10px"
    />
    <a-tree
      :default-expand-all="true"
      :checked-keys="checkedKeys"
      :check-strictly="true"
      @check="getTreeCheckedKeys"
      checkable
      :tree-data="permissionTreeData"
    >
      <template #title="{ title, is_menu }">
        <span v-if="is_menu" style="color: #1890ff">{{ title }}</span>
        <span v-else style="color: #52c41a">{{ title }}</span>
      </template>
    </a-tree>
    <a-button type="primary" @click="submitPermissions" class="submit-btn" v-permission="'修改角色部分信息'"
      >提交</a-button
    >
  </a-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { deleteRoleDetail, getRoleList, getRoleDetail, updateRoleWithPatch } from '@/apis/system/role'
import { generateObjectTreeData } from '@/utils/common'
import { getPermissionTreeList } from '@/apis/system/permission'
import RoleCreateUpdateForm from './RoleCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'

const dataList = ref([])
const permissionTreeData = ref([])
const checkedKeys = ref({ checked: [], halfChecked: [] })
const visible = ref(false)
const drawerVisible = ref(false)
const title = ref('新增角色')
const drawerTitle = ref('')
const tableLoading = ref(false)
const roleId = ref(null)
const setPermissionsRoleId = ref(null)
const paginationData = ref({})
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc'
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

const getRoleListData = () => {
  getRoleList().then((res) => {
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
getRoleListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  const params = {}
  params.page = pagination.current
  params.size = pagination.pageSize
  tableLoading.value = true
  getRoleList(params).then((res) => {
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
const createRole = () => {
  title.value = '新增角色'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增角色'
  visible.value = false
}
const updateRole = (record) => {
  roleId.value = record.id
  title.value = '修改角色'
  visible.value = true
}
const closeDrawer = () => {
  // console.log('closeDrawer')
  checkedKeys.value = { checked: [], halfChecked: [] }
}
const getTreeCheckedKeys = (pCheckedKeys) => {
  // 每次选中某个权限时更新被选中的权限的key
  // console.log(pCheckedKeys)
  checkedKeys.value = pCheckedKeys
}
const setPermissions = (record) => {
  getPermissionTreeList().then((res) => {
    permissionTreeData.value = generateObjectTreeData(res.results, 'permission')
    getRoleDetail(record.id).then((res) => {
      const permissionIds = []
      for (const permission of res.permissions) {
        permissionIds.push(permission.id)
      }
      checkedKeys.value.checked = permissionIds
      // console.log(res)
      drawerTitle.value = `设置角色 ${res.name} 的权限`
      drawerVisible.value = true
      setPermissionsRoleId.value = record.id
    })
  })
}
const submitPermissions = () => {
  updateRoleWithPatch(setPermissionsRoleId.value, { permissions: checkedKeys.value.checked }).then(() => {
    checkedKeys.value = { checked: [], halfChecked: [] }
    drawerVisible.value = false
  })
}
const deleteRole = (roleId) => {
  deleteRoleDetail(roleId).then(() => {
    getRoleListData()
  })
}
</script>

<style scoped>
.submit-btn {
  margin-top: 100px;
}
</style>
