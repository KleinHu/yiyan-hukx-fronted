# useDepartmentTree Hook 使用文档

## 简介

`useDepartmentTree` 是一个用于管理部门数据的 Vue 3 Composition API Hook。它提供了完整的部门 CRUD 操作、树形结构处理、部门路径查询、员工关联等功能，封装了与后端 API 的交互逻辑。

## 导入

```typescript
import useDepartmentTree from '@/hooks/hr/department';
```

## 快速开始

### 基本使用流程

1. **导入 Hook**

   ```typescript
   import useDepartmentTree from '@/hooks/hr/department';
   ```

2. **调用 Hook 并解构出需要的方法和数据**

   ```typescript
   // 通过解构赋值获取需要的方法和数据
   const {
     departmentTreeData, // 部门树数据（响应式）
     loading, // 加载状态（响应式）
     fetchDepartmentTree, // 获取部门树的方法
     refresh, // 刷新方法
   } = useDepartmentTree();
   ```

3. **在代码中使用**

   ```vue
   <template>
     <a-spin :loading="loading">
       <a-tree :data="departmentTreeData" />
     </a-spin>
     <a-button @click="refresh">刷新</a-button>
   </template>

   <script setup lang="ts">
     import useDepartmentTree from '@/hooks/hr/department';

     // 解构赋值：从 hook 返回的对象中提取需要的方法和数据
     const { departmentTreeData, loading, refresh } = useDepartmentTree();
   </script>
   ```

### 解构赋值说明

**重要概念：** `useDepartmentTree()` 返回一个对象，包含所有可用的方法和数据。通过**解构赋值**（`{}` 语法），你可以只提取你需要的那部分。

```typescript
// Hook 返回的对象结构（简化版）
const hookResult = useDepartmentTree();
// hookResult = {
//   departmentTreeData: Ref<...>,
//   loading: Ref<...>,
//   fetchDepartmentTree: Function,
//   refresh: Function,
//   ... 其他方法和数据
// }

// 方式1：解构赋值（推荐）- 只取需要的
const { departmentTreeData, loading, refresh } = useDepartmentTree();

// 方式2：不解构，通过对象访问（不推荐，代码冗长）
const hook = useDepartmentTree();
hook.departmentTreeData.value; // 需要 .value
hook.refresh(); // 需要 hook. 前缀

// 方式3：解构时重命名
const {
  departmentTreeData: deptTree, // 重命名为 deptTree
  loading: isLoading,
} = useDepartmentTree();
```

### 实际项目示例

参考 `department-modal.vue` 中的实际使用：

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  // 解构出需要的方法和数据
  const {
    departmentTreeData, // 部门树数据
    fetchDepartmentTree, // 获取部门树的方法
  } = useDepartmentTree({
    autoLoad: false, // 不自动加载
    includeRoot: true, // 包含根节点
  });

  // 在需要时调用方法
  onMounted(async () => {
    await fetchDepartmentTree(); // 调用解构出来的方法
  });

  // 在模板中使用数据
  // <a-tree-select :data="departmentTreeData" />
