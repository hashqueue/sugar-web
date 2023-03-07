<template>
  <a-card :title="`设备 ${deviceData.host} 采集性能数据历史记录`" class="device-list">
    <standard-table
      :data-source="dataList"
      :columns="columns"
      :row-key="'task_uuid'"
      :scroll="{ x: '100%' }"
      :loading="tableLoading"
      :pagination="paginationData"
      @on-page-change="onPageChange"
    >
      <template #tableFilter>
        <a-form ref="filterFormRef" :model="filterForm" :wrapper-col="{ span: 18 }" @finish="handleFilterFinish">
          <a-row>
            <a-col :span="8">
              <a-form-item name="task_uuid" label="任务ID">
                <a-input id="filterTaskUUID" v-model:value="filterForm.task_uuid" placeholder="任务ID" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="task_status" label="任务状态">
                <a-select
                  id="filterTaskStatus"
                  v-model:value="filterForm.task_status"
                  placeholder="请选择任务状态"
                  :options="taskResultsStatusOptions"
                  :allow-clear="true"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="result" label="任务结果">
                <a-select
                  id="filterTaskResults"
                  v-model:value="filterForm.result"
                  placeholder="请选择任务执行结果"
                  :options="taskResultsOptions"
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
        <a-button @click="returnToDeviceList" type="primary">返回设备列表</a-button>
      </template>
      <template #action="{ column, record }">
        <template v-if="column.key === 'action'"></template>
        <template v-else-if="column.key === 'result'"
          ><a-tag :color="record.result.status ? 'success' : 'error'">{{
            record.result.status ? '成功' : '失败'
          }}</a-tag></template
        >
        <template v-else-if="column.key === 'task_status'">{{ taskStatus[record.task_status] }}</template>
        <template v-else-if="column.key === 'creator'">{{ record.creator }} - {{ record.creator_name }}</template>
      </template>
    </standard-table>
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getTaskResultList } from '@/apis/taskResult/taskResult'
import { getDeviceDetail } from '@/apis/device/device'
import { taskResultsStatusOptions } from '@/utils/common'

const route = useRoute()
const router = useRouter()
const dataList = ref([])
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: '任务ID',
    dataIndex: 'task_uuid',
    key: 'task_uuid',
    width: 250,
    fixed: 'left'
  },
  {
    title: '任务状态',
    dataIndex: 'task_status',
    key: 'task_status',
    width: 110
  },
  {
    title: '任务结果',
    dataIndex: 'result',
    key: 'result',
    width: 80
  },
  {
    title: '任务耗时',
    dataIndex: 'time_duration',
    key: 'time_duration',
    width: 170
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
    width: 150,
    fixed: 'right'
  }
]
const deviceData = ref({})
const taskResultsOptions = [
  { value: 0, label: '失败' },
  { value: 1, label: '成功' }
]
const taskStatus = {}
const taskResultQueryParams = ref({ device_id: route.params.deviceId, task_type: 0 })
const filterFormRef = ref()
const filterForm = ref({
  task_uuid: '',
  task_status: null,
  result: null
})
getDeviceDetail(route.params.deviceId).then((res) => {
  deviceData.value = res
})
for (const item of taskResultsStatusOptions) {
  taskStatus[item.value] = item.label
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in taskResultQueryParams.value) {
      delete taskResultQueryParams.value[valueKey]
    }
  }
  getTaskResultListData()
}
const getTaskResultListData = () => {
  getTaskResultList(taskResultQueryParams.value).then((res) => {
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
getTaskResultListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  taskResultQueryParams.value.page = pagination.current
  taskResultQueryParams.value.size = pagination.pageSize
  tableLoading.value = true
  getTaskResultList(taskResultQueryParams.value).then((res) => {
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
      taskResultQueryParams.value[valuesKey] = values[valuesKey]
    }
    // 删除不需要的filter字段
    for (const valueKey in taskResultQueryParams.value) {
      if (valueKey in filterForm.value && !(valueKey in values)) {
        delete taskResultQueryParams.value[valueKey]
      }
    }
    getTaskResultListData()
  } else {
    message.error('请至少填写一项，再进行筛选！')
  }
  // console.log('filterForm.value', filterForm.value)
}
const returnToDeviceList = () => {
  router.push({ name: '/dm/devices/list' })
}
</script>

<style scoped></style>
