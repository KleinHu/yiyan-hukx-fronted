<template>
  <a-card :bordered="false" class="panel-card right-panel-card">
    <a-spin
      :loading="detailLoading || submitLoading"
      style="width: 100%; height: 100%; min-height: 200px"
    >
      <div v-if="userCode || isAdding" class="right-panel">
        <div class="detail-header-sticky">
          <div class="person-summary">
            <a-avatar :size="54" class="header-avatar">
              {{ formData.userName?.charAt(0) }}
            </a-avatar>
            <div class="info">
              <div class="main">
                <span class="name">{{
                  isAdding ? '新进员工录入' : formData.userName
                }}</span>
                <span v-if="!isAdding" class="code">{{
                  formData.userCode
                }}</span>
              </div>
              <div class="sub">
                {{ formData.departmentName || '待定科室' }} ·
                {{ formData.jobTitle || '待定职位' }}
              </div>
            </div>
          </div>
          <a-space>
            <a-button @click="handleCancel">
              {{ isAdding ? '取消新增' : '取消修改' }}
            </a-button>
            <a-button
              type="primary"
              :loading="submitLoading"
              @click="handleSave"
            >
              <template #icon><icon-save /></template>提交保存
            </a-button>
          </a-space>
        </div>

        <div class="scroll-form-container">
          <a-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            layout="vertical"
            class="full-width-form"
          >
            <a-row :gutter="[24, 12]">
              <!-- 员工基础信息（核心身份 + 行政岗位） -->
              <a-col :span="24">
                <employee-basic-info
                  :model-value="formData"
                  :is-adding="isAdding"
                  :department-tree-data="departmentTreeData"
                  :job-rank-list="jobRankList"
                  :professional-title-list="professionalTitleList"
                  @update:model-value="handleFormDataUpdate"
                  @open-photo-editor="handleOpenPhotoEditor"
                  @title-change="handleTitleChange"
                />
              </a-col>

              <!-- 核心岗位详细信息（独立一行，美化 UI） -->
              <a-col :span="12">
                <position-detail
                  :model-value="extData.position"
                  @update:model-value="handlePositionUpdate"
                />
              </a-col>

              <!-- 教育背景 -->
              <record-card-section
                title="教育背景"
                :count="educationCount"
                add-button-text="新增教育经历"
                @add="educationListRef?.handleAdd?.()"
              >
                <template #icon><icon-book /></template>
                <employee-education-list
                  ref="educationListRef"
                  :key="`edu-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 技能鉴定与证书 -->
              <record-card-section
                title="技能鉴定与证书"
                :count="skillCount"
                add-button-text="新增技能鉴定"
                @add="skillsListRef?.handleAdd?.()"
              >
                <template #icon><icon-skin /></template>
                <employee-skills-list
                  ref="skillsListRef"
                  :key="`skill-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 紧急联系人 -->
              <record-card-section
                title="紧急联系人"
                :count="contactCount"
                add-button-text="新增紧急联系人"
                @add="contactsListRef?.handleAdd?.()"
              >
                <template #icon><icon-phone /></template>
                <employee-contacts-list
                  ref="contactsListRef"
                  :key="`contact-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 绩效记录 -->
              <record-card-section
                title="绩效记录"
                :count="performanceCount"
                add-button-text="新增绩效记录"
                @add="performanceListRef?.handleAdd?.()"
              >
                <template #icon><icon-star /></template>
                <employee-performance-list
                  ref="performanceListRef"
                  :key="`perf-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 职级历史 -->
              <record-card-section
                title="职级历史"
                :count="rankCount"
                add-button-text="新增职级变动"
                @add="rankTimelineRef?.handleAdd?.()"
              >
                <template #icon><icon-layers /></template>
                <employee-rank-timeline
                  ref="rankTimelineRef"
                  :key="`rank-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 岗位师傅 -->
              <record-card-section
                title="岗位师傅"
                :count="mentorCount"
                add-button-text="新增带教记录"
                @add="mentorsListRef?.handleAdd?.()"
              >
                <template #icon><icon-user-group /></template>
                <employee-mentors-list
                  ref="mentorsListRef"
                  :key="`mentor-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 授课认证 -->
              <record-card-section
                title="授课认证"
                :count="teachingCertCount"
                add-button-text="新增授课认证"
                @add="teachingCertListRef?.handleAdd?.()"
              >
                <template #icon><icon-trophy /></template>
                <employee-teaching-cert-list
                  ref="teachingCertListRef"
                  :key="`tcert-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 授课认定 -->
              <record-card-section
                title="授课认定"
                :count="teachingRecordCount"
                add-button-text="新增授课认定"
                @add="teachingRecordListRef?.handleAdd?.()"
              >
                <template #icon><icon-check-circle /></template>
                <employee-teaching-record-list
                  ref="teachingRecordListRef"
                  :key="`trecord-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 二级教育 -->
              <record-card-section
                title="二级教育"
                :count="secondaryEduCount"
                add-button-text="新增二级教育"
                @add="secondaryEduListRef?.handleAdd?.()"
              >
                <template #icon><icon-safe /></template>
                <employee-secondary-edu-list
                  ref="secondaryEduListRef"
                  :key="`sedu-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 荣誉情况 -->
              <record-card-section
                title="荣誉情况"
                :count="honorCount"
                add-button-text="新增荣誉记录"
                @add="honorsListRef?.handleAdd?.()"
              >
                <template #icon><icon-gift /></template>
                <employee-honors-list
                  ref="honorsListRef"
                  :key="`honor-${formData.userCode || 'new'}`"
                  :user-code="formData.userCode || ''"
                  :is-new-mode="isAdding"
                  hide-header
                />
              </record-card-section>

              <!-- 综合备注 -->
              <a-col :span="24">
                <remark-section
                  :model-value="formData"
                  @update:model-value="handleFormDataUpdate"
                />
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>
      <div v-else class="empty-detail">
        <div class="empty-content">
          <icon-user :size="80" />
          <h3>人事管理工作台</h3>
          <p>请在左侧名录中选择员工，或点击"新增"按钮录入新成员档案</p>
        </div>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type {
    Employee,
    JobRank,
    ProfessionalTitle,
    Position,
  } from '@/api/hr/types';
  import employeeApi from '@/api/hr/employee';
  import employeeRecordApi from '@/api/hr/records';
  import EmployeeBasicInfo from '@/views/hr/employee/manage/components/form-sections/employee-basic-info.vue';
  import PositionDetail from './form-sections/position-detail.vue';
  import RemarkSection from './form-sections/remark-section.vue';
  import RecordCardSection from './form-sections/record-card-section.vue';
  import EmployeePerformanceList from '../../common/employee-performance-list.vue';
  import EmployeeRankTimeline from '../../common/employee-rank-timeline.vue';
  import EmployeeSkillsList from '../../common/employee-skills-list.vue';
  import EmployeeContactsList from '../../common/employee-contacts-list.vue';
  import EmployeeEducationList from '../../common/employee-education-list.vue';
  import EmployeeMentorsList from '../../common/employee-mentors-list.vue';
  import EmployeeTeachingCertList from '../../common/employee-teaching-cert-list.vue';
  import EmployeeTeachingRecordList from '../../common/employee-teaching-record-list.vue';
  import EmployeeSecondaryEduList from '../../common/employee-secondary-edu-list.vue';
  import EmployeeHonorsList from '../../common/employee-honors-list.vue';

  interface Props {
    userCode?: string | null; // 员工工号（编辑模式）
    isAdding: boolean; // 是否新增模式
    submitLoading: boolean;
    departmentTreeData: any[];
    jobRankList: JobRank[];
    professionalTitleList: ProfessionalTitle[];
    rules: any;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (
      e: 'save',
      data: {
        formData: Partial<Employee>;
        extData: { position: Partial<Position> };
      }
    ): void;
    (e: 'openPhotoEditor'): void;
  }>();

  const formRef = ref();

  // 子组件引用
  const educationListRef = ref();
  const skillsListRef = ref();
  const contactsListRef = ref();
  const performanceListRef = ref();
  const rankTimelineRef = ref();
  const mentorsListRef = ref();
  const teachingCertListRef = ref();
  const teachingRecordListRef = ref();
  const secondaryEduListRef = ref();
  const honorsListRef = ref();

  // 内部状态
  const detailLoading = ref(false);
  const formData = reactive<Partial<Employee>>({});
  const extData = reactive({
    position: {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    } as Partial<Position>,
  });

  /**
   * 重置表单数据
   */
  const resetFormData = () => {
    Object.keys(formData).forEach((key) => delete (formData as any)[key]);
    formData.gender = 1;
    formData.status = 1;
    formData.politicalStatus = 3; // 默认群众

    extData.position = {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    };
  };

  /**
   * 根据 userCode 加载员工详情
   */
  const loadEmployeeDetail = async (userCode: string) => {
    try {
      detailLoading.value = true;

      // 1. 获取员工基础信息
      const { data: employeeData } = await employeeApi.getEmployeeByUserCode(
        userCode
      );
      if (employeeData) {
        Object.assign(formData, employeeData);
      }

      // 2. 获取岗位扩展信息
      try {
        const posRes = await employeeRecordApi.getPosition(userCode);
        if (posRes.code === 200 && posRes.data) {
          extData.position = { ...posRes.data };
        }
      } catch (_e) {
        // 获取岗位详细信息失败，静默处理
      }
    } catch (error) {
      Message.error('获取员工详情失败');
    } finally {
      detailLoading.value = false;
    }
  };

  /**
   * 监听 userCode 变化，自动加载数据
   */
  watch(
    () => props.userCode,
    (newUserCode) => {
      if (newUserCode && !props.isAdding) {
        loadEmployeeDetail(newUserCode);
      } else if (props.isAdding) {
        resetFormData();
      }
    },
    { immediate: true }
  );

  /**
   * 监听 isAdding 变化
   */
  watch(
    () => props.isAdding,
    (newIsAdding) => {
      if (newIsAdding) {
        resetFormData();
      }
    }
  );

  const handleTitleChange = (titleId: string) => {
    const selectedTitle = props.professionalTitleList.find(
      (t) => t.titleId === titleId
    );
    if (selectedTitle) {
      formData.professionalTitleName = selectedTitle.titleName || '';
    }
  };

  const handleOpenPhotoEditor = () => {
    emit('openPhotoEditor');
  };

  const handleCancel = () => {
    emit('cancel');
  };

  const handleSave = () => {
    emit('save', {
      formData: { ...formData },
      extData: {
        position: { ...extData.position },
      },
    });
  };

  const handleFormDataUpdate = (value: Partial<Employee>) => {
    Object.assign(formData, value);
  };

  const handlePositionUpdate = (value: Partial<Position>) => {
    Object.assign(extData.position, value);
  };

  // 计算各模块数量
  const educationCount = computed(() => {
    return educationListRef.value?.count || 0;
  });
  const skillCount = computed(() => {
    return skillsListRef.value?.count || 0;
  });
  const contactCount = computed(() => {
    return contactsListRef.value?.count || 0;
  });
  const mentorCount = computed(() => {
    return mentorsListRef.value?.count || 0;
  });
  const teachingCertCount = computed(() => {
    return teachingCertListRef.value?.count || 0;
  });
  const teachingRecordCount = computed(() => {
    return teachingRecordListRef.value?.count || 0;
  });
  const secondaryEduCount = computed(() => {
    return secondaryEduListRef.value?.count || 0;
  });
  const honorCount = computed(() => {
    return honorsListRef.value?.count || 0;
  });
  const performanceCount = computed(() => {
    return performanceListRef.value?.count || 0;
  });
  const rankCount = computed(() => {
    return rankTimelineRef.value?.count || 0;
  });

  // 暴露方法和引用供父组件使用
  defineExpose({
    formRef,
    formData,
    extData,
    educationListRef,
    skillsListRef,
    contactsListRef,
    performanceListRef,
    rankTimelineRef,
    mentorsListRef,
    teachingCertListRef,
    teachingRecordListRef,
    secondaryEduListRef,
    honorsListRef,
  });
