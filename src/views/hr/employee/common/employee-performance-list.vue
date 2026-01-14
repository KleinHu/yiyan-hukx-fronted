<template>
  <div class="performance-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增绩效记录
      </a-button>
    </div>

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="performanceList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #performanceRating="{ record }">
        <a-tag size="small" :color="getRatingColor(record.performanceRating)">
          {{ record.performanceRating || '-' }}
        </a-tag>
      </template>

      <template #isExempt="{ record }">
        <a-tag size="small" :color="record.isExempt ? 'orange' : 'green'">
          {{ record.isExempt ? '不考核' : '参加考核' }}
        </a-tag>
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
  import { ref, reactive, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { Performance } from '@/api/hr/types';
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
  const performanceList = ref<Performance[]>([]);
  const currentIndex = ref<number>(-1);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '年度', dataIndex: 'year', width: 100 },
    {
      title: '绩效等级',
      dataIndex: 'performanceRating',
      slotName: 'performanceRating',
      width: 120,
    },
    { title: '绩效分数', dataIndex: 'score', width: 120 },
    {
      title: '考核状态',
      dataIndex: 'isExempt',
      slotName: 'isExempt',
      width: 120,
    },
    { title: '操作', slotName: 'operations', width: 100, fixed: 'right' },
  ];

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

  const getPerformanceList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getPerformanceList(
        props.userCode
      );
      if (response.code === 200) {
        performanceList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取绩效记录失败');
    } finally {
      loading.value = false;
    }
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

  const handleEdit = (record: Performance, rowIndex: number) => {
    isEdit.value = true;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: Performance, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条绩效记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          performanceList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.year) {
              const response = await employeeRecordApi.deletePerformance(
                props.userCode,
                record.year
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getPerformanceList();
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
        Object.assign(performanceList.value[currentIndex.value], {
          ...formData,
        });
      } else {
        tempIdCounter -= 1;
        performanceList.value.push({
          ...formData,
          id: tempIdCounter,
        } as Performance);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        const response = await employeeRecordApi.savePerformance(
          props.userCode,
          formData
        );
        if (response.code === 200) {
          Message.success(isEdit.value ? '更新成功' : '新增成功');
          modalVisible.value = false;
          getPerformanceList();
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
    if (performanceList.value.length === 0) return true;
    try {
      await Promise.all(
        performanceList.value.map((item) =>
          employeeRecordApi.savePerformance(userCode, item)
        )
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => performanceList.value;
  const clearData = () => {
    performanceList.value = [];
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

  defineExpose({
    refresh: getPerformanceList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
  });
</script>

<style scoped lang="less">
  .performance-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
