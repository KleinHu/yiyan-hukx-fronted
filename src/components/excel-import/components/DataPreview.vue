<template>
  <div class="data-preview">
    <div class="preview-header">
      <div class="stats-group">
        <a-statistic
          title="总数据量"
          :value="totalCount"
          :value-style="{ color: 'rgb(var(--primary-6))' }"
        >
          <template #suffix>条</template>
        </a-statistic>
        <a-divider direction="vertical" style="height: 32px" />
        <a-statistic
          title="选中导入"
          :value="validDataCount"
          :value-style="{ color: '#00B42A' }"
        >
          <template #suffix>条</template>
        </a-statistic>
        <a-divider
          v-if="errorCount > 0"
          direction="vertical"
          style="height: 32px"
        />
        <a-statistic
          v-if="errorCount > 0"
          title="数据异常"
          :value="errorCount"
          :value-style="{ color: '#F53F3F' }"
        >
          <template #suffix>条</template>
        </a-statistic>
      </div>

      <a-space :size="16">
        <a-radio-group v-model="selectionFilter" type="button" size="small">
          <a-radio value="all">全部</a-radio>
          <a-radio value="selected">已选择</a-radio>
          <a-radio value="unselected">未选择</a-radio>
        </a-radio-group>

        <a-divider direction="vertical" />

        <a-radio-group
          v-model="showOnlyErrors"
          type="button"
          size="small"
          :disabled="errorCount === 0"
        >
          <a-radio :value="false">所有状态</a-radio>
          <a-radio :value="true">仅异常</a-radio>
        </a-radio-group>
        <a-button
          v-if="errorRecords.length > 0"
          type="outline"
          size="small"
          status="danger"
          @click="handleDownloadErrors"
        >
          <template #icon><icon-download /></template>
          导出异常数据
        </a-button>
      </a-space>
    </div>

    <div class="preview-content">
      <div class="preview-table-card">
        <a-table
          :columns="previewColumns"
          :data="filteredData"
          :pagination="pagination"
          :bordered="{ cell: true }"
          :scroll="{ x: '100%', y: 400 }"
          size="small"
          row-key="rowNumber"
          v-model:selected-keys="selectedRowKeys"
          :row-selection="rowSelection"
          @page-change="handlePageChange"
          @selection-change="handleSelectionChange"
        >
          <template #rowNumber="{ rowIndex }">
            <span style="color: var(--color-text-3)">
              {{
                (pagination.current - 1) * pagination.pageSize + rowIndex + 1
              }}
            </span>
          </template>

          <template #error="{ record }">
            <a-tag v-if="record.errorMessage" color="red" size="small" bordered>
              <template #icon><icon-exclamation-circle-fill /></template>
              {{ record.errorMessage }}
            </a-tag>
            <a-tag v-else color="green" size="small" bordered>
              <template #icon><icon-check-circle-fill /></template>
              正常
            </a-tag>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 验证结果提示 -->
    <div v-if="validationResult" class="validation-result">
      <a-alert
        v-if="validationResult.valid"
        type="success"
        :show-icon="true"
        class="result-alert"
      >
        数据验证通过，所有数据均符合导入要求
      </a-alert>
      <a-alert v-else type="error" :show-icon="true" class="result-alert">
        <template #title>
          数据验证未通过，共发现 {{ validationResult.errors.length }} 处错误
        </template>
        <div class="error-list">
          <div
            v-for="(error, index) in validationResult.errors.slice(0, 5)"
            :key="index"
            class="error-item"
          >
            第 {{ error.row }} 行：字段 "{{ error.field }}" 为空
          </div>
          <div v-if="validationResult.errors.length > 5" class="error-more">
            ... 还有
            {{ validationResult.errors.length - 5 }}
            个错误，请修正后重新上传或下载异常数据查看
          </div>
        </div>
      </a-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    transformData,
    validateRequiredFields,
    downloadErrorData,
  } from '../utils/utils';
  import type { FieldMapping, ExcelData, ErrorRecord } from '../utils/types';

  interface Props {
    excelData: ExcelData;
    mappings: FieldMapping[];
    requiredFields?: string[];
    previewLimit?: number;
  }

  interface Emits {
    (e: 'validate', result: { valid: boolean; data: any[] }): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    requiredFields: () => [],
    previewLimit: 10,
  });

  const emit = defineEmits<Emits>();

  const showOnlyErrors = ref(false);
  const selectionFilter = ref<'all' | 'selected' | 'unselected'>('all');
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  // 选择相关
  const selectedRowKeys = ref<(string | number)[]>([]);
  const rowSelection = computed(() => ({
    type: 'checkbox' as const,
    showCheckedAll: true,
    onlyCurrentPage: false,
    // 禁用有错误数据的勾选
    checkboxProps: (record: any) => ({
      disabled: !!record.errorMessage,
    }),
  }));

  // 转换后的数据
  const transformedData = ref<any[]>([]);
  const errorRecords = ref<ErrorRecord[]>([]);
  const validationResult = ref<any>(null);

  // 计算属性
  const totalCount = computed(() => props.excelData.data.length);

  const validDataCount = computed(() => {
    // 统计被选中的正常数据
    return transformedData.value.filter(
      (item) =>
        !item.errorMessage && selectedRowKeys.value.includes(item.rowNumber)
    ).length;
  });

  const errorCount = computed(() => errorRecords.value.length);

  // 预览表格列
  const previewColumns = computed(() => {
    const columns: any[] = [
      {
        title: '序号',
        slotName: 'rowNumber',
        width: 70,
        align: 'center',
        fixed: 'left',
      },
    ];

    // 添加映射的字段列
    const validMappings = props.mappings.filter(
      (m) => m.enabled && m.fieldName
    );
    validMappings.forEach((mapping) => {
      columns.push({
        title: `${mapping.excelColumn}${mapping.required ? ' *' : ''}`,
        dataIndex: mapping.fieldName,
        ellipsis: true,
        tooltip: true,
        width: 150,
      });
    });

    // 添加状态列
    columns.push({
      title: '状态',
      slotName: 'error',
      width: 120,
      align: 'center',
      fixed: 'right',
    });

    return columns;
  });

  // 过滤后的数据
  const filteredData = computed(() => {
    let data = transformedData.value;

    // 1. 处理选择状态过滤
    if (selectionFilter.value === 'selected') {
      data = data.filter((item) =>
        selectedRowKeys.value.includes(item.rowNumber)
      );
    } else if (selectionFilter.value === 'unselected') {
      data = data.filter(
        (item) => !selectedRowKeys.value.includes(item.rowNumber)
      );
    }

    // 2. 处理仅异常过滤
    if (showOnlyErrors.value) {
      data = data.filter((item) => item.errorMessage);
    }
    return data;
  });

  // 监听过滤后的数据变化，更新分页信息
  watch(
    filteredData,
    (newData) => {
      pagination.value.total = newData.length;
      // 如果当前页超出了新的总页数范围，重置回第一页
      const maxPage =
        Math.ceil(newData.length / pagination.value.pageSize) || 1;
      if (pagination.value.current > maxPage) {
        pagination.value.current = 1;
      }
    },
    { immediate: true }
  );

  // // 显示的数据
  // const displayData = computed(() => {
  //   const start = (pagination.value.current - 1) * pagination.value.pageSize;
  //   const end = start + pagination.value.pageSize;
  //   return filteredData.value.slice(start, end);
  // });

  // 统一通知父组件
  const notifyParent = () => {
    // 只发送被选中且无错误的数据
    const dataToImport = transformedData.value.filter(
      (item) =>
        !item.errorMessage && selectedRowKeys.value.includes(item.rowNumber)
    );

    emit('validate', {
      valid: validationResult.value?.valid || false,
      data: dataToImport,
    });
  };

  // 转换并验证数据
  const processData = () => {
    const validMappings = props.mappings.filter(
      (m) => m.enabled && m.fieldName
    );
    if (validMappings.length === 0) {
      transformedData.value = [];
      return;
    }

    const data = transformData(props.excelData.data, validMappings);
    const requiredFieldNames = props.mappings
      .filter((m) => m.enabled && m.required && m.fieldName)
      .map((m) => m.fieldName);

    const validation = validateRequiredFields(data, requiredFieldNames);
    validationResult.value = validation;

    errorRecords.value = [];
    const processedData = data.map((item, index) => {
      const errors: string[] = [];
      requiredFieldNames.forEach((field) => {
        const value = item[field];
        if (value === undefined || value === null || value === '') {
          errors.push(`${field}为空`);
        }
      });

      const rowNumber = index + 2;
      if (errors.length > 0) {
        const errorMsg = errors.join('; ');
        errorRecords.value.push({
          row: rowNumber,
          data: item,
          error: errorMsg,
        });
        return { ...item, errorMessage: errorMsg, rowNumber };
      }
      return { ...item, rowNumber };
    });

    transformedData.value = processedData;

    // 默认全选所有正常数据
    selectedRowKeys.value = processedData
      .filter((item) => !item.errorMessage)
      .map((item) => item.rowNumber);

    notifyParent();
  };

  // 处理选择变化
  const handleSelectionChange = (keys: (string | number)[]) => {
    selectedRowKeys.value = keys;
    notifyParent();
  };

  // 页码变化
  const handlePageChange = (page: number) => {
    pagination.value.current = page;
  };

  // 下载异常数据
  const handleDownloadErrors = () => {
    if (errorRecords.value.length === 0) {
      Message.warning('没有异常数据');
      return;
    }
    const errorData = errorRecords.value.map((record) => ({
      行号: record.row,
      错误信息: record.error,
      ...record.data,
    }));
    downloadErrorData(errorData, '数据异常记录.xlsx');
    Message.success('异常数据已导出');
  };

  // 监听映射变化
  watch(
    () => props.mappings,
    () => {
      processData();
    },
    { deep: true, immediate: true }
  );

  // 暴露方法
  defineExpose({
    refresh: processData,
    getValidData: () =>
      transformedData.value.filter(
        (item) =>
          !item.errorMessage && selectedRowKeys.value.includes(item.rowNumber)
      ),
    getErrorData: () => errorRecords.value,
  });