</script>
```

## 参数配置

### Options

```typescript
interface Options {
  autoLoad?: boolean; // 是否自动加载，默认 true
  includeRoot?: boolean; // 是否包含根节点（顶级部门），默认 false
  rootLabel?: string; // 根节点标签，默认 "顶级部门"
  withStats?: boolean; // 是否获取带统计信息的树，默认 false
}
```

**参数说明：**

- `autoLoad`: 组件挂载时是否自动加载部门树，默认为 `true`
- `includeRoot`: 是否在树结构中添加一个根节点，默认为 `false`
- `rootLabel`: 根节点的显示名称，默认为 `"顶级部门"`
- `withStats`: 是否获取带统计信息的树（包含员工数、子科室数等），默认为 `false`

## 返回值

```typescript
{
  departmentTreeData: Ref<DepartmentTreeNode[]>; // 部门树数据
  departmentList: Ref<Department[]>; // 部门列表（扁平结构）
  loading: Ref<boolean>; // 加载状态
  fetchDepartmentTree: Function; // 获取部门树
  fetchDepartmentList: Function; // 获取部门列表
  fetchSubDepartmentTree: Function; // 获取子树
  fetchDepartmentDetail: Function; // 获取部门详情
  fetchDepartmentEmployees: Function; // 获取部门员工
  fetchAllChildDeptIds: Function; // 获取子部门ID列表
  fetchDepartmentPath: Function; // 获取部门路径（API）
  fetchDepartmentPathByUserCode: Function; // 根据员工获取路径
  createDepartment: Function; // 新增部门
  updateDepartment: Function; // 更新部门
  deleteDepartment: Function; // 删除部门
  findDepartmentById: Function; // 根据ID查找部门
  getDepartmentPath: Function; // 获取部门路径（本地）
  flattenDepartmentTree: Function; // 扁平化部门树
  getAllChildren: Function; // 获取所有子部门
  findDepartmentsByName: Function; // 根据名称查找部门
  refresh: Function; // 刷新部门树
}
```

## 方法详解

### fetchDepartmentTree

获取部门树数据

```typescript
fetchDepartmentTree(): Promise<void>
```

**说明：** 根据 `withStats` 配置，自动选择调用普通树接口或带统计信息的树接口。

**示例：**

```typescript
await fetchDepartmentTree();
```

### fetchDepartmentList

获取部门列表（扁平结构）

```typescript
fetchDepartmentList(): Promise<void>
```

**说明：** 获取所有部门的扁平列表，存储在 `departmentList` 中。

**示例：**

```typescript
await fetchDepartmentList();
```

### fetchSubDepartmentTree

获取指定节点的子树

```typescript
fetchSubDepartmentTree(deptId: string): Promise<DepartmentTreeNode | null>
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 子树数据，失败返回 `null`

**示例：**

```typescript
const subTree = await fetchSubDepartmentTree('DEPT_001');
if (subTree) {
  console.log('子部门：', subTree.children);
}
```

### fetchDepartmentDetail

获取部门详情

```typescript
fetchDepartmentDetail(deptId: string): Promise<Department | null>
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 部门详情，失败返回 `null`

**示例：**

```typescript
const department = await fetchDepartmentDetail('DEPT_001');
if (department) {
  console.log('部门名称：', department.deptName);
}
```

### fetchDepartmentEmployees

获取部门及其员工

```typescript
fetchDepartmentEmployees(deptId: string, includeChildren?: boolean): Promise<{ department: Department; employees: Employee[] } | null>
```

**参数：**

- `deptId`: 部门 ID
- `includeChildren`: 是否包含子科室员工，默认 `true`

**返回值：** 部门及员工信息，失败返回 `null`

**示例：**

```typescript
// 获取部门及其所有子部门的员工
const result = await fetchDepartmentEmployees('DEPT_001', true);
if (result) {
  console.log('部门：', result.department);
  console.log('员工数：', result.employees.length);
}

// 只获取当前部门的员工
const result2 = await fetchDepartmentEmployees('DEPT_001', false);
```

### fetchAllChildDeptIds

获取科室及所有子科室的 ID 列表

```typescript
fetchAllChildDeptIds(deptId: string): Promise<string[]>
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 子科室 ID 列表（包含自身）

**示例：**

```typescript
const childIds = await fetchAllChildDeptIds('DEPT_001');
// 返回：['DEPT_001', 'DEPT_002', 'DEPT_003', ...]
```

### fetchDepartmentPath

获取科室路径（从 API）

