<template>
  <div class="page-header">
    <div class="header-left">
      <h2 class="page-title">
        <icon-settings class="title-icon" />
        导入配置管理
      </h2>
      <p class="page-desc">管理Excel批量导入的字段映射配置</p>
    </div>
    <div class="header-right">
      <a-button type="primary" @click="handleAdd">
        <template #icon><icon-plus /></template>
        新增配置
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits<{
    (e: 'add'): void;
  }>();

  const handleAdd = () => {
    emit('add');
  };
</script>

<style scoped lang="less">
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .header-left {
      .page-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: #1d2129;

        .title-icon {
          color: #165dff;
        }
      }

      .page-desc {
        margin: 0;
        color: #86909c;
        font-size: 14px;
      }
    }
  }
</style>
