<template>
  <a-col :span="span">
    <a-card :bordered="false" class="form-block">
      <template #title>
        <div class="block-title">
          <slot name="icon" />
          {{ title }}
          <a-badge
            v-if="count > 0"
            :count="count"
            :overflow-count="99"
            :offset="[8, 0]"
          />
        </div>
      </template>
      <template #extra>
        <a-button
          v-if="showAddButton"
          type="primary"
          size="mini"
          @click="handleAdd"
        >
          <template #icon><icon-plus /></template>{{ addButtonText }}
        </a-button>
      </template>
      <slot />
    </a-card>
  </a-col>
</template>

<script setup lang="ts">
  interface Props {
    /** 卡片标题 */
    title: string;
    /** 记录数量 */
    count?: number;
    /** 是否显示新增按钮 */
    showAddButton?: boolean;
    /** 新增按钮文本 */
    addButtonText?: string;
    /** 列宽度（24栅格） */
    span?: number;
  }

  withDefaults(defineProps<Props>(), {
    count: 0,
    showAddButton: true,
    addButtonText: '新增',
    span: 12,
  });

  const emit = defineEmits<{
    /** 点击新增按钮 */
    (e: 'add'): void;
  }>();

  const handleAdd = () => {
    emit('add');
  };
</script>

<style scoped lang="less">
  .form-block {
    margin-bottom: 16px;
    flex: 1;
    box-sizing: border-box;

    :deep(.arco-card-body) {
      padding: 16px 20px;
    }

    :deep(.arco-card-header) {
      padding: 16px 20px;
      border-bottom: 1px solid #f2f3f5;
    }

    .block-title {
      font-size: 15px;
      font-weight: 600;
      color: #1d2129;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;

      .arco-icon {
        color: #165dff;
        font-size: 16px;
      }
    }

    :deep(.performance-tab),
    :deep(.rank-history-tab) {
      padding: 0;
    }
  }
</style>
