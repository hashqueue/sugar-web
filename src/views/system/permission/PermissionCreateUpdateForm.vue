<template>
  <standard-modal
    :modal-visible="visible"
    :modal-width="650"
    :modal-title="title"
    :modal-ok-text="'提交'"
    :modal-cancel-text="'取消'"
    @on-modal-ok="onOk"
    @on-modal-cancel="onCancel"
  >
    <template #form>
      <a-form
        ref="createUpdateFormRef"
        :model="createUpdateForm"
        :rules="createUpdateRules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item name="title" label="权限名称">
          <a-input v-model:value="createUpdateForm.title" placeholder="请输入权限名称" />
        </a-form-item>
        <a-form-item name="is_menu" label="是否菜单">
          <a-switch v-model:checked="createUpdateForm.is_menu" />
        </a-form-item>
        <a-form-item name="icon" label="图标" v-show="createUpdateForm.is_menu === true">
          <a-input
            v-model:value="createUpdateForm.icon"
            placeholder="请输入图标code(详见Ant Design Vue官网中图标组件)"
          />
        </a-form-item>
        <a-form-item name="component" label="组件路径" v-show="createUpdateForm.is_menu === true">
          <a-textarea
            v-model:value="createUpdateForm.component"
            auto-size
            placeholder="请输入组件路径(@/layout/BasicLayout.vue)"
          />
        </a-form-item>
        <a-form-item name="path" label="路由path" v-show="createUpdateForm.is_menu === true">
          <a-input v-model:value="createUpdateForm.path" placeholder="请输入路由path(/systems)" />
        </a-form-item>
        <a-form-item name="redirect" label="路由重定向path" v-show="createUpdateForm.is_menu === true">
          <a-input v-model:value="createUpdateForm.redirect" placeholder="请输入路由重定向path(/servicesMonitor)" />
        </a-form-item>
        <a-form-item name="url_path" label="请求路径" v-show="createUpdateForm.is_menu === false">
          <a-input v-model:value="createUpdateForm.url_path" placeholder="请输入请求路径(部分请求路径需添加正则)" />
        </a-form-item>
        <a-form-item name="method" label="请求方法" v-show="createUpdateForm.is_menu === false">
          <a-select v-model:value="createUpdateForm.method" placeholder="请选择请求方法" :options="methodOptions">
          </a-select>
        </a-form-item>
        <a-form-item name="is_visible" label="是否显示" v-show="createUpdateForm.is_menu === true">
          <a-switch v-model:checked="createUpdateForm.is_visible" />
        </a-form-item>
        <a-form-item name="parent" label="父权限" v-if="title !== '新增根权限'">
          <a-select
            v-model:value="createUpdateForm.parent"
            show-search
            placeholder="输入权限名称以进行(模糊)搜索"
            :default-active-first-option="false"
            :show-arrow="true"
            :filter-option="false"
            :options="parentOptions"
            @search="handleSearch"
            @change="handleChange"
          ></a-select>
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getPermissionList, createPermission, updatePermission, getPermissionDetail } from '@/apis/system/permission'
import { isSelectOptionsIncludeItemData } from '@/utils/common'
import StandardModal from '@/components/StandardModal.vue'

const props = defineProps({
  permissionId: {
    type: [Number, null],
    required: false
  },
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['closeModal', 'getLatestPermissionList'])
const createUpdateForm = ref({
  title: '',
  is_menu: true,
  method: undefined,
  url_path: '',
  icon: '',
  component: '',
  path: '',
  redirect: '',
  is_visible: true,
  parent: undefined
})
const createUpdateFormRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 20 }
const methodOptions = ref([
  {
    value: 'POST',
    label: 'POST'
  },
  {
    value: 'DELETE',
    label: 'DELETE'
  },
  {
    value: 'PUT',
    label: 'PUT'
  },
  {
    value: 'PATCH',
    label: 'PATCH'
  },
  {
    value: 'GET',
    label: 'GET'
  }
])
const parentOptions = ref([])
const createUpdateRules = {
  title: [
    { required: true, trigger: 'change', message: '权限名称不能为空!' },
    { max: 64, trigger: 'change', message: '权限名称不能多于64位!' }
  ],
  is_menu: [{ required: true, trigger: 'change', message: '是否为菜单不能为空!' }],
  icon: [{ max: 64, trigger: 'change', message: '图标不能多于64位!' }],
  component: [{ max: 256, trigger: 'change', message: '组件路径不能多于256位!' }],
  path: [{ max: 256, trigger: 'change', message: '路由path不能多于256位!' }],
  redirect: [{ max: 256, trigger: 'change', message: '路由重定向path不能多于256位!' }],
  url_path: [{ max: 256, trigger: 'change', message: '请求路径不能多于256位!' }]
}

getPermissionList({ page: 1, size: 50 }).then((res) => {
  let currentOrgans = []
  for (const originOrgan of res.results) {
    currentOrgans.push({
      label: `${originOrgan.title} - ${originOrgan.is_menu ? '菜单' : 'API'}`,
      value: originOrgan.id
    })
  }
  parentOptions.value = currentOrgans
})

watch(
  () => props.visible,
  (newValue, oldValue) => {
    if (props.title !== '新增根权限') {
      getPermissionDetail(props.permissionId).then((res) => {
        if (props.title === '添加子权限') {
          if (!isSelectOptionsIncludeItemData(parentOptions.value, res.id, 'value')) {
            parentOptions.value.push({ label: `${res.title} - ${res.is_menu ? '菜单' : 'API'}`, value: res.id })
          }
          createUpdateForm.value = {
            title: '',
            is_menu: true,
            method: undefined,
            url_path: '',
            icon: '',
            component: '',
            path: '',
            redirect: '',
            is_visible: true,
            parent: res.id
          }
        } else if (props.title === '修改权限') {
          if (res.parent !== null) {
            if (!isSelectOptionsIncludeItemData(parentOptions.value, res.parent.id, 'value')) {
              parentOptions.value.push({
                label: `${res.parent.title} - ${res.parent.is_menu ? '菜单' : 'API'}`,
                value: res.parent.id
              })
            }
            createUpdateForm.value = {
              title: res.title,
              is_menu: res.is_menu,
              method: res.method,
              url_path: res.url_path,
              icon: res.icon,
              component: res.component,
              path: res.path,
              redirect: res.redirect,
              is_visible: res.is_visible,
              parent: res.parent.id
            }
          } else {
            createUpdateForm.value = {
              title: res.title,
              is_menu: res.is_menu,
              method: res.method,
              url_path: res.url_path,
              icon: res.icon,
              component: res.component,
              path: res.path,
              redirect: res.redirect,
              is_visible: res.is_visible,
              parent: undefined
            }
          }
        }
      })
    }
  }
)
const handleSearch = (val) => {
  getPermissionList({ title: val }).then((res) => {
    let tmp = []
    for (const originPermission of res.results) {
      tmp.push({
        label: `${originPermission.title} - ${originPermission.is_menu ? '菜单' : 'API'}`,
        value: originPermission.id
      })
    }
    parentOptions.value = tmp
  })
}

const handleChange = (val) => {
  createUpdateForm.value.parent = val
}
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改权限') {
        updatePermission(props.permissionId, values).then(() => {
          // 重新获取一遍权限信息
          emit('getLatestPermissionList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createPermission(values).then(() => {
          emit('getLatestPermissionList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      }
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onCancel = () => {
  createUpdateFormRef.value.resetFields()
  emit('closeModal')
}
</script>

<style scoped></style>
