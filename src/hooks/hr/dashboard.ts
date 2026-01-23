import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import dashboardApi, { DashboardData } from '@/api/hr/dashboard';

/**
 * 仪表盘数据管理 Hook
 * @param options 配置选项
 * @returns 仪表盘相关数据和方法
 */
function useDashboard(options?: {
  autoLoad?: boolean; // 是否自动加载
}) {
  const { autoLoad = true } = options || {};

  const loading = ref(false);
  const dashboardData = ref<DashboardData | null>(null);

  /**
   * 获取仪表盘数据
   */
  const fetchDashboardData = async (): Promise<void> => {
    try {
      loading.value = true;
      const res = await dashboardApi.getDashboardData();
      if (res.code === 200 && res.data) {
        dashboardData.value = res.data;
      } else {
        Message.error(res.message || '获取仪表盘数据失败');
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      Message.error('获取仪表盘数据失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 刷新仪表盘数据
   */
  const refresh = (): void => {
    fetchDashboardData();
  };

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      fetchDashboardData();
    });
  }

  return {
    loading,
    dashboardData,
    fetchDashboardData,
    refresh,
  };
}

export default useDashboard;
