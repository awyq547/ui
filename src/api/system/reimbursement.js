import request from '@/utils/request'

// 查询reimbursement列表
export function listReimbursement(query) {
  return request({
    url: '/system/reimbursement/list',
    method: 'get',
    params: query
  })
}

// 查询reimbursement详细
export function getReimbursement(id) {
  return request({
    url: '/system/reimbursement/' + id,
    method: 'get'
  })
}

// 新增reimbursement
export function addReimbursement(data) {
  return request({
    url: '/system/reimbursement',
    method: 'post',
    data: data
  })
}

// 修改reimbursement
export function updateReimbursement(data) {
  return request({
    url: '/system/reimbursement',
    method: 'put',
    data: data
  })
}

// 删除reimbursement
export function delReimbursement(id) {
  return request({
    url: '/system/reimbursement/' + id,
    method: 'delete'
  })
}


//获取报销单车票
export function getname(id) {
  return request({
    url: '/system/ticket/getname',
    method: 'get'
  })
}

//驳回请求
export function checkNo(data){
  return request({
    url: '/system/reimbursement/checkNo',
    method: 'post',
    data: data
  })
}
//待办事项
export function getmsg(){
  return request({
    url:'/system/reimbursement/getmsg',
    method:'get'
  })
}

export function getRole(){
  return request({
    url:'/system/reimbursement/getRole',
    method:'get'
  })
}
