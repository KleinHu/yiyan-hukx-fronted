<template>
  <div class="hr-data-import">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <div class="header-icon-wrapper">
            <icon-cloud-download class="header-icon" />
          </div>
          <div class="title-text">
            <h1>人事数据批量导入</h1>
            <p class="subtitle">
              支持员工信息、档案记录、培训数据等多类型数据的批量导入。请先下载模板，填写后再上传。
            </p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ importTypeConfigs.length }}</span>
            <span class="stat-label">导入类型</span>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ categories.length }}</span>
            <span class="stat-label">数据分类</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入类型选择区域 -->
    <a-spin :loading="loading" style="width: 100%">
      <div class="import-categories">
        <div
          v-for="category in categories"
          :key="category"
          class="category-section"
        >
          <div class="category-header">
            <div
              class="category-bar"
              :style="{ backgroundColor: getCategoryColor(category) }"
            ></div>
            <span class="category-name">{{ category }}</span>
            <span class="category-count">{{
              getTypesByCategory(category).length
            }}</span>
          </div>
          <div class="import-type-grid">
            <div
              v-for="config in getTypesByCategory(category)"
              :key="config.key"
              class="import-type-card"
              :class="{ active: selectedType?.key === config.key }"
              @click="handleSelectType(config)"
            >
              <div class="card-icon" :style="getIconStyle(config.key)">
                <component :is="getIconComponent(config.icon)" />
              </div>
              <div class="card-content">
                <div class="card-title">{{ config.name }}</div>
                <div class="card-desc">{{ config.description }}</div>
              </div>
              <div class="card-arrow">
                <icon-right />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>

    <!-- 导入弹窗 -->
    <a-modal
      v-model:visible="importModalVisible"
      :title="`批量导入 - ${selectedType?.name || ''}`"
      :width="1100"
      :footer="false"
      :mask-closable="false"
      class="import-modal"
      @cancel="handleCloseModal"
    >
      <div class="import-modal-content">
        <!-- 字段说明区域 -->
        <div v-if="selectedType" class="field-help-section">
          <a-collapse :default-active-key="[]">
            <a-collapse-item key="help" header="📋 字段说明">
              <div class="field-help-content">
                <a-descriptions :column="2" bordered size="small">
                  <a-descriptions-item
                    v-for="(desc, field) in selectedType.fieldDescriptions"
                    :key="field"
                    :label="field"
                  >
                    {{ desc }}
                  </a-descriptions-item>
                </a-descriptions>
              </div>
            </a-collapse-item>
          </a-collapse>
        </div>

        <!-- Excel导入组件 -->
        <excel-import
          v-if="selectedType"
          ref="excelImportRef"
          :api-url="selectedType.apiUrl"
          :api-options="apiOptionsForType"
          :preset-mappings="selectedType.presetMappings"
          :required-fields="selectedType.requiredFields"
          :template-url="selectedType.templateUrl"
          :template-name="selectedType.templateName"
          :value-mappings="selectedType.valueMappings"
          :batch-size="100"
          :max-size="20"
          :enable-template="true"
          :custom-transform="createTransformFn(selectedType.key)"
          @success="handleImportSuccess"
          @error="handleImportError"
          @cancel="handleCloseModal"
        />
      </div>
    </a-modal>

    <!-- 导入说明 -->
    <div class="import-tips">
      <a-alert type="info" show-icon title="导入说明">
        <template #icon><icon-info-circle /></template>
        <ul class="tips-list">
          <li>
            请先导入<strong>基础数据</strong>（员工信息、部门信息），再导入其他关联数据
          </li>
          <li>Excel文件支持 .xlsx 和 .xls 格式，建议文件大小不超过 20MB</li>
          <li>导入时会自动进行数据校验，不符合要求的数据将被跳过并记录</li>
          <li>点击"字段说明"可查看各字段的格式要求</li>
        </ul>
      </a-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    IconUser,
    IconMindMapping,
    IconBook,
    IconBookmark,
    IconBarChart,
    IconTool,
    IconTrophy,
    IconPhone,
    IconUserAdd,
    IconEdit,
    IconFileAudio,
    IconVideoCamera,
    IconUserGroup,
    IconLayers,
    IconIdcard,
    IconRight,
    IconCloudDownload,
    IconInfoCircle,
  } from '@arco-design/web-vue/es/icon';
  import importConfigApi, { type ImportConfigVO } from '@/api/hr/import-config';
  import type { ImportTypeConfig } from '@/api/hr/batch-import';
  import ExcelImport from '@/components/excel-import/index.vue';

  // 图标映射
  const iconMap: Record<string, any> = {
    'icon-user': IconUser,
    'icon-mind-mapping': IconMindMapping,
    'icon-book': IconBook,
    'icon-bookmark': IconBookmark,
    'icon-bar-chart': IconBarChart,
    'icon-tool': IconTool,
    'icon-trophy': IconTrophy,
    'icon-phone': IconPhone,
    'icon-user-add': IconUserAdd,
    'icon-edit': IconEdit,
    'icon-file-audio': IconFileAudio,
    'icon-video-camera': IconVideoCamera,
    'icon-user-group': IconUserGroup,
    'icon-layers': IconLayers,
    'icon-idcard': IconIdcard,
  };

  // 导入类型配置
  const importTypeConfigs = ref<ImportTypeConfig[]>([]);
  const loading = ref(false);

  // 将 ImportConfigVO 转换为 ImportTypeConfig
  const convertToImportTypeConfig = (vo: ImportConfigVO): ImportTypeConfig => {
    return {
      key: vo.configKey,
      name: vo.configName,
      description: vo.description || '',
      category: vo.category,
      icon: vo.icon || 'icon-user',
      apiUrl: vo.apiUrl,
      templateUrl: vo.templateUrl,
      templateName: vo.templateName,
      presetMappings: vo.presetMappings || {},
      requiredFields: vo.requiredFields || [],
      fieldDescriptions: vo.fieldDescriptions || {},
      valueMappings: vo.valueMappings,
    };
  };

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || IconUser;
  };

  // 加载配置数据
  const loadConfigs = async () => {
    try {
      loading.value = true;
      const response = await importConfigApi.getEnabledConfigs();
      const configs = response.data || [];
      importTypeConfigs.value = configs
        .filter((config) => config.isEnabled)
        .map(convertToImportTypeConfig);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载导入配置失败:', error);
      Message.error('加载导入配置失败');
    } finally {
      loading.value = false;
    }
  };

  // 获取分类列表
  const categories = computed(() => {
    const categorySet = new Set(
      importTypeConfigs.value.map((config) => config.category)
    );
    return Array.from(categorySet);
  });

  // 获取分类下的导入类型
  const getTypesByCategory = (category: string) => {
    return importTypeConfigs.value.filter(
      (config) => config.category === category
    );
  };

  // 初始化加载
  onMounted(() => {
    loadConfigs();
  });

  // 获取分类颜色
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      基础数据: '#165DFF',
      档案数据: '#FF7D00',
      考核数据: '#00B42A',
      奖励数据: '#F53F3F',
      联系信息: '#722ED1',
      培训数据: '#168CFF',
      基础配置: '#86909C',
    };
    return colorMap[category] || '#165DFF';
  };

  // 获取图标样式
  const getIconStyle = (typeKey: string) => {
    const styleMap: Record<string, { bg: string; color: string }> = {
      employee: { bg: '#E8F3FF', color: '#165DFF' },
      department: { bg: '#F5E8FF', color: '#722ED1' },
      education: { bg: '#FFF7E8', color: '#FF7D00' },
      position: { bg: '#FFF2F0', color: '#F53F3F' },
      performance: { bg: '#E8FFEA', color: '#00B42A' },
      skillCertification: { bg: '#E8FFF9', color: '#00B2B2' },
      honor: { bg: '#FFF0F6', color: '#EB2F96' },
      emergencyContact: { bg: '#F5E8FF', color: '#722ED1' },
      teachingCertification: { bg: '#E8F3FF', color: '#165DFF' },
      teachingRecord: { bg: '#FFF7E8', color: '#FF7D00' },
      secondaryEducation: { bg: '#E8FFEA', color: '#00B42A' },
      internalTrainer: { bg: '#FFF2F0', color: '#F53F3F' },
      employeeMentor: { bg: '#F5E8FF', color: '#722ED1' },
      jobRank: { bg: '#E8F3FF', color: '#165DFF' },
      professionalTitle: { bg: '#FFF7E8', color: '#FF7D00' },
    };
    const style = styleMap[typeKey] || { bg: '#F2F3F5', color: '#4E5969' };
    return {
      backgroundColor: style.bg,
      color: style.color,
    };
  };

  // 选中的导入类型
  const selectedType = ref<ImportTypeConfig | null>(null);

  // 导入弹窗可见性
  const importModalVisible = ref(false);

  // Excel导入组件引用
  const excelImportRef = ref<InstanceType<typeof ExcelImport>>();

  // 为当前导入类型生成预设接口选项
  const apiOptionsForType = computed(() => {
    if (!selectedType.value) return [];
    return [
      {
        label: selectedType.value.name,
        value: selectedType.value.apiUrl,
      },
    ];
  });

  // 选择导入类型
  const handleSelectType = (config: ImportTypeConfig) => {
    selectedType.value = config;
    importModalVisible.value = true;
  };

  // 关闭导入弹窗
  const handleCloseModal = () => {
    importModalVisible.value = false;
    // 重置Excel导入组件
    excelImportRef.value?.reset();
  };

  // 创建数据转换函数
  const createTransformFn = (typeKey: string) => {
    return (data: any[]) => {
      return data.map((item) => {
        const transformed = { ...item };

        // 根据类型进行特殊转换
        switch (typeKey) {
          case 'employee':
            // 性别转换
            if (transformed.gender) {
              if (transformed.gender === '男') transformed.gender = 1;
              else if (transformed.gender === '女') transformed.gender = 2;
            }
            // 布尔值转换
            if (typeof transformed.isRepresentative === 'string') {
              transformed.isRepresentative =
                transformed.isRepresentative === 'true' ||
                transformed.isRepresentative === '1' ||
                transformed.isRepresentative === '是';
            }
            if (typeof transformed.isTeamLeader === 'string') {
              transformed.isTeamLeader =
                transformed.isTeamLeader === 'true' ||
                transformed.isTeamLeader === '1' ||
                transformed.isTeamLeader === '是';
            }
            break;

          case 'department':
            // 布尔值转换
            if (typeof transformed.isActive === 'string') {
              transformed.isActive =
                transformed.isActive === 'true' ||
                transformed.isActive === '1' ||
                transformed.isActive === '是';
            }
            break;

          case 'performance':
            // 布尔值转换
            if (typeof transformed.isExempt === 'string') {
              transformed.isExempt =
                transformed.isExempt === 'true' ||
                transformed.isExempt === '1' ||
                transformed.isExempt === '是';
            }
            break;

          case 'employeeMentor':
            // 授课内容转为数组
            if (
              transformed.teachingContents &&
              typeof transformed.teachingContents === 'string'
            ) {
              transformed.teachingContents = transformed.teachingContents
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s);
            }
            break;

          default:
            break;
        }

        return transformed;
      });
    };
  };

  // 导入成功
  const handleImportSuccess = (result: {
    total: number;
    uploaded: number;
    failed: number;
  }) => {
    if (result.failed === 0) {
      Message.success(
        `导入成功！共导入 ${result.uploaded} 条 ${selectedType.value?.name} 数据`
      );
    } else {
      Message.warning(
        `导入完成：成功 ${result.uploaded} 条，失败 ${result.failed} 条`
      );
    }
  };

  // 导入失败
  const handleImportError = (error: Error) => {
    Message.error(`导入失败：${error.message}`);
  };
