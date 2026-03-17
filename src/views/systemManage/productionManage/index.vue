<script setup lang="ts">
import { h, ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import OrgTreePanel from "@/components/OrgTreePanel.vue";
import { getBmsListReq, processDeviceList, getStockReq } from "@/api/bms";
import type { BmsDeviceItem, BmsListFilters } from "@/api/bms/types";
import { online_status_dict, cell_mat_dict } from "@/utils/dict";
import useTableWithForm from "@/hooks/useTableWithForm";
import { dateYMDHMS } from "@/utils/util";
import ProductionManageActions from "./components/ProductionManageActions.vue";
import { addDialog } from "@/components/ReDialog";
import DeviceEntryTransferPanel from "./components/DeviceEntryTransferPanel.vue";
import MainPlatformConfigPanel from "./components/MainPlatformConfigPanel.vue";
import ProductionConfigPanel from "./components/ProductionConfigPanel.vue";
import ServicePricingPanel from "./components/ServicePricingPanel.vue";
import ServiceTimePanel from "./components/ServiceTimePanel.vue";
import { ArrowDown } from "@element-plus/icons-vue";

defineOptions({
  name: "ProductionManage"
});

// 组织筛选
const selectedOrgIdForFilter = ref<string | number>("");
const selectedOrgName = ref<string>("");
const selectedRows = ref<BmsDeviceItem[]>([]);

// 库存切换
type StockViewMode = "all" | "production" | "repair";
const stockViewMode = ref<StockViewMode>("all");
const productionStockId = ref<string | number>("");
const repairStockId = ref<string | number>("");
const hasStockConfig = computed(() => {
  return Boolean(productionStockId.value || repairStockId.value);
});

// 表格数据
const {
  dataList: list,
  page,
  loading,
  searchForm,
  GetData,
  handleSearch,
  handleReset
} = useTableWithForm({
  apiFunction: getBmsListReq,
  dataMapping: {
    listField: "bmsList",
    totalField: "total"
  },
  paramsTransform: params => {
    const { currentPage, pageSize, ...otherParams } = params;
    const filters: BmsListFilters = {};

    if (otherParams.deviceCode) filters.bmsId = String(otherParams.deviceCode);
    if (otherParams.online != null && otherParams.online !== "") filters.online = Number(otherParams.online);
    if (otherParams.cellMat != null && otherParams.cellMat !== "") filters.ceMat = Number(otherParams.cellMat);
    if (otherParams.cellCnt != null && otherParams.cellCnt !== "") filters.ceCnt = Number(otherParams.cellCnt);
    if (otherParams.btCode) filters.btCode = String(otherParams.btCode);

    // 库存切换优先级高于组织筛选
    if (stockViewMode.value === "production" && productionStockId.value) {
      filters.orgId = String(productionStockId.value);
    } else if (stockViewMode.value === "repair" && repairStockId.value) {
      filters.orgId = String(repairStockId.value);
    } else if (selectedOrgIdForFilter.value && selectedOrgIdForFilter.value !== -1) {
      filters.orgId = String(selectedOrgIdForFilter.value);
    }

    return {
      page: currentPage || 1,
      pageSize: pageSize || 20,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };
  },
  onSuccess: data => {
    if (data.bmsList && Array.isArray(data.bmsList)) {
      const processed = processDeviceList(data.bmsList) as any[];

      processed.forEach(item => {
        if (item.outTime) item.outTime = dateYMDHMS(item.outTime);
        if (item.activeTime) item.activeTime = dateYMDHMS(item.activeTime);
        if (item.srvEndTime) item.srvEndTime = dateYMDHMS(item.srvEndTime);
        if (item.updateTime) item.updateTime = dateYMDHMS(item.updateTime);

        // 服务价格：后端字段为“分”，前端展示需要转为“元”
        if (item.srvFee !== null && item.srvFee !== undefined) {
          const fee = Number(item.srvFee);
          if (!Number.isNaN(fee)) {
            item.srvFee = (fee / 100).toFixed(2);
          }
        }
      });

      list.value = processed as any;
    }
  },
  autoLoad: false // 交给 pageTable 的 @GetData 触发
});

/**
 * 多选变更
 */
function handleSelectionChange(rows: BmsDeviceItem[]) {
  selectedRows.value = rows ?? [];
}

/**
 * 处理组织变化
 */
function handleOrgChange(payload: { orgId: string | number; orgName: string }) {
  selectedOrgIdForFilter.value = payload.orgId;
  selectedOrgName.value = payload.orgName;
  stockViewMode.value = "all"; // 组织切换时自动切换到"全部"
  page.currentPage = 1;
  GetData();
}

/**
 * 处理组织清除
 */
function handleOrgClear() {
  selectedOrgIdForFilter.value = "";
  selectedOrgName.value = "";
  stockViewMode.value = "all"; // 组织清除时自动切换到"全部"
  page.currentPage = 1;
  GetData();
}

/**
 * 获取库存组织ID
 */
async function fetchStockIds() {
  try {
    const res = await getStockReq();
    if (res.errno === 0 && res.data) {
      if (res.data.stockProduct) {
        productionStockId.value = res.data.stockProduct;
      }
      if (res.data.maintainStockOrgId) {
        repairStockId.value = res.data.maintainStockOrgId;
      }
    }
  } catch (error) {
    console.error("获取库存组织ID失败:", error);
  }
}

/**
 * 处理库存视图切换
 */
async function handleStockViewModeChange(mode: StockViewMode) {
  if (stockViewMode.value === mode) return;
  stockViewMode.value = mode;
  // 切换到生产/维修库存时，若 ID 未加载则先获取
  if (
    (mode === "production" && !productionStockId.value) ||
    (mode === "repair" && !repairStockId.value)
  ) {
    await fetchStockIds();
  }
  page.currentPage = 1;
  GetData(undefined, searchForm.value);
}

// 初始化时获取库存组织ID
onMounted(() => {
  fetchStockIds();
});

type PanelExpose = {
  submit: () => Promise<boolean>;
};

/**
 * 行内操作 - 设备调拨
 */
function handleRowTransfer(row: BmsDeviceItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设备调拨",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(DeviceEntryTransferPanel, {
        ref: panelRef,
        initialBmsIds: [row.bmsId],
        mode: "transfer"
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          GetData();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleRowProdConfig(row: BmsDeviceItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "生产配置",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ProductionConfigPanel, {
        ref: panelRef,
        initialBmsIds: [row.bmsId]
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          GetData();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleRowMainPlatformConfig(row: BmsDeviceItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "主平台配置",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(MainPlatformConfigPanel, {
        ref: panelRef,
        initialBmsIds: [row.bmsId]
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          GetData();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleRowServicePricing(row: BmsDeviceItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设置服务价格",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ServicePricingPanel, {
        ref: panelRef,
        initialBmsIds: [row.bmsId]
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          GetData();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleRowServiceTime(row: BmsDeviceItem) {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设置服务时间",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ServiceTimePanel, {
        ref: panelRef,
        initialBmsIds: [row.bmsId]
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          GetData();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleRowMoreCommand(row: BmsDeviceItem, command: "prod" | "platform" | "pricing" | "time") {
  if (command === "prod") {
    handleRowProdConfig(row);
    return;
  }
  if (command === "platform") {
    handleRowMainPlatformConfig(row);
    return;
  }
  if (command === "pricing") {
    handleRowServicePricing(row);
    return;
  }
  handleRowServiceTime(row);
}

// 表格列
const columns = [
  { type: "selection", width: 80, align: "center" as const, fixed: "left" as const },
  { label: "BMS编码", prop: "bmsId", width: 170 },
  { label: "发货时间", prop: "outTime", width: 165 },
  { label: "激活时间", prop: "activeTime", width: 165 },
  { label: "最近续费时间", prop: "updateTime", width: 165 },
  { label: "服务到期时间", prop: "srvEndTime", width: 165 },
  { label: "服务价格", prop: "srvFee", width: 165 },
  { label: "串数", prop: "cellCnt", width: 90, align: "center" as const },
  { label: "材料", prop: "cellMat", width: 90, align: "center" as const, selectData: cell_mat_dict },
  { label: "容量(Ah)", prop: "capactiyD", width: 120, align: "center" as const },
  { label: "状态", prop: "online", width: 90, align: "center" as const, selectData: online_status_dict },
  { label: "BT码", prop: "btCode", minWidth: 240 },
  { label: "三方后台", prop: "tServer", minWidth: 240 },
  { label: "操作", prop: "cz", width: 140, align: "center" as const, slots: "cz", fixed: "right" as const }
];

// 搜索项
const searchItems = [
  { label: "设备编码", field: "deviceCode", type: "input" as const },
  { label: "在线状态", field: "online", type: "select" as const, selectOption: online_status_dict },
  { label: "材料类型", field: "cellMat", type: "select" as const, selectOption: cell_mat_dict },
  { label: "电芯串数", field: "cellCnt", type: "input" as const },
  { label: "BT码", field: "btCode", type: "input" as const }
];
</script>

<template>
  <div class="bms-production-manage">
    <!-- 左侧组织树：不开放新增 / 编辑操作 -->
    <OrgTreePanel :show-manage-actions="false" @change="handleOrgChange" @clear="handleOrgClear" />

    <!-- 右侧设备列表（生产管理用） -->
    <div class="bms-device-content">
      <div class="bms-card">
        <div class="bms-card__head">
          <div class="bms-card__title-wrapper">
            <div class="bms-card__title">生产管理</div>
            <div v-if="selectedOrgName && stockViewMode === 'all'" class="bms-card__org-name">
              <span class="org-name-value">{{ selectedOrgName }}</span>
            </div>
          </div>
          <ProductionManageActions
            :has-selection="selectedRows.length > 0"
            :selected-bms-ids="selectedRows.map(it => it.bmsId)"
            @refresh="GetData"
          />
        </div>

        <!-- 库存切换：全部 / 生产库存 / 维修库存（仅在有库存配置时展示） -->
        <div v-if="hasStockConfig" class="bms-stock-switch">
          <el-button
            :type="stockViewMode === 'all' ? 'primary' : 'default'"
            plain
            @click="handleStockViewModeChange('all')"
          >
            全部
          </el-button>
          <el-button
            :type="stockViewMode === 'production' ? 'primary' : 'default'"
            plain
            @click="handleStockViewModeChange('production')"
          >
            生产库存
          </el-button>
          <el-button
            :type="stockViewMode === 'repair' ? 'primary' : 'default'"
            plain
            @click="handleStockViewModeChange('repair')"
          >
            维修库存
          </el-button>
        </div>

        <TableSearch
          :form-item="searchItems"
          page-name="productionManage"
          @query-btn="handleSearch"
          @reset-btn="handleReset"
        />

        <pageTable
          :page="page"
          :data="list"
          :columns="columns"
          :loading="loading"
          rowkey="bmsId"
          :height="`${hasStockConfig ? 'calc(100vh - 380px)' : 'calc(100vh - 350px)'}`"
          @GetData="GetData"
          @selectionChange="handleSelectionChange"
        >
          <template #cz="{ row }">
            <el-button link class="bms-op-link" @click="handleRowTransfer(row)">
              设备调拨
            </el-button>
            <el-dropdown
              trigger="click"
              popper-class="bms-prod-dropdown"
              @command="cmd => handleRowMoreCommand(row, cmd)"
            >
              <el-button link class="bms-op-link">
                更多
                <el-icon class="bms-op-caret">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="prod">生产配置</el-dropdown-item>
                  <el-dropdown-item command="platform">主平台配置</el-dropdown-item>
                  <el-dropdown-item command="pricing">设置服务价格</el-dropdown-item>
                  <el-dropdown-item command="time">设置服务时间</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </pageTable>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bms-production-manage {
  display: flex;
  gap: 16px;
  margin: 10px 10px;
  box-sizing: border-box;
  background: var(--bms-bg);
}

.bms-device-content {
  flex: 1;
  min-width: 0;
}

.bms-card {
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

.bms-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.bms-card__title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.bms-stock-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  .el-button {
    width: 80px;
    border-radius: 30px;
    margin-left: 0px !important;
  }
}

.bms-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bms-text);
}

.bms-card__org-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 188, 212, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 188, 212, 0.2);
}

.org-name-value {
  font-size: 13px;
  color: var(--bms-primary);
  font-weight: 500;
}

.bms-op-link {
  color: var(--bms-primary) !important;
  transition: color 0.2s ease;
  cursor: pointer;
}

.bms-op-link:hover {
  color: var(--bms-primary-hover, #26c6da) !important;
}

.bms-op-caret {
  margin-left: 2px;
  font-size: 12px;
}

.bms-production-manage :deep(.el-table) {
  --el-table-text-color: var(--bms-text) !important;
}

.bms-production-manage :deep(.el-pagination) {
  .el-pagination__total,
  .btn-prev,
  .btn-next,
  .el-pager li {
    color: inherit;
  }

  .el-pager li.is-active {
    background: var(--bms-primary);
  }
}


:deep(.bms-prod-dropdown.el-popper) {
  transform-origin: center top !important;
}

/* 关闭 el-zoom-in-top 的缩放/位移动画，只保留很轻的透明度过渡 */
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-active),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-active) {
  transition: opacity 0.12s ease-out !important;
}

:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-from),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-to) {
  opacity: 0;
  transform: none !important;
}

:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-to),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-from) {
  opacity: 1;
  transform: none !important;
}
</style>
