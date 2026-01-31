import request from '@/utils/request/request';
import { ApiResponse } from '@/api/hr/types';
import type { Employee } from '@/api/hr/types';

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
  /** 所处科室（带父节点路径） */
  departmentName?: string;
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

  /**
   * 按学历查询员工列表（看板学历占比点击详情）
   * @param degree 学历：2-大专，3-本科，4-硕士，5-博士，0-无学历
   */
  getEmployeesByEducation(degree: number): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-education', {
      params: { degree },
    });
  },

  /**
   * 按岗位分类查询员工列表（看板岗位分类分布点击详情）
   * @param jobCategory 岗位分类：1-技术岗，2-职能岗，3-技能岗
   */
  getEmployeesByJobCategory(
    jobCategory: number
  ): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-job-category', {
      params: { jobCategory },
    });
  },

  /**
   * 按年龄区间查询员工列表（看板年龄分布点击详情）
   * @param minAge 最小年龄（含），可选
   * @param maxAge 最大年龄（不含），可选。如 25岁以下 传 maxAge=25；55岁以上 传 minAge=55
   */
  getEmployeesByAgeRange(
    minAge: number | undefined,
    maxAge: number | undefined
  ): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-age-range', {
      params: { minAge, maxAge },
    });
  },

  /**
   * 按职称等级查询员工列表（看板职称等级分布点击详情）
   * @param titleLevel 职称等级：1-初级，2-中级，3-副高级，4-正高级
   */
  getEmployeesByTitleLevel(
    titleLevel: number
  ): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-title-level', {
      params: { titleLevel },
    });
  },

  /**
   * 按职级查询员工列表（看板职级分布点击详情）
   * @param rankName 职级名称
   */
  getEmployeesByRank(rankName: string): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-rank', {
      params: { rankName },
    });
  },

  /**
   * 按科室和学历查询员工列表
   * @param deptId 科室ID
   * @param degree 学历值
   */
  getEmployeesByDeptEducation(
    deptId: string,
    degree: number
  ): Promise<ApiResponse<Employee[]>> {
    return request.get('/api/240/hr/dashboard/employees-by-dept-education', {
      params: { deptId, degree },
    });
  },

  /**
   * 按荣誉级别查询获奖记录列表（看板各级荣誉统计点击详情）
   * @param rewardLevel 奖励级别，如：国家级、省级、市级、集团级、公司级、部门级
   */
  getHonorDetailByLevel(
    rewardLevel: string
  ): Promise<ApiResponse<HonorStat[]>> {
    return request.get('/api/240/hr/dashboard/honor-detail-by-level', {
      params: { rewardLevel },
    });
  },
};

export default dashboardApi;
