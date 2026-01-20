<template>
  <div class="skills-list">
    <div v-if="!hideHeader && !readonly" class="list-header">
      <a-button type="primary" size="mini" @click="showAddModal">
        <template #icon>
          <icon-plus />
        </template>
        新增技能鉴定
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <div v-if="skillList.length === 0" class="empty-container">
        <a-empty description="暂无技能鉴定" />
      </div>
      <div v-else class="data-list">
        <a-row :gutter="16">
          <a-col
            v-for="(item, index) in skillList"
            :key="item.id || index"
            :span="colSpan"
          >
            <DataItem border-color="#ff7d00" :title="item.trade">
              <template #extra>
                <a-tag
                  v-if="item.level"
                  size="small"
                  :color="getLevelColor(item.level)"
                >
                  {{ item.level }}
                </a-tag>
                <span v-else class="item-time">-</span>
              </template>
              <template #description>
                <span v-if="item.certificationDate">
                  {{ formatDate(item.certificationDate) }}
                </span>
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
      :title="isEdit ? '编辑技能鉴定' : '新增技能鉴定'"
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
        <a-form-item label="鉴定工种" field="trade">
          <a-input v-model="formData.trade" placeholder="请输入鉴定工种" />
        </a-form-item>

        <a-form-item label="鉴定等级" field="level">
          <a-input v-model="formData.level" placeholder="请输入鉴定等级" />
        </a-form-item>

        <a-form-item label="鉴定日期" field="certificationDate">
          <a-date-picker
            v-model="formData.certificationDate"
            placeholder="请选择鉴定日期"
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
  import type { SkillCertification } from '@/api/hr/types';
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

  // 状态数据
  const loading = ref(false);
  const submitLoading = ref(false);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentId = ref<number | null>(null);
  const currentIndex = ref<number>(-1);
  const skillList = ref<SkillCertification[]>([]);
  let tempIdCounter = 0;

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 根据等级获取标签颜色
  const getLevelColor = (level?: string) => {
    if (!level) return 'default';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('高级') || levelLower.includes('高')) {
      return 'red';
    }
    if (levelLower.includes('中级') || levelLower.includes('中')) {
      return 'gold';
    }
    if (levelLower.includes('初级') || levelLower.includes('初')) {
      return 'arcoblue';
    }
    return 'orange';
  };

  // 表单数据
  const formRef = ref();
  const formData = reactive<Partial<SkillCertification>>({
    trade: '',
    level: '',
    certificationDate: '',
  });

  const formRules = {
    trade: [{ required: true, message: '请输入鉴定工种' }],
    level: [{ required: true, message: '请输入鉴定等级' }],
    certificationDate: [{ required: true, message: '请选择鉴定日期' }],
  };

  const getSkillList = async () => {
    if (!props.userCode || props.isNewMode) return;
    try {
      loading.value = true;
      const response = await employeeRecordApi.getSkillList(props.userCode);
      if (response.code === 200) {
        skillList.value = response.data || [];
      }
    } catch (error) {
      Message.error('获取技能鉴定失败');
    } finally {
      loading.value = false;
    }
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentId.value = null;
    currentIndex.value = -1;
    formData.trade = '';
    formData.level = '';
    formData.certificationDate = '';
    formRef.value?.resetFields();
    modalVisible.value = true;
  };

  const handleEdit = (record: SkillCertification, rowIndex: number) => {
    isEdit.value = true;
    currentId.value = record.id || null;
    currentIndex.value = rowIndex;
    Object.assign(formData, record);
    modalVisible.value = true;
  };

  const handleDelete = (record: SkillCertification, rowIndex: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条技能鉴定记录吗？',
      onOk: async () => {
        if (props.isNewMode) {
          skillList.value.splice(rowIndex, 1);
          Message.success('删除成功');
        } else {
          try {
            if (record.id) {
              const response = await employeeRecordApi.deleteSkill(record.id);
              if (response.code === 200) {
                Message.success('删除成功');
                getSkillList();
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
        Object.assign(skillList.value[currentIndex.value], { ...formData });
      } else {
        tempIdCounter -= 1;
        skillList.value.push({
          ...formData,
          id: tempIdCounter,
        } as SkillCertification);
      }
      Message.success(isEdit.value ? '修改成功' : '新增成功');
      modalVisible.value = false;
    } else {
      try {
        submitLoading.value = true;
        if (isEdit.value && currentId.value) {
          const response = await employeeRecordApi.updateSkill(
            currentId.value,
            formData
          );
          if (response.code === 200) {
            Message.success('更新成功');
            modalVisible.value = false;
            getSkillList();
          }
        } else {
          const response = await employeeRecordApi.createSkill(
            props.userCode,
            formData
          );
          if (response.code === 200) {
            Message.success('新增成功');
            modalVisible.value = false;
            getSkillList();
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
    if (skillList.value.length === 0) return true;
    try {
      await Promise.all(
        skillList.value.map((item) => {
          const { id: _id, ...data } = item;
          return employeeRecordApi.createSkill(userCode, data);
        })
      );
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLocalData = () => skillList.value;
  const clearData = () => {
    skillList.value = [];
  };

  watch(
    () => props.isNewMode,
    (newVal) => {
      if (!newVal && props.userCode) {
        getSkillList();
      }
    }
  );

  onMounted(() => {
    if (!props.isNewMode && props.userCode) {
      getSkillList();
    }
  });

  // 计算数量（响应式）
  const count = computed(() => skillList.value.length);

  // 计算每列的 span 值（Arco 的 col 使用 24 栅格系统）
  const colSpan = computed(() => {
    return Math.floor(24 / props.columns);
  });

  defineExpose({
    refresh: getSkillList,
    handleAdd: showAddModal,
    saveAllData,
    getLocalData,
    clearData,
    count,
  });
</script>

<style scoped lang="less">
  .skills-list {
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
