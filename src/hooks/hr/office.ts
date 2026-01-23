import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import officeApi from '@/api/hr/office';
import type {
  FloorConfig,
  FloorInfo,
  Employee,
  OfficeArea,
} from '@/api/hr/types';

/**
 * 办公室管理 Hook
 * @param options 配置选项
 * @returns 办公室相关数据和方法
 */
function useOffice() {
  const loading = ref(false);
  const areaList = ref<OfficeArea[]>([]);
  const floorList = ref<FloorInfo[]>([]);
  const currentFloorConfig = ref<FloorConfig | null>(null);
  const employeesByFloor = ref<Employee[]>([]);

  /**
   * 获取办公区域列表
   */
  const fetchAreaList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await officeApi.getAreaList();
      areaList.value = data || [];
    } catch (error) {
      console.error('获取办公区域列表失败:', error);
      Message.error('获取办公区域列表失败');
      areaList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取楼层列表
   */
  const fetchFloorList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await officeApi.getFloorList();
      floorList.value = data || [];
    } catch (error) {
      console.error('获取楼层列表失败:', error);
      Message.error('获取楼层列表失败');
      floorList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取楼层配置
   * @param floor 楼层标识
   */
  const fetchFloorConfig = async (floor: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await officeApi.getFloorConfig(floor);
      currentFloorConfig.value = data || null;
    } catch (error) {
      console.error('获取楼层配置失败:', error);
      Message.error('获取楼层配置失败');
      currentFloorConfig.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取指定楼层的员工列表
   * @param floor 楼层标识
   */
  const fetchEmployeesByFloor = async (floor: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await officeApi.getEmployeesByFloor(floor);
      employeesByFloor.value = data || [];
    } catch (error) {
      console.error('获取楼层员工列表失败:', error);
      Message.error('获取楼层员工列表失败');
      employeesByFloor.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 搜索员工位置
   * @param userName 员工姓名
   * @returns 员工位置信息
   */
  const searchEmployeeLocation = async (
    userName: string
  ): Promise<{ employee: Employee; floor: string } | null> => {
    try {
      loading.value = true;
      const { data } = await officeApi.searchEmployeeLocation(userName);
      return data || null;
    } catch (error) {
      console.error('搜索员工位置失败:', error);
      Message.error('搜索员工位置失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新房间配置
   * @param roomId 房间ID
   * @param config 房间配置
   * @returns 是否成功
   */
  const updateRoomConfig = async (
    roomId: number,
    config: Partial<{
      roomName: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await officeApi.updateRoomConfig(roomId, config);
      Message.success('更新房间配置成功');
      return true;
    } catch (error) {
      console.error('更新房间配置失败:', error);
      Message.error('更新房间配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存楼层配置
   * @param floor 楼层标识
   * @param config 楼层配置
   * @returns 是否成功
   */
  const saveFloorConfig = async (
    floor: string,
    config: FloorConfig
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await officeApi.saveFloorConfig(floor, config);
      Message.success('保存楼层配置成功');
      await fetchFloorConfig(floor);
      return true;
    } catch (error) {
      console.error('保存楼层配置失败:', error);
      Message.error('保存楼层配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除楼层配置
   * @param id 楼层ID
   * @returns 是否成功
   */
  const deleteFloorConfig = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await officeApi.deleteFloorConfig(id);
      Message.success('删除楼层配置成功');
      return true;
    } catch (error) {
      console.error('删除楼层配置失败:', error);
      Message.error('删除楼层配置失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    areaList,
    floorList,
    currentFloorConfig,
    employeesByFloor,
    fetchAreaList,
    fetchFloorList,
    fetchFloorConfig,
    fetchEmployeesByFloor,
    searchEmployeeLocation,
    updateRoomConfig,
    saveFloorConfig,
    deleteFloorConfig,
  };
}

export default useOffice;
