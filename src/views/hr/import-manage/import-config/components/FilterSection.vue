<template>
  <div class="filter-section">
    <a-space>
      <a-select
        v-model="category"
        placeholder="选择分类"
        allow-clear
        style="width: 160px"
        @change="handleChange"
      >
        <a-option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </a-option>
      </a-select>
      <a-input-search
        v-model="keyword"
        placeholder="搜索配置名称/键"
        style="width: 240px"
        @search="handleSearch"
        @press-enter="handleSearch"
      />
    </a-space>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface Props {
    categories: string[];
    modelValue?: {
      category?: string;
      keyword?: string;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
  });

  const emit = defineEmits<{
    (
      e: 'update:modelValue',
      value: { category?: string; keyword?: string }
    ): void;
  }>();

  const category = ref(props.modelValue?.category || '');
  const keyword = ref(props.modelValue?.keyword || '');

  const handleChange = () => {
    emit('update:modelValue', {
      category: category.value,
      keyword: keyword.value,
    });
  };

  const handleSearch = () => {
    emit('update:modelValue', {
      category: category.value,
      keyword: keyword.value,
    });
  };

  watch(
    () => props.modelValue,
    (val) => {
      category.value = val?.category || '';
      keyword.value = val?.keyword || '';
    },
    { deep: true }
  );
</script>

<style scoped lang="less">
  .filter-section {
    margin-bottom: 16px;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
</style>
