/**
 * 人事管理相关类型定义
 */
/* eslint-disable no-shadow */

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

/**
 * 分页结果结构
 */
export interface PageResult<T = any> {
  list: T[];
  total: number;
}

/**
 * 员工信息接口（对应 employees 表）
 */
export interface Employee {
  userCode: string; // 工号（主键）
  userName: string; // 姓名
  jobTitle?: string; // 职位名称（如：高级Java开发工程师）
  departmentId?: string; // 所属科室ID（VARCHAR(36)）
  departmentName?: string; // 部门名称（关联查询）
  rankId?: string; // 当前职级ID（VARCHAR(36)）- 公司内部职级
  rankName?: string; // 职级名称（关联查询）
  professionalTitleId?: string; // 职称ID（VARCHAR(36)）- 专业技术职称
  professionalTitleName?: string; // 职称名称（如：工程师、高级工程师）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间（DATE）
  transferDate?: string; // 调入专业厂时间（DATE）
  birthDate?: string; // 出生日期（DATE）
  gender?: number; // 性别: 1-男, 2-女
  genderName?: string; // 性别名称（前端展示用）
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  maritalStatusName?: string; // 婚姻状况名称
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  politicalStatusName?: string; // 政治面貌名称
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  statusName?: string; // 状态名称
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  // 兼容字段（保留旧字段以兼容现有代码）
  id?: number; // 兼容字段
  position?: string; // 兼容字段，等同于jobTitle
  level?: string; // 兼容字段，等同于rankName
  entryDate?: string; // 兼容字段，等同于hireDate
  workStatus?: number; // 兼容字段，等同于status
  workStatusName?: string; // 兼容字段，等同于statusName
  phone?: string; // 兼容字段，等同于mobile
  avatarUrl?: string; // 头像URL（业务扩展字段）
  idCardPhotoUrl?: string; // 证件照URL（业务扩展字段）
  address?: string; // 地址（业务扩展字段）
  emergencyContact?: string; // 兼容字段（应使用emergency_contacts表）
  emergencyPhone?: string; // 兼容字段（应使用emergency_contacts表）
  remark?: string; // 备注（业务扩展字段）
  officeFloor?: string; // 办公楼层（兼容字段）
  officeRoom?: string; // 办公室编号（兼容字段）
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
  creatorId?: number; // 兼容字段
  creatorName?: string; // 兼容字段
  updaterId?: number; // 兼容字段
  updaterName?: string; // 兼容字段
  deleted?: number; // 兼容字段，等同于isDeleted
}

/**
 * 员工分页查询参数
 */
export interface EmployeePageParams {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
  userCode?: string;
  departmentId?: string;
  rankId?: string;
  jobTitle?: string;
  status?: number;
  mobile?: string;
  // 兼容字段
  position?: string;
  workStatus?: number;
}

/**
 * 员工创建请求参数
 */
export interface EmployeeCreateRequest {
  userCode: string; // 工号（必填）
  userName: string; // 姓名（必填）
  jobTitle?: string; // 职位名称
  departmentId?: string; // 所属科室ID
  rankId?: string; // 当前职级ID（公司内部职级）
  professionalTitleId?: string; // 职称ID（专业技术职称）
  professionalTitleName?: string; // 职称名称（冗余字段）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间
  transferDate?: string; // 调入专业厂时间
  birthDate?: string; // 出生日期
  gender?: number; // 性别: 1-男, 2-女
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  // 兼容字段
  phone?: string;
  position?: string;
  level?: string;
  entryDate?: string;
  workStatus?: number;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remark?: string;
}

/**
 * 员工更新请求参数
 */
export interface EmployeeUpdateRequest {
  userCode: string; // 工号（必填，用于定位）
  userName?: string; // 姓名
  jobTitle?: string; // 职位名称
  departmentId?: string; // 所属科室ID
  rankId?: string; // 当前职级ID（公司内部职级）
  professionalTitleId?: string; // 职称ID（专业技术职称）
  professionalTitleName?: string; // 职称名称（冗余字段）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间
  transferDate?: string; // 调入专业厂时间
  birthDate?: string; // 出生日期
  gender?: number; // 性别: 1-男, 2-女
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  // 兼容字段
  id?: number;
  phone?: string;
  departmentName?: string;
  position?: string;
  level?: string;
  entryDate?: string;
  workStatus?: number;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remark?: string;
}

