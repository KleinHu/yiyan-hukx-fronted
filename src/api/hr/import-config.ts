import request from '@/utils/request/request';

/**
 * 导入配置VO
 */
export interface ImportConfigVO {
  id?: number;
  configKey: string;
  configName: string;
  description?: string;
  category: string;
  icon?: string;
  apiUrl: string;
  templateUrl?: string;
  templateName?: string;
  presetMappings?: Record<string, string>;
  requiredFields?: string[];
  fieldDescriptions?: Record<string, string>;
  /**
   * 值映射配置
   * key: 数据库字段名（如 departmentId）
   * value: 字典类型标识（如 department）
   */
  valueMappings?: Record<string, string>;
  sortOrder?: number;
  isEnabled?: boolean;
}

/**
 * 导入配置管理API
 */
const importConfigApi = {
  /**
   * 获取所有启用的配置
   */
  getEnabledConfigs() {
    return request.get<ImportConfigVO[]>('/api/240/hr/import-config/enabled');
  },

  /**
   * 获取所有配置
   */
  getAllConfigs() {
    return request.get<ImportConfigVO[]>('/api/240/hr/import-config/list');
  },

  /**
   * 按分类获取配置
   */
  getByCategory(category: string) {
    return request.get<ImportConfigVO[]>(
      `/api/240/hr/import-config/category/${category}`
    );
  },

  /**
   * 获取所有分类
   */
  getCategories() {
    return request.get<string[]>('/api/240/hr/import-config/categories');
  },

  /**
   * 根据配置键获取配置
   */
  getByKey(configKey: string) {
    return request.get<ImportConfigVO>(
      `/api/240/hr/import-config/key/${configKey}`
    );
  },

  /**
   * 获取配置详情
   */
  getById(id: number) {
    return request.get<ImportConfigVO>(`/api/240/hr/import-config/${id}`);
  },

  /**
   * 创建配置
   */
  create(vo: ImportConfigVO) {
    return request.post<ImportConfigVO>('/api/240/hr/import-config', vo);
  },

  /**
   * 更新配置
   */
  update(id: number, vo: ImportConfigVO) {
    return request.put<ImportConfigVO>(`/api/240/hr/import-config/${id}`, vo);
  },

  /**
   * 删除配置
   */
  delete(id: number) {
    return request.delete<void>(`/api/240/hr/import-config/${id}`);
  },

  /**
   * 启用/禁用配置
   */
  toggleEnabled(id: number, enabled: boolean) {
    return request.patch<void>(`/api/240/hr/import-config/${id}/toggle`, null, {
      params: { enabled },
    });
  },

  /**
   * 批量更新排序
   */
  updateSort(ids: number[]) {
    return request.put<void>('/api/240/hr/import-config/sort', ids);
  },
};

export default importConfigApi;
