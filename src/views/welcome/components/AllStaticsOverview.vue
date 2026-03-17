<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { EChartsOption } from "echarts";
import echarts from "@/plugins/echarts";
import type { BmsGetAllstaticsRes } from "@/api/bms/types";
import { dateYMDHMS } from "@/utils/util";

defineOptions({ name: "AllStaticsOverview" });

type AllStaticsData = NonNullable<BmsGetAllstaticsRes["data"]>;

interface Props {
  allStaticsData: AllStaticsData | null;
}

const props = defineProps<Props>();

const updateTimeText = computed(() => {
  const t = props.allStaticsData?.update_time;
  return typeof t === "number" ? dateYMDHMS(t) : "";
});

const nowOffline = computed(() => pickValue(props.allStaticsData?.offline, "now"));
const nowExpired = computed(() => pickValue(props.allStaticsData?.expired, "now"));
const nowNogps = computed(() => pickValue(props.allStaticsData?.nogps, "now"));
const nowAbnormalTotal = computed(() => nowOffline.value + nowExpired.value + nowNogps.value);

type TimeKey = "now" | "day" | "week" | "month";

function pickValue(source: unknown, key: TimeKey): number {
  if (!source || typeof source !== "object") return 0;
  const v = (source as Record<string, unknown>)[key];
  return typeof v === "number" ? v : 0;
}

const chartRef = ref<HTMLDivElement | null>(null);
type EChartsInstance = ReturnType<typeof echarts.init>;
let chartInstance: EChartsInstance | null = null;

const chartOption = computed<EChartsOption>(() => {
  // 后端维度含义：day=今日，week=近7天，month=近1月，now=当前
  const categories = [ "今日", "近7天", "近1月"];
  const offline = [
    pickValue(props.allStaticsData?.offline, "day"),
    pickValue(props.allStaticsData?.offline, "week"),
    pickValue(props.allStaticsData?.offline, "month")
  ];
  const expired = [
    null, // 接口无 day 维度，用缺失值展示
    pickValue(props.allStaticsData?.expired, "week"),
    pickValue(props.allStaticsData?.expired, "month")
  ];
  const nogps = [
    pickValue(props.allStaticsData?.nogps, "day"),
    pickValue(props.allStaticsData?.nogps, "week"),
    pickValue(props.allStaticsData?.nogps, "month")
  ];

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 10, right: 10, top: 52, bottom: 12, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(88, 166, 255, 0.5)",
      borderWidth: 1,
      textStyle: { color: "#e6edf3", fontSize: 12 },
      valueFormatter: value => (typeof value === "number" ? `${value} 台` : "—")
    },
    legend: {
      top: 10,
      left: 10,
      itemWidth: 12,
      itemHeight: 6,
      itemGap: 14,
      textStyle: { color: "rgba(230, 237, 243, 0.75)", fontSize: 12 }
    },
    xAxis: {
      type: "category",
      data: categories,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "rgba(88, 166, 255, 0.25)" } },
      axisLabel: { color: "rgba(230, 237, 243, 0.7)", fontSize: 12 },
      boundaryGap: true
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      splitLine: { lineStyle: { color: "rgba(88, 166, 255, 0.12)" } },
      axisLabel: { color: "rgba(230, 237, 243, 0.6)", fontSize: 12 }
     },
    series: [
      {
        name: "离线",
        type: "bar",
        data: offline,
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255, 217, 61, 0.95)" },
              { offset: 1, color: "rgba(255, 217, 61, 0.20)" }
            ]
          }
        }
      },
      {
        name: "到期",
        type: "bar",
        data: expired,
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(255, 0, 60, 0.95)" },
              { offset: 1, color: "rgba(255, 0, 60, 0.18)" }
            ]
          }
        }
      },
      {
        name: "无定位",
        type: "bar",
        data: nogps,
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0, 217, 255, 0.95)" },
              { offset: 1, color: "rgba(0, 217, 255, 0.18)" }
            ]
          }
        }
      }
    ]
  };

  return option;
});

function initChart() {
  const el = chartRef.value;
  if (!el) return;
  chartInstance = echarts.init(el);
  chartInstance.setOption(chartOption.value, true);
}

