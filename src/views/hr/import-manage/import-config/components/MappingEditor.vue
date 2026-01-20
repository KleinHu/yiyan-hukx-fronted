<template>
  <div class="mapping-editor">
    <div v-for="(item, index) in items" :key="index" class="mapping-row">
      <a-row :gutter="12" align="center">
        <a-col :span="10">
          <a-input
            :model-value="item.excelColumn"
            placeholder="Excel列名"
            @update:model-value="updateItem(index, 'excelColumn', $event)"
          />
        </a-col>
        <a-col :span="2" style="text-align: center">
          <icon-arrow-right style="color: #86909c" />
        </a-col>
        <a-col :span="10">
          <a-input
            :model-value="item.fieldName"
            placeholder="字段名"
            @update:model-value="updateItem(index, 'fieldName', $event)"
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
      添加映射
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface MappingItem {
    excelColumn: string;
    fieldName: string;
  }

  interface Props {
    modelValue: MappingItem[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: MappingItem[]): void;
  }>();

  const items = ref<MappingItem[]>([...props.modelValue]);

  watch(
    () => props.modelValue,
    (val) => {
      items.value = [...val];
    },
    { deep: true }
  );

  const updateItem = (index: number, key: keyof MappingItem, value: string) => {
    items.value[index] = { ...items.value[index], [key]: value };
    emit('update:modelValue', items.value);
  };

  const addItem = () => {
    items.value.push({ excelColumn: '', fieldName: '' });
    emit('update:modelValue', items.value);
  };

  const removeItem = (index: number) => {
    items.value.splice(index, 1);
    emit('update:modelValue', items.value);
  };
</script>

<style scoped lang="less">
  .mapping-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .mapping-row {
      margin-bottom: 4px;
    }

    :deep(.arco-input-wrapper) {
      background-color: #f7f8fa;
      border: 1px solid transparent;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background-color: #f2f3f5;
        border-color: #e5e6eb;
      }

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
