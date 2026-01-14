<template>
  <div class="office-canvas-container">
    <div ref="canvasContainer" class="canvas-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
  import Konva from 'konva';
  import type { FloorConfig, OfficeRoom, Employee } from '@/api/hr/types';
  import { RoomType } from '@/api/hr/types';

  const props = defineProps<{
    floorConfig: FloorConfig | null;
    employees: Employee[];
    highlightEmployeeId?: number | null;
  }>();

  const emit = defineEmits<{
    (e: 'employeeClick', employee: Employee): void;
  }>();

  const canvasContainer = ref<HTMLDivElement>();
  let stage: Konva.Stage | null = null;
  let layer: Konva.Layer | null = null;
  let contentGroup: Konva.Group | null = null; // 包含所有内容的容器组，用于拖拽舞台
  let highlightGroup: Konva.Group | null = null; // 用于存储高亮相关的动画节点
  let rippleTweens: Konva.Tween[] = []; // 存储波纹动画

  // 解析 officeLocation 字符串
  function parseOfficeLocation(location: string): {
    buildingCode: string;
    roomNumber: string;
  } {
    const [buildingCode, roomNumber] = location.split('-');
    return { buildingCode, roomNumber };
  }

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
    employee: {
      normal: '#2196F3',
      highlight: '#FF5722',
    },
    borders: {
      room: '#90CAF9',
      employee: '#BDBDBD',
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

    // 画布尺寸应该至少等于 floorConfig 的尺寸，确保所有内容都能显示
    // 如果容器更大，则使用容器尺寸；否则使用 floorConfig 尺寸
    const stageWidth = Math.max(containerWidth, props.floorConfig.canvasWidth);
    const stageHeight = Math.max(
      containerHeight,
      props.floorConfig.canvasHeight
    );

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

    // 创建容器组，用于拖拽整个舞台
    contentGroup = new Konva.Group({
      x: 0,
      y: 0,
      draggable: true,
    });
    layer.add(contentGroup);

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

    // 同时保留contentGroup的拖拽事件（作为备选方案）
    contentGroup.on('dragstart', () => {
      if (stage) {
        stage.container().style.cursor = 'move';
      }
    });

    contentGroup.on('dragend', () => {
      if (stage) {
        stage.container().style.cursor = 'default';
      }
    });

    renderFloor();
  };

  const renderFloor = () => {
    if (!layer || !contentGroup || !props.floorConfig) return;

    // 只清除容器组内的内容，保留容器组本身
    contentGroup.destroyChildren();

    // 清除之前的高亮
    if (highlightGroup) {
      rippleTweens.forEach((t) => t.destroy());
      rippleTweens = [];
      highlightGroup.destroy();
      highlightGroup = null;
    }

    // 渲染所有房间到容器组中
    props.floorConfig.rooms.forEach((room) => {
      const roomGroup = renderRoom(room);
      contentGroup?.add(roomGroup);
    });

    layer?.draw();

    // 如果有高亮员工，执行高亮动画
    if (props.highlightEmployeeId) {
      highlightEmployee(props.highlightEmployeeId);
    }
  };

  const renderRoom = (room: OfficeRoom): Konva.Group => {
    const roomGroup = new Konva.Group({
      x: room.x,
      y: room.y,
    });

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

    // 根据员工数据渲染员工
    const roomEmployees = props.employees.filter((emp) => {
      if (!emp.officeLocation) return false;
      const { roomNumber } = parseOfficeLocation(emp.officeLocation);
      return roomNumber === room.roomNumber;
    });

    // 统一的布局参数（所有房间使用相同的参数，确保对齐）
    // 标题位置：x=12, y=12，字体大小14，行高1.5，两行文本
    // 标题高度：14 * 1.5 * 2 ≈ 42px，加上下边距，总高度约 50px
    const seatWidth = 80; // 矩形宽度，适应完整名字
    const seatHeight = 40; // 矩形高度
    const seatSpacing = 10; // 工位之间的间距
    const titleHeight = 50; // 标题区域高度
    const paddingTop = titleHeight + 10; // 顶部留白（标题下方10px间距，从房间左上角开始）
    const paddingLeft = 20; // 左侧留白
    const paddingRight = 20; // 右侧留白
    const paddingBottom = 20; // 底部留白

    // 计算每行每列可以放置多少个工位
    const availableWidth = room.width - paddingLeft - paddingRight;
    const availableHeight = room.height - paddingTop - paddingBottom;
    const colsPerRow = Math.floor(availableWidth / (seatWidth + seatSpacing));
    const maxRows = Math.floor(availableHeight / (seatHeight + seatSpacing));

    // 计算实际需要的行数
    const employeeCount = roomEmployees.length;
    const actualRows = Math.min(Math.ceil(employeeCount / colsPerRow), maxRows);

    // 计算满行的宽度
    const fullRowWidth = colsPerRow * (seatWidth + seatSpacing) - seatSpacing;
    // 计算基础左偏移量，使满行在可用区域内水平居中
    const baseOffsetX =
      paddingLeft + Math.max(0, (availableWidth - fullRowWidth) / 2);

    // 计算内容的总高度
    const contentHeight = actualRows * (seatHeight + seatSpacing) - seatSpacing;
    // 计算垂直偏移量，使内容在可用区域内垂直居中
    const offsetY =
      paddingTop + Math.max(0, (availableHeight - contentHeight) / 2);

    roomEmployees.forEach((employee, index) => {
      // 统一使用网格布局，所有行左对齐
      const row = Math.floor(index / colsPerRow);
      const col = index % colsPerRow;

      if (row >= maxRows) return; // 超出房间范围

      // 所有行统一使用左对齐
      const x = baseOffsetX + col * (seatWidth + seatSpacing);
      const y = offsetY + row * (seatHeight + seatSpacing);

      // 边界检查：确保员工不会超出房间范围
      const maxX = room.width - paddingRight - seatWidth;
      const maxY = room.height - paddingBottom - seatHeight;
      const minX = paddingLeft;
      const minY = paddingTop;

      if (x < minX || x > maxX || y < minY || y > maxY) {
        return;
      }

      const employeeGroup = renderEmployee(employee, { x, y });
      roomGroup.add(employeeGroup);
    });

    return roomGroup;
  };

  const renderEmployee = (
    employee: Employee,
    position: { x: number; y: number }
  ): Konva.Group => {
    const isHighlighted = props.highlightEmployeeId === employee.id;
    const employeeGroup = new Konva.Group({
      x: position.x,
      y: position.y,
    });

    // 员工矩形（横向矩形，适应完整名字）
    const seatWidth = 80;
    const seatHeight = 40;
    const employeeRect = new Konva.Rect({
      width: seatWidth,
      height: seatHeight,
      fill: isHighlighted
        ? OFFICE_MAP_THEME.employee.highlight
        : OFFICE_MAP_THEME.employee.normal,
      cornerRadius: 6,
      stroke: isHighlighted ? '#FFF' : OFFICE_MAP_THEME.borders.employee,
      strokeWidth: isHighlighted ? 2 : 1,
      shadowColor: isHighlighted
        ? OFFICE_MAP_THEME.employee.highlight
        : 'transparent',
      shadowBlur: isHighlighted ? 15 : 0,
      shadowOpacity: isHighlighted ? 0.8 : 0,
      shadowOffset: { x: 0, y: 0 },
    });

    employeeGroup.add(employeeRect);

    // 显示员工完整姓名
    if (employee.userName) {
      const nameText = new Konva.Text({
        x: 0,
        y: (seatHeight - 16) / 2, // 垂直居中
        text: employee.userName,
        fontSize: 14,
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
        fill: '#FFF',
        width: seatWidth,
        align: 'center',
        fontStyle: 'bold',
      });
      employeeGroup.add(nameText);
    }

    // 添加交互
    employeeGroup.on('click', () => {
      emit('employeeClick', employee);
    });

    employeeGroup.on('mouseenter', () => {
      employeeRect.strokeWidth(3);
      employeeRect.stroke('#409EFF');
      layer?.draw();
    });

    employeeGroup.on('mouseleave', () => {
      employeeRect.strokeWidth(isHighlighted ? 2 : 1);
      employeeRect.stroke(
        isHighlighted ? '#FFF' : OFFICE_MAP_THEME.borders.employee
      );
      layer?.draw();
    });

    // 存储employee信息到节点
    (employeeGroup as any).employeeData = employee;

    return employeeGroup;
  };

  const highlightEmployee = (employeeId: number) => {
    if (!layer || !stage || !contentGroup) return;

    // 清除之前的高亮
    if (highlightGroup) {
      rippleTweens.forEach((t) => t.destroy());
      rippleTweens = [];
      highlightGroup.destroy();
      highlightGroup = null;
    }

    // 查找目标员工 - 在容器组中查找
    let targetEmployeeGroup: Konva.Group | null = null;

    const groups = contentGroup.find('Group');
    for (let i = 0; i < groups.length; i += 1) {
      const node = groups[i];
      if (node instanceof Konva.Group) {
        const { employeeData } = node as any;
        if (employeeData && employeeData.id === employeeId) {
          targetEmployeeGroup = node;
          break;
        }
      }
    }

    if (!targetEmployeeGroup) return;

    // 获取员工相对于内容组的位置
    const absolutePos = targetEmployeeGroup.getAbsolutePosition();
    const contentAbsolutePos = contentGroup.getAbsolutePosition();
    const posX = absolutePos.x - contentAbsolutePos.x;
    const posY = absolutePos.y - contentAbsolutePos.y;

    // 创建高亮组（相对于容器组的位置）
    highlightGroup = new Konva.Group({
      x: posX + 40, // 工位中心 X
      y: posY + 20, // 工位中心 Y
      listening: false, // 不干扰鼠标事件
    });

    // 1. 创建多层波纹动画
    const createRipple = (delay: number) => {
      const ripple = new Konva.Circle({
        radius: 20,
        stroke: OFFICE_MAP_THEME.employee.highlight,
        strokeWidth: 2,
        opacity: 0.8,
      });
      highlightGroup?.add(ripple);

      const tween = new Konva.Tween({
        node: ripple,
        radius: 60,
        opacity: 0,
        duration: 1.5,
        delay,
        easing: Konva.Easings.EaseOut,
        onFinish: () => {
          if (highlightGroup) {
            ripple.radius(20);
            ripple.opacity(0.8);
            tween.play();
          }
        },
      });
      rippleTweens.push(tween);
      tween.play();
    };

    createRipple(0);
    createRipple(0.5);
    createRipple(1);

    // 2. 创建定位大头针 (Pin Icon)
    const pinGroup = new Konva.Group({
      y: -40, // 浮在工位上方
    });

    // 大头针形状
    const pinPath = new Konva.Path({
      data: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fill: OFFICE_MAP_THEME.employee.highlight,
      stroke: '#FFF',
      strokeWidth: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      offsetX: 12, // 居中
      offsetY: 22, // 底部对齐
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 5,
      shadowOffset: { x: 0, y: 3 },
    });

    pinGroup.add(pinPath);
    highlightGroup.add(pinGroup);

    // 3. 大头针上下浮动动画
    const pinTween = new Konva.Tween({
      node: pinGroup,
      y: -50,
      duration: 0.8,
      easing: Konva.Easings.EaseInOut,
      yoyo: true,
    });
    rippleTweens.push(pinTween);
    pinTween.play();

    // 将高亮组添加到容器组，这样它会随着舞台一起移动
    if (contentGroup) {
      contentGroup.add(highlightGroup);
      layer?.draw();
    }

    // 移动视口到工位位置
    if (canvasContainer.value) {
      const container = canvasContainer.value;
      // absolutePos 是相对于 stage 的位置
      const scrollLeft = absolutePos.x + 40 - container.clientWidth / 2;
      const scrollTop = absolutePos.y + 20 - container.clientHeight / 2;

      container.scrollTo({
        left: Math.max(
          0,
          Math.min(scrollLeft, stage.width() - container.clientWidth)
        ),
        top: Math.max(
          0,
          Math.min(scrollTop, stage.height() - container.clientHeight)
        ),
        behavior: 'smooth',
      });
    }
  };

  watch(
    () => [props.floorConfig, props.employees],
    () => {
      if (props.floorConfig) {
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
    () => props.highlightEmployeeId,
    (_employeeId) => {
      if (layer && stage) {
        // 当高亮人员 ID 变化时，重新渲染楼层，以确保所有方框颜色（isHighlighted 状态）正确更新
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
  .office-canvas-container {
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
