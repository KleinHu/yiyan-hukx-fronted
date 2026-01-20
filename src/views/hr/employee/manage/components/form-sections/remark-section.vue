<template>
  <a-card :bordered="false" class="form-block">
    <template #title>
      <div class="block-title"><icon-edit /> 综合备注</div>
    </template>
    <a-form-item hide-label>
      <a-textarea
        :model-value="modelValue.remark"
        @update:model-value="updateRemark"
        :rows="3"
        placeholder="请输入其他需要说明的人事档案信息..."
        allow-clear
      />
    </a-form-item>
  </a-card>
</template>

<script setup lang="ts">
  import type { Employee } from '@/api/hr/types';

  interface Props {
    modelValue: Partial<Employee>;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Partial<Employee>): void;
  }>();

  const updateRemark = (value: string) => {
    emit('update:modelValue', {
      ...props.modelValue,
      remark: value,
    });
  };
</script>
