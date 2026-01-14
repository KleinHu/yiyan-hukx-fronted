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

    <a-table
      :columns="
        readonly ? columns.filter((c) => c.slotName !== 'operations') : columns
      "
      :data="contactList"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
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
  import { ref, reactive, onMounted, watch } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { EmergencyContact } from '@/api/hr/types';
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
  const contactList = ref<EmergencyContact[]>([]);
  let tempIdCounter = 0;

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '姓名', dataIndex: 'contactName', width: 120 },
    { title: '关系', dataIndex: 'relationship', width: 120 },
    { title: '联系电话', dataIndex: 'phone', width: 150 },
    { title: '操作', slotName: 'operations', width: 150, fixed: 'right' },
  ];

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

  defineExpose({
    refresh: getContactList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
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
  }
</style>