</script>

<style scoped lang="less">
  .right-panel-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    background-color: #fff;

    :deep(.arco-card-body) {
      height: 100%;
      padding: 15px;
      border-radius: 12px;
      overflow: hidden;
    }
  }

  .right-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .detail-header-sticky {
      padding: 12px 24px;
      background-color: #fff;
      border-bottom: 1px solid #f2f3f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;

      .person-summary {
        display: flex;
        align-items: center;

        .header-avatar {
          margin-right: 16px;
          border: 2px solid #e8f3ff;
        }

        .info {
          .main {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 2px;

            .name {
              font-size: 18px;
              font-weight: 600;
              color: #1d2129;
            }

            .code {
              font-size: 12px;
              background: #f2f3f5;
              padding: 1px 6px;
              border-radius: 4px;
              color: #4e5969;
            }
          }

          .sub {
            font-size: 12px;
            color: #86909c;
          }
        }
      }
    }

    .scroll-form-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
      background-color: #f7f8fa;

      .full-width-form {
        max-width: 1400px;
        margin: 0 auto;
      }
    }
  }

  .empty-detail {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;

    .empty-content {
      text-align: center;
      color: #86909c;

      .arco-icon {
        color: #e5e6eb;
        margin-bottom: 16px;
      }

      h3 {
        color: #1d2129;
        margin-bottom: 8px;
      }
    }
  }
</style>
