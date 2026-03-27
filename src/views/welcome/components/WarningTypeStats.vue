<template>
  <div class="warning-stats-wrapper">
    <div class="warning-stats-card">
      <div class="card-header">
        <div class="header-left">
          <div class="title-wrapper">
            <div class="title-icon" />
            <h3 class="card-title">电压电流类统计</h3>
          </div>
        </div>
        <div v-if="updateTime" class="update-time">
          <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ updateTime }}</span>
        </div>
      </div>

      <div class="card-body">
        <div ref="chartRef1" class="chart-container" />
      </div>

      <div class="card-glow" />
    </div>

    <div class="warning-stats-card">
      <div class="card-header">
        <div class="header-left">
          <div class="title-wrapper">
            <div class="title-icon" />
            <h3 class="card-title">温度故障类统计</h3>
          </div>
        </div>
        <div v-if="updateTime" class="update-time">
          <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>{{ updateTime }}</span>
        </div>
      </div>
      <div class="card-body">
        <div ref="chartRef2" class="chart-container" />
      </div>

      <div class="card-glow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import type { EChartsOption } from "echarts";
import echarts from "@/plugins/echarts";
import type { BmsWarningKey, BmsWarningStatisticsMap } from "@/api/bms/types";
import { warning_bit_config_value } from "@/utils/dict";

defineOptions({
  name: "WarningTypeStats"
});

interface Props {
  warningStatics: BmsWarningStatisticsMap | null;
  updateTime: string;
  currentType?: BmsWarningKey;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "selectType", warningType: BmsWarningKey): void;
}>();

const totalWarningCount = computed(() => {
  if (!props.warningStatics) return 0;
  return (Object.keys(props.warningStatics) as BmsWarningKey[]).reduce((sum, key) => {
    return sum + (props.warningStatics?.[key] ?? 0);
  }, 0);
});

const chartRef1 = ref<HTMLDivElement | null>(null);
const chartRef2 = ref<HTMLDivElement | null>(null);
type EChartsInstance = ReturnType<typeof echarts.init>;
let chartInstance1: EChartsInstance | null = null;
let chartInstance2: EChartsInstance | null = null;
let rafResizeId = 0;

interface WarningPieItem {
  name: string;
  value: number;
  rawValue: number;
  valueKey: BmsWarningKey;
}

const warningPieList = computed<WarningPieItem[]>(() => {
  const list: WarningPieItem[] = warning_bit_config_value.map(cfg => {
    const count = props.warningStatics?.[cfg.value as keyof BmsWarningStatisticsMap] ?? 0;
    return {
      name: cfg.label,
      value: count,
      rawValue: count,
      valueKey: cfg.value as BmsWarningKey
    };
  });

  const total = list.reduce((sum, item) => sum + item.value, 0);
  return total === 0 ? list.map(item => ({ ...item, value: 1 })) : list;
});

const warningPieListGroups = computed<WarningPieItem[][]>(() => {
  const list = [...warningPieList.value];

  // 将“电芯放电高温”单独放到下方图表
  const dotIndex = list.findIndex(item => item.valueKey === "dot");

  if (dotIndex !== -1) {
    const [dotItem] = list.splice(dotIndex, 1);
    const middle = Math.ceil(list.length / 2);
    const topGroup = list.slice(0, middle);
    const bottomGroup = [...list.slice(middle), dotItem];
    return [topGroup, bottomGroup];
  }

  const middle = Math.ceil(list.length / 2);
  return [list.slice(0, middle), list.slice(middle)];
});

function handleTagClick(value: string) {
  emit("selectType", value as BmsWarningKey);
}

function isActive(value: string) {
  return props.currentType === (value as BmsWarningKey);
}

