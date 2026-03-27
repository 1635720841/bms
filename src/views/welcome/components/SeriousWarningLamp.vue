
<template>
  <div class="serious-alarm-card" :class="{ 'is-emergency': hasSeriousAlarm }">
    <div class="card-header">
      <div class="header-left">
        <div class="title-wrapper">
          <div class="title-icon" />
          <h3 class="card-title">核心安全监控</h3>
        </div>
      </div>
      <div class="status-badge" :class="{ 'status-emergency': hasSeriousAlarm }">
        <div class="status-dot" />
        <span>{{ hasSeriousAlarm ? '严重故障' : '系统正常' }}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="alarm-visual">
        <div class="alarm-lamp" :class="{ 'lamp-active': hasSeriousAlarm }">
          <div class="lamp-glow" />
          <div class="lamp-core">
            <svg class="lamp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="lamp-rings">
            <div class="ring" />
            <div class="ring-2" />
            <div class="ring-3" />
          </div>
        </div>

        <div class="alarm-stats">
          <div class="stat-item">
            <span class="stat-label">故障数</span>
            <span class="stat-value" :class="{ 'value-danger': hasSeriousAlarm }">
              {{ totalAlarmCount }}
            </span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-label">监控项</span>
            <span class="stat-value">{{ alarmList.length }}</span>
          </div>
        </div>
      </div>

      <div class="alarm-list">
        <div
          v-for="item in alarmList"
          :key="item.label"
          class="alarm-item"
          :class="{ 'item-active': item.active }"
          :style="{ '--item-color': item.color }"
          role="button"
          :tabindex="item.active ? 0 : -1"
          @click="handleAlarmItemClick(item)"
          @keydown.enter.prevent="handleAlarmItemClick(item)"
        >
          <div class="item-indicator" />
          <div class="item-content">
            <span class="item-label">{{ item.label }}</span>
            <span class="item-count">{{ item.count }}个</span>
          </div>
          <!-- <span class="item-status">{{ item.active ? '故障' : '正常' }}</span> -->
        </div>
      </div>
    </div>

    <div class="card-glow" />
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { BmsWarningKey, BmsWarningStatisticsMap } from "@/api/bms/types";

defineOptions({ name: "SeriousWarningLamp" });

interface Props {
  warningStatics: BmsWarningStatisticsMap | null;
}

const props = defineProps<Props>();

type WarningMap = Partial<Record<BmsWarningKey, number>>;
const s = computed<WarningMap>(() => props.warningStatics ?? {});

type AlarmItem = {
  label: string;
  warningType: BmsWarningKey;
  count: number;
  active: boolean;
  icon: string;
  color: string;
};

const alarmList = computed<AlarmItem[]>(() => [
  { label: "充电高温", warningType: "cot", count: s.value.cot ?? 0, active: (s.value.cot ?? 0) > 0, icon: "temp", color: "#FF6B9D" },
  { label: "放电高温", warningType: "dot", count: s.value.dot ?? 0, active: (s.value.dot ?? 0) > 0, icon: "temp", color: "#FF6B9D" },
  { label: "MOS高温", warningType: "mot", count: s.value.mot ?? 0, active: (s.value.mot ?? 0) > 0, icon: "temp", color: "#FFD93D" },
  { label: "充电MOS失效", warningType: "cmosfault", count: s.value.cmosfault ?? 0, active: (s.value.cmosfault ?? 0) > 0, icon: "mos", color: "#F72585" },
  { label: "放电MOS失效", warningType: "dmosfault", count: s.value.dmosfault ?? 0, active: (s.value.dmosfault ?? 0) > 0, icon: "mos", color: "#F72585" },
  { label: "放电短路", warningType: "dsc", count: s.value.dsc ?? 0, active: (s.value.dsc ?? 0) > 0, icon: "short", color: "#FF003C" }
]);

const router = useRouter();

function handleAlarmItemClick(item: AlarmItem) {
  if (!item.active) return;
  router.push({ name: "WarningList", query: { warningType: item.warningType } });
}

const hasSeriousAlarm = computed(() => alarmList.value.some(item => item.active));
const activeAlarmCount = computed(() => alarmList.value.filter(item => item.active).length);
const totalAlarmCount = computed(() => alarmList.value.reduce((sum, item) => sum + item.count, 0));
</script>

<style scoped lang="scss">
@keyframes lampPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes statusBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.serious-alarm-card {
  --card-padding: clamp(12px, 1.2vw, 24px);
  --text-sm: clamp(12px, 0.85vw, 13px);
  --text-md: clamp(14px, 1vw, 18px);
  --value-lg: clamp(24px, 2.6vw, 40px);
  --count-lg: clamp(14px, 1.15vw, 18px);
  --lamp: clamp(56px, 5.2vw, 80px);
  --lamp-core: clamp(44px, 3.9vw, 60px);
  --lamp-icon: clamp(22px, 2.2vw, 32px);
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
    background: linear-gradient(90deg,
      transparent 0%,
      #00D9FF 25%,
      #00FFA3 50%,
      #FFD93D 75%,
      transparent 100%
    );
    opacity: 0.8;
  }

  &.is-emergency {
    border-color: rgba(255, 0, 60, 0.6);

    &::before {
      background: linear-gradient(90deg,
        transparent 0%,
        #FF003C 25%,
        #F72585 50%,
        #FF6B9D 75%,
        transparent 100%
      );
      animation: glowPulse 2s ease-in-out infinite;
    }
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
  align-items: center;
  margin-bottom: clamp(12px, 1.2vw, 20px);
  gap: clamp(10px, 1.1vw, 16px);
}

