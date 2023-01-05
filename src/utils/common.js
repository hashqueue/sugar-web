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
    if (treeObj[key]['meta']['parentId'] !== null) {
      const pid = treeObj[key]['meta']['parentId']
      const parent_data = treeObj[pid]
      parent_data.children.push(treeObj[key])
    } else {
      treeObj[key].children = []
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
