# IdPhoto 证件照裁剪组件

一个基于 Vue 3 + TypeScript + Arco Design 的证件照裁剪组件，支持图片上传、裁剪（3:4比例）、缩放、旋转和下载功能。

## 功能特性

- ✅ **图片上传**：支持点击或拖拽上传图片
- ✅ **智能裁剪**：固定3:4证件照比例裁剪
- ✅ **图片缩放**：支持1-3倍缩放调整
- ✅ **图片旋转**：支持0-360度旋转
- ✅ **实时预览**：裁剪过程中实时预览效果
- ✅ **图片下载**：裁剪完成后可下载为JPG格式
- ✅ **网格辅助线**：提供九宫格网格辅助对齐
- ✅ **响应式设计**：适配不同屏幕尺寸

## 安装使用

### 1. 按需导入（推荐）

组件采用按需导入的方式，需要在使用的页面中手动导入。

**导入路径：**
```typescript
import IdPhoto from '@/components/id-photo/index.vue';
```

**注意：** `@` 是项目配置的路径别名，指向 `src` 目录。如果您的项目路径别名不同，请相应调整导入路径。

### 2. 全局导入

如果您希望在整个项目中无需导入即可使用该组件，可以进行全局注册。

**步骤1：** 在 `src/components/index.ts` 中添加组件导入和注册：

```typescript
import { App } from 'vue';
import IdPhoto from './id-photo/index.vue';

export default {
  install(Vue: App) {
    // ... 其他组件注册
    Vue.component('IdPhoto', IdPhoto);
  },
};
```

**步骤2：** 全局注册后，在任意页面中可直接使用，无需导入：

```vue
<template>
  <div class="page-container">
    <IdPhoto />
  </div>
</template>

<script lang="ts" setup>
// 全局注册后无需导入，直接使用
</script>
```

**注意：** 全局注册会增加打包体积，如果只在少数页面使用，建议使用按需导入的方式。

### 3. 基本使用

```vue
<template>
  <div class="page-container">
    <IdPhoto />
  </div>
</template>

<script lang="ts" setup>
import IdPhoto from '@/components/id-photo/index.vue';
</script>
```

## 完整示例

### 示例1：基础使用

```vue
<template>
  <div class="id-photo-page">
    <a-page-header title="证件照制作" />
    <IdPhoto />
  </div>
</template>

<script lang="ts" setup>
import IdPhoto from '@/components/id-photo/index.vue';
</script>

<style scoped lang="less">
.id-photo-page {
  padding: 24px;
  background: #f7f8fa;
  min-height: 100vh;
}
</style>
```

### 示例2：在表单中使用

```vue
<template>
  <a-form :model="form" :rules="rules" ref="formRef">
    <a-form-item label="证件照" field="photo">
      <IdPhoto />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleSubmit">提交</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import IdPhoto from '@/components/id-photo/index.vue';

const formRef = ref();
const form = ref({
  photo: '',
});

const rules = {
  photo: [{ required: true, message: '请上传证件照' }],
};

const handleSubmit = async () => {
  const res = await formRef.value?.validate();
  if (!res) {
    Message.success('提交成功');
  }
};
</script>
```

### 示例3：自定义容器样式

```vue
<template>
  <div class="custom-container">
    <a-card title="制作证件照" :bordered="false">
      <IdPhoto />
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import IdPhoto from '@/components/id-photo/index.vue';
// 组件内部已包含Card，如需自定义可覆盖样式
</script>

<style scoped lang="less">
.custom-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}
</style>
```

## 使用流程

1. **上传图片**
   - 点击上传区域或"选择图片"按钮
   - 选择本地图片文件（支持常见图片格式）

2. **裁剪图片**
   - 图片加载后进入裁剪界面
   - 拖动图片调整位置
   - 使用缩放滑块调整图片大小（1-3倍）
   - 使用旋转滑块调整图片角度（0-360度）
   - 参考网格线将人脸对齐到合适位置

3. **完成裁剪**
   - 点击"完成"按钮确认裁剪
   - 查看裁剪后的预览效果

4. **下载图片**
   - 点击"下载"按钮保存图片到本地
   - 默认文件名为"证件照.jpg"

5. **重新开始**
   - 点击"重新开始"按钮返回上传界面
   - 可以重新选择图片进行裁剪

## 组件状态

组件内部包含三种状态：

- **UPLOAD**：上传状态，显示上传界面
- **CROP**：裁剪状态，显示裁剪工具
- **RESULT**：结果状态，显示裁剪后的图片和操作按钮

## 技术实现

### 核心功能

- **图片裁剪**：使用Canvas API进行图片裁剪和旋转处理
- **比例控制**：固定3:4比例，确保符合证件照标准
- **交互体验**：支持鼠标拖拽、滑块控制等交互方式

### 文件结构

```
id-photo/
├── index.vue              # 主组件
├── components/
│   └── Cropper.vue        # 裁剪子组件
├── utils/
│   └── canvasUtils.ts     # Canvas工具函数
├── types.ts               # TypeScript类型定义
└── README.md              # 使用文档
```

## 注意事项

1. **图片格式**：支持常见图片格式（JPG、PNG、GIF等）
2. **图片大小**：建议上传清晰度较高的图片，以获得更好的裁剪效果
3. **浏览器兼容**：需要支持Canvas API的现代浏览器
4. **下载功能**：下载功能依赖浏览器支持，部分浏览器可能需要用户授权

## 常见问题

### Q: 裁剪后的图片模糊怎么办？

A: 建议上传高分辨率的原图，裁剪时会保持原图质量。如果原图分辨率较低，裁剪后可能会显得模糊。

### Q: 可以自定义裁剪比例吗？

A: 当前版本固定为3:4比例，符合标准证件照要求。如需其他比例，需要修改组件源码。

### Q: 裁剪后的图片如何上传到服务器？

A: 组件目前只提供下载功能。如需上传到服务器，可以在下载前获取base64数据，然后通过API上传。

### Q: 支持批量处理吗？

A: 当前版本只支持单张图片处理。如需批量处理，可以多次使用组件或进行二次开发。

## 更新日志

### v1.0.0 (2024)

- ✨ 初始版本发布
- ✨ 支持图片上传、裁剪、缩放、旋转
- ✨ 支持图片下载
- ✨ 集成Arco Design组件库

## 许可证

内部项目使用