```typescript
fetchDepartmentPath(deptId: string): Promise<any>
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 科室路径信息

**示例：**

```typescript
const path = await fetchDepartmentPath('DEPT_001');
// 返回路径信息，包含从根到当前部门的所有层级
```

### fetchDepartmentPathByUserCode

根据员工工号获取其科室路径

```typescript
fetchDepartmentPathByUserCode(userCode: string): Promise<any>
```

**参数：**

- `userCode`: 员工工号

**返回值：** 员工所属科室的路径信息

**示例：**

```typescript
const path = await fetchDepartmentPathByUserCode('E001');
if (path) {
  console.log('员工所属科室路径：', path);
}
```

### createDepartment

新增部门

```typescript
createDepartment(data: Partial<Department>): Promise<boolean>
```

**参数：**

- `data`: 部门信息对象
  ```typescript
  {
    deptName: string;        // 部门名称（必填）
    parentId?: string;       // 父部门ID
    sortOrder?: number;      // 排序权重
    isActive?: boolean;      // 是否启用
    managerId?: string;      // 负责人ID
    managerName?: string;    // 负责人姓名
    description?: string;    // 部门描述
  }
  ```

**返回值：** 是否成功（成功后会自动刷新部门树）

**示例：**

```typescript
const success = await createDepartment({
  deptName: '新部门',
  parentId: 'DEPT_001',
  sortOrder: 1,
  isActive: true,
});
```

### updateDepartment

更新部门信息

```typescript
updateDepartment(deptId: string, data: Partial<Department>): Promise<boolean>
```

**参数：**

- `deptId`: 部门 ID
- `data`: 要更新的部门信息

**返回值：** 是否成功（成功后会自动刷新部门树）

**示例：**

```typescript
const success = await updateDepartment('DEPT_001', {
  deptName: '更新后的部门名称',
  managerId: 'E001',
  managerName: '张三',
});
```

### deleteDepartment

删除部门

```typescript
deleteDepartment(deptId: string): Promise<boolean>
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 是否成功（成功后会自动刷新部门树）

**示例：**

```typescript
const success = await deleteDepartment('DEPT_001');
```

### findDepartmentById

根据部门 ID 查找部门节点（从本地树数据）

```typescript
findDepartmentById(deptId: string, tree?: DepartmentTreeNode[]): DepartmentTreeNode | undefined
```

**参数：**

- `deptId`: 部门 ID
- `tree`: 部门树（可选，默认使用当前树数据）

**返回值：** 部门节点，未找到返回 `undefined`

**示例：**

```typescript
const department = findDepartmentById('DEPT_001');
if (department) {
  console.log('部门名称：', department.deptName);
  console.log('子部门数：', department.children?.length || 0);
}
```

### getDepartmentPath

获取部门路径（从根到当前部门，本地计算）

```typescript
getDepartmentPath(deptId: string): DepartmentTreeNode[]
```

**参数：**

- `deptId`: 部门 ID

**返回值：** 部门路径数组（从根到当前部门）

**示例：**

```typescript
const path = getDepartmentPath('DEPT_003');
// 返回：[根部门, 一级部门, 二级部门, DEPT_003]
path.forEach((dept, index) => {
  console.log(`第${index + 1}层：${dept.deptName}`);
});
```

### flattenDepartmentTree

扁平化部门树（获取所有部门列表）

```typescript
flattenDepartmentTree(tree?: DepartmentTreeNode[]): DepartmentTreeNode[]
```

**参数：**

- `tree`: 部门树（可选，默认使用当前树数据）

**返回值：** 扁平化的部门列表

**示例：**

```typescript
const allDepartments = flattenDepartmentTree();
// 返回所有部门的扁平列表
allDepartments.forEach((dept) => {
  console.log(dept.deptName);
});
```

### getAllChildren

获取所有子部门（递归）

```typescript
getAllChildren(deptId: string, tree?: DepartmentTreeNode[]): DepartmentTreeNode[]
```

**参数：**

- `deptId`: 部门 ID
- `tree`: 部门树（可选，默认使用当前树数据）

**返回值：** 所有子部门列表（包含子部门的子部门）

**示例：**

