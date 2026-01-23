import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import jobRankApi from '@/api/hr/job-rank';
import type { JobRank } from '@/api/hr/types';

/**
 * 职级管理 Hook
 * @param options 配置选项
 * @returns 职级相关数据和方法
 */
function useJobRank(options?: {
  autoLoad?: boolean; // 是否自动加载
}) {
  const { autoLoad = true } = options || {};

  const loading = ref(false);
  const jobRankList = ref<JobRank[]>([]);
  const currentJobRank = ref<JobRank | null>(null);

  /**
   * 获取职级列表
   */
  const fetchJobRankList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await jobRankApi.getJobRankList();
      jobRankList.value = data || [];
    } catch (error) {
      console.error('获取职级列表失败:', error);
      Message.error('获取职级列表失败');
      jobRankList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取职级详情
   * @param rankId 职级ID
   */
  const fetchJobRankDetail = async (rankId: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await jobRankApi.getJobRankById(rankId);
      currentJobRank.value = data || null;
    } catch (error) {
      console.error('获取职级详情失败:', error);
      Message.error('获取职级详情失败');
      currentJobRank.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增职级
   * @param data 职级信息
   * @returns 是否成功
   */
  const createJobRank = async (data: Partial<JobRank>): Promise<boolean> => {
    try {
      loading.value = true;
      await jobRankApi.createJobRank(data);
      Message.success('新增职级成功');
      await fetchJobRankList();
      return true;
    } catch (error) {
      console.error('新增职级失败:', error);
      Message.error('新增职级失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新职级信息
   * @param rankId 职级ID
   * @param data 职级信息
   * @returns 是否成功
   */
  const updateJobRank = async (
    rankId: string,
    data: Partial<JobRank>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await jobRankApi.updateJobRank(rankId, data);
      Message.success('更新职级成功');
      await fetchJobRankList();
      if (currentJobRank.value?.rankId === rankId) {
        await fetchJobRankDetail(rankId);
      }
      return true;
    } catch (error) {
      console.error('更新职级失败:', error);
      Message.error('更新职级失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除职级
   * @param rankId 职级ID
   * @returns 是否成功
   */
  const deleteJobRank = async (rankId: string): Promise<boolean> => {
    try {
      loading.value = true;
      await jobRankApi.deleteJobRank(rankId);
      Message.success('删除职级成功');
      await fetchJobRankList();
      if (currentJobRank.value?.rankId === rankId) {
        currentJobRank.value = null;
      }
      return true;
    } catch (error) {
      console.error('删除职级失败:', error);
      Message.error('删除职级失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新职级列表
   */
  const refresh = (): void => {
    fetchJobRankList();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchJobRankList();
    });
  }

  return {
    loading,
    jobRankList,
    currentJobRank,
    fetchJobRankList,
    fetchJobRankDetail,
    createJobRank,
    updateJobRank,
    deleteJobRank,
    refresh,
  };
}

export default useJobRank;
