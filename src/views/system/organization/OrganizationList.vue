<template>
  <a-button class="add-btn" type="primary" @click="createRootOrganization" v-permission="'新增部门'"
    >新增根组织架构</a-button
  >
  <a-table
    v-if="dataList.length"
    :columns="columns"
    :data-source="dataList"
    row-key="id"
    bordered
    :default-expand-all-rows="true"
    :pagination="{ hideOnSinglePage: true }"
  >
    <template #bodyCell="{ column, record }">
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
          <a @click="deleteOrganization(record.id)" v-permission="'删除部门'">删除</a>
        </span>
      </template>
    </template>
  </a-table>
  <organization-create-update-form
    :visible="visible"
    :title="title"
    :organization-id="organizationId"
    @close-modal="closeModal"
    @get-latest-organization-list="getLatestOrganizationList"
  />
  <a-modal v-model:visible="delVisible" title="提示" @ok="handleDeleteOk">
    <p>
      <exclamation-circle-two-tone
        :style="{ fontSize: '17px', marginRight: '10px' }"
        two-tone-color="#FF0000"
      />此操作将删除该组织架构下所有的数据，是否继续？
    </p>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { getOrganizationTreeList, deleteOrganizationDetail } from '@/apis/organization'
import OrganizationCreateUpdateForm from './OrganizationCreateUpdateForm.vue'

const dataList = ref([])
const visible = ref(false)
const delVisible = ref(false)
const delOrganizationId = ref(undefined)
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
const handleDeleteOk = () => {
  deleteOrganizationDetail(delOrganizationId.value).then(() => {
    delVisible.value = false
    getOrganizationTreeListData()
  })
}
const deleteOrganization = (organizationId) => {
  // console.log(organizationId)
  delVisible.value = true
  delOrganizationId.value = organizationId
}
</script>

<style scoped>
.add-btn {
  margin-bottom: 16px;
}
</style>
