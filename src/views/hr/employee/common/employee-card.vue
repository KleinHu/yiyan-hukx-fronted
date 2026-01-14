<template>
  <div class="employee-card">
    <a-card
      :bordered="true"
      hoverable
      class="employee-card-content"
      @click="emit('click', employee)"
    >
      <!-- 员工头像和基本信息 -->
      <div class="employee-header">
        <div class="avatar-container">
          <div v-if="employee.idCardPhotoUrl" class="avatar-with-image">
            <a-image
              :src="employee.idCardPhotoUrl"
              width="80"
              height="80"
              fit="cover"
              class="employee-avatar"
              :preview="false"
            />
          </div>
          <div v-else class="avatar-placeholder">
            <div class="employee-avatar no-image">
              {{ employee.userName?.charAt(0) }}
            </div>
          </div>
          <div class="status-badge" :class="statusClass">
            {{ employee.statusName || employee.workStatusName || '-' }}
          </div>
        </div>

        <div class="employee-info">
          <div class="employee-name">{{ employee.userName }}</div>
          <div class="employee-position">
            {{ employee.jobTitle || employee.position || '-' }}
          </div>
          <div class="employee-no">{{ employee.userCode }}</div>
        </div>
      </div>

      <!-- 员工详细信息 -->
      <div class="employee-details">
        <div class="detail-item">
          <icon-user class="detail-icon" />
          <span class="detail-label">部门:</span>
          <span class="detail-value">{{ employee.departmentName || '-' }}</span>
        </div>

        <div class="detail-item">
          <icon-phone class="detail-icon" />
          <span class="detail-label">电话:</span>
          <span class="detail-value">{{
            formatPhone(employee.mobile || employee.phone)
          }}</span>
        </div>

        <div class="detail-item">
          <icon-email class="detail-icon" />
          <span class="detail-label">邮箱:</span>
          <span class="detail-value" :title="employee.email">
            {{ formatEmail(employee.email) }}
          </span>
        </div>

        <div class="detail-item">
          <icon-calendar class="detail-icon" />
          <span class="detail-label">入职:</span>
          <span class="detail-value">{{ formatDate(employee.entryDate) }}</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    IconUser,
    IconPhone,
    IconEmail,
    IconCalendar,
  } from '@arco-design/web-vue/es/icon';
  import type { Employee } from '@/api/hr/types';

  interface Props {
    employee: Employee;
  }

  interface Emits {
    (e: 'click', employee: Employee): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  /**
   * 工作状态样式类
   */
  const statusClass = computed(() => {
    const status = props.employee.status || props.employee.workStatus;
    // 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
    if (status === 2) return 'status-active'; // 正式
    if (status === 3 || status === 4) return 'status-inactive'; // 离职/退休
    if (status === 5) return 'status-internship'; // 顶岗实习
    if (status === 1) return 'status-probation'; // 试用
    return 'status-active'; // 默认
  });

  /**
   * 格式化手机号
   */
  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}****${phone.slice(7)}`;
    }
    return phone;
  };

  /**
   * 格式化邮箱
   */
  const formatEmail = (email?: string) => {
    if (!email) return '-';
    if (email.length > 20) {
      return `${email.slice(0, 17)}...`;
    }
    return email;
  };

  /**
   * 格式化日期
   */
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };
</script>

<script lang="ts">
  export default {
    name: 'EmployeeCard',
  };
</script>

<style scoped lang="less">
  .employee-card {
    width: 100%;

    .employee-card-content {
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      height: auto;
      min-height: 320px;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      // 添加渐变装饰边框
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(
          135deg,
          #409eff 0%,
          #36a3f7 50%,
          #ff6b6b 100%
        );
        z-index: 1;
      }

      // 添加光晕效果
      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(64, 158, 255, 0.1) 0%,
          transparent 70%
        );
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }

      &:hover {
        box-shadow: 0 16px 64px rgba(0, 0, 0, 0.15);
        transform: translateY(-8px) scale(1.02);
        border-color: rgba(64, 158, 255, 0.3);

        &::after {
          opacity: 1;
        }
      }

      :deep(.arco-card-body) {
        padding: 24px;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 2;
      }
    }

    .employee-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;

      .avatar-container {
        position: relative;
        margin-right: 16px;

        .employee-avatar {
          border: 3px solid transparent;
          background: linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #409eff, #ff6b6b) border-box;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;
          border-radius: 12px !important;
          overflow: hidden;

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          }

          // 当使用a-image时的样式
          :deep(.arco-image) {
            border-radius: 8px;

            .arco-image-img {
              border-radius: 8px;
            }
          }

          // 当没有图片时的占位符样式
          &.no-image {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 600;
            color: var(--color-text-2);
            background: var(--color-fill-2);
          }
        }

        .status-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          padding: 4px 8px;
          font-size: 10px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;

          &.status-active {
            background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
          }

          &.status-inactive {
            background: linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%);
          }

          &.status-probation {
            background: linear-gradient(135deg, #e6a23c 0%, #f0a020 100%);
          }

          &.status-internship {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          }
        }
      }

      .employee-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .employee-name {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #409eff 0%, #ff6b6b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .employee-position {
          font-size: 14px;
          color: white;
          background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
          padding: 6px 12px;
          border-radius: 16px;
          display: block;
          width: fit-content;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
          transition: all 0.3s ease;
          margin-bottom: 8px;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
          }
        }

        .employee-no {
          font-size: 12px;
          color: var(--color-text-3);
          font-family: 'Monaco', 'Menlo', monospace;
          background: rgba(64, 158, 255, 0.08);
          padding: 4px 8px;
          border-radius: 8px;
          display: block;
          border: 1px solid rgba(64, 158, 255, 0.2);
          width: fit-content;
        }
      }
    }

    .employee-details {
      flex: 1;
      background: rgba(248, 250, 252, 0.8);
      border-radius: 12px;
      padding: 12px;
      margin: 12px 0;

      .detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        transition: all 0.3s ease;
        padding: 4px 6px;
        border-radius: 8px;

        &:hover {
          background: rgba(64, 158, 255, 0.05);
          transform: translateX(4px);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .detail-icon {
          color: #409eff;
          margin-right: 10px;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .detail-label {
          color: var(--color-text-2);
          margin-right: 8px;
          flex-shrink: 0;
          font-weight: 500;
          min-width: 36px;
        }

        .detail-value {
          color: var(--color-text-1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          font-weight: 400;
        }

        &:hover .detail-icon {
          color: #ff6b6b;
          transform: scale(1.1);
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .employee-card {
      .employee-card-content {
        height: auto;
        min-height: 280px;
        border-radius: 16px;

        :deep(.arco-card-body) {
          padding: 20px;
        }
      }

      .employee-header {
        margin-bottom: 16px;

        .avatar-container {
          margin-right: 12px;

          .employee-avatar {
            border-radius: 10px !important;

            &.no-image {
              width: 68px;
              height: 68px;
              font-size: 22px;
            }

            :deep(.arco-image) {
              width: 68px;
              height: 68px;
              border-radius: 8px;

              .arco-image-img {
                border-radius: 8px;
              }
            }
          }

          .status-badge {
            padding: 3px 6px;
            font-size: 9px;
          }
        }

        .employee-info {
          .employee-name {
            font-size: 16px;
            margin-bottom: 6px;
          }

          .employee-position {
            font-size: 12px;
            padding: 4px 10px;
            margin-bottom: 6px;
          }

          .employee-no {
            font-size: 11px;
            padding: 3px 6px;
          }
        }
      }

      .employee-details {
        padding: 12px;
        margin: 12px 0;

        .detail-item {
          font-size: 12px;
          margin-bottom: 10px;
          padding: 4px 6px;

          .detail-icon {
            width: 14px;
            height: 14px;
            margin-right: 8px;
          }

          .detail-label {
            min-width: 32px;
          }
        }
      }
    }
  }
</style>
