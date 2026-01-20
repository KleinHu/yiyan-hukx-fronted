<template>
  <div class="personal-info-container">
    <div class="page-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>个人信息维护</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <div class="personal-info-content">
      <a-spin :loading="loading" style="width: 100%">
        <div class="personal-info-panel">
          <!-- 主内容区域：双栏布局 -->
          <div class="scroll-form-container">
            <a-row :gutter="24">
              <!-- 左侧栏：基础信息与岗位 -->
              <a-col :span="12">
                <!-- 核心身份 (只读) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <div class="title-left">
                        <icon-idcard /> 核心身份信息 (由管理部门维护)
                      </div>
                      <a-tag
                        v-if="formData.userName"
                        color="blue"
                        variant="light"
                        size="small"
                      >
                        {{ formData.userName }} ({{ formData.userCode }})
                      </a-tag>
                    </div>
                  </template>
                  <div class="identity-content-layout">
                    <!-- 证件照上传区域 -->
                    <div class="photo-area">
                      <a-form :model="formData" layout="vertical">
                        <a-form-item label="个人证件照 (2寸)">
                          <a-space direction="vertical">
                            <div
                              class="id-card-uploader"
                              @click="handleOpenPhotoEditor"
                            >
                              <img
                                v-if="formData.avatarUrl"
                                :src="formData.avatarUrl"
                                class="id-photo"
                              />
                              <div v-else class="upload-placeholder">
                                <icon-plus />
                                <div class="text">点击上传</div>
                              </div>
                              <div class="upload-mask">
                                <icon-camera />
                                <span>{{
                                  formData.avatarUrl ? '更换照片' : '上传照片'
                                }}</span>
                              </div>
                            </div>
                            <div class="photo-tip">建议比例 3:4</div>
                          </a-space>
                        </a-form-item>
                      </a-form>
                    </div>
                    <!-- 核心字段 -->
                    <div class="fields-area">
                      <a-form :model="formData" layout="vertical">
                        <a-row :gutter="16">
                          <a-col :span="12">
                            <a-form-item label="姓名">
                              <a-input v-model="formData.userName" disabled />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="工号">
                              <a-input v-model="formData.userCode" disabled />
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="性别">
                              <a-select v-model="formData.gender" disabled>
                                <a-option :value="1">男</a-option>
                                <a-option :value="2">女</a-option>
                              </a-select>
                            </a-form-item>
                          </a-col>
                          <a-col :span="12">
                            <a-form-item label="身份证号">
                              <a-input
                                v-model="formData.idCardNo"
                                disabled
                                placeholder="未录入"
                              />
                            </a-form-item>
                          </a-col>
                        </a-row>
                      </a-form>
                    </div>
                  </div>
                </a-card>

                <!-- 行政岗位 (只读) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-user-group /> 行政岗位配置 (由管理部门维护)
                    </div>
                  </template>
                  <a-form :model="formData" layout="vertical">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="所属科室">
                          <a-input v-model="formData.departmentName" disabled />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="职位职务">
                          <a-input v-model="formData.jobTitle" disabled />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="公司职级">
                          <a-input v-model="formData.rankName" disabled />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="专业职称">
                          <a-input
                            v-model="formData.professionalTitleName"
                            disabled
                            placeholder="无"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="入职日期">
                          <a-input v-model="formData.hireDate" disabled />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="办公位置">
                          <a-input
                            v-model="formData.officeLocation"
                            disabled
                            placeholder="未分配"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-form>
                </a-card>

                <!-- 个人联系档案 (可编辑) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <div class="title-left">
                        <icon-user /> 个人联系档案 (可自主维护)
                      </div>
                    </div>
                  </template>
                  <template #extra>
                    <a-button
                      type="primary"
                      :loading="submitLoading"
                      @click="handleSave"
                    >
                      <template #icon><icon-save /></template>更新基本资料
                    </a-button>
                  </template>
                  <a-form :model="formData" layout="vertical">
                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="移动电话" required>
                          <a-input
                            v-model="formData.mobile"
                            placeholder="请输入手机号"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="电子邮箱" required>
                          <a-input
                            v-model="formData.email"
                            placeholder="请输入邮箱"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="政治面貌">
                          <a-select v-model="formData.politicalStatus">
                            <a-option :value="1">中共党员</a-option>
                            <a-option :value="2">共青团员</a-option>
                            <a-option :value="3">群众</a-option>
                            <a-option :value="4">其他党派</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="婚姻状况">
                          <a-select v-model="formData.maritalStatus">
                            <a-option :value="1">未婚</a-option>
                            <a-option :value="2">已婚</a-option>
                            <a-option :value="3">离异</a-option>
                            <a-option :value="4">丧偶</a-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="出生日期">
                          <a-date-picker
                            v-model="formData.birthDate"
                            style="width: 100%"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col :span="24">
                        <a-form-item label="家庭住址">
                          <a-textarea
                            v-model="formData.address"
                            placeholder="详细居住地址"
                            :auto-size="{ minRows: 2, maxRows: 3 }"
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </a-form>
                </a-card>

                <!-- 职级变动记录 (只读) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-layers /> 职级变动历史
                      <a-badge
                        v-if="rankCount > 0"
                        :count="rankCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeeRankTimeline
                    v-if="formData.userCode"
                    ref="rankTimelineRef"
                    :user-code="formData.userCode"
                    hide-header
                    readonly
                  />
                </a-card>
              </a-col>

              <!-- 右侧栏：绩效、教育、证书、带教、荣誉 -->
              <a-col :span="12">
                <!-- 绩效记录 (只读) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-star /> 历年绩效记录
                      <a-badge
                        v-if="performanceCount > 0"
                        :count="performanceCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeePerformanceList
                    v-if="formData.userCode"
                    ref="performanceListRef"
                    :user-code="formData.userCode"
                    hide-header
                    readonly
                  />
                </a-card>

                <!-- 列表维护区域 -->
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
                  <EmployeeEducationList
                    v-if="formData.userCode"
                    ref="educationListRef"
                    readonly
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                  />
                </a-card>
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
                      @click="handleAddContact"
                    >
                      <template #icon><icon-plus /></template>新增紧急联系人
                    </a-button>
                  </template>
                  <EmployeeContactsList
                    v-if="formData.userCode"
                    ref="contactsListRef"
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                  />
                </a-card>
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-safe /> 技能鉴定与证书
                      <a-badge
                        v-if="skillCount > 0"
                        :count="skillCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeeSkillsList
                    v-if="formData.userCode"
                    ref="skillsListRef"
                    readonly
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                  />
                </a-card>
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-user-group /> 岗位师傅与带教
                      <a-badge
                        v-if="mentorCount > 0"
                        :count="mentorCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeeMentorsList
                    v-if="formData.userCode"
                    ref="mentorsListRef"
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                    readonly
                  />
                </a-card>
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-trophy /> 荣誉奖励
                      <a-badge
                        v-if="honorCount > 0"
                        :count="honorCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeeHonorsList
                    v-if="formData.userCode"
                    ref="honorsListRef"
                    readonly
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                  />
                </a-card>

                <!-- 授课与培训 (只读展示) -->
                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-file /> 授课认证与认定
                      <a-badge
                        v-if="teachingCertCount + teachingRecordCount > 0"
                        :count="teachingCertCount + teachingRecordCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <a-tabs type="capsule" size="small">
                    <a-tab-pane key="cert" title="授课认证">
                      <EmployeeTeachingCertList
                        v-if="formData.userCode"
                        ref="teachingCertListRef"
                        :user-code="formData.userCode"
                        :columns="2"
                        hide-header
                        readonly
                      />
                    </a-tab-pane>
                    <a-tab-pane key="record" title="授课认定">
                      <EmployeeTeachingRecordList
                        v-if="formData.userCode"
                        ref="teachingRecordListRef"
                        :user-code="formData.userCode"
                        :columns="2"
                        hide-header
                        readonly
                      />
                    </a-tab-pane>
                  </a-tabs>
                </a-card>

                <a-card :bordered="false" class="form-block">
                  <template #title>
                    <div class="block-title">
                      <icon-check-circle /> 二级教育完成情况
                      <a-badge
                        v-if="secondaryEduCount > 0"
                        :count="secondaryEduCount"
                        :overflow-count="99"
                        :offset="[8, 0]"
                      />
                    </div>
                  </template>
                  <EmployeeSecondaryEduList
                    v-if="formData.userCode"
                    ref="secondaryEduListRef"
                    :user-code="formData.userCode"
                    :columns="2"
                    hide-header
                    readonly
                  />
                </a-card>
              </a-col>
            </a-row>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 证件照编辑器模态框 -->
    <IdPhoto
      v-model:visible="photoEditorVisible"
      title="编辑证件照"
      :show-download="false"
      @complete="handlePhotoEditorComplete"
      @cancel="handlePhotoEditorCancel"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useUserStore from '@/store/modules/security';
  import employeeApi from '@/api/hr/employee';
  import fileApi from '@/api/hr/file';
  import { Employee } from '@/api/hr/types';

  // 导入所有关联列表组件
  import IdPhoto from '@/components/id-photo/index.vue';
  import EmployeeEducationList from '../common/employee-education-list.vue';
  import EmployeeContactsList from '../common/employee-contacts-list.vue';
  import EmployeeSkillsList from '../common/employee-skills-list.vue';
  import EmployeeHonorsList from '../common/employee-honors-list.vue';
  import EmployeePerformanceList from '../common/employee-performance-list.vue';
  import EmployeeRankTimeline from '../common/employee-rank-timeline.vue';
  import EmployeeMentorsList from '../common/employee-mentors-list.vue';
  import EmployeeTeachingCertList from '../common/employee-teaching-cert-list.vue';
  import EmployeeTeachingRecordList from '../common/employee-teaching-record-list.vue';
  import EmployeeSecondaryEduList from '../common/employee-secondary-edu-list.vue';

  const userStore = useUserStore();
  const loading = ref(false);
  const submitLoading = ref(false);
  const photoEditorVisible = ref(false);
  const contactsListRef = ref();
  const educationListRef = ref();
  const skillsListRef = ref();
  const mentorsListRef = ref();
  const honorsListRef = ref();
  const performanceListRef = ref();
  const rankTimelineRef = ref();
  const teachingCertListRef = ref();
  const teachingRecordListRef = ref();
  const secondaryEduListRef = ref();

  // 计算各模块数量
  const educationCount = computed(() => {
    return educationListRef.value?.count || 0;
  });
  const contactCount = computed(() => {
    return contactsListRef.value?.count || 0;
  });
  const skillCount = computed(() => {
    return skillsListRef.value?.count || 0;
  });
  const mentorCount = computed(() => {
    return mentorsListRef.value?.count || 0;
  });
  const honorCount = computed(() => {
    return honorsListRef.value?.count || 0;
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
  const performanceCount = computed(() => {
    return performanceListRef.value?.count || 0;
  });
  const rankCount = computed(() => {
    return rankTimelineRef.value?.count || 0;
  });

  // 默认使用 E001 作为测试工号，实际项目中会从 userStore 获取当前用户的 userCode
  const DEFAULT_USER_CODE = 'E001';

  const formData = reactive<Partial<Employee>>({
    id: undefined,
    userName: '',
    userCode: '',
    departmentName: '',
    jobTitle: '',
    avatarUrl: '',
    mobile: '',
    email: '',
    address: '',
    hireDate: '',
    status: 2,
    politicalStatus: 3,
    maritalStatus: 1,
    birthDate: '',
    gender: 1,
    rankName: '',
    professionalTitleName: '',
    idCardNo: '',
    officeLocation: '',
  });

  const fetchData = async () => {
    try {
      loading.value = true;
      // 优先从 store 获取 userCode，如果没有则使用默认值
      const currentUserCode = userStore.userCode || DEFAULT_USER_CODE;

      // 通过 userCode 获取人员基本信息
      const { data } = await employeeApi.getEmployeePage({
        userCode: currentUserCode,
        pageNum: 1,
        pageSize: 1,
      });
      if (data.list.length > 0) {
        Object.assign(formData, data.list[0]);
      } else {
        // 如果按工号查不到，尝试直接通过userCode获取
        const userCodeRes = await employeeApi.getEmployeeByUserCode(
          currentUserCode
        );
        if (userCodeRes.data) {
          Object.assign(formData, userCodeRes.data);
        }
      }
    } catch (err) {
      Message.error('获取个人信息失败');
    } finally {
      loading.value = false;
    }
  };

  const handleSave = async () => {
    if (!formData.userCode) return;

    try {
      submitLoading.value = true;
      await employeeApi.updateEmployee(formData.userCode, formData);
      Message.success('个人基本资料更新成功');
    } catch (err) {
      // Message.error('保存失败');
    } finally {
      submitLoading.value = false;
    }
  };

  // 打开照片编辑器
  const handleOpenPhotoEditor = () => {
    photoEditorVisible.value = true;
  };

  // 照片编辑器完成
  const handlePhotoEditorComplete = async (data: {
    base64: string;
    file: File;
  }) => {
    if (!formData.userCode) return;

    try {
      const { data: uploadResult } = await fileApi.uploadFile(
        data.file,
        'id-card-photo'
      );
      if (uploadResult?.url) {
        formData.avatarUrl = uploadResult.url;
        Message.success('个人证件照更新成功');
      }
    } catch (e) {
      Message.error('证件照上传失败');
    } finally {
      photoEditorVisible.value = false;
    }
  };

  // 照片编辑器取消
  const handlePhotoEditorCancel = () => {
    photoEditorVisible.value = false;
  };

  const handleAddContact = () => {
    if (contactsListRef.value && contactsListRef.value.handleAdd) {
      contactsListRef.value.handleAdd();
    }
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .personal-info-container {
    padding: 20px;
    background-color: #f4f7f9;
    min-height: calc(100vh - 60px);

    .page-breadcrumb {
      margin-bottom: 16px;
    }

    .personal-info-content {
      display: flex;
      flex-direction: column;
    }

    .scroll-form-container {
      flex: 1;
      padding: 0;

      .form-block {
        margin-bottom: 24px;

        :deep(.arco-card-body) {
          padding: 20px;
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

          .title-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .arco-icon {
            color: #165dff;
            font-size: 18px;
          }
        }

        .identity-content-layout {
          display: flex;
          gap: 32px;
          align-items: flex-start;

          .photo-area {
            flex-shrink: 0;
            width: 140px;

            .id-card-uploader {
              position: relative;
              width: 120px;
              height: 160px;
              background-color: #f2f3f5;
              border: 1px dashed #c9cdd4;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                border-color: #165dff;
                background-color: #e8f3ff;

                .upload-mask {
                  opacity: 1;
                }
              }

              .id-photo {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }

              .upload-placeholder {
                text-align: center;
                color: #86909c;
                .text {
                  font-size: 12px;
                  margin-top: 8px;
                }
              }

              .upload-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.2s;
                font-size: 13px;
              }
            }

            .photo-tip {
              margin-top: 8px;
              font-size: 12px;
              color: #86909c;
              text-align: center;
              width: 120px;
            }
          }

          .fields-area {
            flex: 1;
          }
        }
      }
    }
  }

  // 深度选择器，美化列表组件
  :deep(.arco-table) {
    border: none;
    .arco-table-container {
      border: 1px solid #f2f3f5;
      border-radius: 4px;
    }
  }

  :deep(.arco-timeline-item-label) {
    font-weight: 500;
    color: var(--color-text-2);
  }
</style>
