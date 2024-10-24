import request from '@/utils/request'

// 查询任务板块列表
export function listPlate(query) {
  return request({
    url: '/task/plate/list',
    method: 'get',
    params: query
  })
}

// 查询任务板块详细
export function getPlate(id) {
  return request({
    url: '/task/plate/' + id,
    method: 'get'
  })
}

// 新增任务板块
export function addPlate(data) {
  return request({
    url: '/task/plate',
    method: 'post',
    data: data
  })
}

// 修改任务板块
export function updatePlate(data) {
  return request({
    url: '/task/plate',
    method: 'put',
    data: data
  })
}

// 删除任务板块
export function delPlate(id) {
  return request({
    url: '/task/plate/' + id,
    method: 'delete'
  })
}