/**
 * 部门信息接口（对应 departments 表）
 */
export interface Department {
  deptId: string; // 部门ID（主键，VARCHAR(36)）
  deptName: string; // 部门名称
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel: number; // 层级深度
  sortOrder: number; // 排序权重
  isActive: boolean; // 是否启用
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
  // 兼容字段
  id?: number; // 兼容字段
  deptCode?: string; // 兼容字段（可选）
  deptPath?: string; // 兼容字段（可选，用于路径查询）
  managerId?: number; // 兼容字段（可选，部门负责人）
  managerName?: string; // 兼容字段
  description?: string; // 兼容字段（部门描述）
  status?: number; // 兼容字段（等同于isActive: true=1, false=0）
  creatorId?: number; // 兼容字段
  creatorName?: string; // 兼容字段
  updaterId?: number; // 兼容字段
  updaterName?: string; // 兼容字段
  deleted?: number; // 兼容字段，等同于isDeleted
}

/**
 * 部门树节点接口
 */
export interface DepartmentTreeNode {
  deptId: string; // 部门ID（VARCHAR(36)）
  deptName: string; // 部门名称
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel: number; // 层级深度
  sortOrder: number; // 排序权重
  isActive: boolean; // 是否启用
  children: DepartmentTreeNode[]; // 子部门列表
  // 兼容字段
  id?: number;
  deptCode?: string;
  managerId?: number;
  managerName?: string;
  status?: number;
}

/**
 * 部门创建请求参数
 */
export interface DepartmentCreateRequest {
  deptId?: string; // 部门ID（可选，系统生成或手动指定）
  deptName: string; // 部门名称（必填）
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel?: number; // 层级深度（系统自动计算）
  sortOrder?: number; // 排序权重
  isActive?: boolean; // 是否启用
  description?: string; // 部门描述（兼容字段）
  managerId?: number; // 部门负责人ID（兼容字段）
  managerName?: string; // 部门负责人姓名（兼容字段）
  // 兼容字段
  deptCode?: string;
}

/**
 * 部门更新请求参数
 */
export interface DepartmentUpdateRequest {
  deptId: string; // 部门ID（必填，用于定位）
  deptName?: string; // 部门名称
  parentId?: string; // 父部门ID
  deptLevel?: number; // 层级深度
  sortOrder?: number; // 排序权重
  isActive?: boolean; // 是否启用
  description?: string; // 部门描述（兼容字段）
  managerId?: number; // 部门负责人ID（兼容字段）
  managerName?: string; // 部门负责人姓名（兼容字段）
  // 兼容字段
  id?: number;
  status?: number;
}

/**
 * 文件上传结果接口
 */
export interface FileUploadResult {
  id: number;
  fileName: string;
  filePath: string;
  url: string;
  fileSize: number;
  fileType: string;
  fileExtension: string;
  businessType: string;
  businessId?: number;
}

/**
 * 文件上传请求参数
 */
export interface FileUploadParams {
  file: File;
  businessType: string;
  businessId?: number;
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 1, // 男
  FEMALE = 2, // 女
}

/**
 * 婚姻状况枚举
 */
export enum MaritalStatus {
  SINGLE = 1, // 未婚
  MARRIED = 2, // 已婚
  DIVORCED = 3, // 离异
  WIDOWED = 4, // 丧偶
}

/**
 * 政治面貌枚举
 */
export enum PoliticalStatus {
  PARTY_MEMBER = 1, // 党员
  ACTIVIST = 2, // 积极分子
  MASS = 3, // 群众
}

/**
 * 员工状态枚举
 */
export enum EmployeeStatus {
  PROBATION = 1, // 试用
  REGULAR = 2, // 正式
  RESIGNED = 3, // 离职
  RETIRED = 4, // 退休
  INTERNSHIP = 5, // 顶岗实习
}

