<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import WarningTypeStats from "./components/WarningTypeStats.vue";
import WarningNoticeList from "./components/WarningNoticeList.vue";
import SeriousWarningLamp from "./components/SeriousWarningLamp.vue";
import BmsDeviceMap from "./components/BmsDeviceMap.vue";
import AllStaticsOverview from "./components/AllStaticsOverview.vue";
import AllStaticsOverviewcopy from "./components/AllStaticsOverviewcopy.vue";
import { getAllstaticsReq } from "@/api/bms";
import type { BmsWarningStatisticsMap, BmsGetAllstaticsRes } from "@/api/bms/types";
import { dateYMDHMS } from "@/utils/util";

defineOptions({
  name: "Welcome"
});

type AllStaticsData = NonNullable<BmsGetAllstaticsRes["data"]>;

const warningStatics = ref<BmsWarningStatisticsMap | null>(null);
const warningStaticsUpdateTime = ref<string>("");
const allStaticsData = ref<AllStaticsData | null>(null);
const isLoadingAllStatics = ref(false);
let allStaticsTimer: number | null = null;

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
        <AllStaticsOverview :all-statics-data="allStaticsData" />
        <!-- <AllStaticsOverviewcopy/> -->
      </section>
      <section class="center-panel">
        <div class="map-card">
          <BmsDeviceMap />
        </div>
      </section>

      <section class="left-panel">
        <WarningTypeStats :warning-statics="warningStatics" :update-time="warningStaticsUpdateTime" />
        <WarningNoticeList />
      </section>
    </main>
  </div>
</template>

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
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 18px;
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
  grid-template-columns: 450px minmax(0, 1fr) 450px;
  gap: 20px;
  min-height: 0;
  z-index: 1;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  min-height: 0;
  overflow: auto;
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
  font-size: 18px;
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
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
  font-size: 13px;
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

</style>
