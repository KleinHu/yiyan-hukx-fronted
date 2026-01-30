<template>
  <a-card :bordered="false" class="form-block employee-basic-info-card">
    <template #title>
      <div class="block-title">
        <icon-user /> 员工基础信息 (核心身份与行政岗位)
      </div>
    </template>

    <div class="basic-info-layout">
      <!-- 左侧：证件照 -->
      <div class="photo-side">
        <div class="id-card-uploader" @click="handleOpenPhotoEditor">
          <img
            v-if="modelValue.avatarUrl"
            :src="modelValue.avatarUrl"
            class="id-photo"
          />
          <div v-else class="upload-placeholder">
            <icon-camera :size="32" />
            <div class="text">上传证件照</div>
          </div>
          <div class="upload-mask">
            <icon-edit />
            <span>更换照片</span>
          </div>
        </div>
        <div class="photo-tip">建议 3:4 比例</div>
      </div>

      <!-- 右侧：表单区域（无标题扁平化） -->
      <div class="form-side">
        <a-row :gutter="20">
          <!-- 第一行 -->
          <a-col :span="8">
            <a-form-item field="userCode" label="工号" required>
              <a-input
                :model-value="modelValue.userCode"
                @update:model-value="updateField('userCode', $event)"
                :disabled="!isAdding"
                placeholder="工号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="userName" label="姓名" required>
              <a-input
                :model-value="modelValue.userName"
                @update:model-value="updateField('userName', $event)"
                placeholder="姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="gender" label="性别">
              <a-radio-group
                :model-value="modelValue.gender"
                @update:model-value="updateField('gender', $event)"
                type="button"
                size="small"
              >
                <a-radio :value="1">男</a-radio>
                <a-radio :value="2">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>

          <!-- 第二行 -->
          <a-col :span="8">
            <a-form-item field="departmentId" label="所属科室" required>
              <a-tree-select
                :model-value="modelValue.departmentId"
                @update:model-value="updateField('departmentId', $event)"
                :data="departmentTreeData"
                placeholder="请选择科室"
                :field-names="{
                  key: 'deptId',
                  title: 'deptName',
                  children: 'children',
                }"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="jobTitle" label="当前岗位">
              <a-input
                :model-value="modelValue.jobTitle"
                @update:model-value="updateField('jobTitle', $event)"
                placeholder="岗位名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="status" label="在职状态">
              <a-select
                :model-value="modelValue.status"
                @update:model-value="updateField('status', $event)"
              >
                <a-option
                  v-for="item in EmployeeStatusOptions"
                  :key="item.value"
                  :value="item.value"
                  >{{ item.label }}</a-option
                >
              </a-select>
            </a-form-item>
          </a-col>

          <!-- 第三行 -->
          <a-col :span="8">
            <a-form-item field="rankId" label="公司职级">
              <a-select
                :model-value="modelValue.rankId"
                @update:model-value="updateField('rankId', $event)"
                placeholder="选择职级"
              >
                <a-option
                  v-for="rank in jobRankList"
                  :key="rank.rankId"
                  :value="rank.rankId"
                  >{{ rank.rankName }}</a-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="professionalTitleId" label="专业职称">
              <a-select
                :model-value="modelValue.professionalTitleId"
                @update:model-value="handleProfessionalTitleChange"
                placeholder="选择职称"
                allow-clear
              >
                <a-option
                  v-for="title in professionalTitleList"
                  :key="title.titleId"
                  :value="title.titleId"
                  >{{ title.titleName }}</a-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="idCardNo" label="身份证号">
              <a-input
                :model-value="modelValue.idCardNo"
                @update:model-value="updateField('idCardNo', $event)"
                placeholder="18位身份证"
              />
            </a-form-item>
          </a-col>

          <!-- 第四行 -->
          <a-col :span="8">
            <a-form-item field="hireDate" label="入职日期">
              <a-date-picker
                :model-value="modelValue.hireDate"
                @update:model-value="updateField('hireDate', $event)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="birthDate" label="出生日期">
              <a-date-picker
                :model-value="modelValue.birthDate"
                @update:model-value="updateField('birthDate', $event)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="mobile" label="联系电话">
              <a-input
                :model-value="modelValue.mobile"
                @update:model-value="updateField('mobile', $event)"
                placeholder="电话"
              />
            </a-form-item>
          </a-col>

          <!-- 第五行 -->
          <a-col :span="8">
            <a-form-item field="email" label="企业邮箱">
              <a-input
                :model-value="modelValue.email"
                @update:model-value="updateField('email', $event)"
                placeholder="Email"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="maritalStatus" label="婚姻状况">
              <a-select
                :model-value="modelValue.maritalStatus"
                @update:model-value="updateField('maritalStatus', $event)"
              >
                <a-option :value="1">未婚</a-option>
                <a-option :value="2">已婚</a-option>
                <a-option :value="3">离异</a-option>
                <a-option :value="4">丧偶</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="politicalStatus" label="政治面貌">
              <a-select
                :model-value="modelValue.politicalStatus"
                @update:model-value="updateField('politicalStatus', $event)"
              >
                <a-option
                  v-for="opt in PoliticalStatusOptions"
                  :key="opt.value"
                  :value="opt.value"
                  >{{ opt.label }}</a-option
                >
              </a-select>
            </a-form-item>
          </a-col>

          <!-- 来源类型、来源地（独立填写） -->
          <a-col :span="8">
            <a-form-item field="sourceType" label="来源类型">
              <a-select
                :model-value="modelValue.sourceType"
                @update:model-value="handleSourceTypeChange"
                placeholder="请选择来源类型"
                allow-clear
              >
                <a-option
                  v-for="opt in SourceTypeOptions"
                  :key="opt.value"
                  :value="opt.value"
                  :label="opt.label"
                >
                  {{ opt.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="sourceName" label="来源地">
              <a-input
                :model-value="modelValue.sourceName"
                @update:model-value="updateField('sourceName', $event)"
                placeholder="请输入来源地"
                allow-clear
              />
            </a-form-item>
          </a-col>

          <!-- 底部全行 -->
          <a-col :span="16">
            <a-form-item field="officeLocation" label="办公地点">
              <a-input
                :model-value="modelValue.officeLocation"
                @update:model-value="updateField('officeLocation', $event)"
                placeholder="如：101B楼2层222室"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="特殊身份">
              <a-space>
                <a-checkbox
                  :model-value="modelValue.isRepresentative"
                  @update:model-value="updateField('isRepresentative', $event)"
                  >职工代表</a-checkbox
                >
                <a-checkbox
                  :model-value="modelValue.isTeamLeader"
                  @update:model-value="updateField('isTeamLeader', $event)"
                  >工组长</a-checkbox
                >
              </a-space>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import type { Employee, JobRank, ProfessionalTitle } from '@/api/hr/types';
  import {
    PoliticalStatusOptions,
    EmployeeStatusOptions,
    SourceTypeOptions,
  } from '@/api/hr/types';

  interface Props {
    modelValue: Partial<Employee>;
    isAdding: boolean;
    departmentTreeData: any[];
    jobRankList: JobRank[];
    professionalTitleList: ProfessionalTitle[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Partial<Employee>): void;
    (e: 'openPhotoEditor'): void;
    (e: 'titleChange', titleId: string): void;
  }>();

  const updateField = (field: keyof Employee, value: unknown) => {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: value,
    });
  };

  const handleOpenPhotoEditor = () => {
    emit('openPhotoEditor');
  };

  const handleProfessionalTitleChange = (titleId: string) => {
    updateField('professionalTitleId', titleId);
    emit('titleChange', titleId);
  };

  /** 来源类型变更：仅更新 sourceType，来源地由用户单独填写 */
  const handleSourceTypeChange = (value: number | undefined) => {
    updateField('sourceType', value);
  };
</script>

<style scoped lang="less">
  .employee-basic-info-card {
    background: #fff;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .basic-info-layout {
      display: flex;
      gap: 32px;
      padding: 8px;

      .photo-side {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 140px;

        .id-card-uploader {
          position: relative;
          width: 120px;
          height: 160px;
          border: 1px dashed var(--color-border-3);
          background-color: var(--color-fill-1);
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          &:hover {
            border-color: var(--color-primary-6);
            background-color: var(--color-primary-light-1);

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
            color: var(--color-text-3);
            .text {
              font-size: 12px;
              margin-top: 8px;
            }
          }

          .upload-mask {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 12px;
          }
        }

        .photo-tip {
          font-size: 11px;
          color: var(--color-text-4);
          margin-top: 12px;
        }
      }

      .form-side {
        flex: 1;

        :deep(.arco-form-item) {
          margin-bottom: 16px;
        }

        :deep(.arco-form-item-label) {
          font-weight: 500;
          color: var(--color-text-2);
        }
      }
    }
  }
</style>
