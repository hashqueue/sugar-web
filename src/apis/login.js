import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/system/users/login/',
    method: 'POST',
    data
  })
}

export const register = (data) => {
  return request({
    url: '/system/users/register/',
    method: 'POST',
    data
  })
}