/**
 * 职级类型枚举
 */
export enum RankType {
  TECHNICAL = 1, // 技术岗
  FUNCTIONAL = 2, // 职能岗
}

/**
 * 职称类别枚举
 */
export enum TitleCategory {
  ENGINEERING = 1, // 工程技术
  ECONOMY = 2, // 经济
  ACCOUNTING = 3, // 会计
  STATISTICS = 4, // 统计
  OTHER = 5, // 其他
}

/**
 * 职称级别枚举
 */
export enum TitleLevel {
  JUNIOR = 1, // 初级
  INTERMEDIATE = 2, // 中级
  ASSOCIATE_SENIOR = 3, // 副高级
  SENIOR = 4, // 正高级
}

/**
 * 学历枚举
 */
export enum Degree {
  HIGH_SCHOOL = 1, // 高中
  COLLEGE = 2, // 大专
  BACHELOR = 3, // 本科
  MASTER = 4, // 硕士
  DOCTOR = 5, // 博士
}

/**
 * 授课类型枚举
 */
export enum CourseType {
  SKILL = 1, // 技能
  MANAGEMENT = 2, // 管理
  TECHNICAL = 3, // 技术
}

/**
 * 工作状态枚举（兼容字段，使用EmployeeStatus替代）
 */
export enum WorkStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}

/**
 * 部门状态枚举
 */
export enum DepartmentStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

/**
 * 文件业务类型枚举
 */
export enum FileBusinessType {
  AVATAR = 'avatar',
  ID_CARD = 'id_card',
}

/**
 * 性别选项
 */
export const GenderOptions = [
  { label: '男', value: Gender.MALE },
  { label: '女', value: Gender.FEMALE },
];

/**
 * 婚姻状况选项
 */
export const MaritalStatusOptions = [
  { label: '未婚', value: MaritalStatus.SINGLE },
  { label: '已婚', value: MaritalStatus.MARRIED },
  { label: '离异', value: MaritalStatus.DIVORCED },
  { label: '丧偶', value: MaritalStatus.WIDOWED },
];

/**
 * 政治面貌选项
 */
export const PoliticalStatusOptions = [
  { label: '党员', value: PoliticalStatus.PARTY_MEMBER },
  { label: '积极分子', value: PoliticalStatus.ACTIVIST },
  { label: '群众', value: PoliticalStatus.MASS },
];

/**
 * 员工状态选项
 */
export const EmployeeStatusOptions = [
  { label: '试用', value: EmployeeStatus.PROBATION },
  { label: '正式', value: EmployeeStatus.REGULAR },
  { label: '离职', value: EmployeeStatus.RESIGNED },
  { label: '退休', value: EmployeeStatus.RETIRED },
  { label: '顶岗实习', value: EmployeeStatus.INTERNSHIP },
];

/**
 * 职级类型选项
 */
export const RankTypeOptions = [
  { label: '技术岗', value: RankType.TECHNICAL },
  { label: '职能岗', value: RankType.FUNCTIONAL },
];

/**
 * 职称类别选项
 */
export const TitleCategoryOptions = [
  { label: '工程技术', value: TitleCategory.ENGINEERING },
  { label: '经济', value: TitleCategory.ECONOMY },
  { label: '会计', value: TitleCategory.ACCOUNTING },
  { label: '统计', value: TitleCategory.STATISTICS },
  { label: '其他', value: TitleCategory.OTHER },
];

/**
 * 职称级别选项
 */
export const TitleLevelOptions = [
  { label: '初级', value: TitleLevel.JUNIOR },
  { label: '中级', value: TitleLevel.INTERMEDIATE },
  { label: '副高级', value: TitleLevel.ASSOCIATE_SENIOR },
  { label: '正高级', value: TitleLevel.SENIOR },
];

/**
 * 常用职称选项（便于快速选择）
 */
