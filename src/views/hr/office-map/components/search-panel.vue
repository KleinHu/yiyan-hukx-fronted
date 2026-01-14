<template>
  <div class="search-panel">
    <a-input
      v-model="searchText"
      placeholder="搜索员工姓名..."
      allow-clear
      @press-enter="handleSearch"
      @clear="handleClear"
    >
      <template #prefix>
        <icon-search />
      </template>
      <template #suffix>
        <a-button type="text" size="small" @click="handleSearch">
          <template #icon>
            <icon-search />
          </template>
        </a-button>
      </template>
    </a-input>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { IconSearch } from '@arco-design/web-vue/es/icon';

  const emit = defineEmits<{
    (e: 'search', keyword: string): void;
    (e: 'clear'): void;
  }>();

  const searchText = ref('');

  const handleSearch = () => {
    if (searchText.value.trim()) {
      emit('search', searchText.value.trim());
    }
  };

  const handleClear = () => {
    emit('clear');
  };

  defineExpose({
    searchText,
    handleSearch,
    handleClear,
  });
</script>

<style scoped lang="less">
  .search-panel {
    :deep(.arco-input-wrapper) {
      border-radius: 8px;
    }
  }
</style>
