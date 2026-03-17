<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getBmsListReq, processDeviceList } from "@/api/bms";
import { online_status_dict, cell_mat_dict } from "@/utils/dict";
import { dateYMDHMS } from "@/utils/util";
import type { BmsDeviceItem, BmsListFilters } from "@/api/bms/types";
import BatchConfigDialog from "./batchConfig/BatchConfigDialog.vue";
import ParamConfigDialog from "./ParamConfigDialog.vue";
import OrgTreePanel from "@/components/OrgTreePanel.vue";
import { useBmsMenuGuard } from "@/composables/useBmsMenuGuard";
import useTableWithForm from "@/hooks/useTableWithForm";

defineOptions({
  name: "DeviceList"
});

/**
 * 设备列表搜索表单
 */
interface DeviceSearchForm {
  deviceCode?: string;
  online?: number | string;
  cellMat?: number | string;
  cellCnt?: string;
  btCode?: string;
  /**
   * 离线时长（秒）
   * 仅在查询离线设备时使用
   */
  offlineTime?: number;
}

const router = useRouter();

// ==================== 业务状态 ====================
const selectedRows = ref<BmsDeviceItem[]>([]);
const batchConfigVisible = ref(false);
const batchBmsIds = ref<string[]>([]);
const paramConfigVisible = ref(false);
const paramConfigBmsId = ref("");

// 组织筛选
const selectedOrgIdForFilter = ref<string | number>("");
const selectedOrgName = ref<string>("");

// 权限：批量参数配置按钮
const { canUseBatchConfig } = useBmsMenuGuard();

// ==================== Hooks ====================
/**
 * 表格与表单集成
 * 处理数据加载、分页、搜索等功能
 */
const {
  dataList: list,
  page,
  loading,
  searchForm,
  GetData,
  handleSearch,
  handleReset,
  handleSelectionChange: onSelectionChange
} = useTableWithForm({
  apiFunction: getBmsListReq,
  dataMapping: {
    listField: 'bmsList',
    totalField: 'total'
  },
  paramsTransform: (params) => {
    const { currentPage, pageSize, ...otherParams } = params
    // 将搜索参数转换为 filters
    const filters: BmsListFilters = {}
    if (otherParams.deviceCode) filters.bmsId = String(otherParams.deviceCode)
    if (otherParams.online != null && otherParams.online !== "") filters.online = Number(otherParams.online)
    if (otherParams.cellMat != null && otherParams.cellMat !== "") filters.ceMat = Number(otherParams.cellMat)
    if (otherParams.cellCnt != null && otherParams.cellCnt !== "") filters.ceCnt = Number(otherParams.cellCnt)
    if (otherParams.btCode) filters.btCode = String(otherParams.btCode)
    // 离线时长筛选：选择离线时长时，强制查询离线设备（online=0）
    if (otherParams.offlineTime != null && otherParams.offlineTime !== "") {
      const offSeconds = Number(otherParams.offlineTime)
      if (!Number.isNaN(offSeconds)) {
        filters.offlinetime = offSeconds
        filters.online = 0
      }
    }
    // 如果选择了组织，添加组织过滤条件
    if (selectedOrgIdForFilter.value && selectedOrgIdForFilter.value !== -1) {
      filters.orgId = String(selectedOrgIdForFilter.value)
    }

    return {
      page: currentPage || 1,
      pageSize: pageSize || 20,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }
  },
  onSuccess: (data) => {
    // 处理设备列表数据（容量单位换算等）
    // 注意：hook 已经自动更新了 dataList，我们需要覆盖为处理后的数据
    if (data.bmsList && Array.isArray(data.bmsList)) {
      const processed = processDeviceList(data.bmsList) as BmsDeviceItem[]

      const nowMs = Date.now()

      processed.forEach((item: BmsDeviceItem & {
        lastDataTime?: number | string
        lastDataTimeText?: string
        offlineSeconds?: number
        offlineDuration?: string
      }) => {
        // 生产相关时间字段（与生产管理列表保持一致）
        if (item.outTime) item.outTime = dateYMDHMS(item.outTime)
        if (item.activeTime) item.activeTime = dateYMDHMS(item.activeTime)
        if (item.srvEndTime) item.srvEndTime = dateYMDHMS(item.srvEndTime)
        if (item.updateTime) item.updateTime = dateYMDHMS(item.updateTime)

        // 服务价格：后端字段为“分”，前端展示转为“元”，保留两位小数
        if (item.srvFee !== null && item.srvFee !== undefined) {
          const fee = Number(item.srvFee)
          if (!Number.isNaN(fee)) {
            item.srvFee = (fee / 100).toFixed(2)
          }
        }

        const rawTs = item.lastDataTime
        if (rawTs) {
          const num = Number(rawTs)
          if (!Number.isNaN(num) && num > 0) {
            // 兼容秒/毫秒时间戳：小于 1e12 视为秒
            const ms = num < 1e12 ? num * 1000 : num
            item.lastDataTimeText = dateYMDHMS(ms)

            // 仅对离线设备计算离线时长
            if (item.online === 0) {
              const diffSeconds = Math.max(0, Math.floor((nowMs - ms) / 1000))
              item.offlineSeconds = diffSeconds
              item.offlineDuration = formatOfflineDuration(diffSeconds)
            } else {
              item.offlineSeconds = 0
              item.offlineDuration = "-"
            }
          }
        } else {
          item.lastDataTimeText = "-"
          item.offlineSeconds = item.online === 0 ? undefined : 0
          item.offlineDuration = item.online === 0 ? "-" : "-"
        }
      })

      // 手动更新处理后的列表数据
      list.value = processed as any
    }
  },
  autoLoad: false // pageTable 挂载时会自动触发 @GetData，无需自动加载
})

