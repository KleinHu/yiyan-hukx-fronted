<template>
  <a-card :bordered="false" class="form-block">
    <template #title>
      <div class="block-title"><icon-idcard /> 核心身份信息</div>
    </template>
    <div class="identity-content-layout">
      <div class="photo-area">
        <a-form-item label="员工证件照 (2寸)">
          <a-space direction="vertical">
            <div class="id-card-uploader" @click="handleOpenPhotoEditor">
              <img
                v-if="modelValue.avatarUrl"
                :src="modelValue.avatarUrl"
                class="id-photo"
              />
              <div v-else class="upload-placeholder">
                <icon-plus />
                <div class="text">点击上传</div>
              </div>
              <div class="upload-mask">
                <icon-camera />
                <span>{{
                  modelValue.avatarUrl ? '更换照片' : '上传照片'
                }}</span>
              </div>
            </div>
            <div class="photo-tip">建议比例 3:4</div>
          </a-space>
        </a-form-item>
      </div>
      <div class="fields-area">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="userCode" label="工号" required>
              <a-input
                :model-value="modelValue.userCode"
                @update:model-value="updateField('userCode', $event)"
                :disabled="!isAdding"
                placeholder="E-XXX"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="userName" label="姓名" required>
              <a-input
                :model-value="modelValue.userName"
                @update:model-value="updateField('userName', $event)"
                placeholder="请输入姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="gender" label="性别">
              <a-radio-group
                :model-value="modelValue.gender"
                @update:model-value="updateField('gender', $event)"
                type="button"
              >
                <a-radio :value="1">男</a-radio>
                <a-radio :value="2">女</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="idCardNo" label="身份证号">
              <a-input
                :model-value="modelValue.idCardNo"
                @update:model-value="updateField('idCardNo', $event)"
                placeholder="18位身份证号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="birthDate" label="出生日期">
              <a-date-picker
                :model-value="modelValue.birthDate"
                @update:model-value="updateField('birthDate', $event)"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="mobile" label="联系电话">
              <a-input
                :model-value="modelValue.mobile"
                @update:model-value="updateField('mobile', $event)"
                placeholder="手机号"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="email" label="企业邮箱">
              <a-input
                :model-value="modelValue.email"
                @update:model-value="updateField('email', $event)"
                placeholder="xxx@company.com"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
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
          <a-col :span="12">
            <a-form-item field="politicalStatus" label="政治面貌">
              <a-select
                :model-value="modelValue.politicalStatus"
                @update:model-value="updateField('politicalStatus', $event)"
              >
                <a-option
                  v-for="opt in PoliticalStatusOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import type { Employee } from '@/api/hr/types';
  import { PoliticalStatusOptions } from '@/api/hr/types';

  interface Props {
    modelValue: Partial<Employee>;
    isAdding: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Partial<Employee>): void;
    (e: 'openPhotoEditor'): void;
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
</script>

<style scoped lang="less">
  .identity-content-layout {
    display: flex;
    gap: 24px;

    .fields-area {
      flex: 1;
    }

    .photo-area {
      width: 140px;

      .id-card-uploader {
        position: relative;
        width: 120px;
        height: 160px;
        border: 1px dashed var(--color-border-3);
        background-color: var(--color-fill-2);
        border-radius: 4px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: var(--color-primary-light-3);
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
          .arco-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .text {
            font-size: 12px;
          }
        }

        .upload-mask {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
          .arco-icon {
            font-size: 18px;
          }
        }
      }

      .photo-tip {
        font-size: 11px;
        color: var(--color-text-4);
        margin-top: 8px;
        text-align: center;
      }
    }
  }
</style>
