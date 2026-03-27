<template>
  <div class="bms-big-screen">
    <div class="screen-background">
      <div class="bg-grid" />
      <div class="bg-gradient bg-gradient-1" />
      <div class="bg-gradient bg-gradient-2" />
      <div class="bg-gradient bg-gradient-3" />
    </div>

    <main class="big-screen-main">

      <section class="right-panel">
        <SeriousWarningLamp :warning-statics="warningStatics" />
        <div class="all-statics-fill">
          <AllStaticsOverview :all-statics-data="allStaticsData" />
        </div>
        <!-- <AllStaticsOverviewcopy/> -->
      </section>
      <section class="center-panel">
        <div class="map-card">
          <BmsDeviceMap :region-list="deviceRegionList" @provinceClick="handleProvinceClick" />
        </div>
      </section>

      <section class="left-panel">
        <WarningTypeStats :warning-statics="warningStatics" :update-time="warningStaticsUpdateTime" />
        <WarningNoticeList />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import SeriousWarningLamp from "./components/SeriousWarningLamp.vue";
import { getAllstaticsReq } from "@/api/bms";
import type { BmsWarningStatisticsMap, BmsGetAllstaticsRes } from "@/api/bms/types";
import { dateYMDHMS } from "@/utils/util";
import { addDialog, closeDialog } from "@/components/ReDialog";
import ProvinceCityCountDialog from "./components/ProvinceCityCountDialog.vue";

defineOptions({
  name: "Welcome"
});

type AllStaticsData = NonNullable<BmsGetAllstaticsRes["data"]>;

const warningStatics = ref<BmsWarningStatisticsMap | null>(null);
const warningStaticsUpdateTime = ref<string>("");
const allStaticsData = ref<AllStaticsData | null>(null);
const isLoadingAllStatics = ref(false);
let allStaticsTimer: number | null = null;

const WarningTypeStats = defineAsyncComponent(() => import("./components/WarningTypeStats.vue"));
const WarningNoticeList = defineAsyncComponent(() => import("./components/WarningNoticeList.vue"));
const BmsDeviceMap = defineAsyncComponent(() => import("./components/BmsDeviceMap.vue"));
const AllStaticsOverview = defineAsyncComponent(() => import("./components/AllStaticsOverview.vue"));

interface DeviceRegionItem {
  name: string;
  value: number;
}

function normalizeProvinceNameFromLocKey(provinceRaw: string): string | null {
  const p = (provinceRaw ?? "").trim();
  if (!p || p === "未知") return null;

  // 直辖市
  if (["北京", "上海", "天津", "重庆"].includes(p)) return `${p}市`;
  // 特别行政区
  if (p === "香港") return "香港特别行政区";
  if (p === "澳门") return "澳门特别行政区";

  // 已经是 “xx省/市/自治区/特别行政区” 的，直接返回
  if (/(省|市|自治区|特别行政区)$/.test(p)) return p;

  // 兜底：默认补 “省”
  return `${p}省`;
}

function toLocProvinceKeyFromMapName(mapProvinceName: string): string | null {
  const n = (mapProvinceName ?? "").trim();
  if (!n) return null;
  if (n === "香港特别行政区") return "香港";
  if (n === "澳门特别行政区") return "澳门";
  // 去掉常见后缀，得到接口 loc 的省份 key（例如：广东省 -> 广东，广西壮族自治区 -> 广西，重庆市 -> 重庆）
  return n
    .replace(/特别行政区$/g, "")
    .replace(/壮族自治区$|回族自治区$|维吾尔自治区$|自治区$/g, "")
    .replace(/省$/g, "")
    .replace(/市$/g, "");
}

const deviceRegionList = computed<DeviceRegionItem[]>(() => {
  const loc = allStaticsData.value?.loc;
  if (!loc) return [];

  const agg = new Map<string, number>();
  Object.entries(loc).forEach(([k, v]) => {
    const [provinceRaw] = k.split("_");
    const provinceName = normalizeProvinceNameFromLocKey(provinceRaw ?? "");
    if (!provinceName) return;
    const count = typeof v === "number" && Number.isFinite(v) ? v : 0;
    agg.set(provinceName, (agg.get(provinceName) ?? 0) + count);
  });

  return Array.from(agg.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
});

function handleProvinceClick(mapProvinceName: string) {
  const loc = allStaticsData.value?.loc;
  if (!loc) return;

  const provinceKey = toLocProvinceKeyFromMapName(mapProvinceName);
  if (!provinceKey) return;

  const rows = Object.entries(loc)
    .filter(([k]) => k.startsWith(`${provinceKey}_`))
    .map(([k, v]) => {
      const [, cityRaw] = k.split("_");
      return {
        city: (cityRaw ?? "").trim() || "未知",
        count: typeof v === "number" && Number.isFinite(v) ? v : 0
      };
    })
    .filter(r => r.city !== "未知")
    .sort((a, b) => b.count - a.count);

  addDialog({
    title: `【${mapProvinceName}】市级设备数量`,
    width: "720px",
    draggable: true,
    class: "province-city-light-dialog",
    contentRenderer: () =>
      h(ProvinceCityCountDialog, {
        provinceName: mapProvinceName,
        rows
      }),
    footerButtons: [
      {
        label: "关闭",
        type: "primary",
        btnClick: ({ dialog }) => {
          if (typeof dialog.index === "number" && dialog.options) {
            closeDialog(dialog.options, dialog.index);
          }
        }
      }
    ]
  });
}

async function loadAllStatics() {
  if (isLoadingAllStatics.value) return;
  isLoadingAllStatics.value = true;
  const res = await getAllstaticsReq();
  if (res.errno === 0 && res.data) {
    warningStatics.value = res.data.statistics;
    warningStaticsUpdateTime.value = dateYMDHMS(res.data.update_time);
    allStaticsData.value = res.data;
  }
  isLoadingAllStatics.value = false;
}

onMounted(async () => {
  await loadAllStatics();
  allStaticsTimer = window.setInterval(loadAllStatics, 60 * 1000);
});

onBeforeUnmount(() => {
  if (allStaticsTimer) {
    window.clearInterval(allStaticsTimer);
    allStaticsTimer = null;
  }
});
</script>
<style scoped lang="scss">
@keyframes gridMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(40px);
  }
}

