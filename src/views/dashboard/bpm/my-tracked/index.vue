<!--我的跟踪-->
<template>
  <div class="list-card-container">
    <a-card title="我的跟踪" class="general-card">
      <div class="bpm-tree-wrapper">
        <div class="bpm-tree-operator">
          <BpmCategoryTree
            cat-key="BPM"
            read-key="inst.read"
            :statistic-config="statisticConfig"
            @select="handleSearchByTreeId"
          />
        </div>
        <div class="bpm-tree-content">
          <TableSearch
            ref="searchRef"
            :data-source="SEARCH_FORM"
            @change="handleSearch"
          />
          <a-table
            :columns="COLUMNS"
            :data="list"
            :pagination="pagination"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #subject="{ record }">
              <a-link @click="gotoDetail(record)">{{
                record.bpmInst.subject
              }}</a-link>
            </template>
            <template #action="{ record }">
              <a-link @click="removeMyTracked(record.instId)">取消跟踪</a-link>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData, Modal, Message } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import TableSearch from '@/components/cac-components/advanced-search/index.vue';
  //   import { BpmMyTaskParams, BpmTaskRecord } from '@/api/bpm/model/bpmTaskModal';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  //   import { queryBpmTaskPage } from '@/api/bpm/bpm-mytask';
  import { openDetail, openDraft } from '@/utils/bpm/bpm-util';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { BpmMyTrackedParams } from '@/api/bpm/model/bpmTrackedModel';
  import { queryBpmMyTrackedPage, removeTracked } from '@/api/bpm/bpm-track';
  import BpmCategoryTree from '@/components/bpm/tree-category.vue';

  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_b.SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
    {
      fieldName: 'Q_b.CREATE_TIME__D_GT',
      labelText: '任务创建开始时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
    {
      fieldName: 'Q_b.CREATE_TIME__D_LT',
      labelText: '任务创建结束时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
  ];
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const searchRef = ref<any>();
  const onPageChange = (current: number) => {
    pagination.current = current;
    searchRef.value.handleSubmit(); // 与搜索结果保持一致
  };
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    searchRef.value.handleSubmit(); // 与搜索结果保持一致
  };
  const list = ref<any[]>([]);
  const loading = ref<boolean>(false);
  const statisticConfig: any = {
    type: 'static_bpm',
    table: 'BPM_INST_TRACKED a JOIN BPM_INST t on a.INST_ID_ = t.INST_ID_',
    field: 't.TREE_ID_',
    whereConf: [
      {
        name: 'CREATE_BY_',
        alias: 'a.CREATE_BY_',
        type: 'string',
        dateFormat: '',
        op: '=',
        value: 'curUserId',
        valueType: 'context',
      },
    ],
  };
  onMounted(() => {
    handleSearch();
  });
  // func: 查询
  const handleSearch = async (reqdata?: BpmMyTrackedParams) => {
    const { CREATE_TIME__D_GT, CREATE_TIME__D_LT, ...res } = reqdata || {};
    let startTime;
    let endTime;
    if (CREATE_TIME__D_GT) {
      startTime = new Date(CREATE_TIME__D_GT);
    }
    if (CREATE_TIME__D_LT) {
      endTime = new Date(CREATE_TIME__D_LT);
    }
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        ...res,
        CREATE_TIME__D_GE: startTime,
        CREATE_TIME__D_LE: endTime,
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyTrackedPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  const doRemoveTracked = async (instId: string) => {
    try {
      const { data } = await removeTracked(instId);
      Message.success(data.message);
    } finally {
      handleSearch();
    }
  };
  // 根据流程分类查询
  const handleSearchByTreeId = async (treeId: string[]) => {
    if (treeId[0] === '0') {
      treeId[0] = '';
    }
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        'Q_b.TREE_ID__S_EQ': treeId?.[0],
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    // console.log('params', params);
    try {
      const { data } = await queryBpmMyTrackedPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  const COLUMNS: TableColumnData[] = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'index',
      width: 80,
      render: ({ rowIndex }) => rowIndex + 1,
      fixed: 'left',
    },
    {
      title: '处理时间',
      dataIndex: 'createTime',
      width: 180,
      ellipsis: false,
    },
    {
      title: '文档标题',
      dataIndex: 'subject',
      slotName: 'subject',
      width: 180,
    },
    {
      title: '处理步骤',
      dataIndex: 'curNode',
      width: 100,
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      fixed: 'right',
      slotName: 'action',
    },
  ];
  const gotoDetail = async (record: BpmInstRecord) => {
    const { appId, instId } = record;
    try {
      const { data } = await getInfoByDefKeyInstId({
        type: 'openDoc',
        id: instId,
        action: 'detail',
      });
      if (data.action === 'detail') {
        openDetail(appId, instId);
      }
      if (data.action === 'startDraft') {
        openDraft(data.defKey);
      }
    } finally {
      // empty
    }
  };
  const removeMyTracked = async (instId: string) => {
    Modal.warning({
      title: '警告',
      content: '确定取消跟踪吗',
      hideCancel: false,
      onOk: () => doRemoveTracked(instId),
    });
  };
</script>

<style scoped lang="less">
  .list-card-container {
    padding: 20px;
    border-right: 1px var(--border-radius-default);
  }

  .bpm-tree {
    &-wrapper {
      overflow-y: hidden;
    }

    &-operator {
      float: left;
      width: 240px;
    }

    &-content {
      padding-left: 14px;
      overflow: hidden;
      border-left: 1px solid var(--color-border-1);
    }
  }
</style>
