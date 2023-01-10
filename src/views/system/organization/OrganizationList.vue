<template>
  <a-button class="add-btn" type="primary" @click="createRootOrganization" v-permission="'新增部门'"
    >新增根组织架构</a-button
  >
  <standard-table
    :data-source="dataList"
    :columns="columns"
    :row-key="'id'"
    :default-expand-all-rows="true"
    :pagination="{ hideOnSinglePage: true }"
  >
    <template #action="{ column, record }">
      <template v-if="column.key === 'type'">
        <a-tag :color="record.type === 'company' ? 'geekblue' : 'green'">
          {{ record.type === 'company' ? '公司' : '部门' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'action'">
        <span>
          <a @click="createSubOrganization(record)" v-permission="'新增部门'">添加子组织架构</a>
          <a-divider type="vertical" />
          <a @click="updateOrganization(record)" v-permission="'修改部门'">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm
            title="确定删除该部门吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="deleteOrganization(record.id)"
          >
            <a v-permission="'删除部门'">删除</a>
          </a-popconfirm>
        </span>
      </template>
    </template>
  </standard-table>
  <organization-create-update-form
    :visible="visible"
    :title="title"
    :organization-id="organizationId"
    @close-modal="closeModal"
    @get-latest-organization-list="getLatestOrganizationList"
  />
</template>

<script setup>
import { ref } from 'vue'
import { getOrganizationTreeList, deleteOrganizationDetail } from '@/apis/system/organization'
import OrganizationCreateUpdateForm from './OrganizationCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'

const dataList = ref([])
const visible = ref(false)
const title = ref('新增根组织架构')
const organizationId = ref(null)

const getOrganizationTreeListData = () => {
  getOrganizationTreeList().then((res) => {
    dataList.value = res.results
  })
}
getOrganizationTreeListData()
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
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

const createRootOrganization = () => {
  title.value = '新增根组织架构'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增根组织架构'
  visible.value = false
}
const getLatestOrganizationList = () => {
  getOrganizationTreeListData()
}
const createSubOrganization = (record) => {
  organizationId.value = record.id
  title.value = '添加子组织架构'
  visible.value = true
}
const updateOrganization = (record) => {
  organizationId.value = record.id
  title.value = '修改组织架构'
  visible.value = true
}
const deleteOrganization = (organizationId) => {
  deleteOrganizationDetail(organizationId).then(() => {
    getOrganizationTreeListData()
  })
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
