# useEmployeeList Hook 使用文档

## 简介

`useEmployeeList` 是一个用于管理员工数据的 Vue 3 Composition API Hook。它提供了完整的员工 CRUD 操作、数据查询、筛选等功能，封装了与后端 API 的交互逻辑。

## 导入

```typescript
import useEmployeeList from '@/hooks/hr/employee';
```

## 快速开始

### 基本使用流程

1. **导入 Hook**

   ```typescript
   import useEmployeeList from '@/hooks/hr/employee';
   ```

2. **调用 Hook 并解构出需要的方法和数据**

   ```typescript
   // 通过解构赋值获取需要的方法和数据
   const {
     employeeList, // 员工列表（响应式）
     loading, // 加载状态（响应式）
     fetchEmployeeList, // 获取员工列表的方法
     refresh, // 刷新方法
   } = useEmployeeList();
   ```

3. **在代码中使用**

   ```vue
   <template>
     <a-spin :loading="loading">
       <a-table :data="employeeList" />
     </a-spin>
     <a-button @click="refresh">刷新</a-button>
   </template>

   <script setup lang="ts">
     import useEmployeeList from '@/hooks/hr/employee';

     // 解构赋值：从 hook 返回的对象中提取需要的方法和数据
     const { employeeList, loading, refresh } = useEmployeeList();
   </script>
   ```

### 解构赋值说明

**重要概念：** `useEmployeeList()` 返回一个对象，包含所有可用的方法和数据。通过**解构赋值**（`{}` 语法），你可以只提取你需要的那部分。

```typescript
// Hook 返回的对象结构（简化版）
const hookResult = useEmployeeList();
// hookResult = {
//   employeeList: Ref<...>,
//   loading: Ref<...>,
//   fetchEmployeeList: Function,
//   refresh: Function,
//   ... 其他方法和数据
// }

// 方式1：解构赋值（推荐）- 只取需要的
const { employeeList, loading, refresh } = useEmployeeList();

// 方式2：不解构，通过对象访问（不推荐，代码冗长）
const hook = useEmployeeList();
hook.employeeList.value; // 需要 .value
hook.refresh(); // 需要 hook. 前缀

// 方式3：解构时重命名
const {
  employeeList: employees, // 重命名为 employees
  loading: isLoading,
} = useEmployeeList();
```

### 实际项目示例

参考 `department-modal.vue` 中的实际使用：

```vue
<script setup lang="ts">
  import useEmployeeList from '@/hooks/hr/employee';

  // 解构出需要的方法和数据
  const {
    employeeList, // 员工列表
    loading: employeeLoading, // 加载状态（重命名）
    fetchEmployeeList, // 获取员工列表的方法
    getEmployeeByCode, // 根据工号查找的方法
  } = useEmployeeList({
    autoLoad: false, // 不自动加载
    filterStatus: 2, // 只获取正式员工
  });

  // 在需要时调用方法
  onMounted(async () => {
    await fetchEmployeeList(); // 调用解构出来的方法
  });

  // 使用查找方法
  const employee = getEmployeeByCode('E001'); // 调用解构出来的方法
</script>
```

## 参数配置

### Options

```typescript
interface Options {
  autoLoad?: boolean; // 是否自动加载，默认 true
  filterStatus?: number; // 过滤状态（如：2-正式员工）
  pageSize?: number; // 每页数量，默认 1000（获取所有）
}
```

**参数说明：**

- `autoLoad`: 组件挂载时是否自动加载员工列表，默认为 `true`
- `filterStatus`: 员工状态过滤，可选值：
  - `1` - 试用
  - `2` - 正式
  - `3` - 离职
  - `4` - 退休
  - `5` - 顶岗实习
- `pageSize`: 获取数据时的每页数量，默认 `1000`（用于获取所有数据）

## 返回值

```typescript
{
  employeeList: Ref<Employee[]>; // 员工列表
  loading: Ref<boolean>; // 加载状态
  pagination: Ref<Pagination>; // 分页信息
  fetchEmployeeList: Function; // 获取员工列表
  fetchEmployeeDetail: Function; // 获取员工详情
  createEmployee: Function; // 新增员工
  updateEmployee: Function; // 更新员工
  deleteEmployee: Function; // 删除员工
  getEmployeeByCode: Function; // 根据工号查找
  getEmployeesByName: Function; // 根据姓名查找
  getEmployeesByDepartment: Function; // 根据部门查找
  getEmployeesByRank: Function; // 根据职级查找
  getEmployeesByStatus: Function; // 根据状态查找
  getActiveEmployees: Function; // 获取在职员工
  refresh: Function; // 刷新列表
}
```

