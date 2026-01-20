<template>
  <div class="rank-timeline">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增职级变动
      </a-button>
    </div>

    <div v-if="loading" class="loading-container">
      <a-spin :size="32" />
    </div>
    <div v-else-if="historyList.length === 0" class="empty-container">
      <a-empty description="暂无职级变动记录" />
    </div>
    <div v-else class="timeline-wrapper">
      <a-timeline>
        <a-timeline-item
          v-for="(item, index) in historyList"
          :key="item.id || index"
          :label="item.effectiveDate"
          :dot-color="index === 0 ? 'blue' : 'gray'"
        >
          <div class="history-item-content">
            <div class="history-main">
              <div class="rank-info">
                <span class="label">变更为：</span>
                <a-tag color="arcoblue" size="small">{{
                  item.rankName || item.rankId
                }}</a-tag>
              </div>
              <div class="history-ops" v-if="!readonly">
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
            <div v-if="item.reason" class="reason">
              <span class="label">原因：</span>
              <span>{{ item.reason }}</span>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '修改职级变动' : '新增职级变动'"
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
        <a-form-item label="目标职级" field="rankId">
          <a-select
            v-model="formData.rankId"
            placeholder="请选择职级"
            :loading="ranksLoading"
            @change="handleRankChange"
          >
            <a-option
              v-for="rank in rankOptions"
              :key="rank.rankId"
              :value="rank.rankId"
            >
              {{ rank.rankName }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="生效日期" field="effectiveDate">
          <a-date-picker
            v-model="formData.effectiveDate"
            placeholder="请选择生效日期"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="变更原因" field="reason">
          <a-textarea
            v-model="formData.reason"
            placeholder="请输入变更原因"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { RankHistory, JobRank } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';
  import jobRankApi from '@/api/hr/job-rank';

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

  // 状态数据
  const loading = ref(false);
  const submitLoading = ref(false);
  const ranksLoading = ref(false);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1);
  const historyList = ref<RankHistory[]>([]);
  const rankOptions = ref<JobRank[]>([]);
  let tempIdCounter = 0;

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<RankHistory>>({
    rankId: '',
    rankName: '',
    effectiveDate: '',
    reason: '',
  });

  const formRules = {
    rankId: [{ required: true, message: '请选择目标职级' }],
    effectiveDate: [{ required: true, message: '请选择生效日期' }],
  };

  const getHistoryList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getRankHistoryList(
        props.userCode
      );
      if (response.code === 200) {
        historyList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取职级历史失败');
    } finally {
      loading.value = false;
    }
  };

  const getRankOptions = async () => {
    try {
      ranksLoading.value = true;
      const response = await jobRankApi.getJobRankList();
      if (response.code === 200) {
        rankOptions.value = response.data || [];
      }
    } catch (error) {
      // 静默失败，职级列表获取失败不影响主流程
    } finally {
      ranksLoading.value = false;
    }
  };

  const handleRankChange = (val: string) => {
    const rank = rankOptions.value.find((r) => r.rankId === val);
    formData.rankName = rank?.rankName || '';
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    formData.rankId = '';
    formData.rankName = '';
    const [today] = new Date().toISOString().split('T');
    formData.effectiveDate = today;
    formData.reason = '';
    formRef.value?.resetFields();
    modalVisible.value = true;
    if (rankOptions.value.length === 0) {
      getRankOptions();
    }
  };

  const handleEdit = (item: RankHistory, index: number) => {
    isEdit.value = true;
    currentId.value = item.id || null;
    currentIndex.value = index;
    Object.assign(formData, {
      rankId: item.rankId,
      rankName: item.rankName,
      effectiveDate: item.effectiveDate,
      reason: item.reason,
    });
    modalVisible.value = true;
    if (rankOptions.value.length === 0) {
      getRankOptions();
    }
  };

  const handleDelete = (item: RankHistory, index: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条职级记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          historyList.value.splice(index, 1);
          Message.success('删除成功');
        } else {
          try {
            if (item.id) {
              const response = await employeeRecordApi.deleteRankHistory(
                item.id
              );
              if (response.code === 200) {
                Message.success('删除职级变动记录成功');
                getHistoryList();
              }
            }
          } catch (error) {
            Message.error('删除失败');
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
        Object.assign(historyList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        historyList.value.unshift({
          ...formData,
          id: tempIdCounter,
        } as RankHistory);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        const response =
          isEdit.value && currentId.value
            ? await employeeRecordApi.updateRankHistory(
                currentId.value,
                formData
              )
            : await employeeRecordApi.createRankHistory(
                props.userCode,
                formData
              );

        if (response.code === 200) {
          Message.success(
            isEdit.value ? '修改职级变动成功' : '新增职级变动成功'
          );
          modalVisible.value = false;
          getHistoryList();
        }
      } catch (error) {
        Message.error(isEdit.value ? '修改失败' : '新增失败');
      } finally {
        submitLoading.value = false;
      }
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
  };

  const saveAllData = async (userCode: string): Promise<boolean> => {
    if (historyList.value.length === 0) return true;
    try {
      await Promise.all(
        historyList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createRankHistory(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => historyList.value;
  const clearData = () => {
    historyList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getHistoryList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getHistoryList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => historyList.value.length);

  defineExpose({
    refresh: getHistoryList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .rank-timeline {
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

    .history-item-content {
      .history-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .rank-info {
        font-weight: 500;
      }

      .history-ops {
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .history-ops {
        opacity: 1;
      }

      .reason {
        color: var(--color-text-3);
        font-size: 12px;
      }

      .label {
        color: var(--color-text-3);
        margin-right: 4px;
      }
    }
  }
</style>
