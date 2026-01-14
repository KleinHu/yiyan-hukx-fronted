<template>
  <a-card title="图例" class="legend-panel" :bordered="false">
    <div class="legend-content">
      <!-- 房间类型 -->
      <div class="legend-section">
        <div class="legend-title">房间类型</div>
        <div class="legend-items">
          <div v-for="item in roomTypes" :key="item.type" class="legend-item">
            <div
              class="legend-color"
              :style="{ backgroundColor: item.color }"
            />
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { RoomType } from '@/api/hr/types';

  const roomTypes = [
    { type: RoomType.OFFICE, label: '办公室', color: '#E3F2FD' },
    { type: RoomType.MEETING_ROOM, label: '会议室', color: '#F3E5F5' },
    { type: RoomType.BREAK_ROOM, label: '休息室', color: '#E8F5E9' },
    { type: RoomType.STORAGE, label: '储藏室', color: '#FFF3E0' },
    { type: RoomType.BATHROOM, label: '卫生间', color: '#F5F5F5' },
    { type: RoomType.CORRIDOR, label: '走廊', color: '#ECEFF1' },
  ];
</script>

<style scoped lang="less">
  .legend-panel {
    :deep(.arco-card-body) {
      padding: 16px;
    }
  }

  .legend-content {
    .legend-section {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .legend-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 12px;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }

    .legend-label {
      font-size: 13px;
      color: var(--color-text-2);
    }
  }
</style>
