<template>
  <div class="import-config-page">
    <!-- 页面头部 -->
    <page-header @add="handleAdd" />

    <!-- 筛选区域 -->
    <filter-section v-model="filterValue" :categories="categories" />

    <!-- 配置列表 -->
    <config-table
      :loading="loading"
      :configs="filteredConfigs"
      @edit="handleEdit"
      @delete="handleDelete"
      @toggleEnabled="handleToggleEnabled"
    />

    <!-- 编辑弹窗 -->
    <edit-drawer
      v-model="editDrawerVisible"
      :form="editForm"
      :all-categories="allCategories"
      @save="handleSave"
      @cancel="handleCloseModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import useImportConfig from '@/hooks/hr/import-config';
  import { type ImportConfigVO } from '@/api/hr/import-config';
  import PageHeader from './components/PageHeader.vue';
  import FilterSection from './components/FilterSection.vue';
  import ConfigTable from './components/ConfigTable.vue';
  import EditDrawer from './components/EditDrawer.vue';

  // 使用 Hook
  const {
    loading,
    configList,
    categories,
    fetchConfigList,
    fetchCategories,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleEnabled,
  } = useImportConfig({ autoLoad: false });

  // 数据
  const filterValue = ref<{ category?: string; keyword?: string }>({});

  // 编辑
  const editDrawerVisible = ref(false);
  const editForm = ref<ImportConfigVO>({
    configKey: '',
    configName: '',
    description: '',
    category: '',
    icon: '',
    apiUrl: '',
    templateUrl: '',
    templateName: '',
    presetMappings: {},
    requiredFields: [],
    fieldDescriptions: {},
  });

  // 所有分类（包括新建的）
  const allCategories = computed(() => {
    const cats = new Set([
      '基础数据',
      '档案数据',
      '考核数据',
      '奖励数据',
      '联系信息',
      '培训数据',
      '基础配置',
      ...categories.value,
    ]);
    return Array.from(cats);
  });

  // 过滤后的配置
  const filteredConfigs = computed(() => {
    return configList.value.filter((config) => {
      const matchCategory =
        !filterValue.value.category ||
        config.category === filterValue.value.category;
      const matchKeyword =
        !filterValue.value.keyword ||
        config.configName
          .toLowerCase()
          .includes(filterValue.value.keyword.toLowerCase()) ||
        config.configKey
          .toLowerCase()
          .includes(filterValue.value.keyword.toLowerCase());
      return matchCategory && matchKeyword;
    });
  });

  // 加载数据
  const loadConfigs = async (): Promise<void> => {
    await fetchConfigList();
  };

  const loadCategories = async (): Promise<void> => {
    await fetchCategories();
  };

  // 新增
  const handleAdd = () => {
    editForm.value = {
      configKey: '',
      configName: '',
      description: '',
      category: '',
      icon: '',
      apiUrl: '',
      templateUrl: '',
      templateName: '',
      presetMappings: {},
      requiredFields: [],
      fieldDescriptions: {},
    };
    editDrawerVisible.value = true;
  };

  // 编辑
  const handleEdit = (record: ImportConfigVO) => {
    editForm.value = { ...record };
    editDrawerVisible.value = true;
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    editDrawerVisible.value = false;
  };

  // 保存
  const handleSave = async (formData: ImportConfigVO): Promise<void> => {
    let success = false;
    if (formData.id) {
      success = await updateConfig(formData.id, formData);
    } else {
      success = await createConfig(formData);
    }

    if (success) {
      handleCloseModal();
      await loadConfigs();
    }
  };

  // 删除
  const handleDelete = async (id: number): Promise<void> => {
    const success = await deleteConfig(id);
    if (success) {
      await loadConfigs();
    }
  };

  // 切换启用状态
  const handleToggleEnabled = async (
    id: number,
    enabled: boolean
  ): Promise<void> => {
    const success = await toggleEnabled(id, enabled);
    if (success) {
      await loadConfigs();
    }
  };

  // 初始化
  loadConfigs();
  loadCategories();
</script>

<style scoped lang="less">
  .import-config-page {
    padding: 20px;
    background: #f4f7f9;
    min-height: 100%;
  }
</style>
