<!-- 待办内容 -->
<!--created by yuyupeng 2023/6/25-->
<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '17px 20px 21px 20px' }"
    >
      <template #title>
        <a-row align="center">
          待办事项
          <a-badge style="margin-left: 5px" :count="todoDataList.length" />
        </a-row>
      </template>
      <template #extra>
        <a-space>
          <a-tooltip content="刷新">
            <icon-sync @click="getTodoList" />
          </a-tooltip>
          <a-tooltip content="查看更多">
            <icon-more />
          </a-tooltip>
        </a-space>
      </template>
      <a-space direction="vertical" :size="10" fill>
        <a-list :max-height="300" :scrollbar="true" size="small">
          <a-list-item v-for="item in todoDataList" :key="item.id">
            <div class="textEllipsis" @click="toTodoDetail(item)">
              {{ item.title }}
            </div>
            <template #actions>
              <a-popconfirm
                content="确定删除吗？"
                type="warning"
                @ok="deleteTodo(item)"
              >
                <icon-delete style="color: hotpink" />
              </a-popconfirm>
            </template>
          </a-list-item>
        </a-list>
      </a-space>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  // import { ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import { Notification } from '@arco-design/web-vue';
  import { onMounted, ref } from 'vue';
  import {
    queryTodoRecordListByPage,
    deleteTodoRecord,
    readeTodoRecord,
  } from '@/api/system/todo';
  import { TodoRecord } from '@/api/system/model/todoModel';
  import { useUserStore } from '@/store';
  import { ToReadParams } from '@/api/system/model/toReadModel';

  const { loading, setLoading } = useLoading(); // 控制是否加载中
  const todoDataList = ref<TodoRecord[]>([]); // 待办数据
  /**
   * fun
   */
  /**
   * @description 转到待办详情，通过url跳转
   * @param item 点击的待办信息
   */
  const toTodoDetail = async (item: TodoRecord) => {
    const userStore = useUserStore();
    const { data } = await readeTodoRecord(
      item.id as string,
      userStore.userCode as string
    ); // 调用阅读待办接口
    window.open(data.url, '_blank');
    getTodoList(); // 跳转url的同时刷新一下待办数据
  };
  /**
   * @description 删除待办
   * @param item 点击的待办信息
   */
  const deleteTodo = async (item: TodoRecord) => {
    try {
      const { data } = await deleteTodoRecord(item.id as string);
      if (data) {
        getTodoList(); // 重新获取待办信息
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    }
  };
  /**
   * @description 根据userId查询他的所有待办数据
   */
  const getTodoList = async () => {
    setLoading(true);
    const userStore = useUserStore();
    try {
      const params: ToReadParams = {
        page: 1,
        limit: 10000,
      };
      const { data } = await queryTodoRecordListByPage(
        userStore.userCode as string,
        params
      );
      todoDataList.value = data.list;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  /**
   * onMounted
   */
  onMounted(() => {
    getTodoList();
  });
</script>

<style scoped lang="less">
  .general-card {
    min-height: 395px;
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

  .textEllipsis {
    width: 480px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