@keyframes gradientFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
    opacity: 0.5;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.bms-big-screen {
  --bms-top-offset: 125px; // 顶部菜单栏 + 信息栏高度（按实际调整）
  --bms-screen-padding: clamp(5px, 1.2vw, 15px);
  --bms-screen-gap: clamp(10px, 1.2vw, 20px);
  --bms-side-width: clamp(470px, 23vw, 470px);

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: calc(100vh - var(--bms-top-offset));
  min-height: 0;
  box-sizing: border-box;
  padding: var(--bms-screen-padding);
  background: #0a0e17;
  color: #e6edf3;
  overflow: hidden;
}

.screen-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(88, 166, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(88, 166, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridMove 20s linear infinite;
}

.bg-gradient {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.bg-gradient-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  left: -100px;
  background: radial-gradient(circle, rgba(0, 217, 255, 0.15) 0%, transparent 70%);
  animation: gradientFloat 15s ease-in-out infinite;
}

.bg-gradient-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -100px;
  background: radial-gradient(circle, rgba(0, 255, 163, 0.12) 0%, transparent 70%);
  animation: gradientFloat 18s ease-in-out infinite reverse;
}

.bg-gradient-3 {
  width: 350px;
  height: 350px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 217, 61, 0.08) 0%, transparent 70%);
  animation: gradientFloat 20s ease-in-out infinite;
  animation-delay: 5s;
}

.big-screen-main {
  position: relative;
  flex: 1;
  display: grid;
  grid-template-columns: var(--bms-side-width) minmax(0, 1fr) var(--bms-side-width);
  gap: var(--bms-screen-gap);
  min-height: 0;
  z-index: 1;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  overflow: auto;
  border-radius: 18px;
}

.bms-big-screen {
  --bms-scrollbar-size: 8px;
  --bms-scrollbar-thumb: rgba(88, 166, 255, 0.24);
  --bms-scrollbar-thumb-hover: rgba(88, 166, 255, 0.42);
  --bms-scrollbar-track: rgba(10, 14, 23, 0.35);
}

/* 仅作用于本页的滚动容器（左右栏为主），对齐“监控大屏”细滚动条风格 */
:deep(.left-panel),
:deep(.right-panel) {
  scrollbar-width: thin;
  scrollbar-color: var(--bms-scrollbar-thumb) var(--bms-scrollbar-track);
}

:deep(.left-panel::-webkit-scrollbar),
:deep(.right-panel::-webkit-scrollbar) {
  width: var(--bms-scrollbar-size);
  height: var(--bms-scrollbar-size);
}

:deep(.left-panel::-webkit-scrollbar-track),
:deep(.right-panel::-webkit-scrollbar-track) {
  background: var(--bms-scrollbar-track);
  border-radius: 999px;
}

:deep(.left-panel::-webkit-scrollbar-thumb),
:deep(.right-panel::-webkit-scrollbar-thumb) {
  background: var(--bms-scrollbar-thumb);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

:deep(.left-panel:hover::-webkit-scrollbar-thumb),
:deep(.right-panel:hover::-webkit-scrollbar-thumb) {
  background: var(--bms-scrollbar-thumb-hover);
  background-clip: padding-box;
}

:deep(.left-panel::-webkit-scrollbar-corner),
:deep(.right-panel::-webkit-scrollbar-corner) {
  background: transparent;
}

.left-panel {
  justify-content: space-between;
}

.right-panel {
  justify-content: flex-start;
}

.all-statics-fill {
  flex: 1;
  min-height: 0;
  display: flex;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.center-panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.map-card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(88, 166, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
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

    .map-glow {
      opacity: 0.6;
    }
  }
}

.map-glow {
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

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.map-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.map-title-icon {
  width: 6px;
  height: 24px;
  background: linear-gradient(180deg, #00D9FF 0%, #00FFA3 100%);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(0, 217, 255, 0.6);
}

.map-title {
  margin: 0;
  font-size: clamp(14px, 1vw, 18px);
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
}

/* 省->市弹窗：强制亮色（白底黑字） */
:deep(.province-city-light-dialog.el-dialog) {
  --el-dialog-bg-color: #ffffff;
  --el-text-color-primary: #111827;
  --el-text-color-regular: #111827;
  --el-border-color: #e5e7eb;
  --el-fill-color-light: #f3f4f6;
}

:deep(.province-city-light-dialog .el-dialog__title) {
  color: #111827;
  font-weight: 700;
}

:deep(.province-city-light-dialog .el-dialog__body) {
  background: #ffffff;
  color: #111827;
}

.map-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.2);
  border-radius: 12px;
  font-size: clamp(12px, 0.85vw, 13px);
  color: rgba(230, 237, 243, 0.8);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(88, 166, 255, 0.4);
    background: rgba(15, 23, 42, 0.8);
  }
}

.stat-icon {
  width: 16px;
  height: 16px;
  color: rgba(0, 217, 255, 0.8);
}

.stat-value {
  font-weight: 700;
  color: #00D9FF;
  margin-left: 4px;
}

@media (max-width: 1280px) {
  .big-screen-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr) auto;
  }

  .left-panel,
  .right-panel {
    overflow: visible;
  }

  .map-card {
    min-height: 360px;
  }
}

</style>
