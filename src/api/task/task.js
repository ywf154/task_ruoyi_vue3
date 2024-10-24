import request from '@/utils/request'

// 查询任务列表（待完成）
export function listTask(query) {
  return request({
    url: '/task/task/list',
    method: 'get',
    params: query
  })
}

// 查询任务列表---总表
export function listTaskAll(query) {
  return request({
    url: '/task/taskAll/',
    method: 'get',
    params: query
  })
}


// 查询任务详细
export function getTask(id) {
  return request({
    url: '/task/task/' + id,
    method: 'get'
  })
}

// 新增任务
export function addTask(data) {
  return request({
    url: '/task/task',
    method: 'post',
    data: data
  })
}

// 修改任务
export function updateTask(data) {
  return request({
    url: '/task/task',
    method: 'put',
    data: data
  })
}

// 删除任务
export function delTask(id) {
  return request({
    url: '/task/task/' + id,
    method: 'delete'
  })
}

// 完成任务
export function finishTask(id) {
  return request({
    url: '/task/task/f/' + id,
    method: 'get'
  })
}

// 取消完成任务
export function unfinishTask(id) {
  return request({
    url: '/task/task/uf/' + id,
    method: 'get'
  })
}

