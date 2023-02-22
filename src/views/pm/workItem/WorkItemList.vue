<template>
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
            <a-form-item name="name" :label="`${workItemTypes[workItemType]}名&nbsp&nbsp`">
              <a-input v-model:value="filterForm.name" :placeholder="`请输入${workItemTypes[workItemType]}名`" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="owner" label="负&nbsp&nbsp责&nbsp&nbsp人">
              <a-input v-model:value="filterForm.owner" placeholder="请输入负责人(英文用户名)" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="desc" label="描&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp述">
              <a-input v-model:value="filterForm.desc" placeholder="请输入描述" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="creator" label="创建人">
              <a-input v-model:value="filterForm.creator" placeholder="请输入创建人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="workItemType === 2">
          <a-col :span="6">
            <a-form-item name="bug_type" label="bug类型">
              <a-select
                v-model:value="filterForm.bug_type"
                placeholder="请选择bug类型"
                :options="bugTypeOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="process_result" label="处理结果">
              <a-select
                v-model:value="filterForm.process_result"
                placeholder="请选择处理结果"
                :options="processResultOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="severity" label="严重程度">
              <a-select
                v-model:value="filterForm.severity"
                placeholder="请选择严重程度"
                :options="severityOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="6">
            <a-form-item name="status" label="状&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp态">
              <a-select
                v-model:value="filterForm.status"
                placeholder="请选择状态"
                :options="statusOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="priority" label="优&nbsp&nbsp先&nbsp&nbsp级">
              <a-select
                v-model:value="filterForm.priority"
                placeholder="请选择优先级"
                :options="priorityOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 10px" @click="resetFilterForm">重置</a-button>
        </a-form-item>
      </a-form>
      <a-divider />
      <a-button type="primary" @click="createWorkItem" v-permission="'新增工作项'">{{
        `新增${workItemTypes[workItemType]}`
      }}</a-button>
    </template>
    <template #action="{ column, record }">
      <template v-if="column.key === 'action'">
        <span>
          <a @click="updateWorkItem(record)" v-permission="'修改工作项'">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="`确定删除该${workItemTypes[workItemType]}吗？`"
            ok-text="确定"
            cancel-text="取消"
            @confirm="deleteWorkItem(record.id)"
          >
            <a v-permission="'删除工作项'">删除</a>
          </a-popconfirm>
        </span>
      </template>
      <template v-else-if="column.key === 'id'">#{{ record.id }}</template>
      <template v-else-if="column.key === 'owner'">{{ record.owner }} - {{ record.owner_name }}</template>
      <template v-else-if="column.key === 'status'">
        <a-tag color="geekblue">{{ status[record.status] }}</a-tag>
      </template>
      <template v-else-if="column.key === 'priority'">
        <template v-if="record.priority === 0">
          <a-tag color="default">{{ priority[record.priority] }}</a-tag>
        </template>
        <template v-if="record.priority === 1">
          <a-tag color="success">{{ priority[record.priority] }}</a-tag>
        </template>
        <template v-if="record.priority === 2">
          <a-tag color="processing">{{ priority[record.priority] }}</a-tag>
        </template>
        <template v-if="record.priority === 3">
          <a-tag color="warning">{{ priority[record.priority] }}</a-tag>
        </template>
        <template v-if="record.priority === 4">
          <a-tag color="error">{{ priority[record.priority] }}</a-tag>
        </template>
      </template>
    </template>
  </standard-table>
  <work-item-create-form
    v-if="sprintInfo"
    :visible="createFormVisible"
    :all-user-list="allUserDataList"
    :title="title"
    :sprint-info="sprintInfo"
    @close-modal="closeCreateFormModal"
    @get-latest-data-list="getWorkItemListData"
  />
  <work-item-update-form
    v-if="sprintInfo"
    :visible="updateFormVisible"
    :all-user-list="allUserDataList"
    :title="title"
    :sprint-info="sprintInfo"
    :workItem-id="workItemId"
    @close-modal="closeUpdateFormModal"
    @get-latest-data-list="getWorkItemListData"
  />
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { deleteWorkItemDetail, getWorkItemList } from '@/apis/pm/workItem'
import { getSprintDetail } from '@/apis/pm/sprint'
import WorkItemCreateForm from './WorkItemCreateForm.vue'
import WorkItemUpdateForm from './WorkItemUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getAllUserList } from '@/apis/system/user'
import { workItemStore } from '@/stores/workItem'
import { bugTypeOptions, processResultOptions, statusOptions, priorityOptions, severityOptions } from '@/utils/common'

