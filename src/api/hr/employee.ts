import request from '@/utils/request/request';
import type { Employee, EmployeePageParams, PageResult } from '@/api/hr/types';

/**
 * 员工管理API
 */
const employeeApi = {
  /**
   * 分页查询员工列表
   * @param params 查询参数
   * @returns 员工列表分页数据
   */
  getEmployeePage(params: EmployeePageParams) {
    return request.get<PageResult<Employee>>('/api/240/hr/employees', {
      params,
    });
  },

  /**
   * 获取员工详情
   * @param userCode 员工工号
   * @returns 员工详情
   */
  getEmployeeByUserCode(userCode: string) {
    return request.get<Employee>(`/api/240/hr/employees/${userCode}`);
  },

  /**
   * 新增员工
   * @param data 员工信息
   * @returns 新增结果（返回userCode）
   */
  createEmployee(data: Partial<Employee>) {
    return request.post<string>('/api/240/hr/employees', data);
  },

  /**
   * 更新员工信息
   * @param userCode 员工工号
   * @param data 员工信息
   * @returns 更新结果
   */
  updateEmployee(userCode: string, data: Partial<Employee>) {
    return request.put<boolean>(`/api/240/hr/employees/${userCode}`, data);
  },

  /**
   * 删除员工
   * @param userCode 员工工号
   * @returns 删除结果
   */
  deleteEmployee(userCode: string) {
    return request.delete<boolean>(`/api/240/hr/employees/${userCode}`);
  },

  /**
   * 更新员工头像（上传文件并更新员工记录）
   * @param userCode 员工工号
   * @param file 头像文件
   * @returns 头像URL
   */
  updateAvatar(userCode: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<string>(
      `/api/240/hr/employees/${userCode}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * 更新员工证件照（上传文件并更新员工记录）
   * @param userCode 员工工号
   * @param file 证件照文件
   * @returns 证件照URL
   */
  updateIdCardPhoto(userCode: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<string>(
      `/api/240/hr/employees/${userCode}/id-card-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

export default employeeApi;
