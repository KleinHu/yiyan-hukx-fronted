<!-- 快捷入口 -->
<!--created by yuyupeng 2023/11/14-->
<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '17px 20px 21px 20px' }"
    >
      <template #title>
        <a-row align="center">
          快捷入口
          <a-badge
            style="margin-left: 5px"
            :count="quickAccessDataList.length"
          />
        </a-row>
      </template>
      <template #extra>
        <a-space>
          <a-tooltip content="刷新">
            <icon-sync @click="getQuickAccessList" />
          </a-tooltip>
          <a-tooltip content="管理">
            <icon-settings @click="openMenuSelectModal" />
          </a-tooltip>
        </a-space>
      </template>
      <a-scrollbar style="max-height: 300px; overflow: auto">
        <a-row
          v-if="quickAccessDataList.length > 0"
          :gutter="[6, 6]"
          style="width: 100%"
        >
          <a-col
            v-for="item in quickAccessDataList"
            :key="item.id"
            :xs="8"
            :sm="8"
            :md="6"
            :lg="6"
            :xl="6"
            :xxl="6"
          >
            <a-row justify="center">
              <a-button v-if="item.alternateField1" @click="toMenu(item)">
                <template #icon>
                  <MenuIcon :element="item" :size="20" />
                </template>
              </a-button>
              <a-button v-else @click="toMenu(item)">
                <template #icon>
                  <icon-empty
                    style="color: rgb(36, 103, 255, 0.8)"
                    :size="20"
                  />
                </template>
              </a-button>
            </a-row>
            <a-row justify="center" style="margin-top: 5px">
              <a-col :span="24">
                <div style="font-size: 12px; text-align: center">
                  {{ item.title }}
                </div>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-empty v-else />
      </a-scrollbar>
    </a-card>
    <MenuSelectModal
      ref="menuSelectModalRef"
      :mask-closable="true"
      :exclude-names="excludeNames"
      :default-checked-menu-list="quickAccessDataList"
      @submit="submitMenuSelectModal"
    />
  </a-spin>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import { Notification } from '@arco-design/web-vue';
  import { onMounted, ref } from 'vue';
  import { useUserStore } from '@/store';
  import MenuSelectModal from '@/components/cac-components/menu-select-modal/index.vue';
  import MenuIcon from '@/components/cac-components/menu-select-modal/components/menu-icon.vue';
  import {
    queryQuickAccessRecordList,
    updateQuickAccessRecord,
  } from '@/api/system/quickAccess';
  import { QuickAccessRecord } from '@/api/system/model/quickAccessModel';
  import { useRouter } from 'vue-router';

  defineProps({
    excludeNames: { type: Array<string>, default: () => [] },
  });

  const { loading, setLoading } = useLoading(); // 控制是否加载中
  const router = useRouter(); // 路由
  const quickAccessDataList = ref<any[]>([]); // 快捷入口数据
  const menuSelectModalRef = ref<any>();
  /**
   * fun
   */
  /**
   * @description 开启部门人员选择组件modal
   */
  const openMenuSelectModal = () => {
    menuSelectModalRef.value.openMenuSelectModal();
  };
  /**
   * @description 转到快捷入口详情，通过url跳转
   * @param item 点击的快捷入口信息
   */
  /* const toTodoDetail = (item: TodoRecord) => {
    window.open(item.taskUrl, '_blank');
  }; */
  /**
   * @description 删除快捷入口
   * @param item 点击的快捷入口信息
   */
  /* const deleteTodo = async (item: TodoRecord) => {
    try {
      const { data } = await deleteTodoRecord(item.id as string);
      if (data) {
        getQuickAccessList(); // 重新获取快捷入口信息
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    }
  }; */
  /**
   * @description 根据userId查询他的所有快捷入口数据
   */
  const getQuickAccessList = async () => {
    setLoading(true);
    const userStore = useUserStore();
    try {
      const { data } = await queryQuickAccessRecordList({
        pageNo: 1,
        pageSize: 10000,
        personCode: userStore.userCode,
        orderField: 'weight', // 对weight字段进行排序
        order: 'asc', // 排序方式，分为asc升序 desc降序
      });
      const dataTemp = [] as any[];
      data.list.forEach((item) => {
        // 为适配MenuSelectModel组件，数据格式要转换一下
        dataTemp.push({
          name: item.path, // 实际上是路由名称name,不是path
          title: item.name, // 菜单中文名
          alternateField1: item.alternateField1, // 备用字段1，存的是icon图标名称
          chineseTitle: item.name, // 菜单中文名
          meta: {
            title: item.name, // 菜单中文名
            icon: item.alternateField1, // 备用字段1，存的是icon图标名称
          },
        });
      });
      quickAccessDataList.value = dataTemp;
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
   * @description 菜单对话框提交触发
   * @param chosenMenuList
   */
  const submitMenuSelectModal = async (chosenMenuList: any) => {
    const userStore = useUserStore();
    const reqdata = [] as QuickAccessRecord[];
    let index = 1;
    chosenMenuList.forEach((item: any) => {
      const req = {
        name: item.meta.title ? item.meta.title : item.name, // 菜单中文名称
        path: item.name, // 路由名称
        personCode: userStore.userCode, // 人员工号
        weight: String(index), // 权重
      } as QuickAccessRecord;
      if (item.meta.icon) {
        req.alternateField1 = item.meta.icon; // 备用字段1，存了icon名称
      }
      reqdata.push(req);
      index += 1;
    });
    try {
      const res = (await updateQuickAccessRecord(reqdata)) as any;
      if (res.code === 200) {
        Notification.success({
          content: '操作成功！',
        });
      } else {
        Notification.error({
          title: '操作失败！',
          content: res.message,
        });
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
        duration: 20000,
      });
    } finally {
      getQuickAccessList(); // 更新一下快捷入口细腻
    }
  };
  /**
   * @description 跳转菜单
   */
  const toMenu = (item: any) => {
    router.push({ name: item.name });
  };
  /**
   * onMounted
   */
  onMounted(() => {
    getQuickAccessList();
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
