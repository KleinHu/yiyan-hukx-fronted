/**
 * Excel导入工具函数
 */
import * as XLSX from 'xlsx';
import type { ExcelData, FieldMapping, MappingTemplate } from './types';

/**
 * 解析Excel文件
 */
export function parseExcel(file: File): Promise<ExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON格式（二维数组）
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '', // 空单元格默认值
        }) as any[][];

        // 过滤掉完全为空的行
        const filteredData = jsonData.filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        );

        if (filteredData.length === 0) {
          reject(new Error('Excel文件为空'));
          return;
        }

        const headers = filteredData[0].map((h) => String(h).trim());
        const dataRows = filteredData.slice(1);

        resolve({
          headers,
          data: dataRows,
          fileName: file.name,
        });
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * 规范化日期字符串为 YYYY-MM-DD
 */
export function normalizeDateString(dateStr: string | number): string {
  if (typeof dateStr === 'number') {
    return excelDateToString(dateStr);
  }

  let str = String(dateStr).trim();
  if (!str) return str;

  // 1. 处理 20240115 格式
  if (/^\d{8}$/.test(str)) {
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(
      6,
      8
    )}`;
  }

  // 2. 处理 2024.01.15 或 2024/01/15 为 2024-01-15
  str = str.replace(/[./\\]/g, '-');

  // 3. 尝试解析并格式化 (支持 YYYY-M-D -> YYYY-MM-DD)
  const parts = str.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    // 检查是否是合法年份 (4位数字)
    if (
      y.length === 4 &&
      !Number.isNaN(Number(y)) &&
      !Number.isNaN(Number(m)) &&
      !Number.isNaN(Number(d))
    ) {
      const monthNum = Number(m);
      const dayNum = Number(d);
      // 简单的合法性检查
      if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
        return `${y}-${m}-${d}`;
      }
    }
  }

  return str; // 如果解析失败，返回原样
}

/**
 * Excel日期序列号转字符串
 */
export function excelDateToString(serial: number): string {
  // Excel 的日期是以 1899-12-30 为基准的天数
  // 修正 Excel 闰年 bug (1900-02-29 不存在但 Excel 认为存在)
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 判断是否可能是日期字段
 */
function isPossibleDateField(fieldName: string): boolean {
  const dateKeywords = [
    'date',
    'time',
    'day',
    'until',
    'start',
    'end',
    'birth',
    'hire',
    'transfer',
    'complete',
    'valid',
    'effective',
    'graduation',
    'reward',
    'certification',
  ];
  const lowerFieldName = fieldName.toLowerCase();
  return dateKeywords.some((keyword) => lowerFieldName.includes(keyword));
}

/**
 * 根据字段映射转换数据
 */
export function transformData(
  rawData: any[][],
  mappings: FieldMapping[]
): any[] {
  return rawData.map((row) => {
    const obj: Record<string, any> = {};

    // 只包含 enabled 为 true 的字段
    mappings
      .filter((mapping) => mapping.enabled && mapping.fieldName)
      .forEach((mapping) => {
        const value = row[mapping.index];

        // 基础清理：去除首尾空格
        let processedValue = typeof value === 'string' ? value.trim() : value;

        // 根据用户选择的数据类型进行解析
        if (mapping.dataType === 'date') {
          processedValue = normalizeDateString(processedValue);
        } else if (mapping.dataType === 'number') {
          processedValue =
            processedValue !== '' ? Number(processedValue) : undefined;
        } else if (mapping.dataType === 'boolean') {
          if (typeof processedValue === 'string') {
            const lower = processedValue.toLowerCase();
            processedValue =
              lower === 'true' || lower === '是' || lower === '1';
          } else {
            processedValue = Boolean(processedValue);
          }
        } else if (!mapping.dataType) {
          // 如果没有指定类型，尝试启发式处理（保留原有逻辑作为兜底）
          if (isPossibleDateField(mapping.fieldName)) {
            processedValue = normalizeDateString(processedValue);
          } else if (
            typeof processedValue === 'number' &&
            processedValue > 30000 &&
            processedValue < 60000
          ) {
            processedValue = excelDateToString(processedValue);
          }
        }

        obj[mapping.fieldName] = processedValue;
      });

    return obj;
  });
}

/**
 * 数据分片
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(
  data: any[],
  requiredFields: string[]
): { valid: boolean; errors: Array<{ row: number; field: string }> } {
  const errors: Array<{ row: number; field: string }> = [];

  data.forEach((item, index) => {
    requiredFields.forEach((field) => {
      const value = item[field];
      if (value === undefined || value === null || value === '') {
        errors.push({
          row: index + 2, // +2 因为有表头，且从1开始计数
          field,
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 保存映射模板到本地存储
 */
export function saveMappingTemplate(template: MappingTemplate): void {
  const key = 'excel_import_templates';
  const stored = localStorage.getItem(key);
  const templates: MappingTemplate[] = stored ? JSON.parse(stored) : [];

  // 检查是否已存在同名模板
  const existingIndex = templates.findIndex((t) => t.id === template.id);
  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  localStorage.setItem(key, JSON.stringify(templates));
}

/**
 * 获取所有映射模板
 */
export function getMappingTemplates(): MappingTemplate[] {
  const key = 'excel_import_templates';
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * 删除映射模板
 */
export function deleteMappingTemplate(templateId: string): void {
  const key = 'excel_import_templates';
  const stored = localStorage.getItem(key);
  if (!stored) return;

  const templates: MappingTemplate[] = JSON.parse(stored);
  const filtered = templates.filter((t) => t.id !== templateId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * 智能匹配字段
 * 根据预设映射和相似度匹配字段
 * @param excelHeaders Excel 表头列表
 * @param presetMappings 预设字段映射
 * @param requiredFields 必填字段列表（可选）
 */
export function smartMatchFields(
  excelHeaders: string[],
  presetMappings: Record<string, string>,
  requiredFields: string[] = []
): FieldMapping[] {
  return excelHeaders.map((header, index) => {
    // 尝试精确匹配
    let fieldName = presetMappings[header] || '';

    // 如果没有精确匹配，尝试去掉星号后精确匹配
    if (!fieldName) {
      const headerWithoutStar = header.replace(/\*/g, '').trim();
      fieldName = presetMappings[headerWithoutStar] || '';
    }

    // 如果还没有匹配，尝试使用includes进行模糊匹配（忽略空格、大小写、星号）
    if (!fieldName) {
      const normalizedHeader = header
        .replace(/\s+/g, '')
        .replace(/\*/g, '')
        .toLowerCase();
      const matchedKey = Object.keys(presetMappings).find((key) => {
        const normalizedKey = key.replace(/\s+/g, '').toLowerCase();
        // 使用includes进行包含匹配
        return (
          normalizedKey.includes(normalizedHeader) ||
          normalizedHeader.includes(normalizedKey)
        );
      });
      if (matchedKey) {
        fieldName = presetMappings[matchedKey];
      }
    }

    // 如果字段在必填字段列表中，则设置为必填且包含
    const isRequired = fieldName && requiredFields.includes(fieldName);

    return {
      excelColumn: header,
      fieldName,
      required: isRequired,
      enabled: isRequired, // 必填字段自动设置为包含
      index,
      dataType: fieldName && isPossibleDateField(fieldName) ? 'date' : 'string',
    };
  });
}

/**
 * 下载错误数据为Excel
 */
export function downloadErrorData(
  errorData: any[],
  fileName = '导入失败数据.xlsx'
): void {
  if (errorData.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(errorData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`;
}
