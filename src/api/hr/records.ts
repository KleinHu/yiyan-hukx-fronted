import request from '@/utils/request/request';
import type {
  ApiResponse,
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
 * 员工档案相关子表 API
 */
const employeeRecordApi = {
  // === 教育背景 ===
  getEducationList(userCode: string): Promise<ApiResponse<Education[]>> {
    return request.get(`/api/hr/employees/${userCode}/educations`);
  },
  createEducation(
    userCode: string,
    data: Partial<Education>
  ): Promise<ApiResponse<number>> {
    return request.post(`/api/hr/employees/${userCode}/educations`, data);
  },
  updateEducation(
    id: number,
    data: Partial<Education>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/educations/${id}`, data);
  },
  deleteEducation(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/educations/${id}`);
  },

  // === 岗位信息 ===
  getPosition(userCode: string): Promise<ApiResponse<Position>> {
    return request.get(`/api/hr/employees/${userCode}/position`);
  },
  savePosition(
    userCode: string,
    data: Partial<Position>
  ): Promise<ApiResponse<boolean>> {
    return request.post(`/api/hr/employees/${userCode}/position`, data);
  },

  // === 技能鉴定 ===
  getSkillList(userCode: string): Promise<ApiResponse<SkillCertification[]>> {
    return request.get(`/api/hr/employees/${userCode}/skill-certifications`);
  },
  createSkill(
    userCode: string,
    data: Partial<SkillCertification>
  ): Promise<ApiResponse<number>> {
    return request.post(
      `/api/hr/employees/${userCode}/skill-certifications`,
      data
    );
  },
  updateSkill(
    id: number,
    data: Partial<SkillCertification>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/skill-certifications/${id}`, data);
  },
  deleteSkill(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/skill-certifications/${id}`);
  },

  // === 内训信息 ===
  getInternalTrainerList(
    userCode: string
  ): Promise<ApiResponse<InternalTrainer[]>> {
    return request.get(`/api/hr/employees/${userCode}/internal-trainers`);
  },
  createInternalTrainer(
    userCode: string,
    data: Partial<InternalTrainer>
  ): Promise<ApiResponse<number>> {
    return request.post(
      `/api/hr/employees/${userCode}/internal-trainers`,
      data
    );
  },
  updateInternalTrainer(
    id: number,
    data: Partial<InternalTrainer>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/internal-trainers/${id}`, data);
  },
  deleteInternalTrainer(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/internal-trainers/${id}`);
  },

  // === 职级历史 ===
  getRankHistoryList(userCode: string): Promise<ApiResponse<RankHistory[]>> {
    return request.get(`/api/hr/employees/${userCode}/rank-histories`);
  },
  createRankHistory(
    userCode: string,
    data: Partial<RankHistory>
  ): Promise<ApiResponse<number>> {
    return request.post(`/api/hr/employees/${userCode}/rank-histories`, data);
  },
  updateRankHistory(
    id: number,
    data: Partial<RankHistory>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/rank-histories/${id}`, data);
  },
  deleteRankHistory(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/rank-histories/${id}`);
  },

  // === 绩效记录 ===
  getPerformanceList(userCode: string): Promise<ApiResponse<Performance[]>> {
    return request.get(`/api/hr/employees/${userCode}/performances`);
  },
  savePerformance(
    userCode: string,
    data: Partial<Performance>
  ): Promise<ApiResponse<boolean>> {
    return request.post(`/api/hr/employees/${userCode}/performances`, data);
  },
  deletePerformance(
    userCode: string,
    year: number
  ): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/employees/${userCode}/performances/${year}`);
  },

  // === 紧急联系人 ===
  getEmergencyContactList(
    userCode: string
  ): Promise<ApiResponse<EmergencyContact[]>> {
    return request.get(`/api/hr/employees/${userCode}/emergency-contacts`);
  },
  createEmergencyContact(
    userCode: string,
    data: Partial<EmergencyContact>
  ): Promise<ApiResponse<number>> {
    return request.post(
      `/api/hr/employees/${userCode}/emergency-contacts`,
      data
    );
  },
  updateEmergencyContact(
    id: number,
    data: Partial<EmergencyContact>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/emergency-contacts/${id}`, data);
  },
  deleteEmergencyContact(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/emergency-contacts/${id}`);
  },

  // === 岗位师傅 ===
  getMentorList(userCode: string): Promise<ApiResponse<EmployeeMentor[]>> {
    return request.get(`/api/hr/employees/${userCode}/mentors`);
  },
  createMentor(
    userCode: string,
    data: Partial<EmployeeMentor>
  ): Promise<ApiResponse<number>> {
    return request.post(`/api/hr/employees/${userCode}/mentors`, data);
  },
  updateMentor(
    id: number,
    data: Partial<EmployeeMentor>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/mentors/${id}`, data);
  },
  deleteMentor(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/mentors/${id}`);
  },

  // === 授课认证 ===
  getTeachingCertList(
    userCode: string
  ): Promise<ApiResponse<TeachingCertification[]>> {
    return request.get(`/api/hr/employees/${userCode}/teaching-certifications`);
  },
  createTeachingCert(
    userCode: string,
    data: Partial<TeachingCertification>
  ): Promise<ApiResponse<number>> {
    return request.post(
      `/api/hr/employees/${userCode}/teaching-certifications`,
      data
    );
  },
  updateTeachingCert(
    id: number,
    data: Partial<TeachingCertification>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/teaching-certifications/${id}`, data);
  },
  deleteTeachingCert(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/teaching-certifications/${id}`);
  },

  // === 授课认定 ===
  getTeachingRecordList(
    userCode: string
  ): Promise<ApiResponse<TeachingRecord[]>> {
    return request.get(`/api/hr/employees/${userCode}/teaching-records`);
  },
  createTeachingRecord(
    userCode: string,
    data: Partial<TeachingRecord>
  ): Promise<ApiResponse<number>> {
    return request.post(`/api/hr/employees/${userCode}/teaching-records`, data);
  },
  updateTeachingRecord(
    id: number,
    data: Partial<TeachingRecord>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/teaching-records/${id}`, data);
  },
  deleteTeachingRecord(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/teaching-records/${id}`);
  },

  // === 二级教育 ===
  getSecondaryEducationList(
    userCode: string
  ): Promise<ApiResponse<SecondaryEducation[]>> {
    return request.get(`/api/hr/employees/${userCode}/secondary-educations`);
  },
  createSecondaryEducation(
    userCode: string,
    data: Partial<SecondaryEducation>
  ): Promise<ApiResponse<number>> {
    return request.post(
      `/api/hr/employees/${userCode}/secondary-educations`,
      data
    );
  },
  updateSecondaryEducation(
    id: number,
    data: Partial<SecondaryEducation>
  ): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/secondary-educations/${id}`, data);
  },
  deleteSecondaryEducation(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/secondary-educations/${id}`);
  },

  // === 荣誉情况 ===
  getHonorList(userCode: string): Promise<ApiResponse<Honor[]>> {
    return request.get(`/api/hr/employees/${userCode}/honors`);
  },
  createHonor(
    userCode: string,
    data: Partial<Honor>
  ): Promise<ApiResponse<number>> {
    return request.post(`/api/hr/employees/${userCode}/honors`, data);
  },
  updateHonor(id: number, data: Partial<Honor>): Promise<ApiResponse<boolean>> {
    return request.put(`/api/hr/honors/${id}`, data);
  },
  deleteHonor(id: number): Promise<ApiResponse<boolean>> {
    return request.delete(`/api/hr/honors/${id}`);
  },
};

export default employeeRecordApi;
