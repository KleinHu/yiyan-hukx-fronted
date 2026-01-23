<template>
  <div
    style="
      padding: 20px;
      background-color: #f4f7f9;
      min-height: calc(100vh - 60px);
    "
  >
    <a-breadcrumb style="margin-bottom: 12px; padding-left: 4px">
      <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
      <a-breadcrumb-item>人事管理</a-breadcrumb-item>
      <a-breadcrumb-item>人事看板</a-breadcrumb-item>
    </a-breadcrumb>
    <a-spin :loading="loading" style="width: 100%">
      <SummaryCards :data="dashboardData" />
      <HonorStats :data="dashboardData" />
      <ChartSection :data="dashboardData" />
      <DepartmentEducation :data="dashboardData" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import useDashboard from '@/hooks/hr/dashboard';
  import { DashboardData } from '@/api/hr/dashboard';
  import SummaryCards from './components/summary-cards.vue';
  import HonorStats from './components/honor-stats.vue';
  import ChartSection from './components/chart-section.vue';
  import DepartmentEducation from './components/department-education.vue';

  // 使用 Hook
  const { loading, dashboardData: dashboardDataFromApi } = useDashboard();

  // 默认示例数据
  const defaultDashboardData: DashboardData = {
    overview: {
      totalEmployees: 156,
      newHires3Years: 42,
      newHiresGrowth: 12.5,
      averageAge: 32,
      totalHonors: 0,
      newHonors3Years: 0,
    },
    ageStructure: [
      { label: '25岁以下', value: 28 },
      { label: '25-30岁', value: 45 },
      { label: '30-35岁', value: 38 },
      { label: '35-40岁', value: 25 },
      { label: '40岁以上', value: 20 },
    ],
    educationDistribution: [
      { label: '博士', value: 8, total: 156 },
      { label: '硕士', value: 32, total: 156 },
      { label: '本科', value: 85, total: 156 },
      { label: '大专', value: 24, total: 156 },
    ],
    technicalStaffAnalysis: [],
    rankDistribution: [
      { label: '高级', value: 28 },
      { label: '中级', value: 65 },
      { label: '初级', value: 48 },
      { label: '其他', value: 15 },
    ],
    jobCategoryDistribution: [
      { label: '技术类', value: 95 },
      { label: '管理类', value: 28 },
      { label: '销售类', value: 18 },
      { label: '其他', value: 15 },
    ],
    rankLevelDistribution: [],
    honorStats: [
      { label: '国家级', value: 2 },
      { label: '省级', value: 5 },
      { label: '市级', value: 12 },
      { label: '集团级', value: 8 },
      { label: '公司级', value: 45 },
      { label: '部门级', value: 68 },
    ],
    mentoringStats: {
      activePairs: 24,
      totalTeachingHours: 156.5,
      mentoringTrend: [],
    },
    teachingLeaderboard: [],
    trainingStats: [
      { label: '技术开发类', value: 85 },
      { label: '安全合规类', value: 120 },
    ],
    departmentEducationStats: [],
  };

  // 合并API返回的数据和默认数据，确保所有字段都有值
  const dashboardData = computed(() => {
    const apiData = dashboardDataFromApi.value;
    if (!apiData) {
      return defaultDashboardData;
    }
    return {
      overview: {
        ...defaultDashboardData.overview,
        ...apiData.overview,
      },
      // 年龄结构（用于图表展示）
      ageStructure: apiData.ageStructure || [],
      // 学历分布（用于图表展示）
      educationDistribution: apiData.educationDistribution || [],
      // 技术人员分析（已删除，不再使用）
      technicalStaffAnalysis: [],
      rankDistribution:
        apiData.rankDistribution?.length > 0
          ? apiData.rankDistribution
          : defaultDashboardData.rankDistribution,
      jobCategoryDistribution:
        apiData.jobCategoryDistribution?.length > 0
          ? apiData.jobCategoryDistribution
          : defaultDashboardData.jobCategoryDistribution,
      rankLevelDistribution: apiData.rankLevelDistribution || [],
      honorStats:
        apiData.honorStats?.length > 0
          ? apiData.honorStats
          : defaultDashboardData.honorStats,
      mentoringStats: {
        ...defaultDashboardData.mentoringStats,
        ...apiData.mentoringStats,
      },
      teachingLeaderboard:
        apiData.teachingLeaderboard?.length > 0
          ? apiData.teachingLeaderboard
          : defaultDashboardData.teachingLeaderboard,
      trainingStats:
        apiData.trainingStats?.length > 0
          ? apiData.trainingStats
          : defaultDashboardData.trainingStats,
      departmentEducationStats:
        apiData.departmentEducationStats?.length > 0
          ? apiData.departmentEducationStats
          : apiData.departmentEducationStats || [], // 使用后端返回的数据，即使为空数组
    };
  });
</script>
