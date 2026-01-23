import request from '@/utils/request/request';
import { ApiResponse } from '@/api/hr/types';

export interface DashboardOverview {
  totalEmployees: number;
  newHires3Years: number;
  newHiresGrowth: number;
  averageAge: number;
  totalHonors: number; // 荣誉总数
  newHonors3Years: number; // 近3年新增荣誉
}

export interface ChartData {
  label: string;
  value: number;
  total?: number; // 对于学历分布这种有分母的
}

export interface HonorStat {
  rewardName: string;
  userName: string;
  rewardDate: string;
  rewardLevel: string;
}

export interface SecondaryEduStat {
  label: string;
  completed: number;
  total: number;
}

export interface RankingStat {
  name: string;
  value: number;
  unit?: string;
}

export interface DepartmentEducationStat {
  deptId: string;
  deptName: string;
  parentId?: string; // 父部门ID
  deptLevel?: number; // 部门层级
  totalEmployees: number;
  doctorCount: number; // 博士
  masterCount: number; // 硕士
  bachelorCount: number; // 本科
  collegeCount: number; // 大专
  highSchoolCount: number; // 高中
  noEducationCount: number; // 无学历信息
  children?: DepartmentEducationStat[]; // 子部门列表
}

export interface DashboardData {
  overview: DashboardOverview;
  ageStructure: ChartData[];
  educationDistribution: ChartData[];
  technicalStaffAnalysis: ChartData[];
  rankDistribution: ChartData[];
  jobCategoryDistribution: ChartData[];
  rankLevelDistribution: ChartData[];
  // 更新后的看板数据
  honorStats: ChartData[]; // 统计各级别荣誉数量
  mentoringStats: {
    activePairs: number;
    totalTeachingHours: number;
    mentoringTrend: { month: string; count: number }[]; // 带教趋势
  };
  teachingLeaderboard: RankingStat[]; // 授课达人榜
  trainingStats: ChartData[];
  departmentEducationStats: DepartmentEducationStat[]; // 按科室的学历梯队
}

const dashboardApi = {
  getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return request.get('/api/240/hr/dashboard/stats');
  },
};

export default dashboardApi;
