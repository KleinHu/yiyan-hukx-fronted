<template>
  <a-card :bordered="false" class="profile-side-card">
    <div class="side-card-header-bg">
      <div class="card-edit-trigger" @click="toggleEdit">
        <icon-edit v-if="!isEditing" />
        <icon-close v-else />
      </div>
    </div>

    <div class="side-card-body">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <div
            v-if="employee?.idCardPhotoUrl || localEditForm.avatarUrl"
            class="avatar-inner"
          >
            <a-image
              :src="localEditForm.avatarUrl || employee.idCardPhotoUrl"
              fit="cover"
              class="main-avatar"
              :preview="false"
            />
          </div>
          <div v-else class="avatar-inner placeholder">
            {{ employee?.userName?.charAt(0) }}
          </div>

          <div v-if="isEditing" class="avatar-edit-mask">
            <a-upload
              :custom-request="onAvatarUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <template #upload-button>
                <div class="upload-trigger"><icon-camera /></div>
              </template>
            </a-upload>
          </div>
        </div>

        <div class="main-info">
          <template v-if="!isEditing">
            <h2 class="name">{{ employee.userName }}</h2>
            <div class="user-code-tag">工号: {{ employee.userCode }}</div>
            <a-tag
              :color="getStatusColor(employee.status)"
              size="small"
              class="status-tag"
            >
              {{ employee.statusName }}
            </a-tag>
          </template>
          <div v-else class="edit-basic-inline">
            <a-input
              v-model="localEditForm.userName"
              size="small"
              placeholder="姓名"
              class="mb-8"
            />
          </div>
        </div>
      </div>

      <a-divider />

      <!-- 工作核心信息 -->
      <div class="side-info-group">
        <div class="group-title"><icon-apps /> <span>工作核心信息</span></div>

        <div v-if="isEditing" class="side-work-edit">
          <div class="f-item">
            <label>所属部门</label>
            <a-select v-model="localEditForm.departmentId" size="mini">
              <a-option
                v-for="dept in departmentList"
                :key="dept.deptId"
                :value="dept.deptId"
              >
                {{ dept.deptName }}
              </a-option>
            </a-select>
          </div>
          <div class="f-item">
            <label>职位名称</label>
            <a-input v-model="localEditForm.jobTitle" size="mini" />
          </div>
          <div class="f-item">
            <label>入职日期</label>
            <a-date-picker
              v-model="localEditForm.hireDate"
              size="mini"
              style="width: 100%"
            />
          </div>
        </div>

        <div v-else class="side-property-list">
          <div class="prop-item">
            <span class="label">所属部门:</span>
            <span class="value highlight">{{
              employee.departmentName || '-'
            }}</span>
          </div>
          <div class="prop-item">
            <span class="label">职位名称:</span>
            <span class="value">{{ employee.jobTitle || '-' }}</span>
          </div>
          <div class="prop-item">
            <span class="label">当前职级:</span>
            <a-tag color="arcoblue" size="small">{{
              employee.rankName || '-'
            }}</a-tag>
          </div>
          <div class="prop-item">
            <span class="label">入职日期:</span>
            <span class="value">{{ formatDate(employee.hireDate) }}</span>
          </div>
          <div class="prop-item">
            <span class="label">办公地点:</span>
            <span class="value">{{ employee.officeLocation || '-' }}</span>
          </div>
        </div>
      </div>

      <a-divider />

      <!-- 联系与基础信息 -->
      <div class="side-info-group">
        <div class="group-title"><icon-user /> <span>基础与联系方式</span></div>
        <div class="side-property-list">
          <div class="prop-item">
            <icon-phone class="icon" />
            <span class="label">手机:</span>
            <span v-if="!isEditing" class="value">{{
              employee.mobile || '-'
            }}</span>
            <a-input v-else v-model="localEditForm.mobile" size="mini" />
          </div>
          <div class="prop-item">
            <icon-email class="icon" />
            <span class="label">邮箱:</span>
            <span v-if="!isEditing" class="value text-truncate">{{
              employee.email || '-'
            }}</span>
            <a-input v-else v-model="localEditForm.email" size="mini" />
          </div>
        </div>

        <div class="basic-grid">
          <div class="grid-item">
            <div class="g-label">性别</div>
            <span v-if="!isEditing" class="g-value">{{
              employee.genderName || '-'
            }}</span>
            <a-select v-else v-model="localEditForm.gender" size="mini">
              <a-option :value="1">男</a-option>
              <a-option :value="2">女</a-option>
            </a-select>
          </div>
          <div class="grid-item">
            <div class="g-label">政治面貌</div>
            <span v-if="!isEditing" class="g-value">{{
              employee.politicalStatusName || '-'
            }}</span>
            <a-input
              v-else
              v-model="localEditForm.politicalStatusName"
              size="mini"
            />
          </div>
        </div>
      </div>

      <div v-if="isEditing" class="card-action-btns">
        <a-button
          type="primary"
          size="mini"
          long
          :loading="loading"
          @click="handleSave"
        >
          保存资料卡片
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import {
    IconEdit,
    IconClose,
    IconCamera,
    IconApps,
    IconUser,
    IconPhone,
    IconEmail,
  } from '@arco-design/web-vue/es/icon';
  import type { Employee, Department } from '@/api/hr/types';

  const props = defineProps<{
    employee: Employee;
    departmentList: Department[];
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'save', data: Partial<Employee>): void;
    (e: 'avatarUpload', opt: any): void;
  }>();

  const isEditing = ref(false);
  const localEditForm = ref<Partial<Employee>>({});

  // 同步外部数据到内部表单
  watch(
    () => props.employee,
    (val) => {
      if (val) {
        localEditForm.value = { ...val };
      }
    },
    { immediate: true }
  );

  const toggleEdit = () => {
    isEditing.value = !isEditing.value;
    if (!isEditing.value) {
      localEditForm.value = { ...props.employee };
    }
  };

  const handleSave = () => {
    emit('save', localEditForm.value);
  };

  const onAvatarUpload = (opt: any) => {
    emit('avatarUpload', opt);
  };

  // 内部辅助方法
  const getStatusColor = (s?: number) =>
    ({ 1: 'orange', 2: 'green', 3: 'red', 4: 'gray', 5: 'arcoblue' }[s || 0] ||
    'gray');

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : '-';

  // 暴露给父组件，允许从外部关闭编辑状态
  defineExpose({
    setEditing: (val: boolean) => {
      isEditing.value = val;
    },
    updateAvatar: (url: string) => {
      localEditForm.value.avatarUrl = url;
    },
  });
