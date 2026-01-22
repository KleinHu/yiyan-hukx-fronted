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
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
  import { DashboardData } from '@/api/hr/dashboard';

  defineProps<{
    data: DashboardData;
  }>();

  const getHonorColor = (level: string) => {
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
</style>
