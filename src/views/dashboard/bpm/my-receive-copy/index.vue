<!--收到的抄送-->
<template>
  <div class="list-card-container">
    <a-card title="收到的抄送" class="general-card">
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
            <template #ccType="{ record }">
              <a-tag :color="typeMap[record.ccType]?.color">
                <span>{{ typeMap[record.ccType]?.text }}</span>
              </a-tag>
            </template>
            <template #isRead="{ record }">
              <a-tag :color="readMap[record.instCp.isRead]?.color">
                <span>{{ readMap[record.instCp.isRead]?.text }}</span>
              </a-tag>
            </template>
            <template #action="{ record }">
              <a-space>
                <a-link @click="readInstanceCp(record)">明细</a-link>
              </a-space>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import TableSearch from '@/components/cac-components/advanced-search/index.vue';
  import { MyTurnToRecord } from '@/api/bpm/model/bpmInstanceCcModel';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  import {
    queryMyReceiveCopyPage,
    updateReadStatus,
  } from '@/api/bpm/bpm-instance-cc';
  import { openDraft, openDetail } from '@/utils/bpm/bpm-util';
  import BpmCategoryTree from '@/components/bpm/tree-category.vue';

  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
  ];
  const typeMap: any = {
    COPY: { color: 'green', text: '抄送' },
    TURN_TO: { color: 'red', text: '转发' },
  };
  const readMap: any = {
    YES: { color: 'green', text: '已读' },
    NO: { color: 'red', text: '未读' },
  };
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
    table: 'BPM_INST_CC t join BPM_INST_CP c on t.ID_ = c.CC_ID_',
    field: 't.TREE_ID_',
    whereConf: [
      {
        name: 'USER_ID_',
        alias: 'c.USER_ID_',
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
  const handleSearch = async (reqdata?: MyTurnToRecord) => {
    const { ...res } = reqdata || {};
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        ...res,
      },
    };
    loading.value = true;
    try {
      const { data } = await queryMyReceiveCopyPage(params);
      list.value = data.result.data;
      //   console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
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
        Q_TREE_ID__S_EQ: treeId?.[0],
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    // console.log('params', params);
    try {
      const { data } = await queryMyReceiveCopyPage(params);
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
      title: '事项标题',
      dataIndex: 'subject',
      width: 180,
      ellipsis: false,
    },
    {
      title: '转发节点',
      dataIndex: 'nodeName',
      width: 120,
    },
    {
      title: '转发时间',
      dataIndex: 'createTime',
      width: 120,
    },
    {
      title: '转发/抄送类型',
      dataIndex: 'ccType',
      width: 120,
      slotName: 'ccType',
    },
    {
      title: '是否已读',
      dataIndex: 'isRead',
      width: 140,
      slotName: 'isRead',
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 140,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      fixed: 'left',
      slotName: 'action',
    },
  ];
  // 阅读明细并跳转
  const readInstanceCp = async (record: MyTurnToRecord) => {
    await updateReadStatus(record.instCp.id);
    await gotoDetail(record);
    handleSearch();
  };
  // 明细
  const gotoDetail = async (record: MyTurnToRecord) => {
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
