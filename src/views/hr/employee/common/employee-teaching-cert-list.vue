<template>
  <div class="teaching-cert-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增授课认证
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="certList.length === 0" class="empty-container">
        <a-empty description="暂无授课认证" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in certList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#165dff" :title="item.courseName">
              <template #extra>
                <a-tag v-if="item.courseType === 1" size="small" color="blue"
                  >技能</a-tag
                >
                <a-tag
                  v-else-if="item.courseType === 2"
                  size="small"
                  color="orange"
                  >管理</a-tag
                >
                <a-tag
                  v-else-if="item.courseType === 3"
                  size="small"
                  color="green"
                  >技术</a-tag
                >
                <span v-else>-</span>
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
      :title="isEdit ? '编辑授课认证' : '新增授课认证'"
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

        <a-form-item label="认证级别" field="certificationLevel">
          <a-select
            v-model="formData.certificationLevel"
            placeholder="请选择认证级别"
            allow-clear
          >
            <a-option
              v-for="item in CertificationLevelOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="认证日期" field="certificationDate">
          <a-date-picker
            v-model="formData.certificationDate"
            placeholder="请选择认证日期"
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
  import type { TeachingCertification } from '@/api/hr/types';
  import { CertificationLevelOptions, CourseTypeOptions } from '@/api/hr/types';
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
  const certList = ref<TeachingCertification[]>([]);
  let tempIdCounter = 0;

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<TeachingCertification>>({
    courseName: '',
    courseType: undefined,
    certificationLevel: undefined,
    certificationDate: '',
    remark: '',
  });

  const formRules = {
    courseName: [{ required: true, message: '请输入课程名称' }],
    courseType: [{ required: true, message: '请选择授课类型' }],
  };

  const getCertList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getTeachingCertList(
        props.userCode
      );
      if (response.code === 200) {
        certList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取授课认证失败');
    } finally {
      loading.value = false;
    }
  };

  const resetFormData = () => {
    formData.courseName = '';
    formData.courseType = undefined;
    formData.certificationLevel = undefined;
    formData.certificationDate = '';
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

  const handleEdit = (record: TeachingCertification, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: TeachingCertification, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条授课认证记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          certList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteTeachingCert(
                record.id
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getCertList();
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
        Object.assign(certList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        certList.value.push({
          ...formData,
          id: tempIdCounter,
        } as TeachingCertification);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateTeachingCert(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getCertList();
          }
        } else {
          const response = await employeeRecordApi.createTeachingCert(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getCertList();
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
    if (certList.value.length === 0) return true;
    try {
      await Promise.all(
        certList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createTeachingCert(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => certList.value;
  const clearData = () => {
    certList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getCertList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getCertList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => certList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getCertList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .teaching-cert-list {
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
