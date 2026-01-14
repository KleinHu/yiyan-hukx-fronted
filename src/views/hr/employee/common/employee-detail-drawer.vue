<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :width="900"
    title="员工完整档案"
    :footer="false"
    class="employee-detail-drawer-wrapper"
    @cancel="handleClose"
  >
    <a-spin :loading="loading" style="width: 100%">
      <div v-if="employeeData" class="employee-detail-drawer">
        <!-- 员工基本信息头部：专业证件档案风格 -->
        <div class="profile-header archives-style centered">
          <div class="header-bg-overlay"></div>
          <div class="header-content-vertical">
            <!-- 2寸证件照区域 -->
            <div class="id-photo-section">
              <div class="id-photo-container">
                <img
                  v-if="employeeData.avatarUrl || employeeData.idCardPhotoUrl"
                  :src="employeeData.avatarUrl || employeeData.idCardPhotoUrl"
                  alt="id-photo"
                  class="id-photo"
                />
                <div v-else class="id-photo-placeholder">
                  <icon-user :size="48" />
                  <span>暂无照片</span>
                </div>
              </div>
              <div class="status-stamp">
                <a-tag
                  :color="
                    getStatusColor(
                      employeeData.status || employeeData.workStatus
                    )
                  "
                  size="small"
                  variant="light"
                >
                  {{
                    employeeData.statusName ||
                    employeeData.workStatusName ||
                    '-'
                  }}
                </a-tag>
              </div>
            </div>

            <!-- 核心档案信息 -->
            <div class="employee-core-info">
              <div class="name-line">
                <span class="name">{{ employeeData.userName }}</span>
                <span class="user-code">{{ employeeData.userCode }}</span>
              </div>
              <div class="title-line">
                <span class="job-title">{{
                  employeeData.jobTitle || employeeData.position || '-'
                }}</span>
                <span class="divider"></span>
                <span class="dept-name">{{
                  employeeData.departmentName || '-'
                }}</span>
              </div>
              <div class="identity-line">
                <a-space :size="8">
                  <a-tag
                    v-if="employeeData.isRepresentative"
                    color="arcoblue"
                    size="small"
                    >职工代表</a-tag
                  >
                  <a-tag
                    v-if="employeeData.isTeamLeader"
                    color="orange"
                    size="small"
                    >工组长</a-tag
                  >
                  <a-tag
                    v-if="employeeData.rankName || employeeData.level"
                    color="blue"
                    size="small"
                    >{{ employeeData.rankName || employeeData.level }}</a-tag
                  >
                  <a-tag
                    v-if="employeeData.professionalTitleName"
                    color="green"
                    size="small"
                    >{{ employeeData.professionalTitleName }}</a-tag
                  >
                </a-space>
              </div>
            </div>
          </div>
        </div>

        <div class="content-body">
          <!-- 核心身份信息 -->
          <a-card :bordered="false" class="info-card">
            <template #title>
              <div class="card-header-title">
                <div class="title-icon"><icon-idcard /></div>
                <span class="title">核心身份信息</span>
              </div>
            </template>
            <a-row :gutter="[24, 16]">
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">性别</span>
                  <span class="value">{{
                    employeeData.gender === 1
                      ? '男'
                      : employeeData.gender === 2
                      ? '女'
                      : '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">身份证号</span>
                  <span class="value">{{ employeeData.idCardNo || '-' }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">出生日期</span>
                  <span class="value">{{
                    formatDate(employeeData.birthDate)
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">联系电话</span>
                  <span class="value highlight">{{
                    employeeData.mobile || employeeData.phone || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">企业邮箱</span>
                  <span class="value">{{ employeeData.email || '-' }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">婚姻状况</span>
                  <span class="value">{{
                    getMaritalStatus(employeeData.maritalStatus)
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">政治面貌</span>
                  <span class="value">{{
                    getPoliticalStatus(employeeData.politicalStatus)
                  }}</span>
                </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- 行政岗位配置 -->
          <a-card :bordered="false" class="info-card">
            <template #title>
              <div class="card-header-title">
                <div class="title-icon"><icon-user-group /></div>
                <span class="title">行政岗位配置</span>
              </div>
            </template>
            <a-row :gutter="[24, 16]">
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">所属科室/部门</span>
                  <span class="value">{{
                    employeeData.departmentName || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">职位/职务</span>
                  <span class="value">{{
                    employeeData.jobTitle || employeeData.position || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">公司职级</span>
                  <span class="value">
                    <a-tag size="small" color="blue">{{
                      employeeData.rankName || employeeData.level || '-'
                    }}</a-tag>
                  </span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">专业职称</span>
                  <span class="value">
                    <a-tag
                      v-if="employeeData.professionalTitleName"
                      size="small"
                      color="green"
                      >{{ employeeData.professionalTitleName }}</a-tag
                    >
                    <span v-else>-</span>
                  </span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">在职状态</span>
                  <span class="value">{{
                    employeeData.statusName ||
                    employeeData.workStatusName ||
                    '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">入职日期</span>
                  <span class="value">{{
                    formatDate(employeeData.hireDate || employeeData.entryDate)
                  }}</span>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="info-item">
                  <span class="label">调入厂日期</span>
                  <span class="value">{{
                    formatDate(employeeData.transferDate)
                  }}</span>
                </div>
              </a-col>
              <a-col :span="16">
                <div class="info-item">
                  <span class="label">办公位置</span>
                  <span class="value">{{
                    employeeData.officeLocation || '-'
                  }}</span>
                </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- 核心岗位详细信息 -->
          <a-card v-if="positionData" :bordered="false" class="info-card">
            <template #title>
              <div class="card-header-title">
                <div class="title-icon"><icon-apps /></div>
                <span class="title">岗位细分详情</span>
              </div>
            </template>
            <a-row :gutter="[24, 16]">
              <a-col :span="6">
                <div class="info-item">
                  <span class="label">一级专业</span>
                  <span class="value">{{
                    positionData.primaryProfession || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="info-item">
                  <span class="label">二级专业</span>
                  <span class="value">{{
                    positionData.secondaryProfession || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="info-item">
                  <span class="label">岗位分类</span>
                  <span class="value">{{
                    positionData.jobCategory || '-'
                  }}</span>
                </div>
              </a-col>
              <a-col :span="6">
                <div class="info-item">
                  <span class="label">岗位序列</span>
                  <span class="value">{{
                    positionData.positionType || '-'
                  }}</span>
                </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- 列表类信息：教育、技能 -->
          <div class="list-section">
            <a-row :gutter="20">
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon green"><icon-book /></div>
                      <span class="title">教育背景</span>
                    </div>
                  </template>
                  <div v-if="educationList.length === 0" class="empty-list">
                    暂无教育记录
                  </div>
                  <div v-else class="data-list education-list">
                    <div
                      v-for="(item, index) in educationList"
                      :key="index"
                      class="data-item"
                    >
                      <a-row
                        justify="space-between"
                        align="center"
                        style="margin-bottom: 8px"
                      >
                        <a-col :span="16">
                          <a-tag size="small" color="green">{{
                            getDegreeName(item.degree)
                          }}</a-tag>
                        </a-col>
                        <a-col :span="8" style="text-align: right">
                          <span class="item-time">{{ item.endYear }} 毕业</span>
                        </a-col>
                      </a-row>
                      <div class="item-main">{{ item.major || '-' }}</div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon orange"><icon-skin /></div>
                      <span class="title">技能证书</span>
                    </div>
                  </template>
                  <div v-if="skillList.length === 0" class="empty-list">
                    暂无技能证书
                  </div>
                  <div v-else class="data-list skill-list">
                    <div
                      v-for="(item, index) in skillList"
                      :key="index"
                      class="data-item"
                    >
                      <div class="item-header">
                        <span class="item-title">{{ item.trade }}</span>
                      </div>
                      <div class="item-sub">
                        级别：<span class="highlight">{{ item.level }}</span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 列表类信息：左右分栏（联系人、绩效） -->
          <div class="list-section">
            <a-row :gutter="20">
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon purple"><icon-phone /></div>
                      <span class="title">紧急联系人</span>
                    </div>
                  </template>
                  <div v-if="!contactList?.length" class="empty-list">
                    暂无联系人
                  </div>
                  <div v-else class="data-list contact-list">
                    <div
                      v-for="(item, index) in contactList"
                      :key="index"
                      class="data-item"
                    >
                      <a-row
                        justify="space-between"
                        align="center"
                        style="margin-bottom: 8px"
                      >
                        <a-col :span="12">
                          <span class="item-title">{{ item.contactName }}</span>
                        </a-col>
                        <a-col :span="12" style="text-align: right">
                          <span class="item-time">{{ item.relationship }}</span>
                        </a-col>
                      </a-row>
                      <div class="item-sub">
                        <icon-phone style="margin-right: 4px" />
                        <span class="highlight">{{ item.phone }}</span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon red"><icon-star /></div>
                      <span class="title">绩效记录</span>
                    </div>
                  </template>
                  <div v-if="performanceList.length === 0" class="empty-list">
                    暂无绩效记录
                  </div>
                  <div v-else class="data-list performance-list">
                    <div
                      v-for="item in performanceList"
                      :key="item.year"
                      class="data-item"
                    >
                      <a-row
                        justify="space-between"
                        align="center"
                        style="margin-bottom: 8px"
                      >
                        <a-col :span="12">
                          <span class="item-title">{{ item.year }}年度</span>
                        </a-col>
                        <a-col :span="12" style="text-align: right">
                          <a-tag
                            size="small"
                            :color="getRatingColor(item.performanceRating)"
                            >{{ item.performanceRating || '-' }}</a-tag
                          >
                        </a-col>
                      </a-row>
                      <div class="item-sub">
                        分数：<span class="highlight">{{
                          item.score || '-'
                        }}</span>
                        <a-divider direction="vertical" />
                        <span>{{ item.isExempt ? '免考' : '参考' }}</span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 职级历史：全宽展示 -->
          <a-card :bordered="false" class="info-card">
            <template #title>
              <div class="card-header-title">
                <div class="title-icon blue"><icon-layers /></div>
                <span class="title">职级历史变动</span>
              </div>
            </template>
            <div v-if="rankHistoryList.length === 0" class="empty-list">
              暂无变动记录
            </div>
            <div v-else class="rank-history-list">
              <div
                v-for="(item, index) in rankHistoryList"
                :key="item.id || index"
                class="rank-history-item"
              >
                <a-row>
                  <a-col :flex="'24px'">
                    <div class="rank-history-line">
                      <div
                        class="rank-history-dot"
                        :class="{ 'dot-active': index === 0 }"
                      ></div>
                      <div
                        v-if="index !== rankHistoryList.length - 1"
                        class="rank-history-connector"
                      ></div>
                    </div>
                  </a-col>
                  <a-col flex="auto">
                    <div class="rank-history-content">
                      <div class="rank-history-header">
                        <div class="rank-history-date">
                          {{ formatDate(item.effectiveDate) }}
                        </div>
                      </div>
                      <div class="rank-name">
                        <span class="label">变更为：</span>
                        <a-tag color="arcoblue">{{
                          item.rankName || item.rankId || '-'
                        }}</a-tag>
                      </div>
                      <div v-if="item.reason" class="rank-reason">
                        <span class="label">原因：</span>
                        <span>{{ item.reason }}</span>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-card>

          <!-- 岗位师傅与授课认证 -->
          <div class="list-section">
            <a-row :gutter="20">
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon purple"><icon-user-group /></div>
                      <span class="title">岗位师傅</span>
                    </div>
                  </template>
                  <div v-if="mentorList.length === 0" class="empty-list">
                    暂无带教记录
                  </div>
                  <div v-else class="data-list mentor-list">
                    <div
                      v-for="item in mentorList"
                      :key="item.id"
                      class="data-item"
                    >
                      <a-row :gutter="16" style="margin-bottom: 8px">
                        <a-col :span="12">
                          <span class="item-label">岗位师傅：</span>
                          <span class="item-title">{{
                            item.positionMentorName || '-'
                          }}</span>
                        </a-col>
                        <a-col :span="12">
                          <span class="item-label">指导师傅：</span>
                          <span class="item-title">{{
                            item.guidanceMentorName || '-'
                          }}</span>
                        </a-col>
                      </a-row>
                      <div class="item-sub" style="margin-bottom: 6px">
                        <span class="item-label">授课内容：</span>
                        <a-space wrap size="mini">
                          <a-tag
                            v-for="(content, idx) in parseTeachingContents(
                              item.teachingContents
                            )"
                            :key="idx"
                            size="small"
                            color="arcoblue"
                            >{{ content }}</a-tag
                          >
                        </a-space>
                      </div>
                      <div class="item-time">
                        {{ formatDate(item.startDate) }} ~
                        {{ formatDate(item.endDate) }}
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon green"><icon-trophy /></div>
                      <span class="title">授课认证</span>
                    </div>
                  </template>
                  <div v-if="teachingCertList.length === 0" class="empty-list">
                    暂无授课认证
                  </div>
                  <div v-else class="data-list cert-list">
                    <div
                      v-for="item in teachingCertList"
                      :key="item.id"
                      class="data-item"
                    >
                      <div class="item-header">
                        <span class="item-title">{{ item.courseName }}</span>
                        <a-tag size="small" color="blue">
                          {{ getCertLevelName(item.certificationLevel) }}
                        </a-tag>
                      </div>
                      <div class="item-sub">
                        授课类型：<span class="highlight">{{
                          item.courseTypeName ||
                          getCourseTypeName(item.courseType)
                        }}</span>
                        <a-divider direction="vertical" />
                        认证日期：{{ formatDate(item.certificationDate) }}
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 授课认定与二级教育 -->
          <div class="list-section">
            <a-row :gutter="20">
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon blue"><icon-check-circle /></div>
                      <span class="title">授课认定</span>
                    </div>
                  </template>
                  <div
                    v-if="teachingRecordList.length === 0"
                    class="empty-list"
                  >
                    暂无授课认定
                  </div>
                  <div v-else class="data-list record-list">
                    <div
                      v-for="item in teachingRecordList"
                      :key="item.id"
                      class="data-item"
                    >
                      <a-row
                        justify="space-between"
                        align="center"
                        style="margin-bottom: 8px"
                      >
                        <a-col :span="16">
                          <span class="item-title">{{ item.courseName }}</span>
                        </a-col>
                        <a-col :span="8" style="text-align: right">
                          <span class="item-time">{{
                            formatDate(item.createTime as string)
                          }}</span>
                        </a-col>
                      </a-row>
                      <div class="item-sub">
                        授课类型：<span class="highlight">{{
                          item.courseTypeName ||
                          getCourseTypeName(item.courseType)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
              <a-col :span="12">
                <a-card :bordered="false" class="info-card mini-card">
                  <template #title>
                    <div class="card-header-title">
                      <div class="title-icon orange"><icon-safe /></div>
                      <span class="title">二级教育</span>
                    </div>
                  </template>
                  <div v-if="secondaryEduList.length === 0" class="empty-list">
                    暂无二级教育记录
                  </div>
                  <div v-else class="data-list edu-list">
                    <div
                      v-for="item in secondaryEduList"
                      :key="item.id"
                      class="data-item"
                    >
                      <a-row
                        justify="space-between"
                        align="center"
                        style="margin-bottom: 8px"
                      >
                        <a-col :span="12">
                          <a-tag size="small" color="arcoblue">
                            {{ getEducationTypeName(item.educationType) }}
                          </a-tag>
                          <span class="item-title" style="margin-left: 8px"
                            >{{ item.year }}年</span
                          >
                        </a-col>
                        <a-col :span="12" style="text-align: right">
                          <a-tag
                            size="small"
                            :color="getCompletedStatusColor(item.isCompleted)"
                          >
                            {{ getCompletedStatusName(item.isCompleted) }}
                          </a-tag>
                        </a-col>
                      </a-row>
                      <div v-if="item.isCompleted === 1" class="item-sub">
                        完成日期：{{ formatDate(item.completeDate) }}
                        <span v-if="item.score">
                          <a-divider direction="vertical" />
                          成绩：<span class="highlight">{{ item.score }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 荣誉情况：全宽展示 -->
          <a-card :bordered="false" class="info-card">
            <template #title>
              <div class="card-header-title">
                <div class="title-icon red"><icon-gift /></div>
                <span class="title">荣誉情况</span>
              </div>
            </template>
            <div v-if="honorList.length === 0" class="empty-list">
              暂无荣誉记录
            </div>
            <div v-else class="honor-list">
              <div v-for="item in honorList" :key="item.id" class="honor-item">
                <a-row :gutter="16" align="center">
                  <a-col :span="6">
                    <div class="honor-type">
                      <a-tag :color="getRewardLevelColor(item.rewardLevel)">
                        {{ item.rewardLevel || '其他' }}
                      </a-tag>
                    </div>
                  </a-col>
                  <a-col :span="12">
                    <div class="honor-name">{{ item.rewardName }}</div>
                    <div class="honor-reason">
                      {{ item.rewardReason || '-' }}
                    </div>
                  </a-col>
                  <a-col :span="6" style="text-align: right">
                    <div class="honor-date">
                      {{ formatDate(item.rewardDate) }}
                    </div>
                    <div v-if="item.ranking" class="honor-ranking">
                      {{ item.ranking }}
                    </div>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-card>

          <a-card
            v-if="employeeData.remark"
            :bordered="false"
            class="info-card remark-card"
          >
            <template #title>
              <div class="card-header-title">
                <div class="title-icon"><icon-edit /></div>
                <span class="title">综合备注</span>
              </div>
            </template>
            <div class="remark-content">{{ employeeData.remark }}</div>
          </a-card>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type {
    Employee,
    Position,
    Education,
    SkillCertification,
    EmergencyContact,
    Performance,
    RankHistory,
    EmployeeMentor,
    TeachingCertification,
    TeachingRecord,
    SecondaryEducation,
    Honor,
  } from '@/api/hr/types';
  import employeeApi from '@/api/hr/employee';
  import employeeRecordApi from '@/api/hr/records';

  const props = defineProps<{
    visible: boolean;
    employeeId?: number;
    userCode?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
  }>();

  const drawerVisible = ref(props.visible);
  const employeeData = ref<Employee | null>(null);
  const positionData = ref<Position | null>(null);
  const educationList = ref<Education[]>([]);
  const skillList = ref<SkillCertification[]>([]);
  const contactList = ref<EmergencyContact[]>([]);
  const performanceList = ref<Performance[]>([]);
  const rankHistoryList = ref<RankHistory[]>([]);
  // 新增数据列表
  const mentorList = ref<EmployeeMentor[]>([]);
  const teachingCertList = ref<TeachingCertification[]>([]);
  const teachingRecordList = ref<TeachingRecord[]>([]);
  const secondaryEduList = ref<SecondaryEducation[]>([]);
  const honorList = ref<Honor[]>([]);
  const loading = ref(false);

  watch(
    () => props.visible,
    (val) => {
      drawerVisible.value = val;
      if (val && props.userCode) {
        fetchEmployeeDetail();
      }
    }
  );

  watch(
    () => props.userCode,
    () => {
      if (drawerVisible.value && props.userCode) {
        fetchEmployeeDetail();
      }
    }
  );

  watch(drawerVisible, (val) => {
    emit('update:visible', val);
    if (!val) {
      employeeData.value = null;
      positionData.value = null;
      educationList.value = [];
      skillList.value = [];
      contactList.value = [];
      performanceList.value = [];
      rankHistoryList.value = [];
      // 清空新增数据
      mentorList.value = [];
      teachingCertList.value = [];
      teachingRecordList.value = [];
      secondaryEduList.value = [];
      honorList.value = [];
    }
  });

  const fetchEmployeeDetail = async () => {
    // 优先使用userCode
    const { userCode } = props;
    if (!userCode) {
      return;
    }

    try {
      loading.value = true;

      // 获取员工基本信息
      const response = await employeeApi.getEmployeeByUserCode(userCode);
      if (response.code === 200 && response.data) {
        employeeData.value = response.data;

        // 获取扩展数据
        await Promise.all([
          fetchPosition(userCode),
          fetchEducation(userCode),
          fetchSkill(userCode),
          fetchContact(userCode),
          fetchPerformance(userCode),
          fetchRankHistory(userCode),
          // 新增数据获取
          fetchMentors(userCode),
          fetchTeachingCerts(userCode),
          fetchTeachingRecords(userCode),
          fetchSecondaryEducations(userCode),
          fetchHonors(userCode),
        ]);
      }
    } catch {
      // 获取员工详情失败，静默处理
    } finally {
      loading.value = false;
    }
  };

  const fetchPosition = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getPosition(userCode);
      if (res.code === 200 && res.data) {
        positionData.value = res.data;
      }
    } catch {
      // 获取岗位信息失败，静默处理
    }
  };

  const fetchEducation = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getEducationList(userCode);
      if (res.code === 200 && res.data) {
        educationList.value = res.data;
      }
    } catch {
      // 获取教育背景失败，静默处理
    }
  };

  const fetchSkill = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getSkillList(userCode);
      if (res.code === 200 && res.data) {
        skillList.value = res.data;
      }
    } catch {
      // 获取技能鉴定失败，静默处理
    }
  };

  const fetchContact = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getEmergencyContactList(userCode);
      if (res.code === 200 && res.data) {
        contactList.value = res.data;
      }
    } catch {
      // 获取紧急联系人失败，静默处理
    }
  };

  const fetchPerformance = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getPerformanceList(userCode);
      if (res.code === 200 && res.data) {
        // 按年度倒序排列
        performanceList.value = (res.data || []).sort(
          (a, b) => (b.year || 0) - (a.year || 0)
        );
      }
    } catch {
      // 获取绩效记录失败，静默处理
    }
  };

  const fetchRankHistory = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getRankHistoryList(userCode);
      if (res.code === 200 && res.data) {
        // 按生效日期倒序排列
        rankHistoryList.value = (res.data || []).sort(
          (a, b) =>
            new Date(b.effectiveDate).getTime() -
            new Date(a.effectiveDate).getTime()
        );
      }
    } catch {
      // 获取职级历史失败，静默处理
    }
  };

  // 获取岗位师傅（带教关系）
  const fetchMentors = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getMentorList(userCode);
      if (res.code === 200 && res.data) {
        mentorList.value = res.data;
      }
    } catch {
      // 静默处理
    }
  };

  // 获取授课认证
  const fetchTeachingCerts = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getTeachingCertList(userCode);
      if (res.code === 200 && res.data) {
        teachingCertList.value = res.data;
      }
    } catch {
      // 静默处理
    }
  };

  // 获取授课认定
  const fetchTeachingRecords = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getTeachingRecordList(userCode);
      if (res.code === 200 && res.data) {
        teachingRecordList.value = res.data;
      }
    } catch {
      // 静默处理
    }
  };

  // 获取二级教育
  const fetchSecondaryEducations = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getSecondaryEducationList(userCode);
      if (res.code === 200 && res.data) {
        secondaryEduList.value = res.data;
      }
    } catch {
      // 静默处理
    }
  };

  // 获取荣誉情况
  const fetchHonors = async (userCode: string) => {
    try {
      const res = await employeeRecordApi.getHonorList(userCode);
      if (res.code === 200 && res.data) {
        // 按奖励日期倒序
        honorList.value = (res.data || []).sort(
          (a, b) =>
            new Date(b.rewardDate).getTime() - new Date(a.rewardDate).getTime()
        );
      }
    } catch {
      // 静默处理
    }
  };

  // 解析授课内容JSON
  const parseTeachingContents = (contents?: string): string[] => {
    if (!contents) return [];
    try {
      return JSON.parse(contents);
    } catch {
      return contents ? [contents] : [];
    }
  };

  // 获取教育类型名称
  const getEducationTypeName = (type?: number): string => {
    const map: Record<number, string> = {
      1: 'EHS',
      2: '安全',
      3: '保密',
      4: '质量',
      5: '消防',
      6: '其他',
    };
    return type ? map[type] || '-' : '-';
  };

  // 获取完成状态名称
  const getCompletedStatusName = (status?: number): string => {
    const map: Record<number, string> = {
      0: '未完成',
      1: '已完成',
      2: '免修',
    };
    return status !== undefined ? map[status] || '-' : '-';
  };

  // 获取完成状态颜色
  const getCompletedStatusColor = (status?: number): string => {
    const map: Record<number, string> = {
      0: 'gray',
      1: 'green',
      2: 'orange',
    };
    return status !== undefined ? map[status] || 'gray' : 'gray';
  };

  // 获取认证级别名称
  const getCertLevelName = (level?: number): string => {
    const map: Record<number, string> = {
      1: '初级',
      2: '中级',
      3: '高级',
    };
    return level ? map[level] || '-' : '-';
  };

  // 获取奖励级别颜色
  const getRewardLevelColor = (level?: string): string => {
    if (!level) return 'gray';
    if (level.includes('国家')) return 'red';
    if (level.includes('省')) return 'orange';
    if (level.includes('市')) return 'gold';
    if (level.includes('公司')) return 'blue';
    return 'gray';
  };

  const handleClose = () => {
    drawerVisible.value = false;
  };

  const getStatusColor = (status?: number) => {
    switch (status) {
      case 1:
        return 'orange'; // 试用
      case 2:
        return 'green'; // 正式
      case 3:
        return 'red'; // 离职
      case 4:
        return 'gray'; // 退休
      case 5:
        return 'blue'; // 顶岗实习
      default:
        return 'gray';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const getMaritalStatus = (status?: number) => {
    const map: Record<number, string> = {
      1: '未婚',
      2: '已婚',
      3: '离异',
      4: '丧偶',
    };
    return status ? map[status] || '-' : '-';
  };

  const getPoliticalStatus = (status?: number) => {
    const map: Record<number, string> = {
      1: '党员',
      2: '积极分子',
      3: '群众',
    };
    return status ? map[status] || '-' : '-';
  };

  const getDegreeName = (degree?: number) => {
    const map: Record<number, string> = {
      1: '博士',
      2: '硕士',
      3: '本科',
      4: '大专',
      5: '高中',
      6: '中专',
    };
    return degree ? map[degree] || '-' : '-';
  };

  const getCourseTypeName = (courseType?: number) => {
    const map: Record<number, string> = {
      1: '技能',
      2: '管理',
      3: '技术',
    };
    return courseType ? map[courseType] || '-' : '-';
  };

  const getRatingColor = (rating?: string) => {
    if (!rating) return 'gray';
    if (rating.startsWith('A')) return 'green';
    if (rating.startsWith('B')) return 'blue';
    if (rating.startsWith('C')) return 'orange';
    return 'red';
  };
</script>

<style scoped lang="less">
  .employee-detail-drawer-wrapper {
    :deep(.arco-drawer-body) {
      padding: 0;
      background-color: #f8fafc;
    }
  }

  .employee-detail-drawer {
    .profile-header.archives-style.centered {
      background: #fff;
      padding: 48px 0 32px;
      border-bottom: 1px solid #f2f3f5;
      position: relative;
      display: flex;
      justify-content: center;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #165dff 0%, #3491fa 100%);
      }

      .header-content-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
        position: relative;
        z-index: 1;
      }

      .id-photo-section {
        position: relative;

        .id-photo-container {
          width: 120px;
          height: 168px;
          background: #fff;
          border: 1px solid #e5e6eb;
          padding: 4px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;

          .id-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
          }

          .id-photo-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #c9cdd4;
            gap: 12px;
            font-size: 13px;
          }
        }

        .status-stamp {
          position: absolute;
          top: -12px;
          right: -24px;
          transform: rotate(12deg);
          z-index: 2;

          .arco-tag {
            border-radius: 4px;
            padding: 2px 10px;
            font-weight: 800;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border: 2px solid currentColor;
            background: #fff !important;
            letter-spacing: 1px;
          }
        }
      }

      .employee-core-info {
        text-align: center;

        .name-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;

          .name {
            font-size: 36px;
            font-weight: 800;
            color: #1d2129;
            letter-spacing: 2px;
          }

          .user-code {
            font-size: 16px;
            color: #86909c;
            font-family: 'Roboto Mono', monospace;
            background: #f2f3f5;
            padding: 2px 10px;
            border-radius: 6px;
            font-weight: 500;
          }
        }

        .title-line {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #4e5969;
          font-size: 16px;

          .job-title {
            color: #165dff;
            font-weight: 600;
          }

          .divider {
            width: 1px;
            height: 14px;
            background: #e5e6eb;
          }

          .dept-name {
            font-weight: 500;
          }
        }

        .identity-line {
          display: flex;
          justify-content: center;

          .arco-tag {
            padding: 0 12px;
            font-weight: 500;
          }
        }
      }
    }

    .content-body {
      padding: 24px 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-card {
      background: #fafbfc;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e6eb;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
        border-color: #d9d9d9;
      }

      :deep(.arco-card-header) {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e5e6eb;
        background: linear-gradient(to bottom, #f5f6f7 0%, #fafbfc 100%);
      }

      :deep(.arco-card-body) {
        padding: 24px;
      }

      .card-header-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(22, 93, 255, 0.08);
          color: #165dff;
          border-radius: 8px;
          font-size: 16px;

          &.green {
            background: rgba(0, 180, 42, 0.08);
            color: #00b42a;
          }
          &.orange {
            background: rgba(255, 125, 0, 0.08);
            color: #ff7d00;
          }
          &.red {
            background: rgba(245, 63, 63, 0.08);
            color: #f53f3f;
          }
          &.purple {
            background: rgba(114, 46, 209, 0.08);
            color: #722ed1;
          }
          &.blue {
            background: rgba(52, 145, 250, 0.08);
            color: #3491fa;
          }
        }

        .title {
          font-size: 16px;
          font-weight: 700;
          color: #1d2129;
        }
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .label {
          font-size: 12px;
          color: #86909c;
          font-weight: 500;
          text-transform: uppercase;
        }

        .value {
          font-size: 14px;
          color: #1d2129;
          font-weight: 500;
          min-height: 20px;

          &.highlight {
            color: #165dff;
            font-weight: 600;
          }
        }
      }

      .empty-list {
        padding: 20px 0;
        text-align: center;
        color: #86909c;
        font-size: 13px;
        background: #f7f8fa;
        border-radius: 8px;
      }

      .data-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .data-item {
          padding: 12px 16px;
          background: #f7f8fa;
          border-radius: 8px;
          border-left: 3px solid transparent;
          transition: all 0.2s;

          &:hover {
            background: #f2f3f5;
            transform: translateX(4px);
          }

          .item-time {
            font-size: 12px;
            color: #86909c;
          }

          .item-title {
            font-weight: 600;
            color: #1d2129;
            font-size: 14px;
          }

          .item-main {
            font-size: 14px;
            color: #4e5969;
            font-weight: 500;
          }

          .item-sub {
            font-size: 13px;
            color: #86909c;

            .highlight {
              color: #165dff;
              font-weight: 600;
            }
          }
        }

        &.education-list .data-item {
          border-left-color: #00b42a;
        }

        &.skill-list .data-item {
          border-left-color: #ff7d00;
        }

        &.contact-list .data-item {
          border-left-color: #722ed1;
        }

        &.performance-list .data-item {
          border-left-color: #f53f3f;
        }

        &.mentor-list .data-item {
          border-left-color: #722ed1;
        }

        &.cert-list .data-item {
          border-left-color: #00b42a;

          .item-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }
        }

        &.record-list .data-item {
          border-left-color: #3491fa;
        }

        &.edu-list .data-item {
          border-left-color: #ff7d00;
        }

        .item-label {
          color: #86909c;
          font-size: 12px;
        }
      }

      &.mini-card {
        :deep(.arco-card-body) {
          padding: 20px;
        }
        height: 100%;
      }

      .remark-content {
        background: #f7f8fa;
        padding: 16px;
        border-radius: 8px;
        color: #4e5969;
        line-height: 1.6;
        font-size: 14px;
        border-left: 4px solid #e5e6eb;
      }

      .empty-state {
        padding: 40px 0;
        text-align: center;
      }

      .rank-history-list {
        padding: 0 20px;
        position: relative;

        .rank-history-item {
          position: relative;
          padding-bottom: 24px;

          &:last-child {
            padding-bottom: 0;

            .rank-history-connector {
              display: none;
            }
          }

          .rank-history-line {
            position: relative;
            width: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;

            .rank-history-dot {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #d9d9d9;
              border: 2px solid #fff;
              box-shadow: 0 0 0 2px #d9d9d9;
              z-index: 2;
              transition: all 0.3s;

              &.dot-active {
                background: #3491fa;
                box-shadow: 0 0 0 2px #3491fa;
                width: 14px;
                height: 14px;
              }
            }

            .rank-history-connector {
              position: absolute;
              top: 12px;
              left: 50%;
              transform: translateX(-50%);
              width: 2px;
              height: calc(100% - 12px);
              background: #e5e6eb;
              z-index: 1;
            }
          }

          .rank-history-content {
            flex: 1;
            padding-left: 16px;
            padding-top: 2px;

            .rank-history-header {
              margin-bottom: 8px;

              .rank-history-date {
                font-size: 13px;
                color: #86909c;
                font-weight: 500;
              }
            }

            .rank-name {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
              font-size: 14px;

              .label {
                color: #86909c;
              }
            }

            .rank-reason {
              font-size: 13px;
              color: #4e5969;
              margin-top: 4px;
              line-height: 1.6;

              .label {
                color: #86909c;
                margin-right: 4px;
              }
            }
          }
        }
      }

      .honor-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .honor-item {
          padding: 16px 20px;
          background: linear-gradient(135deg, #fef7f5 0%, #fdfbfa 100%);
          border-radius: 10px;
          border: 1px solid #ffe4de;
          transition: all 0.2s;

          &:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(245, 63, 63, 0.1);
          }

          .honor-type {
            .arco-tag {
              font-weight: 600;
            }
          }

          .honor-name {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            margin-bottom: 4px;
          }

          .honor-reason {
            font-size: 13px;
            color: #86909c;
            line-height: 1.5;
          }

          .honor-date {
            font-size: 13px;
            color: #4e5969;
            font-weight: 500;
          }

          .honor-ranking {
            font-size: 12px;
            color: #ff7d00;
            margin-top: 4px;
          }
        }
      }
    }
  }
</style>
