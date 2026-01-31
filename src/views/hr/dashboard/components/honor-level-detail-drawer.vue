<template>
  <a-drawer
    v-model:visible="visible"
    :title="`各级荣誉统计：${title}（共 ${list.length} 条获奖记录）`"
    :width="1000"
    class="detail-drawer"
    unmount-on-close
    @cancel="handleClose"
  >
    <div class="drawer-header-actions">
      <a-input-search
        v-model="searchKey"
        placeholder="搜索获奖人、奖励名称..."
        allow-clear
        style="width: 280px"
        @search="handleSearch"
      />
    </div>
    <div class="member-count">显示 {{ filteredList.length }} 条记录</div>
    <a-spin :loading="loading" style="width: 100%; min-height: 200px">
      <a-scrollbar style="max-height: calc(100vh - 220px); overflow: auto">
        <a-table
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
  import type { HonorStat } from '@/api/hr/dashboard';

  /** 扩展 HonorStat，包含后端返回的 userCode、rewardReason、departmentName */
  interface HonorDetailItem extends HonorStat {
    userCode?: string;
    rewardReason?: string;
    departmentName?: string;
  }

  interface Props {
    modelValue: boolean;
    /** 荣誉级别名称，如：国家级、省级、市级 */
    rewardLevel: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    rewardLevel: '',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
  }>();

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  });

  const title = computed(() => props.rewardLevel);

  const loading = ref(false);
  const list = ref<HonorDetailItem[]>([]);
  const searchKey = ref('');

  const filteredList = computed(() => {
    let result = list.value;
    const key = searchKey.value.trim().toLowerCase();
    if (key) {
      result = result.filter(
        (e) =>
          (e.userName && e.userName.toLowerCase().includes(key)) ||
          (e.rewardName && e.rewardName.toLowerCase().includes(key)) ||
          (e.userCode && e.userCode.toLowerCase().includes(key)) ||
          (e.departmentName && e.departmentName.toLowerCase().includes(key))
      );
    }
    return result;
  });

  const columns = [
    { title: '工号', dataIndex: 'userCode', width: 100 },
    { title: '获奖人', dataIndex: 'userName', width: 100 },
    {
      title: '科室',
      dataIndex: 'departmentName',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '奖励名称',
      dataIndex: 'rewardName',
      ellipsis: true,
      tooltip: true,
    },
    { title: '获奖日期', dataIndex: 'rewardDate', width: 120 },
    {
      title: '奖励原因',
      dataIndex: 'rewardReason',
      ellipsis: true,
      tooltip: true,
    },
  ];

  function handleSearch(): void {
    // 搜索由 computed filteredList 自动响应
  }

  const fetchList = async (): Promise<void> => {
    if (!props.rewardLevel) return;
    try {
      loading.value = true;
      const { data } = await dashboardApi.getHonorDetailByLevel(
        props.rewardLevel
      );
      list.value = (data ?? []) as HonorDetailItem[];
      searchKey.value = '';
    } catch {
      Message.error('加载获奖记录失败');
      list.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleClose = (): void => {
    visible.value = false;
  };

  watch(
    () => [visible.value, props.rewardLevel] as const,
    ([v]) => {
      if (v && props.rewardLevel) fetchList();
    }
  );
</script>

<style scoped lang="less">
  .detail-drawer {
    .drawer-header-actions {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .member-count {
      font-size: 13px;
      color: var(--color-text-3);
      margin-bottom: 12px;
    }
  }
</style>
