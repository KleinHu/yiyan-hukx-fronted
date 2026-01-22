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
  import { ref, onMounted } from 'vue';
  import dashboardApi, { DashboardData } from '@/api/hr/dashboard';
  import SummaryCards from './components/summary-cards.vue';
  import HonorStats from './components/honor-stats.vue';
  import ChartSection from './components/chart-section.vue';
  import DepartmentEducation from './components/department-education.vue';

  const loading = ref(false);

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

  const dashboardData = ref<DashboardData>(defaultDashboardData);

  const fetchDashboardData = async () => {
    try {
      loading.value = true;
      const res = await dashboardApi.getDashboardData();
      if (res.code === 200 && res.data) {
        // 合并API返回的数据和默认数据，确保所有字段都有值
        dashboardData.value = {
          overview: {
            ...defaultDashboardData.overview,
            ...res.data.overview,
          },
          // 年龄结构（用于图表展示）
          ageStructure: res.data.ageStructure || [],
          // 学历分布（用于图表展示）
          educationDistribution: res.data.educationDistribution || [],
          // 技术人员分析（已删除，不再使用）
          technicalStaffAnalysis: [],
          rankDistribution:
            res.data.rankDistribution?.length > 0
              ? res.data.rankDistribution
              : defaultDashboardData.rankDistribution,
          jobCategoryDistribution:
            res.data.jobCategoryDistribution?.length > 0
              ? res.data.jobCategoryDistribution
              : defaultDashboardData.jobCategoryDistribution,
          rankLevelDistribution: res.data.rankLevelDistribution || [],
          honorStats:
            res.data.honorStats?.length > 0
              ? res.data.honorStats
              : defaultDashboardData.honorStats,
          mentoringStats: {
            ...defaultDashboardData.mentoringStats,
            ...res.data.mentoringStats,
          },
          teachingLeaderboard:
            res.data.teachingLeaderboard?.length > 0
              ? res.data.teachingLeaderboard
              : defaultDashboardData.teachingLeaderboard,
          trainingStats:
            res.data.trainingStats?.length > 0
              ? res.data.trainingStats
              : defaultDashboardData.trainingStats,
          departmentEducationStats:
            res.data.departmentEducationStats?.length > 0
              ? res.data.departmentEducationStats
              : res.data.departmentEducationStats || [], // 使用后端返回的数据，即使为空数组
        };
      } else {
        // API返回异常时使用默认数据
        dashboardData.value = { ...defaultDashboardData };
      }
    } catch (error) {
      // 请求失败时使用默认数据
      dashboardData.value = { ...defaultDashboardData };
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchDashboardData();
  });
</script>