</script>

<style scoped lang="less">
  .hr-data-import {
    min-height: calc(100vh - 60px);
    padding: 12px 20px;
    background-color: #f4f7f9;

    .page-breadcrumb {
      margin-bottom: 12px;
      padding-left: 4px;

      :deep(.arco-breadcrumb-item) {
        color: #86909c;
        &:last-child {
          color: #1d2129;
          font-weight: 500;
        }
      }
    }

    .page-header {
      background: white;
      border-radius: 12px;
      padding: 24px 32px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title-section {
        display: flex;
        align-items: center;
        gap: 16px;

        .header-icon-wrapper {
          width: 56px;
          height: 56px;
          background: #f2f3f5;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #165dff;
          font-size: 28px;
        }

        .title-text {
          h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 600;
            color: #1d2129;
          }

          .subtitle {
            margin: 4px 0 0;
            font-size: 13px;
            color: #86909c;
          }
        }
      }

      .header-stats {
        display: flex;
        align-items: center;
        gap: 32px;

        .divider {
          width: 1px;
          height: 40px;
          background: #f2f3f5;
        }

        .stat-item {
          text-align: center;
          min-width: 80px;

          .stat-value {
            display: block;
            font-size: 32px;
            font-weight: 700;
            color: #165dff;
            line-height: 1;
          }

          .stat-label {
            font-size: 13px;
            color: #86909c;
            margin-top: 8px;
            font-weight: 500;
          }
        }
      }
    }

    .import-categories {
      display: flex;
      flex-direction: column;
      gap: 32px;
      padding-top: 12px;

      .category-section {
        background: transparent;
        border-radius: 0;
        padding: 0;
        box-shadow: none;

        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 0;
          border-bottom: none;

          .category-bar {
            width: 4px;
            height: 18px;
            border-radius: 2px;
            background: #165dff;
          }

          .category-name {
            font-size: 16px;
            font-weight: 600;
            color: #1d2129;
          }

          .category-count {
            font-size: 12px;
            background: #f2f3f5;
            color: #86909c;
            padding: 1px 8px;
            border-radius: 10px;
            font-weight: normal;
          }
        }

        .import-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .import-type-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #f2f3f5;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

          &:hover {
            background: #fff;
            border-color: #165dff;
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(22, 93, 255, 0.08);

            .card-arrow {
              opacity: 1;
              transform: translateX(0);
            }
          }

          &.active {
            background: #e8f3ff;
            border-color: #165dff;
          }

          .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }

          .card-content {
            flex: 1;
            min-width: 0;

            .card-title {
              font-size: 15px;
              font-weight: 600;
              color: #1d2129;
              margin-bottom: 4px;
            }

            .card-desc {
              font-size: 12px;
              color: #86909c;
              line-height: 1.5;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          }

          .card-arrow {
            color: #165dff;
            opacity: 0;
            transform: translateX(-8px);
            transition: all 0.3s ease;
            flex-shrink: 0;
          }
        }
      }
    }

    .import-tips {
      margin-top: 20px;

      :deep(.arco-alert) {
        border-radius: 8px;
        background-color: #e8f3ff;
        border: 1px solid #bae0ff;
      }

      .tips-list {
        margin: 4px 0 0;
        padding-left: 18px;

        li {
          margin-bottom: 4px;
          color: #4e5969;
          font-size: 13px;

          &:last-child {
            margin-bottom: 0;
          }

          strong {
            color: #165dff;
          }
        }
      }
    }
  }

  // 导入弹窗样式
  .import-modal {
    :deep(.arco-modal) {
      border-radius: 12px;
    }

    .import-modal-content {
      .field-help-section {
        margin-bottom: 16px;

        :deep(.arco-collapse-item-header) {
          background: #f7f8fa;
          border-radius: 8px;
          border-bottom: none;
        }

        :deep(.arco-collapse-item-content) {
          background: white;
        }

        .field-help-content {
          max-height: 240px;
          overflow-y: auto;
          padding: 12px 0;
        }

        :deep(.arco-descriptions-item-label) {
          background-color: #f7f8fa;
          font-weight: 500;
          width: 120px;
        }
      }
    }
  }
</style>