function updateChart() {
  if (!chartInstance) return;
  chartInstance.setOption(chartOption.value, true);
}

function resizeChart() {
  chartInstance?.resize();
}

onMounted(() => {
  initChart();
  window.addEventListener("resize", resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

watch(
  () => props.allStaticsData,
  () => updateChart(),
  { deep: true }
);
</script>

<template>
  <div class="all-statics-card">
    <div class="card-header">
      <div class="title-wrapper">
        <div class="title-icon" />
        <h3 class="card-title">设备状态统计</h3>
      </div>

      <div class="header-right">
        <!-- <button class="refresh-btn" type="button" :disabled="dashboardStore.loading" @click="dashboardStore.fetchAllStatics">
          <svg class="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke-width="2" stroke-linecap="round" />
            <path d="M21 3v7h-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ dashboardStore.loading ? "刷新中" : "刷新" }}</span>
        </button> -->

        <div v-if="updateTimeText" class="update-time">
          <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ updateTimeText }}</span>
        </div>
      </div>
    </div>

    <!-- <div v-if="dashboardStore.errorMessage" class="error-row">
      <span class="error-text">{{ dashboardStore.errorMessage }}</span>
      <button class="retry-btn" type="button" @click="dashboardStore.fetchAllStatics">重试</button>
    </div> -->

    <div class="card-body">
      <div class="kpi-row">
        <div class="kpi-item kpi-total" title="当前异常总量（离线 + 到期 + 无定位）">
          <div class="kpi-label">当前异常</div>
          <div class="kpi-value">{{ nowAbnormalTotal }}<span class="kpi-unit">台</span></div>
        </div>

        <div class="kpi-item kpi-offline">
          <div class="kpi-label">离线</div>
          <div class="kpi-value">{{ nowOffline }}<span class="kpi-unit">台</span></div>
        </div>

        <div class="kpi-item kpi-expired">
          <div class="kpi-label">到期</div>
          <div class="kpi-value">{{ nowExpired }}<span class="kpi-unit">台</span></div>
        </div>

        <div class="kpi-item kpi-nogps">
          <div class="kpi-label">无定位</div>
          <div class="kpi-value">{{ nowNogps }}<span class="kpi-unit">台</span></div>
        </div>
      </div>

      <div class="chart-wrap">
        <div class="chart-scanlines" />
        <div class="chart-corners">
          <i class="corner corner-tl" />
          <i class="corner corner-tr" />
          <i class="corner corner-bl" />
          <i class="corner corner-br" />
        </div>
        <div ref="chartRef" class="chart-container" />
      </div>
    </div>

    <div class="card-glow" />
  </div>
</template>

<style scoped lang="scss">
@keyframes scanMove {
  0% {
    transform: translateY(-20%);
    opacity: 0.25;
  }
  50% {
    opacity: 0.45;
  }
  100% {
    transform: translateY(20%);
    opacity: 0.25;
  }
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.kpi-item {
  --kpi-accent-rgb: 0, 217, 255;
  position: relative;
  border-radius: 14px;
  padding: 10px 10px 9px;
  background:
    radial-gradient(circle at 18% 0%, rgba(var(--kpi-accent-rgb), 0.22) 0%, transparent 55%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.55) 100%);
  border: 1px solid rgba(88, 166, 255, 0.18);
  overflow: hidden;
  transition: all 0.25s ease;
  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(230, 237, 243, 0.06),
    inset 0 0 0 1px rgba(0, 217, 255, 0.06);
  backdrop-filter: blur(8px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(230, 237, 243, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(230, 237, 243, 0.04) 1px, transparent 1px);
    background-size: 18px 18px;
    opacity: 0.22;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(var(--kpi-accent-rgb), 0.85) 50%, transparent 100%);
    opacity: 0.6;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(var(--kpi-accent-rgb), 0.35);
    box-shadow:
      0 14px 34px rgba(0, 0, 0, 0.34),
      0 0 22px rgba(var(--kpi-accent-rgb), 0.12),
      inset 0 1px 0 rgba(230, 237, 243, 0.08),
      inset 0 0 0 1px rgba(var(--kpi-accent-rgb), 0.08);
  }
}

