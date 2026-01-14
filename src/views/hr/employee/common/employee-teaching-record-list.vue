<template>
  <div class="teaching-record-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增授课认定
      </a-button>
    </div>

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="recordList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #courseType="{ record }">
        <a-tag v-if="record.courseType === 1" color="blue">技能</a-tag>
        <a-tag v-else-if="record.courseType === 2" color="orange">管理</a-tag>
        <a-tag v-else-if="record.courseType === 3" color="green">技术</a-tag>
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
      :title="isEdit ? '编辑授课认定' : '新增授课认定'"
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
        <a-form-item label="课程名称" field="courseName">
          <a-input v-model="formData.courseName" placeholder="请输入课程名称" />
        </a-form-item>

        <a-form-item label="授课类型" field="courseType">
          <a-select v-model="formData.courseType" placeholder="请选择授课类型">
            <a-option
              v-for="item in CourseTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
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
  import type { TeachingRecord } from '@/api/hr/types';
  import { CourseTypeOptions } from '@/api/hr/types';
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
  const recordList = ref<TeachingRecord[]>([]);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '课程名称', dataIndex: 'courseName', width: 200 },
    { title: '授课类型', slotName: 'courseType', width: 100 },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作', slotName: 'operations', width: 150, fixed: 'right' },
  ];

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<TeachingRecord>>({
    courseName: '',
    courseType: undefined,
    remark: '',
  });

  const formRules = {
    courseName: [{ required: true, message: '请输入课程名称' }],
    courseType: [{ required: true, message: '请选择授课类型' }],
  };

  const getRecordList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getTeachingRecordList(
        props.userCode
      );
      if (response.code === 200) {
        recordList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取授课认定失败');
    } finally {
      loading.value = false;
    }
  };

  const resetFormData = () => {
    formData.courseName = '';
    formData.courseType = undefined;
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

  const handleEdit = (record: TeachingRecord, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: TeachingRecord, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条授课认定记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          recordList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteTeachingRecord(
                record.id
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getRecordList();
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
        Object.assign(recordList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        recordList.value.push({
          ...formData,
          id: tempIdCounter,
        } as TeachingRecord);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateTeachingRecord(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getRecordList();
          }
        } else {
          const response = await employeeRecordApi.createTeachingRecord(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getRecordList();
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
    if (recordList.value.length === 0) return true;
    try {
      await Promise.all(
        recordList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createTeachingRecord(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => recordList.value;
  const clearData = () => {
    recordList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getRecordList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getRecordList();
    }
  });

  defineExpose({
    refresh: getRecordList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
  });
</script>

<style scoped lang="less">
  .teaching-record-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
