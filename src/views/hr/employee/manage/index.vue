<template>
  <div class="employee-management-container">
    <div class="page-breadcrumb">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>员工管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>
    <a-row :gutter="16" class="management-layout">
      <!-- 左侧：人员导航与筛选 -->
      <a-col :span="6" class="left-col">
        <employee-list
          ref="employeeListRef"
          :employee-list="employeeList"
          :department-list="departmentList"
          :loading="loading"
          :current-record="currentRecord"
          :pagination="pagination"
          @add="handleAdd"
          @select="handleSelect"
          @search="fetchData"
          @update:pagination="handlePaginationUpdate"
        />
      </a-col>

      <!-- 右侧：详情面板 -->
      <a-col :span="18" class="right-col">
        <employee-form
          ref="employeeFormRef"
          v-model:form-data="formData"
          v-model:ext-data="extData"
          :current-record="currentRecord"
          :is-adding="isAdding"
          :detail-loading="detailLoading"
          :submit-loading="submitLoading"
          :department-tree-data="departmentTreeData"
          :job-rank-list="jobRankList"
          :professional-title-list="professionalTitleList"
          :rules="rules"
          @cancel="handleCancel"
          @save="handleSave"
          @openPhotoEditor="handleOpenPhotoEditor"
          @titleChange="handleTitleChange"
          @update:form-data="handleFormDataUpdate"
          @update:ext-data="handleExtDataUpdate"
        />
      </a-col>
    </a-row>

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
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useEmployeeList from '@/hooks/hr/employee';
  import useDepartmentTree from '@/hooks/hr/department';
  import jobRankApi from '@/api/hr/job-rank';
  import professionalTitleApi from '@/api/hr/professional-title';
  import employeeRecordApi from '@/api/hr/records';
  import fileApi from '@/api/hr/file';
  import type {
    Employee,
    JobRank,
    Position,
    ProfessionalTitle,
  } from '@/api/hr/types';
  import IdPhoto from '@/components/id-photo/index.vue';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import EmployeeList from './components/employee-list.vue';
  import EmployeeForm from './components/employee-form.vue';

  // 使用 Hooks
  const {
    employeeList,
    loading,
    pagination,
    fetchEmployeeList,
    createEmployee,
    updateEmployee,
  } = useEmployeeList({
    autoLoad: false, // 手动控制加载
  });

  const {
    departmentTreeData,
    departmentList,
    fetchDepartmentTree,
    fetchDepartmentList,
  } = useDepartmentTree({
    autoLoad: false, // 手动控制加载
  });

  // 状态
  const detailLoading = ref(false);
  const submitLoading = ref(false);
  const jobRankList = ref<JobRank[]>([]);
  const professionalTitleList = ref<ProfessionalTitle[]>([]);
  const currentRecord = ref<Employee | null>(null);
  const isAdding = ref(false);
  const photoEditorVisible = ref(false);

  // 组件引用
  const employeeListRef = ref();
  const employeeFormRef = ref();

  // 校验规则
  const rules = {
    userCode: [{ required: true, message: '工号为必填项' }],
    userName: [{ required: true, message: '姓名为必填项' }],
    departmentId: [{ required: true, message: '所属部门为必选项' }],
    mobile: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }],
    // email: [{ type: 'email', message: '邮箱格式不正确' }],
    idCardNo: [
      {
        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
        message: '身份证格式不正确',
      },
    ],
  };

  // 档案主表数据
  const formData = reactive<Partial<Employee>>({});

  // 档案扩展数据
  const extData = reactive({
    position: {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    } as Partial<Position>,
  });

  /**
   * 处理分页更新
   */
  const handlePaginationUpdate = (value: {
    current: number;
    pageSize: number;
    total: number;
  }) => {
    pagination.value.current = value.current;
    pagination.value.pageSize = value.pageSize;
    pagination.value.total = value.total;
  };

  /**
   * 处理表单数据更新
   */
  const handleFormDataUpdate = (value: Partial<Employee>) => {
    Object.assign(formData, value);
  };

  /**
   * 处理扩展数据更新
   */
  const handleExtDataUpdate = (value: { position: Partial<Position> }) => {
    Object.assign(extData.position, value.position);
  };

  /**
   * 加载名录数据
   */
  const fetchData = async () => {
    const searchKey = employeeListRef.value?.searchKey || '';
    const filterDept = employeeListRef.value?.filterDept;
    await fetchEmployeeList(
      {
        pageNum: pagination.value.current,
        pageSize: pagination.value.pageSize,
        userName: searchKey,
        departmentId: filterDept,
      },
      true // 使用分页
    );
  };

  /**
   * 选择员工
   */
  const handleSelect = async (record: Employee) => {
    isAdding.value = false;
    currentRecord.value = record;
    // 重置并载入数据
    Object.assign(formData, JSON.parse(JSON.stringify(record)));

    // 载入扩展数据
    resetExtData();
    if (record.userCode) {
      try {
        detailLoading.value = true;
        const posRes = await employeeRecordApi.getPosition(record.userCode);
        if (posRes.code === 200 && posRes.data) {
          extData.position = { ...posRes.data };
        }
      } catch (e) {
        // 获取岗位详细信息失败，静默处理
      } finally {
        detailLoading.value = false;
      }
    }
  };

  /**
   * 点击新增
   */
  const handleAdd = () => {
    isAdding.value = true;
    currentRecord.value = null;
    // 清空表单，设置默认值
    Object.keys(formData).forEach((key) => delete (formData as any)[key]);
    formData.gender = 1;
    formData.status = 1;
    formData.politicalStatus = 3; // 默认群众
    resetExtData();
  };

  const resetExtData = () => {
    extData.position = {
      primaryProfession: '',
      secondaryProfession: '',
      jobCategory: '',
      positionType: '',
    };
  };

  /**
   * 职称变更时，同步更新职称名称
   */
  const handleTitleChange = (titleId: string) => {
    const selectedTitle = professionalTitleList.value.find(
      (t) => t.titleId === titleId
    );
    if (selectedTitle) {
      formData.professionalTitleName = selectedTitle.titleName || '';
    }
  };

  const handleCancel = () => {
    isAdding.value = false;
    currentRecord.value = null;
  };

  /**
   * 上传头像逻辑
   */
  //   const triggerUpload = () => {
  //     // a-upload 内置了点击触发，这里主要作为容器层，不需要额外逻辑
  //   };

  // 打开照片编辑器
  const handleOpenPhotoEditor = () => {
    photoEditorVisible.value = true;
  };

  // 照片编辑器完成
  const handlePhotoEditorComplete = async (data: {
    base64: string;
    file: File;
  }) => {
    try {
      const { data: uploadResult } = await fileApi.uploadFile(
        data.file,
        'avatar'
      );
      if (uploadResult?.url) {
        formData.avatarUrl = uploadResult.url;
        Message.success('证件照上传成功，保存后生效');
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

  // 保留原有的上传方法（兼容性）
  // const onAvatarUpload = async (options: any) => {
  //   const { fileItem } = options;
  //   try {
  //     const { data } = await fileApi.uploadFile(fileItem.file, 'avatar');
  //     if (data?.url) {
  //       formData.avatarUrl = data.url;
  //       Message.success('头像上传成功，保存后生效');
  //     }
  //   } catch (e) {
  //     Message.error('头像上传失败');
  //   }
  // };

  /**
   * 保存档案
   */
  const handleSave = async () => {
    const errors = await employeeFormRef.value?.formRef?.validate();
    if (errors) {
      Message.error('表单填写有误，请检查');
      return;
    }

    try {
      submitLoading.value = true;
      // 1. 保存主表数据
      if (isAdding.value) {
        await createEmployee(formData);
      } else {
        if (!formData.userCode) {
          Message.error('工号不能为空');
          return;
        }
        await updateEmployee(formData.userCode, formData);
      }

      const { userCode } = formData;
      if (!userCode) {
        Message.error('工号不能为空');
        return;
      }

      // 2. 保存岗位子表数据
      await employeeRecordApi.savePosition(userCode, extData.position);

      // 3. 如果是新建模式，批量保存所有子表数据
      if (isAdding.value) {
        const formRef = employeeFormRef.value;
        const saveResults = await Promise.all([
          formRef.educationListRef?.saveAllData(userCode),
          formRef.skillsListRef?.saveAllData(userCode),
          formRef.contactsListRef?.saveAllData(userCode),
          formRef.performanceListRef?.saveAllData(userCode),
          formRef.rankTimelineRef?.saveAllData(userCode),
          formRef.mentorsListRef?.saveAllData(userCode),
          formRef.teachingCertListRef?.saveAllData(userCode),
          formRef.teachingRecordListRef?.saveAllData(userCode),
          formRef.secondaryEduListRef?.saveAllData(userCode),
          formRef.honorsListRef?.saveAllData(userCode),
        ]);

        const allSuccess = saveResults.every((result) => result !== false);
        if (!allSuccess) {
          Message.warning('部分子表数据保存失败，请检查');
        }
      }

      Message.success('人事档案已全量更新');
      isAdding.value = false;
      fetchData();
    } finally {
      submitLoading.value = false;
    }
  };

  onMounted(async () => {
    await fetchData();
    // 获取部门树形结构
    await fetchDepartmentTree();
    await fetchDepartmentList();
    // 获取职级列表
    const rankRes = await jobRankApi.getJobRankList();
    jobRankList.value = rankRes.data || [];
    // 获取专业职称列表
    const titleRes = await professionalTitleApi.getProfessionalTitleList();
    professionalTitleList.value = titleRes.data || [];
  });
</script>

<style scoped lang="less">
  .employee-management-container {
    padding: 12px;
    height: calc(100vh - 180px);
    background-color: #f4f7f9;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .page-breadcrumb {
      flex-shrink: 0;
      margin-bottom: 12px;
      padding-left: 4px;
      :deep(.arco-breadcrumb-item) {
        color: #86909c;
        &:last-child {
          color: #1d2129;
          font-weight: 500;
        }
      }
    }

    .management-layout {
      flex: 1;
      min-height: 0;
    }
  }

  .left-col,
  .right-col {
    height: 100%;
  }

  :deep(.arco-form-item-label) {
    font-weight: 500;
    color: #4e5969;
    margin-bottom: 6px;
  }

  :deep(.arco-input-wrapper),
  :deep(.arco-select-view),
  :deep(.arco-textarea-wrapper) {
    background-color: #f7f8fa;
    border-color: #f2f3f5;
    &:hover {
      background-color: #f2f3f5;
    }
  }
</style>
