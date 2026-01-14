<template>
  <a-modal
    v-model:visible="modalVisible"
    :title="modalTitle"
    :width="900"
    :footer="false"
    :mask-closable="false"
    @cancel="handleModalCancel"
    class="id-photo-modal"
    :body-style="{ padding: 0 }"
  >
    <div class="id-photo-container">
      <div class="id-photo-content">
        <!-- 上传状态 -->
        <div v-if="appState === IdPhotoState.UPLOAD" class="upload-state">
          <div class="upload-area" @click="handleUploadClick">
            <div class="upload-icon-wrapper">
              <div class="upload-icon">
                <icon-plus size="32" />
              </div>
            </div>
            <h3 class="upload-title">上传证件照</h3>
            <p class="upload-desc">
              支持 jpg、png 格式，建议选择清晰的正面照，系统将自动裁剪为 3:4
              标准比例
            </p>
            <a-button
              type="primary"
              size="large"
              shape="round"
              class="upload-btn"
            >
              <template #icon><icon-upload /></template>
              选择图片文件
            </a-button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleFileSelect"
            />
          </div>
          <div class="upload-tips">
            <div class="tip-item">
              <icon-check-circle-fill class="tip-icon" />
              <span>自动裁剪</span>
            </div>
            <div class="tip-item">
              <icon-check-circle-fill class="tip-icon" />
              <span>标准比例</span>
            </div>
            <div class="tip-item">
              <icon-check-circle-fill class="tip-icon" />
              <span>高清导出</span>
            </div>
          </div>
        </div>

        <!-- 裁剪状态 -->
        <div
          v-else-if="appState === IdPhotoState.CROP && imageSrc"
          class="crop-state"
        >
          <ImageCropper
            :image-src="imageSrc"
            @cancel="handleReset"
            @complete="handleCropComplete"
          />
        </div>

        <!-- 结果状态 -->
        <div
          v-else-if="appState === IdPhotoState.RESULT && croppedImage"
          class="result-state"
        >
          <div class="result-wrapper">
            <div class="result-content-card">
              <div class="result-left-panel">
                <div class="photo-frame">
                  <div class="photo-inner">
                    <img :src="croppedImage" alt="裁剪后的证件照" />
                  </div>
                  <div class="photo-badge">
                    <icon-check-circle-fill />
                    3:4 标准比例
                  </div>
                </div>
              </div>

              <div class="result-right-panel">
                <div class="status-indicator">
                  <div class="status-dot"></div>
                  <span>处理完成</span>
                </div>
                <h2 class="finish-title">证件照已生成</h2>
                <p class="finish-desc">
                  您的证件照已按照标准比例裁剪并优化完成。
                </p>

                <div class="action-divider"></div>

                <div class="finish-actions">
                  <a-button
                    v-if="props.visible"
                    type="primary"
                    @click="handleConfirm"
                    size="large"
                    class="confirm-btn-final"
                  >
                    <template #icon><icon-check /></template>
                    确认使用
                  </a-button>

                  <div class="secondary-action-row">
                    <a-button
                      v-if="props.showDownload"
                      @click="handleDownload"
                      :loading="downloading"
                      class="download-btn-final"
                    >
                      <template #icon><icon-download /></template>
                      保存本地
                    </a-button>

                    <a-button
                      type="text"
                      @click="handleReset"
                      class="reset-btn-final"
                    >
                      <template #icon><icon-refresh /></template>
                      重新上传
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import ImageCropper from './components/Cropper.vue';
  import {
    getCroppedImg,
    downloadImage,
    base64ToFile,
  } from './utils/canvasUtils';
  import { PixelCrop, IdPhotoState } from './types';

  interface Props {
    /** 是否显示模态框 */
    visible?: boolean;
    /** 模态框标题 */
    title?: string;
    /** 初始图片URL（可选，用于编辑已有图片） */
    initialImage?: string | null;
    /** 初始图片文件（可选，用于直接传入文件） */
    initialFile?: File | null;
    /** 是否显示下载按钮（默认true） */
    showDownload?: boolean;
  }

  interface Emits {
    /** 裁剪完成事件，返回base64字符串和File对象 */
    (e: 'complete', data: { base64: string; file: File }): void;
    /** 取消事件 */
    (e: 'cancel'): void;
    /** 模态框关闭事件 */
    (e: 'update:visible', visible: boolean): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    title: '证件照编辑',
    initialImage: null,
    showDownload: true,
  });

  const emit = defineEmits<Emits>();

  const fileInputRef = ref<HTMLInputElement>();
  const appState = ref<IdPhotoState>(IdPhotoState.UPLOAD);
  const imageSrc = ref<string | null>(null);
  const croppedImage = ref<string | null>(null);
  const downloading = ref(false);

  // 模态框显示状态
  const modalVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  // 模态框标题
  const modalTitle = computed(() => props.title);

  // 监听visible变化，重置状态
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        // 打开模态框时，如果有初始图片或文件，直接进入裁剪状态
        if (props.initialImage) {
          imageSrc.value = props.initialImage;
          appState.value = IdPhotoState.CROP;
        } else if (props.initialFile) {
          // 如果有初始文件，读取并进入裁剪状态
          const reader = new FileReader();
          reader.addEventListener('load', () => {
            imageSrc.value = reader.result?.toString() || null;
            appState.value = IdPhotoState.CROP;
          });
          reader.readAsDataURL(props.initialFile);
        } else {
          // 否则重置到上传状态
          handleReset();
        }
      }
    }
  );

  // 监听initialFile变化
  watch(
    () => props.initialFile,
    (newFile) => {
      if (newFile && props.visible) {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          imageSrc.value = reader.result?.toString() || null;
          appState.value = IdPhotoState.CROP;
        });
        reader.readAsDataURL(newFile);
      }
    }
  );

  // 点击上传区域
  const handleUploadClick = () => {
    fileInputRef.value?.click();
  };

  // 选择文件
  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        imageSrc.value = reader.result?.toString() || null;
        appState.value = IdPhotoState.CROP;
      });
      reader.readAsDataURL(file);
    }
  };

  // 裁剪完成
  const handleCropComplete = async (pixelCrop: PixelCrop, rotation: number) => {
    if (imageSrc.value) {
      try {
        const cropped = await getCroppedImg(
          imageSrc.value,
          pixelCrop,
          rotation
        );
        if (cropped) {
          croppedImage.value = cropped;
          appState.value = IdPhotoState.RESULT;
        } else {
          Message.error('图片裁剪失败，请重试');
        }
      } catch (error) {
        Message.error('图片裁剪失败，请重试');
      }
    }
  };

  // 下载图片
  const handleDownload = () => {
    if (croppedImage.value) {
      downloading.value = true;
      try {
        downloadImage(croppedImage.value, '证件照.jpg');
        Message.success('下载成功');
      } catch (error) {
        console.error('下载错误:', error);
        Message.error('下载失败');
      } finally {
        downloading.value = false;
      }
    }
  };

  // 确认使用（模态框模式下）
  const handleConfirm = () => {
    if (croppedImage.value) {
      const file = base64ToFile(croppedImage.value, 'id-photo.jpg');
      emit('complete', { base64: croppedImage.value, file });
      modalVisible.value = false;
    }
  };

  // 模态框取消
  const handleModalCancel = () => {
    emit('cancel');
    handleReset();
  };

  // 重置
  const handleReset = () => {
    appState.value = IdPhotoState.UPLOAD;
    imageSrc.value = null;
    croppedImage.value = null;
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  };
</script>

