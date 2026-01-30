<template>
  <a-modal
    v-model:visible="visible"
    :width="1000"
    :footer="false"
    :mask-closable="false"
    class="batch-photo-upload-modal"
    @cancel="handleClose"
  >
    <!-- 自定义标题栏 -->
    <template #title>
      <div class="modal-header">
        <div class="title-main">批量上传证件照</div>
        <div class="title-sub">支持预览、裁剪与批量处理</div>
      </div>
    </template>

    <div class="batch-upload-container">
      <!-- 顶部控制栏 -->
      <div v-if="fileList.length > 0" class="control-bar">
        <div class="bar-left">
          <a-space :size="12">
            <span class="count-tag">
              总数: <span class="num">{{ fileList.length }}</span>
            </span>
            <a-radio-group v-model="viewMode" type="button" size="small">
              <a-radio value="grid">
                <template #default><icon-apps /></template>
              </a-radio>
              <a-radio value="detail">
                <template #default><icon-desktop /></template>
              </a-radio>
            </a-radio-group>
          </a-space>
        </div>
        <div class="bar-right">
          <a-button type="text" size="small" @click="handleClearList">
            <template #icon><icon-delete /></template>
            清空
          </a-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="fileList.length === 0" class="empty-placeholder">
        <div class="empty-icon-wrap">
          <icon-upload :size="48" />
        </div>
        <div class="empty-text">请选择包含证件照的文件夹或文件</div>
        <div class="empty-desc">
          照片需按「工号-姓名」命名（如 E001-张三.jpg）
        </div>
        <div class="empty-actions">
          <a-button type="primary" @click="triggerDirSelect">
            <template #icon><icon-folder /></template>
            添加文件夹
          </a-button>
          <a-button @click="triggerFileSelect">
            <template #icon><icon-file /></template>
            添加文件
          </a-button>
        </div>
      </div>

      <!-- 主内容区 -->
      <div v-else class="main-content-wrap">
        <!-- 详情预览模式 -->
        <div v-if="viewMode === 'detail'" class="detail-view">
          <div class="preview-stage">
            <div class="nav-btn prev" @click="handlePrev">
              <icon-left />
            </div>

            <div class="main-preview-card">
              <img :src="getPreviewUrl(currentItem) || ''" class="main-img" />
              <div class="card-overlay-btns">
                <a-button
                  shape="circle"
                  size="small"
                  @click="handleOpenCrop(currentItem)"
                >
                  <template #icon><icon-scissor /></template>
                </a-button>
                <a-button
                  shape="circle"
                  size="small"
                  status="danger"
                  @click="handleRemoveItem(currentItem)"
                >
                  <template #icon><icon-delete /></template>
                </a-button>
              </div>
              <div class="card-info">
                <div class="info-name">{{ currentItem?.name }}</div>
                <div class="info-size">
                  {{ formatFileSize(currentItem?.file?.size) }}
                </div>
              </div>
              <div
                v-if="currentItem && croppedFileMap[fileItemKey(currentItem)]"
                class="card-badge"
              >
                已裁剪
              </div>
            </div>

            <div class="nav-btn next" @click="handleNext">
              <icon-right />
            </div>
          </div>
        </div>

        <!-- 网格模式 -->
        <div v-else class="grid-view">
          <a-scrollbar style="height: 550px; overflow-y: auto">
            <div class="image-grid">
              <div
                v-for="(item, index) in fileList"
                :key="fileItemKey(item)"
                class="grid-item"
                :class="{
                  'grid-success':
                    uploadStatusMap[fileItemKey(item)] === 'success',
                }"
                @click="
                  uploadStatusMap[fileItemKey(item)] !== 'success' &&
                    ((currentIndex = index), (viewMode = 'detail'))
                "
              >
                <div class="grid-thumb">
                  <img :src="getPreviewUrl(item) || ''" />
                  <div
                    v-if="uploadStatusMap[fileItemKey(item)] === 'success'"
                    class="grid-status success"
                  >
                    <icon-check-circle-fill />
                    <span class="grid-status-text">上传完成</span>
                  </div>
                  <div
                    v-else-if="uploadStatusMap[fileItemKey(item)] === 'failed'"
                    class="grid-status failed"
                  >
                    <icon-exclamation-circle-fill />
                    <span class="grid-status-text">上传失败</span>
                  </div>
                  <div
                    v-else-if="
                      uploadStatusMap[fileItemKey(item)] === 'uploading'
                    "
                    class="grid-status uploading"
                  >
                    <a-spin size="small" />
                    <span class="grid-status-text">上传中</span>
                  </div>
                  <div
                    v-else-if="uploadStatusMap[fileItemKey(item)] === 'pending'"
                    class="grid-status pending"
                  >
                    <icon-clock-circle />
                    <span class="grid-status-text">等待上传</span>
                  </div>
                  <div v-else class="grid-mask">
                    <a-space>
                      <icon-scissor @click.stop="handleOpenCrop(item)" />
                      <icon-delete @click.stop="handleRemoveItem(item)" />
                    </a-space>
                  </div>
                </div>
                <div class="grid-name" :title="item.name">{{ item.name }}</div>
                <div
                  v-if="croppedFileMap[fileItemKey(item)]"
                  class="item-badge"
                >
                  已裁剪
                </div>
              </div>
            </div>
          </a-scrollbar>
        </div>
      </div>

      <!-- 图片队列区：仅在详情模式下显示，且位于操作区上方 -->
      <div
        v-if="fileList.length > 0 && viewMode === 'detail'"
        class="queue-section"
      >
        <div class="queue-header">
          <span class="queue-title">图片队列</span>
          <span class="queue-index"
            >{{ currentIndex + 1 }} / {{ fileList.length }}</span
          >
        </div>
        <div class="queue-scroll-wrap">
          <a-scrollbar type="embed" style="overflow-x: auto">
            <div class="thumb-queue">
              <div
                v-for="(item, index) in fileList"
                :key="fileItemKey(item)"
                class="thumb-item"
                :class="{
                  active: currentIndex === index,
                  'thumb-pending':
                    uploadStatusMap[fileItemKey(item)] === 'pending',
                  'thumb-uploading':
                    uploadStatusMap[fileItemKey(item)] === 'uploading',
                  'thumb-success':
                    uploadStatusMap[fileItemKey(item)] === 'success',
                  'thumb-failed':
                    uploadStatusMap[fileItemKey(item)] === 'failed',
                }"
                @click="
                  uploadStatusMap[fileItemKey(item)] !== 'success' &&
                    (currentIndex = index)
                "
              >
                <img :src="getPreviewUrl(item) || ''" class="thumb-img" />
                <div v-if="currentIndex === index" class="active-mask">
                  <icon-check-circle-fill />
                </div>
                <div
                  v-else-if="uploadStatusMap[fileItemKey(item)] === 'success'"
                  class="thumb-status success"
                >
                  <icon-check-circle-fill />
                  <span class="thumb-status-text">上传完成</span>
                </div>
                <div
                  v-else-if="uploadStatusMap[fileItemKey(item)] === 'failed'"
                  class="thumb-status failed"
                >
                  <icon-exclamation-circle-fill />
                  <span class="thumb-status-text">上传失败</span>
                </div>
                <div
                  v-else-if="uploadStatusMap[fileItemKey(item)] === 'uploading'"
                  class="thumb-status uploading"
                >
                  <a-spin size="small" />
                  <span class="thumb-status-text">上传中</span>
                </div>
                <div v-else class="thumb-status pending">
                  <icon-clock-circle />
                  <span class="thumb-status-text">等待上传</span>
                </div>
              </div>
            </div>
          </a-scrollbar>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="modal-footer">
        <div class="footer-hint">支持格式: JPG, PNG • 最大限制: 10MB</div>
        <div class="footer-btns">
          <a-upload
            :key="`dir-${uploadKey}`"
            ref="dirUploadRef"
            directory
            accept="image/*"
            :show-file-list="false"
            :auto-upload="false"
            @change="onDirChange"
          >
            <template #upload-button>
              <a-button type="secondary" size="medium">
                <template #icon><icon-folder-add /></template>
                添加文件夹
              </a-button>
            </template>
          </a-upload>

          <a-upload
            :key="`main-${uploadKey}`"
            ref="uploadRef"
            multiple
            accept="image/*"
            :show-file-list="false"
            :auto-upload="false"
            @change="onMainChange"
          >
            <template #upload-button>
              <a-button type="secondary" size="medium">
                <template #icon><icon-file-add /></template>
                添加文件
              </a-button>
            </template>
          </a-upload>

          <a-button
            type="primary"
            size="medium"
            :loading="uploading"
            :disabled="fileList.length === 0"
            @click="handleConfirmUpload"
          >
            <template #icon><icon-cloud-upload /></template>
            全部上传
          </a-button>
        </div>
      </div>
    </div>

    <!-- 裁剪弹窗 -->
    <IdPhoto
      v-model:visible="cropModalVisible"
      title="裁剪证件照（保存为上传副本）"
      :initial-file="cropSourceFile"
      :show-download="false"
      @complete="handleCropComplete"
      @cancel="handleCropCancel"
    />
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onBeforeUnmount } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { FileItem } from '@arco-design/web-vue/es/upload/interfaces';
  import IdPhoto from '@/components/id-photo/index.vue';
  import employeeApi from '@/api/hr/employee';

  interface Props {
    modelValue: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void;
    (e: 'success'): void;
  }>();

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  });

  const uploadRef = ref<any>(null);
  const dirUploadRef = ref<any>(null);

  const fileList = ref<FileItem[]>([]);
  const currentIndex = ref(0);
  const viewMode = ref<'grid' | 'detail'>('detail');
  /** 清空时递增，强制 a-upload 重挂载以清空其内部文件列表 */
  const uploadKey = ref(0);
  const uploading = ref(false);
  const cropModalVisible = ref(false);
  const cropSourceItem = ref<FileItem | null>(null);
  const cropSourceFile = ref<File | null>(null);
  const croppedFileMap = ref<Record<string, File>>({});
  const previewUrlMap = ref<Record<string, string>>({});
  /** 每张图片的上传状态：pending 未上传，uploading 上传中，success 成功，failed 失败 */
  const uploadStatusMap = ref<
    Record<string, 'pending' | 'uploading' | 'success' | 'failed'>
  >({});

  const currentItem = computed(
    () => fileList.value[currentIndex.value] || null
  );

  /** 以文件名为 key，全组件统一使用 */
  function fileItemKey(item: FileItem): string {
    return item.name || item.file?.name || '';
  }

  /** 解析工号 */
  function parseUserCode(fileName: string): string {
    const base = fileName.replace(/\.[^.]+$/, '');
    const firstDash = base.indexOf('-');
    return firstDash > 0 ? base.slice(0, firstDash).trim() : base;
  }

  /** 格式化文件大小 */
  function formatFileSize(size?: number): string {
    if (!size) return '0 B';
    const mb = size / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(size / 1024).toFixed(0)} KB`;
  }

  /** 获取预览图 */
  function getPreviewUrl(fileItem: FileItem | undefined): string {
    if (!fileItem) return '';
    const key = fileItemKey(fileItem);
    if (previewUrlMap.value[key]) return previewUrlMap.value[key];
    const cropped = croppedFileMap.value[key];
    if (cropped) {
      const url = URL.createObjectURL(cropped);
      previewUrlMap.value[key] = url;
      return url;
    }
    if (fileItem.url) return fileItem.url;
    if (fileItem.file) {
      const url = URL.createObjectURL(fileItem.file);
      previewUrlMap.value[key] = url;
      return url;
    }
    return '';
  }

  function revokePreviewUrl(key: string) {
    const url = previewUrlMap.value[key];
    if (url) {
      URL.revokeObjectURL(url);
      delete previewUrlMap.value[key];
    }
  }

  function triggerDirSelect() {
    dirUploadRef.value?.$el?.querySelector('input')?.click();
  }

  function triggerFileSelect() {
    uploadRef.value?.$el?.querySelector('input')?.click();
  }

  function onDirChange(list: FileItem[]) {
    if (!list?.length) return;
    const files = list.map((item) => item.file).filter((f): f is File => !!f);
    const existingNames = new Set(
      fileList.value.map((item) => fileItemKey(item))
    );
    const seen = new Set<string>();
    const newFiles = files.filter((f) => {
      const name = f.name || '';
      if (existingNames.has(name) || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
    if (newFiles.length === 0) return;
    uploadRef.value?.upload?.(newFiles);
  }

  /** 按文件名去重：同名只保留第一项 */
  function onMainChange(list: FileItem[]) {
    const keyToItem = new Map<string, FileItem>();
    list.forEach((item) => {
      const k = fileItemKey(item) || `__unnamed_${keyToItem.size}`;
      if (!keyToItem.has(k)) keyToItem.set(k, item);
    });
    fileList.value = Array.from(keyToItem.values());
    const keys = new Set(keyToItem.keys());
    const nextStatus = { ...uploadStatusMap.value };
    keys.forEach((k) => {
      if (!(k in nextStatus)) nextStatus[k] = 'pending';
    });
    Object.keys(nextStatus).forEach((k) => {
      if (!keys.has(k)) delete nextStatus[k];
    });
    uploadStatusMap.value = nextStatus;
    if (currentIndex.value >= fileList.value.length) {
      currentIndex.value = Math.max(0, fileList.value.length - 1);
    }
  }

  function handleRemoveItem(item: FileItem | null) {
    if (!item) return;
    const key = fileItemKey(item);
    const idx = fileList.value.findIndex((f) => fileItemKey(f) === key);
    if (idx > -1) {
      revokePreviewUrl(key);
      delete croppedFileMap.value[key];
      delete uploadStatusMap.value[key];
      fileList.value.splice(idx, 1);
      if (currentIndex.value >= fileList.value.length) {
        currentIndex.value = Math.max(0, fileList.value.length - 1);
      }
    }
  }

  function handleClearList() {
    fileList.value.forEach((item) => revokePreviewUrl(fileItemKey(item)));
    fileList.value = [];
    croppedFileMap.value = {};
    previewUrlMap.value = {};
    uploadStatusMap.value = {};
    currentIndex.value = 0;
    uploadKey.value += 1;
  }

  function handlePrev() {
    if (currentIndex.value > 0) {
      currentIndex.value -= 1;
    } else {
      currentIndex.value = fileList.value.length - 1;
    }
  }

  function handleNext() {
    if (currentIndex.value < fileList.value.length - 1) {
      currentIndex.value += 1;
    } else {
      currentIndex.value = 0;
    }
  }

  function handleOpenCrop(fileItem: FileItem | null) {
    if (!fileItem) return;
    cropSourceItem.value = fileItem;
    const key = fileItemKey(fileItem);
    cropSourceFile.value = croppedFileMap.value[key] || fileItem.file || null;
    cropModalVisible.value = true;
  }

  function handleCropComplete(data: { base64: string; file: File }) {
    const item = cropSourceItem.value;
    if (!item) return;
    const key = fileItemKey(item);
    const keepName = new File([data.file], item.name || 'avatar.jpg', {
      type: 'image/jpeg',
    });
    croppedFileMap.value[key] = keepName;
    revokePreviewUrl(key);
    cropModalVisible.value = false;
    Message.success('已保存裁剪副本');
  }

  function handleCropCancel() {
    cropSourceItem.value = null;
    cropSourceFile.value = null;
  }

  /** 队列并发数 */
  const UPLOAD_QUEUE_CONCURRENCY = 5;

  async function handleConfirmUpload() {
    if (fileList.value.length === 0) return;
    const tasks = fileList.value
      .map((item) => {
        const key = fileItemKey(item);
        if (!key || uploadStatusMap.value[key] === 'success') return null;
        const fileToUpload = croppedFileMap.value[key] || item.file;
        const userCode = fileToUpload
          ? parseUserCode(item.name || fileToUpload.name)
          : '';
        return { item, fileToUpload, userCode, key };
      })
      .filter(
        (
          t
        ): t is {
          item: FileItem;
          fileToUpload: File;
          userCode: string;
          key: string;
        } => !!t && !!t.fileToUpload && !!t.userCode && !!t.key
      );

    if (tasks.length === 0) {
      Message.info('没有待上传的项，已成功的将跳过');
      return;
    }

    uploading.value = true;
    const nextStatusStart = { ...uploadStatusMap.value };
    tasks.forEach((t) => {
      nextStatusStart[t.key] = 'uploading';
    });
    uploadStatusMap.value = nextStatusStart;

    const results: { key: string; success: boolean }[] = [];
    const taskQueue = [...tasks];

    /** 单张上传结束后立即更新状态，触发界面即时刷新 */
    const setStatus = (
      key: string,
      status: 'uploading' | 'success' | 'failed'
    ) => {
      uploadStatusMap.value = { ...uploadStatusMap.value, [key]: status };
    };

    const runWorker = async (): Promise<void> => {
      const task = taskQueue.shift();
      if (!task) return;
      const { fileToUpload, userCode, key } = task;
      try {
        await employeeApi.updateAvatar(userCode, fileToUpload);
        results.push({ key, success: true });
        setStatus(key, 'success');
      } catch {
        results.push({ key, success: false });
        setStatus(key, 'failed');
      }
      await runWorker();
    };

    try {
      await Promise.all(
        Array.from(
          { length: Math.min(UPLOAD_QUEUE_CONCURRENCY, tasks.length) },
          () => runWorker()
        )
      );

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount > 0) {
        Message.warning(
          `本次上传完成：成功 ${successCount} 张，失败 ${failedCount} 张，可继续点击「全部上传」重试失败项`
        );
      } else {
        const allSuccess = fileList.value.every(
          (item) => uploadStatusMap.value[fileItemKey(item)] === 'success'
        );
        if (allSuccess) {
          Message.success('全部上传完成');
          handleClose();
          emit('success');
        } else {
          Message.success(`本次上传 ${successCount} 张成功`);
        }
      }
    } finally {
      uploading.value = false;
    }
  }

  function handleClose() {
    handleClearList();
    visible.value = false;
  }

  watch(visible, (v) => {
    if (!v) handleClearList();
  });

  onBeforeUnmount(() => {
    handleClearList();
  });
</script>

<style scoped lang="less">
  .batch-photo-upload-modal {
    :deep(.arco-modal-header) {
      border-bottom: 1px solid var(--color-border-1);
      padding: 12px 24px;
    }
    :deep(.arco-modal-body) {
      padding: 0;
    }
  }

  .modal-header {
    .title-main {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }
    .title-sub {
      font-size: 12px;
      color: var(--color-text-3);
      margin-top: 2px;
    }
  }

  .batch-upload-container {
    display: flex;
    flex-direction: column;
    height: 720px;
    background: #fff;
  }

  .control-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid var(--color-border-1);
    flex-shrink: 0;

    .count-tag {
      background: #e8f3ff;
      color: #165dff;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      .num {
        margin-left: 4px;
        font-weight: 600;
      }
    }
  }

  .empty-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      background: #f2f3f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #86909c;
      margin-bottom: 24px;
    }
    .empty-text {
      font-size: 16px;
      font-weight: 500;
      color: #1d2129;
    }
    .empty-desc {
      font-size: 13px;
      color: #86909c;
      margin: 8px 0 24px;
    }
    .empty-actions {
      display: flex;
      gap: 12px;
    }
  }

  .main-content-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: #f7f8fa;
  }

  .detail-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .preview-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      min-height: 0;

      .nav-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        color: #4e5969;
        transition: all 0.2s;
        position: absolute;
        z-index: 10;
        &:hover {
          background: #f2f3f5;
          color: #165dff;
          transform: scale(1.1);
        }
        &.prev {
          left: 24px;
        }
        &.next {
          right: 24px;
        }
      }

      .main-preview-card {
        height: 90%;
        aspect-ratio: 3/4;
        background: #fff;
        border-radius: 12px;
        position: relative;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        overflow: hidden;

        .main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-overlay-btns {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 5;

          :deep(.arco-btn) {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            &:hover {
              background: #fff;
              transform: scale(1.05);
            }
          }
        }

        .card-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 32px 16px 12px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: #fff;
          .info-name {
            font-size: 14px;
            font-weight: 500;
          }
          .info-size {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 4px;
          }
        }

        .card-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #00b42a;
          color: #fff;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          z-index: 5;
        }
      }
    }
  }

  .queue-section {
    background: #fff;
    border-top: 1px solid var(--color-border-1);
    display: flex;
    flex-direction: column;
    padding: 16px 0 0;
    flex-shrink: 0;

    .queue-header {
      padding: 0 24px 8px;
      display: flex;
      justify-content: space-between;
      .queue-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1);
      }
      .queue-index {
        font-size: 12px;
        color: var(--color-text-3);
        font-family: tabular-nums;
      }
    }

    .queue-scroll-wrap {
      padding: 0 24px 16px;
    }

    .thumb-queue {
      display: flex;
      gap: 12px;
      width: max-content;

      .thumb-item {
        width: 64px;
        height: 84px;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
        flex-shrink: 0;
        background: #f2f3f5;

        &.active {
          border-color: #165dff;
          box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
        }

        &.thumb-success {
          cursor: default;
          opacity: 0.9;
        }

        &.thumb-failed {
          border-color: rgba(245, 63, 63, 0.5);
        }

        &.thumb-pending {
          border-color: rgba(22, 93, 255, 0.2);
        }

        &.thumb-uploading {
          border-color: #165dff;
          animation: thumb-pulse 1s ease-in-out infinite;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .active-mask {
          position: absolute;
          inset: 0;
          background: rgba(22, 93, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #165dff;
          font-size: 20px;
        }

        .thumb-status {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 22px;
          .thumb-status-text {
            font-size: 10px;
            color: inherit;
            opacity: 0.95;
          }
          &.success {
            background: rgba(0, 180, 42, 0.2);
            color: #00b42a;
          }
          &.failed {
            background: rgba(245, 63, 63, 0.2);
            color: #f53f3f;
          }
          &.uploading {
            background: rgba(22, 93, 255, 0.15);
            color: #165dff;
          }
          &.pending {
            background: rgba(0, 0, 0, 0.08);
            color: #86909c;
          }
        }
      }
    }
  }

  @keyframes thumb-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(22, 93, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(22, 93, 255, 0.1);
    }
  }

  .grid-view {
    flex: 1;
    padding: 24px;
    background: #f7f8fa;
    min-height: 0; // 关键：允许弹性收缩
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 20px;
    }
    .grid-item {
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      position: relative;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        .grid-mask {
          opacity: 1;
        }
      }
      &.grid-success {
        cursor: default;
        opacity: 0.9;
        &:hover {
          transform: none;
          .grid-mask {
            opacity: 0;
          }
        }
      }
      .grid-thumb {
        aspect-ratio: 3/4;
        position: relative;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .grid-mask {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          color: #fff;
          font-size: 18px;
        }
        .grid-status {
          position: absolute;
          top: 6px;
          right: 6px;
          min-width: 24px;
          min-height: 24px;
          padding: 2px 6px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 14px;
          z-index: 2;
          .grid-status-text {
            font-size: 10px;
            white-space: nowrap;
          }
          &.success {
            background: #00b42a;
            color: #fff;
          }
          &.failed {
            background: #f53f3f;
            color: #fff;
          }
          &.uploading {
            background: #165dff;
            color: #fff;
          }
          &.pending {
            background: #86909c;
            color: #fff;
          }
        }
      }
      .grid-name {
        padding: 8px;
        font-size: 12px;
        color: var(--color-text-2);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-badge {
        position: absolute;
        top: 6px;
        left: 6px;
        background: #00b42a;
        color: #fff;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 3px;
      }
    }
  }

  .modal-footer {
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid var(--color-border-1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .footer-hint {
      font-size: 12px;
      color: #86909c;
    }
    .footer-btns {
      display: flex;
      gap: 12px;
    }
  }
</style>
