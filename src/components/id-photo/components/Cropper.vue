<template>
  <div class="id-photo-cropper">
    <div class="cropper-main">
      <div class="cropper-container" ref="containerRef">
        <canvas ref="canvasRef" class="cropper-canvas"></canvas>
        <div class="crop-overlay">
          <div class="crop-box" :style="cropBoxStyle">
            <div class="crop-grid">
              <div class="grid-line grid-line-h" style="top: 33.33%"></div>
              <div class="grid-line grid-line-h" style="top: 66.66%"></div>
              <div class="grid-line grid-line-v" style="left: 33.33%"></div>
              <div class="grid-line grid-line-v" style="left: 66.66%"></div>
            </div>
            <!-- 裁剪框四个角 -->
            <div class="crop-corner corner-tl"></div>
            <div class="crop-corner corner-tr"></div>
            <div class="crop-corner corner-bl"></div>
            <div class="crop-corner corner-br"></div>
          </div>
          <div class="crop-hint">
            <span>拖动图片调整位置，使用下方滑块缩放或旋转</span>
          </div>
        </div>
      </div>
    </div>

    <div class="cropper-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">调整参数</span>
      </div>

      <div class="sidebar-content">
        <div class="control-group">
          <div class="group-header">
            <icon-zoom-in class="group-icon" />
            <span class="group-label">图像缩放</span>
            <span class="group-value">{{ (zoom * 100).toFixed(0) }}%</span>
          </div>
          <div class="group-slider">
            <a-slider
              v-model="zoom"
              :min="0.5"
              :max="5"
              :step="0.01"
              @change="handleZoomChange"
              :show-tooltip="false"
            />
          </div>
          <div class="group-actions">
            <a-button size="mini" @click="zoom = 1">重置</a-button>
            <a-space>
              <a-button size="mini" @click="zoom = Math.max(0.5, zoom - 0.1)">
                <template #icon><icon-minus /></template>
              </a-button>
              <a-button size="mini" @click="zoom = Math.min(5, zoom + 0.1)">
                <template #icon><icon-plus /></template>
              </a-button>
            </a-space>
          </div>
        </div>

        <div class="control-group">
          <div class="group-header">
            <icon-command class="group-icon" />
            <span class="group-label">旋转角度</span>
            <span class="group-value">{{ rotation }}°</span>
          </div>
          <div class="group-slider">
            <a-slider
              v-model="rotation"
              :min="0"
              :max="360"
              :step="1"
              @change="handleRotationChange"
              :show-tooltip="false"
            />
          </div>
          <div class="group-actions">
            <a-button size="mini" @click="rotation = 0">重置</a-button>
            <a-space>
              <a-button
                size="mini"
                @click="rotation = (rotation - 90 + 360) % 360"
              >
                <template #icon><icon-rotate-left /></template>
              </a-button>
              <a-button size="mini" @click="rotation = (rotation + 90) % 360">
                <template #icon><icon-rotate-right /></template>
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <a-button @click="handleCancel" block>
          <template #icon><icon-close /></template>
          取消
        </a-button>
        <a-button type="primary" @click="handleSave" block>
          <template #icon><icon-check /></template>
          应用裁剪
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { PixelCrop } from '../types';

  interface Props {
    imageSrc: string;
  }

  interface Emits {
    (e: 'cancel'): void;
    (e: 'complete', pixelCrop: PixelCrop, rotation: number): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const containerRef = ref<HTMLElement>();
  const canvasRef = ref<HTMLCanvasElement>();
  const zoom = ref(1);
  const initialScale = ref(1);
  const rotation = ref(0);
  const position = ref({ x: 0, y: 0 });
  const image = ref<HTMLImageElement | null>(null);
  const containerSize = ref({ width: 0, height: 0 });
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });

  const ASPECT_RATIO = 3 / 4; // 证件照比例

  // 计算当前实际缩放倍数
  const effectiveScale = computed(() => initialScale.value * zoom.value);

  // 计算裁剪框大小和位置
  const cropSize = computed(() => {
    const { width, height } = containerSize.value;
    const maxWidth = width * 0.8;
    const maxHeight = height * 0.8;

    let cropWidth = maxWidth;
    let cropHeight = cropWidth / ASPECT_RATIO;

    if (cropHeight > maxHeight) {
      cropHeight = maxHeight;
      cropWidth = cropHeight * ASPECT_RATIO;
    }

    return {
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    };
  });

  const cropBoxStyle = computed(() => {
    const { x, y, width, height } = cropSize.value;
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  });

  // 加载图片
  const loadImage = (): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        image.value = img;

        // 计算初始缩放比例，使图片刚好覆盖裁剪框
        if (img.width > 0 && cropSize.value.width > 0) {
          const scaleX = cropSize.value.width / img.width;
          const scaleY = cropSize.value.height / img.height;
          // 取较大值确保图片覆盖裁剪框
          initialScale.value = Math.max(scaleX, scaleY) * 1.1;
          zoom.value = 1;
          position.value = { x: 0, y: 0 };
        }

        resolve(img);
      };
      img.onerror = reject;
      img.src = props.imageSrc;
    });
  };

  // 绘制图片到canvas
  const drawImage = () => {
    const canvas = canvasRef.value;
    const img = image.value;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const { width, height } = containerSize.value;
    canvas.width = width;
    canvas.height = height;

    // 先清空整个canvas
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // 移动到中心
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation.value * Math.PI) / 180);
    ctx.scale(effectiveScale.value, effectiveScale.value);
    ctx.translate(-img.width / 2, -img.height / 2);

    // 应用位置偏移
    ctx.translate(
      position.value.x / effectiveScale.value,
      position.value.y / effectiveScale.value
    );

    // 绘制图片
    ctx.drawImage(img, 0, 0);

    ctx.restore();
  };

  // 计算裁剪区域（像素值）
  const calculateCropArea = (): PixelCrop => {
    const img = image.value;
    if (!img) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const { width: containerWidth, height: containerHeight } =
      containerSize.value;
    const {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    } = cropSize.value;

    // 1. 计算裁剪框中心相对于容器中心的位置
    const cropCenterX = cropX + cropWidth / 2 - containerWidth / 2;
    const cropCenterY = cropY + cropHeight / 2 - containerHeight / 2;

    // 2. 计算裁剪框中心相对于图片中心的位置（在容器坐标系下）
    const offsetX = cropCenterX - position.value.x;
    const offsetY = cropCenterY - position.value.y;

    // 3. 将这个偏移矢量逆向旋转，得到在图片自身坐标系下的偏移
    const rad = (rotation.value * Math.PI) / 180;
    const cos = Math.cos(-rad);
    const sin = Math.sin(-rad);

    const distX = offsetX * cos - offsetY * sin;
    const distY = offsetX * sin + offsetY * cos;

    // 4. 计算在原始图片上的像素坐标
    const pixelWidth = cropWidth / effectiveScale.value;
    const pixelHeight = cropHeight / effectiveScale.value;
    const pixelX =
      img.width / 2 + distX / effectiveScale.value - pixelWidth / 2;
    const pixelY =
      img.height / 2 + distY / effectiveScale.value - pixelHeight / 2;

    return {
      x: pixelX,
      y: pixelY,
      width: pixelWidth,
      height: pixelHeight,
    };
  };

  // 更新容器尺寸
  const updateContainerSize = () => {
    if (containerRef.value) {
      containerSize.value = {
        width: containerRef.value.clientWidth,
        height: containerRef.value.clientHeight,
      };
      drawImage();
    }
  };

  // 鼠标事件处理
  const handleMouseDown = (e: MouseEvent) => {
    isDragging.value = true;
    dragStart.value = {
      x: e.clientX - position.value.x,
      y: e.clientY - position.value.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      position.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y,
      };
      drawImage();
    }
  };

  const handleMouseUp = () => {
    isDragging.value = false;
  };

  // 滚轮缩放支持
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    zoom.value = Math.max(0.5, Math.min(5, zoom.value + delta));
  };

  // 缩放变化
  const handleZoomChange = () => {
    drawImage();
  };

  // 旋转变化
  const handleRotationChange = () => {
    drawImage();
  };

  // 取消
  const handleCancel = () => {
    emit('cancel');
  };

  // 保存
  const handleSave = () => {
    const pixelCrop = calculateCropArea();
    emit('complete', pixelCrop, rotation.value);
  };

  // 窗口大小变化
  const handleResize = () => {
    updateContainerSize();
  };

  // 监听图片源变化
  watch(
    () => props.imageSrc,
    async () => {
      await loadImage();
      drawImage();
    },
    { immediate: true }
  );

  // 监听zoom和rotation变化
  watch([zoom, rotation, position], () => {
    drawImage();
  });

  onMounted(async () => {
    await loadImage();
    updateContainerSize();
    window.addEventListener('resize', handleResize);

    const canvas = canvasRef.value;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  });
