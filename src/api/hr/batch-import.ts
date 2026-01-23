import request from '@/utils/request/request';
import type { ApiResponse } from '@/api/hr/types';

/**
 * 模板文件基础URL
 * 可配置为 MinIO 文件服务地址，例如：
 * - http://192.168.1.100:9000/hr-templates
 * - https://minio.your-domain.com/hr-templates
 */
export const TEMPLATE_BASE_URL = '/api/240/hr/templates';

/**
 * 数据导入冲突处理策略
 */
// eslint-disable-next-line no-shadow
export enum ImportStrategy {
  /**
   * 覆盖更新：如果数据已存在，则覆盖旧数据
   */
  OVERWRITE = 'OVERWRITE',

  /**
   * 跳过重复：如果数据已存在，则跳过不导入
   */
  SKIP = 'SKIP',

  /**
   * 报错提醒：如果数据已存在，则标记为错误数据
   */
  ERROR = 'ERROR',

  /**
   * 全量更新：删除该员工的所有相关记录后，全部插入新数据
   */
  FULL_UPDATE = 'FULL_UPDATE',
}

/**
 * 批量导入请求
 */
export interface BatchImportRequest {
  /**
   * 导入数据列表
   */
  data: Record<string, any>[];

  /**
   * 数据冲突处理策略
   * 默认为覆盖更新
   */
  strategy?: ImportStrategy;
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  successCount: number; // 成功导入数量
  failedCount: number; // 失败数量
  totalCount: number; // 总数量
  errors?: BatchImportError[]; // 错误详情
}

/**
 * 批量导入错误信息
 */
export interface BatchImportError {
  row: number; // 行号
  field?: string; // 字段名
  message: string; // 错误信息
  data?: Record<string, any>; // 原始数据
}

/**
 * 导入类型配置
 */
export interface ImportTypeConfig {
  key: string; // 导入类型标识
  name: string; // 导入类型名称
  description: string; // 描述
  category: string; // 分类
  icon: string; // 图标
  apiUrl: string; // 导入接口地址
  templateUrl?: string; // 模板下载地址
  templateName?: string; // 模板文件名
  presetMappings: Record<string, string>; // 预设字段映射
  requiredFields: string[]; // 必填字段
  fieldDescriptions: Record<string, string>; // 字段说明
  /**
   * 值映射配置
   * key: 数据库字段名（如 departmentId）
   * value: 字典类型标识（如 department）
   */
  valueMappings?: Record<string, string>; // 值映射配置
}

/**
 * 人事数据导入类型配置
 */
