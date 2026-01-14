<template>
  <a-modal
    v-model:visible="modalVisible"
    :title="modalTitle"
    :width="600"
    :mask-closable="false"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <template #footer>
      <div v-if="mode === 'view'">
        <a-button @click="handleCancel">关闭</a-button>
        <a-button type="primary" @click="switchToEdit">编辑</a-button>
      </div>
      <div v-else>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ mode === 'add' ? '新增' : '保存' }}
        </a-button>
      </div>
    </template>

    <div class="department-modal-content">
      <!-- 部门信息表单 -->
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
        class="department-form"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="部门编码" field="deptCode">
              <a-input
                v-model="formData.deptCode"
                placeholder="请输入部门编码"
                :disabled="mode === 'view' || mode === 'edit'"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门名称" field="deptName">
              <a-input
                v-model="formData.deptName"
                placeholder="请输入部门名称"
                :disabled="mode === 'view'"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="上级部门" field="parentId">
              <a-tree-select
                v-model="formData.parentId"
                :data="departmentTreeData"
                placeholder="请选择上级部门"
                :disabled="mode === 'view'"
                allow-clear
                :field-names="{
                  key: 'deptId',
                  title: 'deptName',
                  children: 'children',
                }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="排序" field="sortOrder">
              <a-input-number
                v-model="formData.sortOrder"
                placeholder="请输入排序号"
                :disabled="mode === 'view'"
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="部门负责人" field="managerName">
              <a-input
                v-model="formData.managerName"
                placeholder="请输入负责人姓名"
                :disabled="mode === 'view'"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" field="status">
              <a-select
                v-model="formData.status"
                placeholder="请选择状态"
                :disabled="mode === 'view'"
              >
                <a-option :value="1">正常</a-option>
                <a-option :value="0">停用</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="部门描述" field="description">
          <a-textarea
            v-model="formData.description"
            placeholder="请输入部门描述"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            :disabled="mode === 'view'"
          />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import departmentApi from '@/api/hr/department';
  import type { Department, DepartmentTreeNode } from '@/api/hr/types';

  interface Props {
    visible: boolean;
    department?: Department | null;
    parentDepartment?: Department | null;
    mode: 'view' | 'add' | 'edit';
  }

  interface Emits {
    (e: 'update:visible', visible: boolean): void;
    (e: 'success'): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  // 响应式数据
  const formRef = ref<FormInstance>();
  const submitLoading = ref(false);
  const departmentTreeData = ref<DepartmentTreeNode[]>([]);

  // 表单数据
  const formData = reactive<Partial<Department>>({
    deptCode: '',
    deptName: '',
    parentId: '',
    managerId: undefined,
    managerName: '',
    description: '',
    sortOrder: 0,
    status: 1,
  });

  // 表单验证规则
  const formRules = {
    deptCode: [
      { required: true, message: '请输入部门编码' },
      { min: 2, max: 32, message: '部门编码长度为2-32个字符' },
    ],
    deptName: [
      { required: true, message: '请输入部门名称' },
      { min: 2, max: 128, message: '部门名称长度为2-128个字符' },
    ],
    sortOrder: [
      { required: true, message: '请输入排序号' },
      { type: 'number', min: 0, message: '排序号不能小于0' },
    ],
    status: [{ required: true, message: '请选择状态' }],
  };

  // 计算属性
  const modalVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });

  const modalTitle = computed(() => {
    const titles = {
      view: '部门详情',
      add: props.parentDepartment
        ? `新增子部门 - ${props.parentDepartment.deptName}`
        : '新增部门',
      edit: '编辑部门',
    };
    return titles[props.mode];
  });

  /**
   * 重置表单
   */
  const resetForm = () => {
    Object.assign(formData, {
      deptCode: '',
      deptName: '',
      parentId: props.parentDepartment?.deptId || '',
      managerId: undefined,
      managerName: '',
      description: '',
      sortOrder: 0,
      status: 1,
    });
  };

  /**
   * 监听部门数据变化，更新表单
   */
  watch(
    () => props.department,
    (newDepartment) => {
      if (newDepartment) {
        // 使用浅拷贝避免循环引用，仅复制顶层属性
        Object.keys(formData).forEach((key) => {
          const typedKey = key as keyof Partial<Department>;
          (formData as any)[typedKey] = (newDepartment as any)[typedKey];
        });
        // 确保必须字段有值
        if (formData.status === undefined) {
          formData.status = 1;
        }
      } else {
        resetForm();
      }
    },
    { immediate: true }
  );

  /**
   * 监听父部门变化
   */
  watch(
    () => props.parentDepartment,
    (parentDept) => {
      if (parentDept && props.mode === 'add') {
        formData.parentId = parentDept.deptId;
      }
    },
    { immediate: true }
  );

  /**
   * 监听弹窗显示状态
   */
  watch(modalVisible, (visible) => {
    if (visible) {
      getDepartmentTree();
      nextTick(() => {
        formRef.value?.clearValidate();
      });
    }
  });

  /**
   * 获取部门树数据
   */
  const getDepartmentTree = async () => {
    try {
      const response = await departmentApi.getDepartmentTree();
      if (response.code === 200) {
        // 添加根节点选项
        departmentTreeData.value = [
          {
            deptId: '0',
            deptCode: 'ROOT',
            deptName: '顶级部门',
            deptLevel: 0,
            sortOrder: 0,
            isActive: true,
            parentId: '-1',
            status: 1,
            children: response.data || [],
          } as DepartmentTreeNode,
        ];
      }
    } catch (error) {
      console.error('获取部门树失败:', error);
    }
  };

  /**
   * 切换到编辑模式
   */
  const switchToEdit = () => {
    emit('update:visible', false);
    nextTick(() => {
      emit('update:visible', true);
      // 这里需要父组件配合切换模式
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (props.mode === 'view') {
      modalVisible.value = false;
      return;
    }

    try {
      const valid = await formRef.value?.validate();
      if (valid === false) {
        // 只有验证失败才返回
        return;
      }

      submitLoading.value = true;

      let response;
      if (props.mode === 'add') {
        response = await departmentApi.createDepartment(formData);
      } else {
        response = await departmentApi.updateDepartment(
          formData.deptId!,
          formData
        );
      }

      if (response.code === 200) {
        Message.success(props.mode === 'add' ? '新增成功' : '更新成功');
        emit('success');
      } else {
        Message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      Message.error('操作失败');
    } finally {
      submitLoading.value = false;
    }
  };

  /**
   * 取消操作
   */
  const handleCancel = () => {
    modalVisible.value = false;
  };

  // 组件挂载时获取部门树
  onMounted(() => {
    if (props.visible) {
      getDepartmentTree();
    }
  });
</script>

<script lang="ts">
  export default {
    name: 'DepartmentModal',
  };
</script>

<style scoped lang="less">
  .department-modal-content {
    .department-form {
      :deep(.arco-form-item-label) {
        font-weight: 500;
      }
    }
  }
</style>
