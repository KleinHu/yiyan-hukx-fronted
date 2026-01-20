<template>
  <div class="description-editor">
    <div v-for="(item, index) in items" :key="index" class="description-row">
      <a-row :gutter="12" align="center">
        <a-col :span="8">
          <a-select
            :model-value="item.field"
            placeholder="字段名"
            allow-create
            @update:model-value="updateItem(index, 'field', $event)"
          >
            <a-option
              v-for="field in availableFields"
              :key="field"
              :value="field"
            >
              {{ field }}
            </a-option>
          </a-select>
        </a-col>
        <a-col :span="14">
          <a-input
            :model-value="item.description"
            placeholder="字段说明"
            @update:model-value="updateItem(index, 'description', $event)"
          />
        </a-col>
        <a-col :span="2">
          <a-button
            type="text"
            status="danger"
            class="delete-btn"
            @click="removeItem(index)"
          >
            <template #icon><icon-delete /></template>
          </a-button>
        </a-col>
      </a-row>
    </div>
    <a-button type="secondary" long class="add-btn" @click="addItem">
      <template #icon><icon-plus /></template>
      添加说明
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface DescriptionItem {
    field: string;
    description: string;
  }

  interface Props {
    modelValue: DescriptionItem[];
    availableFields?: string[];
  }

  const props = withDefaults(defineProps<Props>(), {
    availableFields: () => [],
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: DescriptionItem[]): void;
  }>();

  const items = ref<DescriptionItem[]>([...props.modelValue]);

  watch(
    () => props.modelValue,
    (val) => {
      items.value = [...val];
    },
    { deep: true }
  );

  const updateItem = (
    index: number,
    key: keyof DescriptionItem,
    value: string
  ) => {
    items.value[index] = { ...items.value[index], [key]: value };
    emit('update:modelValue', items.value);
  };

  const addItem = () => {
    items.value.push({ field: '', description: '' });
    emit('update:modelValue', items.value);
  };

  const removeItem = (index: number) => {
    items.value.splice(index, 1);
    emit('update:modelValue', items.value);
  };
</script>

<style scoped lang="less">
  .description-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .description-row {
      margin-bottom: 4px;
    }

    :deep(.arco-select-view),
    :deep(.arco-input-wrapper) {
      background-color: #f7f8fa;
      border: 1px solid transparent;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background-color: #f2f3f5;
        border-color: #e5e6eb;
      }

      &.arco-select-view-focus,
      &.arco-input-focus {
        background-color: #fff;
        border-color: #165dff;
        box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
      }
    }

    .delete-btn {
      color: #f53f3f;
      &:hover {
        background-color: #fff2f0;
      }
    }

    .add-btn {
      border-radius: 8px;
      background-color: #f2f3f5;
      color: #4e5969;
      height: 36px;
      &:hover {
        background-color: #e5e6eb;
      }
    }
  }
</style>