.header-left {
  flex: 1;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 6px;
  height: 24px;
  background: linear-gradient(180deg, #FF003C 0%, #F72585 100%);
  border-radius: 3px;
  box-shadow: 0 0 12px rgba(255, 0, 60, 0.6);
}

.is-emergency .title-icon {
  animation: glowPulse 1.5s ease-in-out infinite;
}

.card-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 0.5px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(0, 255, 163, 0.1);
  border: 1px solid rgba(0, 255, 163, 0.3);
  border-radius: 12px;
  font-size: var(--text-sm);
  color: #00FFA3;
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00FFA3;
  box-shadow: 0 0 8px rgba(0, 255, 163, 0.6);
}

.status-emergency {
  background: rgba(255, 0, 60, 0.15);
  border-color: rgba(255, 0, 60, 0.5);
  color: #FF003C;
  animation: statusBlink 1.5s ease-in-out infinite;

  .status-dot {
    background: #FF003C;
    box-shadow: 0 0 12px rgba(255, 0, 60, 0.8);
    animation: lampPulse 1s ease-in-out infinite;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 1.2vw, 20px);
}

.alarm-visual {
  display: flex;
  align-items: center;
  gap: clamp(14px, 1.6vw, 24px);
  padding: clamp(12px, 1.2vw, 15px);
  background: rgba(10, 14, 23, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(88, 166, 255, 0.1);
}

.alarm-lamp {
  position: relative;
  width: var(--lamp);
  height: var(--lamp);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lamp-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(88, 166, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lamp-core {
  position: relative;
  width: var(--lamp-core);
  height: var(--lamp-core);
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.2) 0%, rgba(88, 166, 255, 0.05) 100%);
  border: 2px solid rgba(88, 166, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
}

.lamp-icon {
  width: var(--lamp-icon);
  height: var(--lamp-icon);
  color: rgba(88, 166, 255, 0.6);
  transition: all 0.3s ease;
}

.lamp-rings {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.ring,
.ring-2,
.ring-3 {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 0, 60, 0.4);
  border-radius: 50%;
  opacity: 0;
}

.lamp-active {
  .lamp-glow {
    opacity: 1;
    background: radial-gradient(circle, rgba(255, 0, 60, 0.4) 0%, transparent 70%);
    animation: glowPulse 2s ease-in-out infinite;
  }

  .lamp-core {
    background: linear-gradient(135deg, rgba(255, 0, 60, 0.3) 0%, rgba(247, 37, 133, 0.2) 100%);
    border-color: rgba(255, 0, 60, 0.6);
    box-shadow: 0 0 30px rgba(255, 0, 60, 0.4);
    animation: lampPulse 2s ease-in-out infinite;
  }

  .lamp-icon {
    color: #FF003C;
  }

  .ring,
  .ring-2,
  .ring-3 {
    opacity: 1;
    animation: ringExpand 2s ease-out infinite;
  }

  .ring-2 {
    animation-delay: 0.6s;
  }

  .ring-3 {
    animation-delay: 1.2s;
  }
}

.alarm-stats {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.6);
}

.stat-value {
  font-size: var(--value-lg);
  font-weight: 700;
  color: rgba(88, 166, 255, 0.9);
  line-height: 1;
  transition: all 0.3s ease;
}

.value-danger {
  color: #FF003C;
  animation: statusBlink 1.5s ease-in-out infinite;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(88, 166, 255, 0.2);
}

.alarm-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(8px, 0.8vw, 10px);
}

.alarm-item {
  display: flex;
  align-items: flex-start;
  gap: clamp(8px, 0.8vw, 10px);
  padding: clamp(8px, 0.9vw, 10px) clamp(10px, 1vw, 14px);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(88, 166, 255, 0.15);
  border-radius: 10px;
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    background: rgba(15, 23, 42, 0.8);
    border-color: rgba(88, 166, 255, 0.3);
  }
}

.item-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(88, 166, 255, 0.3);
  transition: all 0.3s ease;
  margin-top: 4px;
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.8);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-count {
  font-size: var(--count-lg);
  color: rgba(230, 237, 243, 0.6);
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
  margin-right: 0;
  min-width: 0;
  text-align: left;
}

.item-status {
  font-size: 12px;
  color: rgba(0, 255, 163, 0.8);
  font-weight: 600;
}

.item-active {
  background: rgba(255, 0, 60, 0.1);
  border-color: var(--item-color);
  cursor: pointer;

  .item-indicator {
    background: var(--item-color);
    box-shadow: 0 0 10px var(--item-color);
    animation: lampPulse 1s ease-in-out infinite;
  }

  .item-label {
    color: #e6edf3;
  }

  .item-count {
    color: var(--item-color);
  }

  .item-status {
    color: var(--item-color);
  }
}
</style>
