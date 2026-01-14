<template>
  <div class="mentors-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增带教记录
      </a-button>
    </div>

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="mentorList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #teachingContents="{ record }">
        <a-space wrap>
          <a-tag
            v-for="(item, index) in parseTeachingContents(
              record.teachingContents
            )"
            :key="index"
            size="small"
            color="arcoblue"
          >
            {{ item }}
          </a-tag>
        </a-space>
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
      :title="isEdit ? '编辑带教记录' : '新增带教记录'"
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
        <a-form-item label="岗位师傅工号" field="positionMentorCode">
          <a-input
            v-model="formData.positionMentorCode"
            placeholder="请输入岗位师傅工号"
          />
        </a-form-item>

        <a-form-item label="岗位师傅姓名" field="positionMentorName">
          <a-input
            v-model="formData.positionMentorName"
            placeholder="请输入岗位师傅姓名"
          />
        </a-form-item>

        <a-form-item label="指导师傅工号" field="guidanceMentorCode">
          <a-input
            v-model="formData.guidanceMentorCode"
            placeholder="请输入指导师傅工号"
          />
        </a-form-item>

        <a-form-item label="指导师傅姓名" field="guidanceMentorName">
          <a-input
            v-model="formData.guidanceMentorName"
            placeholder="请输入指导师傅姓名"
          />
        </a-form-item>

        <a-form-item label="授课内容" field="teachingContentsList">
          <a-input-tag
            v-model="formData.teachingContentsList"
            placeholder="输入内容后按回车添加"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="带教开始日期" field="startDate">
          <a-date-picker
            v-model="formData.startDate"
            placeholder="请选择开始日期"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="带教结束日期" field="endDate">
          <a-date-picker
            v-model="formData.endDate"
            placeholder="请选择结束日期"
            style="width: 100%"
          />
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
  import type { EmployeeMentor } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  interface Props {
    userCode: string;
    hideHeader?: boolean;
    readonly?: boolean;
    isNewMode?: boolean;
  }

  interface FormDataType extends Partial<EmployeeMentor> {
    teachingContentsList?: string[];
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
  const mentorList = ref<EmployeeMentor[]>([]);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '岗位师傅', dataIndex: 'positionMentorName', width: 100 },
    { title: '指导师傅', dataIndex: 'guidanceMentorName', width: 100 },
    { title: '授课内容', slotName: 'teachingContents', width: 200 },
    { title: '开始日期', dataIndex: 'startDate', width: 110 },
    { title: '结束日期', dataIndex: 'endDate', width: 110 },
    { title: '操作', slotName: 'operations', width: 150, fixed: 'right' },
  ];

  // 表单数据
  const formRef = ref();
  const formData = reactive<FormDataType>({
    positionMentorCode: '',
    positionMentorName: '',
    guidanceMentorCode: '',
    guidanceMentorName: '',
    teachingContentsList: [],
    startDate: '',
    endDate: '',
    remark: '',
  });

  const formRules = {
    positionMentorName: [{ required: true, message: '请输入岗位师傅姓名' }],
  };

  // 解析授课内容JSON
  const parseTeachingContents = (contents: string | undefined): string[] => {
    if (!contents) return [];
    try {
      return JSON.parse(contents);
    } catch {
      return contents ? [contents] : [];
    }
  };

  const getMentorList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getMentorList(props.userCode);
      if (response.code === 200) {
        mentorList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取带教记录失败');
    } finally {
      loading.value = false;
    }
  };

  const resetFormData = () => {
    formData.positionMentorCode = '';
    formData.positionMentorName = '';
    formData.guidanceMentorCode = '';
    formData.guidanceMentorName = '';
    formData.teachingContentsList = [];
    formData.startDate = '';
    formData.endDate = '';
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

  const handleEdit = (record: EmployeeMentor, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, {
      ...record,
      teachingContentsList: parseTeachingContents(record.teachingContents),
    });
    modalVisible.value = true;
  };

  const handleDelete = (record: EmployeeMentor, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条带教记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          mentorList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteMentor(record.id);
              if (response.code === 200) {
                Message.success('删除成功');
                getMentorList();
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

    // 将数组转为JSON字符串
    const submitData: Partial<EmployeeMentor> = {
      ...formData,
      teachingContents: JSON.stringify(formData.teachingContentsList || []),
    };
    delete (submitData as FormDataType).teachingContentsList;

    if (props.isNewMode) {
      if (isEdit.value && currentIndex.value >= 0) {
        Object.assign(mentorList.value[currentIndex.value], submitData);
      } else {
        tempIdCounter -= 1;
        mentorList.value.push({
          ...submitData,
          id: tempIdCounter,
        } as EmployeeMentor);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateMentor(
            currentId.value,
            submitData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getMentorList();
          }
        } else {
          const response = await employeeRecordApi.createMentor(
            props.userCode,
            submitData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getMentorList();
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
    if (mentorList.value.length === 0) return true;
    try {
      await Promise.all(
        mentorList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createMentor(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => mentorList.value;
  const clearData = () => {
    mentorList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getMentorList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getMentorList();
    }
  });

  defineExpose({
    refresh: getMentorList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
  });
</script>

<style scoped lang="less">
  .mentors-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