```typescript
const children = getAllChildren('DEPT_001');
// 返回 DEPT_001 的所有子部门（包括子部门的子部门）
console.log('子部门数：', children.length);
```

### findDepartmentsByName

根据部门名称查找部门（支持模糊匹配）

```typescript
findDepartmentsByName(deptName: string, tree?: DepartmentTreeNode[]): DepartmentTreeNode[]
```

**参数：**

- `deptName`: 部门名称（支持部分匹配）
- `tree`: 部门树（可选，默认使用当前树数据）

**返回值：** 匹配的部门列表

**示例：**

```typescript
const departments = findDepartmentsByName('技术');
// 返回所有名称包含"技术"的部门
```

### refresh

刷新部门树

```typescript
refresh(): Promise<void>
```

**示例：**

```typescript
await refresh();
```

## 完整使用示例

### 基础用法

```vue
<template>
  <div>
    <a-spin :loading="loading">
      <a-tree :data="departmentTreeData" />
    </a-spin>
    <a-button @click="refresh">刷新</a-button>
  </div>
</template>

<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  // 自动加载部门树
  const { departmentTreeData, loading, refresh } = useDepartmentTree();
</script>
```

### 包含根节点

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  // 包含根节点，用于下拉选择等场景
  const { departmentTreeData } = useDepartmentTree({
    includeRoot: true,
    rootLabel: '顶级部门',
  });
</script>
```

### 带统计信息

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  // 获取带统计信息的树（包含员工数、子科室数等）
  const { departmentTreeData, departmentList } = useDepartmentTree({
    withStats: true,
  });
</script>
```

### 手动控制加载

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  // 不自动加载
  const {
    departmentTreeData,
    loading,
    fetchDepartmentTree,
    fetchDepartmentList,
  } = useDepartmentTree({
    autoLoad: false,
  });

  // 在需要时加载
  onMounted(async () => {
    await fetchDepartmentTree();
    await fetchDepartmentList();
  });
</script>
```

### CRUD 操作示例

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  const {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchDepartmentDetail,
  } = useDepartmentTree({ autoLoad: false });

  // 新增部门
  const handleCreate = async () => {
    const success = await createDepartment({
      deptName: '新部门',
      parentId: 'DEPT_001',
      sortOrder: 1,
      isActive: true,
    });
    if (success) {
      console.log('新增成功');
    }
  };

  // 更新部门
  const handleUpdate = async (deptId: string) => {
    const success = await updateDepartment(deptId, {
      deptName: '更新后的部门名称',
      managerId: 'E001',
    });
    if (success) {
      console.log('更新成功');
    }
  };

  // 删除部门
  const handleDelete = async (deptId: string) => {
    const success = await deleteDepartment(deptId);
    if (success) {
      console.log('删除成功');
    }
  };

  // 获取详情
  const handleViewDetail = async (deptId: string) => {
    const department = await fetchDepartmentDetail(deptId);
    if (department) {
      console.log('部门详情：', department);
    }
  };
</script>
```

### 部门员工查询

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  const { fetchDepartmentEmployees, fetchAllChildDeptIds } =
    useDepartmentTree();

  // 获取部门及其员工
  const loadDepartmentEmployees = async (deptId: string) => {
    const result = await fetchDepartmentEmployees(deptId, true);
    if (result) {
      console.log('部门：', result.department.deptName);
      console.log('员工列表：', result.employees);
      console.log('员工数：', result.employees.length);
    }
  };

  // 获取所有子部门ID（用于批量查询等场景）
  const loadChildIds = async (deptId: string) => {
    const childIds = await fetchAllChildDeptIds(deptId);
    console.log('子部门ID列表：', childIds);
    // 可以使用这些ID进行批量操作
  };
