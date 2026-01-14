import request from '@/utils/request/request';

/**
 * 文件上传结果
 */
export interface FileUploadResult {
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  success?: boolean;
  error?: string;
}

/**
 * 文件管理API
 */
const fileApi = {
  /**
   * 单文件上传
   * @param file 文件
   * @param path 文件路径（可选）
   * @returns 文件上传结果
   */
  uploadFile(file: File, path?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }
    return request.post<FileUploadResult>('/api/hr/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 多文件上传
   * @param files 文件列表
   * @param path 文件路径（可选）
   * @returns 文件上传结果列表
   */
  uploadFiles(files: File[], path?: string) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (path) {
      formData.append('path', path);
    }
    return request.post<FileUploadResult[]>(
      '/api/hr/file/upload/batch',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * 删除文件
   * @param objectName 文件路径（对象名称）
   * @returns 删除结果
   */
  deleteFile(objectName: string) {
    return request.delete<boolean>('/api/hr/file/delete', {
      params: { objectName },
    });
  },

  /**
   * 检查文件是否存在
   * @param objectName 文件路径（对象名称）
   * @returns 是否存在
   */
  fileExists(objectName: string) {
    return request.get<boolean>('/api/hr/file/exists', {
      params: { objectName },
    });
  },

  /**
   * 获取文件访问URL
   * @param objectName 文件路径（对象名称）
   * @param expiry 有效期（秒，可选，默认7天）
   * @returns 文件访问URL
   */
  getFileUrl(objectName: string, expiry?: number) {
    const params: { objectName: string; expiry?: number } = { objectName };
    if (expiry) {
      params.expiry = expiry;
    }
    return request.get<string>('/api/hr/file/url', {
      params,
    });
  },
};

export default fileApi;