export const importTypeConfigs: ImportTypeConfig[] = [
  // ========== 基础数据 ==========
  {
    key: 'employee',
    name: '员工基础信息',
    description: '导入员工工号、姓名、部门、职位、联系方式等基本信息',
    category: '基础数据',
    icon: 'icon-user',
    apiUrl: '/api/240/hr/batch-import/employees',
    templateUrl: `${TEMPLATE_BASE_URL}/员工基础信息导入模板.xlsx`,
    templateName: '员工基础信息导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      姓名: 'userName',
      职位: 'jobTitle',
      部门ID: 'departmentId',
      部门名称: 'departmentName',
      职级ID: 'rankId',
      职称ID: 'professionalTitleId',
      职称名称: 'professionalTitleName',
      办公位置: 'officeLocation',
      手机号: 'mobile',
      邮箱: 'email',
      身份证号: 'idCardNo',
      入职日期: 'hireDate',
      调入日期: 'transferDate',
      出生日期: 'birthDate',
      性别: 'gender',
      婚姻状况: 'maritalStatus',
      政治面貌: 'politicalStatus',
      在职状态: 'status',
      职工代表: 'isRepresentative',
      工组长: 'isTeamLeader',
    },
    requiredFields: ['userCode', 'userName'],
    fieldDescriptions: {
      userCode: '员工工号（必填，唯一标识）',
      userName: '员工姓名（必填）',
      gender: '性别：1-男，2-女',
      maritalStatus: '婚姻状况：1-未婚，2-已婚，3-离异，4-丧偶',
      politicalStatus: '政治面貌：1-党员，2-积极分子，3-群众',
      status: '在职状态：1-试用，2-正式，3-离职，4-退休，5-顶岗实习',
      isRepresentative: '是否职工代表：true/false 或 1/0',
      isTeamLeader: '是否工组长：true/false 或 1/0',
    },
  },
  {
    key: 'department',
    name: '部门信息',
    description: '导入部门层级结构、名称等信息',
    category: '基础数据',
    icon: 'icon-mind-mapping',
    apiUrl: '/api/240/hr/batch-import/departments',
    templateUrl: `${TEMPLATE_BASE_URL}/部门信息导入模板.xlsx`,
    templateName: '部门信息导入模板.xlsx',
    presetMappings: {
      部门ID: 'deptId',
      部门名称: 'deptName',
      父部门ID: 'parentId',
      层级: 'deptLevel',
      排序: 'sortOrder',
      是否启用: 'isActive',
    },
    requiredFields: ['deptId', 'deptName'],
    fieldDescriptions: {
      deptId: '部门ID（必填，唯一标识）',
      deptName: '部门名称（必填）',
      parentId: '父部门ID（顶级部门可为空）',
      deptLevel: '层级深度（从1开始）',
      isActive: '是否启用：true/false 或 1/0',
    },
  },

  // ========== 档案数据 ==========
  {
    key: 'education',
    name: '教育背景',
    description: '导入员工学历、毕业院校、专业等教育信息',
    category: '档案数据',
    icon: 'icon-book',
    apiUrl: '/api/240/hr/batch-import/educations',
    templateUrl: `${TEMPLATE_BASE_URL}/教育背景导入模板.xlsx`,
    templateName: '教育背景导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      学历: 'degree',
      毕业院校: 'schoolName',
      专业: 'major',
      专业大类: 'majorCategory',
      入学年份: 'startYear',
      毕业年份: 'endYear',
    },
    requiredFields: ['userCode', 'degree'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      degree: '学历：1-高中，2-大专，3-本科，4-硕士，5-博士',
    },
  },
  {
    key: 'position',
    name: '岗位信息',
    description: '导入员工岗位分类、专业序列等信息',
    category: '档案数据',
    icon: 'icon-bookmark',
    apiUrl: '/api/240/hr/batch-import/positions',
    templateUrl: `${TEMPLATE_BASE_URL}/岗位信息导入模板.xlsx`,
    templateName: '岗位信息导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      一级专业: 'primaryProfession',
      二级专业: 'secondaryProfession',
      岗位分类: 'jobCategory',
      岗位序列: 'positionType',
    },
    requiredFields: ['userCode'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
    },
  },

  // ========== 考核数据 ==========
  {
    key: 'performance',
    name: '绩效记录',
    description: '导入员工年度绩效评级、分数等考核信息',
    category: '考核数据',
    icon: 'icon-bar-chart',
    apiUrl: '/api/240/hr/batch-import/performances',
    templateUrl: `${TEMPLATE_BASE_URL}/绩效记录导入模板.xlsx`,
    templateName: '绩效记录导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      年度: 'year',
      绩效等级: 'performanceRating',
      是否免考: 'isExempt',
      绩效分数: 'score',
    },
    requiredFields: ['userCode', 'year'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      year: '考核年度（必填，如2025）',
      isExempt: '是否免考：true/false 或 1/0',
      score: '绩效分数（0-100）',
    },
  },
  {
    key: 'skillCertification',
    name: '技能鉴定',
    description: '导入员工技能等级、鉴定工种等信息',
    category: '考核数据',
    icon: 'icon-tool',
    apiUrl: '/api/240/hr/batch-import/skill-certifications',
    templateUrl: `${TEMPLATE_BASE_URL}/技能鉴定导入模板.xlsx`,
    templateName: '技能鉴定导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      鉴定工种: 'trade',
      鉴定等级: 'level',
      鉴定日期: 'certificationDate',
    },
    requiredFields: ['userCode'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      certificationDate: '日期格式：yyyy-MM-dd',
    },
  },

  // ========== 奖励数据 ==========
  {
    key: 'honor',
    name: '荣誉情况',
    description: '导入员工获奖记录、荣誉称号等信息',
    category: '奖励数据',
    icon: 'icon-trophy',
    apiUrl: '/api/240/hr/batch-import/honors',
    templateUrl: `${TEMPLATE_BASE_URL}/荣誉情况导入模板.xlsx`,
    templateName: '荣誉情况导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      奖励类型: 'rewardType',
      奖励名称: 'rewardName',
      奖励日期: 'rewardDate',
      奖励级别: 'rewardLevel',
      批准机关: 'approvingAuthority',
      奖励事由: 'rewardReason',
      排名: 'ranking',
    },
    requiredFields: ['userCode', 'rewardName', 'rewardDate'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      rewardName: '奖励名称（必填）',
      rewardDate: '奖励日期（必填，格式：yyyy-MM-dd）',
    },
  },

  // ========== 联系信息 ==========
  {
    key: 'emergencyContact',
    name: '紧急联系人',
    description: '导入员工紧急联系人姓名、关系、电话等信息',
    category: '联系信息',
    icon: 'icon-phone',
    apiUrl: '/api/240/hr/batch-import/emergency-contacts',
    templateUrl: `${TEMPLATE_BASE_URL}/紧急联系人导入模板.xlsx`,
    templateName: '紧急联系人导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      联系人姓名: 'contactName',
      关系: 'relationship',
      联系电话: 'phone',
    },
    requiredFields: ['userCode', 'contactName', 'relationship', 'phone'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      contactName: '联系人姓名（必填）',
      relationship: '关系（必填，如：父母、配偶、朋友）',
      phone: '联系电话（必填）',
    },
  },

  // ========== 培训数据 ==========
  {
    key: 'teachingCertification',
    name: '授课认证',
    description: '导入员工授课资质认证信息',
    category: '培训数据',
    icon: 'icon-user-add',
    apiUrl: '/api/240/hr/batch-import/teaching-certifications',
    templateUrl: `${TEMPLATE_BASE_URL}/授课认证导入模板.xlsx`,
    templateName: '授课认证导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      课程名称: 'courseName',
      授课类型: 'courseType',
      认证日期: 'certificationDate',
      认证级别: 'certificationLevel',
      备注: 'remark',
    },
    requiredFields: ['userCode', 'courseName', 'courseType'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      courseName: '课程名称（必填）',
      courseType: '授课类型：1-技能，2-管理，3-技术',
      certificationLevel: '认证级别：1-初级，2-中级，3-高级',
    },
  },
  {
    key: 'teachingRecord',
    name: '授课记录',
    description: '导入员工授课认定记录',
    category: '培训数据',
    icon: 'icon-edit',
    apiUrl: '/api/240/hr/batch-import/teaching-records',
    templateUrl: `${TEMPLATE_BASE_URL}/授课记录导入模板.xlsx`,
    templateName: '授课记录导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      课程名称: 'courseName',
      授课类型: 'courseType',
      备注: 'remark',
    },
    requiredFields: ['userCode', 'courseName', 'courseType'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      courseName: '课程名称（必填）',
      courseType: '授课类型：1-技能，2-管理，3-技术',
    },
  },
  {
    key: 'secondaryEducation',
    name: '二级教育',
    description: '导入员工EHS、安全、保密等二级教育培训记录',
    category: '培训数据',
    icon: 'icon-file-audio',
    apiUrl: '/api/240/hr/batch-import/secondary-educations',
    templateUrl: `${TEMPLATE_BASE_URL}/二级教育导入模板.xlsx`,
    templateName: '二级教育导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      教育类型: 'educationType',
      教育名称: 'educationName',
      培训年度: 'year',
      是否完成: 'isCompleted',
      完成日期: 'completeDate',
      考核成绩: 'score',
      证书编号: 'certificateNo',
      有效期至: 'validUntil',
      培训讲师: 'trainer',
      备注: 'remark',
    },
    requiredFields: ['userCode', 'educationType', 'year'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      educationType: '教育类型：1-EHS，2-安全，3-保密，4-质量，5-消防，6-其他',
      year: '培训年度（必填，如2025）',
      isCompleted: '是否完成：0-未完成，1-已完成，2-免修',
    },
  },
  {
    key: 'internalTrainer',
    name: '内训信息',
    description: '导入员工内部培训课程信息',
    category: '培训数据',
    icon: 'icon-video-camera',
    apiUrl: '/api/240/hr/batch-import/internal-trainers',
    templateUrl: `${TEMPLATE_BASE_URL}/内训信息导入模板.xlsx`,
    templateName: '内训信息导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      课程名称: 'courseName',
      课程类别: 'courseCategory',
      授课范围: 'teachingScope',
    },
    requiredFields: ['userCode', 'courseName'],
    fieldDescriptions: {
      userCode: '员工工号（必填，需已存在）',
      courseName: '课程名称（必填）',
    },
  },
  {
    key: 'employeeMentor',
    name: '岗位师傅',
    description: '导入员工师徒关系信息',
    category: '培训数据',
    icon: 'icon-user-group',
    apiUrl: '/api/240/hr/batch-import/mentors',
    templateUrl: `${TEMPLATE_BASE_URL}/岗位师傅导入模板.xlsx`,
    templateName: '岗位师傅导入模板.xlsx',
    presetMappings: {
      工号: 'userCode',
      岗位师傅工号: 'positionMentorCode',
      岗位师傅姓名: 'positionMentorName',
      指导师傅工号: 'guidanceMentorCode',
      指导师傅姓名: 'guidanceMentorName',
      授课内容: 'teachingContents',
      开始日期: 'startDate',
      结束日期: 'endDate',
      备注: 'remark',
    },
    requiredFields: ['userCode'],
    fieldDescriptions: {
      userCode: '员工工号（必填，被指导人工号，需已存在）',
      teachingContents: '授课内容（多个用逗号分隔）',
      startDate: '日期格式：yyyy-MM-dd',
      endDate: '日期格式：yyyy-MM-dd',
    },
  },

  // ========== 职级职称数据 ==========
  {
    key: 'jobRank',
    name: '职级信息',
    description: '导入公司职级体系配置',
    category: '基础配置',
    icon: 'icon-layers',
    apiUrl: '/api/240/hr/batch-import/job-ranks',
    templateUrl: `${TEMPLATE_BASE_URL}/职级信息导入模板.xlsx`,
    templateName: '职级信息导入模板.xlsx',
    presetMappings: {
      职级ID: 'rankId',
      职级名称: 'rankName',
      职级类型: 'rankType',
      职级等级: 'rankLevel',
      说明: 'description',
    },
    requiredFields: ['rankId', 'rankName', 'rankType'],
    fieldDescriptions: {
      rankId: '职级ID（必填，唯一标识，如TECH_L5）',
      rankName: '职级名称（必填，如：员、师、主管）',
      rankType: '职级类型：1-技术岗，2-职能岗',
      rankLevel: '职级等级（数字，用于排序）',
    },
  },
  {
    key: 'professionalTitle',
    name: '职称信息',
    description: '导入专业技术职称配置',
    category: '基础配置',
    icon: 'icon-idcard',
    apiUrl: '/api/240/hr/batch-import/professional-titles',
    templateUrl: `${TEMPLATE_BASE_URL}/职称信息导入模板.xlsx`,
    templateName: '职称信息导入模板.xlsx',
    presetMappings: {
      职称ID: 'titleId',
      职称名称: 'titleName',
      职称类别: 'titleCategory',
      职称级别: 'titleLevel',
      排序: 'sortOrder',
      说明: 'description',
    },
    requiredFields: ['titleId', 'titleName', 'titleCategory', 'titleLevel'],
    fieldDescriptions: {
      titleId: '职称ID（必填，唯一标识，如ENG_SR）',
      titleName: '职称名称（必填，如：高级工程师）',
      titleCategory: '职称类别：1-工程技术，2-经济，3-会计，4-统计，5-其他',
      titleLevel: '职称级别：1-初级，2-中级，3-副高级，4-正高级',
    },
  },
];

