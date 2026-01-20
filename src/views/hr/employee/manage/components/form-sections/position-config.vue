<template>
  <a-card :bordered="false" class="form-block">
    <template #title>
      <div class="block-title"><icon-user-group /> 行政岗位配置</div>
    </template>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item field="departmentId" label="所属科室/部门" required>
          <a-tree-select
            :model-value="modelValue.departmentId"
            @update:model-value="updateField('departmentId', $event)"
            :data="departmentTreeData"
            placeholder="请选择科室/部门"
            :field-names="{
              key: 'deptId',
              title: 'deptName',
              children: 'children',
            }"
            allow-clear
            allow-search
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item field="jobTitle" label="岗位">
          <a-input
            :model-value="modelValue.jobTitle"
            @update:model-value="updateField('jobTitle', $event)"
            placeholder="请输入岗位名称"
            allow-clear
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item field="rankId" label="公司职级">
          <a-select
            :model-value="modelValue.rankId"
            @update:model-value="updateField('rankId', $event)"
            placeholder="选择职级（如：员、师）"
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
      <a-col :span="12">
        <a-form-item field="professionalTitleId" label="专业职称">
          <a-select
            :model-value="modelValue.professionalTitleId"
            @update:model-value="handleProfessionalTitleChange"
            placeholder="选择职称（如：工程师）"
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
      <a-col :span="12">
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
      <a-col :span="12">
        <a-form-item field="hireDate" label="入职日期">
          <a-date-picker
            :model-value="modelValue.hireDate"
            @update:model-value="updateField('hireDate', $event)"
            style="width: 100%"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item field="transferDate" label="调入厂日期">
          <a-date-picker
            :model-value="modelValue.transferDate"
            @update:model-value="updateField('transferDate', $event)"
            style="width: 100%"
          />
        </a-form-item>
      </a-col>
      <a-col :span="24">
        <a-form-item field="officeLocation" label="办公具体位置">
          <a-input
            :model-value="modelValue.officeLocation"
            @update:model-value="updateField('officeLocation', $event)"
            placeholder="如：101B楼2层222室"
          />
        </a-form-item>
      </a-col>
      <a-col :span="24">
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
  </a-card>
</template>

<script setup lang="ts">
  import type { Employee, JobRank, ProfessionalTitle } from '@/api/hr/types';
  import { EmployeeStatusOptions } from '@/api/hr/types';

  interface Props {
    modelValue: Partial<Employee>;
    departmentTreeData: any[];
    jobRankList: JobRank[];
    professionalTitleList: ProfessionalTitle[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Partial<Employee>): void;
    (e: 'titleChange', titleId: string): void;
  }>();

  const updateField = (field: keyof Employee, value: unknown) => {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: value,
    });
  };

  const handleProfessionalTitleChange = (titleId: string) => {
    updateField('professionalTitleId', titleId);
    emit('titleChange', titleId);
  };
</script>
