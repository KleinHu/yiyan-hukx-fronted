<template>
  <a-row :gutter="20">
    <a-col :span="6">
      <a-card :bordered="false" hoverable class="summary-card">
        <div class="card-content">
          <div class="info">
            <div class="label">全员总数</div>
            <div class="value">{{ data.overview.totalEmployees }}</div>
          </div>
          <a-avatar :size="48" shape="square" class="icon-wrapper bg-blue">
            <icon-user-group />
          </a-avatar>
        </div>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card :bordered="false" hoverable class="summary-card">
        <div class="card-content">
          <div class="info">
            <div class="label">新锐力量 (&lt;3年)</div>
            <div class="value-row">
              <span class="value">{{ data.overview.newHires3Years }}</span>
              <a-tag color="green" size="small" class="growth-tag">
                <template #icon><icon-caret-up /></template>
                {{ formattedGrowth }}%
              </a-tag>
            </div>
          </div>
          <a-avatar :size="48" shape="square" class="icon-wrapper bg-purple">
            <icon-user-add />
          </a-avatar>
        </div>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card :bordered="false" hoverable class="summary-card">
        <div class="card-content">
          <div class="info">
            <div class="label">荣誉总数</div>
            <div class="value">{{ data.overview.totalHonors || 0 }}</div>
          </div>
          <a-avatar :size="48" shape="square" class="icon-wrapper bg-orange">
            <icon-trophy />
          </a-avatar>
        </div>
      </a-card>
    </a-col>
    <a-col :span="6">
      <a-card :bordered="false" hoverable class="summary-card">
        <div class="card-content">
          <div class="info">
            <div class="label">新增荣誉 (&lt;3年)</div>
            <div class="value">{{ data.overview.newHonors3Years || 0 }}</div>
          </div>
          <a-avatar :size="48" shape="square" class="icon-wrapper bg-green">
            <icon-star />
          </a-avatar>
        </div>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { DashboardData } from '@/api/hr/dashboard';

  const props = defineProps<{
    data: DashboardData;
  }>();

  // 格式化增长率为整数
  const formattedGrowth = computed(() => {
    return Math.round(props.data.overview.newHiresGrowth || 0);
  });
</script>

<style scoped lang="less">
  .summary-card {
    border-radius: 12px;
    transition: all 0.3s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    :deep(.arco-card-body) {
      padding: 20px 24px;
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info {
        .label {
          color: var(--color-text-3);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .value-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-1);
          line-height: 1.2;

          .unit {
            font-size: 14px;
            font-weight: normal;
            color: var(--color-text-3);
            margin-left: 4px;
          }
        }

        .growth-tag {
          border-radius: 4px;
          font-weight: 600;
        }
      }

      .icon-wrapper {
        border-radius: 12px;
        font-size: 24px;
        color: #fff;

        &.bg-blue {
          background: linear-gradient(135deg, #165dff 0%, #3491fa 100%);
        }
        &.bg-purple {
          background: linear-gradient(135deg, #8e82f2 0%, #a396ff 100%);
        }
        &.bg-orange {
          background: linear-gradient(135deg, #ff7d00 0%, #ff9a2e 100%);
        }
        &.bg-green {
          background: linear-gradient(135deg, #00b42a 0%, #23c343 100%);
        }
      }
    }
  }
</style>
