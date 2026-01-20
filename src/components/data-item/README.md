# DataItem 数据项组件

一个通用的数据展示项组件，支持左侧彩色边框、标题、额外信息、主要内容、描述等多种内容展示方式。

## 功能特性

- ✅ 左侧彩色边框标识
- ✅ 灵活的标题和额外信息布局
- ✅ 支持插槽自定义内容
- ✅ 支持 HTML 内容渲染
- ✅ 内置 hover 动画效果
- ✅ 支持点击事件
- ✅ TypeScript 类型支持

## 基础用法

```vue
<template>
  <DataItem
    border-color="#722ed1"
    title="标题"
    extra="额外信息"
    description="描述内容"
  />
</template>

<script setup lang="ts">
  import DataItem from '@/components/data-item/index.vue';
</script>
```

## Props

| 参数        | 说明                  | 类型      | 默认值      | 必填 |
| ----------- | --------------------- | --------- | ----------- | ---- |
| borderColor | 左侧边框颜色          | `string`  | `'#e5e6eb'` | 否   |
| title       | 标题文本              | `string`  | -           | 否   |
| extra       | 右侧额外信息文本      | `string`  | -           | 否   |
| main        | 主要内容文本          | `string`  | -           | 否   |
| description | 描述内容（支持 HTML） | `string`  | -           | 否   |
| clickable   | 是否可点击            | `boolean` | `false`     | 否   |

## Events

| 事件名 | 说明                                     | 回调参数                      |
| ------ | ---------------------------------------- | ----------------------------- |
| click  | 点击事件（需设置 `clickable` 为 `true`） | `(event: MouseEvent) => void` |

## Slots

| 插槽名      | 说明                         | 作用域 |
| ----------- | ---------------------------- | ------ |
| title       | 自定义标题内容               | -      |
| extra       | 自定义右侧额外信息           | -      |
| main        | 自定义主要内容               | -      |
| description | 自定义描述内容               | -      |
| default     | 默认插槽，用于完全自定义内容 | -      |

## 使用示例

### 基础示例

```vue
<template>
  <DataItem
    border-color="#722ed1"
    title="紧急联系人"
    extra="父亲"
    description="电话：13800138000"
  />
</template>
```

### 使用插槽自定义内容

```vue
<template>
  <DataItem border-color="#f53f3f" title="2024年度">
    <template #extra>
      <a-tag color="green">A+</a-tag>
    </template>
    <template #description>
      分数：<span class="highlight">92.5</span>
      <a-divider direction="vertical" />
      <span>参考</span>
    </template>
  </DataItem>
</template>
```

### 使用 extra 插槽自定义额外信息

`extra` 插槽支持完全自定义内容，可以放置标签、图标、按钮等任意内容：

```vue
<template>
  <!-- 使用标签 -->
  <DataItem border-color="#722ed1" title="紧急联系人">
    <template #extra>
      <a-tag size="small" color="blue">父亲</a-tag>
    </template>
  </DataItem>

  <!-- 使用图标和文字 -->
  <DataItem border-color="#00b42a" title="教育背景">
    <template #extra>
      <icon-calendar style="margin-right: 4px" />
      <span>2021 毕业</span>
    </template>
  </DataItem>

  <!-- 使用多个标签 -->
  <DataItem border-color="#ff7d00" title="技能证书">
    <template #extra>
      <a-tag size="small" color="orange">高级</a-tag>
      <a-tag size="small" color="green">已认证</a-tag>
    </template>
  </DataItem>

  <!-- 使用按钮 -->
  <DataItem border-color="#3491fa" title="待办事项">
    <template #extra>
      <a-button type="text" size="mini">查看详情</a-button>
    </template>
  </DataItem>
</template>
```

### 绩效记录示例

```vue
<template>
  <DataItem
    v-for="item in performanceList"
    :key="item.year"
    border-color="#f53f3f"
    :title="`${item.year}年度`"
  >
    <template #extra>
      <a-tag size="small" :color="getRatingColor(item.performanceRating)">
        {{ item.performanceRating || '-' }}
      </a-tag>
    </template>
    <template #description>
      分数：<span class="highlight">{{ item.score || '-' }}</span>
      <a-divider direction="vertical" />
      <span>{{ item.isExempt ? '免考' : '参考' }}</span>
    </template>
  </DataItem>
</template>
```

