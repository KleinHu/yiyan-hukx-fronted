<template>
  <div class="excel-import">
    <!-- 步骤条 -->
    <div class="steps-wrapper">
      <a-steps :current="currentStep" :status="stepStatus">
        <a-step title="上传文件">
          <template #icon>
            <icon-upload />
          </template>
        </a-step>
        <a-step title="配置字段映射">
          <template #icon>
            <icon-settings />
          </template>
        </a-step>
        <a-step title="数据预览">
          <template #icon>
            <icon-eye />
          </template>
        </a-step>
        <a-step title="导入数据">
          <template #icon>
            <icon-check-circle />
          </template>
        </a-step>
      </a-steps>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <!-- 步骤1: 上传文件 -->
      <div v-show="currentStep === 1" class="step-panel">
        <upload-step
          ref="uploadStepRef"
          :max-size="maxSize"
          :template-url="templateUrl"
          :template-name="templateName"
          @success="handleUploadSuccess"
          @error="handleUploadError"
        />
      </div>

      <!-- 步骤2: 配置字段映射 -->
      <div v-show="currentStep === 2" class="step-panel">
        <field-mapping
          v-if="excelData"
          ref="fieldMappingRef"
          :excel-data="excelData"
          :preset-mappings="presetMappings"
          :required-fields="requiredFields"
          :enable-template="enableTemplate"
          @change="handleMappingChange"
          @update:valid="mappingValid = $event"
        />
      </div>

      <!-- 步骤3: 数据预览 -->
      <div v-show="currentStep === 3" class="step-panel">
        <div class="step-panel-inner">
          <data-preview
            v-if="excelData && fieldMappings.length > 0"
            ref="dataPreviewRef"
            :excel-data="excelData"
            :mappings="fieldMappings"
            :required-fields="requiredFields"
            @validate="handleValidate"
          />

          <!-- 接口配置区域 -->
          <div class="api-config-area">
            <div class="config-row">
              <div class="config-item">
                <div class="api-config-header">
                  <icon-link />
                  <span>上传接口配置</span>
                </div>
                <div class="api-config-content">
                  <a-row :gutter="16" align="center">
                    <a-col :span="8">
                      <a-radio-group
                        v-model="isCustomApi"
                        type="button"
                        size="medium"
                        fill
                      >
                        <a-radio
                          :value="false"
                          :disabled="!props.apiOptions.length"
                        >
                          预设接口
                        </a-radio>
                        <a-radio :value="true">自定义地址</a-radio>
                      </a-radio-group>
                    </a-col>
                    <a-col :span="16">
                      <a-select
                        v-if="!isCustomApi"
                        v-model="currentApiUrl"
                        placeholder="请选择上传接口"
                        allow-clear
                      >
                        <a-option
                          v-for="item in props.apiOptions"
                          :key="item.value"
                          :value="item.value"
                        >
                          {{ item.label }}
                        </a-option>
                      </a-select>
                      <a-input
                        v-else
                        v-model="currentApiUrl"
                        placeholder="请输入上传接口地址 (例如: /api/import/data)"
                        allow-clear
                      >
                        <template #prefix>
                          <icon-edit />
                        </template>
                      </a-input>
                    </a-col>
                  </a-row>
                </div>
              </div>

              <a-divider direction="vertical" style="height: 80px" />

              <div class="config-item strategy-config">
                <div class="api-config-header">
                  <icon-interaction />
                  <span>数据冲突处理策略</span>
                </div>
                <div class="api-config-content">
                  <a-radio-group
                    v-model="importStrategy"
                    type="button"
                    size="medium"
                  >
                    <a-tooltip content="如果数据已存在，则覆盖旧数据">
                      <a-radio :value="ImportStrategy.OVERWRITE">
                        覆盖更新
                      </a-radio>
                    </a-tooltip>
                    <a-tooltip content="如果数据已存在，则跳过不导入">
                      <a-radio :value="ImportStrategy.SKIP"> 跳过重复 </a-radio>
                    </a-tooltip>
                    <a-tooltip content="如果数据已存在，则标记为错误数据">
                      <a-radio :value="ImportStrategy.ERROR">
                        报错提醒
                      </a-radio>
                    </a-tooltip>
                    <a-tooltip
                      content="删除该员工的所有相关记录后，全部插入新数据"
                    >
                      <a-radio :value="ImportStrategy.FULL_UPDATE">
                        全量更新
                      </a-radio>
                    </a-tooltip>
                  </a-radio-group>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤4: 上传进度 -->
      <div v-show="currentStep === 4" class="step-panel">
        <upload-progress
          :progress="uploadProgress"
          :error-records="errorRecords"
          @cancel="handleCancelUpload"
          @retry="handleRetryUpload"
          @complete="handleComplete"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div v-if="currentStep < 4" class="footer-actions">
      <a-space :size="24" fill>
        <a-button
          v-if="currentStep > 1"
          type="outline"
          class="btn-prev"
          @click="handlePrevStep"
        >
          <template #icon><icon-left /></template>
          上一步
        </a-button>
        <a-button class="btn-prev" @click="handleCancel">取消</a-button>
        <a-button
          v-if="currentStep < 3"
          type="primary"
          :disabled="!canNextStep"
          class="btn-next"
          @click="handleNextStep"
        >
          下一步
          <template #icon><icon-right /></template>
        </a-button>
        <a-button
          v-if="currentStep === 3"
          type="primary"
          :disabled="!canStartImport"
          :loading="importing"
          class="btn-next"
          @click="handleStartImport"
        >
          <template #icon><icon-check-circle /></template>
          开始导入（共 {{ validDataCount }} 条）
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import request from '@/utils/request/request';
  import { ImportStrategy } from '@/api/hr/batch-import';
  import dictTransform from '@/utils/dict-transform';
  import UploadStep from './components/UploadStep.vue';
  import FieldMapping from './components/FieldMapping.vue';
  import DataPreview from './components/DataPreview.vue';
  // UploadProgress 在模板中使用（upload-progress），ESLint 无法识别
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import UploadProgress from './components/UploadProgress.vue';
  import { chunkArray } from './utils/utils';
  import type {
    ExcelData,
    FieldMapping as FieldMappingType,
    UploadProgress as UploadProgressType,
    ErrorRecord,
  } from './utils/types';

  interface Props {
    apiUrl?: string; // 默认上传接口地址
    apiOptions?: Array<{ label: string; value: string }>; // 预设接口选项
    batchSize?: number; // 批次大小
    presetMappings?: Record<string, string>; // 预设字段映射
    requiredFields?: string[]; // 必填字段
    maxSize?: number; // 最大文件大小（MB）
    enableTemplate?: boolean; // 是否启用模板功能
    customTransform?: (data: any[]) => any[]; // 自定义数据转换函数
    templateUrl?: string; // 模板文件下载地址（不传则不显示下载按钮）
    templateName?: string; // 模板文件名称
    valueMappings?: Record<string, string>; // 值映射配置 { fieldName: dictType }
  }

  interface Emits {
    (
      e: 'success',
      result: { total: number; uploaded: number; failed: number }
    ): void;
    (e: 'error', error: Error): void;
    (e: 'cancel'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    apiUrl: '',
    apiOptions: () => [],
    batchSize: 100,
    presetMappings: () => ({}),
    requiredFields: () => [],
    maxSize: 10,
    enableTemplate: true,
    customTransform: undefined,
    templateUrl: '',
    templateName: '导入模板.xlsx',
    valueMappings: () => ({}),
  });

  const emit = defineEmits<Emits>();

  // 步骤相关
  const currentStep = ref(1);
  const stepStatus = ref<'wait' | 'process' | 'finish' | 'error'>('process');

  // 数据相关
  const excelData = ref<ExcelData | null>(null);
  const fieldMappings = ref<FieldMappingType[]>([]);
  const mappingValid = ref(false);
  const validData = ref<any[]>([]);
  const validDataCount = ref(0);

  // API 相关
  const currentApiUrl = ref(props.apiUrl);
  const isCustomApi = ref(!props.apiOptions.length);
  const importStrategy = ref<ImportStrategy>(ImportStrategy.OVERWRITE);

  // 上传相关
  const importing = ref(false);
  const uploadProgress = ref<UploadProgressType>({
    total: 0,
    uploaded: 0,
    failed: 0,
    percentage: 0,
    status: 'pending',
    currentBatch: 0,
    totalBatch: 0,
  });
  const errorRecords = ref<ErrorRecord[]>([]);
  const abortController = ref<AbortController | null>(null);

  // 引用
  const uploadStepRef = ref<InstanceType<typeof UploadStep>>();
  const fieldMappingRef = ref<InstanceType<typeof FieldMapping>>();
  const dataPreviewRef = ref<InstanceType<typeof DataPreview>>();

  // 计算属性
  const canNextStep = computed(() => {
    if (currentStep.value === 1) {
      return excelData.value !== null;
    }
    if (currentStep.value === 2) {
      return mappingValid.value;
    }
    return false;
  });

  const canStartImport = computed(() => {
    return (
      validDataCount.value > 0 && !importing.value && currentApiUrl.value.trim()
    );
  });

  // 处理上传成功
  const handleUploadSuccess = (data: ExcelData) => {
    excelData.value = data;
  };

  // 处理上传错误
  const handleUploadError = (error: Error) => {
    Message.error(error.message || '文件解析失败');
    emit('error', error);
  };

  // 处理字段映射变化
  const handleMappingChange = (mappings: FieldMappingType[]) => {
    fieldMappings.value = mappings;
  };

  // 处理数据验证
  const handleValidate = (result: { valid: boolean; data: any[] }) => {
    validData.value = result.data;
    validDataCount.value = result.data.length;
  };

  // 上一步 - 仅用户点击"上一步"按钮时调用
  const handlePrevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value -= 1;
    }
  };

  // 下一步 - 仅用户点击"下一步"按钮时调用
  const handleNextStep = () => {
    if (currentStep.value < 3) {
      currentStep.value += 1;
    }
  };

  // 取消
  const handleCancel = () => {
    emit('cancel');
  };

  // 开始导入
  const handleStartImport = async () => {
    if (validDataCount.value === 0) {
      Message.warning('没有可导入的数据');
      return;
    }

    if (!currentApiUrl.value.trim()) {
      Message.warning('请输入或选择上传接口地址');
      return;
    }

    try {
      importing.value = true;
      // 用户点击"开始导入"按钮，跳转到进度页面（第4步）
      currentStep.value = 4;

      // 应用值映射转换（label -> value）
      let dataToUpload = validData.value;
      if (props.valueMappings && Object.keys(props.valueMappings).length > 0) {
        try {
          // 加载所需的字典数据
          const dictTypes = Object.values(props.valueMappings);
          const dictCache = await dictTransform.loadDicts(dictTypes);

          // 转换数据
          dataToUpload = dictTransform.transformImportData(
            dataToUpload,
            props.valueMappings,
            dictCache
          );
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('值映射转换失败:', error);
          Message.warning('值映射转换失败，将使用原始数据');
        }
      }

      // 应用自定义转换
      if (props.customTransform) {
        dataToUpload = props.customTransform(dataToUpload);
      }

      // 重置进度
      uploadProgress.value = {
        total: dataToUpload.length,
        uploaded: 0,
        failed: 0,
        skipped: 0,
        percentage: 0,
        status: 'uploading',
        currentBatch: 0,
        totalBatch: 0,
      };
      errorRecords.value = [];

      // 分片上传
      const chunks = chunkArray(dataToUpload, props.batchSize);
      uploadProgress.value.totalBatch = chunks.length;

      // 创建取消控制器
      abortController.value = new AbortController();

      // 需要顺序上传，所以使用循环中的 await
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < chunks.length; i += 1) {
        uploadProgress.value.currentBatch = i + 1;

        try {
          // eslint-disable-next-line no-await-in-loop
          const response: any = await request.post(
            currentApiUrl.value,
            {
              data: chunks[i],
              strategy: importStrategy.value,
            },
            {
              signal: abortController.value.signal,
            }
          );

          // 兼容处理：在开发环境下拦截器可能已经返回了 data (ApiResponse)
          const responseData = response;
          // 逻辑判定：result 应该是 BatchImportResult
          let result = responseData.data;
          // 如果 responseData 直接包含 successCount，说明拦截器已经拆包了
          if (
            responseData &&
            typeof responseData === 'object' &&
            'successCount' in responseData
          ) {
            result = responseData;
          }

          if (
            result &&
            typeof result === 'object' &&
            'successCount' in result
          ) {
            // 更新成功和失败数量 (使用后端返回的精确值)
            uploadProgress.value.uploaded += result.successCount || 0;
            uploadProgress.value.failed += result.failedCount || 0;

            // 更新跳过数量（如果后端返回了 skipCount）
            if ('skipCount' in result && typeof result.skipCount === 'number') {
              uploadProgress.value.skipped =
                (uploadProgress.value.skipped || 0) + result.skipCount;
            }

            // 记录后端返回的具体错误详情
            if (result.errors && Array.isArray(result.errors)) {
              let skipCountFromErrors = 0;
              result.errors.forEach((err: any) => {
                const errorMessage = err.message || '后端处理失败';
                // 如果错误信息包含"跳过"相关文字，统计到跳过数量
                if (
                  errorMessage.includes('跳过') ||
                  errorMessage.includes('策略跳过')
                ) {
                  skipCountFromErrors += 1;
                } else {
                  errorRecords.value.push({
                    row: err.row,
                    data: err.data,
                    error: errorMessage,
                  });
                }
              });
              // 如果从错误信息中统计到了跳过数量，且后端没有返回 skipCount，则使用统计值
              if (skipCountFromErrors > 0 && !('skipCount' in result)) {
                uploadProgress.value.skipped =
                  (uploadProgress.value.skipped || 0) + skipCountFromErrors;
                // 从失败数量中减去跳过的数量（因为跳过的数据不应该计入失败）
                uploadProgress.value.failed = Math.max(
                  0,
                  uploadProgress.value.failed - skipCountFromErrors
                );
              }
            }
          } else if (responseData.code === 200 || response.status === 200) {
            // 如果后端没按规范返回 result 对象，但请求成功了，兜底处理
            uploadProgress.value.uploaded += chunks[i].length;
          } else {
            // 请求返回了错误码
            uploadProgress.value.failed += chunks[i].length;
            chunks[i].forEach((item, index) => {
              errorRecords.value.push({
                row:
                  uploadProgress.value.uploaded +
                  uploadProgress.value.failed +
                  index,
                data: item,
                error: responseData.msg || '后端处理异常',
              });
            });
          }

          // 更新进度条百分比 (基于已尝试处理的总数)
          uploadProgress.value.percentage =
            (uploadProgress.value.uploaded + uploadProgress.value.failed) /
            uploadProgress.value.total;
        } catch (error: any) {
          if (error.name === 'AbortError' || error.name === 'CanceledError') {
            uploadProgress.value.status = 'cancelled';
            return;
          }

          // 整个批次请求失败的兜底处理 (如网络错误、404等)
          chunks[i].forEach((item, index) => {
            errorRecords.value.push({
              row:
                uploadProgress.value.uploaded +
                uploadProgress.value.failed +
                index +
                2,
              data: item,
              error: error.message || '网络或服务器错误',
            });
          });

          uploadProgress.value.failed += chunks[i].length;
          uploadProgress.value.percentage =
            (uploadProgress.value.uploaded + uploadProgress.value.failed) /
            uploadProgress.value.total;
        }
      }

      // 完成后的统一状态更新
      const successCount = uploadProgress.value.uploaded;
      const failedCount = uploadProgress.value.failed;

      if (failedCount === 0 && successCount > 0) {
        uploadProgress.value.status = 'success';
      } else {
        uploadProgress.value.status = 'error';
      }

      // 导入完成后，保持在结果页面（第4步），这是用户点击"开始导入"后的正常流程
      // 不自动跳转，由用户手动点击"完成导入"关闭
      currentStep.value = 4;

      emit('success', {
        total: uploadProgress.value.total,
        uploaded: successCount,
        failed: failedCount,
      });
    } catch (error: any) {
      uploadProgress.value.status = 'error';
      Message.error(error.message || '导入过程中发生错误');
      emit('error', error);
    } finally {
      importing.value = false;
    }
  };

  // 取消上传
  const handleCancelUpload = () => {
    if (abortController.value) {
      abortController.value.abort();
    }
  };

  // 重试上传
  const handleRetryUpload = async () => {
    if (errorRecords.value.length === 0) return;

    const retryData = errorRecords.value.map((record) => record.data);
    validData.value = retryData;
    validDataCount.value = retryData.length;
    errorRecords.value = [];

    await handleStartImport();
  };

  // 完成
  const handleComplete = () => {
    emit('cancel'); // 用户点击完成按钮，手动关闭弹窗
  };

  // 重置 - 仅在需要时手动调用，不会自动触发
  const reset = () => {
    currentStep.value = 1;
    stepStatus.value = 'process';
    excelData.value = null;
    fieldMappings.value = [];
    mappingValid.value = false;
    validData.value = [];
    validDataCount.value = 0;
    importing.value = false;
    errorRecords.value = [];
    uploadStepRef.value?.reset();
  };

  // 暴露方法
  defineExpose({
    reset,
  });
