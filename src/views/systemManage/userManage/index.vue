
<template>
  <div class="user-manage">
    <template v-if="canList">
      <div class="user-manage__header">
        <div class="header-title">用户管理</div>
        <div class="header-actions">
          <el-button v-if="mngUsr.add" type="primary" @click="openAddUser">
            添加账号
          </el-button>
        </div>
      </div>
      <div class="user-manage-card">
        <TableSearch :form-item="searchItems" page-name="userManage" @query-btn="handleSearch"
          @reset-btn="handleReset" />

        <pageTable notauto :page="page" :data="list" :columns="columns" :loading="loading" rowkey="usr_id"
          height="calc(100vh - 400px)" @GetData="GetData">
          <template #cz="{ row }">
            <el-button v-if="mngUsr.update" link class="bms-op-link" @click="openEditUser(row)">
              修改信息
            </el-button>
            <el-button v-if="mngUsr.pwdchg" link class="bms-op-link" @click="handleResetPassword(row)">
              重置密码
            </el-button>
          </template>
        </pageTable>
      </div>

      <!-- 添加账号弹框 -->
      <el-dialog v-model="addUserVisible" title="添加账号" width="620px" destroy-on-close :close-on-click-modal="false"
        append-to-body>
        <AddUserDialog @success="handleAddUserSuccess" @cancel="addUserVisible = false" />
      </el-dialog>

      <!-- 修改信息弹框 -->
      <el-dialog v-model="editUserVisible" title="修改信息" width="620px" destroy-on-close :close-on-click-modal="false"
        append-to-body>
        <EditUserDialog :user="currentEditUser" @success="handleEditUserSuccess" @cancel="editUserVisible = false" />
      </el-dialog>
    </template>
    <div v-else class="no-permission-tip">
      <el-empty description="当前账号无查看用户列表权限" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUserListReq, resetPasswordReq } from "@/api/systemManage";
import type { UserItem, UserListFilters } from "@/api/systemManage/types";
import AddUserDialog from "./AddUserDialog.vue";
import EditUserDialog from "./EditUserDialog.vue";
import { useBmsAuth } from "@/composables/useBmsAuth";
import useTableWithForm from "@/hooks/useTableWithForm";

defineOptions({
  name: "UserManage"
});

const { mngUsr } = useBmsAuth();
const canList = computed(() => mngUsr.value.list);

// ==================== Hooks ====================
/**
 * 表格与表单集成
 * 处理数据加载、分页、搜索等功能
 */
const {
  dataList: list,
  page,
  loading,
  GetData,
  handleSearch,
  handleReset
} = useTableWithForm({
  apiFunction: getUserListReq,
  dataMapping: {
    listField: 'usr_list',
    totalField: 'total'
  },
  paramsTransform: (params) => {
    const { currentPage, pageSize, ...otherParams } = params
    // 将搜索参数转换为 filters
    const filters: UserListFilters = {}
    if (otherParams.name) filters.name = otherParams.name
    if (otherParams.org_name) filters.org_name = otherParams.org_name
    if (otherParams.mobile) filters.mobile = otherParams.mobile
    if (otherParams.email) filters.email = otherParams.email

    return {
      page: currentPage || 1,
      pageSize: pageSize || 20,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }
  },
  canLoad: () => canList.value,
  autoLoad: true
})

// ==================== 业务状态 ====================
const addUserVisible = ref(false);
const editUserVisible = ref(false);
const currentEditUser = ref<UserItem | null>(null);
const resetPasswordLoading = ref(false);

// ==================== 配置项 ====================
const searchItems = [
  { label: "账号名", field: "name", type: "input" as const },
  // { label: "所属组织", field: "org_name", type: "input" as const },
  // { label: "手机号码", field: "mobile", type: "input" as const },
  // { label: "电子邮箱", field: "email", type: "input" as const }
];