</script>
```

### 部门路径查询

```vue
<script setup lang="ts">
  import useDepartmentTree from '@/hooks/hr/department';

  const {
    getDepartmentPath,
    fetchDepartmentPath,
    fetchDepartmentPathByUserCode,
  } = useDepartmentTree();

  // 本地计算路径（从已加载的树数据）
  const getLocalPath = (deptId: string) => {
    const path = getDepartmentPath(deptId);
    const pathNames = path.map((dept) => dept.deptName).join(' > ');
    console.log('部门路径：', pathNames);
  };

  // 从API获取路径（包含更多信息）
  const getApiPath = async (deptId: string) => {
    const path = await fetchDepartmentPath(deptId);
    if (path) {
      console.log('部门路径信息：', path);
    }
  };

  // 根据员工获取路径
  const getEmployeePath = async (userCode: string) => {
    const path = await fetchDepartmentPathByUserCode(userCode);
    if (path) {
      console.log('员工所属部门路径：', path);
    }
  };
</script>
```

### 数据查询和筛选

```vue
<script setup lang="ts">
  import { computed } from 'vue';
  import useDepartmentTree from '@/hooks/hr/department';

  const {
    departmentTreeData,
    departmentList,
    findDepartmentById,
    findDepartmentsByName,
    getAllChildren,
    flattenDepartmentTree,
  } = useDepartmentTree();

  // 查找指定部门
  const targetDept = computed(() => {
    return findDepartmentById('DEPT_001');
  });

  // 根据名称查找
  const techDepts = computed(() => {
    return findDepartmentsByName('技术');
  });

  // 获取所有子部门
  const childDepts = computed(() => {
    return getAllChildren('DEPT_001');
  });

  // 扁平化列表
  const allDepts = computed(() => {
    return flattenDepartmentTree();
  });
</script>
```

### 树形选择器使用

```vue
<template>
  <a-tree-select
    v-model="selectedDeptId"
    :data="departmentTreeData"
    :field-names="{
      key: 'deptId',
      title: 'deptName',
      children: 'children',
    }"
    placeholder="请选择部门"
  />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import useDepartmentTree from '@/hooks/hr/department';

  const selectedDeptId = ref<string>();

  // 包含根节点，适合下拉选择
  const { departmentTreeData } = useDepartmentTree({
    includeRoot: true,
    rootLabel: '顶级部门',
  });
</script>
```

### 部门树表格使用

```vue
<template>
  <a-table
    :data="flattenedDepts"
    :columns="columns"
    :pagination="false"
    row-key="deptId"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import useDepartmentTree from '@/hooks/hr/department';

  const { departmentTreeData, flattenDepartmentTree } = useDepartmentTree();

  // 扁平化树数据用于表格显示
  const flattenedDepts = computed(() => {
    return flattenDepartmentTree();
  });
</script>
```

## 注意事项

1. **自动加载时机**：如果设置了 `autoLoad: true`，会在组件 `onMounted` 时自动加载数据
2. **数据刷新**：执行 `createDepartment`、`updateDepartment`、`deleteDepartment` 后会自动刷新部门树
3. **本地查询方法**：`findDepartmentById`、`getDepartmentPath` 等方法是从本地 `departmentTreeData` 中查询，需要先调用 `fetchDepartmentTree` 加载数据
4. **带统计信息**：设置 `withStats: true` 时，会自动调用带统计信息的接口，并同时加载扁平列表
5. **根节点**：`includeRoot: true` 会在树数据顶部添加一个虚拟根节点，适合下拉选择等场景
6. **错误处理**：所有 API 调用失败时会自动显示错误提示，无需手动处理
7. **路径查询**：`getDepartmentPath` 是本地计算，`fetchDepartmentPath` 是从 API 获取，后者可能包含更多信息

## 类型定义

相关类型定义请参考 `@/api/hr/types`：

- `Department` - 部门信息接口
- `DepartmentTreeNode` - 部门树节点接口
- `DepartmentCreateRequest` - 新增部门请求参数
- `DepartmentUpdateRequest` - 更新部门请求参数
