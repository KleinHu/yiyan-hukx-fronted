import request from '@/utils/request/request';
import type {
  ApiResponse,
  FloorConfig,
  FloorInfo,
  Employee,
  OfficeArea,
} from '@/api/hr/types';

/**
 * 办公室管理API
 */
const officeApi = {
  /**
   * 获取办公区域列表（包含楼层信息）
   * @returns 办公区域列表
   */
  getAreaList(): Promise<ApiResponse<OfficeArea[]>> {
    return request.get('/api/hr/office/areas');
  },

  /**
   * 获取楼层列表（兼容旧接口）
   * @returns 楼层列表
   */
  getFloorList(): Promise<ApiResponse<FloorInfo[]>> {
    return request.get('/api/hr/office/floors');
  },

  /**
   * 获取楼层配置
   * @param floor 楼层标识（格式：办公楼编码-楼层，如"232B-3F"）
   * @returns 楼层配置
   */
  getFloorConfig(floor: string): Promise<ApiResponse<FloorConfig>> {
    return request.get('/api/hr/office/floor-config', {
      params: { floor },
    });
  },

  /**
   * 获取指定楼层的员工列表
   * @param floor 楼层标识
   * @returns 员工列表
   */
  getEmployeesByFloor(floor: string): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/hr/office/employees', {
      params: { floor },
    });
  },

  /**
   * 搜索员工位置
   * @param userName 员工姓名
   * @returns 员工位置信息
   */
  searchEmployeeLocation(userName: string): Promise<
    ApiResponse<{
      employee: Employee;
      floor: string;
    } | null>
  > {
    return request.get('/api/hr/office/search-employee', {
      params: { userName },
    });
  },

  /**
   * 更新房间配置（管理员功能）
   * @param roomId 房间ID
   * @param config 房间配置
   * @returns 更新结果
   */
  updateRoomConfig(
    roomId: number,
    config: Partial<{
      roomName: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/office/rooms/${roomId}`, config);
  },

  /**
   * 保存楼层配置（管理员功能）
   * @param floor 楼层标识
   * @param config 楼层配置
   * @returns 保存结果
   */
  saveFloorConfig(
    floor: string,
    config: FloorConfig
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/office/floor-config?floor=${floor}`, config);
  },
};

export default officeApi;
