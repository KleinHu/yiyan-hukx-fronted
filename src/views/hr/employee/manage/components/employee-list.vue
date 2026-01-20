<template>
  <a-card :bordered="false" class="panel-card left-panel-card">
    <div class="left-panel">
      <div class="panel-header">
        <div class="header-top">
          <span class="header-title">员工名录</span>
          <a-button type="primary" size="mini" @click="handleAdd">
            <template #icon><icon-plus /></template>新增
          </a-button>
        </div>
        <a-space direction="vertical" fill :size="10" class="filter-area">
          <a-input-search
            v-model="searchKey"
            placeholder="搜索姓名/工号"
            allow-clear
            @search="handleSearch"
          />
          <a-select
            v-model="filterDept"
            placeholder="按科室筛选"
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
        </a-space>
      </div>

      <div class="list-wrapper">
        <a-spin :loading="loading" style="width: 100%">
          <div
            v-for="item in employeeList"
            :key="item.userCode"
            :class="[
              'employee-nav-card',
              { active: currentRecord?.userCode === item.userCode },
            ]"
            @click="handleSelect(item)"
          >
            <div class="card-avatar">
              <a-avatar :size="36" :style="{ backgroundColor: '#165DFF' }">
                {{ item.userName?.charAt(0) }}
              </a-avatar>
            </div>
            <div class="card-content">
              <div class="card-row-top">
                <span class="name">{{ item.userName }}</span>
                <a-tag size="small" :status="getStatusType(item.status)">{{
                  item.statusName || getStatusLabel(item.status)
                }}</a-tag>
              </div>
              <div class="card-row-bottom">
                <span class="dept">{{ item.departmentName || '未分配' }}</span>
                <span class="code">{{ item.userCode }}</span>
              </div>
            </div>
          </div>
          <a-empty v-if="!employeeList.length || employeeList.length === 0" />
        </a-spin>
      </div>

      <div class="panel-footer">
        <a-pagination
          :current="pagination.current"
          size="mini"
          :total="pagination.total"
          simple
          @change="handlePageChange"
        />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import type { Employee, Department } from '@/api/hr/types';
  import { EmployeeStatusOptions } from '@/api/hr/types';

  interface Props {
    employeeList: Employee[];
    departmentList: Department[];
    loading?: boolean;
    currentRecord?: Employee | null;
    pagination: {
      current: number;
      total: number;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    currentRecord: null,
  });

  const emit = defineEmits<{
    (e: 'add'): void;
    (e: 'select', employee: Employee): void;
    (e: 'search'): void;
    (e: 'update:pagination', value: { current: number; total: number }): void;
  }>();

  const searchKey = ref('');
  const filterDept = ref<string | undefined>(undefined);

  const getStatusType = (status?: number) => {
    switch (status) {
      case 1:
        return 'warning';
      case 2:
        return 'success';
      case 3:
        return 'danger';
      default:
        return 'normal';
    }
  };

  const getStatusLabel = (status?: number) => {
    return (
      EmployeeStatusOptions.find((opt) => opt.value === status)?.label || '未知'
    );
  };

  const handleAdd = () => {
    emit('add');
  };

  const handleSelect = (employee: Employee) => {
    emit('select', employee);
  };

  const handleSearch = () => {
    emit('search');
  };

  const handlePageChange = (page: number) => {
    emit('update:pagination', {
      current: page,
      total: props.pagination.total,
    });
    emit('search');
  };

  // 暴露搜索条件供父组件使用
  defineExpose({
    searchKey,
    filterDept,
  });
</script>

<style scoped lang="less">
  .left-panel-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    background-color: #fff;

    :deep(.arco-card-body) {
      height: 100%;
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
    }
  }

  .left-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .panel-header {
      padding: 14px 16px;
      background-color: #fff;
      border-bottom: 1px solid #f2f3f5;

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .header-title {
          font-size: 15px;
          font-weight: 600;
          color: #1d2129;
        }
      }

      .filter-area {
        :deep(.arco-select-view) {
          background-color: #f2f3f5;
          border-color: transparent;
        }
        :deep(.arco-input-wrapper) {
          background-color: #f2f3f5;
          border-color: transparent;
        }
      }
    }

    .list-wrapper {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .employee-nav-card {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #f2f3f5;
        }

        &.active {
          background-color: #e8f3ff;
          .name {
            color: #165dff;
          }
        }

        .card-avatar {
          margin-right: 12px;
        }

        .card-content {
          flex: 1;

          .card-row-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            .name {
              font-weight: 500;
              font-size: 14px;
              color: #1d2129;
            }
          }

          .card-row-bottom {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }

    .panel-footer {
      padding: 12px;
      border-top: 1px solid #f2f3f5;
      display: flex;
      justify-content: center;
    }
  }
</style>