/**
 * 将离线秒数转为可读文案
 * 规则：
 * - >=1天：显示「X天Y小时」
 * - >=1小时：显示「X小时Y分」
 * - 其他：显示「X分」
 */
function formatOfflineDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "-"
  const daySec = 24 * 60 * 60
  const hourSec = 60 * 60
  const minSec = 60

  const days = Math.floor(seconds / daySec)
  const hours = Math.floor((seconds % daySec) / hourSec)
  const minutes = Math.floor((seconds % hourSec) / minSec)

  if (days > 0) {
    return `${days}天${hours > 0 ? `${hours}小时` : ""}`
  }
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分` : ""}`
  }
  return `${minutes || 1}分`
}

// 离线时长快捷筛选
const offlineTime = ref<number | null>(null)

const offlineTimeOptions: Array<{ label: string; value: number | null }> = [
  { label: "不限", value: null },
  { label: "超半小时", value: 30 * 60 },
  { label: "超1小时", value: 60 * 60 },
  { label: "超3小时", value: 3 * 60 * 60 },
  { label: "超6小时", value: 6 * 60 * 60 },
  { label: "超12小时", value: 12 * 60 * 60 },
  { label: "超1天", value: 24 * 60 * 60 },
  { label: "超3天", value: 3 * 24 * 60 * 60 },
  { label: "超7天", value: 7 * 24 * 60 * 60 },
  { label: "超30天", value: 30 * 24 * 60 * 60 },
  { label: "超60天", value: 60 * 24 * 60 * 60 }
]

/**
 * 视图模式：
 * - all：全部设备（不显示离线快捷筛选）
 * - offline：离线设备（仅显示离线快捷筛选 + 列表）
 */
const viewMode = ref<"all" | "offline">("all")

function handleViewModeChange(mode: "all" | "offline") {
  if (viewMode.value === mode) return
  viewMode.value = mode

  const currentForm: DeviceSearchForm = {
    ...(searchForm.value as DeviceSearchForm)
  }

  if (mode === "offline") {
    // 离线设备视图：
    // - 固定 online=0
    // - 默认不带离线时长，交给快捷筛选按钮控制
    currentForm.online = 0
    delete currentForm.offlineTime
    offlineTime.value = null
  } else {
    // 全部视图：
    // - 清理离线时长和强制的离线状态
    delete currentForm.offlineTime
    offlineTime.value = null
    if (currentForm.online === 0 || currentForm.online === "0") {
      delete currentForm.online
    }
  }

  searchForm.value = currentForm as unknown as Record<string, unknown>
  page.currentPage = 1
  GetData(undefined, currentForm)
}

/**
 * 处理离线时长筛选点击
 * - 选择具体离线时长：online 固定为 0，携带 offlinetime
 * - 选择「不限」：清除 offlinetime，仅根据「在线状态」筛选
 */
function handleOfflineTimeClick(value: number | null) {
  offlineTime.value = value
  const currentForm: DeviceSearchForm = {
    ...(searchForm.value as DeviceSearchForm)
  }

  if (value === null) {
    delete currentForm.offlineTime
    // 不限时也限定为离线设备，只是不限制离线时长
    currentForm.online = 0
  } else {
    currentForm.offlineTime = value
    // 离线时长筛选限定为离线设备
    currentForm.online = 0
  }

  // 更新搜索表单并触发查询
  searchForm.value = currentForm as unknown as Record<string, unknown>
  page.currentPage = 1
  GetData(undefined, currentForm)
}

