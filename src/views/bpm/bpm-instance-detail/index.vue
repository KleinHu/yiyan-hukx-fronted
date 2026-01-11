<!-- 流程明细：展示表单 -->
<template>
  <div>
    <!--按钮组-->
    <div class="actions">
      <a-space>
        <a-button v-if="canTrack" type="outline" @click="trackInst">
          <template #icon>
            <icon-star-fill v-if="tracked === '1'" />
            <icon-star v-else />
          </template>
          {{ trackText }}
        </a-button>
        <a-button v-if="allowTransfer" type="outline" @click="transferTo">
          转发
        </a-button>
        <a-button v-if="allowTransReply" type="outline" @click="transferReply">
          回复转发
        </a-button>
        <!--取回-->
        <ModalTakeBack
          v-if="canRevoke"
          :inst-id="bpmInst?.instId || ''"
          :subject="bpmInst?.subject"
          @after-submit="loadDetail"
        />

        <DrawerCheckHistory :inst-id="instanceId" />
        <ModalBpmImage :inst-id="instanceId" />
        <!-- <a-button v-if="bpmCommuBtnShow" @click="doCommuHistory()"
          >沟通情况</a-button
        >
        <a-button v-if="showMsgBtn" @click="showMsg()">
          <template #icon>
            <icon-message />
          </template>
          留言</a-button
        > -->
        <a-button type="outline" @click="close()"> 关闭 </a-button>
      </a-space>
    </div>

    <!--表单（外部表单）-->
    <div class="instance-container">
      <InstanceTitle :instance="bpmInst" />
      <InstanceStatus :status="bpmInst?.status" class="instance-status" />
      <FormFrame :form-id="formId" :def-id="defId" :inst-id="instanceId" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { BpmDefConfigRecord } from '@/api/bpm/model/bpmDefineModel';
  import { getBpmInstDetail } from '@/api/bpm/bpm-instance';
  import { trackBpmInst } from '@/api/bpm/bpm-track';
  import DrawerCheckHistory from '@/components/bpm/drawer-check-history.vue';
  import ModalBpmImage from '@/components/bpm/modal-bpm-image.vue';
  import FormFrame from '@/components/bpm/form-frame.vue';
  import InstanceTitle from '@/components/bpm/instance-title.vue';
  import InstanceStatus from '@/components/bpm/instance-status.vue';
  import ModalTakeBack from './components/modal-take-back.vue';

  const props = defineProps({
    allowTransfer: {
      type: Boolean,
      default: false,
    },
    allowTransReply: {
      type: Boolean,
      default: false,
    },
    from: {
      // 来自页面(mydone:我完成的审批,mystart:我发起的流程)
      type: String,
      default: '',
    },
  });

  const router = useRouter();
  const instanceId = computed(() => {
    const { instId } = unref(router.currentRoute).query;
    return (instId as string) || '';
  });
  const defId = ref();
  const tracked = ref('0');
  const canRevoke = ref(false);
  const bpmInst = ref<BpmInstRecord>();

  const trackText = computed(() => (tracked.value === '1' ? '已跟踪' : '跟踪'));
  const canTrack = computed(() => {
    return (
      bpmInst.value?.status === 'RUNNING' || bpmInst.value?.status === 'REVOKE'
    );
  });

  // 记录展示在frame中的表单id
  const formId = ref();
  // 加载流程表单的详情
  const loadForm = async (config: BpmDefConfigRecord) => {
    let id;
    if (config.detailForm.formpc && config.detailForm.formpc[0]) {
      id = config.startForm.formpc[0].id;
    } else if (config.globalForm.formpc && config.globalForm.formpc[0]) {
      id = config.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  const loadDetail = async () => {
    try {
      const { data } = await getBpmInstDetail({
        instId: instanceId.value,
        from: props.from,
      });
      bpmInst.value = data.bpmInst;
      tracked.value = data.tracked;
      canRevoke.value = data.canRevoke;
      defId.value = data.bpmInst.defId;
      // 根据流程定义查询其表单id
      loadForm(data.processConfig);
    } finally {
      // empty
    }
  };

  const trackInst = async () => {
    try {
      const { data } = await trackBpmInst(instanceId.value);
      tracked.value = data.data;
      Message.success(data.message);
    } finally {
      // loadDetail();
    }
  };
  const transferTo = () => {
    // empty
  };
  const transferReply = () => {
    // empty
  };
  const close = () => {
    window.close();
  };

  loadDetail();
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
