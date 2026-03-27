<template>
  <div class="province-city-dialog">
    <div class="dialog-header">
      <div class="title">
        <span class="title-main">{{ provinceName }}</span>
        <span class="title-sub">市级设备数量</span>
      </div>
      <div class="summary">
        <div class="summary-item">
          <span class="label">合计</span>
          <span class="value">{{ total }}</span>
        </div>
        <div class="summary-item">
          <span class="label">城市数</span>
          <span class="value">{{ rows.length }}</span>
        </div>
      </div>
    </div>

    <div class="toolbar">
      <el-input v-model="keyword" clearable placeholder="搜索城市" class="search" />
      <!-- <el-segmented v-model="sortKey" :options="sortOptions" size="small" class="sort" /> -->
    </div>

    <div class="list-panel">
      <el-scrollbar height="420">
        <div v-if="filteredRows.length" class="city-list">
          <div v-for="(item, idx) in filteredRows" :key="`${item.city}-${idx}`" class="city-row">
            <div class="left">
              <span class="index">{{ idx + 1 }}</span>
              <div class="meta">
                <div class="city">{{ item.city }}</div>
                <div class="bar">
                  <div class="bar-fill" :style="{ width: `${getPercent(item.count)}%` }" />
                </div>
              </div>
            </div>
            <div class="right">
              <div class="count">{{ item.count }}</div>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <div class="empty-title">暂无匹配城市</div>
          <div class="empty-desc">试试换个关键词，或清空搜索条件。</div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

defineOptions({
  name: "ProvinceCityCountDialog"
});

interface CityRow {
  city: string;
  count: number;
}

const props = defineProps<{
  provinceName: string;
  rows: CityRow[];
}>();

const keyword = ref("");
const sortKey = ref<"countDesc" | "countAsc" | "nameAsc">("countDesc");

const sortOptions = [
  { label: "数量↓", value: "countDesc" },
  { label: "数量↑", value: "countAsc" },
];

const total = computed(() => props.rows.reduce((sum, r) => sum + (r.count || 0), 0));
const maxCount = computed(() => props.rows.reduce((m, r) => Math.max(m, r.count || 0), 0));

const filteredRows = computed(() => {
  const kw = keyword.value.trim();
  let list = props.rows;
  if (kw) list = list.filter(r => r.city.includes(kw));

  const next = [...list];
  if (sortKey.value === "countAsc") next.sort((a, b) => a.count - b.count);
  if (sortKey.value === "countDesc") next.sort((a, b) => b.count - a.count);
  if (sortKey.value === "nameAsc") next.sort((a, b) => a.city.localeCompare(b.city, "zh-Hans-CN"));
  return next;
});

function getPercent(count: number) {
  const max = maxCount.value || 1;
  return Math.max(6, Math.round((count / max) * 100));
}
</script>

<style scoped lang="scss">
.province-city-dialog {
  background: #ffffff;
  color: #111827;
  padding: 12px 12px 10px;
  border-radius: 14px;
}

.dialog-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;

  .title {
    color: #111827;
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }

  .title-main {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title-sub {
    font-size: 12px;
    font-weight: 600;
    color: rgba(17, 24, 39, 0.6);
  }

  .summary {
    display: flex;
    gap: 10px;
    flex: none;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 8px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #ffffff;

    .label {
      font-size: 11px;
      color: rgba(17, 24, 39, 0.6);
      line-height: 1.1;
    }

    .value {
      font-size: 14px;
      font-weight: 900;
      color: #111827;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
    }
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f9fafb;
}

.search {
  flex: 1;
  min-width: 0;
}

.sort {
  flex: none;
}

.list-panel {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f9fafb;
  padding: 10px;
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 6px;
}

.city-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.index {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f3f4f6;
  color: rgba(17, 24, 39, 0.75);
  font-size: 12px;
  font-weight: 700;
  flex: none;
}

.meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.city {
  color: #111827;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar {
  width: min(420px, 44vw);
  max-width: 420px;
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.85) 100%);
}

.right {
  flex: none;
}

.count {
  flex: none;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.empty {
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(17, 24, 39, 0.65);
  background: #ffffff;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
}

.empty-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.empty-desc {
  font-size: 12px;
}

:deep(.el-scrollbar__bar) {
  opacity: 1;
}

:deep(.el-scrollbar__thumb) {
  background-color: rgba(17, 24, 39, 0.18);
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
}

:deep(.el-segmented) {
  --el-segmented-bg-color: #f3f4f6;
  --el-segmented-item-selected-bg-color: #ffffff;
  --el-segmented-item-selected-color: #111827;
  --el-segmented-border-color: #e5e7eb;
  border-radius: 12px;
}
</style>