</script>

<style scoped lang="less">
  .excel-import {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 600px;
    background-color: var(--color-bg-2);

    .steps-wrapper {
      padding: 32px 64px;
      background: var(--color-fill-1);
      border-bottom: 1px solid var(--color-border-1);
    }

    .step-content {
      flex: 1;
      overflow: auto;
      padding: 0;

      .step-panel {
        height: 100%;
        min-height: 400px;
        animation: fadeIn 0.4s ease-out;

        .step-panel-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
      }
    }

    .api-config-area {
      padding: 24px 32px;
      background-color: var(--color-fill-1);
      border-top: 1px solid var(--color-border-2);

      .config-row {
        display: flex;
        align-items: flex-start;
        gap: 32px;

        .config-item {
          flex: 1;

          &.strategy-config {
            flex: 0 0 auto;
          }
        }
      }

      .api-config-header {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;

        .arco-icon {
          color: rgb(var(--primary-6));
        }
      }

      .api-config-content {
        max-width: 800px;
      }
    }

    .footer-actions {
      padding: 24px 40px;
      border-top: 1px solid var(--color-border-2);
      background-color: var(--color-bg-2);
      display: flex;
      justify-content: center;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);

      .btn-next,
      .btn-prev {
        min-width: 200px;
        flex: 1;
        max-width: 400px;
        height: 44px;
        border-radius: 22px;
        font-weight: 600;
        font-size: 15px;
      }
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
