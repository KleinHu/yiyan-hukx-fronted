import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import employeeApi from '@/api/hr/employee';
import type {
  Employee,
  EmployeePageParams,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
} from '@/api/hr/types';

/**
 * 员工管理 Hook
 * @param options 配置选项
 * @returns 员工相关数据和方法
 */
function useEmployeeList(options?: {
  autoLoad?: boolean; // 是否自动加载
  filterStatus?: number; // 过滤状态（如：2-正式员工）
  pageSize?: number; // 每页数量，默认1000（获取所有）
}) {
  const { autoLoad = true, filterStatus, pageSize = 1000 } = options || {};

  const employeeList = ref<Employee[]>([]);
  const loading = ref(false);
  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  /**
   * 获取员工列表（分页）
   * @param params 查询参数（可选，会与默认参数合并）
   * @param usePagination 是否使用分页，默认false（获取所有）
   */
  const fetchEmployeeList = async (
    params?: Partial<EmployeePageParams>,
    usePagination = false
  ) => {
    try {
      loading.value = true;
      const queryParams: EmployeePageParams = {
        pageNum: usePagination ? pagination.value.current : 1,
        pageSize: usePagination ? pagination.value.pageSize : pageSize,
        ...params,
      };

      // 如果指定了过滤状态，添加到查询参数
      if (filterStatus !== undefined && !params?.status) {
        queryParams.status = filterStatus;
      }

      const { data } = await employeeApi.getEmployeePage(queryParams);
      if (data) {
        if (usePagination) {
          employeeList.value = data.list || [];
          pagination.value.total = data.total || 0;
        } else {
          employeeList.value = data.list || [];
        }
      }
    } catch (error) {
      Message.error('获取员工列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取员工详情
   * @param userCode 员工工号
   * @returns 员工详情
   */
  const fetchEmployeeDetail = async (
    userCode: string
  ): Promise<Employee | null> => {
    try {
      loading.value = true;
      const { data } = await employeeApi.getEmployeeByUserCode(userCode);
      return data || null;
    } catch (error) {
      Message.error('获取员工详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增员工
   * @param data 员工信息
   * @returns 新增的员工工号
   */
  const createEmployee = async (
    data: Partial<EmployeeCreateRequest>
  ): Promise<string | null> => {
    try {
      loading.value = true;
      const { data: userCode } = await employeeApi.createEmployee(data);
      Message.success('新增员工成功');
      return userCode || null;
    } catch (error) {
      Message.error('新增员工失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新员工信息
   * @param userCode 员工工号
   * @param data 员工信息
   * @returns 是否成功
   */
  const updateEmployee = async (
    userCode: string,
    data: Partial<EmployeeUpdateRequest>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeApi.updateEmployee(userCode, data);
      Message.success('更新员工信息成功');
      // 刷新列表
      await fetchEmployeeList();
      return true;
    } catch (error) {
      Message.error('更新员工信息失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除员工
   * @param userCode 员工工号
   * @returns 是否成功
   */
  const deleteEmployee = async (userCode: string): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeApi.deleteEmployee(userCode);
      Message.success('删除员工成功');
      // 刷新列表
      await fetchEmployeeList();
      return true;
    } catch (error) {
      Message.error('删除员工失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据工号查找员工（从本地列表）
   * @param userCode 员工工号
   * @returns 员工信息
   */
  const getEmployeeByCode = (userCode: string): Employee | undefined => {
    return employeeList.value.find((e) => e.userCode === userCode);
  };

  /**
   * 根据姓名查找员工（支持模糊匹配）
   * @param userName 员工姓名
   * @returns 员工列表
   */
  const getEmployeesByName = (userName: string): Employee[] => {
    if (!userName) return [];
    return employeeList.value.filter((e) => e.userName?.includes(userName));
  };

  /**
   * 根据部门ID查找员工
   * @param departmentId 部门ID
   * @returns 员工列表
   */
  const getEmployeesByDepartment = (departmentId: string): Employee[] => {
    if (!departmentId) return [];
    return employeeList.value.filter((e) => e.departmentId === departmentId);
  };

  /**
   * 根据职级ID查找员工
   * @param rankId 职级ID
   * @returns 员工列表
   */
  const getEmployeesByRank = (rankId: string): Employee[] => {
    if (!rankId) return [];
    return employeeList.value.filter((e) => e.rankId === rankId);
  };

  /**
   * 根据状态筛选员工
   * @param status 状态（1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习）
   * @returns 员工列表
   */
  const getEmployeesByStatus = (status: number): Employee[] => {
    return employeeList.value.filter((e) => e.status === status);
  };

  /**
   * 获取在职员工（状态为1或2）
   * @returns 员工列表
   */
  const getActiveEmployees = (): Employee[] => {
    return employeeList.value.filter((e) => e.status === 1 || e.status === 2);
  };

  /**
   * 刷新员工列表
   */
  const refresh = () => {
    return fetchEmployeeList();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchEmployeeList();
    });
  }

  return {
    employeeList,
    loading,
    pagination,
    fetchEmployeeList,
    fetchEmployeeDetail,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeByCode,
    getEmployeesByName,
    getEmployeesByDepartment,
    getEmployeesByRank,
    getEmployeesByStatus,
    getActiveEmployees,
    refresh,
  };
}

export default useEmployeeList;
