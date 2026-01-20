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

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="eduList.length === 0" class="empty-container">
        <a-empty description="暂无二级教育" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in eduList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#00b42a">
              <template #title>
                <span class="item-title">
                  <span v-if="getEducationTypeName(item.educationType)">
                    教育类型:
                    <span class="highlight">{{
                      getEducationTypeName(item.educationType)
                    }}</span>
                  </span>
                  <span
                    v-if="
                      getEducationTypeName(item.educationType) &&
                      item.educationName
                    "
                  >
                    &nbsp;&nbsp;
                  </span>
                  <span v-if="item.educationName">
                    教育名称:
                    <span class="highlight">{{ item.educationName }}</span>
                  </span>
                </span>
              </template>
              <template #description>
                <div class="item-sub">
                  <span v-if="item.year" style="color: #86909c">
                    年度: <span class="highlight">{{ item.year }}</span>
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
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { SecondaryEducation } from '@/api/hr/types';
  import {
    SecondaryEducationTypeOptions,
    SecondaryEducationStatusOptions,
  } from '@/api/hr/types';
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
  const eduList = ref<SecondaryEducation[]>([]);
  let tempIdCounter = 0;

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

  // 计算数量（响应式）
  const count = computed(() => eduList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getEduList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
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
