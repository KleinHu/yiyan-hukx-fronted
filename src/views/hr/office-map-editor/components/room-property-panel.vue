<template>
  <div class="room-property-panel">
    <a-card title="房间属性" :bordered="false">
      <a-form :model="formData" layout="vertical">
        <a-form-item label="房间名称">
          <a-input v-model="formData.roomName" @change="handleUpdate" />
        </a-form-item>

        <a-form-item label="房间编号">
          <a-input v-model="formData.roomNumber" @change="handleUpdate" />
        </a-form-item>

        <a-form-item label="房间类型">
          <a-select v-model="formData.roomType" @change="handleUpdate">
            <a-option :value="RoomType.OFFICE">办公室</a-option>
            <a-option :value="RoomType.MEETING_ROOM">会议室</a-option>
            <a-option :value="RoomType.BREAK_ROOM">休息室</a-option>
            <a-option :value="RoomType.STORAGE">储藏室</a-option>
            <a-option :value="RoomType.BATHROOM">卫生间</a-option>
            <a-option :value="RoomType.CORRIDOR">走廊</a-option>
          </a-select>
        </a-form-item>

        <a-divider />

        <a-form-item label="X坐标">
          <a-input-number
            v-model="formData.x"
            :min="0"
            style="width: 100%"
            @change="handleUpdate"
          />
        </a-form-item>

        <a-form-item label="Y坐标">
          <a-input-number
            v-model="formData.y"
            :min="0"
            style="width: 100%"
            @change="handleUpdate"
          />
        </a-form-item>

        <a-form-item label="宽度">
          <a-input-number
            v-model="formData.width"
            :min="100"
            style="width: 100%"
            @change="handleUpdate"
          />
        </a-form-item>

        <a-form-item label="高度">
          <a-input-number
            v-model="formData.height"
            :min="100"
            style="width: 100%"
            @change="handleUpdate"
          />
        </a-form-item>

        <a-divider />

        <a-form-item label="工位信息">
          <div class="seat-info">
            <span>提示：工位将根据人员信息自动生成</span>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { OfficeRoom } from '@/api/hr/types';
  import { RoomType } from '@/api/hr/types';

  const props = defineProps<{
    room: OfficeRoom;
  }>();

  const emit = defineEmits<{
    (e: 'update', room: OfficeRoom): void;
  }>();

  const formData = ref<Partial<OfficeRoom>>({
    roomName: props.room.roomName,
    roomNumber: props.room.roomNumber,
    roomType: props.room.roomType,
    x: props.room.x,
    y: props.room.y,
    width: props.room.width,
    height: props.room.height,
  });

  watch(
    () => props.room,
    (newRoom) => {
      formData.value = {
        roomName: newRoom.roomName,
        roomNumber: newRoom.roomNumber,
        roomType: newRoom.roomType,
        x: newRoom.x,
        y: newRoom.y,
        width: newRoom.width,
        height: newRoom.height,
      };
    },
    { deep: true }
  );

  const handleUpdate = () => {
    const updatedRoom: OfficeRoom = {
      ...props.room,
      ...formData.value,
    };
    emit('update', updatedRoom);
  };
</script>

<style scoped lang="less">
  .room-property-panel {
    .seat-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
  }
</style>
