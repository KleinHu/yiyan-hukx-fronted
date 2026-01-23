<template>
  <a-drawer
    v-model:visible="visible"
    :width="800"
    :mask-closable="false"
    :footer="true"
    :ok-loading="saving"
    @cancel="handleCancel"
    @ok="handleSave"
    class="edit-config-drawer"
  >
    <template #title>
      <div class="drawer-title">
        <icon-settings class="title-icon" />
        <span>{{ localForm.id ? '编辑配置' : '新增配置' }}</span>
      </div>
    </template>

    <div class="drawer-content">
      <a-form
        ref="formRef"
        :model="localForm"
        :rules="formRules"
        layout="vertical"
      >
        <!-- 基础信息卡片 -->
        <a-card class="config-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <div class="title-bar"></div>
              <span>基础信息</span>
            </div>
          </template>
          <div class="card-content">
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item field="configKey" label="配置键" required>
                  <a-input
                    v-model="localForm.configKey"
                    placeholder="如：employee"
                    :disabled="!!localForm.id"
                  >
                    <template #prefix>
                      <icon-code />
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="configName" label="配置名称" required>
                  <a-input
                    v-model="localForm.configName"
                    placeholder="如：员工基础信息"
                  >
                    <template #prefix>
                      <icon-drive-file />
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item field="category" label="分类" required>
                  <a-select
                    v-model="localForm.category"
                    placeholder="选择分类"
                    allow-create
                  >
                    <template #prefix>
                      <icon-apps />
                    </template>
                    <a-option
                      v-for="cat in allCategories"
                      :key="cat"
                      :value="cat"
                    >
                      {{ cat }}
                    </a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item field="icon" label="图标">
                  <a-input v-model="localForm.icon" placeholder="如：icon-user">
                    <template #prefix>
                      <icon-face-smile-fill />
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item field="description" label="描述">
              <a-textarea
                v-model="localForm.description"
                placeholder="员工基本信息导入配置"
                :max-length="500"
                show-word-limit
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </a-form-item>
          </div>
        </a-card>

        <!-- 导入API地址卡片 -->
        <a-card class="config-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <div class="title-bar"></div>
              <span>导入设置</span>
            </div>
          </template>
          <div class="card-content">
            <a-form-item field="apiUrl" label="导入API地址 *" required>
              <a-input
                v-model="localForm.apiUrl"
                placeholder="/api/240/hr/batch-import/xxx"
              >
                <template #prefix>
                  <icon-link class="input-icon" />
                </template>
                <template #suffix>
                  <icon-arrow-right class="suffix-icon" />
                </template>
              </a-input>
            </a-form-item>

            <!-- 模板文件 -->
            <a-form-item label="模板文件">
              <div class="template-file-container">
                <div
                  v-if="localForm.templateUrl || localForm.templateName"
                  class="template-file-display"
                >
                  <div class="template-file-info">
                    <icon-file class="template-icon" />
                    <div class="template-details">
                      <div class="template-name">
                        {{ localForm.templateName || '未命名模板.xlsx' }}
                      </div>
                      <div class="template-meta">XLSX, CSV max 10MB</div>
                    </div>
                  </div>
                  <a-button
                    type="outline"
                    :loading="uploading"
                    @click="handleUploadClick"
                    class="update-template-btn"
                  >
                    <template #icon>
                      <icon-upload />
                    </template>
                    更新模板
                  </a-button>
                </div>
                <div v-else class="template-file-empty">
                  <a-button
                    type="outline"
                    :loading="uploading"
                    @click="handleUploadClick"
                    class="upload-template-btn"
                  >
                    <template #icon>
                      <icon-upload />
                    </template>
                    上传模板文件
                  </a-button>
                </div>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".xlsx,.xls"
                  style="display: none"
                  @change="handleFileChange"
                />
              </div>
            </a-form-item>
          </div>
        </a-card>

        <!-- 字段映射配置卡片 -->
        <a-card class="config-card" :bordered="false">
          <template #title>
            <div class="card-title">
              <div class="title-bar"></div>
              <span>字段映射配置</span>
            </div>
          </template>
          <div class="card-content">
            <a-form-item label="预设映射 (Excel列名 → 字段名)">
              <mapping-editor v-model="mappingItems" />
            </a-form-item>

            <a-form-item label="必填字段">
              <a-select
                v-model="localForm.requiredFields"
                multiple
                allow-create
                placeholder="选择或输入必填字段"
              >
                <template #prefix>
                  <icon-check-square />
                </template>
                <a-option
                  v-for="field in availableFields"
                  :key="field"
                  :value="field"
                >
                  {{ field }}
                </a-option>
              </a-select>
            </a-form-item>

            <a-form-item label="字段说明">
              <description-editor
                v-model="descriptionItems"
                :available-fields="availableFields"
              />
            </a-form-item>

            <a-form-item label="值映射配置 (字段名 → 字典类型)">
              <value-mapping-editor
                v-model="valueMappingItems"
                :available-fields="availableFields"
              />
            </a-form-item>
          </div>
        </a-card>
      </a-form>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import { Message } from '@arco-design/web-vue';
  import type { ImportConfigVO } from '@/api/hr/import-config';
  import fileApi from '@/api/hr/file';
  import MappingEditor from './MappingEditor.vue';
  import DescriptionEditor from './DescriptionEditor.vue';
  import ValueMappingEditor from './ValueMappingEditor.vue';

  interface Props {
    modelValue: boolean;
    form: ImportConfigVO;
    allCategories: string[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'save', form: ImportConfigVO): void;
    (e: 'cancel'): void;
  }>();

  const formRef = ref<FormInstance>();
  const fileInputRef = ref<HTMLInputElement>();

  const visible = ref(props.modelValue);
  const mappingItems = ref<{ excelColumn: string; fieldName: string }[]>([]);
  const descriptionItems = ref<{ field: string; description: string }[]>([]);
  const valueMappingItems = ref<{ fieldName: string; dictType: string }[]>([]);
  const uploading = ref(false);
  const saving = ref(false);

  // 创建本地表单数据副本，避免直接修改 prop
  const localForm = ref<ImportConfigVO>({ ...props.form });

  const updateFormData = () => {
    // 更新本地表单数据
    localForm.value = { ...props.form };

    // 转换映射为数组
    mappingItems.value = Object.entries(props.form.presetMappings || {}).map(
      ([excelColumn, fieldName]) => ({ excelColumn, fieldName })
    );
    if (mappingItems.value.length === 0) {
      mappingItems.value = [{ excelColumn: '', fieldName: '' }];
    }

    // 转换说明为数组
    descriptionItems.value = Object.entries(
      props.form.fieldDescriptions || {}
    ).map(([field, description]) => ({ field, description }));

    // 转换值映射为数组
    valueMappingItems.value = Object.entries(
      props.form.valueMappings || {}
    ).map(([fieldName, dictType]) => ({ fieldName, dictType }));
    if (valueMappingItems.value.length === 0) {
      valueMappingItems.value = [{ fieldName: '', dictType: '' }];
    }
  };

  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val;
      if (val) {
        updateFormData();
      }
    },
    { immediate: true }
  );

  watch(
    () => props.form,
    () => {
      if (visible.value) {
        updateFormData();
      }
    },
    { deep: true }
  );

  watch(visible, (val) => {
    emit('update:modelValue', val);
  });

  const availableFields = computed(() => {
    return mappingItems.value
      .filter((item) => item.fieldName)
      .map((item) => item.fieldName);
  });

  const formRules = {
    configKey: [{ required: true, message: '请输入配置键' }],
    configName: [{ required: true, message: '请输入配置名称' }],
    category: [{ required: true, message: '请选择分类' }],
    apiUrl: [{ required: true, message: '请输入API地址' }],
  };

  const handleSave = async () => {
    try {
      const valid = await formRef.value?.validate();
      if (valid) return;

      saving.value = true;

      // 转换映射数组为对象
      const presetMappings: Record<string, string> = {};
      mappingItems.value.forEach((item) => {
        if (item.excelColumn && item.fieldName) {
          presetMappings[item.excelColumn] = item.fieldName;
        }
      });

      // 转换说明数组为对象
      const fieldDescriptions: Record<string, string> = {};
      descriptionItems.value.forEach((item) => {
        if (item.field && item.description) {
          fieldDescriptions[item.field] = item.description;
        }
      });

      // 转换值映射数组为对象
      const valueMappings: Record<string, string> = {};
      valueMappingItems.value.forEach((item) => {
        if (item.fieldName && item.dictType) {
          valueMappings[item.fieldName] = item.dictType;
        }
      });

      const formData = {
        ...localForm.value,
        presetMappings,
        fieldDescriptions,
        valueMappings,
      };

      emit('save', formData);
    } catch (error: any) {
      // 验证失败，不处理
    } finally {
      saving.value = false;
    }
  };

  const handleCancel = () => {
    visible.value = false;
    formRef.value?.resetFields();
    emit('cancel');
  };

  /**
   * 处理上传按钮点击事件
   */
  const handleUploadClick = () => {
    fileInputRef.value?.click();
  };

  /**
   * 处理文件选择变化事件
   * @param event 文件选择事件
   */
  const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) {
      return;
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls)$/i)
    ) {
      Message.error('请选择 Excel 文件（.xlsx 或 .xls）');
      target.value = '';
      return;
    }

    uploading.value = true;
    try {
      // 使用自定义的文件上传API
      const response = await fileApi.uploadFile(file, 'import-config-template');

      // 根据接口返回的数据结构更新模板下载地址
      // FileUploadResult 包含 url 字段
      if (response?.data) {
        const uploadResult = response.data;
        // 使用返回的 url 字段
        if (uploadResult.url) {
          localForm.value.templateUrl = uploadResult.url;
          // 更新模板文件名
          localForm.value.templateName = uploadResult.fileName || file.name;
          Message.success('模板文件上传成功');
        } else {
          Message.error('上传成功，但未获取到文件地址');
        }
      } else {
        Message.error('上传成功，但未获取到文件信息');
      }
    } catch (error: any) {
      console.error('文件上传失败:', error);
      Message.error(error?.message || '文件上传失败，请重试');
    } finally {
      uploading.value = false;
      // 清空文件选择，以便可以重复选择同一文件
      if (target) {
        target.value = '';
      }
    }
  };
