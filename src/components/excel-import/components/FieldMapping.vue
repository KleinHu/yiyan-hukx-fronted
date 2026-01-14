<template>
  <div class="field-mapping">
    <div class="mapping-header">
      <div class="header-title">
        <icon-settings-fill />
        <span>字段映射配置</span>
      </div>
      <a-space>
        <a-button type="primary" size="small" @click="handleAutoMatch">
          <template #icon><icon-magic-wand /></template>
          智能匹配
        </a-button>
        <a-button
          type="outline"
          size="small"
          status="danger"
          @click="handleClearAll"
        >
          <template #icon><icon-eraser /></template>
          重置
        </a-button>
      </a-space>
    </div>

    <div class="mapping-content">
      <div class="mapping-table-card">
        <a-table
          :columns="columns"
          :data="mappings"
          :pagination="false"
          :bordered="{ cell: true }"
          :scroll="{ y: 400 }"
        >
          <template #excelColumn="{ record }">
            <div class="excel-column">
              <a-tag color="blue" bordered>{{ record.excelColumn }}</a-tag>
            </div>
          </template>

          <template #fieldName="{ record }">
            <div class="field-input">
              <a-input
                v-model="record.fieldName"
                placeholder="英文字段名"
                allow-clear
                @change="handleMappingChange"
              >
                <template #prefix>
                  <icon-code />
                </template>
              </a-input>
            </div>
          </template>

          <template #dataType="{ record }">
            <a-select
              v-model="record.dataType"
              size="small"
              @change="handleMappingChange"
            >
              <a-option value="string">文本</a-option>
              <a-option value="date">日期</a-option>
              <a-option value="number">数字</a-option>
              <a-option value="boolean">布尔值</a-option>
            </a-select>
          </template>

          <template #enabled="{ record }">
            <a-switch
              v-model="record.enabled"
              type="round"
              @change="handleMappingChange"
            />
          </template>

          <template #required="{ record }">
            <a-switch
              v-model="record.required"
              type="round"
              @change="handleMappingChange"
            />
          </template>

          <template #sample="{ record }">
            <div class="sample-data">
              {{ getSampleData(record.index) }}
            </div>
          </template>
        </a-table>
      </div>
    </div>

    <div class="mapping-footer">
      <a-alert type="info" :show-icon="false" class="footer-alert">
        <div class="footer-info">
          <div class="info-item">
            <span>已配置字段:</span>
            <span class="highlight">{{ configuredCount }}</span>
            <span>/ {{ mappings.length }}</span>
          </div>
          <a-divider direction="vertical" />
          <div class="info-item">
            <span>包含字段:</span>
            <span class="highlight" style="color: #00b42a">{{
              enabledCount
            }}</span>
          </div>
          <a-divider direction="vertical" />
          <div class="info-item">
            <span>必填字段:</span>
            <span class="highlight" style="color: #ff7d00">{{
              requiredCount
            }}</span>
          </div>
          <a-divider
            v-if="emptyEnabledFields.length > 0"
            direction="vertical"
          />
          <span
            v-if="emptyEnabledFields.length > 0"
            style="color: var(--color-danger-6)"
          >
            <icon-exclamation-circle-fill /> 包含字段缺少字段名:
            {{ emptyEnabledFields.join(', ') }}
          </span>
          <a-divider v-if="duplicateFields.length > 0" direction="vertical" />
          <span
            v-if="duplicateFields.length > 0"
            style="color: var(--color-danger-6)"
          >
            <icon-exclamation-circle-fill /> 字段名重复:
            {{ duplicateFields.join(', ') }}
          </span>
        </div>
      </a-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { smartMatchFields } from '../utils/utils';
  import type { FieldMapping, ExcelData } from '../utils/types';

  interface Props {
    excelData: ExcelData;
    presetMappings?: Record<string, string>;
  }

  interface Emits {
    (e: 'change', mappings: FieldMapping[]): void;
    (e: 'update:valid', valid: boolean): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    presetMappings: () => ({}),
  });

  const emit = defineEmits<Emits>();

  // 表格列定义
  const columns = [
    {
      title: 'Excel列标题',
      dataIndex: 'excelColumn',
      slotName: 'excelColumn',
      width: 180,
    },
    {
      title: '英文字段名',
      dataIndex: 'fieldName',
      slotName: 'fieldName',
      width: 200,
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      slotName: 'dataType',
      width: 120,
    },
    {
      title: '包含',
      dataIndex: 'enabled',
      slotName: 'enabled',
      width: 80,
      align: 'center',
    },
    {
      title: '必填',
      dataIndex: 'required',
      slotName: 'required',
      width: 80,
      align: 'center',
    },
    {
      title: '示例数据',
      dataIndex: 'sample',
      slotName: 'sample',
      ellipsis: true,
      tooltip: true,
    },
  ];

  // 字段映射列表
  const mappings = ref<FieldMapping[]>([]);

  // 计算属性
  const configuredCount = computed(() => {
    return mappings.value.filter((m) => m.fieldName).length;
  });

  const enabledCount = computed(() => {
    return mappings.value.filter((m) => m.enabled && m.fieldName).length;
  });

  const requiredCount = computed(() => {
    return mappings.value.filter((m) => m.required).length;
  });

  const duplicateFields = computed(() => {
    const fieldNames = mappings.value
      .map((m) => m.fieldName)
      .filter((name) => name);
    const duplicates = fieldNames.filter(
      (name, index) => fieldNames.indexOf(name) !== index
    );
    return [...new Set(duplicates)];
  });

  // 缺少字段名的包含字段
  const emptyEnabledFields = computed(() => {
    return mappings.value
      .filter((m) => m.enabled && (!m.fieldName || m.fieldName.trim() === ''))
      .map((m) => m.excelColumn);
  });

  const isValid = computed(() => {
    // 至少配置一个字段且至少包含一个字段
    if (configuredCount.value === 0) return false;
    if (enabledCount.value === 0) return false;

    // 检查所有包含字段是否都配置了英文字段名
    const enabledMappings = mappings.value.filter((m) => m.enabled);
    const hasEmptyEnabledField = enabledMappings.some(
      (m) => !m.fieldName || m.fieldName.trim() === ''
    );
    if (hasEmptyEnabledField) return false;

    // 不能有重复字段
    if (duplicateFields.value.length > 0) return false;
    return true;
  });

  // 监听映射变化，通知父组件
  watch(
    () => mappings.value,
    () => {
      emit('change', mappings.value);
      emit('update:valid', isValid.value);
    },
    { deep: true }
  );

  // 监听有效性变化
  watch(isValid, (valid) => {
    emit('update:valid', valid);
  });

  // 初始化映射
  const initMappings = () => {
    mappings.value = props.excelData.headers.map((header, index) => ({
      excelColumn: header,
      fieldName: '',
      required: false,
      enabled: false, // 默认不包含
      index,
      dataType: 'string', // 默认文本
    }));
  };

  // 智能匹配
  const handleAutoMatch = () => {
    if (Object.keys(props.presetMappings).length === 0) {
      Message.warning('未配置预设映射，无法进行智能匹配');
      return;
    }

    const matched = smartMatchFields(
      props.excelData.headers,
      props.presetMappings
    );
    mappings.value = matched;

    const matchedCount = matched.filter((m) => m.fieldName).length;
    Message.success(`智能匹配成功，已匹配 ${matchedCount} 个字段`);
  };

  // 清空配置
  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有字段配置吗？',
      onOk: () => {
        initMappings();
        Message.success('已清空配置');
      },
    });
  };

  // 获取示例数据
  const getSampleData = (index: number) => {
    const firstRow = props.excelData.data[0];
    if (!firstRow || index >= firstRow.length) return '-';
    const value = firstRow[index];
    if (value === null || value === undefined || value === '') return '-';
    const str = String(value);
    return str.length > 30 ? `${str.slice(0, 30)}...` : str;
  };

  // 处理映射变化
  const handleMappingChange = () => {
    // 触发响应式更新
    mappings.value = [...mappings.value];
  };

  // 初始化
  initMappings();

  // 暴露方法
  defineExpose({
    getMappings: () => mappings.value,
    isValid: () => isValid.value,
  });
