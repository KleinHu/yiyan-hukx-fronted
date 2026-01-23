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

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="mentorList.length === 0" class="empty-container">
        <a-empty description="暂无带教记录" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in mentorList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#722ed1">
              <template #title>
                <span class="item-title">
                  <span v-if="item.positionMentorName">
                    岗位师傅:
                    <span class="highlight">{{ item.positionMentorName }}</span>
                  </span>
                  <span
                    v-if="item.positionMentorName && item.guidanceMentorName"
                  >
                    &nbsp;&nbsp;
                  </span>
                  <span v-if="item.guidanceMentorName">
                    指导师傅:
                    <span class="highlight">{{ item.guidanceMentorName }}</span>
                  </span>
                </span>
              </template>
              <template #description>
                <div class="item-sub">
                  <div
                    v-if="
                      parseTeachingContents(item.teachingContents).length > 0
                    "
                    style="margin-bottom: 4px"
                  >
                    <span style="color: #86909c">授课内容: </span>
                    <a-tag
                      v-for="(content, idx) in parseTeachingContents(
                        item.teachingContents
                      )"
                      :key="idx"
                      size="small"
                      color="arcoblue"
                      style="margin-right: 4px"
                    >
                      {{ content }}
                    </a-tag>
                  </div>
                  <span
                    v-if="item.startDate || item.endDate"
                    style="color: #86909c"
                  >
                    <span v-if="item.startDate && item.endDate">
                      {{ formatDate(item.startDate) }} ~
                      {{ formatDate(item.endDate) }}
                    </span>
                    <span v-else-if="item.startDate">
                      {{ formatDate(item.startDate) }} ~
                    </span>
                    <span v-else-if="item.endDate">
                      ~ {{ formatDate(item.endDate) }}
                    </span>
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
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { EmployeeMentor } from '@/api/hr/types';
  import useEmployeeRecords from '@/hooks/hr/employee-records';
  import DataItem from '@/components/data-item/index.vue';

  interface Props {
    userCode: string;
    hideHeader?: boolean;
    readonly?: boolean;
    isNewMode?: boolean;
    columns?: number; // 列数，默认1列
  }

  interface FormDataType extends Partial<EmployeeMentor> {
    teachingContentsList?: string[];
  }

  const props = withDefaults(defineProps<Props>(), {
    hideHeader: false,
    readonly: false,
    isNewMode: false,
    columns: 1,
  });

  // 使用 Hook（仅在编辑模式下使用）
  const employeeRecords = props.isNewMode
    ? null
    : useEmployeeRecords(props.userCode);

  // 状态数据
  const submitLoading = ref(false);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1);
  let tempIdCounter = 0;

  // 新建模式下的本地数据
  const localMentorList = ref<EmployeeMentor[]>([]);

  // 计算属性
  const loading = computed(() =>
    props.isNewMode ? false : employeeRecords?.loading.value || false
  );
  const mentorList = computed(() =>
    props.isNewMode
      ? localMentorList.value
      : employeeRecords?.mentorList.value || []
  );

  // 格式化日期
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return dateStr;
    }
  };

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

  const getMentorList = async (): Promise<void> => {
    if (!props.userCode || props.isNewMode || !employeeRecords) return;
    await employeeRecords.fetchMentorList();
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
          localMentorList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else if (record.id && employeeRecords) {
          const success = await employeeRecords.deleteMentor(record.id);
          if (success) {
            await getMentorList();
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
        Object.assign(localMentorList.value[currentIndex.value], submitData);
      } else {
        tempIdCounter -= 1;
        localMentorList.value.push({
          ...submitData,
          id: tempIdCounter,
        } as EmployeeMentor);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      if (!employeeRecords) return;

      try {
        submitLoading.value = true;
        let success = false;
        if (isEdit.value && currentId.value) {
          success = await employeeRecords.updateMentor(
            currentId.value,
            submitData
          );
        } else {
          success = await employeeRecords.createMentor(submitData);
        }

        if (success) {
          modalVisible.value = false;
          await getMentorList();
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
    if (localMentorList.value.length === 0) return true;
    try {
      const records = useEmployeeRecords(userCode);
      await Promise.all(
        localMentorList.value.map((item) => {
          const { id: _id, ...data } = item;
          return records.createMentor(data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => localMentorList.value;
  const clearData = (): void => {
    localMentorList.value = [];
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

  // 计算数量（响应式）
  const count = computed(() => mentorList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getMentorList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
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
