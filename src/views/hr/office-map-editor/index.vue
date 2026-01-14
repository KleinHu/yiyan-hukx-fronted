<template>
  <div class="office-layout-editor">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>
          <router-link to="/hr/office-map">人事地图</router-link>
        </a-breadcrumb-item>
        <a-breadcrumb-item>布局编辑</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header-actions">
        <a-button @click="goBack">
          <template #icon>
            <icon-left />
          </template>
          返回
        </a-button>
        <a-button type="primary" :loading="saving" @click="handleSave">
          <template #icon>
            <icon-save />
          </template>
          保存布局
        </a-button>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <a-card :bordered="false" class="toolbar-card">
        <a-row :gutter="16" align="center">
          <a-col :span="6">
            <area-floor-selector
              v-model="currentFloor"
              placeholder="请选择办公区域和楼层"
              :allow-clear="true"
              :allow-search="true"
              :show-path="true"
              @change="handleFloorChange"
            />
          </a-col>
          <a-col :span="18">
            <a-space>
              <a-button @click="handleAddRoom">
                <template #icon>
                  <icon-plus />
                </template>
                添加房间
              </a-button>
              <a-button @click="handleClearSelection">
                <template #icon>
                  <icon-close-circle />
                </template>
                清除选择
              </a-button>
              <a-button status="danger" @click="handleDeleteSelected">
                <template #icon>
                  <icon-delete />
                </template>
                删除选中
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 主内容区 -->
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧编辑画布 -->
        <a-col :span="18">
          <a-card :bordered="false" class="editor-card">
            <template #title>
              <div class="editor-title">
                <span>{{ floorConfig?.floorName || '请选择楼层' }}</span>
                <a-tag v-if="selectedRoom" color="blue">
                  已选择: {{ selectedRoom.roomName }}
                </a-tag>
              </div>
            </template>
            <a-spin :loading="loading" style="width: 100%; height: 100%">
              <office-canvas-editor
                v-if="floorConfig"
                :floor-config="floorConfig"
                :editable="true"
                @room-select="handleRoomSelect"
                @room-update="handleRoomUpdate"
                @room-delete="handleRoomDelete"
              />
              <a-empty v-else description="请选择楼层进行编辑" />
            </a-spin>
          </a-card>
        </a-col>

        <!-- 右侧属性面板 -->
        <a-col :span="6">
          <room-property-panel
            v-if="selectedRoom"
            :room="selectedRoom"
            @update="handleRoomPropertyUpdate"
          />
          <div v-else class="empty-panel">
            <a-card :bordered="false">
              <a-empty description="请选择房间进行编辑" />
            </a-card>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 添加房间弹窗 -->
    <room-config-modal
      v-model="roomModalVisible"
      :floor="currentFloor"
      @confirm="handleAddRoomConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import officeApi from '@/api/hr/office';
  import type { FloorConfig, OfficeRoom } from '@/api/hr/types';
  import AreaFloorSelector from '../office-map/components/area-floor-selector.vue';
  import OfficeCanvasEditor from './components/office-canvas-editor.vue';
  import RoomPropertyPanel from './components/room-property-panel.vue';
  import RoomConfigModal from './components/room-config-modal.vue';

  const router = useRouter();

  const loading = ref(false);
  const saving = ref(false);
  const currentFloor = ref<string>('');
  const floorConfig = ref<FloorConfig | null>(null);
  const selectedRoom = ref<OfficeRoom | null>(null);
  const roomModalVisible = ref(false);

  /**
   * 加载楼层配置
   */
  const loadFloorConfig = async (floor: string) => {
    if (!floor) return;

    try {
      loading.value = true;
      const response = await officeApi.getFloorConfig(floor);
      if (response.code === 200 && response.data) {
        floorConfig.value = response.data;
        selectedRoom.value = null;
      } else {
        Message.error(response.message || '获取楼层配置失败');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('获取楼层配置失败:', error);
      Message.error('获取楼层配置失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 处理楼层切换
   */
  const handleFloorChange = (floor: string) => {
    currentFloor.value = floor;
    loadFloorConfig(floor);
  };

  /**
   * 处理房间选择
   */
  const handleRoomSelect = (room: OfficeRoom) => {
    selectedRoom.value = room;
  };

  /**
   * 处理房间更新
   */
  const handleRoomUpdate = (room: OfficeRoom) => {
    if (!floorConfig.value) return;

    const index = floorConfig.value.rooms.findIndex((r) => r.id === room.id);
    if (index !== -1) {
      floorConfig.value.rooms[index] = { ...room };
      selectedRoom.value = floorConfig.value.rooms[index];
    }
  };

  /**
   * 处理房间删除
   */
  const handleRoomDelete = (roomId: number) => {
    if (!floorConfig.value) return;

    floorConfig.value.rooms = floorConfig.value.rooms.filter(
      (r) => r.id !== roomId
    );
    if (selectedRoom.value?.id === roomId) {
      selectedRoom.value = null;
    }
    Message.success('房间已删除');
  };

  /**
   * 处理房间属性更新
   */
  const handleRoomPropertyUpdate = (room: OfficeRoom) => {
    handleRoomUpdate(room);
  };

  /**
   * 添加房间
   */
  const handleAddRoom = () => {
    roomModalVisible.value = true;
  };

  /**
   * 添加房间确认
   */
  const handleAddRoomConfirm = (
    roomData: Omit<OfficeRoom, 'id' | 'floorCode'>
  ) => {
    if (!floorConfig.value) return;

    // 生成新ID
    const maxId = Math.max(...floorConfig.value.rooms.map((r) => r.id), 0);
    const newRoom: OfficeRoom = {
      ...roomData,
      id: maxId + 1,
      floorCode: currentFloor.value,
    };

    floorConfig.value.rooms.push(newRoom);
    selectedRoom.value = newRoom;
    roomModalVisible.value = false;
    Message.success('房间已添加');
  };

  /**
   * 清除选择
   */
  const handleClearSelection = () => {
    selectedRoom.value = null;
  };

  /**
   * 删除选中
   */
  const handleDeleteSelected = () => {
    if (!selectedRoom.value) {
      Message.warning('请先选择一个房间');
      return;
    }
    handleRoomDelete(selectedRoom.value.id);
  };

  /**
   * 保存布局
   */
  const handleSave = async () => {
    if (!floorConfig.value || !currentFloor.value) {
      Message.warning('请先选择楼层并编辑布局');
      return;
    }

    try {
      saving.value = true;
      // 保存整个楼层配置
      const response = await officeApi.saveFloorConfig(
        currentFloor.value,
        floorConfig.value
      );
      if (response.code === 200) {
        Message.success('布局保存成功');
      } else {
        Message.error(response.message || '保存布局失败');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('保存布局失败:', error);
      Message.error('保存布局失败');
    } finally {
      saving.value = false;
    }
  };

  /**
   * 返回
   */
  const goBack = () => {
    router.go(-1);
  };

  onMounted(() => {
    // 级联选择器会自动加载并选择第一个楼层
  });
</script>

<script lang="ts">
  export default {
    name: 'OfficeLayoutEditor',
  };
</script>

<style scoped lang="less">
  .office-layout-editor {
    padding: 16px;
    background-color: var(--color-fill-2);
    min-height: calc(100vh - 60px);

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .toolbar {
      margin-bottom: 16px;

      .toolbar-card {
        :deep(.arco-card-body) {
          padding: 16px;
        }
      }
    }

    .content-area {
      .editor-card {
        height: calc(100vh - 320px);
        min-height: 600px;

        :deep(.arco-card-body) {
          padding: 16px;
          height: calc(100% - 57px);
        }

        .editor-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }

      .empty-panel {
        height: calc(100vh - 320px);
        min-height: 600px;
      }
    }
  }
</style>
