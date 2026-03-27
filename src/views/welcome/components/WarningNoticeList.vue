<template>
  <div class="warning-notice-card">
    <div class="card-header">
      <div class="title-wrapper">
        <div class="title-icon" />
        <h3 class="card-title">预警通知</h3>
        <!-- <span class="count-badge">{{ totalWarningDeviceCount }}台</span> -->
      </div>

      <div class="header-right">
        <!-- <div v-if="lastUpdateText" class="update-time">
          <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ lastUpdateText }}</span>
        </div> -->

        <el-button link class="more-btn" :disabled="loading" @click="goWarningList">更多</el-button>
      </div>
    </div>

    <div class="card-body">
      <!-- <div v-if="loading" class="state-text">加载中...</div> -->
      <div v-if="warningRows.length === 0" class="state-text">暂无预警</div>

      <div v-else class="notice-list">
        <div v-for="row in warningRows" :key="row.bmsId + String(row._timeMs)" class="notice-item">
          <div class="item-main">
            <el-button link class="bms-link" @click="goBmsMonitor(row)">
              {{ row.bmsId }}
            </el-button>
            <span class="item-time">{{ formatRowTime(row) }}</span>
          </div>

          <div class="item-tags">
            <span
              v-for="k in row._activeKeys.slice(0, 6)"
              :key="k"
              class="tag"
              :title="labelMap.get(k) ?? k"
            >
              {{ labelMap.get(k) ?? k }}
            </span>
            <span v-if="row._activeKeys.length > 6" class="tag tag-more">+{{ row._activeKeys.length - 6 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-glow" />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getWarningBmsListReq } from "@/api/bms";
import type { BmsWarningKey, BmsWarningListItem } from "@/api/bms/types";
import { warning_bit_config_value } from "@/utils/dict";
import { dateYMDHMS } from "@/utils/util";

defineOptions({ name: "WarningNoticeList" });

type WarningFlagValue = boolean | 0 | 1 | undefined | null;
type WarningFlagMap = Partial<Record<BmsWarningKey, WarningFlagValue>>;

interface WarningNoticeRow extends BmsWarningListItem {
  _activeKeys: BmsWarningKey[];
  _timeMs: number;
}

const router = useRouter();
const loading = ref(false);
const lastUpdateText = ref("");
const list = ref<BmsWarningListItem[]>([]);
let timer: number | null = null;

const warningKeys = warning_bit_config_value.map(i => i.value as BmsWarningKey);
const labelMap = new Map<BmsWarningKey, string>(
  warning_bit_config_value.map(i => [i.value as BmsWarningKey, i.label])
);

function normalizeToTimestampMs(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value < 1e12 ? value * 1000 : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!Number.isFinite(num)) return 0;
      return num < 1e12 ? num * 1000 : num;
    }
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isWarningActive(row: BmsWarningListItem, key: BmsWarningKey): boolean {
  const flag = (row as unknown as WarningFlagMap)[key];
  return flag === true || flag === 1;
}

function formatRowTime(row: BmsWarningListItem): string {
  const ms = normalizeToTimestampMs(row.time);
  return ms ? dateYMDHMS(ms) : "-";
}

function goBmsMonitor(row: BmsWarningListItem) {
  router.push({ name: "BmsManage", query: { bmsId: row.bmsId } });
}

function goWarningList() {
  router.push({ name: "WarningList" });
}

const warningRows = computed<WarningNoticeRow[]>(() => {
  const rows = list.value
    .map(row => {
      const activeKeys = warningKeys.filter(k => isWarningActive(row, k));
      return {
        ...row,
        _activeKeys: activeKeys,
        _timeMs: normalizeToTimestampMs(row.time)
      };
    })
    .filter(row => row._activeKeys.length > 0);

  rows.sort((a, b) => b._timeMs - a._timeMs);
  return rows;
});

const totalWarningDeviceCount = computed(() => warningRows.value.length);

async function loadWarningNotice() {
  if (loading.value) return;
  loading.value = true;

  // 大屏“预警通知”只展示最新一部分即可，避免进入页面时分页拉全量导致接口被连续调用多次
  const pageSize = 30;
  const res = await getWarningBmsListReq({ page: 1, pageSize });
  list.value = res.errno === 0 ? (res.data?.bmsList ?? []) : [];
  lastUpdateText.value = dateYMDHMS(Date.now());
  loading.value = false;
}

onMounted(async () => {
  await loadWarningNotice();
  timer = window.setInterval(loadWarningNotice, 60 * 1000);
});

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped lang="scss">
.warning-notice-card {
  --card-padding: clamp(12px, 1.1vw, 18px);
  --text-sm: clamp(12px, 0.85vw, 13px);
  --text-md: clamp(14px, 1vw, 16px);
  --list-max-h: clamp(200px, 32vh, 360px);
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 20px;
  padding: var(--card-padding);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #ff9500 25%, #ff6b9d 50%, #ffd93d 75%, transparent 100%);
    opacity: 0.85;
  }

  &:hover {
    border-color: rgba(88, 166, 255, 0.6);
    box-shadow: 0 8px 32px rgba(0, 217, 255, 0.15);
    transform: translateY(-2px);
    .card-glow {
      opacity: 0.55;
    }
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 149, 0, 0.14) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.title-icon {
  width: 6px;
  height: 24px;
  background: linear-gradient(180deg, #ff9500 0%, #ff6b9d 100%);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(255, 149, 0, 0.55);
}

.card-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.count-badge {
  font-size: var(--text-sm);
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 149, 0, 0.12);
  border: 1px solid rgba(255, 149, 0, 0.28);
  color: rgba(230, 237, 243, 0.9);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 10px;
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.7);
  white-space: nowrap;
}

.time-icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 149, 0, 0.95);
}

.more-btn {
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.85);
}

.card-body {
  position: relative;
  min-height: 250px;
}

.state-text {
  padding: clamp(12px, 1.1vw, 18px) 8px;
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.65);
 text-align: center;

}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 0.8vw, 10px);
  height: var(--list-max-h);
  overflow: auto;
  padding-right: 6px;
}

.notice-item {
  padding: clamp(10px, 1vw, 12px) clamp(10px, 1vw, 12px) clamp(8px, 0.9vw, 10px);
  background: rgba(10, 14, 23, 0.55);
  border: 1px solid rgba(88, 166, 255, 0.16);
  border-radius: 14px;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(88, 166, 255, 0.3);
    background: rgba(10, 14, 23, 0.7);
  }
}

.item-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.bms-link {
  font-weight: 700;
  font-size: var(--text-sm);
  color: #00d9ff;
}

.item-time {
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.6);
  white-space: nowrap;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  font-size: var(--text-sm);
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 149, 0, 0.12);
  border: 1px solid rgba(255, 149, 0, 0.28);
  color: rgba(230, 237, 243, 0.88);
}

.tag-more {
  background: rgba(0, 217, 255, 0.1);
  border-color: rgba(0, 217, 255, 0.25);
}
</style>


