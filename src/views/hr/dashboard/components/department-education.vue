<template>
  <div>
    <a-typography-title :heading="6" style="margin: 24px 0 16px">
      <icon-building style="margin-right: 8px; color: #86909c" />
      各科室学历梯队分布
    </a-typography-title>
    <a-card :bordered="false" hoverable class="dashboard-card">
      <template #extra>
        <a-space>
          <a-tree-select
            v-model="filterDeptIds"
            :data="treeData"
            :field-names="{
              key: 'deptId',
              title: 'deptName',
              children: 'children',
            }"
            placeholder="筛选科室..."
            multiple
            tree-checkable
            allow-clear
            :max-tag-count="1"
            style="width: 220px"
          />
          <a-button
            v-if="viewMode === 'table'"
            size="small"
            @click="handleExpandAll"
          >
            <template #icon><icon-expand /></template>
            展开全部
          </a-button>
          <a-button
            v-if="viewMode === 'table'"
            size="small"
            @click="handleCollapseAll"
          >
            <template #icon><icon-fold /></template>
            收起全部
          </a-button>
          <a-button
            size="small"
            :type="viewMode === 'table' ? 'primary' : 'secondary'"
            :class="{ 'view-mode-active': viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <template #icon><icon-list /></template>
            表格
          </a-button>
          <a-button
            size="small"
            :type="viewMode === 'chart' ? 'primary' : 'secondary'"
            :class="{ 'view-mode-active': viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            <template #icon><icon-bar-chart /></template>
            图表
          </a-button>
        </a-space>
      </template>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'">
        <a-table
          :columns="columns"
          :data="tableData"
          :pagination="false"
          :bordered="false"
          :hoverable="true"
          size="small"
          row-key="deptId"
          v-model:expanded-keys="expandedKeys"
        >
          <template #deptName="{ record }">
            <div class="dept-name-cell">
              <icon-folder
                v-if="record.children && record.children.length > 0"
                style="margin-right: 8px; color: #165dff"
              />
              <icon-file v-else style="margin-right: 8px; color: #86909c" />
              <span>{{ record.deptName }}</span>
            </div>
          </template>
          <template #totalEmployees="{ record }">
            <a-tag
              color="blue"
              size="small"
              style="cursor: pointer"
              @click="onCellClick(record, '全部')"
            >
              {{ record.totalEmployees }}
            </a-tag>
          </template>
          <template #doctorCount="{ record }">
            <a-tag
              v-if="record.doctorCount > 0"
              color="red"
              size="small"
              style="cursor: pointer"
              @click="onCellClick(record, '博士')"
            >
              {{ record.doctorCount }}
            </a-tag>
            <span v-else style="color: #c9cdd4">-</span>
          </template>
          <template #masterCount="{ record }">
            <a-tag
              v-if="record.masterCount > 0"
              color="orange"
              size="small"
              style="cursor: pointer"
              @click="onCellClick(record, '硕士')"
            >
              {{ record.masterCount }}
            </a-tag>
            <span v-else style="color: #c9cdd4">-</span>
          </template>
          <template #bachelorCount="{ record }">
            <a-tag
              v-if="record.bachelorCount > 0"
              color="green"
              size="small"
              style="cursor: pointer"
              @click="onCellClick(record, '本科')"
            >
              {{ record.bachelorCount }}
            </a-tag>
            <span v-else style="color: #c9cdd4">-</span>
          </template>
          <template #collegeCount="{ record }">
            <a-tag
              v-if="record.collegeCount > 0"
              color="cyan"
              size="small"
              style="cursor: pointer"
              @click="onCellClick(record, '大专')"
            >
              {{ record.collegeCount }}
            </a-tag>
            <span v-else style="color: #c9cdd4">-</span>
          </template>
          <template #noEducationCount="{ record }">
            <span
              v-if="record.noEducationCount > 0"
              style="color: #4e5969; cursor: pointer"
              @click="onCellClick(record, '无学历')"
            >
              {{ record.noEducationCount }}
            </span>
            <span v-else style="color: #c9cdd4">-</span>
          </template>
          <template #distribution="{ record }">
            <div class="distribution-bar">
              <a-popover
                v-for="item in getDistributionItems(record)"
                :key="item.label"
                position="top"
                trigger="hover"
                content-class="education-popover"
              >
                <template #content>
                  <div class="popover-content">
                    <div class="popover-header">
                      <icon-building class="header-icon" />
                      <span class="dept-name">{{ record.deptName }}</span>
                    </div>
                    <a-divider style="margin: 8px 0" />
                    <div class="popover-body">
                      <div class="stat-item">
                        <span class="label">{{ item.label }}</span>
                        <div class="value-wrapper">
                          <span class="count">{{ item.count }}</span>
                          <span class="unit">人</span>
                          <span class="percent">({{ item.percent }}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div
                  class="distribution-item"
                  :style="{
                    width: item.percent + '%',
                    backgroundColor: item.color,
                  }"
                  @click="onBarClick(record, item)"
                ></div>
              </a-popover>
            </div>
          </template>
        </a-table>
      </div>

      <!-- 图表视图 -->
      <div v-else>
        <Chart
          :options="chartOption"
          height="400px"
          style="cursor: pointer"
          @click="onChartClick"
        />
      </div>
    </a-card>

    <!-- 科室学历详情抽屉 -->
    <DeptEduDetailModal
      v-model="detailVisible"
      :dept-id="detailDeptId"
      :dept-name="detailDeptName"
      :degree="detailDegree"
      :degree-name="detailDegreeName"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Chart from '@/components/chart/index.vue';
  import useChartOption from '@/hooks/chart-option';
  import { DashboardData, DepartmentEducationStat } from '@/api/hr/dashboard';
  import DeptEduDetailModal from './dept-edu-detail-drawer.vue';

  const props = defineProps<{
    data: DashboardData;
  }>();

  const viewMode = ref<'table' | 'chart'>('table');
  const expandedKeys = ref<string[]>([]);
  const filterDeptIds = ref<string[]>([]); // 存储选中的科室ID

  // 详情抽屉状态
  const detailVisible = ref(false);
  const detailDeptId = ref('');
  const detailDeptName = ref('');
  const detailDegree = ref(0);
  const detailDegreeName = ref('');

  // 学历映射
  const DEGREE_MAP: Record<string, number> = {
    博士: 5,
    硕士: 4,
    本科: 3,
    大专: 2,
    无学历: 0,
    全部: -1,
  };

  const onChartClick = (params: any) => {
    const { seriesName, name } = params;
    const degree = DEGREE_MAP[seriesName];
    if (degree === undefined) return;

    // 找到对应的科室ID
    const flattened = flattenDepts(treeData.value, 1000);
    const dept = flattened.find((d) => d.deptName === name);
    if (!dept) return;

    detailDeptId.value = dept.deptId;
    detailDeptName.value = dept.deptName;
    detailDegree.value = degree;
    detailDegreeName.value = seriesName;
    detailVisible.value = true;
  };

  /** 处理表格分布条点击 */
  const onBarClick = (record: DepartmentEducationStat, item: any) => {
    const degree = DEGREE_MAP[item.label];
    if (degree === undefined) return;

    detailDeptId.value = record.deptId;
    detailDeptName.value = record.deptName;
    detailDegree.value = degree;
    detailDegreeName.value = item.label;
    detailVisible.value = true;
  };

  /** 处理表格数字点击 */
  const onCellClick = (record: DepartmentEducationStat, degreeName: string) => {
    const degree = DEGREE_MAP[degreeName];
    if (degree === undefined) return;

    detailDeptId.value = record.deptId;
    detailDeptName.value = record.deptName;
    detailDegree.value = degree;
    detailDegreeName.value = degreeName;
    detailVisible.value = true;
  };

  // 辅助函数：扁平化
  const flattenDepts = (
    depts: DepartmentEducationStat[],
    maxCount = 1000
  ): DepartmentEducationStat[] => {
    const result: DepartmentEducationStat[] = [];
    const traverse = (items: DepartmentEducationStat[]) => {
      items.forEach((item) => {
        if (result.length >= maxCount) return;
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(depts);
    return result;
  };

  // 原始树形数据
  const treeData = computed(() => {
    return props.data.departmentEducationStats || [];
  });

  // 根据筛选条件计算展示的数据
  const tableData = computed(() => {
    const allData = treeData.value;
    if (!filterDeptIds.value || filterDeptIds.value.length === 0) {
      return allData;
    }

    // 递归筛选选中的节点及其子节点
    const filterNodes = (
      nodes: DepartmentEducationStat[]
    ): DepartmentEducationStat[] => {
      const result: DepartmentEducationStat[] = [];
      nodes.forEach((node) => {
        // 如果当前节点被选中，直接加入结果
        if (filterDeptIds.value.includes(node.deptId)) {
          result.push(node);
        } else if (node.children && node.children.length > 0) {
          // 递归处理子节点
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            // 如果子节点有选中的，保留当前节点但只展示选中的子节点
            result.push({ ...node, children: filteredChildren });
          }
        }
      });
      return result;
    };

    return filterNodes(allData);
  });

  // 获取所有节点的key（用于展开/收起）
  const getAllKeys = (data: DepartmentEducationStat[]): string[] => {
    const keys: string[] = [];
    const traverse = (items: DepartmentEducationStat[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          keys.push(item.deptId);
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  // 获取所有节点的ID（包括叶子节点）
  const getAllDeptIds = (data: DepartmentEducationStat[]): string[] => {
    const ids: string[] = [];
    const traverse = (items: DepartmentEducationStat[]) => {
      items.forEach((item) => {
        ids.push(item.deptId);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };
    traverse(data);
    return ids;
  };

  // 监听数据变化，默认全选所有科室，并默认展开所有节点
  watch(
    () => props.data.departmentEducationStats,
    (newData) => {
      if (newData && newData.length > 0) {
        if (filterDeptIds.value.length === 0) {
          filterDeptIds.value = getAllDeptIds(newData);
        }
        // 默认展开所有有子节点的节点
        expandedKeys.value = getAllKeys(newData);
      }
    },
    { immediate: true }
  );

  // 监听表格数据变化，当筛选后也自动展开所有节点
  watch(
    () => tableData.value,
    (newData) => {
      if (newData && newData.length > 0) {
        // 确保展开所有有子节点的节点
        const keys = getAllKeys(newData);
        if (keys.length > 0) {
          expandedKeys.value = keys;
        }
      }
    }
  );

  // 展开全部
  const handleExpandAll = () => {
    expandedKeys.value = getAllKeys(tableData.value);
  };

  // 收起全部
  const handleCollapseAll = () => {
    expandedKeys.value = [];
  };

  const columns = [
    {
      title: '科室名称',
      dataIndex: 'deptName',
      width: 200,
      fixed: 'left',
      slotName: 'deptName',
    },
    {
      title: '总人数',
      dataIndex: 'totalEmployees',
      width: 100,
      slotName: 'totalEmployees',
    },
    {
      title: '博士',
      dataIndex: 'doctorCount',
      width: 80,
      slotName: 'doctorCount',
    },
    {
      title: '硕士',
      dataIndex: 'masterCount',
      width: 80,
      slotName: 'masterCount',
    },
    {
      title: '本科',
      dataIndex: 'bachelorCount',
      width: 80,
      slotName: 'bachelorCount',
    },
    {
      title: '大专',
      dataIndex: 'collegeCount',
      width: 80,
      slotName: 'collegeCount',
    },
    {
      title: '无学历',
      dataIndex: 'noEducationCount',
      width: 80,
      slotName: 'noEducationCount',
    },
    {
      title: '学历分布',
      slotName: 'distribution',
      width: 200,
    },
  ];

  const getDistributionItems = (record: DepartmentEducationStat) => {
    const total = record.totalEmployees;
    if (total === 0) return [];

    const items = [
      { label: '博士', count: record.doctorCount, color: '#F53F3F' },
      { label: '硕士', count: record.masterCount, color: '#F77234' },
      { label: '本科', count: record.bachelorCount, color: '#00B42A' },
      { label: '大专', count: record.collegeCount, color: '#165DFF' },
      { label: '无学历', count: record.noEducationCount, color: '#86909c' },
    ];

    return items
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        percent: ((item.count / total) * 100).toFixed(1),
      }));
  };

  // 图表配置
  const { chartOption } = useChartOption(() => {
    const data = tableData.value;
    if (!data || data.length === 0) {
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

    const topDepts = flattenDepts(data, 10);
    const deptNames = topDepts.map((d) => d.deptName);

    return {
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
          let result = `${params[0].name}<br/>`;
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}人<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['博士', '硕士', '本科', '大专'],
        top: 10,
        textStyle: {
          fontSize: 12,
          color: '#4e5969',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%', // 增加底部间距
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: deptNames,
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
          rotate: 30, // 旋转角度调小一点
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
          name: '博士',
          type: 'bar',
          stack: 'education',
          barWidth: 22,
          emphasis: {
            focus: 'series',
          },
          data: topDepts.map((d) => d.doctorCount),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#F53F3F' },
                { offset: 1, color: '#F76560' },
              ],
            },
          },
        },
        {
          name: '硕士',
          type: 'bar',
          stack: 'education',
          emphasis: {
            focus: 'series',
          },
          data: topDepts.map((d) => d.masterCount),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#F77234' },
                { offset: 1, color: '#F99368' },
              ],
            },
          },
        },
        {
          name: '本科',
          type: 'bar',
          stack: 'education',
          emphasis: {
            focus: 'series',
          },
          data: topDepts.map((d) => d.bachelorCount),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#00B42A' },
                { offset: 1, color: '#34D399' },
              ],
            },
          },
        },
        {
          name: '大专',
          type: 'bar',
          stack: 'education',
          emphasis: {
            focus: 'series',
          },
          data: topDepts.map((d) => d.collegeCount),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#165DFF' },
                { offset: 1, color: '#4E89FF' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
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

  .distribution-bar {
    display: flex;
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f2f3f5;

    .distribution-item {
      height: 100%;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .dept-name-cell {
    display: flex;
    align-items: center;
  }

  // Popover 美化样式
  .popover-content {
    min-width: 160px;
    padding: 4px;

    .popover-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .header-icon {
        color: #86909c;
        font-size: 14px;
      }

      .dept-name {
        font-weight: 600;
        color: #1d2129;
        font-size: 14px;
      }
    }

    .popover-body {
      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          color: #4e5969;
          font-size: 13px;
        }

        .value-wrapper {
          display: flex;
          align-items: baseline;
          gap: 2px;

          .count {
            font-weight: 700;
            color: #165dff;
            font-size: 16px;
          }

          .unit {
            font-size: 12px;
            color: #86909c;
            margin-right: 4px;
          }

          .percent {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }
  }

  // 确保弹出层阴影和圆角更精致
  :deep(.education-popover) {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
    border-radius: 8px !important;
    border: 1px solid #f2f3f5 !important;

    .arco-popover-content {
      padding: 12px !important;
    }
  }

  // 视图切换按钮选中样式
  .view-mode-active {
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(22, 93, 255, 0.2);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 8px rgba(22, 93, 255, 0.3);
      transform: translateY(-1px);
    }
  }
</style>
