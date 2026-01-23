<template>
  <div class="office-map">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>人事地图</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 主内容区 -->
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 左侧：位置树 -->
        <a-col :span="5">
          <a-card :bordered="false" class="location-tree-card">
            <template #title>
              <div class="card-title">
                <icon-location />
                <span>办公位置</span>
              </div>
            </template>
            <template #extra>
              <a-button
                type="primary"
                size="small"
                @click="showAddLocationModal"
              >
                <template #icon>
                  <icon-plus />
                </template>
                新增
              </a-button>
            </template>
            <a-spin :loading="treeLoading" style="width: 100%">
              <a-tree
                v-if="locationTreeData.length > 0"
                :data="locationTreeData"
                :default-expand-all="true"
                :selected-keys="selectedTreeKeys"
                :show-line="true"
                @select="handleTreeSelect"
              >
                <template #title="nodeData">
                  {{ nodeData.title }}
                </template>
                <template #extra="nodeData">
                  <div
                    v-if="nodeData.isLeaf"
                    class="tree-node-actions"
                    @click.stop
                  >
                    <a-button
                      type="text"
                      size="mini"
                      @click="handleEditFloor(nodeData)"
                    >
                      <template #icon>
                        <icon-edit />
                      </template>
                    </a-button>
                    <a-button
                      type="text"
                      size="mini"
                      status="danger"
                      @click="handleDeleteFloor(nodeData)"
                    >
                      <template #icon>
                        <icon-delete />
                      </template>
                    </a-button>
                  </div>
                </template>
              </a-tree>
              <a-empty v-else description="暂无位置数据" />
            </a-spin>
          </a-card>
        </a-col>

        <!-- 右侧：地图画布 -->
        <a-col :span="19">
          <a-card :bordered="false" class="map-card">
            <template #title>
              <div class="map-title">
                <span>人事地图</span>
                <span v-if="currentFloorName" class="floor-name">
                  - {{ currentFloorName }}
                </span>
              </div>
            </template>
            <template #extra>
              <a-space>
                <a-button
                  size="small"
                  :disabled="!floorConfig"
                  @click="handleResetView"
                >
                  <template #icon>
                    <icon-refresh />
                  </template>
                  重置视图
                </a-button>
                <a-button size="small" type="primary" @click="goToEditor">
                  <template #icon>
                    <icon-settings />
                  </template>
                  编辑布局
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  :disabled="!floorConfig"
                  :title="isFullscreen ? '退出全屏' : '全屏显示'"
                  @click="handleFullscreen"
                >
                  <template #icon>
                    <icon-fullscreen v-if="!isFullscreen" />
                    <icon-fullscreen-exit v-else />
                  </template>
                </a-button>
              </a-space>
            </template>
            <div class="map-content">
              <a-spin :loading="loading" style="width: 100%; height: 100%">
                <div v-if="floorConfig" class="canvas-wrapper">
                  <!-- 图例浮层 -->
                  <div class="legend-overlay">
                    <div class="legend-title">房间类型</div>
                    <div class="legend-items">
                      <div
                        v-for="item in roomTypes"
                        :key="item.type"
                        class="legend-item"
                      >
                        <div
                          class="legend-color"
                          :style="{ backgroundColor: item.color }"
                        />
                        <span class="legend-label">{{ item.label }}</span>
                      </div>
                    </div>
                  </div>
                  <office-canvas
                    :floor-config="floorConfig"
                    :employees="employees"
                    :highlight-employee-id="highlightEmployeeId"
                    @employee-click="handleEmployeeClick"
                  />
                </div>
                <div v-else class="empty-map">
                  <a-empty description="请从左侧选择楼层查看地图">
                    <template #image>
                      <icon-location style="font-size: 64px; color: #c9cdd4" />
                    </template>
                  </a-empty>
                </div>
              </a-spin>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 员工详情抽屉 -->
    <employee-detail-drawer
      :visible="drawerVisible"
      :user-code="selectedEmployee?.userCode"
      @update:visible="drawerVisible = $event"
    />

    <!-- 全屏模态框 -->
    <a-modal
      v-model:visible="isFullscreen"
      :footer="false"
      :title="floorConfig ? `${floorConfig.floorName} - 人事地图` : '人事地图'"
      :width="'100vw'"
      :style="{ top: 0, paddingBottom: 0, maxWidth: '100vw' }"
      :body-style="{
        padding: 0,
        height: 'calc(100vh - 57px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }"
      class="fullscreen-modal"
      unmount-on-close
      @cancel="handleExitFullscreen"
    >
      <div class="fullscreen-canvas-wrapper">
        <a-spin :loading="loading" style="width: 100%; height: 100%">
          <div v-if="floorConfig" class="canvas-wrapper fullscreen">
            <!-- 全屏模式下的图例浮层 -->
            <div class="legend-overlay">
              <div class="legend-title">房间类型</div>
              <div class="legend-items">
                <div
                  v-for="item in roomTypes"
                  :key="item.type"
                  class="legend-item"
                >
                  <div
                    class="legend-color"
                    :style="{ backgroundColor: item.color }"
                  />
                  <span class="legend-label">{{ item.label }}</span>
                </div>
              </div>
            </div>
            <office-canvas
              :key="`fullscreen-${isFullscreen}`"
              :floor-config="floorConfig"
              :employees="employees"
              :highlight-employee-id="highlightEmployeeId"
              @employee-click="handleEmployeeClick"
            />
          </div>
          <a-empty v-else description="请选择楼层查看地图" />
        </a-spin>
      </div>
    </a-modal>

    <!-- 新增办公位置弹窗 -->
    <a-modal
      v-model:visible="addLocationVisible"
      title="新增办公位置"
      :width="500"
      @ok="handleAddLocation"
      @cancel="resetAddLocationForm"
    >
      <a-form
        ref="addLocationFormRef"
        :model="addLocationForm"
        :rules="addLocationRules"
        layout="vertical"
      >
        <a-form-item field="buildingCode" label="办公楼编码">
          <a-input
            v-model="addLocationForm.buildingCode"
            placeholder="请输入办公楼编码，如：201、232B"
          />
        </a-form-item>
        <a-form-item field="buildingName" label="办公楼名称">
          <a-input
            v-model="addLocationForm.buildingName"
            placeholder="请输入办公楼名称，如：研发大楼"
          />
        </a-form-item>
        <a-form-item field="floorNumber" label="楼层">
          <a-input-number
            v-model="addLocationForm.floorNumber"
            :min="1"
            :max="99"
            placeholder="请输入楼层数"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item field="floorName" label="楼层名称">
          <a-input
            v-model="addLocationForm.floorName"
            placeholder="请输入楼层名称，如：一层、二层"
          />
        </a-form-item>
      </a-form>
      <a-alert type="info" style="margin-top: 12px">
        创建后可在"编辑布局"中设计房间布局
      </a-alert>
    </a-modal>

    <!-- 编辑办公位置弹窗 -->
    <a-modal
      v-model:visible="editLocationVisible"
      title="编辑办公位置"
      :width="500"
      @ok="handleEditLocation"
      @cancel="resetEditLocationForm"
    >
      <a-form
        ref="editLocationFormRef"
        :model="editLocationForm"
        :rules="editLocationRules"
        layout="vertical"
      >
        <a-form-item field="buildingCode" label="办公楼编码">
          <a-input
            v-model="editLocationForm.buildingCode"
            placeholder="请输入办公楼编码，如：201、232B"
          />
        </a-form-item>
        <a-form-item field="buildingName" label="办公楼名称">
          <a-input
            v-model="editLocationForm.buildingName"
            placeholder="请输入办公楼名称，如：研发大楼"
          />
        </a-form-item>
        <a-form-item field="floorNumber" label="楼层">
          <a-input-number
            v-model="editLocationForm.floorNumber"
            :min="1"
            :max="99"
            placeholder="请输入楼层数"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item field="floorName" label="楼层名称">
          <a-input
            v-model="editLocationForm.floorName"
            placeholder="请输入楼层名称，如：一层、二层"
          />
        </a-form-item>
      </a-form>
      <a-alert type="warning" style="margin-top: 12px">
        修改楼层编码或楼层号后，房间配置中的楼层标识也会相应更新
      </a-alert>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message, Modal } from '@arco-design/web-vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import useOffice from '@/hooks/hr/office';
  import type { FloorConfig, Employee } from '@/api/hr/types';
  import { RoomType } from '@/api/hr/types';
  import OfficeCanvas from './components/office-canvas.vue';
  import EmployeeDetailDrawer from '../employee/common/employee-detail-drawer.vue';

  // 房间类型图例
  const roomTypes = [
    { type: RoomType.OFFICE, label: '办公室', color: '#E3F2FD' },
    { type: RoomType.MEETING_ROOM, label: '会议室', color: '#F3E5F5' },
    { type: RoomType.BREAK_ROOM, label: '休息室', color: '#E8F5E9' },
    { type: RoomType.STORAGE, label: '储藏室', color: '#FFF3E0' },
    { type: RoomType.BATHROOM, label: '卫生间', color: '#F5F5F5' },
    { type: RoomType.CORRIDOR, label: '走廊', color: '#ECEFF1' },
  ];

  // 树节点接口
  interface TreeNode {
    key: string;
    title: string;
    isLeaf: boolean;
    floorId?: number; // 楼层ID（仅叶子节点有）
    children?: TreeNode[];
  }

  const router = useRouter();

  // 使用 Hook
  const {
    loading,
    areaList,
    currentFloorConfig: floorConfig,
    employeesByFloor: employees,
    fetchAreaList,
    fetchFloorConfig,
    fetchEmployeesByFloor,
    saveFloorConfig,
    deleteFloorConfig,
  } = useOffice();

  // 状态数据
  const treeLoading = ref(false);
  const currentFloor = ref<string>('');
  const highlightEmployeeId = ref<number | null>(null);
  const drawerVisible = ref(false);
  const selectedEmployee = ref<Employee | null>(null);
  const isFullscreen = ref(false);
  const selectedTreeKeys = ref<string[]>([]);

  // 新增办公位置相关
  const addLocationVisible = ref(false);
  const addLocationFormRef = ref<FormInstance>();
  const addLocationForm = reactive({
    buildingCode: '',
    buildingName: '',
    floorNumber: 1,
    floorName: '',
  });
  const addLocationRules = {
    buildingCode: [{ required: true, message: '请输入办公楼编码' }],
    buildingName: [{ required: true, message: '请输入办公楼名称' }],
    floorNumber: [{ required: true, message: '请输入楼层' }],
    floorName: [{ required: true, message: '请输入楼层名称' }],
  };

  // 编辑办公位置相关
  const editLocationVisible = ref(false);
  const editLocationFormRef = ref<FormInstance>();
  const editLocationForm = reactive({
    floorCode: '',
    buildingCode: '',
    buildingName: '',
    floorNumber: 1,
    floorName: '',
  });
  const editLocationRules = {
    buildingCode: [{ required: true, message: '请输入办公楼编码' }],
    buildingName: [{ required: true, message: '请输入办公楼名称' }],
    floorNumber: [{ required: true, message: '请输入楼层' }],
    floorName: [{ required: true, message: '请输入楼层名称' }],
  };

  // 当前楼层名称
  const currentFloorName = computed(() => {
    return floorConfig.value?.floorName || '';
  });

  // 将办公区域数据转换为树形结构
  const locationTreeData = computed<TreeNode[]>(() => {
    return areaList.value.map((area) => ({
      key: area.buildingCode,
      title: `🏢 ${area.buildingName || `${area.buildingCode}号楼`}`,
      isLeaf: false,
      children: area.floors.map((floor) => ({
        key: floor.floor,
        title: `📍 ${floor.floorName} (${floor.employeeCount}人)`,
        isLeaf: true,
        floorId: floor.id, // 保存楼层ID
      })),
    }));
  });

  /**
   * 加载办公区域列表
   */
  const loadAreaList = async (): Promise<void> => {
    try {
      treeLoading.value = true;
      await fetchAreaList();
      // 页面初始化时保持未选中状态，不自动加载楼层
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('获取办公区域列表失败:', error);
    } finally {
      treeLoading.value = false;
    }
  };

  /**
   * 加载楼层配置
   */
  const loadFloorConfig = async (floor: string): Promise<void> => {
    if (!floor) {
      return;
    }

    try {
      await Promise.all([
        fetchFloorConfig(floor),
        fetchEmployeesByFloor(floor),
      ]);
    } catch (error) {
      // 错误已在Hook中处理
    }
  };

  /**
   * 处理树节点选择
   */
  const handleTreeSelect = async (
    selectedKeys: string[],
    data: { selected: boolean; selectedNodes: any[]; node: any }
  ): Promise<void> => {
    if (selectedKeys.length === 0) return;

    const nodeData = data.node;
    // 只有点击叶子节点（楼层）才加载地图
    // 叶子节点的 key 格式为 "buildingCode-floorF"，包含 "-" 和 "F"
    const isLeaf = nodeData?.isLeaf ?? selectedKeys[0].includes('F');

    if (isLeaf) {
      const floor = selectedKeys[0];
      if (floor !== currentFloor.value) {
        currentFloor.value = floor;
        selectedTreeKeys.value = [floor];
        highlightEmployeeId.value = null;
        await loadFloorConfig(floor);
      }
    }
  };

  /**
   * 处理员工点击
   */
  const handleEmployeeClick = (employee: Employee) => {
    selectedEmployee.value = employee;
    drawerVisible.value = true;
  };

  /**
   * 重置视图
   */
  const handleResetView = () => {
    highlightEmployeeId.value = null;
    if (currentFloor.value) {
      loadFloorConfig(currentFloor.value);
    }
  };

  /**
   * 跳转到布局编辑器
   */
  const goToEditor = () => {
    if (!currentFloor.value) {
      Message.warning('请先选择一个楼层');
      return;
    }
    router.push({
      name: 'hr-office-map-edit-20260121',
      query: {
        floor: currentFloor.value,
      },
    });
  };

  /**
   * 全屏显示
   */
  const handleFullscreen = () => {
    isFullscreen.value = true;
  };

  /**
   * 退出全屏
   */
  const handleExitFullscreen = () => {
    isFullscreen.value = false;
  };

  /**
   * 显示新增办公位置弹窗
   */
  const showAddLocationModal = () => {
    addLocationVisible.value = true;
  };

  /**
   * 重置新增办公位置表单
   */
  const resetAddLocationForm = () => {
    addLocationForm.buildingCode = '';
    addLocationForm.buildingName = '';
    addLocationForm.floorNumber = 1;
    addLocationForm.floorName = '';
    addLocationFormRef.value?.resetFields();
  };

  /**
   * 提交新增办公位置
   */
  const handleAddLocation = async () => {
    try {
      const valid = await addLocationFormRef.value?.validate();
      if (valid) return;

      // 构建楼层标识
      const floorCode = `${addLocationForm.buildingCode}-${addLocationForm.floorNumber}F`;

      // 构建楼层配置
      const newFloorConfig: FloorConfig = {
        floor: floorCode,
        floorName: addLocationForm.floorName,
        buildingCode: addLocationForm.buildingCode,
        buildingName: addLocationForm.buildingName,
        floorNumber: addLocationForm.floorNumber,
        canvasWidth: 1200,
        canvasHeight: 800,
        rooms: [],
      };

      // 调用Hook保存
      const success = await saveFloorConfig(floorCode, newFloorConfig);
      if (success) {
        addLocationVisible.value = false;
        resetAddLocationForm();
        // 重新加载位置列表
        await loadAreaList();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('新增办公位置失败:', error);
      Message.error('新增办公位置失败');
    }
  };

  /**
   * 编辑楼层
   */
  const handleEditFloor = (nodeData: TreeNode) => {
    if (!nodeData.isLeaf) return;

    const floorCode = nodeData.key;
    // 从areaList中找到对应的楼层信息
    const area = areaList.value.find((a) =>
      a.floors.some((f) => f.floor === floorCode)
    );
    if (area) {
      const floor = area.floors.find((f) => f.floor === floorCode);
      if (floor) {
        editLocationForm.floorCode = floorCode;
        editLocationForm.buildingCode = floor.buildingCode;
        editLocationForm.buildingName = area.buildingName || '';
        editLocationForm.floorNumber = floor.floorNumber;
        editLocationForm.floorName = floor.floorName;
        editLocationVisible.value = true;
      }
    }
  };

  /**
   * 重置编辑表单
   */
  const resetEditLocationForm = () => {
    editLocationForm.floorCode = '';
    editLocationForm.buildingCode = '';
    editLocationForm.buildingName = '';
    editLocationForm.floorNumber = 1;
    editLocationForm.floorName = '';
    editLocationFormRef.value?.resetFields();
  };

  /**
   * 提交编辑办公位置
   */
  const handleEditLocation = async () => {
    try {
      const valid = await editLocationFormRef.value?.validate();
      if (valid) return;

      // 构建新的楼层标识
      const newFloorCode = `${editLocationForm.buildingCode}-${editLocationForm.floorNumber}F`;
      const oldFloorCode = editLocationForm.floorCode;

      // 获取当前楼层配置
      await fetchFloorConfig(oldFloorCode);
      if (!floorConfig.value) {
        return;
      }

      const floorConfigData = { ...floorConfig.value };
      // 更新楼层信息
      floorConfigData.floor = newFloorCode;
      floorConfigData.floorName = editLocationForm.floorName;
      floorConfigData.buildingCode = editLocationForm.buildingCode;
      floorConfigData.buildingName = editLocationForm.buildingName;
      floorConfigData.floorNumber = editLocationForm.floorNumber;

      // 如果楼层代码改变，需要更新房间的floorCode
      if (newFloorCode !== oldFloorCode) {
        floorConfigData.rooms.forEach((room) => {
          room.floorCode = newFloorCode;
        });
        // 先保存新楼层配置
        const saveSuccess = await saveFloorConfig(
          newFloorCode,
          floorConfigData
        );
        if (!saveSuccess) {
          return;
        }
        // 然后删除旧楼层配置（需要先找到旧楼层的ID）
        const oldArea = areaList.value.find((a) =>
          a.floors.some((f) => f.floor === oldFloorCode)
        );
        const oldFloor = oldArea?.floors.find((f) => f.floor === oldFloorCode);
        if (oldFloor?.id) {
          await deleteFloorConfig(oldFloor.id);
        }
      } else {
        // 楼层代码未改变，直接保存
        const saveSuccess = await saveFloorConfig(
          oldFloorCode,
          floorConfigData
        );
        if (!saveSuccess) {
          return;
        }
      }
      editLocationVisible.value = false;
      resetEditLocationForm();
      // 重新加载位置列表
      await loadAreaList();
      // 如果当前选中的是编辑的楼层，需要重新加载
      if (currentFloor.value === oldFloorCode) {
        if (newFloorCode !== oldFloorCode) {
          currentFloor.value = newFloorCode;
          selectedTreeKeys.value = [newFloorCode];
        }
        await loadFloorConfig(newFloorCode);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('编辑办公位置失败:', error);
      Message.error('编辑办公位置失败');
    }
  };

  /**
   * 删除楼层
   */
  const handleDeleteFloor = (nodeData: TreeNode) => {
    if (!nodeData.isLeaf || !nodeData.floorId) return;

    const { floorId, key: floorCode } = nodeData;
    // 从areaList中找到对应的楼层信息
    const area = areaList.value.find((a) =>
      a.floors.some((f) => f.floor === floorCode)
    );
    const floor = area?.floors.find((f) => f.floor === floorCode);
    const floorName = floor?.floorName || '';

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除楼层"${floorName}"吗？删除后该楼层的所有房间配置也将被删除，此操作不可恢复。`,
      okText: '确定删除',
      cancelText: '取消',
      okButtonProps: {
        status: 'danger',
      },
      onOk: async () => {
        try {
          // 调用Hook删除楼层（通过ID）
          const success = await deleteFloorConfig(floorId);
          if (success) {
            // 如果当前选中的是被删除的楼层，清空选择
            if (currentFloor.value === floorCode) {
              currentFloor.value = '';
              selectedTreeKeys.value = [];
            }
            // 重新加载位置列表
            await loadAreaList();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('删除楼层失败:', error);
          Message.error('删除楼层失败');
        }
      },
    });
  };

  onMounted(() => {
    loadAreaList();
  });
</script>

<script lang="ts">
  export default {
    name: 'hr-map-office-20260121',
  };
</script>

<style scoped lang="less">
  .office-map {
    padding: 12px 20px;
    background-color: #f4f7f9;
    min-height: calc(100vh - 60px);

    .page-header {
      margin-bottom: 16px;
      padding-left: 4px;

      :deep(.arco-breadcrumb-item) {
        color: #86909c;
        &:last-child {
          color: #1d2129;
          font-weight: 500;
        }
      }
    }

    :deep(.arco-card) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .content-area {
      .location-tree-card {
        height: calc(100vh - 120px);
        min-height: 500px;

        :deep(.arco-card-body) {
          padding: 12px;
          height: calc(100% - 49px);
          overflow: auto;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;

          svg {
            color: var(--color-primary);
          }
        }

        :deep(.arco-tree) {
          .arco-tree-node {
            padding: 4px 0;

            &:hover {
              background-color: var(--color-fill-2);

              .tree-node-actions {
                opacity: 1;
              }
            }
          }

          .arco-tree-node-selected {
            background-color: var(--color-primary-light-1);
          }

          .arco-tree-node-title {
            font-size: 14px;
          }
        }

        .tree-node-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;

          .arco-btn {
            padding: 2px 4px;
            height: 20px;
            font-size: 12px;
          }
        }
      }

      .map-card {
        height: calc(100vh - 120px);
        min-height: 500px;

        :deep(.arco-card-body) {
          padding: 0;
          height: calc(100% - 49px);
          overflow: hidden;
        }

        .map-title {
          display: flex;
          align-items: center;
          gap: 4px;

          .floor-name {
            color: var(--color-text-3);
            font-weight: normal;
          }
        }

        .map-content {
          height: 100%;
          width: 100%;
        }

        .empty-map {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafbfc;
        }

        .canvas-wrapper {
          position: relative;
          height: 100%;
          width: 100%;

          .legend-overlay {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 10;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            min-width: 120px;

            .legend-title {
              font-size: 13px;
              font-weight: 600;
              color: var(--color-text-1);
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid var(--color-border-2);
            }

            .legend-items {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .legend-color {
              width: 20px;
              height: 20px;
              border-radius: 4px;
              border: 1px solid rgba(0, 0, 0, 0.1);
              flex-shrink: 0;
            }

            .legend-label {
              font-size: 12px;
              color: var(--color-text-2);
            }
          }
        }
      }

      :deep(.office-canvas-container) {
        height: 100%;
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .office-map {
      .content-area {
        .location-tree-card,
        .map-card {
          height: calc(100vh - 140px);
          min-height: 400px;
        }
      }
    }
  }

  @media (max-width: 992px) {
    .office-map {
      .content-area {
        .arco-row {
          flex-direction: column;

          .arco-col {
            width: 100%;
            max-width: 100%;
            flex: none;
            margin-bottom: 16px;
          }
        }

        .location-tree-card {
          height: auto;
          min-height: auto;
          max-height: 300px;

          :deep(.arco-card-body) {
            max-height: 250px;
          }
        }

        .map-card {
          height: calc(100vh - 360px);
          min-height: 400px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .office-map {
      padding: 12px;
    }
  }

  // 全屏模态框样式
  :deep(.fullscreen-modal) {
    .arco-modal {
      max-width: 100vw !important;
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      padding: 0 !important;
    }

    .arco-modal-container {
      width: 100vw !important;
      height: 100vh !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .arco-modal-header {
      padding: 16px 24px;
      flex-shrink: 0;
    }

    .arco-modal-body {
      flex: 1;
      overflow: auto;
      padding: 0 !important;
      min-height: 0;
    }
  }

  .fullscreen-canvas-wrapper {
    width: 100%;
    height: 100%;
    min-height: 100%;
    background: var(--color-fill-2);
    position: relative;
    overflow: auto;

    .canvas-wrapper.fullscreen {
      height: 100%;
      width: 100%;
      min-height: 100%;

      .legend-overlay {
        top: 16px;
        right: 16px;
      }
    }

    :deep(.office-canvas-container) {
      height: 100%;
      width: 100%;
      min-height: 100%;
      overflow: auto;
    }

    :deep(.arco-spin) {
      width: 100%;
      height: 100%;
      min-height: 100%;
    }
  }
</style>
