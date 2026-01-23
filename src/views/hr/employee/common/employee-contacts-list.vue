<template>
  <div class="contacts-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增紧急联系人
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="contactList.length === 0" class="empty-container">
        <a-empty description="暂无紧急联系人" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in contactList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#722ed1" :title="item.contactName">
              <template #extra>
                <a-tag v-if="item.relationship" size="small" color="blue">
                  {{ item.relationship }}
                </a-tag>
                <span v-else class="item-time">-</span>
              </template>
              <template #description>
                <icon-phone style="margin-right: 4px" />
                <span class="highlight">{{ item.phone }}</span>
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
      :title="isEdit ? '编辑紧急联系人' : '新增紧急联系人'"
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
        <a-form-item label="联系人姓名" field="contactName">
          <a-input v-model="formData.contactName" placeholder="请输入姓名" />
        </a-form-item>

        <a-form-item label="关系" field="relationship">
          <a-input
            v-model="formData.relationship"
            placeholder="请输入关系（如：父亲、配偶）"
          />
        </a-form-item>

        <a-form-item label="联系电话" field="phone">
          <a-input v-model="formData.phone" placeholder="请输入联系电话" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { EmergencyContact } from '@/api/hr/types';
  import useEmployeeRecords from '@/hooks/hr/employee-records';
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
  const localContactList = ref<EmergencyContact[]>([]);

  // 计算属性
  const loading = computed(() =>
    props.isNewMode ? false : employeeRecords?.loading.value || false
  );
  const contactList = computed(() =>
    props.isNewMode
      ? localContactList.value
      : employeeRecords?.emergencyContactList.value || []
  );

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<EmergencyContact>>({
    contactName: '',
    relationship: '',
    phone: '',
  });

  const formRules = {
    contactName: [{ required: true, message: '请输入联系人姓名' }],
    relationship: [{ required: true, message: '请输入关系' }],
    phone: [{ required: true, message: '请输入联系电话' }],
  };

  const getContactList = async (): Promise<void> => {
    if (!props.userCode || props.isNewMode || !employeeRecords) return;
    await employeeRecords.fetchEmergencyContactList();
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    formData.contactName = '';
    formData.relationship = '';
    formData.phone = '';
    formRef.value?.resetFields();
    modalVisible.value = true;
  };

  const handleEdit = (record: EmergencyContact, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: EmergencyContact, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这位紧急联系人吗？',
      onOk: async () => {
        if (props.isNewMode) {
          localContactList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else if (record.id && employeeRecords) {
          const success = await employeeRecords.deleteEmergencyContact(
            record.id
          );
          if (success) {
            await getContactList();
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
        Object.assign(localContactList.value[currentIndex.value], {
          ...formData,
        });
      } else {
        tempIdCounter -= 1;
        localContactList.value.push({
          ...formData,
          id: tempIdCounter,
        } as EmergencyContact);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      if (!employeeRecords) return;

      try {
        submitLoading.value = true;
        let success = false;
        if (isEdit.value && currentId.value) {
          success = await employeeRecords.updateEmergencyContact(
            currentId.value,
            formData
          );
        } else {
          success = await employeeRecords.createEmergencyContact(formData);
        }

        if (success) {
          modalVisible.value = false;
          await getContactList();
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
    if (localContactList.value.length === 0) return true;
    try {
      const records = useEmployeeRecords(userCode);
      await Promise.all(
        localContactList.value.map((item) => {
          const { id: _id, ...data } = item;
          return records.createEmergencyContact(data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => localContactList.value;
  const clearData = (): void => {
    localContactList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getContactList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getContactList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => contactList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getContactList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .contacts-list {
    padding: 0;

    .list-header {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;
    }

    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 120px;
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
