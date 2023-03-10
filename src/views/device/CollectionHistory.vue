<template>
  <a-card :title="`设备 ${route.query.deviceHost} 采集性能数据历史记录`" class="device-list">
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
        <template v-if="column.key === 'task_status'">
          <a-tag color="warning" v-if="record.task_status === 0">{{ taskStatus[record.task_status] }}</a-tag>
          <a-tag color="processing" v-else-if="record.task_status === 2">{{ taskStatus[record.task_status] }}</a-tag>
          <a-tag color="success" v-else-if="record.task_status === 3">{{ taskStatus[record.task_status] }}</a-tag>
          <a-tag color="error" v-else-if="record.task_status === 4">{{ taskStatus[record.task_status] }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <span>
            <a-button
              @click="getPerfDataDetail(record)"
              type="link"
              :disabled="!record.result || !record.result.status"
              v-permission="'查询设备性能数据详情'"
              >数据详情</a-button
            >
          </span>
        </template>
        <template v-else-if="column.key === 'result'"
          ><a-tag :color="taskResultsStatusColor(record)">{{ taskResultsStatusText(record) }}</a-tag></template
        >
        <template v-else-if="column.key === 'creator'">{{ record.creator }} - {{ record.creator_name }}</template>
      </template>
    </standard-table>
  </a-card>
  <a-drawer v-model:visible="perfDataDetailVisible" :title="perfDataDetailDrawerTitle" height="85%" placement="bottom">
    <a-card :title="route.query.deviceHost">
      <a-descriptions title="主机信息">
        <a-descriptions-item label="Host">{{ route.query.deviceHost }}</a-descriptions-item>
        <a-descriptions-item label="主机名">{{ deviceInfo.hostInfo.hostname }}</a-descriptions-item>
        <a-descriptions-item label="OS">{{ deviceInfo.hostInfo.os }}</a-descriptions-item>
        <a-descriptions-item label="OS平台">{{ deviceInfo.hostInfo.platform }}</a-descriptions-item>
        <a-descriptions-item label="OS平台版本">{{ deviceInfo.hostInfo.platformVersion }}</a-descriptions-item>
        <a-descriptions-item label="OS平台所属系列">{{ deviceInfo.hostInfo.platformFamily }}</a-descriptions-item>
        <a-descriptions-item label="内核架构">{{ deviceInfo.hostInfo.kernelArch }}</a-descriptions-item>
        <a-descriptions-item label="内核版本">{{ deviceInfo.hostInfo.kernelVersion }}</a-descriptions-item>
        <a-descriptions-item label="已运行时间">{{ deviceInfo.hostInfo.uptime }}</a-descriptions-item>
        <a-descriptions-item label="CPU型号">{{ deviceInfo.cpuInfo.modelName }}</a-descriptions-item>
        <a-descriptions-item label="物理CPU个数">{{ deviceInfo.cpuInfo.physicalCoresCount }}</a-descriptions-item>
        <a-descriptions-item label="逻辑CPU个数">{{ deviceInfo.cpuInfo.logicalCoresCount }}</a-descriptions-item>
      </a-descriptions>
      <a-divider />
      <v-chart class="chart" :option="cpuOption" />
      <a-divider />
      <v-chart class="chart" :option="loadOption" />
      <a-divider />
      <v-chart class="chart" :option="memOption" />
      <a-divider />
      <v-chart class="chart" :option="diskOption" />
    </a-card>
  </a-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import StandardTable from '@/components/table/StandardTable.vue'
import { getTaskResultList, getTaskResultDetail } from '@/apis/taskResult/taskResult'
import { taskResultsStatusOptions } from '@/utils/common'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, UniversalTransition])

const taskResultsStatusText = (record) => {
  if (record.result) {
    if (record.result.status) {
      return '成功'
    } else if (record.result.status === false) {
      return '失败'
    }
  } else {
    return '未知'
  }
}
const taskResultsStatusColor = (record) => {
  if (record.result) {
    if (record.result.status) {
      return 'success'
    } else if (record.result.status === false) {
      return 'error'
    }
  } else {
    return 'processing'
  }
}