function buildChartOption(data: WarningPieItem[]): EChartsOption {
  const seriesData = data.map(item => {
    const active = isActive(item.valueKey);
    return {
      ...item,
      itemStyle: {
        borderWidth: active ? 4 : 2,
        borderColor: active ? "#ffffff" : "rgba(255, 255, 255, 0.1)",
        shadowBlur: active ? 20 : 0,
        shadowColor: "rgba(88, 166, 255, 0.6)"
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
        itemStyle: {
          shadowBlur: 25,
          shadowColor: "rgba(88, 166, 255, 0.8)"
        }
      }
    };
  });

  const option: EChartsOption = {
    backgroundColor: "transparent",
    color: [
      "#00D9FF", "#00FFA3", "#FFD93D", "#FF6B9D",
      "#C77DFF", "#4CC9F0", "#F72585", "#7209B7"
    ],
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(88, 166, 255, 0.5)",
      borderWidth: 1,
      textStyle: {
        color: "#e6edf3",
        fontSize: 13
      },
      formatter: params => {
        const p = params as unknown as {
          name: string;
          percent: number;
          data: WarningPieItem;
        };
        return `<div style="padding: 0px 0px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${p.name}</div>
          <div style="color: rgba(230, 237, 243, 0.8);">
            数量：<span style="color: #00D9FF; font-weight: 600;">${p.data.rawValue}</span> 个
          </div>
          <div style="color: rgba(230, 237, 243, 0.8);">
            占比：<span style="color: #00FFA3; font-weight: 600;">${p.percent.toFixed(1)}%</span>
          </div>
        </div>`;
      }
    },
    legend: {
      orient: "vertical",
      left: "40%",
      top: "center",
      icon: "circle",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      align: "left",
      formatter: name => {
        const item = data.find(d => d.name === name);
        return `{name|${name}}\n{value|${item?.rawValue || 0}个}`;
      },
      textStyle: {
        rich: {
          name: {
            fontSize: 13,
            color: "rgba(230, 237, 243, 0.9)",
            lineHeight: 20,
            align: "left"
          },
          value: {
            fontSize: 12,
            color: "rgba(0, 217, 255, 0.9)",
            fontWeight: 600,
            lineHeight: 18,
            align: "left"
          }
        }
      }
    },
    series: [
      {
        name: "告警类型",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["20%", "50%"],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        data: seriesData
      }
    ]
  };

  return option;
}

function updateChart(index: number) {
  const instance = index === 0 ? chartInstance1 : chartInstance2;
  const data = warningPieListGroups.value[index];
  if (!instance || !data) return;
  const option = buildChartOption(data);
  instance.setOption(option, true);
}

function initChart(index: number) {
  const el = index === 0 ? chartRef1.value : chartRef2.value;
  if (!el) return;

  const instance = echarts.init(el);

  instance.on("click", params => {
    const p = params as unknown as { data?: WarningPieItem };
    if (p.data) {
      handleTagClick(p.data.valueKey);
    }
  });

  const data = warningPieListGroups.value[index];
  const option = buildChartOption(data);
  instance.setOption(option, true);

  if (index === 0) {
    chartInstance1 = instance;
  } else {
    chartInstance2 = instance;
  }
}

function resizeChart() {
  if (rafResizeId) cancelAnimationFrame(rafResizeId);
  rafResizeId = requestAnimationFrame(() => {
    chartInstance1?.resize();
    chartInstance2?.resize();
  });
}

onMounted(async () => {
  await nextTick();
  initChart(0);
  initChart(1);
  window.addEventListener("resize", resizeChart);
});

watch(
  () => warningPieListGroups.value,
  () => {
    updateChart(0);
    updateChart(1);
  },
  { deep: true }
);

watch(
  () => props.currentType,
  () => {
    updateChart(0);
    updateChart(1);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  if (rafResizeId) cancelAnimationFrame(rafResizeId);
  rafResizeId = 0;
  if (chartInstance1) {
    chartInstance1.dispose();
    chartInstance1 = null;
  }
  if (chartInstance2) {
    chartInstance2.dispose();
    chartInstance2 = null;
  }
});
</script>

<style scoped lang="scss">
.warning-stats-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-stats-card {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 20px;
  padding: 14px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      #00D9FF 25%,
      #00FFA3 50%,
      #FFD93D 75%,
      transparent 100%
    );
    opacity: 0.8;
  }

  &:hover {
    border-color: rgba(88, 166, 255, 0.6);
    box-shadow: 0 8px 32px rgba(0, 217, 255, 0.15);
    transform: translateY(-2px);

    .card-glow {
      opacity: 0.6;
    }
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
}

.total-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 255, 163, 0.1) 100%);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 12px;
  width: fit-content;
}

.count-label {
  font-size: 13px;
  color: rgba(230, 237, 243, 0.7);
}

.count-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #00D9FF 0%, #00FFA3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.count-unit {
  font-size: 14px;
  color: rgba(230, 237, 243, 0.6);
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(230, 237, 243, 0.7);
  white-space: nowrap;
}

.time-icon {
  width: 14px;
  height: 14px;
  color: rgba(0, 217, 255, 0.8);
}

.card-body {
  position: relative;
}

.chart-container {
  width: 100%;
  height: 220px;
  cursor: pointer;
}
</style>

