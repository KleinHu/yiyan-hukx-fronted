<template>
  <div class="upload-progress">
    <div class="progress-content">
      <div class="progress-header-info">
        <div class="progress-main-title">
          <span class="percentage-num"
            >{{ Math.round(progress.percentage * 100) }}%</span
          >
          <span class="status-badge" :class="progress.status">{{
            statusText
          }}</span>
        </div>
        <div class="progress-sub-info">
          预计剩余时间: <strong>{{ formatTime(estimatedTime) }}</strong> |
          处理速度: <strong>{{ uploadSpeed }} 条/秒</strong>
        </div>
      </div>

      <!-- 手写横向进度条 -->
      <div class="custom-linear-progress">
        <div class="progress-track">
          <div
            class="progress-bar-fill"
            :class="progress.status"
            :style="{ width: `${progress.percentage * 100}%` }"
          >
            <div class="progress-light-effect"></div>
          </div>
        </div>
      </div>

      <div class="progress-stats-grid">
        <div class="stat-card-mini">
          <div class="label">数据总量</div>
          <div class="value">{{ progress.total }}</div>
        </div>
        <div class="stat-card-mini success">
          <div class="label">已成功</div>
          <div class="value">{{ progress.uploaded }}</div>
        </div>
        <div v-if="(progress.skipped || 0) > 0" class="stat-card-mini skipped">
          <div class="label">已跳过</div>
          <div class="value">{{ progress.skipped || 0 }}</div>
        </div>
        <div v-if="progress.failed > 0" class="stat-card-mini failed">
          <div class="label">失败</div>
          <div class="value">{{ progress.failed }}</div>
        </div>
        <div class="stat-card-mini">
          <div class="label">批次进度</div>
          <div class="value">
            {{ progress.currentBatch }} / {{ progress.totalBatch }}
          </div>
        </div>
      </div>
    </div>

    <!-- 日志信息 -->
    <div v-if="logs.length > 0" class="progress-logs">
      <div class="logs-header">
        <div class="logs-title">
          <icon-list />
          <span>上传日志</span>
        </div>
        <a-button type="text" size="mini" @click="handleClearLogs">
          清空日志
        </a-button>
      </div>
      <div class="logs-content">
        <div
          v-for="(log, index) in logs"
          :key="index"
          :class="['log-item', `log-${log.type}`]"
        >
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- 错误详情 -->
    <div v-if="errorRecords.length > 0" class="error-section">
      <a-alert type="error" :show-icon="true">
        <div class="error-alert-body">
          <span>
            共计
            <strong>{{ errorRecords.length }}</strong>
            条数据上传失败，您可以导出失败数据查看原因。
          </span>
          <a-button
            type="primary"
            status="danger"
            size="small"
            @click="handleDownloadErrors"
          >
            <template #icon><icon-download /></template>
            导出失败数据
          </a-button>
        </div>
      </a-alert>
    </div>

    <!-- 操作按钮 -->
    <div class="progress-actions">
      <a-button
        v-if="progress.status === 'uploading'"
        type="outline"
        status="warning"
        class="btn-action"
        @click="handleCancel"
      >
        <template #icon><icon-close /></template>
        取消上传
      </a-button>
      <a-button
        v-if="
          progress.status === 'error' && errorRecords.length < progress.total
        "
        type="outline"
        class="btn-action"
        @click="handleRetry"
      >
        <template #icon><icon-refresh /></template>
        重试失败数据
      </a-button>
      <a-button
        v-if="progress.status === 'success' || progress.status === 'error'"
        type="primary"
        class="btn-action"
        @click="handleComplete"
      >
        <template #icon><icon-check /></template>
        完成导入
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import dayjs from 'dayjs';
  import { downloadErrorData } from '../utils/utils';
  import type { UploadProgress, ErrorRecord } from '../utils/types';

  interface Props {
    progress: UploadProgress;
    errorRecords?: ErrorRecord[];
  }

  interface Emits {
    (e: 'cancel'): void;
    (e: 'retry'): void;
    (e: 'complete'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    errorRecords: () => [],
  });

  const emit = defineEmits<Emits>();

  interface Log {
    time: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }

  const logs = ref<Log[]>([]);
  const startTime = ref<number>(0);
  const uploadSpeed = ref(0);
  const estimatedTime = ref(0);

  const statusText = computed(() => {
    switch (props.progress.status) {
      case 'pending':
        return '准备中';
      case 'uploading':
        return '上传中';
      case 'success':
        return '上传成功';
      case 'error':
        return '上传失败';
      case 'cancelled':
        return '已取消';
      default:
        return '';
    }
  });

  // 添加日志
  const addLog = (message: string, type: Log['type'] = 'info') => {
    logs.value.unshift({
      time: dayjs().format('HH:mm:ss'),
      message,
      type,
    });

    if (logs.value.length > 100) {
      logs.value = logs.value.slice(0, 100);
    }
  };

  // 清空日志
  const handleClearLogs = () => {
    logs.value = [];
  };

  // 计算统计信息
  const calculateStats = () => {
    if (props.progress.status !== 'uploading' || !startTime.value) return;

    const elapsed = (Date.now() - startTime.value) / 1000;
    const { uploaded } = props.progress;

    if (elapsed > 0 && uploaded > 0) {
      uploadSpeed.value = Math.round(uploaded / elapsed);
      const remaining = props.progress.total - uploaded;
      if (uploadSpeed.value > 0) {
        estimatedTime.value = Math.ceil(remaining / uploadSpeed.value);
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  const handleCancel = () => {
    emit('cancel');
    addLog('用户取消上传', 'warning');
  };
  const handleRetry = () => {
    emit('retry');
    addLog('开始重试失败数据', 'info');
  };
  const handleComplete = () => {
    emit('complete');
  };

  const handleDownloadErrors = () => {
    if (props.errorRecords.length === 0) return;
    const errorData = props.errorRecords.map((record) => ({
      行号: record.row,
      错误信息: record.error,
      ...record.data,
    }));
    downloadErrorData(errorData, '导入失败数据.xlsx');
    addLog(`已导出 ${errorData.length} 条失败数据`, 'info');
  };

  // 监听状态
  watch(
    () => props.progress.status,
    (newStatus, oldStatus) => {
      if (newStatus === 'uploading' && oldStatus !== 'uploading') {
        startTime.value = Date.now();
        addLog('开始上传数据', 'info');
      } else if (newStatus === 'success') {
        addLog(
          `上传完成！成功 ${props.progress.uploaded} 条，全部处理完毕`,
          'success'
        );
      } else if (newStatus === 'error') {
        addLog(
          `上传结束（含异常）：成功 ${props.progress.uploaded} 条，失败 ${props.progress.failed} 条`,
          'error'
        );
      } else if (newStatus === 'cancelled') {
        addLog('上传已取消', 'warning');
      }
    }
  );

  watch(
    () => props.progress.uploaded,
    () => calculateStats()
  );
  watch(
    () => props.progress.currentBatch,
    (newBatch) => {
      if (newBatch && newBatch > 0)
        addLog(`正在上传第 ${newBatch} 批数据`, 'info');
    }
  );
</script>

<style scoped lang="less">
  .upload-progress {
    padding: 40px;
    background-color: var(--color-bg-2);

    .progress-content {
      padding: 32px;
      background: var(--color-fill-1);
      border-radius: 16px;
      border: 1px solid var(--color-border-1);
      margin-bottom: 24px;

      .progress-header-info {
        margin-bottom: 20px;
        text-align: center;

        .progress-main-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 8px;

          .percentage-num {
            font-size: 48px;
            font-weight: 900;
            color: var(--color-text-1);
            line-height: 1;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;

            &.uploading {
              background: rgba(var(--primary-6), 0.1);
              color: rgb(var(--primary-6));
            }
            &.success {
              background: rgba(var(--success-6), 0.1);
              color: rgb(var(--success-6));
            }
            &.error {
              background: rgba(var(--danger-6), 0.1);
              color: rgb(var(--danger-6));
            }
          }
        }

        .progress-sub-info {
          font-size: 14px;
          color: var(--color-text-3);
          strong {
            color: var(--color-text-1);
            margin: 0 4px;
          }
        }
      }

      .custom-linear-progress {
        margin-bottom: 32px;
        .progress-track {
          height: 12px;
          background: var(--color-fill-3);
          border-radius: 6px;
          overflow: hidden;
          position: relative;

          .progress-bar-fill {
            height: 100%;
            transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            border-radius: 6px;

            &.uploading {
              background: linear-gradient(
                90deg,
                rgb(var(--primary-5)),
                rgb(var(--primary-6))
              );
            }
            &.success {
              background: linear-gradient(90deg, #00d26a, #00b42a);
            }
            &.error {
              background: linear-gradient(90deg, #ff7d7d, #f53f3f);
            }

            .progress-light-effect {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.3) 50%,
                rgba(255, 255, 255, 0) 100%
              );
              animation: moveLight 2s infinite;
            }
          }
        }
      }

      .progress-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;

        .stat-card-mini {
          background: var(--color-bg-2);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--color-border-2);
          text-align: center;

          .label {
            font-size: 12px;
            color: var(--color-text-3);
            margin-bottom: 8px;
          }
          .value {
            font-size: 20px;
            font-weight: 700;
            color: var(--color-text-1);
          }
          &.success .value {
            color: #00b42a;
          }
          &.failed .value {
            color: #f53f3f;
          }
          &.skipped .value {
            color: #ff7d00;
          }
        }
      }
    }

    .progress-logs {
      margin-bottom: 32px;
      border: 1px solid var(--color-border-2);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

      .logs-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: var(--color-fill-2);
        border-bottom: 1px solid var(--color-border-2);
        .logs-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }

      .logs-content {
        max-height: 160px;
        overflow-y: auto;
        padding: 12px;
        background-color: #fafafa;

        /* 优化滚动条样式 */
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: var(--color-fill-4);
          border-radius: 3px;
        }
        &::-webkit-scrollbar-track {
          background-color: transparent;
        }

        .log-item {
          padding: 6px 12px;
          font-size: 12px;
          line-height: 1.6;
          border-radius: 6px;
          margin-bottom: 4px;
          .log-time {
            color: var(--color-text-4);
            margin-right: 12px;
            font-family: monospace;
          }
          .log-message {
            color: var(--color-text-2);
          }
          &.log-success {
            background: rgba(var(--success-6), 0.05);
            .log-message {
              color: rgb(var(--success-6));
            }
          }
          &.log-error {
            background: rgba(var(--danger-6), 0.05);
            .log-message {
              color: rgb(var(--danger-6));
            }
          }
          &.log-warning {
            background: rgba(var(--warning-6), 0.05);
            .log-message {
              color: rgb(var(--warning-6));
            }
          }
        }
      }
    }

    .error-section {
      margin-bottom: 32px;
      :deep(.arco-alert) {
        border-radius: 12px;
        padding: 16px 24px;
      }
      .error-alert-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }

    .progress-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      .btn-action {
        min-width: 120px;
        height: 40px;
        border-radius: 20px;
        font-weight: 600;
      }
    }
  }

  @keyframes moveLight {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }
</style>
