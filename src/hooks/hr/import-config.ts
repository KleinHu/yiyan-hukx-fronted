import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import importConfigApi, { type ImportConfigVO } from '@/api/hr/import-config';

/**
 * 导入配置管理 Hook
 * @param options 配置选项
 * @returns 导入配置相关数据和方法
 */
function useImportConfig(options?: {
  autoLoad?: boolean; // 是否自动加载
  loadEnabledOnly?: boolean; // 是否只加载启用的配置
}) {
  const { autoLoad = true, loadEnabledOnly = false } = options || {};

  const loading = ref(false);
  const configList = ref<ImportConfigVO[]>([]);
  const categories = ref<string[]>([]);
  const currentConfig = ref<ImportConfigVO | null>(null);

  /**
   * 获取配置列表
   */
  const fetchConfigList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = loadEnabledOnly
        ? await importConfigApi.getEnabledConfigs()
        : await importConfigApi.getAllConfigs();
      configList.value = data || [];
    } catch (error) {
      console.error('获取导入配置列表失败:', error);
      Message.error('获取导入配置列表失败');
      configList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取所有分类
   */
  const fetchCategories = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await importConfigApi.getCategories();
      categories.value = data || [];
    } catch (error) {
      console.error('获取分类列表失败:', error);
      Message.error('获取分类列表失败');
      categories.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 按分类获取配置
   * @param category 分类
   */
  const fetchByCategory = async (category: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await importConfigApi.getByCategory(category);
      configList.value = data || [];
    } catch (error) {
      console.error('获取分类配置失败:', error);
      Message.error('获取分类配置失败');
      configList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据配置键获取配置
   * @param configKey 配置键
   */
  const fetchByKey = async (configKey: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await importConfigApi.getByKey(configKey);
      currentConfig.value = data || null;
    } catch (error) {
      console.error('获取配置详情失败:', error);
      Message.error('获取配置详情失败');
      currentConfig.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取配置详情
   * @param id 配置ID
   */
  const fetchById = async (id: number): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await importConfigApi.getById(id);
      currentConfig.value = data || null;
    } catch (error) {
      console.error('获取配置详情失败:', error);
      Message.error('获取配置详情失败');
      currentConfig.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 创建配置
   * @param vo 配置信息
   * @returns 是否成功
   */
  const createConfig = async (vo: ImportConfigVO): Promise<boolean> => {
    try {
      loading.value = true;
      await importConfigApi.create(vo);
      Message.success('创建配置成功');
      await fetchConfigList();
      return true;
    } catch (error) {
      console.error('创建配置失败:', error);
      Message.error('创建配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新配置
   * @param id 配置ID
   * @param vo 配置信息
   * @returns 是否成功
   */
  const updateConfig = async (
    id: number,
    vo: ImportConfigVO
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await importConfigApi.update(id, vo);
      Message.success('更新配置成功');
      await fetchConfigList();
      if (currentConfig.value?.id === id) {
        await fetchById(id);
      }
      return true;
    } catch (error) {
      console.error('更新配置失败:', error);
      Message.error('更新配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除配置
   * @param id 配置ID
   * @returns 是否成功
   */
  const deleteConfig = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await importConfigApi.delete(id);
      Message.success('删除配置成功');
      await fetchConfigList();
      if (currentConfig.value?.id === id) {
        currentConfig.value = null;
      }
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      Message.error('删除配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 启用/禁用配置
   * @param id 配置ID
   * @param enabled 是否启用
   * @returns 是否成功
   */
  const toggleEnabled = async (
    id: number,
    enabled: boolean
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await importConfigApi.toggleEnabled(id, enabled);
      Message.success(enabled ? '启用配置成功' : '禁用配置成功');
      await fetchConfigList();
      if (currentConfig.value?.id === id) {
        currentConfig.value.isEnabled = enabled;
      }
      return true;
    } catch (error) {
      console.error('切换配置状态失败:', error);
      Message.error('切换配置状态失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量更新排序
   * @param ids 配置ID列表
   * @returns 是否成功
   */
  const updateSort = async (ids: number[]): Promise<boolean> => {
    try {
      loading.value = true;
      await importConfigApi.updateSort(ids);
      Message.success('更新排序成功');
      await fetchConfigList();
      return true;
    } catch (error) {
      console.error('更新排序失败:', error);
      Message.error('更新排序失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新配置列表
   */
  const refresh = (): void => {
    fetchConfigList();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchConfigList();
      fetchCategories();
    });
  }

  return {
    loading,
    configList,
    categories,
    currentConfig,
    fetchConfigList,
    fetchCategories,
    fetchByCategory,
    fetchByKey,
    fetchById,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleEnabled,
    updateSort,
    refresh,
  };
}

export default useImportConfig;
