
<template>
  <div class="warning-list">
    <div class="stats-header">
      <div class="stats-title">告警类型统计</div>
      <div v-if="warningStaticsUpdateTime" class="stats-time">
        数据统计时间：{{ warningStaticsUpdateTime }}
      </div>
    </div>
    <div class="stats-container stats-container--warning-types">
      <div v-for="group in warningStaticsGroupList" :key="group.key" class="stat-card stat-card--warning-group">
        <div class="stat-content">
          <div class="stat-label">{{ group.title }}</div>
          <div class="stat-tags">
            <span v-for="child in group.children" :key="child.value" class="stat-tag"
              :class="{ 'stat-tag--active': currentWarningType === child.value }"
              @click="handleWarningTypeClick(child.value as BmsWarningKey)">
              {{ child.label }}：{{ child.count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="warning-list-card">
      <!-- <div class="card-header">
        <div class="card-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>告警监控</span>
        </div>
      </div> -->

      <TableSearch :form-item="searchItems" page-name="warningList" :default-form-data="searchDefaultForm"
        @query-btn="handleSearch" @reset-btn="handleReset" />

      <pageTable :page="page" :data="list" :columns="columns" :loading="loading" rowkey="bmsId" notauto
        height="calc(100vh - 440px)" @GetData="GetData">
        <template #bmsId="{ row }">
          <el-button link class="bms-link" @click="goBmsMonitor(row as BmsWarningListItem)">
            {{ (row as BmsWarningListItem).bmsId }}
          </el-button>
        </template>
        <template #time="{ row }">
          {{ formatWarningTime(row as BmsWarningListItem) }}
        </template>
        <template v-for="item in warning_bit_config_value" :key="item.value" v-slot:[item.value]="{ row }">
          <div
            class="warning-cell"
            :class="{
              'warning-cell--active': !!row[item.value],
              'warning-cell--normal': !row[item.value] && !hasAnyWarning(row),
              'warning-cell--inactive': !row[item.value] && hasAnyWarning(row)
            }"
          >
            <span class="status-dot"></span>
            <span class="status-text">
              {{ row[item.value] ? '是' : '否' }}
            </span>
          </div>
        </template>
      </pageTable>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getWarningBmsListReq, getWarningStaticsReq } from "@/api/bms";
import type { BmsWarningKey, BmsWarningListItem, BmsWarningStatisticsMap } from "@/api/bms/types";
import { warning_bit_config_value } from "@/utils/dict";
import { dateYMDHMS } from "@/utils/util";
import useTableWithForm from "@/hooks/useTableWithForm";

defineOptions({
  name: "WarningList"
});

// ==================== Hooks ====================
/**
 * 表格与表单集成
 * 处理数据加载、分页、搜索等功能
 */
interface WarningSearchForm {
  bmsId?: string;
  warningType?: BmsWarningKey;
}

type WarningListQueryParams = WarningSearchForm & {
  currentPage?: number;
  pageSize?: number;
};

/**
 * 统一处理后端时间字段：
 * - number: 兼容秒/毫秒
 * - string: 兼容纯数字时间戳 / Date 可解析字符串
 */
function normalizeToDateInput(value: unknown): number | string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!Number.isFinite(num)) return null;
      return num < 1e12 ? num * 1000 : num;
    }
    return trimmed;
  }
  return null;
}

const router = useRouter();
const route = useRoute();

function formatWarningTime(row: BmsWarningListItem): string {
  const input = normalizeToDateInput(row.time);
  return input ? dateYMDHMS(input) : "-";
}

function goBmsMonitor(row: BmsWarningListItem) {
  router.push({ name: "BmsManage", query: { bmsId: row.bmsId } });
}

function hasAnyWarning(row: Record<string, unknown>): boolean {
  return warning_bit_config_value.some(item => Boolean(row[item.value]));
}

const {
  dataList: list,
  page,
  loading,
  searchForm,
  GetData,
  handleSearch,
  handleReset
} = useTableWithForm({
  apiFunction: getWarningBmsListReq,
  dataMapping: {
    listField: 'bmsList',
    totalField: 'total'
  },
  paramsTransform: (params: WarningListQueryParams & Record<string, unknown>) => {
    const { currentPage, pageSize, warningType, ...otherParams } = params;
    const requestParams: Record<string, unknown> = {
      page: currentPage || 1,
      pageSize: pageSize || 20
    };

    // 如果选择了告警类型，将对应的字段设置为 true
    if (warningType) {
      requestParams[warningType] = true;
    }

    // 添加其他搜索参数
    Object.entries(otherParams).forEach(([key, value]) => {
      // 过滤 undefined、null、空字符串，但保留 0 和 false
      if (value !== undefined && value !== null && value !== "") requestParams[key] = value;
    });

    return requestParams;
  },
  autoLoad: false
});

const searchDefaultForm = ref<WarningSearchForm>({});

function isValidWarningType(value: unknown): value is BmsWarningKey {
  if (typeof value !== "string") return false;
  return warning_bit_config_value.some(item => item.value === value);
}

