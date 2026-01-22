import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import departmentApi from '@/api/hr/department';
import type { Department, DepartmentTreeNode, Employee } from '@/api/hr/types';

/**
 * 部门管理 Hook
 * @param options 配置选项
 * @returns 部门相关数据和方法
 */
function useDepartmentTree(options?: {
  autoLoad?: boolean; // 是否自动加载
  includeRoot?: boolean; // 是否包含根节点（顶级部门）
  rootLabel?: string; // 根节点标签，默认"顶级部门"
  withStats?: boolean; // 是否获取带统计信息的树
}) {
  const {
    autoLoad = true,
    includeRoot = false,
    rootLabel = '顶级部门',
    withStats = false,
  } = options || {};

  const departmentTreeData = ref<DepartmentTreeNode[]>([]);
  const departmentList = ref<Department[]>([]); // 扁平列表
  const loading = ref(false);

  /**
   * 获取部门树数据
   */
  const fetchDepartmentTree = async () => {
    try {
      loading.value = true;
      const { data } = withStats
        ? await departmentApi.getDepartmentTreeWithStats()
        : await departmentApi.getDepartmentTree();
      if (data) {
        if (includeRoot) {
          // 添加根节点选项
          departmentTreeData.value = [
            {
              deptId: '0',
              deptCode: 'ROOT',
              deptName: rootLabel,
              deptLevel: 0,
              sortOrder: 0,
              isActive: true,
              parentId: '-1',
              status: 1,
              children: Array.isArray(data) ? data : [],
            } as DepartmentTreeNode,
          ];
        } else {
          departmentTreeData.value = Array.isArray(data) ? data : [];
        }
      }
    } catch (error) {
      Message.error('获取部门树失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取部门列表（扁平结构）
   */
  const fetchDepartmentList = async () => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentList();
      if (data) {
        departmentList.value = Array.isArray(data) ? data : [];
      }
    } catch (error) {
      Message.error('获取部门列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取指定节点的子树
   * @param deptId 部门ID
   * @returns 子树数据
   */
  const fetchSubDepartmentTree = async (
    deptId: string
  ): Promise<DepartmentTreeNode | null> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getSubDepartmentTree(deptId);
      return data || null;
    } catch (error) {
      Message.error('获取子树失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取部门详情
   * @param deptId 部门ID
   * @returns 部门详情
   */
  const fetchDepartmentDetail = async (
    deptId: string
  ): Promise<Department | null> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentById(deptId);
      return data || null;
    } catch (error) {
      Message.error('获取部门详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取部门及其员工
   * @param deptId 部门ID
   * @param includeChildren 是否包含子科室员工
   * @returns 部门及员工信息
   */
  const fetchDepartmentEmployees = async (
    deptId: string,
    includeChildren = true
  ): Promise<{ department: Department; employees: Employee[] } | null> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentEmployees(
        deptId,
        includeChildren
      );
      return data || null;
    } catch (error) {
      Message.error('获取部门员工失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取科室及所有子科室的ID列表
   * @param deptId 部门ID
   * @returns 子科室ID列表
   */
  const fetchAllChildDeptIds = async (deptId: string): Promise<string[]> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getAllChildDeptIds(deptId);
      return data || [];
    } catch (error) {
      Message.error('获取子科室ID列表失败');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取科室路径（从API）
   * @param deptId 部门ID
   * @returns 科室路径信息
   */
  const fetchDepartmentPath = async (deptId: string): Promise<any> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentPath(deptId);
      return data || null;
    } catch (error) {
      Message.error('获取部门路径失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据员工工号获取其科室路径
   * @param userCode 员工工号
   * @returns 科室路径信息
   */
  const fetchDepartmentPathByUserCode = async (
    userCode: string
  ): Promise<any> => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentPathByUserCode(
        userCode
      );
      return data || null;
    } catch (error) {
      Message.error('获取员工科室路径失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增部门
   * @param data 部门信息
   * @returns 是否成功
   */
  const createDepartment = async (
    data: Partial<Department>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await departmentApi.createDepartment(data);
      Message.success('新增部门成功');
      // 刷新树
      await fetchDepartmentTree();
      return true;
    } catch (error) {
      Message.error('新增部门失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新部门信息
   * @param deptId 部门ID
   * @param data 部门信息
   * @returns 是否成功
   */
  const updateDepartment = async (
    deptId: string,
    data: Partial<Department>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await departmentApi.updateDepartment(deptId, data);
      Message.success('更新部门成功');
      // 刷新树
      await fetchDepartmentTree();
      return true;
    } catch (error) {
      Message.error('更新部门失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除部门
   * @param deptId 部门ID
   * @returns 是否成功
   */
  const deleteDepartment = async (deptId: string): Promise<boolean> => {
    try {
      loading.value = true;
      await departmentApi.deleteDepartment(deptId);
      Message.success('删除部门成功');
      // 刷新树
      await fetchDepartmentTree();
      return true;
    } catch (error) {
      Message.error('删除部门失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据部门ID查找部门节点
   * @param deptId 部门ID
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 部门节点
   */
  const findDepartmentById = (
    deptId: string,
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode | undefined => {
    const searchTree = tree || departmentTreeData.value;

    const found = searchTree.find((node) => node.deptId === deptId);
    if (found) return found;

    // 递归查找子节点
    return searchTree.reduce<DepartmentTreeNode | undefined>((result, node) => {
      if (result) return result;
      if (node.children && node.children.length > 0) {
        return findDepartmentById(deptId, node.children);
      }
      return undefined;
    }, undefined);
  };

  /**
   * 获取部门路径（从根到当前部门）
   * @param deptId 部门ID
   * @returns 部门路径数组
   */
  const getDepartmentPath = (deptId: string): DepartmentTreeNode[] => {
    const path: DepartmentTreeNode[] = [];
    const findPath = (
      node: DepartmentTreeNode,
      targetId: string,
      currentPath: DepartmentTreeNode[]
    ): boolean => {
      currentPath.push(node);
      if (node.deptId === targetId) {
        path.push(...currentPath);
        return true;
      }
      if (node.children) {
        return node.children.some((child) =>
          findPath(child, targetId, [...currentPath])
        );
      }
      return false;
    };

    departmentTreeData.value.some((node) => findPath(node, deptId, []));
    return path;
  };

  /**
   * 扁平化部门树（获取所有部门列表）
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 扁平化的部门列表
   */
  const flattenDepartmentTree = (
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode[] => {
    const result: DepartmentTreeNode[] = [];
    const traverse = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(tree || departmentTreeData.value);
    return result;
  };

  /**
   * 获取所有子部门（递归）
   * @param deptId 部门ID
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 子部门列表
   */
  const getAllChildren = (
    deptId: string,
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode[] => {
    const result: DepartmentTreeNode[] = [];
    const findAndCollect = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.deptId === deptId && node.children) {
          node.children.forEach((child) => {
            result.push(child);
            if (child.children && child.children.length > 0) {
              const childChildren = getAllChildren(child.deptId, [child]);
              result.push(...childChildren);
            }
          });
        } else if (node.children && node.children.length > 0) {
          findAndCollect(node.children);
        }
      });
    };
    findAndCollect(tree || departmentTreeData.value);
    return result;
  };

  /**
   * 根据部门名称查找部门（支持模糊匹配）
   * @param deptName 部门名称
   * @param tree 部门树（可选，默认使用当前树数据）
   * @returns 部门列表
   */
  const findDepartmentsByName = (
    deptName: string,
    tree?: DepartmentTreeNode[]
  ): DepartmentTreeNode[] => {
    if (!deptName) return [];
    const searchTree = tree || departmentTreeData.value;
    const result: DepartmentTreeNode[] = [];
    const search = (nodes: DepartmentTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.deptName?.includes(deptName)) {
          result.push(node);
        }
        if (node.children && node.children.length > 0) {
          search(node.children);
        }
      });
    };
    search(searchTree);
    return result;
  };

  /**
   * 刷新部门树
   */
  const refresh = () => {
    return fetchDepartmentTree();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchDepartmentTree();
      if (withStats) {
        fetchDepartmentList();
      }
    });
  }

  return {
    departmentTreeData,
    departmentList,
    loading,
    fetchDepartmentTree,
    fetchDepartmentList,
    fetchSubDepartmentTree,
    fetchDepartmentDetail,
    fetchDepartmentEmployees,
    fetchAllChildDeptIds,
    fetchDepartmentPath,
    fetchDepartmentPathByUserCode,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    findDepartmentById,
    getDepartmentPath,
    flattenDepartmentTree,
    getAllChildren,
    findDepartmentsByName,
    refresh,
  };
}

export default useDepartmentTree;