### 紧急联系人示例

```vue
<template>
  <DataItem
    v-for="(item, index) in contactList"
    :key="index"
    border-color="#722ed1"
    :title="item.contactName"
    :extra="item.relationship"
  >
    <template #description>
      <icon-phone style="margin-right: 4px" />
      <span class="highlight">{{ item.phone }}</span>
    </template>
  </DataItem>
</template>
```

### 教育背景示例

```vue
<template>
  <DataItem
    v-for="(item, index) in educationList"
    :key="index"
    border-color="#00b42a"
    :main="item.major || '-'"
    :extra="`${item.endYear} 毕业`"
  >
    <template #title>
      <a-tag size="small" color="green">
        {{ getDegreeName(item.degree) }}
      </a-tag>
    </template>
  </DataItem>
</template>
```

### 带点击事件

```vue
<template>
  <DataItem
    border-color="#3491fa"
    title="可点击项"
    description="点击查看详情"
    :clickable="true"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
  const handleClick = (event: MouseEvent) => {
    console.log('点击了数据项', event);
  };
</script>
```

### 完全自定义内容

```vue
<template>
  <DataItem border-color="#ff7d00">
    <template #title>
      <a-row :gutter="16">
        <a-col :span="12">
          <span class="item-label">岗位师傅：</span>
          <span class="item-title">张师傅</span>
        </a-col>
        <a-col :span="12">
          <span class="item-label">指导师傅：</span>
          <span class="item-title">李师傅</span>
        </a-col>
      </a-row>
    </template>
    <template #description>
      <div style="margin-bottom: 6px">
        <span class="item-label">授课内容：</span>
        <a-space wrap size="mini">
          <a-tag size="small" color="arcoblue">设备操作</a-tag>
          <a-tag size="small" color="arcoblue">安全规范</a-tag>
        </a-space>
      </div>
      <div class="item-time">2020/3/15 ~ 2021/3/15</div>
    </template>
  </DataItem>
</template>
```

## 样式定制

组件内置了以下 CSS 类，可以通过深度选择器进行样式覆盖：

```vue
<style scoped lang="less">
  // 覆盖数据项样式
  :deep(.data-item) {
    padding: 16px 20px; // 自定义内边距
    border-radius: 10px; // 自定义圆角
  }

  // 覆盖标题样式
  :deep(.item-title) {
    font-size: 16px; // 自定义字体大小
    color: #000; // 自定义颜色
  }

  // 覆盖高亮文本样式
  :deep(.item-sub .highlight) {
    color: #ff4d4f; // 自定义高亮颜色
  }
</style>
```

## 常用边框颜色

| 颜色 | 色值      | 适用场景             |
| ---- | --------- | -------------------- |
| 紫色 | `#722ed1` | 紧急联系人、岗位师傅 |
| 红色 | `#f53f3f` | 绩效记录、荣誉情况   |
| 绿色 | `#00b42a` | 教育背景、授课认证   |
| 橙色 | `#ff7d00` | 技能证书、二级教育   |
| 蓝色 | `#3491fa` | 授课认定、职级历史   |

## 注意事项

1. 使用 `description` prop 时，内容会通过 `v-html` 渲染，请确保内容安全
2. 当使用插槽时，对应的 prop 会被忽略
3. `clickable` 为 `false` 时，点击事件不会触发
4. 组件会自动根据是否有 `extra` 或 `#extra` 插槽来调整标题列的宽度

## 完整示例

```vue
<template>
  <div class="data-list">
    <!-- 基础用法 -->
    <DataItem
      border-color="#722ed1"
      title="基础示例"
      extra="右侧信息"
      description="这是描述内容"
    />

    <!-- 使用插槽 -->
    <DataItem border-color="#f53f3f" title="插槽示例">
      <template #extra>
        <a-tag color="green">标签</a-tag>
      </template>
      <template #description>
        分数：<span class="highlight">92.5</span>
      </template>
    </DataItem>

    <!-- 可点击 -->
    <DataItem
      border-color="#3491fa"
      title="可点击项"
      :clickable="true"
      @click="handleItemClick"
    />
  </div>
</template>

<script setup lang="ts">
  import DataItem from '@/components/data-item/index.vue';

  const handleItemClick = (event: MouseEvent) => {
    console.log('点击了数据项', event);
  };
</script>

<style scoped lang="less">
  .data-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
```