function applyRouteQueryAndSearch() {
  const { warningType, bmsId } = route.query as Partial<Record<keyof WarningListQueryParams, unknown>>;

  const nextForm: WarningSearchForm = {};
  if (typeof bmsId === "string" && bmsId.trim()) nextForm.bmsId = bmsId.trim();
  if (isValidWarningType(warningType)) nextForm.warningType = warningType;

  // 回填 TableSearch，并触发查询（会重置到第一页）
  searchDefaultForm.value = { ...nextForm };
  handleSearch(nextForm);
}

/**
 * 顶部告警类型点击筛选
 * 再次点击同一类型则取消该类型筛选
 */
const handleWarningTypeClick = (warningType: BmsWarningKey) => {
  const currentForm = searchForm.value as WarningSearchForm;
  const isSameType = currentForm.warningType === warningType;

  const nextForm: WarningSearchForm = {
    ...currentForm,
    // 相同则置为 undefined，等于清空；否则设置为当前点击类型
    warningType: isSameType ? undefined : warningType
  };

  // 驱动下方 TableSearch 表单联动
  searchDefaultForm.value = nextForm;

  // 触发搜索
  handleSearch(nextForm);
};

const currentWarningType = computed<BmsWarningKey | undefined>(() => {
  return (searchForm.value as { warningType?: BmsWarningKey }).warningType;
});

// ==================== 配置项 ====================
const searchItems = [
  { label: "设备ID", field: "bmsId", type: "input" as const },
  {
    label: "告警类型",field: "warningType",type: "select" as const,
    selectOption: warning_bit_config_value.map(item => ({
      value: item.value,
      label: item.label
    }))
  }
];

/**
 * 获取告警统计
 */
const warningStatics = ref<BmsWarningStatisticsMap | null>(null);
const warningStaticsUpdateTime = ref<string>("");

/**
 * 顶部告警类型统计分组（减少卡片数量，按大类汇总）
 */
const warningTypeGroups: Array<{
  key: string;
  title: string;
  items: BmsWarningKey[];
}> = [
    {
      key: "voltage",
      title: "电压类告警",
      items: ["cov", "cuv", "bov", "buv"]
    },
    {
      key: "current",
      title: "电流类告警",
      items: ["dsc", "doc1", "doc2", "coc1", "coc2"]
    },
    {
      key: "temperature",
      title: "温度类告警",
      items: ["dot", "dut", "cot", "cut", "mot"]
    },
    {
      key: "hardware",
      title: "硬件/通信类告警",
      items: ["afelost", "ntclost", "celllost", "cmosfault", "dmosfault"]
    }
  ];

const warningStaticsGroupList = computed(() => {
  return warningTypeGroups.map(group => {
    const children = group.items
      .map(itemKey => {
        const config = warning_bit_config_value.find(cfg => cfg.value === itemKey);
        if (!config) return null;

        const count =
          warningStatics.value?.[itemKey as keyof BmsWarningStatisticsMap] ?? 0;

        return {
          ...config,
          count
        };
      })
      .filter(
        (child): child is { bit: number; label: string; value: string; count: number } =>
          child !== null
      );

    const total = children.reduce((sum, child) => sum + child.count, 0);

    return {
      key: group.key,
      title: group.title,
      total,
      children
    };
  });
});

async function loadWarningStatics() {
  const res = await getWarningStaticsReq();
  if (res.errno === 0 && res.data?.statistics) {
    warningStatics.value = res.data.statistics;
    warningStaticsUpdateTime.value = dateYMDHMS(res.data.update_time);
  }
}

onMounted(() => {
  loadWarningStatics();

  // 兼容从其他页面带 query 跳转（如：总览点击某类告警）
  if (route.query?.warningType || route.query?.bmsId) {
    applyRouteQueryAndSearch();
  } else {
    GetData();
  }
});

watch(
  () => route.query,
  (q, prevQ) => {
    // 同一路由下通过 query 变化进行筛选（避免重复触发）
    if (q.warningType === prevQ?.warningType && q.bmsId === prevQ?.bmsId) return;
    if (q.warningType || q.bmsId) applyRouteQueryAndSearch();
  }
);

const warningColumns = warning_bit_config_value.map(item => ({
  label: item.label,
  prop: item.value,
  minWidth: 60,
  align: "center",
  slots: item.value
}));

const columns = [
  { label: "设备ID", prop: "bmsId", width: 180, slots: "bmsId" },
  { label: "更新时间", prop: "time", width: 150, slots: "time" },
  ...warningColumns
];
</script>

<style scoped lang="scss">
.warning-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  gap: 10px;
}

/* ==================== 统计卡片 ==================== */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding: 0 2px;
}

.stats-title {
  font-size: 14px;
  font-weight: 600;
  color: #e6edf3;
}

.stats-time {
  font-size: 12px;
  color: rgba(230, 237, 243, 0.6);
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  // animation: slideDown 0.5s ease-out;
}

.stats-container--warning-types {
  margin-bottom: 4px;
}