/**
 * 获取导入类型配置
 */
export function getImportTypeConfig(key: string): ImportTypeConfig | undefined {
  return importTypeConfigs.find((config) => config.key === key);
}

/**
 * 获取导入类型分类
 */
export function getImportCategories(): string[] {
  const categories = new Set(
    importTypeConfigs.map((config) => config.category)
  );
  return Array.from(categories);
}

/**
 * 获取分类下的导入类型
 */
export function getImportTypesByCategory(category: string): ImportTypeConfig[] {
  return importTypeConfigs.filter((config) => config.category === category);
}

/**
 * 批量导入API
 */
const batchImportApi = {
  /**
   * 员工批量导入
   */
  importEmployees(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/employees', { data });
  },

  /**
   * 部门批量导入
   */
  importDepartments(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/departments', { data });
  },

  /**
   * 教育背景批量导入
   */
  importEducations(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/educations', { data });
  },

  /**
   * 岗位信息批量导入
   */
  importPositions(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/positions', { data });
  },

  /**
   * 绩效记录批量导入
   */
  importPerformances(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/performances', { data });
  },

  /**
   * 技能鉴定批量导入
   */
  importSkillCertifications(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/skill-certifications', {
      data,
    });
  },

  /**
   * 荣誉情况批量导入
   */
  importHonors(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/honors', { data });
  },

  /**
   * 紧急联系人批量导入
   */
  importEmergencyContacts(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/emergency-contacts', {
      data,
    });
  },

  /**
   * 授课认证批量导入
   */
  importTeachingCertifications(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/teaching-certifications', {
      data,
    });
  },

  /**
   * 授课记录批量导入
   */
  importTeachingRecords(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/teaching-records', { data });
  },

  /**
   * 二级教育批量导入
   */
  importSecondaryEducations(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/secondary-educations', {
      data,
    });
  },

  /**
   * 内训信息批量导入
   */
  importInternalTrainers(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/internal-trainers', { data });
  },

  /**
   * 岗位师傅批量导入
   */
  importMentors(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/mentors', { data });
  },

  /**
   * 职级批量导入
   */
  importJobRanks(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/job-ranks', { data });
  },

  /**
   * 职称批量导入
   */
  importProfessionalTitles(
    data: Record<string, any>[]
  ): Promise<ApiResponse<BatchImportResult>> {
    return request.post('/api/240/hr/batch-import/professional-titles', {
      data,
    });
  },
};

export default batchImportApi;