</script>

<style scoped lang="less">
  .data-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-bg-2);

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-1);
      background-color: var(--color-bg-2);

      .stats-group {
        display: flex;
        align-items: center;
        gap: 32px;
      }
    }

    .preview-content {
      flex: 1;
      padding: 24px;
      overflow: hidden;

      .preview-table-card {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--color-border-2);
      }
    }

    .validation-result {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-1);

      .result-alert {
        border-radius: 10px;
      }

      .error-list {
        margin-top: 12px;
        max-height: 120px;
        overflow-y: auto;
        padding: 8px 12px;
        background: rgba(var(--danger-6), 0.04);
        border-radius: 6px;

        .error-item {
          padding: 4px 0;
          font-size: 13px;
          color: var(--color-text-2);
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: '';
            width: 6px;
            height: 6px;
            background: rgb(var(--danger-6));
            border-radius: 50%;
          }
        }

        .error-more {
          padding: 4px 0;
          font-size: 13px;
          color: var(--color-text-3);
          font-style: italic;
          margin-left: 14px;
        }
      }
    }
  }

  :deep(.arco-table) {
    .arco-table-th {
      background-color: var(--color-fill-2);
      font-weight: 700;
      color: var(--color-text-1);
    }

    .arco-table-td {
      font-size: 13px;
    }
  }

  :deep(.arco-statistic) {
    .arco-statistic-title {
      font-size: 12px;
      color: var(--color-text-3);
      margin-bottom: 4px;
    }

    .arco-statistic-value {
      font-size: 24px;
      font-weight: 700;
    }
  }
</style>
