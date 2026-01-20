/**
 * Excel导入组件类型定义
 */

// 字段数据类型
export type FieldDataType = 'string' | 'number' | 'date' | 'boolean';

// 字段映射配置
export interface FieldMapping {
  excelColumn: string; // Excel中的列标题（中文）
  fieldName: string; // 对应的英文字段名
  required: boolean; // 是否必填
  enabled: boolean; // 是否包含在最终数据中（默认false）
  index: number; // 列索引
  dataType?: FieldDataType; // 数据类型
}

// 导入配置
export interface ImportConfig {
  apiUrl: string; // 上传接口地址
  batchSize: number; // 每批次上传条数（默认100）
  fieldMappings: FieldMapping[]; // 字段映射关系
  presetMappings?: Record<string, string>; // 预设映射（常用字段）
}

// 上传进度状态
export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'success'
  | 'error'
  | 'cancelled';

// 上传进度
export interface UploadProgress {
  total: number; // 总条数
  uploaded: number; // 已上传条数
  failed: number; // 失败条数
  percentage: number; // 上传百分比
  status: UploadStatus;
  currentBatch?: number; // 当前批次
  totalBatch?: number; // 总批次数
}

// Excel解析结果
export interface ExcelData {
  headers: string[]; // 表头
  data: any[][]; // 数据行（二维数组）
  fileName: string; // 文件名
}

// 映射模板
export interface MappingTemplate {
  id: string;
  name: string;
  mappings: Record<string, string>; // Excel列名 -> 字段名
  createdAt: string;
}

// 错误记录
export interface ErrorRecord {
  row: number; // 行号
  data: any; // 原始数据
  error: string; // 错误信息
}

// 组件属性
export interface ExcelImportProps {
  apiUrl: string; // 上传接口地址
  batchSize?: number; // 批次大小，默认100
  presetMappings?: Record<string, string>; // 预设字段映射
  requiredFields?: string[]; // 必填字段（英文字段名）
  maxSize?: number; // 最大文件大小（MB），默认10
  enableTemplate?: boolean; // 是否启用模板功能，默认true
  customTransform?: (data: any[]) => any[]; // 自定义数据转换函数
}

// 组件事件
export interface ExcelImportEmits {
  success: (result: {
    total: number;
    uploaded: number;
    failed: number;
  }) => void;
  error: (error: Error) => void;
  cancel: () => void;
}