const columns = [
  { label: "所属组织", prop: "org_name", minWidth: 150 },
  { label: "登录账号", prop: "usr_name", minWidth: 120 },
  { label: "电子邮箱", prop: "email", minWidth: 180 },
  { label: "手机号码", prop: "mobile", minWidth: 120 },
  { label: "备注信息", prop: "comment", minWidth: 150 },
  { label: "操作", prop: "cz", width: 180, align: "center" as const, slots: "cz" }
];

function openAddUser() {
  addUserVisible.value = true;
}

function handleAddUserSuccess() {
  addUserVisible.value = false;
  // 新增成功后刷新列表
  page.currentPage = 1;
  GetData();
}

function openEditUser(row: UserItem) {
  currentEditUser.value = row;
  editUserVisible.value = true;
}

function handleEditUserSuccess() {
  editUserVisible.value = false;
  currentEditUser.value = null;
  // 修改成功后刷新列表
  GetData();
}

async function handleResetPassword(row: UserItem) {
  try {
    await ElMessageBox.confirm(
      `确定要重置账号"${row.usr_name}"的密码吗？`,
      "重置密码",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    resetPasswordLoading.value = true;
    try {
      const res = await resetPasswordReq({
        org_id: row.org_id,
        usr_id: row.usr_id,
        name: row.usr_name
      });

      if (res.errno === 0 && res.data?.password_new) {
        const newPassword = res.data.password_new;
        ElMessageBox.alert(
          `账号"${row.usr_name}"的密码已被重置为：${newPassword}`,
          "重置成功",
          {
            confirmButtonText: "复制密码",
            type: "success"
          }
        ).then(() => {
          // 复制到剪贴板
          navigator.clipboard.writeText(newPassword).then(() => {
            ElMessage.success("密码已复制到剪贴板");
          });
        });
      } else {
        ElMessage.error(res.errmsg ?? "重置密码失败");
      }
    } catch (err) {
      if (err !== "cancel") {
        ElMessage.error("网络错误，请重试");
      }
    } finally {
      resetPasswordLoading.value = false;
    }
  } catch {
    // 用户取消
  }
}

// 数据加载由 useTableWithForm hook 自动处理
</script>

<style scoped lang="scss">
.user-manage-card {
  background: var(--bms-bg-card);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--bms-border);
  --page-table-header-bg: var(--bms-bg);
  --page-table-header-color: var(--bms-text);
  --page-table-row-bg: var(--bms-bg-input);
  --page-table-row-striped-bg: var(--bms-bg-input);
  --page-table-row-hover-bg: #2d333b;
  --page-table-active-row-bg: #2d333b;
  --page-table-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.user-manage {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.user-manage__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--bms-text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 搜索区深色适配 */
.user-manage :deep(.el-card) {
  background: transparent;
  border: none;
  --el-card-border-color: none;
}

.user-manage :deep(.container-search) {
  color: var(--bms-text-secondary);
}

.user-manage :deep(.el-form-item__label),
.user-manage :deep(.el-input__inner),
.user-manage :deep(.el-select .el-select__wrapper) {
  color: var(--bms-text);
}

.user-manage :deep(.el-input__wrapper),
.user-manage :deep(.el-select .el-select__wrapper) {
  background: var(--bms-bg-input) !important;
  border-color: var(--bms-border);
}

.user-manage :deep(.el-button--primary) {
  background: var(--bms-primary);
  border-color: var(--bms-primary);
}

.user-manage :deep(.el-button--primary:hover) {
  background: var(--bms-primary-hover);
  border-color: var(--bms-primary-hover);
}

/* 表格样式 */
.user-manage :deep(.el-table) {
  --el-table-text-color: var(--bms-text) !important;
}

:deep(.el-pagination) {

  .el-pagination__total,
  .btn-prev,
  .btn-next,
  .el-pager li {
    color: var(--bms-text-secondary);
  }

  .el-pager li.is-active {
    background: var(--bms-primary);
  }
}

/* 操作列链接 */
.bms-op-link {
  color: var(--bms-primary) !important;
  transition: color 0.2s ease;
  cursor: pointer;
}

.bms-op-link:hover {
  color: var(--bms-primary-hover, #26c6da) !important;
}

.no-permission-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}
</style>
