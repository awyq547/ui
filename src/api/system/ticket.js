import request from '@/utils/request'

// 查询车票列表
export function listTicket(query) {
  return request({
    url: '/system/ticket/list',
    method: 'get',
    params: query
  })
}

// 查询车票详细
export function getTicket(id) {
  return request({
    url: '/system/ticket/' + id,
    method: 'get'
  })
}

// 新增车票
export function addTicket(data) {
  return request({
    url: '/system/ticket',
    method: 'post',
    data: data
  })
}

// 修改车票
export function updateTicket(data) {
  return request({
    url: '/system/ticket',
    method: 'put',
    data: data
  })
}

// 删除车票
export function delTicket(id) {
  return request({
    url: '/system/ticket/' + id,
    method: 'delete'
  })
}

//校验车票
export function checkTicket(data){
  return request({
    url:'/system/ticket/checkTicket',
    method:'post',
    data:data
  })
}
