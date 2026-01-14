<template>
  <div class="department-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>部门管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input
              v-model="searchForm.deptName"
              placeholder="请输入部门名称"
              allow-clear
              @press-enter="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.isActive"
              placeholder="选择状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">正常</a-option>
              <a-option :value="0">停用</a-option>
            </a-select>
          </a-col>
          <a-col :span="10">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
              <a-button type="primary" @click="showAddModal">
                <template #icon>
                  <icon-plus />
                </template>
                新增部门
              </a-button>
              <a-button @click="expandAll">
                <template #icon>
                  <icon-expand />
                </template>
                展开全部
              </a-button>
              <a-button @click="collapseAll">
                <template #icon>
                  <icon-shrink />
                </template>
                收起全部
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 部门树表格 -->
    <div class="department-table">
      <a-card :bordered="false">
        <a-table
          :data="departmentList"
          :loading="loading"
          v-model:expanded-keys="expandedKeys"
          :pagination="false"
          row-key="deptId"
        >
          <template #columns>
            <a-table-column title="部门名称" data-index="deptName" :width="200">
              <template #cell="{ record }">
                <div class="dept-name-cell">
                  <icon-folder v-if="record.children?.length" />
                  <icon-file v-else />
                  <span>{{ record.deptName }}</span>
                </div>
              </template>
            </a-table-column>

            <a-table-column title="部门编码" data-index="deptId" :width="120" />

            <a-table-column title="负责人" :width="120">
              <template #cell="{ record }">
                {{ record.managerName || '-' }}
              </template>
            </a-table-column>

            <a-table-column title="排序" data-index="sortOrder" :width="80" />

            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag :color="record.isActive ? 'green' : 'red'">
                  {{ record.isActive ? '正常' : '停用' }}
                </a-tag>
              </template>
            </a-table-column>

            <a-table-column title="操作" :width="200" fixed="right">
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    type="text"
                    size="small"
                    @click="handleEdit(record)"
                  >
                    <template #icon>
                      <icon-edit />
                    </template>
                    编辑
                  </a-button>

                  <a-button
                    type="text"
                    size="small"
                    @click="handleAddChild(record)"
                  >
                    <template #icon>
                      <icon-plus />
                    </template>
                    新增下级
                  </a-button>

                  <a-button
                    type="text"
                    size="small"
                    status="danger"
                    :disabled="!!record.children && record.children.length > 0"
                    @click="handleDelete(record)"
                  >
                    <template #icon>
                      <icon-delete />
                    </template>
                    删除
                  </a-button>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 部门详情/编辑弹窗 -->
    <department-modal
      v-model:visible="modalVisible"
      :department="currentDepartment"
      :parent-department="parentDepartment"
      :mode="modalMode"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import departmentApi from '@/api/hr/department';
  import type { Department, DepartmentTreeNode } from '@/api/hr/types';
  import DepartmentModal from './components/department-modal.vue';

  /**
   * 搜索表单数据结构
   */
  interface SearchForm {
    deptName?: string;
    isActive?: number;
  }

  // 响应式数据
  const loading = ref(false);
  const departmentList = ref<DepartmentTreeNode[]>([]);
  const expandedKeys = ref<string[]>([]);
  const modalVisible = ref(false);
  const modalMode = ref<'view' | 'add' | 'edit'>('view');
  const currentDepartment = ref<Department | null>(null);
  const parentDepartment = ref<Department | null>(null);

  // 搜索表单
  const searchForm = reactive<SearchForm>({
    deptName: '',
    isActive: undefined,
  });

  /**
   * 获取部门树数据
   */
  const getDepartmentTree = async () => {
    try {
      loading.value = true;
      const { data } = await departmentApi.getDepartmentTree();
      departmentList.value = data || [];
      // 默认展开第一层
      expandedKeys.value = data
        .map((dept) => dept.deptId)
        .filter((id): id is string => !!id);
    } catch (error) {
      console.error('获取部门数据失败:', error);
      Message.error('获取部门数据失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    // console.log('搜索条件:', searchForm);
    // 这里可以添加搜索逻辑
    getDepartmentTree();
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchForm.deptName = '';
    searchForm.isActive = undefined;
    getDepartmentTree();
  };

  /**
   * 展开全部
   */
  const expandAll = () => {
    const getAllKeys = (nodes: DepartmentTreeNode[]): string[] => {
      let keys: string[] = [];
      nodes.forEach((node) => {
        if (node.deptId) {
          keys.push(node.deptId);
        }
        if (node.children?.length > 0) {
          keys = keys.concat(getAllKeys(node.children));
        }
      });
      return keys;
    };
    expandedKeys.value = getAllKeys(departmentList.value);
  };

  /**
   * 收起全部
   */
  const collapseAll = () => {
    expandedKeys.value = [];
  };

  /**
   * 显示新增部门弹窗
   */
  const showAddModal = () => {
    modalMode.value = 'add';
    currentDepartment.value = null;
    parentDepartment.value = null;
    modalVisible.value = true;
  };

  /**
   * 编辑部门
   */
  const handleEdit = (department: DepartmentTreeNode) => {
    modalMode.value = 'edit';
    currentDepartment.value = department as unknown as Department;
    modalVisible.value = true;
  };

  /**
   * 新增下级部门
   */
  const handleAddChild = (department: DepartmentTreeNode) => {
    modalMode.value = 'add';
    currentDepartment.value = null;
    parentDepartment.value = department as unknown as Department;
    modalVisible.value = true;
  };

  /**
   * 删除部门
   */
  const handleDelete = (department: DepartmentTreeNode) => {
    if (!department.deptId) {
      Message.error('部门ID不存在，无法删除');
      return;
    }
    const departmentId = department.deptId; // 保存到局部变量，确保类型推断正确
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 ${department.deptName} 吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await departmentApi.deleteDepartment(departmentId);
          Message.success('删除成功');
          getDepartmentTree();
        } catch (error) {
          console.error('删除部门失败:', error);
        }
      },
    });
  };

  /**
   * 弹窗操作成功回调
   */
  const handleModalSuccess = () => {
    modalVisible.value = false;
    getDepartmentTree();
  };

  // 组件挂载时初始化数据
  onMounted(() => {
    getDepartmentTree();
  });
</script>

<script lang="ts">
  export default {
    name: 'DepartmentManagement',
  };
</script>

<style scoped lang="less">
  .department-management {
    padding: 12px 20px;
    background-color: #f4f7f9;
    min-height: calc(100vh - 60px);

    .page-header {
      margin-bottom: 12px;
      padding-left: 4px;

      :deep(.arco-breadcrumb-item) {
        color: #86909c;
        &:last-child {
          color: #1d2129;
          font-weight: 500;
        }
      }
    }

    :deep(.arco-card) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .search-section {
      margin-bottom: 16px;
    }

    .department-table {
      .dept-name-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .arco-icon {
          color: var(--color-text-3);
        }
      }

      :deep(.arco-table-tr-expand .arco-table-td) {
        border-bottom: none;
      }

      :deep(.arco-table-expand-btn) {
        margin-right: 8px;
      }
    }
  }
</style>
