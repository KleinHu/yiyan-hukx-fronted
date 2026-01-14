<template>
  <div class="position-form">
    <a-form ref="formRef" :model="formData" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="一级专业" field="primaryProfession">
            <a-input
              v-model="formData.primaryProfession"
              placeholder="请输入一级专业"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="二级专业" field="secondaryProfession">
            <a-input
              v-model="formData.secondaryProfession"
              placeholder="请输入二级专业"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="岗位分类" field="jobCategory">
            <a-input
              v-model="formData.jobCategory"
              placeholder="请输入岗位分类"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="岗位序列" field="positionType">
            <a-input
              v-model="formData.positionType"
              placeholder="请输入岗位序列"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { Position } from '@/api/hr/types';
  import employeeRecordApi from '@/api/hr/records';

  interface Props {
    userCode: string;
  }

  const props = defineProps<Props>();

  // 响应式数据
  const saving = ref(false);
  const formData = reactive<Partial<Position>>({
    primaryProfession: '',
    secondaryProfession: '',
    jobCategory: '',
    positionType: '',
  });

  const formRef = ref();

  // 获取岗位信息
  const getPosition = async () => {
    if (!props.userCode) return;
    try {
      const response = await employeeRecordApi.getPosition(props.userCode);
      if (response.code === 200 && response.data) {
        Object.assign(formData, response.data);
      }
    } catch (error) {
      Message.error('获取岗位信息失败');
    }
  };

  // 保存
  const handleSave = async () => {
    try {
      saving.value = true;
      const response = await employeeRecordApi.savePosition(
        props.userCode,
        formData
      );
      if (response.code === 200) {
        Message.success('保存成功');
      }
    } catch (error) {
      Message.error('保存失败');
    } finally {
      saving.value = false;
    }
  };

  // 重置
  const handleReset = () => {
    formData.primaryProfession = '';
    formData.secondaryProfession = '';
    formData.jobCategory = '';
    formData.positionType = '';
    formRef.value?.resetFields();
    getPosition();
  };

  // 监听userCode变化
  watch(
    () => props.userCode,
    (newCode) => {
      if (newCode) {
        getPosition();
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    if (props.userCode) {
      getPosition();
    }
  });

  // 暴露方法供父组件调用
  defineExpose({
    handleSave,
    handleReset,
  });
</script>

<style scoped lang="less">
  .position-form {
    padding: 0;
  }
</style>