## 方法详解

### fetchEmployeeList

获取员工列表（支持分页和查询条件）

```typescript
fetchEmployeeList(params?: Partial<EmployeePageParams>, usePagination?: boolean): Promise<void>
```

**参数：**

- `params`: 查询参数（可选）
  ```typescript
  {
    pageNum?: number;        // 页码
    pageSize?: number;       // 每页数量
    userName?: string;       // 姓名（模糊查询）
    userCode?: string;       // 工号
    departmentId?: string;  // 部门ID
    rankId?: string;        // 职级ID
    jobTitle?: string;       // 职位名称
    status?: number;         // 状态
    mobile?: string;         // 手机号
  }
  ```
- `usePagination`: 是否使用分页，默认 `false`（获取所有数据）

**示例：**

```typescript
// 获取所有员工
await fetchEmployeeList();

// 获取指定部门的员工
await fetchEmployeeList({ departmentId: 'DEPT_001' });

// 使用分页获取
await fetchEmployeeList({ userName: '张' }, true);

// 获取正式员工
await fetchEmployeeList({ status: 2 });
```

### fetchEmployeeDetail

获取员工详情

```typescript
fetchEmployeeDetail(userCode: string): Promise<Employee | null>
```

**参数：**

- `userCode`: 员工工号

**返回值：** 员工详情对象，失败返回 `null`

**示例：**

```typescript
const employee = await fetchEmployeeDetail('E001');
if (employee) {
  console.log(employee.userName);
}
```

### createEmployee

新增员工

```typescript
createEmployee(data: Partial<EmployeeCreateRequest>): Promise<string | null>
```

**参数：**

- `data`: 员工信息对象

**返回值：** 新增的员工工号，失败返回 `null`

**示例：**

```typescript
const userCode = await createEmployee({
  userName: '张三',
  departmentId: 'DEPT_001',
  rankId: 'RANK_001',
  status: 2,
  // ... 其他字段
});
```

### updateEmployee

更新员工信息

```typescript
updateEmployee(userCode: string, data: Partial<EmployeeUpdateRequest>): Promise<boolean>
```

**参数：**

- `userCode`: 员工工号
- `data`: 要更新的员工信息

**返回值：** 是否成功

**示例：**

```typescript
const success = await updateEmployee('E001', {
  userName: '张三（已更新）',
  mobile: '13800138000',
});
```

### deleteEmployee

删除员工

```typescript
deleteEmployee(userCode: string): Promise<boolean>
```

**参数：**

- `userCode`: 员工工号

**返回值：** 是否成功

**示例：**

```typescript
const success = await deleteEmployee('E001');
```

### getEmployeeByCode

根据工号查找员工（从本地列表）

```typescript
getEmployeeByCode(userCode: string): Employee | undefined
```

**参数：**

- `userCode`: 员工工号

**返回值：** 员工对象，未找到返回 `undefined`

**示例：**

```typescript
const employee = getEmployeeByCode('E001');
if (employee) {
  console.log(employee.userName);
}
```

### getEmployeesByName

根据姓名查找员工（支持模糊匹配）

```typescript
getEmployeesByName(userName: string): Employee[]
```

**参数：**

- `userName`: 员工姓名（支持部分匹配）

**返回值：** 匹配的员工列表

**示例：**

```typescript
const employees = getEmployeesByName('张');
// 返回所有姓名包含"张"的员工
```

### getEmployeesByDepartment

根据部门 ID 查找员工

```typescript
getEmployeesByDepartment(departmentId: string): Employee[]
```

**参数：**

- `departmentId`: 部门 ID

**返回值：** 该部门的员工列表

**示例：**

```typescript
const employees = getEmployeesByDepartment('DEPT_001');
```

### getEmployeesByRank

根据职级 ID 查找员工

```typescript
getEmployeesByRank(rankId: string): Employee[]
```

**参数：**

- `rankId`: 职级 ID

**返回值：** 该职级的员工列表

**示例：**

```typescript
const employees = getEmployeesByRank('RANK_001');
```

### getEmployeesByStatus

根据状态筛选员工

```typescript
getEmployeesByStatus(status: number): Employee[]
```

**参数：**

- `status`: 员工状态（1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习）

**返回值：** 该状态的员工列表

**示例：**

```typescript
const formalEmployees = getEmployeesByStatus(2); // 正式员工
```

### getActiveEmployees

