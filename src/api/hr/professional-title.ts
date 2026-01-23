import request from '@/utils/request/request';
import type { ApiResponse } from '@/api/hr/types';
import type { ProfessionalTitle } from '@/api/hr/types';

/**
 * 职称管理 API
 */
const professionalTitleApi = {
  /**
   * 获取职称列表
   */
  getProfessionalTitleList(): Promise<ApiResponse<ProfessionalTitle[]>> {
    return request.get('/api/240/hr/professional-titles');
  },

  /**
   * 获取单个职称详情
   */
  getProfessionalTitleDetail(
    titleId: string
  ): Promise<ApiResponse<ProfessionalTitle>> {
    return request.get(`/api/240/hr/professional-titles/${titleId}`);
  },

  /**
   * 创建职称
   */
  createProfessionalTitle(
    data: Partial<ProfessionalTitle>
  ): Promise<ApiResponse<ProfessionalTitle>> {
    return request.post('/api/240/hr/professional-titles', data);
  },

  /**
   * 更新职称
   */
  updateProfessionalTitle(
    titleId: string,
    data: Partial<ProfessionalTitle>
  ): Promise<ApiResponse<ProfessionalTitle>> {
    return request.put(`/api/240/hr/professional-titles/${titleId}`, data);
  },

  /**
   * 删除职称
   */
  deleteProfessionalTitle(titleId: string): Promise<ApiResponse<void>> {
    return request.delete(`/api/240/hr/professional-titles/${titleId}`);
  },
};

export default professionalTitleApi;