// ==================== 方法 ====================
/**
 * 处理组织变化
 */
function handleOrgChange(payload: { orgId: string | number; orgName: string }) {
  selectedOrgIdForFilter.value = payload.orgId;
  selectedOrgName.value = payload.orgName;
  page.currentPage = 1;
  GetData();
}

/**
 * 处理组织清除
 */
function handleOrgClear() {
  selectedOrgIdForFilter.value = "";
  selectedOrgName.value = "";
  page.currentPage = 1;
  GetData();
}

// ==================== 配置项 ====================
const searchItems = [
  { label: "设备编码", field: "deviceCode", type: "input" as const },
  { label: "在线状态", field: "online", type: "select" as const, selectOption: online_status_dict },
  { label: "材料类型", field: "cellMat", type: "select" as const, selectOption: cell_mat_dict },
  { label: "电芯串数", field: "cellCnt", type: "input" as const },
  { label: "BT码", field: "btCode", type: "input" as const }
];

const columns = [
  { type: "selection", width: 80, align: "center" as const, fixed: "left" as const },
  { label: "BMS编码", prop: "bmsId", width: 170, slots: "bmsId" },
  { label: "串数", prop: "cellCnt", width: 90, align: "center" as const },
  { label: "材料", prop: "cellMat", width: 90, align: "center" as const, selectData: cell_mat_dict },
  { label: "容量(Ah)", prop: "capactiyD", width: 120, align: "center" as const },
  { label: "状态", prop: "online", width: 90, align: "center" as const, selectData: online_status_dict },
  { label: "最后在线时间", prop: "lastDataTimeText", width: 170 },
  { label: "离线时长", prop: "offlineDuration", width: 130, align: "center" as const },
  { label: "服务到期时间", prop: "srvEndTime", width: 165 },
  { label: "服务价格", prop: "srvFee", width: 120 },
  { label: "发货时间", prop: "outTime", width: 165 },
  { label: "激活时间", prop: "activeTime", width: 165 },
  { label: "最近续费时间", prop: "updateTime", width: 165 },
  { label: "BT码", prop: "btCode", minWidth: 225 },
  { label: "三方后台", prop: "tServer", minWidth: 170 },
  { label: "操作", prop: "cz", width: 160, align: "center" as const, slots: "cz", fixed: "right" as const }
];

// 仅在“离线设备”视图下展示的列
const offlineOnlyProps = ["lastDataTimeText", "offlineDuration"] as const;

const tableColumns = computed(() => {
  if (viewMode.value === "offline") return columns;
  return columns.filter(col => !(offlineOnlyProps as readonly string[]).includes((col as { prop?: string }).prop ?? ""));
});

function openDetail(row: BmsDeviceItem) {
  router.push({ name: "BmsManage", query: { bmsId: row.bmsId } });
}

function goParamConfig(row: BmsDeviceItem) {
  if (!row?.bmsId) {
    ElMessage.warning("缺少设备编码");
    return;
  }
  paramConfigBmsId.value = row.bmsId;
  paramConfigVisible.value = true;
}

/**
 * 处理选择变化
 */
function handleSelectionChange(rows: BmsDeviceItem[]) {
  selectedRows.value = rows ?? [];
  onSelectionChange(rows);
}

function openBatchConfig() {
  const bmsIds = (selectedRows.value ?? []).map(it => it.bmsId).filter(Boolean);
  if (bmsIds.length === 0) {
    ElMessage.warning("请先在表格中勾选要批量配置的设备");
    return;
  }
  batchBmsIds.value = bmsIds;
  batchConfigVisible.value = true;
}

// pageTable 挂载时会自动触发 @GetData，无需 onMounted 手动加载
</script>