export const ProfessionalTitleOptions = [
  // 工程技术类
  { label: '技术员', value: 'ENG_JR', category: 1, level: 1 },
  { label: '助理工程师', value: 'ENG_ASST', category: 1, level: 1 },
  { label: '工程师', value: 'ENG_MID', category: 1, level: 2 },
  { label: '高级工程师', value: 'ENG_SR', category: 1, level: 3 },
  { label: '正高级工程师', value: 'ENG_PROF', category: 1, level: 4 },
  // 经济类
  { label: '助理经济师', value: 'ECO_ASST', category: 2, level: 1 },
  { label: '经济师', value: 'ECO_MID', category: 2, level: 2 },
  { label: '高级经济师', value: 'ECO_SR', category: 2, level: 3 },
  // 会计类
  { label: '助理会计师', value: 'ACC_ASST', category: 3, level: 1 },
  { label: '会计师', value: 'ACC_MID', category: 3, level: 2 },
  { label: '高级会计师', value: 'ACC_SR', category: 3, level: 3 },
];

/**
 * 学历选项
 */
export const DegreeOptions = [
  { label: '高中', value: Degree.HIGH_SCHOOL },
  { label: '大专', value: Degree.COLLEGE },
  { label: '本科', value: Degree.BACHELOR },
  { label: '硕士', value: Degree.MASTER },
  { label: '博士', value: Degree.DOCTOR },
];

/**
 * 授课类型选项
 */
export const CourseTypeOptions = [
  { label: '技能', value: CourseType.SKILL },
  { label: '管理', value: CourseType.MANAGEMENT },
  { label: '技术', value: CourseType.TECHNICAL },
];

/**
 * 工作状态选项（兼容字段）
 */
export const WorkStatusOptions = [
  { label: '在职', value: WorkStatus.ACTIVE },
  { label: '离职', value: WorkStatus.INACTIVE },
];

/**
 * 部门状态选项
 */
export const DepartmentStatusOptions = [
  { label: '正常', value: DepartmentStatus.ACTIVE },
  { label: '停用', value: DepartmentStatus.INACTIVE },
];

/**
 * 职级选项
 */
export const LevelOptions = [
  { label: '实习生', value: '实习生' },
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' },
  { label: '资深', value: '资深' },
  { label: '专家', value: '专家' },
  { label: '架构师', value: '架构师' },
];

/**
 * 常用职位选项
 */
export const PositionOptions = [
  // 技术岗位
  { label: '前端工程师', value: '前端工程师' },
  { label: '后端工程师', value: '后端工程师' },
  { label: '全栈工程师', value: '全栈工程师' },
  { label: '移动端工程师', value: '移动端工程师' },
  { label: '测试工程师', value: '测试工程师' },
  { label: '运维工程师', value: '运维工程师' },
  { label: '数据工程师', value: '数据工程师' },
  { label: '算法工程师', value: '算法工程师' },
  { label: '架构师', value: '架构师' },
  { label: '技术总监', value: '技术总监' },

  // 产品岗位
  { label: '产品经理', value: '产品经理' },
  { label: '产品总监', value: '产品总监' },
  { label: 'UI设计师', value: 'UI设计师' },
  { label: 'UX设计师', value: 'UX设计师' },
  { label: '交互设计师', value: '交互设计师' },

  // 市场岗位
  { label: '市场专员', value: '市场专员' },
  { label: '市场经理', value: '市场经理' },
  { label: '品牌经理', value: '品牌经理' },
  { label: '销售代表', value: '销售代表' },
  { label: '销售经理', value: '销售经理' },
  { label: '商务经理', value: '商务经理' },

  // 职能岗位
  { label: 'HR专员', value: 'HR专员' },
  { label: 'HR经理', value: 'HR经理' },
  { label: '财务专员', value: '财务专员' },
  { label: '财务经理', value: '财务经理' },
  { label: '行政专员', value: '行政专员' },
  { label: '法务专员', value: '法务专员' },

  // 管理岗位
  { label: '项目经理', value: '项目经理' },
  { label: '部门经理', value: '部门经理' },
  { label: '总监', value: '总监' },
  { label: '副总裁', value: '副总裁' },
  { label: '总裁', value: '总裁' },
];

/**
 * 表单验证规则类型
 */
