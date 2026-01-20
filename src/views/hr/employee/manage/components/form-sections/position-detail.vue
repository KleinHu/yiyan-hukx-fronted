<template>
  <a-card :bordered="false" class="form-block">
    <template #title>
      <div class="block-title"><icon-apps /> 核心岗位详细信息</div>
    </template>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item label="一级专业">
          <a-input
            :model-value="modelValue.primaryProfession"
            @update:model-value="updateField('primaryProfession', $event)"
            placeholder="请输入一级专业"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="二级专业">
          <a-input
            :model-value="modelValue.secondaryProfession"
            @update:model-value="updateField('secondaryProfession', $event)"
            placeholder="请输入二级专业"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="岗位分类">
          <a-input
            :model-value="modelValue.jobCategory"
            @update:model-value="updateField('jobCategory', $event)"
            placeholder="请输入岗位分类"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="岗位序列">
          <a-input
            :model-value="modelValue.positionType"
            @update:model-value="updateField('positionType', $event)"
            placeholder="请输入岗位序列"
          />
        </a-form-item>
      </a-col>
    </a-row>
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

  const updateField = (field: keyof Position, value: string) => {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: value,
    });
  };
</script>