<template>
  <div class="bms-device-list">
    <!-- 左侧组织树 -->
    <OrgTreePanel @change="handleOrgChange" @clear="handleOrgClear" />

    <!-- 右侧设备列表 -->
    <div class="bms-device-content">
      <div class="bms-card">
        <div class="bms-card__head">
          <div class="bms-card__title-wrapper">
            <div class="bms-card__title">设备列表</div>
            <div v-if="selectedOrgName" class="bms-card__org-name">
              <!-- <span class="org-name-label">当前公司：</span> -->
              <span class="org-name-value">{{ selectedOrgName }}</span>
            </div>
          </div>
          <div v-if="viewMode === 'all'" class="bms-card__actions">
            <el-button v-if="canUseBatchConfig" type="primary"
              @click="openBatchConfig">
              批量配置
            </el-button>
          </div>
        </div>

        <!-- 视图模式切换：全部 / 离线设备 -->
        <div class="bms-view-switch">
          <el-button
            :type="viewMode === 'all' ? 'primary' : 'default'"
            plain
            @click="handleViewModeChange('all')"
          >
            全部
          </el-button>
          <el-button
            :type="viewMode === 'offline' ? 'primary' : 'default'"
            plain
            @click="handleViewModeChange('offline')"
          >
            离线设备
          </el-button>
        </div>

        <TableSearch
          v-if="viewMode === 'all'"
          :form-item="searchItems"
          page-name="deviceList"
          @query-btn="handleSearch"
          @reset-btn="handleReset"
        />

        <!-- 离线时长快捷筛选（横线 Tab 样式） -->
        <div v-if="viewMode === 'offline'" class="offline-filter">
          <span class="offline-filter__label">离线时长：</span>
          <div class="offline-filter__group">
            <el-button
              v-for="item in offlineTimeOptions"
              :key="item.value === null ? 'all' : item.value"
              size="small"
              :class="['offline-filter__btn', { 'is-active': offlineTime === item.value }]"
              @click="handleOfflineTimeClick(item.value)"
            >
              {{ item.label }}
            </el-button>
          </div>
        </div>

        <pageTable :page="page" :data="list" :columns="tableColumns" :loading="loading" rowkey="bmsId"
          height="calc(100vh - 370px)" @GetData="GetData" @selectionChange="handleSelectionChange">
          <template #bmsId="{ row }">
            <el-button link class="bms-op-link" @click.stop="openDetail(row)">
              {{ row?.bmsId || "-" }}
            </el-button>
          </template>
          <template #cz="{ row }">
            <el-button link class="bms-op-link" @click="openDetail(row)">
              详情
            </el-button>
            <el-divider v-if="viewMode === 'all'" direction="vertical" />
            <el-button v-if="viewMode === 'all'" link class="bms-op-link" @click="goParamConfig(row)">
              参数配置
            </el-button>
          </template>
        </pageTable>
      </div>
    </div>
·
    <BatchConfigDialog v-model="batchConfigVisible" :initial-bms-ids="batchBmsIds" @success="GetData" />

    <ParamConfigDialog v-model="paramConfigVisible" :bms-id="paramConfigBmsId" @success="GetData" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-button+.el-button){
  margin-left: 0 !important;
  .el-button--small{
    padding: 0 10px !important;
  }
}
:deep(.el-button--small){
  padding: 0 3px !important;
}
.bms-device-list {
  display: flex;
  gap: 16px;
  // padding: 10px;
  margin: 10px 10px;
  box-sizing: border-box;
  background: var(--bms-bg);
}

.offline-filter {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  &__label {
    font-size: 15px;
    color: #fff;
    margin-right: 8px;
    white-space: nowrap;
  }

  &__group {
    display: flex;
    gap: 24px;
    padding-bottom: 4px;
  }

  &__btn {
    border: none;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    padding: 0 0 6px;
    font-size: 15px;
    color: #fff;
    border-bottom: 2px solid var(--bms-border);

    &.is-active {
      color: var(--bms-primary);
      border-bottom: 2px solid var(--bms-primary);
      font-weight: 500;
    }
  }
}

.bms-view-switch {
  display: flex;
  gap: 8px;
  margin: 0 20px 12px 0;
  .el-button{
    width: 80px;
    border-radius: 30px;
  }
}

/* 左侧组织树面板 */
.bms-org-tree-panel {
  width: 280px;
  min-width: 280px;
  background: var(--bms-bg-card);
  border-radius: 12px;
  border: 1px solid var(--bms-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.org-tree-header {
  padding: 20px;
  border-bottom: 1px solid var(--bms-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 150, 136, 0.05) 100%);
}

.org-tree-icon {
  width: 24px;
  height: 24px;
  color: var(--bms-primary);
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 188, 212, 0.2));
}

.org-tree-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bms-text);
  letter-spacing: 0.3px;
}

.org-tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 188, 212, 0.3);
    border-radius: 3px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 188, 212, 0.5);
    }
  }
}

