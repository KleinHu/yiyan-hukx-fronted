import { queryDictDataRecordList } from '@/api/system/dictionary';
import type { DictDataRecord } from '@/api/system/model/dictDataModel';

/**
 * 字典值转换工具
 * 用于在导入、导出、展示等场景中进行 label <-> value 的转换
 */
const dictTransform = {
  /**
   * 批量加载多个字典类型的数据
   * @param dictTypes 字典类型标识数组
   * @returns 字典数据缓存 Map<dictType, DictDataRecord[]>
   */
  async loadDicts(dictTypes: string[]): Promise<Map<string, DictDataRecord[]>> {
    const dictCache = new Map<string, DictDataRecord[]>();

    // 去重
    const uniqueDictTypes = Array.from(new Set(dictTypes));

    // 并行加载所有字典数据
    const loadPromises = uniqueDictTypes.map(async (dictType) => {
      try {
        const res = await queryDictDataRecordList({
          dictType,
          status: '0', // 只加载启用的
        });
        const dictData = res.data || [];
        dictCache.set(dictType, dictData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`加载字典 ${dictType} 失败:`, error);
        dictCache.set(dictType, []);
      }
    });

    await Promise.all(loadPromises);
    return dictCache;
  },

  /**
   * label -> value（导入时使用）
   * @param dictData 字典数据列表
   * @param label 字典标签（如："财务室"）
   * @returns 字典值（如："CW_1"），如果找不到则返回 undefined
   */
  labelToValue(dictData: DictDataRecord[], label: string): string | undefined {
    if (!label || !dictData || dictData.length === 0) {
      return undefined;
    }

    // 精确匹配
    const exactMatch = dictData.find(
      (item) => item.label?.trim() === label.trim()
    );
    if (exactMatch) {
      return exactMatch.value;
    }

    // 忽略大小写匹配
    const caseInsensitiveMatch = dictData.find(
      (item) => item.label?.toLowerCase().trim() === label.toLowerCase().trim()
    );
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch.value;
    }

    return undefined;
  },

  /**
   * value -> label（展示时使用）
   * @param dictData 字典数据列表
   * @param value 字典值（如："CW_1"）
   * @returns 字典标签（如："财务室"），如果找不到则返回原值
   */
  valueToLabel(dictData: DictDataRecord[], value: string): string | undefined {
    if (!value || !dictData || dictData.length === 0) {
      return value;
    }

    const match = dictData.find((item) => item.value === value);
    return match?.label || value;
  },

  /**
   * 批量转换导入数据（label -> value）
   * @param data 原始数据数组
   * @param valueMappings 值映射配置 { fieldName: dictType }
   * @param dictCache 字典数据缓存
   * @returns 转换后的数据数组
   */
  transformImportData(
    data: Record<string, any>[],
    valueMappings: Record<string, string>,
    dictCache: Map<string, DictDataRecord[]>
  ): Record<string, any>[] {
    if (!data || data.length === 0 || !valueMappings) {
      return data;
    }

    return data.map((row) => {
      const transformedRow = { ...row };

      // 遍历每个需要转换的字段
      Object.entries(valueMappings).forEach(([fieldName, dictType]) => {
        const originalValue = transformedRow[fieldName];

        // 如果字段值为空，跳过
        if (
          originalValue === null ||
          originalValue === undefined ||
          originalValue === ''
        ) {
          return;
        }

        // 获取对应的字典数据
        const dictData = dictCache.get(dictType);
        if (!dictData || dictData.length === 0) {
          // 如果没有字典数据，保持原值
          return;
        }

        // 转换 label -> value
        const convertedValue = this.labelToValue(
          dictData,
          String(originalValue)
        );

        if (convertedValue !== undefined) {
          transformedRow[fieldName] = convertedValue;
        }
        // 如果转换失败，保持原值（可以在后续验证中处理）
      });

      return transformedRow;
    });
  },

  /**
   * 批量转换展示数据（value -> label）
   * @param data 原始数据数组
   * @param valueMappings 值映射配置 { fieldName: dictType }
   * @param dictCache 字典数据缓存
   * @returns 转换后的数据数组
   */
  transformDisplayData(
    data: Record<string, any>[],
    valueMappings: Record<string, string>,
    dictCache: Map<string, DictDataRecord[]>
  ): Record<string, any>[] {
    if (!data || data.length === 0 || !valueMappings) {
      return data;
    }

    return data.map((row) => {
      const transformedRow = { ...row };

      // 遍历每个需要转换的字段
      Object.entries(valueMappings).forEach(([fieldName, dictType]) => {
        const originalValue = transformedRow[fieldName];

        // 如果字段值为空，跳过
        if (
          originalValue === null ||
          originalValue === undefined ||
          originalValue === ''
        ) {
          return;
        }

        // 获取对应的字典数据
        const dictData = dictCache.get(dictType);
        if (!dictData || dictData.length === 0) {
          // 如果没有字典数据，保持原值
          return;
        }

        // 转换 value -> label
        const convertedLabel = this.valueToLabel(
          dictData,
          String(originalValue)
        );

        if (convertedLabel !== undefined) {
          transformedRow[fieldName] = convertedLabel;
        }
      });

      return transformedRow;
    });
  },
};

export default dictTransform;
