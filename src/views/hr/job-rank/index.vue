<template>
  <div class="job-rank-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>职级管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input
              v-model="searchForm.rankName"
              placeholder="请输入职级名称"
              allow-clear
              @press-enter="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model="searchForm.rankType"
              placeholder="选择职级类型"
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">技术岗</a-option>
              <a-option :value="2">职能岗</a-option>
              <a-option :value="3">技能岗</a-option>
            </a-select>
          </a-col>
          <a-col :span="10">
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
              <a-button type="primary" @click="showAddModal">
                <template #icon>
                  <icon-plus />
                </template>
                新增职级
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 职级列表表格 -->
    <div class="rank-table">
      <a-card :bordered="false">
        <a-table
          :columns="columns"
          :data="rankList"
          :loading="loading"
          :pagination="false"
          row-key="rankId"
        >
          <template #rankType="{ record }">
            <a-tag :color="getRankTypeColor(record.rankType)">
              {{ getRankTypeName(record.rankType) }}
            </a-tag>
          </template>

          <template #description="{ record }">
            <a-typography-paragraph
              :ellipsis="{ rows: 2, showTooltip: true }"
              style="margin: 0"
            >
              {{ record.description || '-' }}
            </a-typography-paragraph>
          </template>

          <template #operations="{ record }">
            <a-space>
              <a-button type="text" size="small" @click="handleEdit(record)">
                <template #icon>
                  <icon-edit />
                </template>
                编辑
              </a-button>

              <a-button
                type="text"
                size="small"
                status="danger"
                @click="handleDelete(record)"
              >
                <template #icon>
                  <icon-delete />
                </template>
                删除
              </a-button>
            </a-space>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 职级详情/编辑弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
      >
        <a-form-item v-if="isEdit" label="职级ID" field="rankId">
          <a-input v-model="formData.rankId" disabled />
        </a-form-item>

        <a-form-item v-else label="职级ID" field="rankId">
          <a-input
            v-model="formData.rankId"
            placeholder="请输入职级ID（如 TECH_L5, FUNC_M3）"
          />
        </a-form-item>

        <a-form-item label="职级名称" field="rankName">
          <a-input v-model="formData.rankName" placeholder="请输入职级名称" />
        </a-form-item>

        <a-form-item label="职级类型" field="rankType">
          <a-select v-model="formData.rankType" placeholder="请选择职级类型">
            <a-option :value="1">技术岗</a-option>
            <a-option :value="2">职能岗</a-option>
            <a-option :value="3">技能岗</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="职级等级" field="rankLevel">
          <a-input-number
            v-model="formData.rankLevel"
            placeholder="请输入职级等级"
            :min="1"
            :precision="0"
          />
        </a-form-item>

        <a-form-item label="职级说明" field="description">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入职级说明"
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { Modal } from '@arco-design/web-vue';
  import useJobRank from '@/hooks/hr/job-rank';
  import type { JobRank } from '@/api/hr/types';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  /**
   * 搜索表单数据结构
   */
  interface SearchForm {
    rankName?: string;
    rankType?: number;
  }

  /**
   * 表单数据结构
   */
  interface FormData {
    rankId: string;
    rankName: string;
    rankType: number;
    rankLevel?: number;
    description?: string;
  }

  // 表格列定义
  const columns: TableColumnData[] = [
    {
      title: '序号',
      width: 50,
      align: 'center',
      render: ({ rowIndex }: { rowIndex: number }) => rowIndex + 1,
    },
    {
      title: '职级ID',
      dataIndex: 'rankId',
      width: 100,
    },
    {
      title: '职级名称',
      dataIndex: 'rankName',
      width: 100,
    },
    {
      title: '职级类型',
      slotName: 'rankType',
      width: 90,
    },
    {
      title: '职级等级',
      dataIndex: 'rankLevel',
      width: 90,
    },
    {
      title: '职级说明',
      slotName: 'description',
      width: 160,
      ellipsis: true,
      // 不设置宽度，让这一列自适应剩余空间
    },
    {
      title: '操作',
      align: 'center',
      slotName: 'operations',
      width: 160,
    },
  ];

  // 使用 Hook
  const {
    loading,
    jobRankList,
    fetchJobRankList,
    createJobRank,
    updateJobRank,
    deleteJobRank,
  } = useJobRank({ autoLoad: false });

  // 响应式数据
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentRank = ref<JobRank | null>(null);

  // 搜索表单
  const searchForm = reactive<SearchForm>({
    rankName: '',
    rankType: undefined,
  });

  // 表单数据
  const formData = reactive<FormData>({
    rankId: '',
    rankName: '',
    rankType: 1,
    rankLevel: undefined,
    description: '',
  });

  // 表单引用
  const formRef = ref();

  // 表单验证规则
  const formRules = {
    rankId: [
      { required: true, message: '请输入职级ID' },
      {
        pattern: /^[A-Z_0-9]+$/,
        message: '职级ID只能包含大写字母、数字和下划线',
      },
    ],
    rankName: [{ required: true, message: '请输入职级名称' }],
    rankType: [{ required: true, message: '请选择职级类型' }],
  };

  // 计算属性
  const modalTitle = computed(() => {
    return isEdit.value ? '编辑职级' : '新增职级';
  });

  /**
   * 获取职级类型颜色
   * @param rankType 职级类型
   * @returns 颜色值
   */
  const getRankTypeColor = (rankType: number): string => {
    switch (rankType) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'orange';
      default:
        return 'gray';
    }
  };

  /**
   * 获取职级类型名称
   * @param rankType 职级类型
   * @returns 类型名称
   */
  const getRankTypeName = (rankType: number): string => {
    switch (rankType) {
      case 1:
        return '技术岗';
      case 2:
        return '职能岗';
      case 3:
        return '技能岗';
      default:
        return '未知';
    }
  };

  /**
   * 获取职级列表（带搜索过滤）
   */
  const getRankList = async (): Promise<void> => {
    await fetchJobRankList();
  };

  // 过滤后的职级列表
  const rankList = computed(() => {
    let list = [...jobRankList.value];
    const { rankName, rankType } = searchForm;
    if (rankName) {
      list = list.filter((rank) => rank.rankName.includes(rankName));
    }
    if (rankType !== undefined) {
      list = list.filter((rank) => rank.rankType === rankType);
    }
    return list;
  });

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    getRankList();
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchForm.rankName = '';
    searchForm.rankType = undefined;
    getRankList();
  };

  /**
   * 显示新增弹窗
   */
  const showAddModal = () => {
    isEdit.value = false;
    currentRank.value = null;
    resetForm();
    modalVisible.value = true;
  };

  /**
   * 编辑职级
   */
  const handleEdit = (rank: JobRank) => {
    isEdit.value = true;
    currentRank.value = rank;
    fillForm(rank);
    modalVisible.value = true;
  };

  /**
   * 删除职级
   */
  const handleDelete = (rank: JobRank): void => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除职级"${rank.rankName}"吗？`,
      onOk: async () => {
        const success = await deleteJobRank(rank.rankId);
        if (success) {
          await getRankList();
        }
      },
    });
  };

  /**
   * 填充表单数据
   */
  const fillForm = (rank: JobRank) => {
    formData.rankId = rank.rankId;
    formData.rankName = rank.rankName;
    formData.rankType = rank.rankType;
    formData.rankLevel = rank.rankLevel;
    formData.description = rank.description || '';
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    formData.rankId = '';
    formData.rankName = '';
    formData.rankType = 1;
    formData.rankLevel = undefined;
    formData.description = '';
    formRef.value?.resetFields();
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    const valid = await formRef.value?.validate();
    if (!valid) {
      return;
    }

    let success = false;
    if (isEdit.value && currentRank.value) {
      // 更新
      success = await updateJobRank(currentRank.value.rankId, formData);
    } else {
      // 新增
      success = await createJobRank(formData);
    }

    if (success) {
      modalVisible.value = false;
      await getRankList();
    }
  };

  /**
   * 取消操作
   */
  const handleCancel = () => {
    modalVisible.value = false;
    resetForm();
  };

  // 初始化
  getRankList();
</script>

<style scoped lang="less">
  .job-rank-management {
    padding: 12px 20px;
    background-color: #f4f7f9;
    min-height: calc(100vh - 60px);

    .page-header {
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

    :deep(.arco-card) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .search-section {
      margin-bottom: 16px;
    }
  }
</style>
