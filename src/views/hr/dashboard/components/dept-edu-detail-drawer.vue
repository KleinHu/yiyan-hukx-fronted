<template>
  <a-drawer
    v-model:visible="visible"
    :title="
      degree === -1
        ? `科室人员名录：${deptName}（共 ${list.length} 人）`
        : `科室学历分布：${deptName} - ${degreeName}（共 ${list.length} 人）`
    "
    :width="1000"
    class="detail-drawer"
    unmount-on-close
    @cancel="handleClose"
  >
    <!-- 搜索和筛选 -->
    <div class="drawer-header-actions">
      <a-input-search
        v-model="searchKey"
        placeholder="搜索姓名、工号或手机号..."
        allow-clear
        style="width: 260px"
      />
      <a-button-group size="small">
        <a-tooltip content="网格视图">
          <a-button
            :type="viewMode === 'grid' ? 'primary' : 'outline'"
            @click="viewMode = 'grid'"
          >
            <template #icon><icon-apps /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="列表视图">
          <a-button
            :type="viewMode === 'list' ? 'primary' : 'outline'"
            @click="viewMode = 'list'"
          >
            <template #icon><icon-list /></template>
          </a-button>
        </a-tooltip>
      </a-button-group>
    </div>

    <!-- 成员数量 -->
    <div class="member-count">显示 {{ filteredList.length }} 位成员</div>

    <!-- 加载中 -->
    <a-spin :loading="loading" style="width: 100%; min-height: 200px">
      <a-scrollbar style="max-height: calc(100vh - 260px); overflow: auto">
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="member-grid">
          <div
            v-for="emp in filteredList"
            :key="emp.userCode"
            class="member-card"
          >
            <span class="card-user-code">#{{ emp.userCode }}</span>
            <div class="card-avatar-wrapper">
              <a-avatar
                :size="64"
                :style="{ background: getAvatarColor(emp.userCode) }"
              >
                <img v-if="emp.avatarUrl" :src="emp.avatarUrl" alt="avatar" />
                <span v-else>{{ getAvatarText(emp.userName) }}</span>
              </a-avatar>
            </div>
            <div class="card-info">
              <div class="card-name">{{ emp.userName }}</div>
              <div class="card-job">{{ emp.jobTitle || '未设置职位' }}</div>
              <a-tooltip
                :content="emp.departmentName || '未设置部门'"
                position="top"
              >
                <div class="card-dept">
                  <icon-branch style="margin-right: 4px" />
                  {{ emp.departmentName || '未设置部门' }}
                </div>
              </a-tooltip>
            </div>
            <div class="card-footer">
              <div class="contact-item">
                <div class="contact-label"><icon-phone /> 手机号</div>
                <div class="contact-value">
                  {{ emp.mobile || '-' }}
                  <icon-copy
                    v-if="emp.mobile"
                    class="copy-icon"
                    @click="copyToClipboard(emp.mobile)"
                  />
                </div>
              </div>
              <div class="contact-item">
                <div class="contact-label"><icon-email /> 邮箱</div>
                <div class="contact-value email-text" :title="emp.email">
                  {{ emp.email || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <a-table
          v-else
          :columns="columns"
          :data="filteredList"
          :pagination="false"
          size="small"
        />
      </a-scrollbar>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import dashboardApi from '@/api/hr/dashboard';
  import type { Employee } from '@/api/hr/types';

  interface Props {
    modelValue: boolean;
    deptId: string;
    deptName: string;
    degree: number;
    degreeName: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    deptId: '',
    deptName: '',
    degree: 0,
    degreeName: '',
  });

  const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  });

  const loading = ref(false);
  const list = ref<Employee[]>([]);
  const searchKey = ref('');
  const viewMode = ref<'grid' | 'list'>('grid');

  const filteredList = computed(() => {
    let result = list.value;
    const key = searchKey.value.trim().toLowerCase();
    if (key) {
      result = result.filter(
        (e) =>
          e.userName?.toLowerCase().includes(key) ||
          e.userCode?.toLowerCase().includes(key) ||
          (e.mobile && e.mobile.includes(key))
      );
    }
    return result;
  });

  const columns = [
    { title: '工号', dataIndex: 'userCode', width: 100 },
    { title: '姓名', dataIndex: 'userName', width: 90 },
    {
      title: '部门',
      dataIndex: 'departmentName',
      ellipsis: true,
      tooltip: true,
    },
    { title: '职位', dataIndex: 'jobTitle', ellipsis: true, tooltip: true },
    { title: '手机号', dataIndex: 'mobile', width: 120 },
  ];

  function getAvatarText(name: string | undefined): string {
    return name ? name.charAt(0) : '?';
  }
  function getAvatarColor(userCode: string): string {
    let hash = 0;
    for (let i = 0; i < userCode.length; i += 1) {
      hash = userCode.charCodeAt(i) + hash * 31;
    }
    const AVATAR_COLORS = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }
  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      Message.success('已复制到剪贴板');
    } catch {
      Message.error('复制失败');
    }
  }

  const fetchList = async (): Promise<void> => {
    if (!props.deptId) return;
    try {
      loading.value = true;
      const { data } = await dashboardApi.getEmployeesByDeptEducation(
        props.deptId,
        props.degree
      );
      list.value = data ?? [];
      searchKey.value = '';
    } catch {
      Message.error('加载列表失败');
      list.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleClose = (): void => {
    visible.value = false;
  };

  watch(
    () => [visible.value, props.deptId, props.degree] as const,
    ([v]) => {
      if (v && props.deptId) fetchList();
    }
  );
</script>

<style scoped lang="less">
  .detail-drawer {
    .drawer-header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 12px;
    }
    .member-count {
      font-size: 13px;
      color: var(--color-text-3);
      margin-bottom: 12px;
    }
    .member-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .member-card {
      position: relative;
      padding: 24px 16px 16px;
      background: var(--color-bg-2);
      border: 1px solid var(--color-border-2);
      border-radius: 12px;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        border-color: rgb(var(--primary-6));
      }
      .card-avatar-wrapper {
        margin-bottom: 16px;
      }
      .card-user-code {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 12px;
        color: var(--color-text-4);
        font-family: monospace;
      }
      .card-info {
        text-align: center;
        width: 100%;
        margin-bottom: 16px;
        .card-name {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .card-job {
          font-size: 13px;
          color: var(--color-text-2);
          margin-bottom: 8px;
          background: var(--color-fill-2);
          display: inline-block;
          padding: 2px 12px;
          border-radius: 20px;
        }
        .card-dept {
          font-size: 12px;
          color: var(--color-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .card-footer {
        width: 100%;
        padding-top: 16px;
        border-top: 1px dashed var(--color-border-2);
        display: flex;
        flex-direction: column;
        gap: 12px;
        .contact-item {
          .contact-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--color-text-4);
            margin-bottom: 4px;
          }
          .contact-value {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            background: var(--color-fill-1);
            padding: 6px 10px;
            border-radius: 6px;
            .copy-icon {
              cursor: pointer;
              color: var(--color-text-3);
              &:hover {
                color: rgb(var(--primary-6));
              }
            }
            &.email-text {
              display: block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 13px;
            }
          }
        }
      }
    }
  }
</style>