<style scoped lang="less">
  .id-photo-modal {
    :deep(.arco-modal-header) {
      border-bottom: 1px solid var(--color-fill-2);
      padding: 16px 24px;
    }
    :deep(.arco-modal-body) {
      background-color: var(--color-bg-2);
    }
  }

  .id-photo-container {
    width: 100%;
    height: 600px;
    display: flex;
    flex-direction: column;
  }

  .id-photo-content {
    flex: 1;
    overflow: hidden;
  }

  /* 上传状态样式 */
  .upload-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .upload-area {
    width: 100%;
    max-width: 600px;
    height: 320px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--color-border-3);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    background-color: var(--color-fill-1);

    &:hover {
      border-color: var(--color-primary);
      background-color: var(--color-primary-light-1);
      .upload-icon {
        background-color: var(--color-primary-light-2);
        color: var(--color-primary);
        transform: scale(1.1);
      }
    }
  }

  .upload-icon-wrapper {
    margin-bottom: 24px;
  }

  .upload-icon {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-fill-3);
    border-radius: 50%;
    color: var(--color-text-3);
    transition: all 0.3s;
  }

  .upload-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-1);
    margin: 0 0 12px;
  }

  .upload-desc {
    font-size: 14px;
    color: var(--color-text-3);
    text-align: center;
    margin: 0 0 32px;
    max-width: 420px;
    line-height: 1.6;
  }

  .upload-btn {
    padding: 0 40px;
  }

  .file-input {
    display: none;
  }

  .upload-tips {
    display: flex;
    gap: 32px;
    margin-top: 40px;

    .tip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-text-3);
      font-size: 14px;

      .tip-icon {
        color: var(--color-success);
      }
    }
  }

  /* 裁剪状态样式 */
  .crop-state {
    height: 100%;
  }

  /* 结果状态样式 */
  .result-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0f1115; /* 更深邃的背景色 */
    background-image: radial-gradient(
      circle at 50% 50%,
      #1d2129 0%,
      #0f1115 100%
    );
    padding: 40px;
  }

  .result-wrapper {
    width: 100%;
    max-width: 860px;
    animation: fadeIn 0.5s ease-out;
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

  .result-content-card {
    display: flex;
    background: #1d2129;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* 左侧面板：相片展示 */
  .result-left-panel {
    flex: 1;
    background: #14171c;
    padding: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }

  .photo-frame {
    position: relative;
    padding: 12px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transform: rotate(-1deg); /* 增加一点自然的倾斜感 */
    transition: transform 0.3s;

    &:hover {
      transform: rotate(0) scale(1.02);
    }
  }

  .photo-inner {
    width: 240px;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: #f7f8fa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .photo-badge {
    position: absolute;
    top: -12px;
    right: -12px;
    background: #165dff;
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 4px;
    z-index: 10;
  }

  /* 右侧面板：信息与操作 */
  .result-right-panel {
    width: 320px;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: #00b42a;
    font-weight: 500;
    font-size: 14px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #00b42a;
    border-radius: 50%;
    box-shadow: 0 0 10px #00b42a;
  }

  .finish-title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 12px;
  }

  .finish-desc {
    font-size: 14px;
    color: #86909c;
    line-height: 1.6;
    margin: 0;
  }

  .action-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 32px 0;
  }

  .finish-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: auto;
  }

  .confirm-btn-final {
    height: 48px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
  }

  .secondary-action-row {
    display: flex;
    gap: 12px;
  }

  .download-btn-final {
    flex: 1;
    height: 40px;
    background: #2e343f !important;
    border: none !important;
    color: #e5e6eb !important;
    border-radius: 6px;

    &:hover {
      background: #3f4654 !important;
    }
  }

  .reset-btn-final {
    color: #86909c;
    transition: color 0.3s;
    &:hover {
      color: #165dff;
    }
  }
</style>
