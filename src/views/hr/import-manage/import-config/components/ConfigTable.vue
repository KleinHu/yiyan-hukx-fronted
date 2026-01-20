<template>
  <div class="config-list">
    <a-spin :loading="loading" style="width: 100%">
      <a-table
        :columns="columns"
        :data="configs"
        :pagination="{ pageSize: 10, showTotal: true }"
        :bordered="{ cell: true }"
        row-key="id"
      >
        <template #configName="{ record }">
          <div class="config-name-cell">
            <component :is="record.icon || 'icon-file'" class="config-icon" />
            <div class="config-info">
              <div class="name">{{ record.configName }}</div>
              <div class="key">{{ record.configKey }}</div>
            </div>
          </div>
        </template>

        <template #category="{ record }">
          <a-tag :color="getCategoryColor(record.category)">
            {{ record.category }}
          </a-tag>
        </template>

        <template #mappings="{ record }">
          <a-tooltip :content="getMappingsTooltip(record.presetMappings)">
            <a-tag color="blue">
              {{ Object.keys(record.presetMappings || {}).length }} 个字段
            </a-tag>
          </a-tooltip>
        </template>

        <template #isEnabled="{ record }">
          <a-switch
            :model-value="record.isEnabled"
            @change="(val) => handleToggleEnabled(record.id, val as boolean)"
          />
        </template>

        <template #actions="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleEdit(record)">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-popconfirm
              content="确定要删除该配置吗？"
              @ok="handleDelete(record.id)"
            >
              <a-button type="text" size="small" status="danger">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { ImportConfigVO } from '@/api/hr/import-config';

  interface Props {
    loading?: boolean;
    configs: ImportConfigVO[];
  }

  defineProps<Props>();

  const emit = defineEmits<{
    (e: 'edit', record: ImportConfigVO): void;
    (e: 'delete', id: number): void;
    (e: 'toggleEnabled', id: number, enabled: boolean): void;
  }>();

  const columns = [
    {
      title: '配置名称',
      dataIndex: 'configName',
      slotName: 'configName',
      width: 240,
    },
    { title: '分类', dataIndex: 'category', slotName: 'category', width: 120 },
    { title: 'API地址', dataIndex: 'apiUrl', ellipsis: true, width: 240 },
    { title: '字段映射', slotName: 'mappings', width: 100 },
    { title: '启用', slotName: 'isEnabled', width: 80 },
    { title: '操作', slotName: 'actions', width: 160, fixed: 'right' },
  ];

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      基础数据: 'arcoblue',
      档案数据: 'orange',
      考核数据: 'green',
      奖励数据: 'red',
      联系信息: 'purple',
      培训数据: 'cyan',
      基础配置: 'gray',
    };
    return colorMap[category] || 'blue';
  };

  const getMappingsTooltip = (mappings: Record<string, string>): string => {
    if (!mappings) return '无映射';
    const entries = Object.entries(mappings).slice(0, 5);
    const lines = entries.map(([k, v]) => `${k} → ${v}`);
    if (Object.keys(mappings).length > 5) {
      lines.push('...');
    }
    return lines.join('\n');
  };

  const handleEdit = (record: ImportConfigVO) => {
    emit('edit', record);
  };

  const handleDelete = (id: number) => {
    emit('delete', id);
  };

  const handleToggleEnabled = (id: number, enabled: boolean) => {
    emit('toggleEnabled', id, enabled);
  };
</script>

<style scoped lang="less">
  .config-list {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .config-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .config-icon {
        font-size: 24px;
        color: #165dff;
      }

      .config-info {
        .name {
          font-weight: 600;
          color: #1d2129;
        }

        .key {
          font-size: 12px;
          color: #86909c;
          font-family: monospace;
        }
      }
    }
  }
</style>
