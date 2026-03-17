<script setup lang="ts">
import { h, ref } from "vue";
import { getFacProfileListReq } from "@/api/bms";
import type { BmsFacProfileItem } from "@/api/bms/types";
import { addDialog } from "@/components/ReDialog";
import useTableWithForm from "@/hooks/useTableWithForm";
import ProfileFormDialog from "./ProfileFormDialog.vue";

defineOptions({
  name: "ProfileListDialog"
});

const emit = defineEmits<{
  (e: "select", profile: BmsFacProfileItem): void;
}>();

type PanelExpose = {
  submit: () => Promise<boolean>;
};

// 表格 + 搜索：复用通用 hooks（参考 ProductionManage）
const {
  dataList: list,
  page,
  loading,
  searchForm,
  GetData,
  handleSearch,
  handleReset
} = useTableWithForm({
  apiFunction: getFacProfileListReq,
  dataMapping: {
    listField: "profile_list",
    totalField: "total"
  },
  paramsTransform: params => {
    const { currentPage, pageSize, ...otherParams } = params;

    // 搜索条件走 filters（与 ProductionManage 一致）
    const filters: Record<string, string> = {};
    if (otherParams.name) filters.name = String(otherParams.name);
    if (otherParams.softwareVer) filters.softwareVer = otherParams.softwareVer;

    return {
      page: currentPage || 1,
      pageSize: pageSize || 20,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };
  },
  autoLoad: false // 交给 pageTable 的 @GetData 触发
});

const columns = [
  { type: "index", label: "序号", width: 80, align: "center" as const },
  { label: "配置名称", prop: "name", minWidth: 230, align: "left" as const },
  { label: "软件版本", prop: "softwareVer", minWidth: 230, align: "left" as const},
  { label: "4G信号", prop: "RSSI", width: 100, align: "center" as const },
  { label: "GPS星数", prop: "GPS", width: 100, align: "center" as const },
  { label: "主平台", prop: "server", width: 100, align: "center" as const },
  { label: "三方平台", prop: "3rdServer", width: 100, align: "center" as const },
  { label: "操作", prop: "action", width: 100,fixed: "right", align: "center" as const, slots: "action" }
];

const searchItems = [
  { label: "配置名称", field: "name", type: "input" as const },
  // { label: "软件版本", field: "softwareVer", type: "input" as const },
];

function handleSelect(row: BmsFacProfileItem) {
  emit("select", row);
}

function handleAdd() {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "新增配置",
    width: "600px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ProfileFormDialog, {
        ref: panelRef,
        mode: "add",
        onSuccess: () => {
          GetData();
        }
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) done();
      } finally {
        closeLoading();
      }
    }
  });
}

function handleEdit(row: BmsFacProfileItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "修改配置",
    width: "600px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ProfileFormDialog, {
        ref: panelRef,
        mode: "edit",
        profileData: row,
        onSuccess: () => {
          GetData();
        }
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) done();
      } finally {
        closeLoading();
      }
    }
  });
}
</script>

<template>
  <div class="profile-list-dialog">
    <TableSearch
      :form-item="searchItems"
      page-name="facProfileList"
      @query-btn="handleSearch"
      @reset-btn="handleReset"
    />

    <div class="profile-list-dialog__header">
      <el-button type="primary" size="small" @click="handleAdd">新增配置</el-button>
    </div>

    <pageTable
      :page="page"
      :data="list"
      :columns="columns"
      :loading="loading"
      rowkey="id"
      height="500px"
      @GetData="GetData"
    >
      <template #action="{ row }">
        <el-button type="primary" size="small" @click="handleEdit(row)">
          修改
        </el-button>
      </template>
    </pageTable>
  </div>
</template>

<style scoped lang="scss">
.profile-list-dialog {
  padding: 10px 0;

  :deep(.el-table) {
    --el-table-text-color: #303133;
    --el-table-header-text-color: #303133;
  }

  :deep(.el-pagination) {
    --el-pagination-text-color: #606266;
    --el-pagination-button-color: #606266;
    --el-pagination-button-disabled-color: #c0c4cc;
    --el-pagination-button-disabled-bg-color: #f5f7fa;
    --el-pagination-bg-color: #fff;
    --el-pagination-hover-color: #409eff;
  }
}

.profile-list-dialog__header {
  margin: 12px 0 16px;
  display: flex;
  justify-content: flex-end;
}

.bms-op-link {
  color: #409eff !important;
  transition: color 0.2s ease;
  cursor: pointer;
}

.bms-op-link:hover {
  color: #66b1ff !important;
}
</style>

