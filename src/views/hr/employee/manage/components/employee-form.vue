<template>
  <a-card :bordered="false" class="panel-card right-panel-card">
    <a-spin :loading="detailLoading" style="width: 100%; height: 100%">
      <div v-if="currentRecord || isAdding" class="right-panel">
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
            <a-row :gutter="24">
              <!-- 核心身份信息 -->
              <a-col :span="12">
                <identity-info
                  :model-value="formData"
                  :is-adding="isAdding"
                  @update:model-value="handleFormDataUpdate"
                  @open-photo-editor="handleOpenPhotoEditor"
                />
              </a-col>

              <!-- 行政岗位配置 -->
              <a-col :span="12">
                <position-config
                  :model-value="formData"
                  :department-tree-data="departmentTreeData"
                  :job-rank-list="jobRankList"
                  :professional-title-list="professionalTitleList"
                  @update:model-value="handleFormDataUpdate"
                  @title-change="handleTitleChange"
                />
              </a-col>

              <!-- 核心岗位详细信息 -->
              <a-col :span="12">
                <position-detail
                  :model-value="extData.position"
                  @update:model-value="handlePositionUpdate"
                />
              </a-col>

              <!-- 教育背景 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-book /> 教育背景
                      <a-badge
                        v-if="educationCount > 0"
                        :count="educationCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="educationListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增教育经历
                    </a-button>
                  </template>
                  <employee-education-list
                    ref="educationListRef"
                    :key="`edu-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 技能鉴定与证书 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-skin /> 技能鉴定与证书
                      <a-badge
                        v-if="skillCount > 0"
                        :count="skillCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="skillsListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增技能鉴定
                    </a-button>
                  </template>
                  <employee-skills-list
                    ref="skillsListRef"
                    :key="`skill-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 紧急联系人 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-phone /> 紧急联系人
                      <a-badge
                        v-if="contactCount > 0"
                        :count="contactCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="contactsListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增紧急联系人
                    </a-button>
                  </template>
                  <employee-contacts-list
                    ref="contactsListRef"
                    :key="`contact-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 绩效记录 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-star /> 绩效记录
                      <a-badge
                        v-if="performanceCount > 0"
                        :count="performanceCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="performanceListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增绩效记录
                    </a-button>
                  </template>
                  <employee-performance-list
                    ref="performanceListRef"
                    :key="`perf-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 职级历史 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-layers /> 职级历史
                      <a-badge
                        v-if="rankCount > 0"
                        :count="rankCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="rankTimelineRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增职级变动
                    </a-button>
                  </template>
                  <employee-rank-timeline
                    ref="rankTimelineRef"
                    :key="`rank-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 岗位师傅 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-user-group /> 岗位师傅
                      <a-badge
                        v-if="mentorCount > 0"
                        :count="mentorCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="mentorsListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增带教记录
                    </a-button>
                  </template>
                  <employee-mentors-list
                    ref="mentorsListRef"
                    :key="`mentor-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 授课认证 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-trophy /> 授课认证
                      <a-badge
                        v-if="teachingCertCount > 0"
                        :count="teachingCertCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="teachingCertListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增授课认证
                    </a-button>
                  </template>
                  <employee-teaching-cert-list
                    ref="teachingCertListRef"
                    :key="`tcert-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 授课认定 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-check-circle /> 授课认定
                      <a-badge
                        v-if="teachingRecordCount > 0"
                        :count="teachingRecordCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="teachingRecordListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增授课认定
                    </a-button>
                  </template>
                  <employee-teaching-record-list
                    ref="teachingRecordListRef"
                    :key="`trecord-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 二级教育 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-safe /> 二级教育
                      <a-badge
                        v-if="secondaryEduCount > 0"
                        :count="secondaryEduCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="secondaryEduListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增二级教育
                    </a-button>
                  </template>
                  <employee-secondary-edu-list
                    ref="secondaryEduListRef"
                    :key="`sedu-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

              <!-- 荣誉情况 -->
              <a-col :span="12">
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-gift /> 荣誉情况
                      <a-badge
                        v-if="honorCount > 0"
                        :count="honorCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      size="mini"
                      @click="honorsListRef?.handleAdd?.()"
                    >
                      <template #icon><icon-plus /></template>新增荣誉记录
                    </a-button>
                  </template>
                  <employee-honors-list
                    ref="honorsListRef"
                    :key="`honor-${formData.userCode || 'new'}`"
                    :user-code="formData.userCode || ''"
                    :is-new-mode="isAdding"
                    hide-header
                  />
                </a-card>
              </a-col>

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
  import { ref, computed } from 'vue';
  import type {
    Employee,
    JobRank,
    ProfessionalTitle,
    Position,
  } from '@/api/hr/types';
  import IdentityInfo from './form-sections/identity-info.vue';
  import PositionConfig from './form-sections/position-config.vue';
  import PositionDetail from './form-sections/position-detail.vue';
  import RemarkSection from './form-sections/remark-section.vue';
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
    formData: Partial<Employee>;
    extData: {
      position: Partial<Position>;
    };
    currentRecord: Employee | null;
    isAdding: boolean;
    detailLoading: boolean;
    submitLoading: boolean;
    departmentTreeData: any[];
    jobRankList: JobRank[];
    professionalTitleList: ProfessionalTitle[];
    rules: any;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'save'): void;
    (e: 'openPhotoEditor'): void;
    (e: 'titleChange', titleId: string): void;
    (e: 'update:formData', value: Partial<Employee>): void;
    (e: 'update:extData', value: { position: Partial<Position> }): void;
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

  const handleTitleChange = (titleId: string) => {
    emit('titleChange', titleId);
  };

  const handleOpenPhotoEditor = () => {
    emit('openPhotoEditor');
  };

  const handleCancel = () => {
    emit('cancel');
  };

  const handleSave = () => {
    emit('save');
  };

  const handleFormDataUpdate = (value: Partial<Employee>) => {
    emit('update:formData', value);
  };

  const handlePositionUpdate = (value: Partial<Position>) => {
    emit('update:extData', {
      position: value,
    });
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
      padding: 0;
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

        :deep(.arco-row) {
          display: flex;
          flex-wrap: wrap;
        }

        :deep(.arco-col) {
          display: flex;
          flex-direction: column;
        }

        .form-block {
          margin-bottom: 16px;
          flex: 1;
          box-sizing: border-box;

          :deep(.arco-card-body) {
            padding: 16px 20px;
          }

          :deep(.arco-card-header) {
            padding: 16px 20px;
            border-bottom: 1px solid #f2f3f5;
          }

          .block-title {
            font-size: 15px;
            font-weight: 600;
            color: #1d2129;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0;

            .arco-icon {
              color: #165dff;
              font-size: 16px;
            }
          }

          :deep(.performance-tab),
          :deep(.rank-history-tab) {
            padding: 0;
          }
        }
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
