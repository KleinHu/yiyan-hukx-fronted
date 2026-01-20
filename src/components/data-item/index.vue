<template>
  <div
    class="data-item"
    :style="{ borderLeftColor: borderColor }"
    @click="handleClick"
  >
    <div class="data-item-content">
      <div class="data-item-main">
        <a-row
          v-if="title || $slots.title || $slots.extra || extra"
          justify="space-between"
          align="center"
        >
          <a-col :span="extra || $slots.extra ? 12 : 24" class="title-col">
            <slot name="title">
              <span v-if="title" class="item-title">{{ title }}</span>
            </slot>
          </a-col>
          <a-col v-if="extra || $slots.extra" :span="12" class="extra-col">
            <slot name="extra">
              <span v-if="extra" class="item-time">{{ extra }}</span>
            </slot>
          </a-col>
        </a-row>

        <div v-if="main || $slots.main" class="item-main">
          <slot name="main">
            <span v-if="main">{{ main }}</span>
          </slot>
        </div>

        <div v-if="description || $slots.description" class="item-sub">
          <slot name="description">
            <span v-if="description" v-html="description"></span>
          </slot>
        </div>

        <slot></slot>
      </div>

      <div v-if="$slots.action" class="data-item-action">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    /** 左侧边框颜色 */
    borderColor?: string;
    /** 标题 */
    title?: string;
    /** 右侧额外信息 */
    extra?: string;
    /** 主要内容 */
    main?: string;
    /** 描述内容（支持 HTML） */
    description?: string;
    /** 是否可点击 */
    clickable?: boolean;
  }

  interface Emits {
    (e: 'click', event: MouseEvent): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    borderColor: '#e5e6eb',
    clickable: false,
  });

  const emit = defineEmits<Emits>();

  const handleClick = (event: MouseEvent) => {
    if (props.clickable) {
      emit('click', event);
    }
  };
</script>

<style scoped lang="less">
  .data-item {
    padding: 12px 16px;
    background: #f7f8fa;
    border-radius: 8px;
    border-left: 3px solid;
    transition: all 0.2s;
    cursor: default;

    &:hover {
      background: #f2f3f5;
      transform: translateX(4px);
    }

    .data-item-content {
      display: flex;
      align-items: stretch;
      gap: 12px;
    }

    .data-item-main {
      flex: 1;
      min-width: 0;
      align-content: center;
    }

    .data-item-action {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
      padding-left: 16px;
      border-left: 1px solid #e5e6eb;
      align-self: stretch;

      :deep(.arco-space) {
        display: flex;
        align-items: center;
      }

      :deep(.arco-space-vertical) {
        align-items: center;
        justify-content: center;
      }
    }

    .title-col {
      display: flex;
      align-items: start;
      justify-content: flex-start;
    }

    .extra-col {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;

      // 支持自定义内容，如标签、图标等
      :deep(.arco-tag) {
        margin: 0;
      }

      :deep(.arco-icon) {
        font-size: 14px;
        color: #86909c;
      }
    }

    .item-time {
      font-size: 12px;
      color: #86909c;
    }

    .item-title {
      font-weight: 600;
      color: #1d2129;
      font-size: 14px;
    }

    .item-main {
      font-size: 14px;
      color: #4e5969;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .item-sub {
      font-size: 13px;
      color: #86909c;

      :deep(.highlight) {
        color: #165dff;
        font-weight: 600;
      }
    }
  }
</style>
