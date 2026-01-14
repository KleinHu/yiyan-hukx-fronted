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

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="honorList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #rewardLevel="{ record }">
        <a-tag
          v-if="record.rewardLevel"
          :color="getLevelColor(record.rewardLevel)"
        >
          {{ record.rewardLevel }}
        </a-tag>
        <span v-else>-</span>
      </template>
      <template #operations="{ record, rowIndex }">
        <a-space>
          <a-button
            type="text"
            size="small"
            @click="handleEdit(record, rowIndex)"
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
            @click="handleDelete(record, rowIndex)"
          >
            <template #icon>
              <icon-delete />
            </template>
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>

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
  import { ref, reactive, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { Honor } from '@/api/hr/types';
  import { RewardTypeOptions, RewardLevelOptions } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

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
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1);
  const honorList = ref<Honor[]>([]);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '奖励类型', dataIndex: 'rewardType', width: 100 },
    { title: '奖励名称', dataIndex: 'rewardName', width: 150 },
    { title: '奖励日期', dataIndex: 'rewardDate', width: 110 },
    { title: '奖励级别', slotName: 'rewardLevel', width: 100 },
    { title: '排名', dataIndex: 'ranking', width: 80 },
    { title: '操作', slotName: 'operations', width: 150, fixed: 'right' },
  ];

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

  // 根据级别获取颜色
  const getLevelColor = (level: string): string => {
    if (level.includes('国家')) return 'red';
    if (level.includes('省')) return 'orange';
    if (level.includes('市')) return 'gold';
    if (level.includes('公司')) return 'blue';
    return 'gray';
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

  defineExpose({
    refresh: getHonorList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
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
  }
</style>