</script>

<style scoped lang="less">
  .edit-config-drawer {
    :deep(.arco-drawer-header) {
      padding: 20px 24px;
      border-bottom: 1px solid #f2f3f5;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      .arco-drawer-title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }
    }

    :deep(.arco-drawer-body) {
      padding: 0;
      background: #f7f8fa;
    }

    :deep(.arco-drawer-footer) {
      padding: 16px 24px;
      border-top: 1px solid #f2f3f5;
      background: #fff;
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;

      .title-icon {
        font-size: 20px;
      }
    }

    .drawer-content {
      padding: 24px;
      height: 100%;
      overflow-y: auto;
      background-color: #f7f8fa;
    }

    .config-card {
      margin-bottom: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:last-child {
        margin-bottom: 0;
      }

      :deep(.arco-card-header) {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #f2f3f5;
      }

      :deep(.arco-card-body) {
        padding: 0;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;

        .title-bar {
          width: 4px;
          height: 20px;
          background: #165dff;
          border-radius: 2px;
        }
      }

      .card-content {
        padding: 24px;

        :deep(.arco-form-item) {
          margin-bottom: 24px;

          &:last-child {
            margin-bottom: 0;
          }

          .arco-form-item-label {
            font-weight: 500;
            font-size: 14px;
            color: #4e5969;
            padding-bottom: 8px;
          }
        }

        :deep(.arco-input-wrapper),
        :deep(.arco-select-view),
        :deep(.arco-textarea-wrapper) {
          background-color: #fff;
          border: 1px solid #e5e6eb;
          border-radius: 8px;
          transition: all 0.2s;

          &:hover {
            border-color: #c9cdd4;
          }

          &.arco-input-focus,
          &.arco-select-view-focus,
          &.arco-textarea-focus {
            border-color: #165dff;
            box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
          }
        }

        :deep(.arco-input-prefix) {
          color: #86909c;
          padding-right: 8px;
        }

        .input-icon {
          color: #86909c;
          font-size: 16px;
        }

        .suffix-icon {
          color: #c9cdd4;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;

          &:hover {
            color: #86909c;
          }
        }
      }
    }

    .template-file-container {
      .template-file-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background-color: #f7f8fa;
        border: 1px solid #e5e6eb;
        border-radius: 8px;
        transition: all 0.2s;

        &:hover {
          background-color: #f2f3f5;
          border-color: #c9cdd4;
        }

        .template-file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .template-icon {
            font-size: 40px;
            color: #00b42a;
            flex-shrink: 0;
          }

          .template-details {
            flex: 1;

            .template-name {
              font-size: 14px;
              font-weight: 500;
              color: #1d2129;
              margin-bottom: 4px;
              word-break: break-all;
            }

            .template-meta {
              font-size: 12px;
              color: #86909c;
            }
          }
        }

        .update-template-btn {
          margin-left: 16px;
        }
      }

      .template-file-empty {
        .upload-template-btn {
          width: 100%;
          border-style: dashed;
        }
      }
    }
  }
</style>
