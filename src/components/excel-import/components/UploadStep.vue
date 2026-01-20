<template>
  <div class="upload-step">
    <!-- 模板下载区域 -->
    <div v-if="templateUrl" class="template-download-area">
      <div class="template-download-card">
        <div class="template-icon">
          <icon-file :size="28" />
        </div>
        <div class="template-info">
          <div class="template-title">下载导入模板</div>
          <div class="template-desc">
            请先下载模板，按照模板格式填写数据后再上传
          </div>
        </div>
        <a-button type="primary" @click="handleDownloadTemplate">
          <template #icon><icon-download /></template>
          下载模板
        </a-button>
      </div>
    </div>

    <a-upload
      :custom-request="handleUpload"
      :show-file-list="false"
      :accept="acceptTypes"
      :before-upload="beforeUpload"
      drag
    >
      <template #upload-button>
        <div class="upload-area">
          <div class="upload-icon">
            <icon-upload :size="64" />
          </div>
          <div class="upload-text">
            <div class="main-text">点击或拖拽文件到此区域上传</div>
            <div class="sub-text">
              支持 .xlsx、.xls 格式，文件大小不超过 {{ maxSize }}MB
            </div>
          </div>
        </div>
      </template>
    </a-upload>

    <!-- 已选择文件信息 -->
    <div v-if="uploadedFile" class="file-info">
      <a-card
        :bordered="true"
        class="file-detail-card"
        :body-style="{ padding: '16px 24px' }"
      >
        <div class="file-detail">
          <div class="file-icon-wrapper">
            <icon-file :size="24" />
          </div>
          <div class="file-content">
            <div class="file-name">{{ uploadedFile.name }}</div>
            <div class="file-meta">
              <a-tag size="small" color="arcoblue">
                {{ formatFileSize(uploadedFile.size) }}
              </a-tag>
              <a-divider direction="vertical" />
              <span><icon-apps /> 共 {{ excelData?.data.length || 0 }} 行</span>
              <a-divider direction="vertical" />
              <span
                ><icon-settings /> {{ excelData?.headers.length || 0 }} 列</span
              >
            </div>
          </div>
          <div class="file-actions">
            <a-button
              type="text"
              status="danger"
              size="small"
              @click="handleRemove"
            >
              <template #icon><icon-delete /></template>
              移除文件
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 解析中提示 -->
    <a-spin v-if="parsing" :loading="true" tip="正在解析Excel文件...">
      <div style="height: 100px"></div>
    </a-spin>

    <!-- 错误提示 -->
    <a-alert
      v-if="errorMessage"
      type="error"
      :closable="true"
      @close="errorMessage = ''"
    >
      {{ errorMessage }}
    </a-alert>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { parseExcel, formatFileSize } from '../utils/utils';
  import type { ExcelData } from '../utils/types';

  interface Props {
    maxSize?: number; // MB
    templateUrl?: string; // 模板下载地址
    templateName?: string; // 模板文件名
  }

  interface Emits {
    (e: 'success', data: ExcelData): void;
    (e: 'error', error: Error): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxSize: 10,
    templateUrl: '',
    templateName: '导入模板.xlsx',
  });

  const emit = defineEmits<Emits>();

  const acceptTypes = '.xlsx,.xls';
  const uploadedFile = ref<File | null>(null);
  const excelData = ref<ExcelData | null>(null);
  const parsing = ref(false);
  const errorMessage = ref('');

  // 上传前校验
  const beforeUpload = (file: File) => {
    // 检查文件大小
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > props.maxSize) {
      Message.error(`文件大小不能超过 ${props.maxSize}MB`);
      return false;
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      Message.error('只支持 .xlsx 或 .xls 格式的文件');
      return false;
    }

    return true;
  };

  // 处理上传
  const handleUpload = async (option: any) => {
    const { fileItem } = option;
    uploadedFile.value = fileItem.file as File;
    parsing.value = true;
    errorMessage.value = '';

    try {
      const data = await parseExcel(fileItem.file as File);

      // 验证数据
      if (data.headers.length === 0) {
        throw new Error('Excel文件中没有找到表头');
      }

      if (data.data.length === 0) {
        throw new Error('Excel文件中没有数据');
      }

      excelData.value = data;
      Message.success('文件解析成功');
      emit('success', data);
    } catch (error: any) {
      errorMessage.value = error.message || '解析文件失败';
      emit('error', error);
      uploadedFile.value = null;
      excelData.value = null;
    } finally {
      parsing.value = false;
    }
  };

  // 移除文件
  const handleRemove = () => {
    uploadedFile.value = null;
    excelData.value = null;
    errorMessage.value = '';
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    if (!props.templateUrl) return;

    // 创建隐藏的 a 标签进行下载
    const link = document.createElement('a');
    link.href = props.templateUrl;
    link.download = props.templateName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Message.success('模板下载已开始');
  };

  // 暴露方法给父组件
  defineExpose({
    reset: handleRemove,
  });
</script>

<style scoped lang="less">
  .upload-step {
    padding: 40px;
    width: 100%;
    box-sizing: border-box;

    .template-download-area {
      margin-bottom: 24px;

      .template-download-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #e8f7ff 0%, #f0f9ff 100%);
        border: 1px solid #b4e0ff;
        border-radius: 12px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
          transform: translateY(-1px);
        }

        .template-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 10px;
          color: #00b42a;
          font-size: 24px;
          box-shadow: 0 2px 8px rgba(0, 180, 42, 0.15);
        }

        .template-info {
          flex: 1;

          .template-title {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            margin-bottom: 4px;
          }

          .template-desc {
            font-size: 13px;
            color: #86909c;
          }
        }
      }
    }

    :deep(.arco-upload) {
      display: block;
      width: 100%;
    }

    :deep(.arco-upload-wrapper) {
      display: block;
      width: 100%;
    }

    :deep(.arco-upload-drag) {
      display: block;
      width: 100%;
    }

    .upload-area {
      width: 100%;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      cursor: pointer;
      background: var(--color-fill-1);
      border: 2px dashed var(--color-border-3);
      border-radius: 16px;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-sizing: border-box;

      &:hover {
        background: var(--color-primary-light-1);
        border-color: rgb(var(--primary-6));
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(var(--primary-6), 0.12);

        .upload-icon {
          color: rgb(var(--primary-6));
          transform: scale(1.1);
        }

        .main-text {
          color: rgb(var(--primary-6));
        }
      }

      .upload-icon {
        margin-bottom: 24px;
        color: var(--color-text-3);
        transition: all 0.3s;
      }

      .upload-text {
        .main-text {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-1);
          margin-bottom: 12px;
          transition: color 0.3s;
        }

        .sub-text {
          font-size: 14px;
          color: var(--color-text-3);
        }
      }
    }

    .file-info {
      margin-top: 32px;

      .file-detail-card {
        border-radius: 12px;
        background: linear-gradient(to right, var(--color-fill-1), #fff);
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }
      }

      .file-detail {
        display: flex;
        align-items: center;
        gap: 16px;

        .file-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8ffea;
          border-radius: 10px;
          color: #00b42a;
        }

        .file-content {
          flex: 1;
          min-width: 0;

          .file-name {
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-meta {
            font-size: 13px;
            color: var(--color-text-3);
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }
    }

    :deep(.arco-alert) {
      margin-top: 24px;
      border-radius: 8px;
    }

    :deep(.arco-spin) {
      margin-top: 40px;
    }
  }
</style>
