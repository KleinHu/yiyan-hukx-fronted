<template>
  <div class="office-canvas-editor-container">
    <div ref="canvasContainer" class="canvas-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import Konva from 'konva';
  import type { FloorConfig, OfficeRoom } from '@/api/hr/types';
  import { RoomType } from '@/api/hr/types';

  const props = defineProps<{
    floorConfig: FloorConfig | null;
    editable?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'roomSelect', room: OfficeRoom): void;
    (e: 'roomUpdate', room: OfficeRoom): void;
    (e: 'roomDelete', roomId: number): void;
  }>();

  const canvasContainer = ref<HTMLDivElement>();
  let stage: Konva.Stage | null = null;
  let layer: Konva.Layer | null = null;
  let contentGroup: Konva.Group | null = null; // 包含所有内容的容器组，用于拖拽舞台
  let selectedRoomGroup: Konva.Group | null = null;

  // 配色方案
  const OFFICE_MAP_THEME = {
    rooms: {
      [RoomType.OFFICE]: '#E3F2FD',
      [RoomType.MEETING_ROOM]: '#F3E5F5',
      [RoomType.BREAK_ROOM]: '#E8F5E9',
      [RoomType.STORAGE]: '#FFF3E0',
      [RoomType.BATHROOM]: '#F5F5F5',
      [RoomType.CORRIDOR]: '#ECEFF1',
    },
    borders: {
      room: '#90CAF9',
      selected: '#409EFF',
    },
    shadows: 'rgba(0,0,0,0.1)',
  };

  const initCanvas = () => {
    if (!canvasContainer.value || !props.floorConfig) return;

    const container = canvasContainer.value;

    // 获取容器的实际尺寸 - 使用多种方式确保获取到正确尺寸
    const containerRect = container.getBoundingClientRect();
    let containerWidth = containerRect.width;
    let containerHeight = containerRect.height;

    // 如果 getBoundingClientRect 返回0，尝试其他方式
    if (containerWidth === 0 || containerHeight === 0) {
      containerWidth = container.clientWidth || container.offsetWidth || 1200;
      containerHeight = container.clientHeight || container.offsetHeight || 600;
    }

    // 画布始终使用容器的尺寸，确保铺满容器
    const stageWidth = containerWidth;
    const stageHeight = containerHeight;

    // 清理旧的stage
    if (stage) {
      stage.destroy();
    }

    // 创建Stage
    stage = new Konva.Stage({
      container,
      width: stageWidth,
      height: stageHeight,
      draggable: true, // 设置舞台可拖拽
    });

    // 创建Layer
    layer = new Konva.Layer();
    stage.add(layer);

    // 添加Stage拖拽事件 - 改变鼠标样式
    stage.on('dragstart', () => {
      if (stage) {
        stage.container().style.cursor = 'move';
      }
    });

    stage.on('dragend', () => {
      if (stage) {
        stage.container().style.cursor = 'default';
      }
    });

    // 创建容器组，用于包含所有内容
    contentGroup = new Konva.Group({
      x: 0,
      y: 0,
      draggable: false, // Stage已经可拖拽，这里不需要再设置
    });
    layer.add(contentGroup);

    renderFloor();
  };

  const renderFloor = () => {
    if (!layer || !contentGroup || !props.floorConfig) return;

    // 只清除容器组内的内容，保留容器组本身
    contentGroup.destroyChildren();

    // 渲染所有房间到容器组中
    props.floorConfig.rooms.forEach((room) => {
      const roomGroup = renderRoom(room);
      contentGroup?.add(roomGroup);
    });

    if (layer) {
      layer.draw();
    }
  };

  const renderRoom = (room: OfficeRoom): Konva.Group => {
    const roomGroup = new Konva.Group({
      x: room.x,
      y: room.y,
      draggable: props.editable,
    });

    // 在编辑器模式下，当拖拽房间时，禁用舞台拖拽
    if (props.editable) {
      roomGroup.on('dragstart', () => {
        if (contentGroup) {
          contentGroup.draggable(false);
        }
      });
    }

    // 绘制房间背景
    const roomRect = new Konva.Rect({
      width: room.width,
      height: room.height,
      fill: OFFICE_MAP_THEME.rooms[room.roomType] || '#E3F2FD',
      stroke: OFFICE_MAP_THEME.borders.room,
      strokeWidth: 2,
      cornerRadius: 12,
      shadowColor: OFFICE_MAP_THEME.shadows,
      shadowBlur: 10,
      shadowOffset: { x: 2, y: 2 },
      shadowOpacity: 0.5,
    });

    // 房间标题
    const roomLabel = new Konva.Text({
      x: 12,
      y: 12,
      text: `${room.roomName}\n${room.roomNumber}`,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#333',
      fontStyle: 'bold',
      lineHeight: 1.5,
    });

    roomGroup.add(roomRect);
    roomGroup.add(roomLabel);

    // 添加交互事件
    if (props.editable) {
      roomGroup.on('click', () => {
        if (layer) {
          selectRoom(roomGroup, room);
        }
      });

      roomGroup.on('dragend', () => {
        const newRoom = {
          ...room,
          x: roomGroup.x(),
          y: roomGroup.y(),
        };
        emit('roomUpdate', newRoom);
        // 房间拖拽结束后，重新启用舞台拖拽
        if (contentGroup) {
          contentGroup.draggable(true);
        }
      });
    }

    // 存储room数据到节点
    (roomGroup as any).roomData = room;

    return roomGroup;
  };

  const selectRoom = (roomGroup: Konva.Group, room: OfficeRoom) => {
    if (!layer) return;

    // 取消之前的选择
    if (selectedRoomGroup) {
      const rect = selectedRoomGroup.findOne('Rect') as Konva.Rect;
      if (rect) {
        rect.stroke(OFFICE_MAP_THEME.borders.room);
        rect.strokeWidth(2);
      }
    }

    // 选中当前房间
    selectedRoomGroup = roomGroup;
    const rect = roomGroup.findOne('Rect') as Konva.Rect;
    if (rect) {
      rect.stroke(OFFICE_MAP_THEME.borders.selected);
      rect.strokeWidth(4);
    }

    layer?.draw();
    emit('roomSelect', room);
  };

  watch(
    () => props.floorConfig,
    (newConfig) => {
      if (newConfig) {
        if (stage && layer) {
          renderFloor();
        } else {
          initCanvas();
        }
      }
    },
    { deep: true, immediate: false }
  );

  watch(
    () => props.editable,
    () => {
      if (stage && layer && props.floorConfig) {
        renderFloor();
      }
    }
  );

  const handleResize = () => {
    if (stage && props.floorConfig && canvasContainer.value) {
      const container = canvasContainer.value;
      const containerRect = container.getBoundingClientRect();
      let containerWidth = containerRect.width;
      let containerHeight = containerRect.height;

      // 如果 getBoundingClientRect 返回0，尝试其他方式
      if (containerWidth === 0 || containerHeight === 0) {
        containerWidth = container.clientWidth || container.offsetWidth || 1200;
        containerHeight =
          container.clientHeight || container.offsetHeight || 600;
      }

      // 画布始终使用容器的尺寸，确保铺满容器
      const stageWidth = containerWidth;
      const stageHeight = containerHeight;

      stage.width(stageWidth);
      stage.height(stageHeight);
      layer?.draw();
    }
  };

  onMounted(() => {
    if (props.floorConfig) {
      // 使用双重 nextTick 确保容器已经渲染完成
      nextTick(() => {
        nextTick(() => {
          initCanvas();
        });
      });
    }
    window.addEventListener('resize', handleResize);
    // 添加一个延迟，确保容器尺寸已经计算完成
    setTimeout(() => {
      if (props.floorConfig && !stage) {
        initCanvas();
      } else if (stage) {
        handleResize();
      }
    }, 100);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (stage) {
      stage.destroy();
      stage = null;
      layer = null;
    }
  });
</script>

<style scoped lang="less">
  .office-canvas-editor-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #f5f7fa;
    border-radius: 8px;
    position: relative;

    .canvas-wrapper {
      width: 100%;
      height: 100%;
      display: block;
    }

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }
  }
</style>