const props = defineProps({
  workItemType: {
    type: Number,
    required: true,
    default: 0
  },
  sprintId: {
    type: Number,
    required: true
  }
})
const workItemId = ref(null)
const sprintInfo = ref(undefined)
const allUserDataList = ref([])
const workItemSettingStore = workItemStore()
const dataList = ref([])
const status = {
  0: '未开始',
  1: '待处理',
  2: '重新打开',
  3: '进行中',
  4: '实现中',
  5: '已完成',
  6: '修复中',
  7: '已实现',
  8: '关闭',
  9: '已修复',
  10: '已验证',
  11: '已拒绝'
}
const workItemTypes = { 0: '需求', 1: '任务', 2: '缺陷' }
const priority = { 0: '最低', 1: '较低', 2: '普通', 3: '较高', 4: '最高' }
const createFormVisible = ref(false)
const updateFormVisible = ref(false)
const title = ref(`新增${workItemTypes[props.workItemType]}`)
const workItemQueryParams = ref({ sprint_id: props.sprintId, type: props.workItemType })
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: `${workItemTypes[props.workItemType]}名`,
    dataIndex: 'name',
    key: 'name',
    width: 500,
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
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
    width: 150
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
    width: 120,
    fixed: 'right'
  }
]

const filterFormRef = ref()
const filterForm = ref({
  name: '',
  owner: '',
  desc: '',
  creator: '',
  status: null,
  priority: null,
  bug_type: null,
  process_result: null,
  severity: null
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
      workItemQueryParams.value[valuesKey] = values[valuesKey]
    }
    // console.log(workItemQueryParams.value)
    // 删除不需要的filter字段
    for (const valueKey in workItemQueryParams.value) {
      if (valueKey in filterForm.value && !(valueKey in values)) {
        delete workItemQueryParams.value[valueKey]
      }
    }
    // console.log(workItemQueryParams.value)
    getWorkItemListData()
  } else {
    message.error('请至少填写一项，再进行筛选！')
  }
  // console.log('filterForm.value', filterForm.value)
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in workItemQueryParams.value) {
      delete workItemQueryParams.value[valueKey]
    }
  }
  getWorkItemListData()
}

getSprintDetail(props.sprintId).then((res) => {
  sprintInfo.value = res
})
getAllUserList().then((res) => {
  allUserDataList.value = res.results
})

const getWorkItemListData = () => {
  getWorkItemList(workItemQueryParams.value).then((res) => {
    dataList.value = res.results
    paginationData.value = {
      total: res.count,
      current: res.current_page,
      pageSize: res.page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${res.count} 条`
    }
  })
}
getWorkItemListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  workItemQueryParams.value.page = pagination.current
  workItemQueryParams.value.size = pagination.pageSize
  tableLoading.value = true
  getWorkItemList(workItemQueryParams.value).then((res) => {
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
const createWorkItem = () => {
  title.value = `新增${workItemTypes[props.workItemType]}`
  createFormVisible.value = true
}
const closeCreateFormModal = () => {
  title.value = `新增${workItemTypes[props.workItemType]}`
  createFormVisible.value = false
}
const closeUpdateFormModal = () => {
  title.value = `修改${workItemTypes[props.workItemType]}`
  updateFormVisible.value = false
}
const updateWorkItem = (record) => {
  workItemId.value = record.id
  title.value = `修改${workItemTypes[props.workItemType]}`
  updateFormVisible.value = true
}
const deleteWorkItem = (scriptId) => {
  deleteWorkItemDetail(scriptId).then(() => {
    // 通知sprintDetail组件更新数据
    workItemSettingStore.setNeedUpdateWorkItemSummary(true)
    getWorkItemListData()
  })
}
</script>

<style scoped></style>
