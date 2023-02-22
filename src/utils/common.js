import axios from 'axios'

/**
 * 生成权限树列表
 * @param originTreeData 原始树列表数据
 * @param originTreeDataType 需要转换的类型
 * @returns {*[]}
 */
export const generateObjectTreeData = (originTreeData, originTreeDataType) => {
  const treeData = []
  for (const item of originTreeData) {
    const tmpData = {}
    if (originTreeDataType === 'organization') {
      if (item.name && item.id) {
        tmpData.value = item.id
        tmpData.title = item.name
        if (item.children) {
          tmpData.children = generateObjectTreeData(item.children, 'organization')
        }
        treeData.push(tmpData)
      }
    } else if (originTreeDataType === 'permission') {
      if (item.title && item.id) {
        tmpData.key = item.id
        tmpData.title = item.title
        tmpData.is_menu = item.is_menu
        if (item.children) {
          tmpData.children = generateObjectTreeData(item.children, 'permission')
        }
        treeData.push(tmpData)
      }
    }
  }
  return treeData
}

/**
 * 将路由原始数据转化为vue-router可用的数据，添加路由懒加载
 * @param originData
 * @param key
 * @returns {{}}
 */
const convertRouteData = (originData, key) => {
  const modules = import.meta.glob(['../views/**/*.vue', '../layout/**/*.vue'])
  const tmpParent = {}
  tmpParent.path = originData[key]['path']
  tmpParent.name = originData[key]['path']
  tmpParent.component = modules[originData[key]['component'].replace('@', '..')]
  if (originData[key]['redirect'] !== '') {
    tmpParent.redirect = originData[key]['redirect']
  }
  tmpParent.meta = {}
  tmpParent['meta']['title'] = originData[key]['title']
  tmpParent['meta']['icon'] = originData[key]['icon']
  tmpParent['meta']['is_visible'] = originData[key]['is_visible']
  return tmpParent
}
/**
 * 生成树结构的路由表
 * @param originDataArr
 * @returns {*[]}
 */
export const generateRouteTreeData = (originDataArr) => {
  const treeObj = {}
  const treeMenuData = []
  const otherMenu = []
  for (const item of originDataArr) {
    if (item['meta']['id']) {
      treeObj[item['meta']['id']] = item
    } else {
      otherMenu.push(item)
    }
  }
  for (const key of Object.keys(treeObj)) {
    treeObj[key].children = []
    if (treeObj[key]['meta']['parentId'] !== null) {
      const pid = treeObj[key]['meta']['parentId']
      const parent_data = treeObj[pid]
      parent_data.children.push(treeObj[key])
    } else {
      treeMenuData.push(treeObj[key])
    }
  }
  // return otherMenu
  return [...otherMenu, ...treeMenuData]
}

/**
 * 生成路由表数据(非树结构),组件设置路由懒加载
 * @param originDataArr
 * @returns {*[]}
 */
export const generateRouteData = (originDataArr) => {
  const treeObj = {}
  const treeMenuData = []
  for (const item of originDataArr) {
    treeObj[item.id] = item
  }
  for (const key of Object.keys(treeObj)) {
    if (treeObj[key]['parent'] !== null) {
      const pid = treeObj[key]['parent']
      const parent_data = treeObj[pid]
      const tmpChildren = convertRouteData(treeObj, key)
      tmpChildren.meta.parent = parent_data.path
      tmpChildren.meta.id = treeObj[key]['id']
      tmpChildren.meta.parentId = parent_data['id']
      treeMenuData.push(tmpChildren)
    } else {
      const tmpParent = convertRouteData(treeObj, key)
      tmpParent.meta.parent = null
      tmpParent.meta.parentId = null
      tmpParent.meta.id = treeObj[key]['id']
      treeMenuData.push(tmpParent)
    }
  }
  // console.log(treeMenuData)
  return treeMenuData
}

export const isSelectOptionsIncludeItemData = (originOptions, data, OriginOptionsKey) => {
  let result = false
  for (const originOption of originOptions) {
    if (data === originOption[OriginOptionsKey]) {
      result = true
    }
  }
  return result
}

export const downloadFile = (url, fileName) => {
  axios
    .get(url, { responseType: 'blob' })
    .then((res) => {
      const blob = new Blob([res.data])
      const tmpLink = document.createElement('a')
      tmpLink.href = window.URL.createObjectURL(blob)
      tmpLink.download = fileName
      tmpLink.click()
      window.URL.revokeObjectURL(tmpLink.href)
    })
    .catch((error) => {
      console.log(error)
    })
}

export const processResultOptions = [
  { value: 0, label: '不予处理' },
  { value: 1, label: '延期处理' },
  { value: 2, label: '外部原因' },
  { value: 3, label: '需求变更' },
  { value: 4, label: '转需求' },
  { value: 5, label: '挂起' },
  { value: 6, label: '设计如此' },
  { value: 7, label: '重复缺陷' },
  { value: 8, label: '无法重现' }
]
export const statusOptions = [
  { value: 0, label: '未开始' },
  { value: 1, label: '待处理' },
  { value: 2, label: '重新打开' },
  { value: 3, label: '进行中' },
  { value: 4, label: '实现中' },
  { value: 5, label: '已完成' },
  { value: 6, label: '修复中' },
  { value: 7, label: '已实现' },
  { value: 8, label: '关闭' },
  { value: 9, label: '已修复' },
  { value: 10, label: '已验证' },
  { value: 11, label: '已拒绝' }
]
export const priorityOptions = [
  { value: 0, label: '最低' },
  { value: 1, label: '较低' },
  { value: 2, label: '普通' },
  { value: 3, label: '较高' },
  { value: 4, label: '最高' }
]
export const bugTypeOptions = [
  { value: 0, label: '功能问题' },
  { value: 1, label: '性能问题' },
  { value: 2, label: '接口问题' },
  { value: 3, label: '安全问题' },
  { value: 4, label: 'UI界面问题' },
  { value: 5, label: '易用性问题' },
  { value: 6, label: '兼容问题' },
  { value: 7, label: '数据问题' },
  { value: 8, label: '逻辑问题' },
  { value: 9, label: '需求问题' }
]
export const severityOptions = [
  { value: 0, label: '保留' },
  { value: 1, label: '建议' },
  { value: 2, label: '提示' },
  { value: 3, label: '一般' },
  { value: 4, label: '严重' },
  { value: 5, label: '致命' }
]