</script>

<style scoped lang="less">
  .field-mapping {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--color-bg-2);

    .mapping-header {
      padding: 20px 24px;
      background-color: var(--color-bg-2);
      border-bottom: 1px solid var(--color-border-1);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-1);
        display: flex;
        align-items: center;
        gap: 8px;

        .arco-icon {
          color: rgb(var(--primary-6));
        }
      }
    }

    .mapping-content {
      flex: 1;
      padding: 24px;
      overflow: hidden;

      .mapping-table-card {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--color-border-2);
      }

      .excel-column {
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .field-input {
        :deep(.arco-input-wrapper) {
          border-radius: 6px;
          background-color: var(--color-fill-1);
          border: 1px solid transparent;
          transition: all 0.2s;

          &:hover,
          &-focus {
            background-color: var(--color-bg-2);
            border-color: rgb(var(--primary-6));
          }
        }
      }

      .sample-data {
        color: var(--color-text-3);
        font-size: 12px;
        font-family: monospace;
        background: var(--color-fill-1);
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .mapping-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-1);

      .footer-alert {
        border-radius: 10px;
        background-color: var(--color-primary-light-1);
        border: 1px solid var(--color-primary-light-2);
      }

      .footer-info {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .highlight {
          color: rgb(var(--primary-6));
          font-size: 16px;
        }
      }
    }
  }

  :deep(.arco-table-th) {
    background-color: var(--color-fill-2);
    font-weight: 700;
    color: var(--color-text-1);
    height: 48px;
  }

  :deep(.arco-table-td) {
    height: 56px;
  }
</style>
