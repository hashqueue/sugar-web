import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/system/user/login/',
    method: 'POST',
    data
  })
}

export const register = (data) => {
  return request({
    url: '/system/user/register/',
    method: 'POST',
    data
  })
}
