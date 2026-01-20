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
  const contactList = ref<EmergencyContact[]>([]);
  let tempIdCounter = 0;

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

  const getContactList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getEmergencyContactList(
        props.userCode
      );
      if (response.code === 200) {
        contactList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取紧急联系人失败');
    } finally {
      loading.value = false;
    }
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
          contactList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteEmergencyContact(
                record.id
              );
              if (response.code === 200) {
                Message.success('删除成功');
                getContactList();
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
        Object.assign(contactList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        contactList.value.push({
          ...formData,
          id: tempIdCounter,
        } as EmergencyContact);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateEmergencyContact(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getContactList();
          }
        } else {
          const response = await employeeRecordApi.createEmergencyContact(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getContactList();
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
    if (contactList.value.length === 0) return true;
    try {
      await Promise.all(
        contactList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createEmergencyContact(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => contactList.value;
  const clearData = () => {
    contactList.value = [];
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
