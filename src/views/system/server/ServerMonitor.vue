<template>
  <a-card class="data-card" title="CPU">
    <v-chart class="chart" :option="cpuOption" />
  </a-card>
  <a-card class="data-card" title="Memory">
    <v-chart class="chart" :option="memoryOption" />
  </a-card>
  <a-card class="data-card" title="Disk">
    <v-chart class="chart" :option="diskOption" />
  </a-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { message } from 'ant-design-vue'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// import { ref, provide, onMounted, onUnmounted } from 'vue'
// import VChart, { THEME_KEY } from 'vue-echarts'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, UniversalTransition])
// provide(THEME_KEY, 'dark')
let wsPublishInterval
const webSocket = new WebSocket(`ws://${location.host}${import.meta.env.VITE_WS_BASE_URL}/server/get-performance-data/`)
const date = ref([])
// memory
const totalMemory = ref([])
const availableMemory = ref([])
const freeMemory = ref([])
const usedMemory = ref([])
const memoryPercent = ref([])
const memoryOption = ref({
  title: {
    text: 'Memory Real-Time Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Total Memory(GB)', 'Available Memory(GB)', 'Free Memory(GB)', 'Used Memory(GB)', 'Memory Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Total Memory(GB)',
      type: 'line',
      data: totalMemory.value
    },
    {
      name: 'Available Memory(GB)',
      type: 'line',
      data: availableMemory.value
    },
    {
      name: 'Free Memory(GB)',
      type: 'line',
      data: freeMemory.value
    },
    {
      name: 'Used Memory(GB)',
      type: 'line',
      data: usedMemory.value
    },
    {
      name: 'Memory Percent(%)',
      type: 'line',
      data: memoryPercent.value
    }
  ]
})
// cpu
const cpuCount = ref([])
const cpuPercent = ref([])
const cpuOption = ref({
  title: {
    text: 'CPU Real-Time Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['CPU Count(核)', 'CPU Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'CPU Count(核)',
      type: 'line',
      data: cpuCount.value
    },
    {
      name: 'CPU Percent(%)',
      type: 'line',
      data: cpuPercent.value
    }
  ]
})
//disk
const totalDisk = ref([])
const usedDisk = ref([])
const freeDisk = ref([])
const diskPercent = ref([])
const diskOption = ref({
  title: {
    text: 'Disk Real-Time Data'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Total Disk(GB)', 'Used Disk(GB)', 'Free Disk(GB)', 'Disk Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Total Disk(GB)',
      type: 'line',
      data: totalDisk.value
    },
    {
      name: 'Used Disk(GB)',
      type: 'line',
      data: usedDisk.value
    },
    {
      name: 'Free Disk(GB)',
      type: 'line',
      data: freeDisk.value
    },
    {
      name: 'Disk Percent(%)',
      type: 'line',
      data: diskPercent.value
    }
  ]
})

const removeArrFirstElementBeginPushElement = (arr, value) => {
  if (arr.length === 200) {
    arr.shift()
  }
  arr.push(value)
}

onMounted(() => {
  webSocket.onopen = (event) => {
    message.success('与server建立ws连接成功，拉取数据中...')
    wsPublishInterval = setInterval(() => {
      webSocket.send(JSON.stringify({ action: 'get-performance-data' }))
    }, 2000)
  }
  webSocket.onerror = (event) => {
    console.log('WebSocket error: ', event)
    message.error('与server建立ws连接时出错.', 5)
  }
  webSocket.onmessage = (event) => {
    // 当接收到ws server推送过来的数据时触发
    // date
    const serverData = JSON.parse(event.data).data
    const dateNow = new Date()
    const now = dateNow.toLocaleTimeString()
    removeArrFirstElementBeginPushElement(date.value, now)
    //cpu
    removeArrFirstElementBeginPushElement(cpuCount.value, serverData.cpu.cpu_count)
    removeArrFirstElementBeginPushElement(cpuPercent.value, serverData.cpu.cpu_percent)
    // memory
    removeArrFirstElementBeginPushElement(totalMemory.value, serverData.memory.total_memory)
    removeArrFirstElementBeginPushElement(availableMemory.value, serverData.memory.available_memory)
    removeArrFirstElementBeginPushElement(freeMemory.value, serverData.memory.free_memory)
    removeArrFirstElementBeginPushElement(usedMemory.value, serverData.memory.used_memory)
    removeArrFirstElementBeginPushElement(memoryPercent.value, serverData.memory.memory_percent)
    // disk
    removeArrFirstElementBeginPushElement(totalDisk.value, serverData.disk.total_disk)
    removeArrFirstElementBeginPushElement(usedDisk.value, serverData.disk.used_disk)
    removeArrFirstElementBeginPushElement(freeDisk.value, serverData.disk.free_disk)
    removeArrFirstElementBeginPushElement(diskPercent.value, serverData.disk.disk_percent)
  }
  webSocket.onclose = (event) => {
    message.info('已与server断开ws连接.', 3)
  }
})
onUnmounted(() => {
  // 关闭当前连接
  webSocket.close()
  // 取消定时器
  clearInterval(wsPublishInterval)
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 500px;
}
.data-card {
  margin-bottom: 20px;
}
</style>
