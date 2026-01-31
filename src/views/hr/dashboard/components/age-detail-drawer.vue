<template>
  <a-drawer
    v-model:visible="visible"
    :title="`年龄分布：${title}（共 ${list.length} 人）`"
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
        @search="handleSearch"
      />
      <a-space>
        <span class="filter-label">筛选:</span>
        <a-select
          v-model="filterJobTitle"
          placeholder="所有职位"
          allow-clear
          style="width: 140px"
        >
          <a-option value="">所有职位</a-option>
          <a-option v-for="jt in jobTitleOptions" :key="jt" :value="jt">
            {{ jt }}
          </a-option>
        </a-select>
        <a-button-group size="small">
          <a-tooltip content="网格视图">
            <a-button
              :type="viewMode === 'grid' ? 'primary' : 'outline'"
              @click="viewMode = 'grid'"
            >
              <template #icon>
                <icon-apps />
              </template>
            </a-button>
          </a-tooltip>
          <a-tooltip content="列表视图">
            <a-button
              :type="viewMode === 'list' ? 'primary' : 'outline'"
              @click="viewMode = 'list'"
            >
              <template #icon>
                <icon-list />
              </template>
            </a-button>
          </a-tooltip>
        </a-button-group>
      </a-space>
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
    /** 年龄区间名称：25岁以下 / 25-35岁 等 */
    ageRangeName: string;
    /** 最小年龄（含），可选 */
    minAge?: number;
    /** 最大年龄（不含），可选。25岁以下传 maxAge=25；55岁以上传 minAge=55 */
    maxAge?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    minAge: undefined,
    maxAge: undefined,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
  }>();

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  });

  const title = computed(() => props.ageRangeName);

  const loading = ref(false);
  const list = ref<Employee[]>([]);
  const searchKey = ref('');
  const filterJobTitle = ref('');
  const viewMode = ref<'grid' | 'list'>('grid');

  /** 职位筛选项（从列表中提取） */
  const jobTitleOptions = computed(() => {
    const titles = new Set<string>();
    list.value.forEach((e) => {
      if (e.jobTitle && e.jobTitle.trim()) {
        titles.add(e.jobTitle.trim());
      }
    });
    return Array.from(titles).sort();
  });

  /** 过滤后的列表 */
  const filteredList = computed(() => {
    let result = list.value;
    const key = searchKey.value.trim().toLowerCase();
    if (key) {
      result = result.filter(
        (e) =>
          (e.userName && e.userName.toLowerCase().includes(key)) ||
          (e.userCode && e.userCode.toLowerCase().includes(key)) ||
          (e.mobile && e.mobile.includes(key))
      );
    }
    if (filterJobTitle.value) {
      result = result.filter((e) => e.jobTitle === filterJobTitle.value);
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
    if (!name) return '?';
    return name.charAt(0);
  }

  const AVATAR_COLORS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  function getAvatarColor(userCode: string): string {
    let hash = 0;
    for (let i = 0; i < userCode.length; i += 1) {
      hash = userCode.charCodeAt(i) + hash * 31;
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
  }

  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      Message.success('已复制到剪贴板');
    } catch {
      Message.error('复制失败');
    }
  }

  function handleSearch(): void {
    // 搜索由 computed filteredList 自动响应
  }

  const fetchList = async (): Promise<void> => {
    const { minAge, maxAge } = props;
    if (minAge === undefined && maxAge === undefined) return;
    try {
      loading.value = true;
      const { data } = await dashboardApi.getEmployeesByAgeRange(
        minAge,
        maxAge
      );
      list.value = data ?? [];
      searchKey.value = '';
      filterJobTitle.value = '';
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
    () => [visible.value, props.minAge, props.maxAge] as const,
    ([v]) => {
      if (v && (props.minAge !== undefined || props.maxAge !== undefined)) {
        fetchList();
      }
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
      flex-wrap: wrap;
      gap: 12px;

      .filter-label {
        color: var(--color-text-3);
        font-size: 14px;
      }

      .is-active {
        color: rgb(var(--primary-6));
      }
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
        position: relative;
        z-index: 1;
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
          color: var(--color-text-1);
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
          width: 100%;
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
          width: 100%;

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
            color: var(--color-text-1);
            background: var(--color-fill-1);
            padding: 6px 10px;
            border-radius: 6px;

            .copy-icon {
              cursor: pointer;
              color: var(--color-text-3);
              font-size: 14px;

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
