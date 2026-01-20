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
  import { ref, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import importConfigApi, { type ImportConfigVO } from '@/api/hr/import-config';
  import PageHeader from './components/PageHeader.vue';
  import FilterSection from './components/FilterSection.vue';
  import ConfigTable from './components/ConfigTable.vue';
  import EditDrawer from './components/EditDrawer.vue';

  // 数据
  const loading = ref(false);
  const configs = ref<ImportConfigVO[]>([]);
  const categories = ref<string[]>([]);
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
    return configs.value.filter((config) => {
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
  const loadConfigs = async () => {
    loading.value = true;
    try {
      const res = await importConfigApi.getAllConfigs();
      configs.value = res.data || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载配置失败:', error);
      Message.error('加载配置失败');
    } finally {
      loading.value = false;
    }
  };

  const loadCategories = async () => {
    try {
      const res = await importConfigApi.getCategories();
      categories.value = res.data || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载分类失败:', error);
    }
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
  const handleSave = async (formData: ImportConfigVO) => {
    try {
      if (formData.id) {
        await importConfigApi.update(formData.id, formData);
        Message.success('更新成功');
      } else {
        await importConfigApi.create(formData);
        Message.success('创建成功');
      }

      handleCloseModal();
      loadConfigs();
    } catch (error: any) {
      Message.error(error.message || '保存失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await importConfigApi.delete(id);
      Message.success('删除成功');
      loadConfigs();
    } catch (error) {
      Message.error('删除失败');
    }
  };

  // 切换启用状态
  const handleToggleEnabled = async (id: number, enabled: boolean) => {
    try {
      await importConfigApi.toggleEnabled(id, enabled);
      Message.success(enabled ? '已启用' : '已禁用');
      loadConfigs();
    } catch (error) {
      Message.error('操作失败');
    }
  };

  onMounted(() => {
    loadConfigs();
    loadCategories();
  });
</script>

<style scoped lang="less">
  .import-config-page {
    padding: 20px;
    background: #f4f7f9;
    min-height: 100%;
  }
</style>
