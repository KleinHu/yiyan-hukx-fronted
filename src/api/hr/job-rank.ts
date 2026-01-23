import request from '@/utils/request/request';
import type { JobRank } from '@/api/hr/types';

/**
 * 职级管理API
 */
const jobRankApi = {
  /**
   * 获取职级列表
   * @returns 职级列表
   */
  getJobRankList() {
    return request.get<JobRank[]>('/api/240/hr/job-ranks');
  },

  /**
   * 获取职级详情
   * @param rankId 职级ID
   * @returns 职级详情
   */
  getJobRankById(rankId: string) {
    return request.get<JobRank>(`/api/240/hr/job-ranks/${rankId}`);
  },

  /**
   * 新增职级
   * @param data 职级信息
   * @returns 新增结果
   */
  createJobRank(data: Partial<JobRank>) {
    return request.post<string>('/api/240/hr/job-ranks', data);
  },

  /**
   * 更新职级信息
   * @param rankId 职级ID
   * @param data 职级信息
   * @returns 更新结果
   */
  updateJobRank(rankId: string, data: Partial<JobRank>) {
    return request.put<boolean>(`/api/240/hr/job-ranks/${rankId}`, data);
  },

  /**
   * 删除职级
   * @param rankId 职级ID
   * @returns 删除结果
   */
  deleteJobRank(rankId: string) {
    return request.delete<boolean>(`/api/240/hr/job-ranks/${rankId}`);
  },
};

export default jobRankApi;
