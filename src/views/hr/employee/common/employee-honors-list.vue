<template>
  <div class="honors-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增荣誉记录
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="honorList.length === 0" class="empty-container">
        <a-empty description="暂无荣誉记录" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in honorList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#f53f3f">
              <template #title>
                <span class="item-title">
                  <span v-if="item.rewardType">
                    奖励类型:
                    <span class="highlight">{{ item.rewardType }}</span>
                  </span>
                </span>
              </template>
              <template #extra>
                <a-tag v-if="item.ranking" size="small" color="red">
                  {{ item.ranking }}
                </a-tag>
                <span v-else>-</span>
              </template>
              <template #description>
                <div class="item-sub">
                  <span v-if="item.rewardName" style="color: #86909c">
                    奖励名称:
                    <span class="highlight">{{ item.rewardName }}</span>
                  </span>
                </div>
              </template>
              <template v-if="!readonly" #action>
                <a-space :size="4" direction="vertical">
                  <a-button
                    type="text"
                    size="small"
                    @click.stop="handleEdit(item, index)"
                  >
                    <template #icon>
                      <icon-edit />
                    </template>
                    编辑
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    status="danger"
                    @click.stop="handleDelete(item, index)"
                  >
                    <template #icon>
                      <icon-delete />
                    </template>
                    删除
                  </a-button>
                </a-space>
              </template>
            </DataItem>
          </a-col>
        </a-row>
      </div>
    </a-spin>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑荣誉记录' : '新增荣誉记录'"
      :confirm-loading="submitLoading"
      width="600px"
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
        <a-form-item label="奖励类型" field="rewardType">
          <a-select
            v-model="formData.rewardType"
            placeholder="请选择奖励类型"
            allow-search
            allow-clear
          >
            <a-option
              v-for="item in RewardTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="奖励名称" field="rewardName">
          <a-input v-model="formData.rewardName" placeholder="请输入奖励名称" />
        </a-form-item>

        <a-form-item label="奖励日期" field="rewardDate">
          <a-date-picker
            v-model="formData.rewardDate"
            placeholder="请选择奖励日期"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="奖励级别" field="rewardLevel">
          <a-select
            v-model="formData.rewardLevel"
            placeholder="请选择奖励级别"
            allow-clear
          >
            <a-option
              v-for="item in RewardLevelOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="授予机关" field="approvingAuthority">
          <a-input
            v-model="formData.approvingAuthority"
            placeholder="请输入批准（授予）机关名称"
          />
        </a-form-item>

        <a-form-item label="奖励事由" field="rewardReason">
          <a-textarea
            v-model="formData.rewardReason"
            placeholder="请输入奖励事由"
            :max-length="500"
            show-word-limit
          />
        </a-form-item>

        <a-form-item label="排名" field="ranking">
          <a-input v-model="formData.ranking" placeholder="如：第1名、优秀奖" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { Honor } from '@/api/hr/types';
  import { RewardTypeOptions, RewardLevelOptions } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';
  import DataItem from '@/components/data-item/index.vue';

  interface Props {
    userCode: string;
    hideHeader?: boolean;
    readonly?: boolean;
    isNewMode?: boolean;
    columns?: number; // 列数，默认1列
  }

  const props = withDefaults(defineProps<Props>(), {
    hideHeader: false,
    readonly: false,
    isNewMode: false,
    columns: 1,
  });

  // 状态数据
  const loading = ref(false);
  const submitLoading = ref(false);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1);
  const honorList = ref<Honor[]>([]);
  let tempIdCounter = 0;

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<Honor>>({
    rewardType: '',
    rewardName: '',
    rewardDate: '',
    rewardLevel: '',
    approvingAuthority: '',
    rewardReason: '',
    ranking: '',
  });

  const formRules = {
    rewardType: [{ required: true, message: '请选择奖励类型' }],
    rewardName: [{ required: true, message: '请输入奖励名称' }],
    rewardDate: [{ required: true, message: '请选择奖励日期' }],
  };

  const getHonorList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getHonorList(props.userCode);
      if (response.code === 200) {
        honorList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取荣誉记录失败');
    } finally {
      loading.value = false;
    }
  };

  const resetFormData = () => {
    formData.rewardType = '';
    formData.rewardName = '';
    formData.rewardDate = '';
    formData.rewardLevel = '';
    formData.approvingAuthority = '';
    formData.rewardReason = '';
    formData.ranking = '';
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    resetFormData();
    formRef.value?.resetFields();
    modalVisible.value = true;
  };

  const handleEdit = (record: Honor, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: Honor, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条荣誉记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          honorList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteHonor(record.id);
              if (response.code === 200) {
                Message.success('删除成功');
                getHonorList();
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
        Object.assign(honorList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        honorList.value.push({
          ...formData,
          id: tempIdCounter,
        } as Honor);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateHonor(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getHonorList();
          }
        } else {
          const response = await employeeRecordApi.createHonor(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getHonorList();
          }
        }
      } catch (error) {
        Message.error('操作失败');
      } finally {
        submitLoading.value = false;
      }
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
  };

  const saveAllData = async (userCode: string): Promise<boolean> => {
    if (honorList.value.length === 0) return true;
    try {
      await Promise.all(
        honorList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createHonor(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => honorList.value;
  const clearData = () => {
    honorList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getHonorList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getHonorList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => honorList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getHonorList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .honors-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }

    .empty-container {
      padding: 40px 0;
    }

    .data-list {
      :deep(.arco-row) {
        margin: 0 -8px;
      }
      :deep(.arco-col) {
        padding: 0 8px;
        margin-bottom: 16px;
      }
    }
  }
</style>
