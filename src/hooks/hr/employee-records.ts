import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import employeeRecordApi from '@/api/hr/records';
import type {
  Education,
  Position,
  SkillCertification,
  InternalTrainer,
  RankHistory,
  Performance,
  EmergencyContact,
  EmployeeMentor,
  TeachingCertification,
  TeachingRecord,
  SecondaryEducation,
  Honor,
} from '@/api/hr/types';

/**
 * 员工记录管理 Hook（包含所有子表操作）
 * @param userCode 员工工号
 * @returns 员工记录相关数据和方法
 */
function useEmployeeRecords(userCode: string) {
  const loading = ref(false);

  // === 教育背景 ===
  const educationList = ref<Education[]>([]);
  const fetchEducationList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getEducationList(userCode);
      educationList.value = data || [];
    } catch (error) {
      console.error('获取教育背景失败:', error);
      Message.error('获取教育背景失败');
      educationList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createEducation = async (data: Partial<Education>): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createEducation(userCode, data);
      Message.success('新增教育背景成功');
      await fetchEducationList();
      return true;
    } catch (error) {
      console.error('新增教育背景失败:', error);
      Message.error('新增教育背景失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateEducation = async (
    id: number,
    data: Partial<Education>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateEducation(id, data);
      Message.success('更新教育背景成功');
      await fetchEducationList();
      return true;
    } catch (error) {
      console.error('更新教育背景失败:', error);
      Message.error('更新教育背景失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteEducation = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteEducation(id);
      Message.success('删除教育背景成功');
      await fetchEducationList();
      return true;
    } catch (error) {
      console.error('删除教育背景失败:', error);
      Message.error('删除教育背景失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 岗位信息 ===
  const position = ref<Position | null>(null);
  const fetchPosition = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getPosition(userCode);
      position.value = data || null;
    } catch (error) {
      console.error('获取岗位信息失败:', error);
      Message.error('获取岗位信息失败');
      position.value = null;
    } finally {
      loading.value = false;
    }
  };

  const savePosition = async (data: Partial<Position>): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.savePosition(userCode, data);
      Message.success('保存岗位信息成功');
      await fetchPosition();
      return true;
    } catch (error) {
      console.error('保存岗位信息失败:', error);
      Message.error('保存岗位信息失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 技能鉴定 ===
  const skillList = ref<SkillCertification[]>([]);
  const fetchSkillList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getSkillList(userCode);
      skillList.value = data || [];
    } catch (error) {
      console.error('获取技能鉴定失败:', error);
      Message.error('获取技能鉴定失败');
      skillList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createSkill = async (
    data: Partial<SkillCertification>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createSkill(userCode, data);
      Message.success('新增技能鉴定成功');
      await fetchSkillList();
      return true;
    } catch (error) {
      console.error('新增技能鉴定失败:', error);
      Message.error('新增技能鉴定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateSkill = async (
    id: number,
    data: Partial<SkillCertification>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateSkill(id, data);
      Message.success('更新技能鉴定成功');
      await fetchSkillList();
      return true;
    } catch (error) {
      console.error('更新技能鉴定失败:', error);
      Message.error('更新技能鉴定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteSkill = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteSkill(id);
      Message.success('删除技能鉴定成功');
      await fetchSkillList();
      return true;
    } catch (error) {
      console.error('删除技能鉴定失败:', error);
      Message.error('删除技能鉴定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 内训信息 ===
  const internalTrainerList = ref<InternalTrainer[]>([]);
  const fetchInternalTrainerList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getInternalTrainerList(userCode);
      internalTrainerList.value = data || [];
    } catch (error) {
      console.error('获取内训信息失败:', error);
      Message.error('获取内训信息失败');
      internalTrainerList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createInternalTrainer = async (
    data: Partial<InternalTrainer>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createInternalTrainer(userCode, data);
      Message.success('新增内训信息成功');
      await fetchInternalTrainerList();
      return true;
    } catch (error) {
      console.error('新增内训信息失败:', error);
      Message.error('新增内训信息失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateInternalTrainer = async (
    id: number,
    data: Partial<InternalTrainer>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateInternalTrainer(id, data);
      Message.success('更新内训信息成功');
      await fetchInternalTrainerList();
      return true;
    } catch (error) {
      console.error('更新内训信息失败:', error);
      Message.error('更新内训信息失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteInternalTrainer = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteInternalTrainer(id);
      Message.success('删除内训信息成功');
      await fetchInternalTrainerList();
      return true;
    } catch (error) {
      console.error('删除内训信息失败:', error);
      Message.error('删除内训信息失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 职级历史 ===
  const rankHistoryList = ref<RankHistory[]>([]);
  const fetchRankHistoryList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getRankHistoryList(userCode);
      rankHistoryList.value = data || [];
    } catch (error) {
      console.error('获取职级历史失败:', error);
      Message.error('获取职级历史失败');
      rankHistoryList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createRankHistory = async (
    data: Partial<RankHistory>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createRankHistory(userCode, data);
      Message.success('新增职级历史成功');
      await fetchRankHistoryList();
      return true;
    } catch (error) {
      console.error('新增职级历史失败:', error);
      Message.error('新增职级历史失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateRankHistory = async (
    id: number,
    data: Partial<RankHistory>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateRankHistory(id, data);
      Message.success('更新职级历史成功');
      await fetchRankHistoryList();
      return true;
    } catch (error) {
      console.error('更新职级历史失败:', error);
      Message.error('更新职级历史失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteRankHistory = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteRankHistory(id);
      Message.success('删除职级历史成功');
      await fetchRankHistoryList();
      return true;
    } catch (error) {
      console.error('删除职级历史失败:', error);
      Message.error('删除职级历史失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 绩效记录 ===
  const performanceList = ref<Performance[]>([]);
  const fetchPerformanceList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getPerformanceList(userCode);
      performanceList.value = data || [];
    } catch (error) {
      console.error('获取绩效记录失败:', error);
      Message.error('获取绩效记录失败');
      performanceList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const savePerformance = async (
    data: Partial<Performance>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.savePerformance(userCode, data);
      Message.success('保存绩效记录成功');
      await fetchPerformanceList();
      return true;
    } catch (error) {
      console.error('保存绩效记录失败:', error);
      Message.error('保存绩效记录失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deletePerformance = async (year: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deletePerformance(userCode, year);
      Message.success('删除绩效记录成功');
      await fetchPerformanceList();
      return true;
    } catch (error) {
      console.error('删除绩效记录失败:', error);
      Message.error('删除绩效记录失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 紧急联系人 ===
  const emergencyContactList = ref<EmergencyContact[]>([]);
  const fetchEmergencyContactList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getEmergencyContactList(userCode);
      emergencyContactList.value = data || [];
    } catch (error) {
      console.error('获取紧急联系人失败:', error);
      Message.error('获取紧急联系人失败');
      emergencyContactList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createEmergencyContact = async (
    data: Partial<EmergencyContact>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createEmergencyContact(userCode, data);
      Message.success('新增紧急联系人成功');
      await fetchEmergencyContactList();
      return true;
    } catch (error) {
      console.error('新增紧急联系人失败:', error);
      Message.error('新增紧急联系人失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateEmergencyContact = async (
    id: number,
    data: Partial<EmergencyContact>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateEmergencyContact(id, data);
      Message.success('更新紧急联系人成功');
      await fetchEmergencyContactList();
      return true;
    } catch (error) {
      console.error('更新紧急联系人失败:', error);
      Message.error('更新紧急联系人失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteEmergencyContact = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteEmergencyContact(id);
      Message.success('删除紧急联系人成功');
      await fetchEmergencyContactList();
      return true;
    } catch (error) {
      console.error('删除紧急联系人失败:', error);
      Message.error('删除紧急联系人失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 岗位师傅 ===
  const mentorList = ref<EmployeeMentor[]>([]);
  const fetchMentorList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getMentorList(userCode);
      mentorList.value = data || [];
    } catch (error) {
      console.error('获取岗位师傅失败:', error);
      Message.error('获取岗位师傅失败');
      mentorList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createMentor = async (
    data: Partial<EmployeeMentor>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createMentor(userCode, data);
      Message.success('新增岗位师傅成功');
      await fetchMentorList();
      return true;
    } catch (error) {
      console.error('新增岗位师傅失败:', error);
      Message.error('新增岗位师傅失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateMentor = async (
    id: number,
    data: Partial<EmployeeMentor>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateMentor(id, data);
      Message.success('更新岗位师傅成功');
      await fetchMentorList();
      return true;
    } catch (error) {
      console.error('更新岗位师傅失败:', error);
      Message.error('更新岗位师傅失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteMentor = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteMentor(id);
      Message.success('删除岗位师傅成功');
      await fetchMentorList();
      return true;
    } catch (error) {
      console.error('删除岗位师傅失败:', error);
      Message.error('删除岗位师傅失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 授课认证 ===
  const teachingCertList = ref<TeachingCertification[]>([]);
  const fetchTeachingCertList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getTeachingCertList(userCode);
      teachingCertList.value = data || [];
    } catch (error) {
      console.error('获取授课认证失败:', error);
      Message.error('获取授课认证失败');
      teachingCertList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createTeachingCert = async (
    data: Partial<TeachingCertification>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createTeachingCert(userCode, data);
      Message.success('新增授课认证成功');
      await fetchTeachingCertList();
      return true;
    } catch (error) {
      console.error('新增授课认证失败:', error);
      Message.error('新增授课认证失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateTeachingCert = async (
    id: number,
    data: Partial<TeachingCertification>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateTeachingCert(id, data);
      Message.success('更新授课认证成功');
      await fetchTeachingCertList();
      return true;
    } catch (error) {
      console.error('更新授课认证失败:', error);
      Message.error('更新授课认证失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteTeachingCert = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteTeachingCert(id);
      Message.success('删除授课认证成功');
      await fetchTeachingCertList();
      return true;
    } catch (error) {
      console.error('删除授课认证失败:', error);
      Message.error('删除授课认证失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 授课认定 ===
  const teachingRecordList = ref<TeachingRecord[]>([]);
  const fetchTeachingRecordList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getTeachingRecordList(userCode);
      teachingRecordList.value = data || [];
    } catch (error) {
      console.error('获取授课认定失败:', error);
      Message.error('获取授课认定失败');
      teachingRecordList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createTeachingRecord = async (
    data: Partial<TeachingRecord>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createTeachingRecord(userCode, data);
      Message.success('新增授课认定成功');
      await fetchTeachingRecordList();
      return true;
    } catch (error) {
      console.error('新增授课认定失败:', error);
      Message.error('新增授课认定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateTeachingRecord = async (
    id: number,
    data: Partial<TeachingRecord>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateTeachingRecord(id, data);
      Message.success('更新授课认定成功');
      await fetchTeachingRecordList();
      return true;
    } catch (error) {
      console.error('更新授课认定失败:', error);
      Message.error('更新授课认定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteTeachingRecord = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteTeachingRecord(id);
      Message.success('删除授课认定成功');
      await fetchTeachingRecordList();
      return true;
    } catch (error) {
      console.error('删除授课认定失败:', error);
      Message.error('删除授课认定失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 二级教育 ===
  const secondaryEducationList = ref<SecondaryEducation[]>([]);
  const fetchSecondaryEducationList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getSecondaryEducationList(userCode);
      secondaryEducationList.value = data || [];
    } catch (error) {
      console.error('获取二级教育失败:', error);
      Message.error('获取二级教育失败');
      secondaryEducationList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createSecondaryEducation = async (
    data: Partial<SecondaryEducation>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createSecondaryEducation(userCode, data);
      Message.success('新增二级教育成功');
      await fetchSecondaryEducationList();
      return true;
    } catch (error) {
      console.error('新增二级教育失败:', error);
      Message.error('新增二级教育失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateSecondaryEducation = async (
    id: number,
    data: Partial<SecondaryEducation>
  ): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateSecondaryEducation(id, data);
      Message.success('更新二级教育成功');
      await fetchSecondaryEducationList();
      return true;
    } catch (error) {
      console.error('更新二级教育失败:', error);
      Message.error('更新二级教育失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteSecondaryEducation = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteSecondaryEducation(id);
      Message.success('删除二级教育成功');
      await fetchSecondaryEducationList();
      return true;
    } catch (error) {
      console.error('删除二级教育失败:', error);
      Message.error('删除二级教育失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  // === 荣誉情况 ===
  const honorList = ref<Honor[]>([]);
  const fetchHonorList = async (): Promise<void> => {
    try {
      loading.value = true;
      const { data } = await employeeRecordApi.getHonorList(userCode);
      honorList.value = data || [];
    } catch (error) {
      console.error('获取荣誉情况失败:', error);
      Message.error('获取荣誉情况失败');
      honorList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createHonor = async (data: Partial<Honor>): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.createHonor(userCode, data);
      Message.success('新增荣誉情况成功');
      await fetchHonorList();
      return true;
    } catch (error) {
      console.error('新增荣誉情况失败:', error);
      Message.error('新增荣誉情况失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateHonor = async (id: number, data: Partial<Honor>): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.updateHonor(id, data);
      Message.success('更新荣誉情况成功');
      await fetchHonorList();
      return true;
    } catch (error) {
      console.error('更新荣誉情况失败:', error);
      Message.error('更新荣誉情况失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteHonor = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await employeeRecordApi.deleteHonor(id);
      Message.success('删除荣誉情况成功');
      await fetchHonorList();
      return true;
    } catch (error) {
      console.error('删除荣誉情况失败:', error);
      Message.error('删除荣誉情况失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    // 教育背景
    educationList,
    fetchEducationList,
    createEducation,
    updateEducation,
    deleteEducation,
    // 岗位信息
    position,
    fetchPosition,
    savePosition,
    // 技能鉴定
    skillList,
    fetchSkillList,
    createSkill,
    updateSkill,
    deleteSkill,
    // 内训信息
    internalTrainerList,
    fetchInternalTrainerList,
    createInternalTrainer,
    updateInternalTrainer,
    deleteInternalTrainer,
    // 职级历史
    rankHistoryList,
    fetchRankHistoryList,
    createRankHistory,
    updateRankHistory,
    deleteRankHistory,
    // 绩效记录
    performanceList,
    fetchPerformanceList,
    savePerformance,
    deletePerformance,
    // 紧急联系人
    emergencyContactList,
    fetchEmergencyContactList,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    // 岗位师傅
    mentorList,
    fetchMentorList,
    createMentor,
    updateMentor,
    deleteMentor,
    // 授课认证
    teachingCertList,
    fetchTeachingCertList,
    createTeachingCert,
    updateTeachingCert,
    deleteTeachingCert,
    // 授课认定
    teachingRecordList,
    fetchTeachingRecordList,
    createTeachingRecord,
    updateTeachingRecord,
    deleteTeachingRecord,
    // 二级教育
    secondaryEducationList,
    fetchSecondaryEducationList,
    createSecondaryEducation,
    updateSecondaryEducation,
    deleteSecondaryEducation,
    // 荣誉情况
    honorList,
    fetchHonorList,
    createHonor,
    updateHonor,
    deleteHonor,
  };
}

export default useEmployeeRecords;