export interface FormRule {
  required?: boolean;
  message?: string;
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | 'email'
    | 'url'
    | 'date';
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: any, callback: (error?: string) => void) => void;
}

/**
 * 表单验证规则集合
 */
export interface FormRules {
  [key: string]: FormRule | FormRule[];
}

/**
 * 房间类型枚举
 */
export enum RoomType {
  OFFICE = 'office', // 普通办公室
  MEETING_ROOM = 'meeting', // 会议室
  BREAK_ROOM = 'break', // 休息室
  STORAGE = 'storage', // 储藏室
  BATHROOM = 'bathroom', // 卫生间
  CORRIDOR = 'corridor', // 走廊
}

/**
 * 办公室配置（对应 office_room 表）
 */
export interface OfficeRoom {
  id: number;
  floorCode: string; // 楼层标识（格式：buildingCode-floorNumber，如 "101B-1F"）
  roomNumber: string; // 房间号（如 "222", "111"）
  roomName: string; // 房间名称
  roomType: RoomType; // 房间类型
  x: number; // 房间X坐标
  y: number; // 房间Y坐标
  width: number; // 房间宽度
  height: number; // 房间高度
  rotation?: number; // 旋转角度（可选）
  color?: string; // 房间颜色（可选）
  capacity?: number; // 容纳人数（可选）
  description?: string; // 房间描述（可选）
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 楼层配置（对应 office_floor 表）
 */
export interface FloorConfig {
  id?: number; // 主键（自增）
  floor: string; // 楼层标识（格式：buildingCode-floorNumber，如 "101B-1F"），对应 floor_code
  floorName: string; // 楼层名称（如"一层"）
  buildingCode: string; // 办公楼编码（如 "101B"）
  buildingName?: string; // 办公楼名称（可选）
  floorNumber: number; // 楼层数字（1, 2, 3...）
  canvasWidth: number; // 画布宽度
  canvasHeight: number; // 画布高度
  backgroundImage?: string; // 背景图片URL（可选）
  sortOrder?: number; // 排序权重
  isActive?: boolean; // 是否启用
  rooms: OfficeRoom[]; // 房间列表（关联查询）
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 办公区域信息（用于前端展示，后端不存储，从楼层数据中聚合生成）
 */
export interface OfficeArea {
  buildingCode: string; // 办公楼编码（如"201"）
  buildingName?: string; // 办公楼名称（可选，前端展示用）
  floors: FloorInfo[]; // 楼层列表
}

/**
 * 楼层信息（简化版，用于楼层列表）
 * 楼层从房间号第一个数字提取，如房间"111"表示1楼，"211"表示2楼
 */
export interface FloorInfo {
  floor: string; // 楼层标识（格式：办公楼编码-楼层，如：201-1F）
  floorName: string; // 楼层名称（如"一层"）
  buildingCode: string; // 所属办公楼编码
  floorNumber: number; // 楼层数字（1, 2, 3...）
  roomCount: number; // 房间数量
  employeeCount: number; // 员工数量
}

/**
 * 职级信息接口（对应 job_ranks 表）
 */
export interface JobRank {
  rankId: string; // 职级ID（主键，如 TECH_L5, FUNC_M3）
  rankName: string; // 职级名称（如 员、师、主管）
  rankType: number; // 职级类型: 1-技术岗, 2-职能岗
  rankTypeName?: string; // 职级类型名称（前端展示用）
  rankLevel?: number; // 职级等级（用于排序，数字越大级别越高）
  description?: string; // 职级说明
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 教育背景接口（对应 education 表）
 */
export interface Education {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  degree: number; // 学历: 1-高中, 2-大专, 3-本科, 4-硕士, 5-博士
  degreeName?: string; // 学历名称（前端展示用）
  schoolName?: string; // 毕业院校
  major?: string; // 在校专业
  majorCategory?: string; // 专业大类
  startYear?: number; // 入学年份
  endYear?: number; // 毕业年份
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 岗位信息接口（对应 positions 表）
 */
export interface Position {
  userCode: string; // 员工工号（主键，一对一）
  primaryProfession?: string; // 一级专业
  secondaryProfession?: string; // 二级专业
  jobCategory?: string; // 岗位分类
  positionType?: string; // 岗位序列
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 技能鉴定接口（对应 skill_certifications 表）
 */
export interface SkillCertification {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  trade?: string; // 鉴定工种
  level?: string; // 鉴定等级
  certificationDate?: string; // 鉴定日期（DATE）
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 内训信息接口（对应 internal_trainers 表）
 */
export interface InternalTrainer {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  courseName: string; // 课程名称（必填）
  courseCategory?: string; // 课程类别
  teachingScope?: string; // 授课范围
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 职级历史接口（对应 rank_histories 表）
 */
export interface RankHistory {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  rankId: string; // 变更后的职级ID
  rankName?: string; // 职级名称（关联查询）
  effectiveDate: string; // 生效日期（DATE，必填）
  reason?: string; // 变更原因
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 职称信息接口（对应 professional_titles 表）
 */
export interface ProfessionalTitle {
  titleId: string; // 职称ID（主键）
  titleName: string; // 职称名称（如 助理工程师、工程师）
  titleCategory: number; // 职称类别: 1-工程技术, 2-经济, 3-会计, 4-统计, 5-其他
  titleCategoryName?: string; // 职称类别名称（前端展示用）
  titleLevel: number; // 职称级别: 1-初级, 2-中级, 3-副高级, 4-正高级
  titleLevelName?: string; // 职称级别名称（前端展示用）
  sortOrder?: number; // 排序权重
  description?: string; // 职称说明
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 职称历史接口（对应 title_histories 表）
 */
export interface TitleHistory {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  titleId: string; // 变更后的职称ID
  titleName?: string; // 职称名称（关联查询）
  effectiveDate: string; // 生效日期（DATE，必填）
  certificateNo?: string; // 证书编号
  issuingAuthority?: string; // 发证机关
  reason?: string; // 变更原因
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 绩效记录接口（对应 performance 表）
 */
export interface Performance {
  userCode: string; // 员工工号（复合主键）
  year: number; // 年度（复合主键）
  performanceRating?: string; // 绩效等级
  isExempt?: boolean; // 是否不考核
  score?: number; // 绩效分数（DECIMAL(5,2)）
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 紧急联系人接口（对应 emergency_contacts 表）
 */
export interface EmergencyContact {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  contactName: string; // 联系人姓名（必填）
  relationship: string; // 关系（必填）
  phone: string; // 联系电话（必填）
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
}

/**
 * 岗位师傅接口（对应 employee_mentors 表）
 */
export interface EmployeeMentor {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号（被指导人）
  positionMentorCode?: string; // 岗位师傅工号
  positionMentorName?: string; // 岗位师傅姓名（冗余字段）
  guidanceMentorCode?: string; // 指导师傅工号
  guidanceMentorName?: string; // 指导师傅姓名（冗余字段）
  teachingContents?: string; // 授课内容（JSON数组格式）
  startDate?: string; // 带教开始日期
  endDate?: string; // 带教结束日期
  remark?: string; // 备注说明
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 公司授课认证接口（对应 teaching_certifications 表）
 */
export interface TeachingCertification {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  courseName: string; // 课程名称（必填）
  courseType: number; // 授课类型：1-技能 2-管理 3-技术
  courseTypeName?: string; // 授课类型名称（前端展示用）
  certificationDate?: string; // 认证日期
  certificationLevel?: number; // 认证级别: 1-初级, 2-中级, 3-高级
  certificationLevelName?: string; // 认证级别名称（前端展示用）
  remark?: string; // 备注说明
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 公司授课认定接口（对应 teaching_records 表）
 */
export interface TeachingRecord {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号（授课人）
  courseName: string; // 课程名称（必填）
  courseType: number; // 授课类型：1-技能 2-管理 3-技术
  courseTypeName?: string; // 授课类型名称（前端展示用）
  remark?: string; // 备注说明
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 公司二级教育接口（对应 secondary_education 表）
 */
export interface SecondaryEducation {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  educationType: number; // 教育类型: 1-EHS, 2-安全, 3-保密, 4-质量, 5-消防, 6-其他
  educationTypeName?: string; // 教育类型名称（前端展示用）
  educationName?: string; // 教育名称（如需自定义）
  year: number; // 培训年度
  isCompleted: number; // 是否完成: 0-未完成, 1-已完成, 2-免修
  isCompletedName?: string; // 完成状态名称（前端展示用）
  completeDate?: string; // 完成日期
  score?: number; // 考核成绩
  certificateNo?: string; // 证书编号
  validUntil?: string; // 有效期至
  trainer?: string; // 培训讲师
  remark?: string; // 备注说明
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 荣誉情况接口（对应 honors 表）
 */
export interface Honor {
  id?: number; // 主键（自增）
  userCode: string; // 员工工号
  rewardType: string; // 奖励类型（如：劳动模范、先进工作者等）
  rewardName: string; // 奖励名称（必填）
  rewardDate: string; // 奖励日期（必填）
  rewardLevel?: string; // 奖励级别（如：国家级、省级、市级等）
  approvingAuthority?: string; // 批准（授予）机关名称
  rewardReason?: string; // 奖励事由
  ranking?: string; // 排名
  // MyBatis-Plus 通用字段
  creator?: string;
  createTime?: Date | string;
  updater?: string;
  updateTime?: Date | string;
  updateIp?: string;
  isDeleted?: number;
}

/**
 * 二级教育类型枚举
 */
export enum SecondaryEducationType {
  EHS = 1, // EHS
  SAFETY = 2, // 安全
  CONFIDENTIAL = 3, // 保密
  QUALITY = 4, // 质量
  FIRE = 5, // 消防
  OTHER = 6, // 其他
}

/**
 * 二级教育完成状态枚举
 */
export enum SecondaryEducationStatus {
  NOT_COMPLETED = 0, // 未完成
  COMPLETED = 1, // 已完成
  EXEMPT = 2, // 免修
}

/**
 * 授课认证级别枚举
 */
export enum CertificationLevel {
  JUNIOR = 1, // 初级
  INTERMEDIATE = 2, // 中级
  SENIOR = 3, // 高级
}

/**
 * 二级教育类型选项
 */
export const SecondaryEducationTypeOptions = [
  { label: 'EHS', value: SecondaryEducationType.EHS },
  { label: '安全', value: SecondaryEducationType.SAFETY },
  { label: '保密', value: SecondaryEducationType.CONFIDENTIAL },
  { label: '质量', value: SecondaryEducationType.QUALITY },
  { label: '消防', value: SecondaryEducationType.FIRE },
  { label: '其他', value: SecondaryEducationType.OTHER },
];

/**
 * 二级教育完成状态选项
 */
export const SecondaryEducationStatusOptions = [
  { label: '未完成', value: SecondaryEducationStatus.NOT_COMPLETED },
  { label: '已完成', value: SecondaryEducationStatus.COMPLETED },
  { label: '免修', value: SecondaryEducationStatus.EXEMPT },
];

/**
 * 授课认证级别选项
 */
export const CertificationLevelOptions = [
  { label: '初级', value: CertificationLevel.JUNIOR },
  { label: '中级', value: CertificationLevel.INTERMEDIATE },
  { label: '高级', value: CertificationLevel.SENIOR },
];

/**
 * 奖励类型选项
 */
export const RewardTypeOptions = [
  { label: '劳动模范', value: '劳动模范' },
  { label: '先进工作者', value: '先进工作者' },
  { label: '技术能手', value: '技术能手' },
  { label: '优秀员工', value: '优秀员工' },
  { label: '创新奖', value: '创新奖' },
  { label: '安全标兵', value: '安全标兵' },
  { label: '质量标兵', value: '质量标兵' },
  { label: '其他', value: '其他' },
];

/**
 * 奖励级别选项
 */
export const RewardLevelOptions = [
  { label: '国家级', value: '国家级' },
  { label: '省级', value: '省级' },
  { label: '市级', value: '市级' },
  { label: '区级', value: '区级' },
  { label: '公司级', value: '公司级' },
  { label: '部门级', value: '部门级' },
];
