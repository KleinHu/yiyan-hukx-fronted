<template>
  <a-modal
    v-model:visible="visible"
    title="添加房间"
    width="600px"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form
      :model="formData"
      :label-col-props="{ span: 6 }"
      layout="horizontal"
    >
      <a-form-item label="房间名称" field="roomName">
        <a-input v-model="formData.roomName" placeholder="请输入房间名称" />
      </a-form-item>

      <a-form-item label="房间编号" field="roomNumber">
        <a-input v-model="formData.roomNumber" placeholder="请输入房间编号" />
      </a-form-item>

      <a-form-item label="房间类型" field="roomType">
        <a-select v-model="formData.roomType" placeholder="请选择房间类型">
          <a-option :value="RoomType.OFFICE">办公室</a-option>
          <a-option :value="RoomType.MEETING_ROOM">会议室</a-option>
          <a-option :value="RoomType.BREAK_ROOM">休息室</a-option>
          <a-option :value="RoomType.STORAGE">储藏室</a-option>
          <a-option :value="RoomType.BATHROOM">卫生间</a-option>
          <a-option :value="RoomType.CORRIDOR">走廊</a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="X坐标" field="x">
        <a-input-number
          v-model="formData.x"
          :min="0"
          style="width: 100%"
          placeholder="X坐标"
        />
      </a-form-item>

      <a-form-item label="Y坐标" field="y">
        <a-input-number
          v-model="formData.y"
          :min="0"
          style="width: 100%"
          placeholder="Y坐标"
        />
      </a-form-item>

      <a-form-item label="宽度" field="width">
        <a-input-number
          v-model="formData.width"
          :min="100"
          style="width: 100%"
          placeholder="宽度（像素）"
        />
      </a-form-item>

      <a-form-item label="高度" field="height">
        <a-input-number
          v-model="formData.height"
          :min="100"
          style="width: 100%"
          placeholder="高度（像素）"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { OfficeRoom } from '@/api/hr/types';
  import { RoomType } from '@/api/hr/types';

  const props = defineProps<{
    modelValue: boolean;
    floor: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm', room: Omit<OfficeRoom, 'id'>): void;
  }>();

  const visible = ref(props.modelValue);

  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val;
      if (val) {
        resetForm();
      }
    }
  );

  watch(visible, (val) => {
    emit('update:modelValue', val);
  });

  const formData = ref<Partial<Omit<OfficeRoom, 'id'>>>({
    floorCode: props.floor,
    roomName: '',
    roomNumber: '',
    roomType: RoomType.OFFICE,
    x: 50,
    y: 50,
    width: 400,
    height: 200,
  });

  watch(
    () => props.floor,
    (newFloor) => {
      formData.value.floorCode = newFloor;
    }
  );

  const resetForm = () => {
    formData.value = {
      floorCode: props.floor,
      roomName: '',
      roomNumber: '',
      roomType: RoomType.OFFICE,
      x: 50,
      y: 50,
      width: 400,
      height: 200,
    };
  };

  const handleConfirm = () => {
    if (!formData.value.roomName) {
      Message.warning('请输入房间名称');
      return;
    }
    if (!formData.value.roomNumber) {
      Message.warning('请输入房间编号');
      return;
    }

    emit('confirm', formData.value as Omit<OfficeRoom, 'id'>);
    visible.value = false;
  };

  const handleCancel = () => {
    visible.value = false;
  };
</script>
