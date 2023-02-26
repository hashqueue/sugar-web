<template>
  <a-card title="设备列表" class="device-list">
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
              <a-form-item name="host" label="域名或IP">
                <a-input id="filterHost" v-model:value="filterForm.host" placeholder="域名或IP" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="username" label="用户名">
                <a-input id="filterUser" v-model:value="filterForm.username" placeholder="请输入用户名" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="device_status" label="设备状态">
                <a-select
                  id="filterStatus"
                  v-model:value="filterForm.device_status"
                  placeholder="请选择设备状态"
                  :options="statusOptions"
                  :allow-clear="true"
                ></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="device_type" label="设备类型">
                <a-select
                  id="filterType"
                  v-model:value="filterForm.device_type"
                  placeholder="请选择设备类型"
                  :options="deviceTypeOptions"
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
        <a-button type="primary" @click="createDevice" v-permission="'新增设备'">新增设备</a-button>
      </template>
      <template #action="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a @click="updateDevice(record)" v-permission="'修改设备'">修改</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定删除该设备吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteDevice(record.id)"
            >
              <a v-permission="'删除设备'">删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a @click="viewDeviceAliveLogs(record)" v-permission="'修改设备'">设备探活日志</a>
          </span>
        </template>
        <template v-else-if="column.key === 'id'">#{{ record.id }}</template>
        <template v-else-if="column.key === 'creator'">{{ record.creator }} - {{ record.creator_name }}</template>
        <template v-else-if="column.key === 'modifier'">{{ record.modifier }} - {{ record.modifier_name }}</template>
        <template v-else-if="column.key === 'device_type'">{{ deviceTypes[record.device_type] }}</template>
        <template v-else-if="column.key === 'device_status'">
          <a-tag color="red" v-if="record.device_status === 0">{{ status[record.device_status] }}</a-tag>
          <a-tag color="green" v-else>{{ status[record.device_status] }}</a-tag>
        </template>
      </template>
    </standard-table>
    <a-drawer v-model:visible="deviceAliveLogVisible" width="45%">
      <h1>{{ deviceAliveLogsTitle }}</h1>
      <p style="margin-bottom: 30px">只展示最近1天(Redis存储)的设备探活日志</p>
      <a-empty v-if="deviceAliveLogs.length === 0" />
      <a-timeline v-else>
        <template v-for="(item, index) in deviceAliveLogs" :key="index">
          <a-timeline-item color="red">
            <p>{{ item.complete_time }}</p>
            <p>
              任务ID：{{ item.task_id }} -
              <a-tag :color="item.task_status === 'success' ? 'success' : 'error'">{{ item.task_status }}</a-tag>
            </p>
            <p>
              任务参数：host - <a-tag color="blue">{{ item.kwargs.host }}</a-tag
              >port - <a-tag color="blue">{{ item.kwargs.port }}</a-tag
              >username - <a-tag color="blue">{{ item.kwargs.username }}</a-tag>
            </p>
            <template v-if="item.task_status === 'success'">
              <p>
                <span>任务结果：</span
                ><span :style="{ color: item.task_result.result ? '#52c41a' : 'red' }">{{ item.task_result.msg }}</span>
              </p>
            </template>
            <template v-else>
              <p>
                <span>异常信息：</span><span style="color: red">{{ item.error }}</span>
              </p>
            </template>
          </a-timeline-item>
        </template>
      </a-timeline>
    </a-drawer>
    <device-create-update-form
      :visible="visible"
      :title="title"
      :device-id="deviceId"
      @close-modal="closeModal"
      @get-latest-data-list="getDeviceListData"
    />
  </a-card>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { deleteDeviceDetail, getDeviceList, getDeviceAliveLogList } from '@/apis/device/device'
import DeviceCreateUpdateForm from './DeviceCreateUpdateForm.vue'
import StandardTable from '@/components/table/StandardTable.vue'

const deviceId = ref(null)
const dataList = ref([])
const deviceAliveLogs = ref([])
const deviceAliveLogsTitle = ref('')
const status = { 0: '离线', 1: '在线' }
const deviceTypes = { 0: '阿里云ECS', 1: '腾讯云ECS', 2: 'Raspberry Pi(树莓派)' }
const statusOptions = [
  { value: 0, label: '离线' },
  { value: 1, label: '在线' }
]
const deviceTypeOptions = [
  { value: 0, label: '阿里云ECS' },
  { value: 1, label: '腾讯云ECS' },
  { value: 2, label: 'Raspberry Pi(树莓派)' }
]
const visible = ref(false)
const deviceAliveLogVisible = ref(false)
const title = ref('新增设备')
const deviceQueryParams = ref({})
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: '域名或IP',
    dataIndex: 'host',
    key: 'host',
    width: 200,
    fixed: 'left'
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 60
  },
  {
    title: '端口',
    dataIndex: 'port',
    key: 'port',
    width: 70
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 130
  },
  {
    title: '设备类型',
    dataIndex: 'device_type',
    key: 'device_type',
    width: 160
  },
  {
    title: '设备状态',
    dataIndex: 'device_status',
    key: 'device_status',
    width: 90
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
    width: 230,
    fixed: 'right'
  }
]

const filterFormRef = ref()
const filterForm = ref({
  username: '',
  host: '',
  device_type: null,
  device_status: null
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
      deviceQueryParams.value[valuesKey] = values[valuesKey]
    }
    // console.log(deviceQueryParams.value)
    // 删除不需要的filter字段
    for (const valueKey in deviceQueryParams.value) {
      if (valueKey in filterForm.value && !(valueKey in values)) {
        delete deviceQueryParams.value[valueKey]
      }
    }
    // console.log(deviceQueryParams.value)
    getDeviceListData()
  } else {
    message.error('请至少填写一项，再进行筛选！')
  }
  // console.log('filterForm.value', filterForm.value)
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in deviceQueryParams.value) {
      delete deviceQueryParams.value[valueKey]
    }
  }
  getDeviceListData()
}

const getDeviceListData = () => {
  getDeviceList(deviceQueryParams.value).then((res) => {
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
getDeviceListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  deviceQueryParams.value.page = pagination.current
  deviceQueryParams.value.size = pagination.pageSize
  tableLoading.value = true
  getDeviceList(deviceQueryParams.value).then((res) => {
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
const createDevice = () => {
  title.value = '新增设备'
  visible.value = true
}
const closeModal = () => {
  title.value = '新增设备'
  visible.value = false
}
const updateDevice = (record) => {
  deviceId.value = record.id
  title.value = '修改设备'
  visible.value = true
}
const viewDeviceAliveLogs = (recode) => {
  deviceAliveLogsTitle.value = recode.host
  deviceAliveLogVisible.value = true
  getDeviceAliveLogList(recode.id).then((res) => {
    deviceAliveLogs.value = res.results
  })
}
const deleteDevice = (scriptId) => {
  deleteDeviceDetail(scriptId).then(() => {
    getDeviceListData()
  })
}
</script>

<style scoped>
.device-list {
  margin-top: 20px;
}
</style>