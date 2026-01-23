<template>
  <div class="performance-timeline">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增绩效记录
      </a-button>
    </div>

    <div v-if="loading" class="loading-container">
      <a-spin :size="32" />
    </div>
    <div v-else-if="sortedPerformanceList.length === 0" class="empty-container">
      <a-empty description="暂无绩效记录" />
    </div>
    <div v-else class="timeline-wrapper">
      <a-timeline>
        <a-timeline-item
          v-for="(item, index) in sortedPerformanceList"
          :key="item.year || index"
          :label="`${item.year}年`"
          :dot-color="index === 0 ? 'blue' : 'gray'"
        >
          <div class="performance-item-content">
            <div class="performance-main">
              <div class="performance-info">
                <span class="label">绩效等级：</span>
                <a-tag
                  size="small"
                  :color="getRatingColor(item.performanceRating)"
                >
                  {{ item.performanceRating || '-' }}
                </a-tag>
                <div v-if="item.isExempt !== undefined" class="exempt-info">
                  <a-tag
                    size="small"
                    :color="item.isExempt ? 'orange' : 'green'"
                  >
                    {{ item.isExempt ? '不考核' : '参加考核' }}
                  </a-tag>
                </div>
              </div>
              <div class="performance-ops" v-if="!readonly">
                <a-button
                  type="text"
                  size="mini"
                  @click="handleEdit(item, index)"
                >
                  <template #icon><icon-edit /></template>
                </a-button>
                <a-button
                  type="text"
                  size="mini"
                  status="danger"
                  @click="handleDelete(item, index)"
                >
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
            </div>
            <div class="performance-description">
              <span
                v-if="item.score !== null && item.score !== undefined"
                class="score-info"
              >
                <span class="label">绩效分：</span>
                <span class="score-value">{{ item.score }}</span>
              </span>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑绩效记录' : '新增绩效记录'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item label="年度" field="year">
          <a-year-picker
            v-model="formData.year"
            placeholder="请选择年度"
            style="width: 100%"
            :disabled="isEdit"
          />
        </a-form-item>

        <a-form-item label="绩效等级" field="performanceRating">
          <a-select
            v-model="formData.performanceRating"
            placeholder="请选择等级"
          >
            <a-option value="A+">A+</a-option>
            <a-option value="A">A</a-option>
            <a-option value="B+">B+</a-option>
            <a-option value="B">B</a-option>
            <a-option value="C">C</a-option>
            <a-option value="D">D</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="绩效分数" field="score">
          <a-input-number
            v-model="formData.score"
            placeholder="请输入分数"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="是否免考" field="isExempt">
          <a-switch v-model="formData.isExempt" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { Performance } from '@/api/hr/types';
  import useEmployeeRecords from '@/hooks/hr/employee-records';

  interface Props {
    userCode: string;
    hideHeader?: boolean;
    readonly?: boolean;
    isNewMode?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    hideHeader: false,
    readonly: false,
    isNewMode: false,
  });

  // 使用 Hook（仅在编辑模式下使用）
  const employeeRecords = props.isNewMode
    ? null
    : useEmployeeRecords(props.userCode);

  // 状态数据
  const submitLoading = ref(false);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentIndex = ref<number>(-1);
  let tempIdCounter = 0;

  // 新建模式下的本地数据
  const localPerformanceList = ref<Performance[]>([]);

  // 计算属性
  const loading = computed(() =>
    props.isNewMode ? false : employeeRecords?.loading.value || false
  );
  const performanceList = computed(() =>
    props.isNewMode
      ? localPerformanceList.value
      : employeeRecords?.performanceList.value || []
  );

  // 按年度倒序排列（最新的在前）
  const sortedPerformanceList = computed(() => {
    return [...performanceList.value].sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      return yearB - yearA; // 降序排列
    });
  });

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<Performance>>({
    year: undefined,
    performanceRating: '',
    score: undefined,
    isExempt: false,
  });

  const formRules = {
    year: [{ required: true, message: '请选择年度' }],
    performanceRating: [
      { required: !formData.isExempt, message: '请选择绩效等级' },
    ],
  };

  const getPerformanceList = async (): Promise<void> => {
    if (!props.userCode || props.isNewMode || !employeeRecords) return;
    await employeeRecords.fetchPerformanceList();
  };

  const getRatingColor = (rating?: string) => {
    if (!rating) return 'gray';
    if (rating.startsWith('A')) return 'green';
    if (rating.startsWith('B')) return 'blue';
    if (rating.startsWith('C')) return 'orange';
    return 'red';
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentIndex.value = -1;
    formData.year = new Date().getFullYear();
    formData.performanceRating = '';
    formData.score = undefined;
    formData.isExempt = false;
    formRef.value?.resetFields();
    modalVisible.value = true;
  };

  const handleEdit = (record: Performance, index: number) => {
    isEdit.value = true;
    // 找到原始列表中的索引
    const originalIndex = performanceList.value.findIndex(
      (item) => item.year === record.year
    );
    currentIndex.value = originalIndex >= 0 ? originalIndex : index;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: Performance, index: number) => {
    // 找到原始列表中的索引
    const originalIndex = performanceList.value.findIndex(
      (item) => item.year === record.year
    );
    const rowIndex = originalIndex >= 0 ? originalIndex : index;
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条绩效记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          localPerformanceList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else if (record.year && employeeRecords) {
          const success = await employeeRecords.deletePerformance(record.year);
          if (success) {
            await getPerformanceList();
          }
        }
      },
    });
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    if (props.isNewMode) {
      if (isEdit.value && currentIndex.value >= 0) {
        Object.assign(localPerformanceList.value[currentIndex.value], {
          ...formData,
        });
      } else {
        tempIdCounter -= 1;
        localPerformanceList.value.push({
          ...formData,
          id: tempIdCounter,
        } as Performance);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      if (!employeeRecords) return;

      try {
        submitLoading.value = true;
        const success = await employeeRecords.savePerformance(formData);
        if (success) {
          modalVisible.value = false;
          await getPerformanceList();
        }
      } finally {
        submitLoading.value = false;
      }
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
  };

  const saveAllData = async (userCode: string): Promise<boolean> => {
    if (localPerformanceList.value.length === 0) return true;
    try {
      const records = useEmployeeRecords(userCode);
      await Promise.all(
        localPerformanceList.value.map((item) => records.savePerformance(item))
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => localPerformanceList.value;
  const clearData = (): void => {
    localPerformanceList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getPerformanceList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getPerformanceList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => performanceList.value.length);

  defineExpose({
    refresh: getPerformanceList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .performance-timeline {
    padding: 0;

    .list-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
    }

    .timeline-wrapper {
      padding: 0 12px;
    }

    .performance-item-content {
      .performance-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .performance-info {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;

        .exempt-info {
          margin-top: 0;
        }
      }

      .performance-description {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 4px;

        .score-info {
          display: flex;
          align-items: center;
          gap: 4px;

          .score-value {
            font-weight: 600;
            color: var(--color-text-1);
          }
        }
      }

      .performance-ops {
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .performance-ops {
        opacity: 1;
      }

      .label {
        color: var(--color-text-3);
        margin-right: 4px;
      }
    }
  }
</style>
