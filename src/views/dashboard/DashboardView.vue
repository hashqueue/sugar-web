<template>
  <a-row type="flex" justify="space-between">
    <a-col :span="12">
      <a-card class="card">
        <v-chart class="chart" :option="pieOption" />
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card class="card">
        <v-chart class="chart" :option="lineOption" />
      </a-card>
    </a-col>
  </a-row>
  <a-row type="flex" justify="space-between">
    <a-col :span="12">
      <a-card title="Python" class="card">
        <a-switch
          style="margin-bottom: 15px"
          v-model:checked="pythonEditorOptions.readOnly"
          checked-children="只读状态"
          un-checked-children="编辑状态"
        />
        <monaco-editor v-model:content-value="pythonCode" :editor-options="pythonEditorOptions"></monaco-editor>
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card title="JSON" class="card">
        <a-switch
          style="margin-bottom: 15px"
          v-model:checked="jsonEditorOptions.readOnly"
          checked-children="只读状态"
          un-checked-children="编辑状态"
        />
        <monaco-editor v-model:content-value="jsonCode" :editor-options="jsonEditorOptions"></monaco-editor>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { TitleComponent, TooltipComponent, LegendComponent, ToolboxComponent, GridComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import MonacoEditor from '@/components/MonacoEditor.vue'

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent,
  GridComponent,
  UniversalTransition
])
let dynamicInterval
const pieOption = {
  title: {
    text: 'TIOBE编程语言排行榜',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      name: 'TIOBE编程语言排行榜',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 16.66, name: 'Python' },
        { value: 16.56, name: 'C' },
        { value: 11.94, name: 'C++' },
        { value: 11.82, name: 'Java' },
        { value: 4.92, name: 'C#' },
        { value: 3.19, name: 'JavaScript' },
        { value: 1.15, name: 'Go' },
        { value: 0.68, name: 'Rust' }
      ]
    }
  ]
}
const pythonCode = ref("class Meta:\n    model = 'User'\n    fields = ('results', 'count')\n\n")
const jsonCode = ref(
  '{\n' +
    '  "username": "test",\n' +
    '  "department": null,\n' +
    '  "is_superuser": false,\n' +
    '  "email": "test@qq.com",\n' +
    '  "is_staff": false,\n' +
    '  "is_active": true,\n' +
    '  "name": "马保国",\n' +
    '  "birthday": "1952-03-16",\n' +
    '  "gender": "male",\n' +
    '  "mobile": "",\n' +
    '  "avatar": "http://127.0.0.1:8000/media/avatars/default.png",\n' +
    '  "position": "浑元形意太极拳掌门人"\n' +
    '}'
)
const pythonEditorOptions = ref({
  formatOnPaste: true,
  formatOnType: true,
  automaticLayout: true, // 自动撑开布局
  language: 'python', // 语言
  readOnly: true, // 只读
  tabSize: 2, // tab 缩进长度
  fontSize: 16, // 字体大小
  theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
  divWidth: '100%',
  divHeight: '400px',
  minimap: {
    enabled: false // 不显示代码缩略图
  }
})
const jsonEditorOptions = ref({
  formatOnPaste: true,
  formatOnType: true,
  automaticLayout: true, // 自动撑开布局
  language: 'json', // 语言
  readOnly: true, // 只读
  tabSize: 2, // tab 缩进长度
  fontSize: 16, // 字体大小
  theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
  divWidth: '100%',
  divHeight: '400px',
  minimap: {
    enabled: false // 不显示代码缩略图
  }
})
// 动态数据折线图
const randomData = () => {
  now = new Date(+now + oneDay)
  value = value + Math.random() * 21 - 10
  return {
    name: now.toString(),
    value: [[now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'), Math.round(value)]
  }
}
let data = ref([])
let now = new Date(1997, 9, 3)
let oneDay = 24 * 3600 * 1000
let value = Math.random() * 1000
for (let i = 0; i < 1000; i++) {
  data.value.push(randomData())
}
const lineOption = ref({
  title: {
    text: '动态数据折线图'
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      params = params[0]
      const date = new Date(params.name)
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1]
    },
    axisPointer: {
      animation: false
    }
  },
  xAxis: {
    type: 'time',
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    boundaryGap: [0, '100%'],
    splitLine: {
      show: false
    }
  },
  series: [
    {
      name: 'Fake Data',
      type: 'line',
      showSymbol: false,
      data: data.value
    }
  ]
})
dynamicInterval = setInterval(() => {
  for (let i = 0; i < 5; i++) {
    data.value.shift()
    data.value.push(randomData())
  }
}, 1000)
onUnmounted(() => {
  // 取消定时器
  clearInterval(dynamicInterval)
})
</script>

<style scoped>
.card {
  height: 560px;
  width: 99%;
  margin-bottom: 10px;
}
.chart {
  width: 100%;
  height: 560px;
  margin-bottom: 20px;
}
</style>
