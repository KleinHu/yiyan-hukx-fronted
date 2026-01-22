<template>
  <div class="employee-directory">
    <div class="page-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>员工通讯录</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <a-card :bordered="false" class="search-card">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12" :md="6" :lg="5" :xl="5">
            <a-input
              v-model="searchForm.userName"
              placeholder="请输入员工姓名"
              allow-clear
              @press-enter="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </a-col>
          <a-col :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
            <a-select
              v-model="searchForm.departmentId"
              placeholder="选择部门"
              allow-clear
              @change="handleSearch"
            >
              <a-option
                v-for="dept in departmentList"
                :key="dept.deptId"
                :value="dept.deptId"
              >
                {{ dept.deptName }}
              </a-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="12" :md="5" :lg="4" :xl="4">
            <a-input
              v-model="searchForm.position"
              placeholder="职位"
              allow-clear
              @press-enter="handleSearch"
            />
          </a-col>
          <a-col :xs="24" :sm="12" :md="7" :lg="4" :xl="4">
            <a-select
              v-model="searchForm.status"
              placeholder="在职状态"
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">试用</a-option>
              <a-option :value="2">正式</a-option>
              <a-option :value="3">离职</a-option>
              <a-option :value="4">退休</a-option>
              <a-option :value="5">顶岗实习</a-option>
            </a-select>
          </a-col>
          <a-col :xs="24" :sm="24" :md="24" :lg="7" :xl="7">
            <a-space :size="12" wrap>
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
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 员工卡片列表 -->
    <div class="employee-cards">
      <a-spin :loading="loading" style="width: 100%" tip="正在加载员工信息...">
        <div class="employee-grid" :class="{ 'grid-loading': loading }">
          <div
            v-for="(employee, index) in employeeList"
            :key="employee.id"
            class="employee-item"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <employee-card :employee="employee" @click="handleCardClick" />
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 员工详情抽屉 -->
    <employee-detail-drawer
      v-model:visible="drawerVisible"
      :user-code="selectedUserCode"
    />

    <!-- 分页 -->
    <div class="pagination-section">
      <a-card :bordered="false" class="pagination-card">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :show-total="true"
          :show-jumper="true"
          :show-page-size="true"
          @change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import {
    IconSearch,
    IconRefresh,
    IconApps,
  } from '@arco-design/web-vue/es/icon';
  import useEmployeeList from '@/hooks/hr/employee';
  import useDepartmentTree from '@/hooks/hr/department';
  import type { Employee } from '@/api/hr/types';
  import EmployeeCard from '../common/employee-card.vue';
  import EmployeeDetailDrawer from '../common/employee-detail-drawer.vue';

  /**
   * 搜索表单数据结构
   */
  interface SearchForm {
    userName?: string;
    userCode?: string;
    departmentId?: string;
    rankId?: string;
    jobTitle?: string;
    status?: number;
    mobile?: string;
    // 兼容字段
    position?: string;
    workStatus?: number;
  }

  // 使用 Hooks
  const { employeeList, loading, pagination, fetchEmployeeList } =
    useEmployeeList({
      autoLoad: false, // 手动控制加载
    });

  const { departmentList, fetchDepartmentList } = useDepartmentTree({
    autoLoad: false, // 手动控制加载
  });

  const drawerVisible = ref(false);
  const selectedUserCode = ref<string>();

  // 搜索表单
  const searchForm = reactive<SearchForm>({
    userName: '',
    userCode: '',
    departmentId: undefined,
    rankId: undefined,
    jobTitle: '',
    status: undefined,
    mobile: '',
    // 兼容字段
    position: '',
    workStatus: undefined,
  });

  /**
   * 获取员工列表
   */
  const getEmployeeList = async () => {
    const params = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      userName: searchForm.userName,
      userCode: searchForm.userCode,
      departmentId: searchForm.departmentId,
      rankId: searchForm.rankId,
      jobTitle: searchForm.jobTitle || searchForm.position, // 兼容旧字段
      status: searchForm.status || searchForm.workStatus, // 兼容旧字段
      mobile: searchForm.mobile,
    };

    await fetchEmployeeList(params, true); // 使用分页
  };

  /**
   * 获取部门列表
   */
  const getDepartmentList = async () => {
    await fetchDepartmentList();
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    pagination.value.current = 1;
    getEmployeeList();
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchForm.userName = '';
    searchForm.userCode = '';
    searchForm.departmentId = undefined;
    searchForm.rankId = undefined;
    searchForm.jobTitle = '';
    searchForm.status = undefined;
    searchForm.mobile = '';
    searchForm.position = '';
    searchForm.workStatus = undefined;
    pagination.value.current = 1;
    getEmployeeList();
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number) => {
    pagination.value.current = page;
    getEmployeeList();
  };

  /**
   * 处理页大小变化
   */
  const handlePageSizeChange = (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.current = 1;
    getEmployeeList();
  };

  /**
   * 点击员工卡片 - 打开抽屉展示详情
   */
  const handleCardClick = (employee: Employee) => {
    if (employee.userCode) {
      selectedUserCode.value = employee.userCode;
      drawerVisible.value = true;
    }
  };

  // 组件挂载时初始化数据
  onMounted(() => {
    getDepartmentList();
    getEmployeeList();
  });
</script>

<script lang="ts">
  export default {
    name: 'EmployeeDirectory',
  };
</script>

<style scoped lang="less">
  .employee-directory {
    padding: 12px 20px;
    background-color: #f4f7f9;
    min-height: calc(100vh - 60px);

    .page-breadcrumb {
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

    .search-section {
      margin-bottom: 16px;

      .search-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        :deep(.arco-card-body) {
          padding: 16px 20px;
        }

        :deep(.arco-input-wrapper),
        :deep(.arco-select-view) {
          background-color: #f2f3f5;
          border-color: transparent;
          border-radius: 6px;
          &:hover {
            background-color: #e5e6eb;
          }
        }
      }
    }

    .employee-cards {
      margin-bottom: 24px;

      .employee-grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      .employee-item {
        animation: fadeInUp 0.5s ease-out both;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pagination-section {
      display: flex;
      justify-content: center;

      .pagination-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        :deep(.arco-card-body) {
          padding: 12px 20px;
        }
      }
    }
  }

  // 响应式优化
  @media (max-width: 768px) {
    .employee-directory {
      padding: 12px;

      .employee-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }
</style>
