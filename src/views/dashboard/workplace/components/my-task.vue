<!-- 组件：我的待办 -->
<template>
  <div>
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '17px 20px 21px 20px' }"
    >
      <template #title>
        <a-row align="center">
          流程待办
          <a-badge style="margin-left: 5px" :count="pagination.total" />
        </a-row>
      </template>
      <template #extra>
        <a-tooltip content="重新加载">
          <a-button type="text" @click="handleSearch">
            <template #icon>
              <icon-refresh />
            </template>
          </a-button>
        </a-tooltip>
        <a-tooltip content="查看更多">
          <a-button type="text">
            <template #icon>
              <icon-more />
            </template>
          </a-button>
        </a-tooltip>
      </template>
      <a-table
        :columns="COLUMNS"
        :data="list"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1500, y: 300 }"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #status="{ record }">
          <a-tag v-if="record.status == 'UNHANDLE'" color="red">待办</a-tag>
          <a-tag v-else-if="record.status == 'HANDLE'" color="green"
            >处理中
          </a-tag>
        </template>
        <template #assignee="{ record }">
          <a-tag v-for="taskExe in record.taskExecutors" :key="taskExe.id">
            <a-icon :type="taskExe.type" />
            {{ taskExe.name }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-link @click="handleTask(record)">办理</a-link>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import { BpmTaskRecord } from '@/api/bpm/model/bpmTaskModel';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  import { queryBpmMyTaskPage } from '@/api/bpm/bpm-task';
  import { openTask, openDraft } from '@/utils/bpm/bpm-util';

  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const onPageChange = (current: number) => {
    pagination.current = current;
    handleSearch();
  };
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    handleSearch();
  };
  const list = ref<any[]>([]);
  const loading = ref<boolean>(false);
  onMounted(() => {
    handleSearch();
  });
  //   func: 查询
  const handleSearch = async () => {
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {},
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyTaskPage(params);
      list.value = data.result.data;
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
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '单号',
      dataIndex: 'billNo',
      width: 100,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '审批环节',
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 120,
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 100,
    },
    {
      title: '发送时间',
      dataIndex: 'createTime',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      slotName: 'action',
    },
  ];
  const handleTask = async (record: BpmTaskRecord) => {
    const { instId, taskId } = record;
    try {
      const { data } = await getInfoByDefKeyInstId({
        type: 'openDoc',
        id: instId,
        taskId,
        action: 'task',
      });
      if (data.action === 'task') {
        openTask(instId, taskId);
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
  .general-card {
    max-height: 495px;
  }

  :deep(.arco-table-tr) {
    height: 44px;

    .arco-typography {
      margin-bottom: 0;
    }
  }

  .increases-cell {
    display: flex;
    align-items: center;

    span {
      margin-right: 4px;
    }
  }

  .text-ellipsis {
    width: 480px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
