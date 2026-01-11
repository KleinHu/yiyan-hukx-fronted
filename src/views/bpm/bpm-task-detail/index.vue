<!-- 流程明细：展示表单 -->
<template>
  <div>
    <!--按钮组-->
    <div class="actions">
      <a-space>
        <a-button
          type="primary"
          :disabled="!allowApprove || loadingBtn"
          @click="approve"
        >
          审批
        </a-button>
        <a-button
          type="outline"
          :disabled="loadingBtn"
          :loading="loadingSave"
          @click="saveData"
        >
          保存
        </a-button>
        <a-button
          v-if="candicate != -1 && !isTransferRoam"
          :disabled="loadingBtn"
          type="outline"
          @click="lockTask()"
        >
          {{ lockStatus }}
        </a-button>
        <a-button type="outline" @click="trackInst">
          <template #icon>
            <icon-star-fill v-if="tracked === '1'" />
            <icon-star v-else />
          </template>
          {{ trackText }}
        </a-button>

        <!-- 加签 -->
        <ModalAddSign
          v-if="canAddAsign && !isTransferRoam"
          :task-id="bpmTaskId"
          :disabled="loadingBtn"
          :form-secret-level="formSecretLevel"
        />

        <!-- 驳回 -->
        <a-button
          v-if="canRefuse && !isTransferRoam"
          :disabled="loadingBtn"
          type="outline"
          :form-secret-level="formSecretLevel"
          @click="openRejectModal"
        >
          驳回
        </a-button>

        <!-- 转办 -->
        <ModalTaskTransfer
          v-if="canTransfer && !loadingBtn"
          :task-id="bpmTaskId"
          :subject="bpmTask?.subject"
          :form-secret-level="formSecretLevel"
          @after-submit="loadDetail(bpmInst?.instId || '')"
        />

        <!--流转-->
        <ModalTaskRoam
          v-if="!isCanRoamTransfer && !loadingBtn"
          :task-id="bpmTaskId"
          :subject="bpmTask?.subject"
          :form-secret-level="formSecretLevel"
          @after-submit="loadTaskDetail"
        />
        <a-button
          v-if="isCanRoamTransfer && !loadingBtn"
          type="outline"
          @click="cancelRoamTransfer"
        >
          取消流转
        </a-button>
        <ModalTaskRoamList
          v-if="isCanRoamTransfer && !loadingBtn"
          :task-id="bpmTaskId"
        />

        <a-button :disabled="loadingBtn" type="outline" @click="openCancel">
          作废
        </a-button>
        <DrawerCheckHistory :inst-id="bpmInst?.instId || ''" />
        <ModalBpmImage :inst-id="bpmInst?.instId" />
        <a-button type="outline" @click="close()"> 关闭 </a-button>
      </a-space>
    </div>

    <!--表单（外部表单）-->
    <div class="instance-container">
      <InstanceTitle :instance="bpmInst" />
      <InstanceStatus :status="instStatus" class="instance-status" />
      <FormFrame
        ref="frameRef"
        :form-id="formId"
        :def-id="bpmInst?.defId"
        :inst-id="bpmInst?.instId"
        :node-id="bpmTask?.key"
        @load="handleLoad"
      />
    </div>

    <!--对话框：审批-->
    <ModalTaskApprove
      v-if="allowApprove"
      v-model:visible="visibleApprove"
      :allow-select-executor="allowSelectExecutor"
      :allow-select-group="allowSelectGroup"
      :opinion-obj="bpmTaskId"
      :system-hand="false"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
      :show-more-options="approveShowMoreOptions"
      :form-json="currentFormJson"
      :form-secret-level="formSecretLevel"
      :submitting="loadingApprove"
      @submit="approveData"
    />

    <!--对话框：审批（已流转）-->
    <ModalTaskApproveTransfer
      v-model:visible="visibleApproveTransfer"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
    />

    <!--对话框：驳回-->
    <ModalTaskReject
      v-model:visible="visibleReject"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
      :form-secret-level="formSecretLevel"
      @submit="rejectData"
    />

    <!--对话框：流程作废-->
    <ModalInstanceCancel
      v-model:visible="visibleCancel"
      :inst-id="bpmInst?.instId || ''"
      @after-submit="loadDetail(bpmInst?.instId || '')"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { BpmDefConfigRecord } from '@/api/bpm/model/bpmDefineModel';
  import {
    BpmTaskRecord,
    BpmTaskFormCompleteReq,
    BpmTaskConfigRecord,
  } from '@/api/bpm/model/bpmTaskModel';
  import {
    getBpmTaskDetail,
    updateBpmTaskLocked,
    cancelBpmTaskRoam,
    saveBpmTrackForm,
    completeTask,
  } from '@/api/bpm/bpm-task';
  import { trackBpmInst } from '@/api/bpm/bpm-track';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { loadDetail } from '@/utils/bpm/bpm-util';
  import DrawerCheckHistory from '@/components/bpm/drawer-check-history.vue';
  import ModalBpmImage from '@/components/bpm/modal-bpm-image.vue';
  import InstanceTitle from '@/components/bpm/instance-title.vue';
  import InstanceStatus from '@/components/bpm/instance-status.vue';
  import FormFrame from '@/components/bpm/form-frame.vue';
  import ModalTaskTransfer from './components/modal-task-transfer.vue';
  import ModalAddSign from './components/modal-add-sign.vue';
  import ModalTaskRoam from './components/modal-task-roam.vue';
  import ModalTaskRoamList from './components/modal-task-roam-list.vue';
  import ModalTaskReject from './components/modal-task-reject.vue';
  import ModalTaskApprove from './components/modal-task-approve.vue';
  import ModalTaskApproveTransfer from './components/modal-task-approve-transfer.vue';
  import ModalInstanceCancel from './components/modal-instance-cancel.vue';

  defineProps({
    backNodeId: {
      // 在流程明细中进行回退时指定的目标节点
      type: String,
    },
    allowTransfer: {
      type: Boolean,
      default: false,
    },
    allowTransReply: {
      type: Boolean,
      default: false,
    },
  });

  const router = useRouter();
  const bpmTaskId = computed(() => {
    const { taskId } = unref(router.currentRoute).query;
    return (taskId as string) || '';
  });

  const allowApprove = ref(false);
  const isTransferRoam = ref(false);
  const isCanRoamTransfer = ref(false);
  const canTransfer = ref(false);
  const canAddAsign = ref(false);
  const canRefuse = ref(false);
  const allowSelectExecutor = ref(false);
  const allowSelectGroup = ref(false);
  const bpmTask = ref<BpmTaskRecord>();
  const bpmInst = ref<BpmInstRecord>();
  const instStatus = ref('');

  const tracked = ref('0');
  const taskConfig = ref<BpmTaskConfigRecord>();
  const trackText = computed(() => (tracked.value === '1' ? '已跟踪' : '跟踪'));
  const approveShowMoreOptions = ref(false);

  const lockStatus = computed(() => {
    if (bpmTask.value?.hasCandicate) {
      return bpmTask.value.assignee ? '释放任务' : '锁定任务';
    }
    return '';
  });
  const candicate = computed(() => {
    if (bpmTask.value?.hasCandicate) {
      return bpmTask.value.assignee ? 1 : 2;
    }
    return -1;
  });
  const quickApprove = computed(() => {
    return taskConfig.value?.switchOptions.includes('quickApprove');
  });

  // 记录展示在frame中的表单id
  const formId = ref();
  // 加载流程表单的详情
  const loadForm = async (processConfig: BpmDefConfigRecord) => {
    let id;
    if (taskConfig.value?.form.formpc && taskConfig.value.form.formpc[0]) {
      id = taskConfig.value.form.formpc[0].id;
    } else if (
      processConfig.globalForm.formpc &&
      processConfig.globalForm.formpc[0]
    ) {
      id = processConfig.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  const loadTaskDetail = async () => {
    try {
      const { data } = await getBpmTaskDetail(bpmTaskId.value);
      bpmTask.value = data.data.bpmTask;
      bpmInst.value = data.data.bpmInst;
      instStatus.value = data.data.bpmInst.status;
      allowApprove.value = data.data.allowApprove.success;
      tracked.value = data.data.tracked;
      isTransferRoam.value = data.data.isTransferRoam;
      isCanRoamTransfer.value = data.data.isCanRoamTransfer;
      canTransfer.value = data.data.canTransfer;
      canAddAsign.value = data.data.canAddSign;
      canRefuse.value = data.data.isCanBack;
      taskConfig.value = data.data.taskConfig;
      allowSelectExecutor.value = data.data.taskConfig.switchOptions.includes(
        'allowSelectExecutor'
      );
      allowSelectGroup.value =
        data.data.taskConfig.switchOptions.includes('allowSelectGroup');
      approveShowMoreOptions.value = showMoreOptions(data.data.processConfig);
      // 根据流程信息查询表单
      loadForm(data.data.processConfig);
    } finally {
      // empty
    }
  };

  // 更多选项
  const showMoreOptions = (processConfig?: BpmDefConfigRecord) => {
    if (taskConfig.value?.switchOptions.includes('showMoreOptions')) {
      return true;
    }
    return !!processConfig?.switchOptions?.includes('showMoreOptions');
  };

  const loadingSave = ref(false);

  const visibleReject = ref(false);
  const visibleApprove = ref(false);
  const visibleApproveTransfer = ref(false);

  // 打开审批对话框的时候加载表单数据一起传入，用于查询受表单值影响的后续节点审批人信息
  const currentFormJson = ref('{}');
  const formSecretLevel = ref(0);

  const setSecretLevel = async () => {
    const jsonData = await frameRef.value.getData();
    formSecretLevel.value = jsonData.secretLevel
      ? Number(jsonData.secretLevel)
      : 0;
  };

  // 快速审批
  const doQuickApprove = async () => {
    const cmd = {
      taskId: bpmTaskId.value,
      checkType: 'AGREE',
      opinion: '',
      systemHand: true,
    };
    await approveData(cmd);
  };
  const approve = async () => {
    const { success, msg } = await frameRef.value.valid();
    if (!success) {
      Message.error(msg);
    } else if (isCanRoamTransfer.value) {
      Message.error('当前任务正在流转，请取消流转后重试');
    } else if (quickApprove.value) {
      Modal.confirm({
        title: '流程审批',
        content: '确认审批流程吗？',
        onOk: () => doQuickApprove(),
      });
    } else {
      openApproveModal();
    }
  };
  const openApproveModal = async () => {
    // 校验通过才打开对话框
    const jsonData = await frameRef.value.getData();
    formSecretLevel.value = jsonData.secretLevel
      ? Number(jsonData.secretLevel)
      : 0;
    currentFormJson.value = JSON.stringify(jsonData);
    visibleApprove.value = true;
  };
  const openRejectModal = () => {
    visibleReject.value = true;
  };
  const doLock = async () => {
    try {
      const { data } = await updateBpmTaskLocked(bpmTaskId.value);
      Message.success(data.message);
    } finally {
      loadTaskDetail();
    }
  };
  const doCancelTransfer = async () => {
    try {
      const { data } = await cancelBpmTaskRoam(bpmTaskId.value);
      Message.success(data.message);
      window.location.reload();
    } finally {
      // loadTaskDetail();
    }
  };
  const trackInst = async () => {
    try {
      const { data } = await trackBpmInst(bpmInst.value?.instId || '');
      tracked.value = data.data;
      Message.success(data.message);
    } finally {
      // loadTaskDetail();
    }
  };

  const lockTask = () => {
    const content = candicate.value === 1 ? '释放任务吗' : '锁定任务吗';
    Modal.info({
      title: '提示',
      content,
      hideCancel: false,
      onOk: () => doLock(),
    });
  };
  const cancelRoamTransfer = () => {
    Modal.info({
      title: '提示',
      content: '确认取消流转任务吗？',
      hideCancel: false,
      onOk: () => doCancelTransfer(),
    });
  };
  // 作废
  const visibleCancel = ref(false);
  const openCancel = () => {
    visibleCancel.value = true;
  };

  const frameRef = ref();

  const saveData = async () => {
    try {
      loadingSave.value = true;
      // 正确的返回值为{ success: true, msg: '' }
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else {
        const jsonData = await frameRef.value.getData();
        const formJson = JSON.stringify(jsonData);
        const { data } = await saveBpmTrackForm({
          formJson,
          taskId: bpmTaskId.value,
          systemHand: false,
        });
        Message.success(data.message);
        // 用保存后得到的实例id重新加载页面
        loadTaskDetail();
      }
    } finally {
      loadingSave.value = false;
    }
  };

  /**
   * @description 提交驳回信息。
   */
  const rejectData = async (cmd: BpmTaskFormCompleteReq) => {
    const jsonData = await frameRef.value.getData();
    const formJson = JSON.stringify(jsonData);
    try {
      const { data } = await completeTask({
        ...cmd,
        formJson,
        systemHand: false,
      });
      Message.success(data.message);
      if (bpmInst.value?.instId) {
        loadDetail(bpmInst.value?.instId);
      }
    } finally {
      visibleReject.value = false;
    }
  };

  const loadingApprove = ref(false);
  /**
   * @description 提交审批信息。
   */
  const approveData = async (cmd: BpmTaskFormCompleteReq) => {
    const jsonData = await frameRef.value.getData();
    const formJson = JSON.stringify(jsonData);
    cmd.formJson = formJson;
    try {
      loadingApprove.value = true;
      const { data } = await completeTask(cmd);
      Message.success(data.message);
      if (bpmInst.value?.instId) {
        loadDetail(bpmInst.value?.instId);
      }
    } finally {
      loadingApprove.value = false;
      visibleApprove.value = false;
    }
  };
  const close = () => {
    window.close();
  };

  const loadingBtn = ref(true);
  const handleLoad = () => {
    loadingBtn.value = false;
    setSecretLevel();
  };

  loadTaskDetail();
</script>

<style scoped lang="less">
  .actions {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 5;
    height: 60px;
    padding: 14px 20px 14px 0;
    text-align: right;
    background: var(--color-bg-2);
  }

  .frame-container {
    width: 100%;
    height: calc(100vh - 60px);
    margin-top: 60px;
  }

  .instance-container {
    position: relative;
    box-sizing: border-box;
    // width: 1301px;
    width: calc(100vw - 60px);
    min-height: 100%;
    margin: 60px auto 0;
    padding: 0 10px;
    background: #fff;
    border: solid 1px #dadde0;
  }

  .instance-status {
    position: absolute;
    top: 0;
    right: 10px;
    z-index: 2;
  }
</style>
