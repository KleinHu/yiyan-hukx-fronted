<template>
  <a-card :bordered="false" class="form-block position-detail-card">
    <template #title>
      <div class="block-title">
        <icon-settings /> 核心岗位详细信息 (岗位序列与分类)
      </div>
    </template>

    <div class="position-detail-layout">
      <a-row :gutter="[20, 16]">
        <a-col :span="12">
          <a-form-item field="primaryProfession" label="一级专业">
            <a-input
              :model-value="modelValue.primaryProfession"
              @update:model-value="updateField('primaryProfession', $event)"
              placeholder="一级专业"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="secondaryProfession" label="二级专业">
            <a-input
              :model-value="modelValue.secondaryProfession"
              @update:model-value="updateField('secondaryProfession', $event)"
              placeholder="二级专业"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="jobCategory" label="岗位分类">
            <a-input
              :model-value="modelValue.jobCategory"
              @update:model-value="updateField('jobCategory', $event)"
              placeholder="岗位分类"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="positionType" label="岗位序列">
            <a-input
              :model-value="modelValue.positionType"
              @update:model-value="updateField('positionType', $event)"
              placeholder="岗位序列"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import type { Position } from '@/api/hr/types';

  interface Props {
    modelValue: Partial<Position>;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Partial<Position>): void;
  }>();

  const updateField = (field: keyof Position, value: unknown) => {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: value,
    });
  };
</script>

<style scoped lang="less">
  .position-detail-card {
    background: #fff;
    border-radius: 8px;
    margin-top: 4px;

    .position-detail-layout {
      padding: 8px 0;
      width: 100%;
    }
  }
</style>
