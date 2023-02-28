import axios from 'axios'
import { message as antMessage } from 'ant-design-vue'
import { removeAllItem } from '@/utils/storage'
import { userStore } from '@/stores/user'
import router from '@/router'

const TOKEN_INVALID = 'Token认证失败, 请重新登录.'
const NETWORK_ERROR = '网络请求异常, 请稍后重试.'
const REQUEST_API_SUCCESS = '请求后端接口成功.'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000
})

const redirectToLogin = () => {
  removeAllItem()
  antMessage.error(TOKEN_INVALID, 6)
  router.push('/login')
}
const urlWhiteList = ['/system/users/login/', '/system/users/register/']

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (requestConfig) => {
    if (urlWhiteList.includes(requestConfig.url)) {
      return requestConfig
    }
    const userSettingStore = userStore()
    if (userSettingStore.getToken) {
      requestConfig.headers.Authorization = `Bearer ${userSettingStore.getToken}`
      return requestConfig
    } else {
      // token不存在，清除localstorage的所有数据，重定向到登录页面
      redirectToLogin()
    }
  },
  (error) => {
    console.log(error)
    antMessage.error(error.message || '请求后端接口时出现未知错误.', 6)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response) => {
    // console.log(response)
    const { code, data, message } = response.data
    // TODO 此处的业务状态码需要根据后端进行配置
    if (code === 20000 || code === 200 || response.status === 204) {
      antMessage.success(message || REQUEST_API_SUCCESS, 1)
      return data
    } else {
      // 业务错误
      antMessage.error(message || NETWORK_ERROR, 6)
      return Promise.reject(message || NETWORK_ERROR)
    }
  },
  (error) => {
    // console.log(Object.keys(error))
    // console.log(error.config)
    // console.log(error.request)
    // console.log(error.response)
    // console.log(error.isAxiosError)
    // console.log(error.toJSON)
    console.log(error)
    if (error.response.status === 401) {
      redirectToLogin()
    }
    antMessage.error(error.response.data.message || error.message, 6)
    return Promise.reject(error)
  }
)

export default service
