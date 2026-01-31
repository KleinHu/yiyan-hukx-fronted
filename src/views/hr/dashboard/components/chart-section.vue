<template>
  <a-row :gutter="20">
    <a-col :span="6">
      <a-card
        title="年龄分布占比"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart
          :options="ageChartOption"
          height="260px"
          style="cursor: pointer"
          @click="onAgeChartClick"
        />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="学历明细占比"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart
          :options="eduChartOption"
          height="260px"
          style="cursor: pointer"
          @click="onEduChartClick"
        />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="岗位分类分布"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart
          :options="categoryChartOption"
          height="260px"
          style="cursor: pointer"
          @click="onCategoryChartClick"
        />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="职称等级分布"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart
          :options="levelChartOption"
          height="260px"
          style="cursor: pointer"
          @click="onLevelChartClick"
        />
      </a-card>
    </a-col>
  </a-row>

  <!-- 学历占比点击详情弹窗 -->
  <EducationDetailModal
    v-model="eduDetailVisible"
    :degree-name="eduDetailTitle"
    :degree="eduDetailDegree"
  />

  <!-- 岗位分类分布点击详情弹窗 -->
  <JobCategoryDetailModal
    v-model="categoryDetailVisible"
    :category-name="categoryDetailTitle"
    :job-category="categoryDetailValue"
  />

  <!-- 年龄分布点击详情弹窗 -->
  <AgeDetailModal
    v-model="ageDetailVisible"
    :age-range-name="ageDetailTitle"
    :min-age="ageDetailMinAge"
    :max-age="ageDetailMaxAge"
  />

  <!-- 职称等级分布点击详情弹窗 -->
  <TitleLevelDetailModal
    v-model="levelDetailVisible"
    :title-level-name="levelDetailTitle"
    :title-level="levelDetailValue"
  />

  <!-- 职级分布点击详情弹窗 -->
  <RankDetailModal v-model="rankDetailVisible" :rank-name="rankDetailTitle" />

  <!-- 职级等级分布 - 单独一行 -->
  <a-row :gutter="20" style="margin-top: 20px">
    <a-col :span="24">
      <a-card
        title="职级等级分布"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart
          :options="rankChartOption"
          height="400px"
          style="cursor: pointer"
          @click="onRankChartClick"
        />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Chart from '@/components/chart/index.vue';
  import useChartOption from '@/hooks/chart-option';
  import { DashboardData } from '@/api/hr/dashboard';
  import EducationDetailModal from './education-detail-drawer.vue';
  import JobCategoryDetailModal from './job-category-detail-drawer.vue';
  import AgeDetailModal from './age-detail-drawer.vue';
  import TitleLevelDetailModal from './title-level-detail-drawer.vue';
  import RankDetailModal from './rank-detail-drawer.vue';

  const props = defineProps<{
    data: DashboardData;
  }>();

  /** 学历名称 -> 学历值（与看板统计一致：0-无学历，2-大专，3-本科，4-硕士，5-博士） */
  const DEGREE_NAME_TO_VALUE: Record<string, number> = {
    博士: 5,
    硕士: 4,
    本科: 3,
    大专: 2,
    无学历: 0,
  };

  /** 岗位分类名称 -> 岗位分类值（与看板统计一致：1-技术岗，2-职能岗，3-技能岗） */
  const JOB_CATEGORY_NAME_TO_VALUE: Record<string, number> = {
    技术岗: 1,
    职能岗: 2,
    技能岗: 3,
  };

  /** 年龄区间名称 -> { minAge?, maxAge? }（与后端一致：maxAge 不含，minAge 含） */
  const AGE_RANGE_NAME_TO_PARAMS: Record<
    string,
    { minAge?: number; maxAge?: number }
  > = {
    '25岁以下': { maxAge: 25 },
    '25-35岁': { minAge: 25, maxAge: 35 },
    '35-45岁': { minAge: 35, maxAge: 45 },
    '45-55岁': { minAge: 45, maxAge: 55 },
    '55岁以上': { minAge: 55 },
  };

  /** 职称等级名称 -> 职称等级值（与看板统计一致：1-初级，2-中级，3-副高级，4-正高级） */
  const TITLE_LEVEL_NAME_TO_VALUE: Record<string, number> = {
    初级: 1,
    中级: 2,
    副高级: 3,
    正高级: 4,
  };

  const eduDetailVisible = ref(false);
  const eduDetailTitle = ref('');
  const eduDetailDegree = ref(0);

  const categoryDetailVisible = ref(false);
  const categoryDetailTitle = ref('');
  const categoryDetailValue = ref(1);

  const ageDetailVisible = ref(false);
  const ageDetailTitle = ref('');
  const ageDetailMinAge = ref<number | undefined>(undefined);
  const ageDetailMaxAge = ref<number | undefined>(undefined);

  const levelDetailVisible = ref(false);
  const levelDetailTitle = ref('');
  const levelDetailValue = ref(1);

  const rankDetailVisible = ref(false);
  const rankDetailTitle = ref('');

  const onEduChartClick = (params: { name?: string }) => {
    const name = params?.name?.trim() || '';
    const degree = DEGREE_NAME_TO_VALUE[name];
    if (degree === undefined) return;
    eduDetailTitle.value = name;
    eduDetailDegree.value = degree;
    eduDetailVisible.value = true;
  };

  const onCategoryChartClick = (params: { name?: string }) => {
    const name = params?.name?.trim() || '';
    const jobCategory = JOB_CATEGORY_NAME_TO_VALUE[name];
    if (jobCategory === undefined) return;
    categoryDetailTitle.value = name;
    categoryDetailValue.value = jobCategory;
    categoryDetailVisible.value = true;
  };

  const onAgeChartClick = (params: { name?: string }) => {
    const name = params?.name?.trim() || '';
    const range = AGE_RANGE_NAME_TO_PARAMS[name];
    if (!range) return;
    ageDetailTitle.value = name;
    ageDetailMinAge.value = range.minAge;
    ageDetailMaxAge.value = range.maxAge;
    ageDetailVisible.value = true;
  };

  const onLevelChartClick = (params: { name?: string }) => {
    const name = params?.name?.trim() || '';
    const titleLevel = TITLE_LEVEL_NAME_TO_VALUE[name];
    if (titleLevel === undefined) return;
    levelDetailTitle.value = name;
    levelDetailValue.value = titleLevel;
    levelDetailVisible.value = true;
  };

  const onRankChartClick = (params: { name?: string }) => {
    const name = params?.name?.trim() || '';
    if (!name) return;
    rankDetailTitle.value = name;
    rankDetailVisible.value = true;
  };

  // 年龄分布柱状图
  const { chartOption: ageChartOption } = useChartOption(() => {
    const { ageStructure } = props.data;
    return {
      grid: {
        left: '12%',
        right: '8%',
        top: '12%',
        bottom: '15%',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [8, 12],
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}人`;
        },
      },
      xAxis: {
        type: 'category',
        data: ageStructure.map((i) => i.label),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: '#4e5969',
          fontWeight: 500,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e5e6eb',
            width: 1,
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: '#86909c',
        },
      },
      series: [
        {
          name: '人数',
          data: ageStructure.map((i) => i.value),
          type: 'bar',
          barWidth: 28,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#16B2EB',
                },
                {
                  offset: 1,
                  color: '#4DCCB4',
                },
              ],
            },
            shadowBlur: 8,
            shadowColor: 'rgba(22, 178, 235, 0.3)',
            shadowOffsetY: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(22, 178, 235, 0.5)',
              shadowOffsetY: 4,
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            fontWeight: 600,
            color: '#1d2129',
            formatter: '{c}',
          },
          animationDelay: (idx: number) => idx * 100,
        },
      ],
    };
  });

  // 学历分布饼图 (Donut)
  const { chartOption: eduChartOption } = useChartOption(() => {
    const { educationDistribution } = props.data;
    // 定义颜色映射：无学历使用灰色
    const colorMap: Record<string, string> = {
      博士: '#8E82F2',
      硕士: '#16B2EB',
      本科: '#F7B500',
      大专: '#4DCCB4',
      无学历: '#86909c', // 灰色
    };

    const data = educationDistribution.map((i) => {
      const name = i.label.split(' ')[0] || i.label;
      return {
        name,
        value: i.value, // 使用实际人数，不是总员工数
        itemStyle: {
          color: colorMap[name] || '#8E82F2', // 如果找不到映射，使用默认颜色
        },
      };
    });
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      legend: {
        orient: 'vertical',
        right: '8%',
        top: 'middle',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 16,
        textStyle: {
          fontSize: 13,
          color: '#4e5969',
          fontWeight: 500,
        },
        formatter: (name: string) => {
          const item = data.find((i) => i.name === name);
          if (item) {
            const percent = ((item.value / total) * 100).toFixed(1);
            return `${name}  ${percent}%`;
          }
          return name;
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [8, 12],
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              scale: true,
              scaleSize: 5,
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
            },
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100,
        },
      ],
    };
  });

  // 岗位分类饼图
  const { chartOption: categoryChartOption } = useChartOption(() => {
    const { jobCategoryDistribution } = props.data;
    const total = jobCategoryDistribution.reduce(
      (sum, item) => sum + item.value,
      0
    );

    return {
      legend: {
        orient: 'vertical',
        right: '8%',
        top: 'middle',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 16,
        textStyle: {
          fontSize: 13,
          color: '#4e5969',
          fontWeight: 500,
        },
        formatter: (name: string) => {
          const item = jobCategoryDistribution.find((i) => i.label === name);
          if (item) {
            const percent = ((item.value / total) * 100).toFixed(1);
            return `${name}  ${percent}%`;
          }
          return name;
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}人 ({d}%)',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [8, 12],
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              scale: true,
              scaleSize: 5,
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 600,
            },
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: jobCategoryDistribution.map((i) => ({
            name: i.label,
            value: i.value,
          })),
          color: ['#16B2EB', '#FF5B60', '#8E82F2'],
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: (idx: number) => idx * 100,
        },
      ],
    };
  });

  // 职称分布水平柱状图
  const { chartOption: levelChartOption } = useChartOption(() => {
    const { rankLevelDistribution } = props.data;
    if (!rankLevelDistribution || rankLevelDistribution.length === 0) {
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#86909c',
            fontSize: 14,
          },
        },
      };
    }
    const reversedData = [...rankLevelDistribution].reverse();
    const colors = ['#4DCCB4', '#16B2EB', '#8E82F2'];

    return {
      grid: {
        left: '18%',
        right: '12%',
        top: '12%',
        bottom: '12%',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [8, 12],
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}人`;
        },
      },
      xAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e5e6eb',
            width: 1,
          },
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: '#86909c',
        },
      },
      yAxis: {
        type: 'category',
        data: reversedData.map((i) => i.label),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 13,
          color: '#4e5969',
          fontWeight: 500,
        },
      },
      series: [
        {
          name: '人数',
          data: reversedData.map((i) => i.value),
          type: 'bar',
          barWidth: 28,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: (params: any) => {
              const colorIndex = params.dataIndex % colors.length;
              const baseColor = colors[colorIndex];
              const gradients: Record<string, { start: string; end: string }> =
                {
                  '#4DCCB4': { start: '#4DCCB4', end: '#68E0C9' },
                  '#16B2EB': { start: '#16B2EB', end: '#4DCCB4' },
                  '#8E82F2': { start: '#8E82F2', end: '#A396FF' },
                };
              const gradient = gradients[baseColor] || {
                start: baseColor,
                end: baseColor,
              };
              return {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: gradient.start,
                  },
                  {
                    offset: 1,
                    color: gradient.end,
                  },
                ],
              };
            },
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            shadowOffsetX: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 4,
            },
          },
          label: {
            show: true,
            position: 'right',
            fontSize: 12,
            fontWeight: 600,
            color: '#1d2129',
            formatter: '{c}',
            offset: [8, 0],
          },
          animationDelay: (idx: number) => idx * 100,
        },
      ],
    };
  });

  // 职级等级分布柱状图
  const { chartOption: rankChartOption } = useChartOption(() => {
    const { rankDistribution } = props.data;
    if (!rankDistribution || rankDistribution.length === 0) {
      return {
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#86909c',
            fontSize: 14,
          },
        },
      };
    }

    const rankNames = rankDistribution.map((i) => i.label);
    const rankValues = rankDistribution.map((i) => i.value);

    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '5%',
        top: '8%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        padding: [8, 12],
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>${param.seriesName}: ${param.value}人`;
        },
      },
      xAxis: {
        type: 'category',
        data: rankNames,
        axisLine: {
          lineStyle: {
            color: '#F2F3F5',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
          color: '#4e5969',
          rotate: 30, // 旋转角度
          interval: 0,
          margin: 15,
        },
      },
      yAxis: {
        type: 'value',
        name: '人数',
        nameTextStyle: {
          color: '#86909c',
          padding: [0, 0, 0, -30],
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#E5E6EB',
          },
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          name: '人数',
          data: rankValues,
          type: 'bar',
          barWidth: 28,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#8E82F2',
                },
                {
                  offset: 1,
                  color: '#A396FF',
                },
              ],
            },
            shadowBlur: 8,
            shadowColor: 'rgba(142, 130, 242, 0.3)',
            shadowOffsetY: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(142, 130, 242, 0.5)',
              shadowOffsetY: 4,
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            fontWeight: 600,
            color: '#1d2129',
            formatter: '{c}',
          },
          animationDelay: (idx: number) => idx * 50,
        },
      ],
    };
  });
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
