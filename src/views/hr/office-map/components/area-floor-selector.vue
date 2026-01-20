<template>
  <div class="area-floor-selector">
    <div class="selector-wrapper">
      <!-- 办公楼选择器 -->
      <div class="selector-item">
        <label class="selector-label">
          <icon-building />
          <span>办公楼</span>
        </label>
        <a-select
          v-model="selectedBuilding"
          :placeholder="buildingPlaceholder"
          :allow-clear="allowClear"
          :allow-search="allowSearch"
          style="flex: 1"
          @change="handleBuildingChange"
        >
          <a-option
            v-for="area in areaList"
            :key="area.buildingCode"
            :value="area.buildingCode"
            :label="area.buildingName"
          >
            <div class="option-content">
              <icon-building />
              <span class="option-text">{{ area.buildingName }}</span>
              <span class="option-info">({{ area.floors.length }}个楼层)</span>
            </div>
          </a-option>
        </a-select>
      </div>

      <!-- 楼层选择器 -->
      <div class="selector-item">
        <label class="selector-label">
          <icon-location />
          <span>楼层</span>
        </label>
        <a-select
          v-model="selectedFloor"
          :placeholder="floorPlaceholder"
          :allow-clear="allowClear"
          :disabled="!selectedBuilding"
          style="flex: 1"
          @change="handleFloorChange"
        >
          <a-option
            v-for="floor in currentFloors"
            :key="floor.floor"
            :value="floor.floor"
            :label="floor.floorName"
          >
            <div class="option-content">
              <icon-location />
              <span class="option-text">{{ floor.floorName }}</span>
              <span class="option-info">({{ floor.employeeCount }}人)</span>
            </div>
          </a-option>
        </a-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, nextTick } from 'vue';
  import officeApi from '@/api/hr/office';
  import type { OfficeArea, FloorInfo } from '@/api/hr/types';

  const props = defineProps<{
    modelValue?: string; // 当前选中的楼层标识，格式：buildingCode-floor，如：201-1F
    placeholder?: string;
    buildingPlaceholder?: string;
    floorPlaceholder?: string;
    allowClear?: boolean;
    allowSearch?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', floor: string, buildingCode?: string): void;
  }>();

  const areaList = ref<OfficeArea[]>([]);
  const selectedBuilding = ref<string>('');
  const selectedFloor = ref<string>('');

  // 当前办公楼的楼层列表
  const currentFloors = computed<FloorInfo[]>(() => {
    if (!selectedBuilding.value) return [];
    const area = areaList.value.find(
      (a) => a.buildingCode === selectedBuilding.value
    );
    return area?.floors || [];
  });

  // 监听外部值变化（从父组件传入的 modelValue）
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        // 解析楼层标识，格式：buildingCode-floor，如 '201-1F'
        const parts = newValue.split('-');
        if (parts.length >= 2) {
          const buildingCode = parts[0];
          // 只有当值真正变化时才更新，避免循环触发
          if (
            selectedBuilding.value !== buildingCode ||
            selectedFloor.value !== newValue
          ) {
            selectedBuilding.value = buildingCode;
            selectedFloor.value = newValue;
          }
        }
      } else {
        selectedBuilding.value = '';
        selectedFloor.value = '';
      }
    },
    { immediate: true }
  );

  // 办公楼变化时，清空楼层选择，并选择第一个楼层
  const handleBuildingChange = (buildingCode: string) => {
    if (!buildingCode) {
      selectedFloor.value = '';
      emit('update:modelValue', '');
      emit('change', '');
      return;
    }

    // 如果当前选中的楼层不属于新选择的办公楼，则选择该办公楼的第一个楼层
    const area = areaList.value.find((a) => a.buildingCode === buildingCode);
    if (area && area.floors.length > 0) {
      const currentFloorBelongsToBuilding = area.floors.some(
        (f) => f.floor === selectedFloor.value
      );
      if (!currentFloorBelongsToBuilding) {
        // 自动选择第一个楼层
        const firstFloor = area.floors[0];
        selectedFloor.value = firstFloor.floor;
        emit('update:modelValue', firstFloor.floor);
        emit('change', firstFloor.floor, buildingCode);
      }
    }
  };

  // 楼层变化
  const handleFloorChange = (floor: string) => {
    if (!floor) {
      emit('update:modelValue', '');
      emit('change', '');
      return;
    }

    // eslint-disable-next-line no-console
    console.log('触发楼层切换事件:', floor, selectedBuilding.value);
    emit('update:modelValue', floor);
    emit('change', floor, selectedBuilding.value);
  };

  const loadAreaList = async () => {
    try {
      const response = await officeApi.getAreaList();
      if (response.code === 200 && response.data) {
        areaList.value = response.data;
        // 如果有默认值，设置选中
        if (props.modelValue && areaList.value.length > 0) {
          const parts = props.modelValue.split('-');
          if (parts.length >= 2) {
            const buildingCode = parts[0];
            selectedBuilding.value = buildingCode;
            selectedFloor.value = props.modelValue;
          }
        } else if (areaList.value.length > 0) {
          // 默认选择第一个区域的第一个楼层
          const firstArea = areaList.value[0];
          if (firstArea.floors.length > 0) {
            const firstFloor = firstArea.floors[0];
            selectedBuilding.value = firstArea.buildingCode;
            selectedFloor.value = firstFloor.floor;
            // 使用nextTick确保DOM更新后再触发事件
            nextTick(() => {
              emit('update:modelValue', firstFloor.floor);
              emit('change', firstFloor.floor, firstArea.buildingCode);
            });
          }
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('获取办公区域列表失败:', error);
    }
  };

  onMounted(() => {
    loadAreaList();
  });

  defineExpose({
    loadAreaList,
  });
</script>

<style scoped lang="less">
  .area-floor-selector {
    width: 100%;

    .selector-wrapper {
      display: flex;
      gap: 16px;
      align-items: center;

      .selector-item {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;

        .selector-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-2);
          cursor: default;
          white-space: nowrap;

          svg {
            font-size: 16px;
          }
        }
      }
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 8px;

      svg {
        font-size: 14px;
        color: var(--color-text-3);
      }

      .option-text {
        flex: 1;
        color: var(--color-text-1);
      }

      .option-info {
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }

  // 响应式设计：小屏幕下垂直排列
  @media (max-width: 768px) {
    .area-floor-selector {
      .selector-wrapper {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
    }
  }
</style>
