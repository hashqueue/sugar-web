import request from '@/utils/request'

export const createTask = (data) => {
  return request({
    url: `/tasks/`,
    method: 'POST',
    data
  })
}
export const getTaskDetail = (taskId) => {
  return request({
    url: `/tasks/${taskId}/`,
    method: 'GET'
  })
}

export const updateTask = (taskId, data) => {
  return request({
    url: `/tasks/${taskId}/`,
    method: 'PUT',
    data
  })
}
export const getTaskList = (params) => {
  return request({
    url: `/tasks/`,
    method: 'GET',
    params
  })
}
export const deleteTaskDetail = (taskId) => {
  return request({
    url: `/tasks/${taskId}/`,
    method: 'DELETE'
  })
}
export const updateTaskWithPatch = (taskId, data) => {
  return request({
    url: `/tasks/${taskId}/`,
    method: 'PATCH',
    data
  })
}
export const getTaskAliveLogList = (taskId) => {
  return request({
    url: `/tasks/${taskId}/task-alive-logs/`,
    method: 'GET'
  })
}

export const fetchTaskPerfData = (taskId) => {
  return request({
    url: `/tasks/${taskId}/fetch-task-perf-data/`,
    method: 'POST'
  })
}