.org-selected-info {
  padding: 14px 20px;
  border-top: 1px solid var(--bms-border);
  background: rgba(0, 188, 212, 0.06);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  .selected-icon {
    width: 16px;
    height: 16px;
    color: var(--bms-primary);
    flex-shrink: 0;
  }

  .selected-label {
    color: var(--bms-text-secondary);
  }

  .selected-value {
    color: var(--bms-primary);
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clear-icon {
    width: 16px;
    height: 16px;
    color: var(--bms-text-secondary);
    flex-shrink: 0;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #f56c6c;
    }
  }
}

/* 树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 2px 0;
  cursor: pointer;
}

.tree-node-icon {
  width: 18px;
  height: 18px;
  color: var(--bms-text-secondary);
  flex-shrink: 0;
  transition: color 0.2s ease;
}

/* 加载中图标旋转动画 */
.loading-icon {
  animation: rotate 1s linear infinite;
  color: var(--bms-primary);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.tree-node-label {
  font-size: 14px;
  color: var(--bms-text);
  transition: color 0.2s ease;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Element Plus Tree 深色主题适配 */
:deep(.el-tree) {
  background: transparent;
  color: var(--bms-text);

  .el-tree-node__content {
    background: transparent;
    border-radius: 8px;
    padding: 10px 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background: rgba(0, 188, 212, 0.08);

      .tree-node-label {
        color: var(--bms-primary);
      }

      .tree-node-icon {
        color: var(--bms-primary);
      }
    }
  }

  .el-tree-node.is-current>.el-tree-node__content {
    background: rgba(0, 188, 212, 0.12);

    .tree-node-label {
      color: var(--bms-primary);
      font-weight: 500;
    }

    .tree-node-icon {
      color: var(--bms-primary);
    }
  }

  .el-tree-node__expand-icon {
    color: var(--bms-text-secondary);
    font-size: 14px;
    transition: transform 0.2s ease, color 0.2s ease;

    &.is-leaf {
      color: transparent;
    }

    &:hover {
      color: var(--bms-primary);
    }
  }
}

/* 右侧设备内容区 */
.bms-device-content {
  flex: 1;
  min-width: 0;
}

.bms-card {
  background: var(--bms-bg-card);
  border-radius: 12px;
  padding: 15px 24px;
  border: 1px solid var(--bms-border);
  /* pageTable 无边框深色表头/行/hover/选中 */
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

.org-name-label {
  font-size: 13px;
  color: var(--bms-text-secondary);
}

.org-name-value {
  font-size: 13px;
  color: var(--bms-primary);
  font-weight: 500;
}

.bms-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 离线时长快捷筛选 */
.offline-filter {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--bms-text-secondary);
}

.offline-filter__label {
  margin-right: 8px;
}

.offline-filter__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 搜索区（TableSearch / Card）深色适配 */
.bms-device-list :deep(.el-card) {
  background: transparent;
  border: none;
  --el-card-border-color: none;
}

.bms-device-list :deep(.container-search) {
  color: var(--bms-text-secondary);
}

.bms-device-list :deep(.el-form-item__label),
.bms-device-list :deep(.el-input__inner),
.bms-device-list :deep(.el-select .el-select__wrapper) {
  color: var(--bms-text);
}

.bms-device-list :deep(.el-input__wrapper),
.bms-device-list :deep(.el-select .el-select__wrapper) {
  background: var(--bms-bg-input) !important;
  border-color: var(--bms-border);
}

.bms-device-list :deep(.el-button--primary) {
  background: var(--bms-primary);
  border-color: var(--bms-primary);
  color: var(--bms-text);
}

.bms-device-list :deep(.el-button--primary:hover) {
  background: var(--bms-primary-hover);
  border-color: var(--bms-primary-hover);
}

/* 表格由 pageTable 无边框样式 + 上方 .bms-card 的 --page-table-* 变量统一控制，此处仅保留文字色 */
.bms-device-list :deep(.el-table) {
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

/* 操作列链接：符合 BMS 主色、hover 反馈、cursor-pointer */
.bms-op-link {
  color: var(--bms-primary) !important;
  transition: color 0.2s ease;
  cursor: pointer;
}

.bms-op-link:hover {
  color: var(--bms-primary-hover, #26c6da) !important;
}

/* 隐藏 Element Plus 自带的懒加载 loading 图标，仅保留自定义的 loading 图标 */
:deep(.el-tree-node__loading-icon) {
  display: none;
}
</style>