</script>

<style scoped lang="less">
  .profile-side-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
    :deep(.arco-card-body) {
      padding: 0;
    }
    .side-card-header-bg {
      height: 80px;
      background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
      position: relative;
      .card-edit-trigger {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        transition: all 0.2s;
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
    .side-card-body {
      padding: 0 20px 20px;
      margin-top: -40px;
      text-align: center;
    }
    .avatar-section {
      .avatar-wrapper {
        position: relative;
        display: inline-block;
        padding: 4px;
        background: #fff;
        border-radius: 50%;
        margin-bottom: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        .avatar-inner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background-color: var(--color-fill-3);
          &.placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: #165dff;
          }
          .main-avatar {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .avatar-edit-mask {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: #165dff;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid #fff;
          font-size: 14px;
        }
      }
      .main-info {
        .name {
          margin: 0 0 4px;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-1);
        }
        .user-code-tag {
          font-size: 12px;
          color: var(--color-text-3);
          margin-bottom: 8px;
        }
        .status-tag {
          margin-top: 4px;
        }
      }
    }

    .side-info-group {
      text-align: left;
      padding: 4px 0;
      .group-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-2);
        margin-bottom: 12px;
        .arco-icon {
          color: #165dff;
        }
      }
      .side-property-list {
        .prop-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          font-size: 13px;
          .icon {
            margin-right: 8px;
            color: var(--color-text-4);
            font-size: 14px;
          }
          .label {
            color: var(--color-text-3);
            margin-right: 8px;
            min-width: 60px;
          }
          .value {
            color: var(--color-text-1);
            font-weight: 500;
            &.highlight {
              color: #165dff;
            }
          }
        }
      }
      .side-work-edit {
        .f-item {
          margin-bottom: 12px;
          label {
            display: block;
            font-size: 11px;
            color: var(--color-text-4);
            margin-bottom: 4px;
          }
        }
      }
    }

    .basic-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding-top: 8px;
      .grid-item {
        .g-label {
          font-size: 11px;
          color: var(--color-text-4);
          margin-bottom: 2px;
        }
        .g-value {
          font-size: 13px;
          color: var(--color-text-1);
          font-weight: 500;
        }
      }
    }
    .card-action-btns {
      margin-top: 16px;
    }
  }

  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mb-8 {
    margin-bottom: 8px;
  }
  :deep(.arco-divider-horizontal) {
    margin: 16px 0;
  }
</style>
