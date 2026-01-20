<template>
  <div class="education-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增教育经历
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="educationList.length === 0" class="empty-container">
        <a-empty description="暂无教育经历" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in educationList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#165dff" :title="item.major || '-'">
              <template #extra>
                <a-tag v-if="item.degree" size="small" color="arcoblue">
                  {{ getDegreeName(item.degree) }}
                </a-tag>
                <span v-else>-</span>
              </template>
              <template #description>
                <div class="item-sub">
                  <span v-if="item.majorCategory" style="color: #86909c">
                    专业大类:
                    <span class="highlight">{{ item.majorCategory }}</span>
                  </span>
                  <span
                    v-if="item.startYear || item.endYear"
                    style="margin-top: 4px; display: block; color: #86909c"
                  >
                    <span v-if="item.startYear && item.endYear">
                      {{ item.startYear }} ~ {{ item.endYear }}
                    </span>
                    <span v-else-if="item.startYear">
                      {{ item.startYear }} ~
                    </span>
                    <span v-else-if="item.endYear"> ~ {{ item.endYear }} </span>
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
      :title="isEdit ? '编辑教育经历' : '新增教育经历'"
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
        <a-form-item label="学历" field="degree">
          <a-select v-model="formData.degree" placeholder="请选择学历">
            <a-option :value="1">高中</a-option>
            <a-option :value="2">大专</a-option>
            <a-option :value="3">本科</a-option>
            <a-option :value="4">硕士</a-option>
            <a-option :value="5">博士</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="在校专业" field="major">
          <a-input v-model="formData.major" placeholder="请输入专业名称" />
        </a-form-item>

        <a-form-item label="专业大类" field="majorCategory">
          <a-input
            v-model="formData.majorCategory"
            placeholder="请输入专业大类"
          />
        </a-form-item>

        <a-form-item label="入学年份" field="startYear">
          <a-input-number
            v-model="formData.startYear"
            placeholder="YYYY"
            :min="1900"
            :max="2100"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="毕业年份" field="endYear">
          <a-input-number
            v-model="formData.endYear"
            placeholder="YYYY"
            :min="1900"
            :max="2100"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { Education } from '@/api/hr/types';
  import { DegreeOptions } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';
  import DataItem from '@/components/data-item/index.vue';

  interface Props {
    userCode: string;
    hideHeader?: boolean;
    readonly?: boolean;
    isNewMode?: boolean; // 新建模式：数据暂存本地，不立即调用API
    columns?: number; // 列数，默认1列
  }

  const props = withDefaults(defineProps<Props>(), {
    hideHeader: false,
    readonly: false,
    isNewMode: false,
    columns: 1,
  });

  // 响应式数据
  const loading = ref(false);
  const educationList = ref<Education[]>([]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1); // 用于新建模式下的编辑
  let tempIdCounter = 0; // 新建模式下的临时ID

  // 表单数据
  const formData = reactive<Partial<Education>>({
    degree: undefined,
    major: '',
    majorCategory: '',
    startYear: undefined,
    endYear: undefined,
  });

  const formRef = ref();
  const formRules = {
    degree: [{ required: true, message: '请选择学历' }],
  };

  const getDegreeName = (degree?: number) => {
    if (!degree) return '-';
    const option = DegreeOptions.find((opt) => opt.value === degree);
    return option?.label || '-';
  };

  // 获取教育经历列表（仅编辑模式调用）
  const getEducationList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getEducationList(props.userCode);
      if (response.code === 200) {
        educationList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取教育经历失败');
    } finally {
      loading.value = false;
    }
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    resetForm();
    modalVisible.value = true;
  };

  const handleEdit = (record: Education, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: Education, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条教育经历吗？',
      onOk: async () => {
        if (props.isNewMode) {
          // 新建模式：直接从列表移除
          educationList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          // 编辑模式：调用API删除
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteEducation(
                record.id
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getEducationList();
              }
            }
          } catch (error) {
            Message.error('删除失败');
          }
        }
      },
    });
  };

  const resetForm = () => {
    formData.degree = undefined;
    formData.major = '';
    formData.majorCategory = '';
    formData.startYear = undefined;
    formData.endYear = undefined;
    formRef.value?.resetFields();
  };

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate();
    if (valid) return;

    if (props.isNewMode) {
      // 新建模式：数据暂存本地
      if (isEdit.value && currentIndex.value >= 0) {
        // 编辑本地数据
        Object.assign(educationList.value[currentIndex.value], { ...formData });
      } else {
        // 新增本地数据
        tempIdCounter -= 1;
        educationList.value.push({
          ...formData,
          id: tempIdCounter,
        } as Education);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      // 编辑模式：调用API
      try {
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateEducation(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getEducationList();
          }
        } else {
          const response = await employeeRecordApi.createEducation(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getEducationList();
          }
        }
      } catch (error) {
        Message.error('操作失败');
      }
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  /**
   * 批量保存数据（新建模式使用）
   * @param userCode 员工工号
   */
  const saveAllData = async (userCode: string): Promise<boolean> => {
    if (educationList.value.length === 0) return true;

    try {
      await Promise.all(
        educationList.value.map((item) => {
          const { id: _id, ...data } = item; // 移除临时ID
          return employeeRecordApi.createEducation(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 获取本地暂存的数据
   */
  const getLocalData = () => {
    return educationList.value;
  };

  /**
   * 清空本地数据
   */
  const clearData = () => {
    educationList.value = [];
  };

  // 监听 isNewMode 变化，切换到编辑模式时加载数据
  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getEducationList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getEducationList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => educationList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getEducationList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .education-list {
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
