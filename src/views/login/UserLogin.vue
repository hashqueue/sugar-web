<template>
  <a-spin tip="正在登录中，请稍后..." :spinning="spinning">
    <div class="base-container" ref="box">
      <div class="top">
        <div class="header">
          <img alt="logo" class="logo" src="@/assets/sugar.svg" />
          <span class="title">Sugar</span>
        </div>
        <div class="desc">一站式研发管理平台，助力企业提升研发管理效能。</div>
        <div class="desc-system">
          <div>用户名：test，密码：test3306，拥有普通用户权限</div>
          <div>用户名：admin，密码：admin3306，拥有超级管理员权限</div>
          <div>演示环境默认禁用所有数据删除权限</div>
        </div>
      </div>
      <div class="login-box">
        <a-form
          ref="loginFormRef"
          :model="loginForm"
          name="login"
          :rules="loginRules"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 10 }"
          autocomplete="off"
          @finish="onLoginFinish"
          @finishFailed="onLoginFinishFailed"
        >
          <a-form-item label="用户名" name="username">
            <a-input
              v-model:value="loginForm.username"
              size="large"
              placeholder="请输入用户名或邮箱"
              :allow-clear="true"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="密码" name="password">
            <a-input-password
              v-model:value="loginForm.password"
              size="large"
              placeholder="请输入密码"
              :allow-clear="true"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 8, span: 10 }">
            <a-button type="primary" size="large" class="login-button" html-type="submit">登录</a-button>
          </a-form-item>
        </a-form>
      </div>
      <div class="filings">
        <span>
          <a class="filings-item" href="https://beian.miit.gov.cn/" target="_blank">主体备案号：京ICP备19057126号</a>
        </span>
        <br />
        <span>
          <a class="filings-item" href="https://beian.miit.gov.cn/" target="_blank">网站备案号：京ICP备19057126号-2</a>
        </span>
      </div>
    </div>
  </a-spin>
</template>

<script setup>
import { reactive, ref, onUnmounted, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import * as THREE from 'three'
import CompObj from 'vanta/dist/vanta.fog.min' // (ripple || fog || waves)
import { login } from '@/apis/login'
import { userStore } from '@/stores/user'

//使用ref引用挂载区域
const box = ref(null)
//创建一个全局的变量来使用vanta.js
let vantaEffect = null
let pushToDashboardInterval
const userSettingStore = userStore()
const router = useRouter()
const spinning = ref(false)
const loginFormRef = ref()
const loginForm = reactive({
  username: '',
  password: ''
})
const loginRules = {
  username: [{ required: true, trigger: 'change', message: '用户名或邮箱不能为空.' }],
  password: [{ required: true, trigger: 'change', message: '密码不能为空.' }]
}

const onLoginFinish = (values) => {
  spinning.value = true
  login(values)
    .then((res) => {
      userSettingStore.setToken(res.access)
      pushToDashboardInterval = setInterval(() => {
        loginFormRef.value.resetFields()
        spinning.value = false
        router.push('/dashboard')
      }, 1000)
    })
    .catch(() => {
      spinning.value = false
    })
}

const onLoginFinishFailed = (errorInfo) => {
  message.error('输入有误.')
}

onUnmounted(() => {
  // 取消定时器
  clearInterval(pushToDashboardInterval)
})
//在两个生命周期钩子内创建vantaEffect
onMounted(() => {
  vantaEffect = CompObj({
    el: box.value,
    THREE: THREE
    //如果需要改变样式，要写在这里
    //因为这里vantaEffect是没有setOptions这个方法的
    // color: 0x16212a
  })
})

onBeforeUnmount(() => {
  if (vantaEffect) {
    vantaEffect.destroy()
  }
})
</script>

<style scoped lang="less">
.filings {
  text-align: center;
  margin-top: 280px;
  .filings-item {
    color: fade(#000, 85%);
  }
  :hover .filings-item {
    color: #1890ff;
  }
}
.base-container {
  display: flex;
  // 元素垂直显示
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  //background: #f0f2f5 url('src/assets/background.svg') no-repeat;
  background-position-x: center;
  background-position-y: 110px;
  background-size: 100%;
  @media (min-width: 768px) {
    padding: 112px 0 24px;
  }
  .top {
    text-align: center;
    .header {
      height: 44px;
      line-height: 44px;
      .logo {
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
      }
      .title {
        font-size: 33px;
        color: fade(#000, 85%);
        font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica, sans-serif;
        font-weight: 600;
        position: relative;
        top: 2px;
      }
    }
    .desc {
      font-size: 14px;
      color: fade(#000, 80%);
      margin-top: 12px;
      margin-bottom: 40px;
    }
  }
  .login-box {
    width: 800px;
    margin: 50px auto;
    .login-button {
      width: 100%;
    }
  }
}
</style>
