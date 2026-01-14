<template>
  <div class="secondary-edu-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增二级教育
      </a-button>
    </div>

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="eduList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #educationType="{ record }">
        {{ getEducationTypeName(record.educationType) }}
      </template>
      <template #isCompleted="{ record }">
        <a-tag v-if="record.isCompleted === 0" color="gray">未完成</a-tag>
        <a-tag v-else-if="record.isCompleted === 1" color="green">已完成</a-tag>
        <a-tag v-else-if="record.isCompleted === 2" color="orange">免修</a-tag>
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
      :title="isEdit ? '编辑二级教育' : '新增二级教育'"
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
        <a-form-item label="教育类型" field="educationType">
          <a-select
            v-model="formData.educationType"
            placeholder="请选择教育类型"
          >
            <a-option
              v-for="item in SecondaryEducationTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="教育名称" field="educationName">
          <a-input
            v-model="formData.educationName"
            placeholder="请输入教育名称（选填）"
          />
        </a-form-item>

        <a-form-item label="培训年度" field="year">
          <a-input-number
            v-model="formData.year"
            placeholder="请输入年度"
            :min="2000"
            :max="2100"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="完成状态" field="isCompleted">
          <a-select v-model="formData.isCompleted" placeholder="请选择完成状态">
            <a-option
              v-for="item in SecondaryEducationStatusOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="完成日期" field="completeDate">
          <a-date-picker
            v-model="formData.completeDate"
            placeholder="请选择完成日期"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="考核成绩" field="score">
          <a-input-number
            v-model="formData.score"
            placeholder="请输入考核成绩"
            :min="0"
            :max="100"
            :precision="2"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="培训讲师" field="trainer">
          <a-input v-model="formData.trainer" placeholder="请输入培训讲师" />
        </a-form-item>

        <a-form-item label="备注" field="remark">
          <a-textarea
            v-model="formData.remark"
            placeholder="请输入备注"
            :max-length="500"
            show-word-limit
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { SecondaryEducation } from '@/api/hr/types';
  import {
    SecondaryEducationTypeOptions,
    SecondaryEducationStatusOptions,
  } from '@/api/hr/types';
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
  const eduList = ref<SecondaryEducation[]>([]);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '教育类型', slotName: 'educationType', width: 100 },
    { title: '教育名称', dataIndex: 'educationName', width: 120 },
    { title: '年度', dataIndex: 'year', width: 80 },
    { title: '完成状态', slotName: 'isCompleted', width: 100 },
    { title: '完成日期', dataIndex: 'completeDate', width: 110 },
    { title: '考核成绩', dataIndex: 'score', width: 80 },
    { title: '操作', slotName: 'operations', width: 150, fixed: 'right' },
  ];

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<SecondaryEducation>>({
    educationType: undefined,
    educationName: '',
    year: new Date().getFullYear(),
    isCompleted: 0,
    completeDate: '',
    score: undefined,
    trainer: '',
    remark: '',
  });

  const formRules = {
    educationType: [{ required: true, message: '请选择教育类型' }],
    year: [{ required: true, message: '请输入培训年度' }],
    isCompleted: [{ required: true, message: '请选择完成状态' }],
  };

  // 获取教育类型名称
  const getEducationTypeName = (type: number): string => {
    const item = SecondaryEducationTypeOptions.find(
      (opt) => opt.value === type
    );
    return item?.label || '-';
  };

  const getEduList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getSecondaryEducationList(
        props.userCode
      );
      if (response.code === 200) {
        eduList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取二级教育失败');
    } finally {
      loading.value = false;
    }
  };

  const resetFormData = () => {
    formData.educationType = undefined;
    formData.educationName = '';
    formData.year = new Date().getFullYear();
    formData.isCompleted = 0;
    formData.completeDate = '';
    formData.score = undefined;
    formData.trainer = '';
    formData.remark = '';
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    resetFormData();
    formRef.value?.resetFields();
    modalVisible.value = true;
  };

  const handleEdit = (record: SecondaryEducation, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: SecondaryEducation, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条二级教育记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          eduList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteSecondaryEducation(
                record.id
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getEduList();
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
        Object.assign(eduList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        eduList.value.push({
          ...formData,
          id: tempIdCounter,
        } as SecondaryEducation);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateSecondaryEducation(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getEduList();
          }
        } else {
          const response = await employeeRecordApi.createSecondaryEducation(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getEduList();
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
    if (eduList.value.length === 0) return true;
    try {
      await Promise.all(
        eduList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createSecondaryEducation(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => eduList.value;
  const clearData = () => {
    eduList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getEduList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getEduList();
    }
  });

  defineExpose({
    refresh: getEduList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
  });
</script>

<style scoped lang="less">
  .secondary-edu-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
