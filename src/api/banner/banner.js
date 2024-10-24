import request from '@/utils/request'

// 查询横幅列表
export function listBanner(query) {
  return request({
    url: '/banner/banner/list',
    method: 'get',
    params: query
  })
}

// 查询横幅详细
export function getBanner(id) {
  return request({
    url: '/banner/banner/' + id,
    method: 'get'
  })
}

// 新增横幅
export function addBanner(data) {
  return request({
    url: '/banner/banner',
    method: 'post',
    data: data
  })
}

// 修改横幅
export function updateBanner(data) {
  return request({
    url: '/banner/banner',
    method: 'put',
    data: data
  })
}

// 删除横幅
export function delBanner(id) {
  return request({
    url: '/banner/banner/' + id,
    method: 'delete'
  })
}
