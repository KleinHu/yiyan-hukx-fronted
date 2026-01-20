import request from '@/utils/request/request';
import type { Department, DepartmentTreeNode } from '@/api/hr/types';

/**
 * 部门管理API
 */
const departmentApi = {
  /**
   * 获取部门树结构
   * @returns 部门树数据
   */
  getDepartmentTree() {
    return request.get<DepartmentTreeNode[]>('/api/hr/department/tree');
  },

  /**
   * 获取指定节点的子树
   * @param deptId 部门ID
   * @returns 子树数据
   */
  getSubDepartmentTree(deptId: string) {
    return request.get<DepartmentTreeNode>(`/api/hr/department/tree/${deptId}`);
  },

  /**
   * 获取所有部门列表（扁平结构）
   * @returns 部门列表
   */
  getDepartmentList() {
    return request.get<Department[]>('/api/hr/department/list');
  },

  /**
   * 获取带统计信息的部门树（含员工数、子科室数）
   * @returns 带统计信息的部门树数据
   */
  getDepartmentTreeWithStats() {
    return request.get<DepartmentTreeNode[]>(
      '/api/hr/department/tree/with-stats'
    );
  },

  /**
   * 获取部门详情
   * @param deptId 部门ID
   * @returns 部门详情
   */
  getDepartmentById(deptId: string) {
    return request.get<Department>(`/api/hr/department/${deptId}`);
  },

  /**
   * 新增部门
   * @param data 部门信息
   * @returns 新增结果
   */
  createDepartment(data: Partial<Department>) {
    return request.post<boolean>('/api/hr/department', data);
  },

  /**
   * 更新部门信息
   * @param deptId 部门ID
   * @param data 部门信息
   * @returns 更新结果
   */
  updateDepartment(deptId: string, data: Partial<Department>) {
    return request.put<boolean>(`/api/hr/department/${deptId}`, data);
  },

  /**
   * 删除部门
   * @param deptId 部门ID
   * @returns 删除结果
   */
  deleteDepartment(deptId: string) {
    return request.delete<boolean>(`/api/hr/department/${deptId}`);
  },

  /**
   * 获取科室及其员工
   * @param deptId 部门ID
   * @param includeChildren 是否包含子科室员工
   * @returns 科室及员工信息
   */
  getDepartmentEmployees(deptId: string, includeChildren = true) {
    return request.get<any>(`/api/hr/department/${deptId}/employees`, {
      params: { includeChildren },
    });
  },

  /**
   * 获取科室及所有子科室的ID列表
   * @param deptId 部门ID
   * @returns 子科室ID列表
   */
  getAllChildDeptIds(deptId: string) {
    return request.get<string[]>(`/api/hr/department/${deptId}/children-ids`);
  },

  /**
   * 获取科室路径
   * @param deptId 部门ID
   * @returns 科室路径信息
   */
  getDepartmentPath(deptId: string) {
    return request.get<any>(`/api/hr/department/${deptId}/path`);
  },

  /**
   * 根据员工工号获取其科室路径
   * @param userCode 员工工号
   * @returns 科室路径信息
   */
  getDepartmentPathByUserCode(userCode: string) {
    return request.get<any>(`/api/hr/department/path/by-user/${userCode}`);
  },
};

export default departmentApi;
