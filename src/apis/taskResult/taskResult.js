import request from '@/utils/request'

export const createTaskResult = (data) => {
  return request({
    url: `/tasks-results/`,
    method: 'POST',
    data
  })
}
export const getTaskResultDetail = (taskId) => {
  return request({
    url: `/tasks-results/${taskId}/`,
    method: 'GET'
  })
}

export const updateTaskResult = (taskId, data) => {
  return request({
    url: `/tasks-results/${taskId}/`,
    method: 'PUT',
    data
  })
}
export const getTaskResultList = (params) => {
  return request({
    url: `/tasks-results/`,
    method: 'GET',
    params
  })
}
export const deleteTaskResultDetail = (taskId) => {
  return request({
    url: `/tasks-results/${taskId}/`,
    method: 'DELETE'
  })
}
export const updateTaskResultWithPatch = (taskId, data) => {
  return request({
    url: `/tasks-results/${taskId}/`,
    method: 'PATCH',
    data
  })
}