获取在职员工（状态为 1 或 2）

```typescript
getActiveEmployees(): Employee[]
```

**返回值：** 在职员工列表

**示例：**

```typescript
const activeEmployees = getActiveEmployees();
```

### refresh

刷新员工列表

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
      <a-table :data="employeeList" :columns="columns" />
    </a-spin>
    <a-button @click="refresh">刷新</a-button>
  </div>
</template>

<script setup lang="ts">
  import useEmployeeList from '@/hooks/hr/employee';

  // 自动加载所有正式员工
  const { employeeList, loading, refresh } = useEmployeeList({
    filterStatus: 2, // 只获取正式员工
  });
</script>
```

### 手动控制加载

```vue
<script setup lang="ts">
  import useEmployeeList from '@/hooks/hr/employee';

  // 不自动加载
  const { employeeList, loading, fetchEmployeeList, getEmployeesByDepartment } =
    useEmployeeList({
      autoLoad: false,
    });

  // 在需要时加载
  onMounted(async () => {
    await fetchEmployeeList({ departmentId: 'DEPT_001' });
  });

  // 根据部门筛选
  const deptEmployees = computed(() => {
    return getEmployeesByDepartment('DEPT_001');
  });
</script>
```

### 分页使用

```vue
<script setup lang="ts">
  import useEmployeeList from '@/hooks/hr/employee';

  const { employeeList, loading, pagination, fetchEmployeeList } =
    useEmployeeList({
      autoLoad: false,
    });

  // 分页加载
  onMounted(() => {
    fetchEmployeeList({}, true); // 第二个参数为 true 表示使用分页
  });

  // 切换页码
  const handlePageChange = (page: number) => {
    pagination.value.current = page;
    fetchEmployeeList({}, true);
  };
</script>
```

### CRUD 操作示例

```vue
<script setup lang="ts">
  import useEmployeeList from '@/hooks/hr/employee';

  const {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployeeDetail,
  } = useEmployeeList({ autoLoad: false });

  // 新增员工
  const handleCreate = async () => {
    const userCode = await createEmployee({
      userName: '新员工',
      departmentId: 'DEPT_001',
      status: 2,
    });
    if (userCode) {
      console.log('新增成功，工号：', userCode);
    }
  };

  // 更新员工
  const handleUpdate = async (userCode: string) => {
    const success = await updateEmployee(userCode, {
      userName: '更新后的姓名',
    });
    if (success) {
      console.log('更新成功');
    }
  };

  // 删除员工
  const handleDelete = async (userCode: string) => {
    const success = await deleteEmployee(userCode);
    if (success) {
      console.log('删除成功');
    }
  };

  // 获取详情
  const handleViewDetail = async (userCode: string) => {
    const employee = await fetchEmployeeDetail(userCode);
    if (employee) {
      console.log('员工详情：', employee);
    }
  };
</script>
```

### 数据筛选示例

```vue
<script setup lang="ts">
  import { computed } from 'vue';
  import useEmployeeList from '@/hooks/hr/employee';

  const {
    employeeList,
    getEmployeesByDepartment,
    getEmployeesByRank,
    getActiveEmployees,
  } = useEmployeeList();

  // 计算属性：某部门的员工
  const deptEmployees = computed(() => {
    return getEmployeesByDepartment('DEPT_001');
  });

  // 计算属性：某职级的员工
  const rankEmployees = computed(() => {
    return getEmployeesByRank('RANK_001');
  });

  // 计算属性：在职员工
  const activeEmployees = computed(() => {
    return getActiveEmployees();
  });
</script>
```

## 注意事项

1. **自动加载时机**：如果设置了 `autoLoad: true`，会在组件 `onMounted` 时自动加载数据
2. **数据刷新**：执行 `createEmployee`、`updateEmployee`、`deleteEmployee` 后会自动刷新列表
3. **本地查询方法**：`getEmployeeByCode`、`getEmployeesByName` 等方法是从本地 `employeeList` 中查询，需要先调用 `fetchEmployeeList` 加载数据
4. **分页模式**：使用分页时，需要设置 `usePagination: true`，分页信息会更新到 `pagination` 对象中
5. **错误处理**：所有 API 调用失败时会自动显示错误提示，无需手动处理

## 类型定义

相关类型定义请参考 `@/api/hr/types`：

- `Employee` - 员工信息接口
- `EmployeePageParams` - 分页查询参数
- `EmployeeCreateRequest` - 新增员工请求参数
- `EmployeeUpdateRequest` - 更新员工请求参数
