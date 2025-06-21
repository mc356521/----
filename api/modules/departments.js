import request from '@/utils/request';

// 获取所有院系列表
export function getDepartmentsList() {
    return request({
        url: '/departments/all',
        method: 'get'
    });
}

// 根据ID获取院系信息
export function getDepartmentById(id) {
    return request({
        url: `/departments/${id}`,
        method: 'get'
    });
}