<!-- 流程明细：展示表单 -->
<template>
  <div>
    <!--按钮组-->
    <div class="actions">
      <a-space>
        <a-button type="primary" :loading="loadingStart" @click="startProcess">
          启动流程
        </a-button>
        <a-button type="outline" :loading="loadingSave" @click="saveDraft">
          保存
        </a-button>

        <!-- <a-button type="outline" @click="formPrint()">
          <template #icon>
            <icon-printer />
          </template>
          打印
        </a-button> -->
        <ModalBpmImage :def-id="defId" />
        <a-button type="outline" @click="close()"> 关闭 </a-button>
      </a-space>
    </div>

    <!--表单（外部表单）-->
    <div class="instance-container">
      <FormFrame
        ref="frameRef"
        :form-id="formId"
        :def-id="defId"
        :inst-id="instId"
      />
    </div>

    <ModalStartConfirm
      v-model:visible="startConfirmVisible"
      :def-key="defKey"
      :inst-id="instId"
      :form-secret-level="formSecretLevel"
      @submit="confirmStart"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    BpmDefConfigRecord,
    BpmStartNodeOption,
  } from '@/api/bpm/model/bpmDefineModel';
  import {
    getProcessonfigByDefKey,
    getInfoByDefKeyInstId,
    saveBpmInstDraft,
    startBpmProcess,
  } from '@/api/bpm/bpm-instance';
  import ModalBpmImage from '@/components/bpm/modal-bpm-image.vue';
  import FormFrame from '@/components/bpm/form-frame.vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { reloadDraft, loadDetail } from '@/utils/bpm/bpm-util';
  import ModalStartConfirm from './components/modal-start-confirm.vue';

  const router = useRouter();
  const defineKey = computed(() => {
    const { defKey } = unref(router.currentRoute).query;
    return (defKey as string) || undefined;
  });
  const instanceId = computed(() => {
    const { query } = unref(router.currentRoute);
    return (query.instId as string) || undefined;
  });
  const defKey = ref('');
  const defId = ref('');
  const instId = ref('');
  const startNodeOptions = ref<BpmStartNodeOption[]>([]);

  const loadingSave = ref(false);
  const loadingStart = ref(false);

  // 记录展示在frame中的表单id
  const formId = ref();
  // 加载流程表单的详情
  const loadForm = async (config: BpmDefConfigRecord) => {
    let id;
    if (config.startForm.formpc && config.startForm.formpc[0]) {
      id = config.startForm.formpc[0].id;
    } else if (config.globalForm.formpc && config.globalForm.formpc[0]) {
      id = config.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  // 发起流程上时是否需要额外操作
  const hasActions = ref(false);
  // 发起流程时需要确认
  const needsConfirm = ref(false);
  const allowSelectPath = ref(false);
  const checkActionBeforeStart = (config: BpmDefConfigRecord) => {
    const options = config.startNodeOptions;
    allowSelectPath.value = config.allowSelectPath;

    // startNodeOptions: 开始节点配置
    const fillOpinion = options.includes('fillOpinion');
    const assignFlowUsers = options.includes('assignFlowUsers');
    const startCalFlowusers = options.includes('startCalFlowusers');
    const relInsts = options.includes('relInsts');
    needsConfirm.value = options.includes('startConfirm');
    return (
      allowSelectPath.value ||
      fillOpinion ||
      assignFlowUsers ||
      startCalFlowusers ||
      relInsts
    );
  };
  const loadProcessConfig = async () => {
    try {
      defKey.value = defineKey.value as string;
      if (!defKey.value && instanceId.value) {
        // 打开一个草稿流程：先用实例id获取defkey再取得defId
        const { data } = await getInfoByDefKeyInstId({
          id: instanceId.value,
          type: 'openDoc',
        });
        defKey.value = data.defKey;
        instId.value = data.instId;
      }
      const { data } = await getProcessonfigByDefKey(defKey.value);
      defId.value = data.data.defId;
      startNodeOptions.value = data.data.startNodeOptions;
      hasActions.value = checkActionBeforeStart(data.data);

      // 根据流程信息查询表单
      loadForm(data.data);
    } finally {
      // empty
    }
  };
  const frameRef = ref();

  const doStartProcess = async (extra?: any) => {
    try {
      loadingStart.value = true;
      const jsonData = await frameRef.value.getData();
      const formJson = JSON.stringify(jsonData);
      const { data } = await startBpmProcess({
        formJson,
        checkType: 'AGREE',
        defId: defId.value,
        instId: instId.value,
        systemHand: false,
        ...extra,
      });
      // 重新加载至详情页
      loadDetail(data.data.instId);
    } finally {
      loadingStart.value = false;
    }
  };

  const startConfirmVisible = ref(false);
  const formSecretLevel = ref(0);

  const startProcess = async () => {
    try {
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else if (hasActions.value) {
        // 有额外操作需要填写后启动流程，打开对话框
        startConfirmVisible.value = true;
        const jsonData = await frameRef.value.getData();
        formSecretLevel.value = jsonData.secretLevel;
      } else if (needsConfirm.value) {
        // 没有额外操作需要执行，只用弹出提示框
        Modal.warning({
          title: '警告',
          content: '确认启动流程吗？',
          hideCancel: false,
          onOk: () => doStartProcess(),
        });
      } else {
        doStartProcess();
      }
    } finally {
      // empty
    }
  };
  const confirmStart = (req: any) => {
    doStartProcess(req);
  };
  const saveDraft = async () => {
    try {
      loadingSave.value = true;
      // 正确的返回值为{ success: true, msg: '' }
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else {
        const jsonData = await frameRef.value.getData();
        const formJson = JSON.stringify(jsonData);
        const { data } = await saveBpmInstDraft({
          formJson,
          defId: defId.value,
          systemHand: false,
        });
        // 用保存后得到的实例id重新加载页面
        reloadDraft(data.data.instId);
      }
    } finally {
      loadingSave.value = false;
    }
  };
  // const formPrint = () => {
  //   // empty
  // };
  const close = () => {
    window.close();
  };

  loadProcessConfig();
</script>

<style scoped lang="less">
  .actions {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 60px;
    padding: 14px 20px 14px 0;
    text-align: right;
    background: var(--color-bg-2);
  }

  .instance-container {
    position: relative;
    box-sizing: border-box;
    width: 1301px;
    min-height: 100%;
    margin: 60px auto 0;
    padding: 0 10px;
    background: #fff;
    border: solid 1px #dadde0;
  }
</style>
