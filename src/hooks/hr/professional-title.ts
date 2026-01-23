import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import professionalTitleApi from '@/api/hr/professional-title';
import type { ProfessionalTitle } from '@/api/hr/types';

/**
 * 职称管理 Hook
 * @param options 配置选项
 * @returns 职称相关数据和方法
 */
function useProfessionalTitle(options?: {
  autoLoad?: boolean; // 是否自动加载
}) {
  const { autoLoad = true } = options || {};

  const loading = ref(false);
  const professionalTitleList = ref<ProfessionalTitle[]>([]);
  const currentProfessionalTitle = ref<ProfessionalTitle | null>(null);

  /**
   * 获取职称列表
   */
  const fetchProfessionalTitleList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await professionalTitleApi.getProfessionalTitleList();
      professionalTitleList.value = data || [];
    } catch (error) {
      console.error('获取职称列表失败:', error);
      Message.error('获取职称列表失败');
      professionalTitleList.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取职称详情
   * @param titleId 职称ID
   */
  const fetchProfessionalTitleDetail = async (titleId: string): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await professionalTitleApi.getProfessionalTitleDetail(titleId);
      currentProfessionalTitle.value = data || null;
    } catch (error) {
      console.error('获取职称详情失败:', error);
      Message.error('获取职称详情失败');
      currentProfessionalTitle.value = null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增职称
   * @param data 职称信息
   * @returns 是否成功
   */
  const createProfessionalTitle = async (
    data: Partial<ProfessionalTitle>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await professionalTitleApi.createProfessionalTitle(data);
      Message.success('新增职称成功');
      await fetchProfessionalTitleList();
      return true;
    } catch (error) {
      console.error('新增职称失败:', error);
      Message.error('新增职称失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新职称信息
   * @param titleId 职称ID
   * @param data 职称信息
   * @returns 是否成功
   */
  const updateProfessionalTitle = async (
    titleId: string,
    data: Partial<ProfessionalTitle>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await professionalTitleApi.updateProfessionalTitle(titleId, data);
      Message.success('更新职称成功');
      await fetchProfessionalTitleList();
      if (currentProfessionalTitle.value?.titleId === titleId) {
        await fetchProfessionalTitleDetail(titleId);
      }
      return true;
    } catch (error) {
      console.error('更新职称失败:', error);
      Message.error('更新职称失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除职称
   * @param titleId 职称ID
   * @returns 是否成功
   */
  const deleteProfessionalTitle = async (titleId: string): Promise<boolean> => {
    try {
      loading.value = true;
      await professionalTitleApi.deleteProfessionalTitle(titleId);
      Message.success('删除职称成功');
      await fetchProfessionalTitleList();
      if (currentProfessionalTitle.value?.titleId === titleId) {
        currentProfessionalTitle.value = null;
      }
      return true;
    } catch (error) {
      console.error('删除职称失败:', error);
      Message.error('删除职称失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新职称列表
   */
  const refresh = (): void => {
    fetchProfessionalTitleList();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchProfessionalTitleList();
    });
  }

  return {
    loading,
    professionalTitleList,
    currentProfessionalTitle,
    fetchProfessionalTitleList,
    fetchProfessionalTitleDetail,
    createProfessionalTitle,
    updateProfessionalTitle,
    deleteProfessionalTitle,
    refresh,
  };
}

export default useProfessionalTitle;
