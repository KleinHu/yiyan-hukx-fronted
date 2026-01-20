<template>
  <a-row :gutter="20">
    <a-col :span="6">
      <a-card
        title="年龄分布占比"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart :options="ageChartOption" height="260px" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="学历明细占比"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart :options="eduChartOption" height="260px" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="岗位分类分布"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart :options="categoryChartOption" height="260px" />
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card
        title="职称等级分布"
        :bordered="false"
        hoverable
        class="dashboard-card"
      >
        <Chart :options="levelChartOption" height="260px" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  // import { computed } from 'vue';
  import Chart from '@/components/chart/index.vue';
  import useChartOption from '@/hooks/chart-option';
  import { DashboardData } from '@/api/hr/dashboard';

  const props = defineProps<{
    data: DashboardData;
  }>();

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
    const data = educationDistribution.map((i) => ({
      name: i.label.split(' ')[0] || i.label,
      value: i.total || i.value,
    }));
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
          color: ['#8E82F2', '#16B2EB', '#F7B500', '#4DCCB4'],
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
