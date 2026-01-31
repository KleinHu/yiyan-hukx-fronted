<template>
  <div style="margin: 24px 0 16px">
    <a-row :gutter="20" style="margin-bottom: 20px">
      <a-col :span="24">
        <a-card
          title="各级荣誉统计"
          :bordered="false"
          hoverable
          class="dashboard-card"
        >
          <a-row :gutter="40">
            <a-col
              v-for="item in data.honorStats"
              :key="item.label"
              :span="8"
              style="margin-bottom: 20px"
            >
              <div class="honor-item-clickable" @click="openDrawer(item.label)">
                <a-space direction="vertical" :size="8" style="width: 100%">
                  <a-space style="width: 100%" justify="space-between">
                    <span style="font-size: 13px; color: #4e5969">{{
                      item.label
                    }}</span>
                    <span style="font-weight: 600; color: #1d2129">{{
                      item.value
                    }}</span>
                  </a-space>
                  <a-progress
                    :percent="item.value / 100"
                    :show-text="false"
                    :stroke-width="8"
                    :color="getHonorColor(item.label)"
                  />
                </a-space>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    <honor-level-detail-drawer
      v-model="drawerVisible"
      :reward-level="drawerRewardLevel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { DashboardData } from '@/api/hr/dashboard';
  import HonorLevelDetailDrawer from './honor-level-detail-drawer.vue';

  defineProps<{
    data: DashboardData;
  }>();

  const drawerVisible = ref(false);
  const drawerRewardLevel = ref('');

  /**
   * 打开某级别荣誉的详情抽屉
   */
  const openDrawer = (label: string): void => {
    drawerRewardLevel.value = label;
    drawerVisible.value = true;
  };

  const getHonorColor = (level: string): string => {
    const colorMap: Record<string, string> = {
      国家级: '#F53F3F',
      省级: '#F77234',
      市级: '#F7BA1E',
      集团级: '#00B42A',
      公司级: '#165DFF',
      部门级: '#86909C',
    };
    return colorMap[level] || '#165DFF';
  };
</script>

<style scoped lang="less">
  .dashboard-card {
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
  }

  .honor-item-clickable {
    cursor: pointer;
    padding: 4px 0;
    border-radius: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-fill-2);
    }
  }
</style>
