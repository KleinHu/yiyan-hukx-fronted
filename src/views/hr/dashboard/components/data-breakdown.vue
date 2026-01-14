<template>
  <div>
    <a-typography-title :heading="6" style="margin: 24px 0 16px">
      <icon-layers style="margin-right: 8px; color: #86909c" />
      数据明细拆解
    </a-typography-title>
    <a-row :gutter="20" style="margin-bottom: 20px">
      <a-col :span="6">
        <a-card
          title="年龄结构"
          :bordered="false"
          hoverable
          class="dashboard-card"
        >
          <a-space
            v-for="item in data.ageStructure"
            :key="item.label"
            direction="vertical"
            :size="8"
            style="width: 100%; margin-bottom: 20px"
          >
            <a-space style="width: 100%" justify="space-between">
              <span style="font-size: 13px; color: #4e5969">{{
                item.label
              }}</span>
              <span style="font-weight: 600; color: #1d2129">{{
                item.value
              }}</span>
            </a-space>
            <a-progress
              :percent="
                data.overview.totalEmployees
                  ? item.value / data.overview.totalEmployees
                  : 0
              "
              :show-text="false"
              :stroke-width="8"
              color="#8E82F2"
            />
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          title="学历分布"
          :bordered="false"
          hoverable
          class="dashboard-card"
        >
          <a-space
            v-for="item in data.educationDistribution"
            :key="item.label"
            direction="vertical"
            :size="8"
            style="width: 100%; margin-bottom: 20px"
          >
            <a-space style="width: 100%" justify="space-between">
              <span style="font-size: 13px; color: #4e5969">{{
                item.label
              }}</span>
              <a-space direction="vertical" :size="2" align="end">
                <span style="font-weight: 600; color: #1d2129">{{
                  item.value
                }}</span>
                <span style="font-size: 11px; color: #86909c"
                  >总计: {{ item.total }}</span
                >
              </a-space>
            </a-space>
            <a-progress
              :percent="item.total ? item.value / item.total : 0"
              :show-text="false"
              :stroke-width="8"
              color="#4DCCB4"
            />
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          title="技术人员分析"
          :bordered="false"
          hoverable
          class="dashboard-card"
        >
          <a-space
            v-for="item in data.technicalStaffAnalysis"
            :key="item.label"
            direction="vertical"
            :size="8"
            style="width: 100%; margin-bottom: 20px"
          >
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
              color="#16B2EB"
            />
          </a-space>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card
          title="职称分布"
          :bordered="false"
          hoverable
          class="dashboard-card"
        >
          <a-space
            v-for="item in data.rankDistribution"
            :key="item.label"
            direction="vertical"
            :size="8"
            style="width: 100%; margin-bottom: 20px"
          >
            <a-space style="width: 100%" justify="space-between">
              <span style="font-size: 13px; color: #4e5969">{{
                item.label
              }}</span>
              <span style="font-weight: 600; color: #1d2129">{{
                item.value
              }}</span>
            </a-space>
            <a-progress
              :percent="item.value / 50"
              :show-text="false"
              :stroke-width="8"
              color="#8E82F2"
            />
          </a-space>
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