</script>

<style scoped lang="less">
  .id-photo-cropper {
    display: flex;
    height: 100%;
    width: 100%;
    background-color: var(--color-bg-1);
    overflow: hidden;
  }

  .cropper-main {
    flex: 1;
    position: relative;
    background-color: #0d0d0d;
    overflow: hidden;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cropper-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
    background-color: #1a1a1a;
    box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.5);
  }

  .cropper-canvas {
    max-width: 100%;
    max-height: 100%;
    cursor: move;
  }

  .crop-overlay {
    position: absolute;
    inset: 32px;
    pointer-events: none;
  }

  .crop-box {
    position: absolute;
    border: 2px solid #165dff;
    box-sizing: border-box;
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.65);
  }

  .crop-grid {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .grid-line {
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
  }

  .grid-line-h {
    left: 0;
    right: 0;
    height: 1px;
  }

  .grid-line-v {
    top: 0;
    bottom: 0;
    width: 1px;
  }

  .crop-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: #165dff;
    border-style: solid;
    border-width: 0;
  }

  .corner-tl {
    top: -4px;
    left: -4px;
    border-top-width: 4px;
    border-left-width: 4px;
  }

  .corner-tr {
    top: -4px;
    right: -4px;
    border-top-width: 4px;
    border-right-width: 4px;
  }

  .corner-bl {
    bottom: -4px;
    left: -4px;
    border-bottom-width: 4px;
    border-left-width: 4px;
  }

  .corner-br {
    bottom: -4px;
    right: -4px;
    border-bottom-width: 4px;
    border-right-width: 4px;
  }

  .crop-hint {
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
    text-align: center;

    span {
      background: rgba(0, 0, 0, 0.6);
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      padding: 6px 16px;
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }
  }

  /* 侧边栏样式 */
  .cropper-sidebar {
    width: 240px;
    background-color: #1d1d1f;
    border-left: 1px solid #333;
    display: flex;
    flex-direction: column;
    padding: 24px 20px;
  }

  .sidebar-header {
    margin-bottom: 32px;

    .sidebar-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
  }

  .sidebar-content {
    flex: 1;
  }

  .control-group {
    margin-bottom: 32px;
  }

  .group-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 8px;

    .group-icon {
      color: #86909c;
      font-size: 16px;
    }

    .group-label {
      color: #e5e6eb;
      font-size: 14px;
      flex: 1;
    }

    .group-value {
      color: #165dff;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .group-slider {
    margin-bottom: 16px;

    :deep(.arco-slider-button) {
      border-color: #165dff;
    }
  }

  .group-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    :deep(.arco-btn) {
      background-color: #2a2a2c;
      border: none;
      color: #e5e6eb;

      &:hover {
        background-color: #3a3a3c;
      }
    }
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;

    .arco-btn {
      height: 40px;
      font-weight: 500;
    }
  }
</style>