// @keyframes slideDown {
//   from {
//     opacity: 0;
//     transform: translateY(-20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(28, 33, 40, 0.95) 0%, rgba(28, 33, 40, 0.8) 100%);
  border: 1px solid rgba(88, 166, 255, 0.15);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    // background: linear-gradient(90deg, transparent, currentColor, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    // box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
    // border-color: currentColor;

    &::before {
      opacity: 1;
    }

    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.stat-card--total {
  color: #58a6ff;

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(88, 166, 255, 0.1) 0%, transparent 70%);
  }
}

.stat-card--warning {
  color: #ff9500;

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(255, 149, 0, 0.1) 0%, transparent 70%);
  }
}

.stat-card--warning-type {
  color: #ffb84d;
  padding: 16px 18px;

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}

.stat-card--warning-group {
  // color: #ffb84d;
  padding: 18px 20px;

  .stat-label {
    font-size: 13px;
  }

  .stat-value {
    font-size: 26px;
    margin-bottom: 6px;
  }
}

.stat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.stat-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 149, 0, 0.12);
  border: 1px solid rgba(255, 149, 0, 0.3);
  font-size: 12px;
  color: rgba(230, 237, 243, 0.85);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 184, 77, 0.22);
    border-color: rgba(255, 184, 77, 0.6);
  }
}

.stat-tag--active {
  background: linear-gradient(135deg, rgba(255, 184, 77, 0.55) 0%, rgba(255, 149, 0, 0.45) 100%);
  border-color: rgba(255, 214, 128, 0.95);
  color: #ffffff;
  font-weight: 700;
  box-shadow:
    0 0 0 1px rgba(255, 214, 128, 0.55) inset,
    0 6px 14px rgba(255, 149, 0, 0.22),
    0 0 18px rgba(255, 184, 77, 0.28);
  transform: translateY(-1px);
}

.stat-card--normal {
  color: #34d399;

  &::after {
    content: '';
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%);
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    width: 28px;
    height: 28px;
    color: currentColor;
  }
}

.stat-content {
  flex: 1;
  z-index: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(230, 237, 243, 0.6);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #e6edf3;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* ==================== 主卡片 ==================== */
.warning-list-card {
  flex: 1;
  background: var(--bms-bg-card);
  border-radius: 12px;
  padding: 10px 24px;
  border: 1px solid var(--bms-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  --page-table-header-bg: var(--bms-bg);
  --page-table-header-color: var(--bms-text);
  --page-table-row-bg: var(--bms-bg-input);
  --page-table-row-striped-bg: var(--bms-bg-input);
  --page-table-row-hover-bg: #2d333b;
  --page-table-active-row-bg: #2d333b;
  --page-table-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

// @keyframes fadeIn {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }

.card-header {
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;

  .title-icon {
    width: 24px;
    height: 24px;
    color: #ff9500;
    filter: drop-shadow(0 0 8px rgba(255, 149, 0, 0.4));
  }
}

/* ==================== 告警列单元格 ==================== */
.warning-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 0;
}

.warning-cell--active {
  color: #ff3300;
}

.warning-cell--inactive {
  color: rgba(148, 163, 184, 0.9);
}

.warning-cell--normal {
  color: #34d399;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.7);
}

.warning-cell--active .status-dot {
  background: #ff3300;
  box-shadow: 0 0 6px rgba(255, 51, 0, 0.8);
}

.warning-cell--normal .status-dot {
  background: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.5);
}

.status-text {
  font-size: 13px;
}

/* ==================== 深色主题适配 ==================== */
.warning-list :deep(.el-card) {
  background: transparent;
  border: none;
  --el-card-border-color: none;
}

.warning-list :deep(.container-search) {
  color: var(--bms-text-secondary);
}

.warning-list :deep(.el-form-item__label),
.warning-list :deep(.el-input__inner),
.warning-list :deep(.el-select .el-select__wrapper) {
  color: var(--bms-text);
}

.warning-list :deep(.el-input__wrapper),
.warning-list :deep(.el-select .el-select__wrapper) {
  background: var(--bms-bg-input) !important;
  border-color: var(--bms-border);
}

.warning-list :deep(.el-button--primary) {
  background: var(--bms-primary);
  border-color: var(--bms-primary);
}

.warning-list :deep(.el-button--primary:hover) {
  background: var(--bms-primary-hover);
  border-color: var(--bms-primary-hover);
}

.warning-list :deep(.el-button) {
  transition: all 0.3s ease;
}

/* 表格样式增强 */
.warning-list :deep(.el-table) {
  --el-table-text-color: var(--bms-text) !important;

  .el-table__row {
    height: auto !important;
  }

  // 覆盖 pageTable 组件的限制，允许内容换行和撑开
  .el-table__cell {
    padding: 0 !important;
    overflow: visible !important;
    height: auto !important;

    .cell {
      max-height: none !important;
      overflow: visible !important;
      white-space: normal !important;
      line-height: 1.5;
      word-break: break-word;
      padding: 5px !important;
    }
  }
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
</style>
