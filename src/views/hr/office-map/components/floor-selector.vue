<template>
  <div class="floor-selector">
    <a-tabs
      v-model:active-key="activeFloor"
      type="rounded"
      @change="handleFloorChange"
    >
      <a-tab-pane
        v-for="floor in floorList"
        :key="floor.floor"
        :title="floor.floorName"
      >
        <template #title>
          <span class="floor-title">
            <icon-building />
            {{ floor.floorName }}
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import officeApi from '@/api/hr/office';
  import type { FloorInfo } from '@/api/hr/types';

  const props = defineProps<{
    modelValue?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', floor: string): void;
  }>();

  const floorList = ref<FloorInfo[]>([]);
  const activeFloor = ref<string>(props.modelValue || '');

  const handleFloorChange = (floor: string) => {
    activeFloor.value = floor;
    emit('update:modelValue', floor);
    emit('change', floor);
  };

  const loadFloorList = async () => {
    try {
      const response = await officeApi.getFloorList();
      if (response.code === 200 && response.data) {
        floorList.value = response.data;
        if (floorList.value.length > 0 && !activeFloor.value) {
          activeFloor.value = floorList.value[0].floor;
          handleFloorChange(activeFloor.value);
        }
      }
    } catch (error) {
      console.error('获取楼层列表失败:', error);
    }
  };

  onMounted(() => {
    loadFloorList();
  });

  defineExpose({
    loadFloorList,
  });
</script>

<style scoped lang="less">
  .floor-selector {
    :deep(.arco-tabs-nav-type-rounded) {
      .arco-tabs-tab {
        padding: 8px 20px;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
        }
      }

      .arco-tabs-tab-active {
        background-color: rgba(64, 158, 255, 0.15);
      }
    }

    .floor-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  @media (max-width: 768px) {
    .floor-selector {
      :deep(.arco-tabs-nav-type-rounded) {
        .arco-tabs-tab {
          padding: 6px 12px;
          font-size: 13px;
        }
      }
    }
  }
</style>
