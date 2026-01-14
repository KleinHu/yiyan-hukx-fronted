<template>
  <div class="professional-title-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <a-breadcrumb>
        <a-breadcrumb-item><icon-apps /></a-breadcrumb-item>
        <a-breadcrumb-item>人事管理</a-breadcrumb-item>
        <a-breadcrumb-item>职称管理</a-breadcrumb-item>
      </a-breadcrumb>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-input
              v-model="searchForm.titleName"
              placeholder="请输入职称名称"
              allow-clear
              @press-enter="handleSearch"
            >
              <template #prefix>
                <icon-search />
              </template>
            </a-input>
          </a-col>
          <a-col :span="5">
            <a-select
              v-model="searchForm.titleCategory"
              placeholder="选择职称类别"
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">工程技术</a-option>
              <a-option :value="2">经济</a-option>
              <a-option :value="3">会计</a-option>
              <a-option :value="4">统计</a-option>
              <a-option :value="5">其他</a-option>
            </a-select>
          </a-col>
          <a-col :span="5">
            <a-select
              v-model="searchForm.titleLevel"
              placeholder="选择职称级别"
              allow-clear
              @change="handleSearch"
            >
              <a-option :value="1">初级</a-option>
              <a-option :value="2">中级</a-option>
              <a-option :value="3">副高级</a-option>
              <a-option :value="4">正高级</a-option>
            </a-select>
          </a-col>
          <a-col :span="8">
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
                新增职称
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <!-- 职称列表表格 -->
    <div class="title-table">
      <a-card :bordered="false">
        <a-table
          :columns="columns"
          :data="titleList"
          :loading="loading"
          :pagination="false"
          row-key="titleId"
        >
          <template #titleCategory="{ record }">
            <a-tag :color="getCategoryColor(record.titleCategory)">
              {{ getCategoryName(record.titleCategory) }}
            </a-tag>
          </template>

          <template #titleLevel="{ record }">
            <a-tag :color="getLevelColor(record.titleLevel)">
              {{ getLevelName(record.titleLevel) }}
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
              <a-button type="text" size="small" @click="handleView(record)">
                <template #icon>
                  <icon-eye />
                </template>
                查看
              </a-button>

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

    <!-- 职称详情/编辑弹窗 -->
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
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="职称ID" field="titleId">
              <a-input
                v-model="formData.titleId"
                placeholder="如 ENG_JR"
                :disabled="isEdit"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职称名称" field="titleName">
              <a-input
                v-model="formData.titleName"
                placeholder="如 助理工程师"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="职称类别" field="titleCategory">
              <a-select
                v-model="formData.titleCategory"
                placeholder="请选择类别"
              >
                <a-option :value="1">工程技术</a-option>
                <a-option :value="2">经济</a-option>
                <a-option :value="3">会计</a-option>
                <a-option :value="4">统计</a-option>
                <a-option :value="5">其他</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="职称级别" field="titleLevel">
              <a-select v-model="formData.titleLevel" placeholder="请选择级别">
                <a-option :value="1">初级</a-option>
                <a-option :value="2">中级</a-option>
                <a-option :value="3">副高级</a-option>
                <a-option :value="4">正高级</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="排序权重" field="sortOrder">
          <a-input-number v-model="formData.sortOrder" :min="0" />
        </a-form-item>

        <a-form-item label="职称说明" field="description">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入职称说明"
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import professionalTitleApi from '@/api/hr/professional-title';
  import type { ProfessionalTitle } from '@/api/hr/types';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';

  // 表格列定义
  const columns: TableColumnData[] = [
    { title: '职称ID', dataIndex: 'titleId', width: 120 },
    { title: '职称名称', dataIndex: 'titleName', width: 150 },
    { title: '类别', slotName: 'titleCategory', width: 120 },
    { title: '级别', slotName: 'titleLevel', width: 100 },
    { title: '权重', dataIndex: 'sortOrder', width: 80 },
    { title: '说明', slotName: 'description', width: 200, ellipsis: true },
    { title: '操作', slotName: 'operations', width: 200, fixed: 'right' },
  ];

  // 状态数据
  const loading = ref(false);
  const titleList = ref<ProfessionalTitle[]>([]);
  const modalVisible = ref(false);
  const isEdit = ref(false);
  const currentTitle = ref<ProfessionalTitle | null>(null);

  // 搜索表单
  const searchForm = reactive({
    titleName: '',
    titleCategory: undefined as number | undefined,
    titleLevel: undefined as number | undefined,
  });

  // 弹窗表单
  const formData = reactive({
    titleId: '',
    titleName: '',
    titleCategory: 1,
    titleLevel: 1,
    sortOrder: 0,
    description: '',
  });

  const formRef = ref();
  const formRules = {
    titleId: [{ required: true, message: '请输入职称ID' }],
    titleName: [{ required: true, message: '请输入职称名称' }],
    titleCategory: [{ required: true, message: '请选择类别' }],
    titleLevel: [{ required: true, message: '请选择级别' }],
  };

  const modalTitle = computed(() => (isEdit.value ? '编辑职称' : '新增职称'));

  // 工具函数
  const getCategoryName = (val: number) => {
    const map: Record<number, string> = {
      1: '工程技术',
      2: '经济',
      3: '会计',
      4: '统计',
      5: '其他',
    };
    return map[val] || '未知';
  };

  const getCategoryColor = (val: number) => {
    const map: Record<number, string> = {
      1: 'blue',
      2: 'green',
      3: 'orange',
      4: 'purple',
      5: 'gray',
    };
    return map[val] || 'gray';
  };

  const getLevelName = (val: number) => {
    const map: Record<number, string> = {
      1: '初级',
      2: '中级',
      3: '副高级',
      4: '正高级',
    };
    return map[val] || '未知';
  };

  const getLevelColor = (val: number) => {
    const map: Record<number, string> = {
      1: 'gray',
      2: 'cyan',
      3: 'arcoblue',
      4: 'red',
    };
    return map[val] || 'gray';
  };

  /**
   * 获取职称列表
   */
  const getTitleList = async () => {
    try {
      loading.value = true;
      const res = await professionalTitleApi.getProfessionalTitleList();
      if (res.code === 200) {
        let list = res.data || [];
        if (searchForm.titleName) {
          list = list.filter((i) => i.titleName.includes(searchForm.titleName));
        }
        if (searchForm.titleCategory) {
          list = list.filter(
            (i) => i.titleCategory === searchForm.titleCategory
          );
        }
        if (searchForm.titleLevel) {
          list = list.filter((i) => i.titleLevel === searchForm.titleLevel);
        }
        titleList.value = list;
      }
    } catch (e) {
      Message.error('加载失败');
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => getTitleList();
  const handleReset = () => {
    Object.assign(searchForm, {
      titleName: '',
      titleCategory: undefined,
      titleLevel: undefined,
    });
    getTitleList();
  };

  const showAddModal = () => {
    isEdit.value = false;
    currentTitle.value = null;
    Object.assign(formData, {
      titleId: '',
      titleName: '',
      titleCategory: 1,
      titleLevel: 1,
      sortOrder: 0,
      description: '',
    });
    modalVisible.value = true;
  };

  const handleView = (title: ProfessionalTitle) => {
    handleEdit(title);
  };

  const handleEdit = (title: ProfessionalTitle) => {
    isEdit.value = true;
    currentTitle.value = title;
    Object.assign(formData, {
      titleId: title.titleId,
      titleName: title.titleName,
      titleCategory: title.titleCategory,
      titleLevel: title.titleLevel,
      sortOrder: title.sortOrder || 0,
      description: title.description || '',
    });
    modalVisible.value = true;
  };

  const handleDelete = (title: ProfessionalTitle) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除职称"${title.titleName}"吗？`,
      onOk: async () => {
        const res = await professionalTitleApi.deleteProfessionalTitle(
          title.titleId
        );
        if (res.code === 200) {
          Message.success('删除成功');
          getTitleList();
        }
      },
    });
  };

  const handleSubmit = async () => {
    const err = await formRef.value?.validate();
    if (err) return;

    try {
      const res = isEdit.value
        ? await professionalTitleApi.updateProfessionalTitle(
            formData.titleId,
            formData
          )
        : await professionalTitleApi.createProfessionalTitle(formData);

      if (res.code === 200) {
        Message.success('保存成功');
        modalVisible.value = false;
        getTitleList();
      }
    } catch (e) {
      Message.error('保存失败');
    }
  };

  const handleCancel = () => {
    modalVisible.value = false;
  };

  onMounted(getTitleList);
</script>

<style scoped lang="less">
  .professional-title-management {
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

    .title-table {
      .arco-table {
        :deep(.arco-table-th) {
          background-color: var(--color-bg-2);
        }
      }
    }
  }
</style>