const route = useRoute()
const router = useRouter()
const devicePerfData = ref([])
const deviceInfo = ref({})
const dataList = ref([])
const tableLoading = ref(false)
const perfDataDetailVisible = ref(false)
const perfDataDetailDrawerTitle = ref('')
const paginationData = ref({})
const columns = [
  {
    title: '任务ID',
    dataIndex: 'task_uuid',
    key: 'task_uuid',
    width: 270,
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
const taskResultsOptions = [
  { value: 0, label: '失败' },
  { value: 1, label: '成功' }
]
const taskStatus = {}
const taskResultQueryParams = ref({ device_id: route.query.deviceId, task_type: 0 })
const filterFormRef = ref()
const filterForm = ref({
  task_uuid: '',
  task_status: null,
  result: null
})
for (const item of taskResultsStatusOptions) {
  taskStatus[item.value] = item.label
}
// echarts
const timeStampAxisData = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.timeStamp)
  }
  return data
})
// cpu
const cpuPercent = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.cpuPercent)
  }
  return data
})
const cpuOption = ref({
  title: {
    text: 'CPU Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['CPU Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: timeStampAxisData
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'CPU Percent(%)',
      type: 'line',
      data: cpuPercent
    }
  ]
})
// mem
const memUsedPercent = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.usedPercent)
  }
  return data
})
const memFree = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.free)
  }
  return data
})
const memUsed = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.used)
  }
  return data
})
const memTotal = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.total)
  }
  return data
})
const memCached = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.cached)
  }
  return data
})
const memAvailable = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.memInfo.available)
  }
  return data
})
const memOption = ref({
  title: {
    text: 'Memory Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: [
      'Memory Used Percent(%)',
      'Memory Free(GB)',
      'Memory Used(GB)',
      'Memory Total(GB)',
      'Memory Cached(GB)',
      'Memory Available(GB)'
    ]
  },
  xAxis: {
    type: 'category',
    data: timeStampAxisData
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Memory Used Percent(%)',
      type: 'line',
      data: memUsedPercent
    },
    {
      name: 'Memory Free(GB)',
      type: 'line',
      data: memFree
    },
    {
      name: 'Memory Used(GB)',
      type: 'line',
      data: memUsed
    },
    {
      name: 'Memory Total(GB)',
      type: 'line',
      data: memTotal
    },
    {
      name: 'Memory Cached(GB)',
      type: 'line',
      data: memCached
    },
    {
      name: 'Memory Available(GB)',
      type: 'line',
      data: memAvailable
    }
  ]
})
// disk
const diskUsedPercent = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.diskInfo.usedPercent)
  }
  return data
})
const diskFree = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.diskInfo.free)
  }
  return data
})
const diskUsed = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.diskInfo.used)
  }
  return data
})
const diskTotal = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.diskInfo.total)
  }
  return data
})
const diskOption = ref({
  title: {
    text: 'Disk Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Disk Percent(%)', 'Disk Free(GB)', 'Disk Used(GB)', 'Disk Total(GB)']
  },
  xAxis: {
    type: 'category',
    data: timeStampAxisData
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Disk Percent(%)',
      type: 'line',
      data: diskUsedPercent
    },
    {
      name: 'Disk Free(GB)',
      type: 'line',
      data: diskFree
    },
    {
      name: 'Disk Used(GB)',
      type: 'line',
      data: diskUsed
    },
    {
      name: 'Disk Total(GB)',
      type: 'line',
      data: diskTotal
    }
  ]
})
// load
const load1 = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.loadInfo.load1)
  }
  return data
})
const load5 = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.loadInfo.load5)
  }
  return data
})
const load15 = computed(() => {
  const data = []
  for (const item of devicePerfData.value) {
    data.push(item.loadInfo.load15)
  }
  return data
})
const loadOption = ref({
  title: {
    text: 'Load Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Load1', 'Load5', 'Load15']
  },
  xAxis: {
    type: 'category',
    data: timeStampAxisData
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Load1',
      type: 'line',
      data: load1
    },
    {
      name: 'Load5',
      type: 'line',
      data: load5
    },
    {
      name: 'Load15',
      type: 'line',
      data: load15
    }
  ]
})

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
const getPerfDataDetail = (record) => {
  getTaskResultDetail(record.task_uuid).then((res) => {
    perfDataDetailVisible.value = true
    devicePerfData.value = res.result.data.perfData
    deviceInfo.value = res.result.data.properties
  })
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 500px;
  margin-bottom: 20px;
}
</style>