.kpi-total {
  --kpi-accent-rgb: 0, 255, 163;
}
.kpi-offline {
  --kpi-accent-rgb: 255, 217, 61;
}
.kpi-expired {
  --kpi-accent-rgb: 255, 0, 60;
}
.kpi-nogps {
  --kpi-accent-rgb: 0, 217, 255;
}

.kpi-label {
  position: relative;
  font-size: 12px;
  color: rgba(230, 237, 243, 0.72);
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.kpi-value {
  position: relative;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
}

.kpi-unit {
  margin-left: 6px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(230, 237, 243, 0.55);
}

.kpi-total .kpi-value {
  color: #00FFA3;
  text-shadow: 0 0 18px rgba(0, 255, 163, 0.22);
}
.kpi-offline .kpi-value {
  color: #FFD93D;
  text-shadow: 0 0 18px rgba(255, 217, 61, 0.26);
}
.kpi-expired .kpi-value {
  color: #FF003C;
  text-shadow: 0 0 18px rgba(255, 0, 60, 0.22);
}
.kpi-nogps .kpi-value {
  color: #00D9FF;
  text-shadow: 0 0 18px rgba(0, 217, 255, 0.22);
}

.chart-scanlines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    to bottom,
    rgba(230, 237, 243, 0.04) 1px,
    transparent 1px
  );
  background-size: 100% 6px;
  opacity: 0.35;
  mix-blend-mode: screen;
  pointer-events: none;
  animation: scanMove 6s ease-in-out infinite;
}

.chart-corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(0, 217, 255, 0.35);
  filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.15));
}

.corner-tl {
  top: 8px;
  left: 8px;
  border-right: 0;
  border-bottom: 0;
  border-top-left-radius: 6px;
}
.corner-tr {
  top: 8px;
  right: 8px;
  border-left: 0;
  border-bottom: 0;
  border-top-right-radius: 6px;
}
.corner-bl {
  bottom: 8px;
  left: 8px;
  border-right: 0;
  border-top: 0;
  border-bottom-left-radius: 6px;
}
.corner-br {
  bottom: 8px;
  right: 8px;
  border-left: 0;
  border-top: 0;
  border-bottom-right-radius: 6px;
}

.all-statics-card {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 20px;
  padding: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #00D9FF 25%, #00FFA3 50%, #FFD93D 75%, transparent 100%);
    opacity: 0.8;
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
  background: radial-gradient(circle, rgba(0, 217, 255, 0.14) 0%, transparent 70%);
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
  gap: 12px;
  min-width: 0;
}

.title-icon {
  width: 6px;
  height: 24px;
  background: linear-gradient(180deg, #00D9FF 0%, #00FFA3 100%);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.6);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(88, 166, 255, 0.25);
  background: rgba(15, 23, 42, 0.6);
  color: rgba(230, 237, 243, 0.85);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(88, 166, 255, 0.45);
    background: rgba(15, 23, 42, 0.8);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.refresh-icon {
  width: 14px;
  height: 14px;
  color: rgba(0, 217, 255, 0.9);
}

.update-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
  color: rgba(230, 237, 243, 0.7);
  white-space: nowrap;
}

.time-icon {
  width: 14px;
  height: 14px;
  color: rgba(0, 217, 255, 0.8);
}

.error-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: rgba(255, 0, 60, 0.08);
  border: 1px solid rgba(255, 0, 60, 0.25);
  border-radius: 12px;
}

.error-text {
  font-size: 12px;
  color: rgba(230, 237, 243, 0.9);
}

.retry-btn {
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 0, 60, 0.35);
  background: rgba(255, 0, 60, 0.12);
  color: #ff6b9d;
  font-size: 12px;
  cursor: pointer;
}

.card-body {
  position: relative;
}

.chart-wrap {
  position: relative;
  background: radial-gradient(circle at 50% 40%, rgba(0, 217, 255, 0.12) 0%, rgba(10, 14, 23, 0.35) 55%, rgba(10, 14, 23, 0.55) 100%);
  border: 1px solid rgba(88, 166, 255, 0.18);
  border-radius: 16px;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 220px;
  padding: 4px 6px 0;
}
</style>


