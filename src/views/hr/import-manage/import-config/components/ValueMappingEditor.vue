<template>
  <div class="value-mapping-editor">
    <div v-for="(item, index) in items" :key="index" class="mapping-row">
      <a-row :gutter="12" align="center">
        <a-col :span="10">
          <a-select
            :model-value="item.fieldName"
            placeholder="选择字段名"
            allow-search
            @update:model-value="updateItem(index, 'fieldName', $event)"
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
        <a-col :span="2" style="text-align: center">
          <icon-arrow-right style="color: #86909c" />
        </a-col>
        <a-col :span="10">
          <a-select
            :model-value="item.dictType"
            placeholder="选择字典类型"
            allow-search
            :loading="dictTypesLoading"
            @update:model-value="updateItem(index, 'dictType', $event)"
          >
            <a-option
              v-for="dictType in dictTypes"
              :key="dictType.type"
              :value="dictType.type"
            >
              {{ dictType.name }} ({{ dictType.type }})
            </a-option>
          </a-select>
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
      添加值映射
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { queryDictTypeRecordList } from '@/api/system/dictionary';
  import type { DictTypeRecord } from '@/api/system/model/dictTypeModel';

  interface ValueMappingItem {
    fieldName: string;
    dictType: string;
  }

  interface Props {
    modelValue: ValueMappingItem[];
    availableFields: string[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: ValueMappingItem[]): void;
  }>();

  const items = ref<ValueMappingItem[]>([...props.modelValue]);
  const dictTypes = ref<DictTypeRecord[]>([]);
  const dictTypesLoading = ref(false);

  // 加载字典类型列表
  const loadDictTypes = async () => {
    dictTypesLoading.value = true;
    try {
      const res = await queryDictTypeRecordList({
        page: 1,
        limit: 1000,
        status: '0', // 只加载启用的
      });
      dictTypes.value = res.data?.list || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载字典类型失败:', error);
    } finally {
      dictTypesLoading.value = false;
    }
  };

  watch(
    () => props.modelValue,
    (val) => {
      items.value = [...val];
    },
    { deep: true }
  );

  watch(
    () => props.availableFields,
    () => {
      // 当可用字段变化时，移除不存在的字段映射
      items.value = items.value.filter((item) =>
        props.availableFields.includes(item.fieldName)
      );
      emit('update:modelValue', items.value);
    }
  );

  const updateItem = (
    index: number,
    key: keyof ValueMappingItem,
    value: string
  ) => {
    items.value[index] = { ...items.value[index], [key]: value };
    emit('update:modelValue', items.value);
  };

  const addItem = () => {
    items.value.push({ fieldName: '', dictType: '' });
    emit('update:modelValue', items.value);
  };

  const removeItem = (index: number) => {
    items.value.splice(index, 1);
    emit('update:modelValue', items.value);
  };

  onMounted(() => {
    loadDictTypes();
  });
</script>

<style scoped lang="less">
  .value-mapping-editor {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .mapping-row {
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
