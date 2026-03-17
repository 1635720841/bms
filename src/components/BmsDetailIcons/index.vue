<template>
  <span class="bms-detail-icon" :class="[sizeClass]" :style="iconStyle">
    <!-- 基础信息：芯片/设备 -->
    <svg v-if="name === 'chip'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 4v2M15 4v2M9 18v2M15 18v2M4 9h2M4 15h2M18 9h2M18 15h2" />
    </svg>
    <!-- 运行信息：仪表盘 -->
    <svg v-else-if="name === 'gauge'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 4v16M12 4a8 8 0 0 1 8 8M12 4a8 8 0 0 0-8 8" />
      <path d="M12 12l4.5 4.5M12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
    <!-- 容量 / 电池 -->
    <svg v-else-if="name === 'battery'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <line x1="22" y1="10" x2="22" y2="14" stroke-width="1.2" />
    </svg>
    <!-- 材料：层叠 -->
    <svg v-else-if="name === 'layers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
    <!-- 串数：堆叠电芯 -->
    <svg v-else-if="name === 'stack'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="6" height="5" rx="1" />
      <rect x="5" y="10" width="6" height="5" rx="1" />
      <rect x="5" y="16" width="6" height="4" rx="1" />
      <rect x="13" y="4" width="6" height="5" rx="1" />
      <rect x="13" y="10" width="6" height="5" rx="1" />
      <rect x="13" y="16" width="6" height="4" rx="1" />
    </svg>
    <!-- 电压 V -->
    <svg v-else-if="name === 'voltage'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8 20l4-12 4 12M6 4h12" />
    </svg>
    <!-- 电流 / 闪电 -->
    <svg v-else-if="name === 'current'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M13 2L7 12h4l-2 8 8-10h-4l2-10z" />
    </svg>
    <!-- SOC/SOH 百分比 -->
    <svg v-else-if="name === 'percent'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 15l6-6M15 15L9 9" />
    </svg>
    <!-- 循环 -->
    <svg v-else-if="name === 'loop'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1 6.74-2.74L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>
    <!-- 在线 / 信号 -->
    <svg v-else-if="name === 'signal'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 20h2M6 16h2M10 12h2M14 8h2M18 4h2" />
    </svg>
    <!-- 温度 -->
    <svg v-else-if="name === 'thermometer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
    <!-- 电芯电压：多节 -->
    <svg v-else-if="name === 'cells'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="4" height="16" rx="1" />
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="18" y="4" width="4" height="16" rx="1" />
    </svg>
    <!-- 链接/后台 -->
    <svg v-else-if="name === 'link'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
    <!-- 标签/ID (BMS/版本/imsi/BT码) -->
    <svg v-else-if="name === 'tag'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2H2v10l9.29 9.29a2 2 0 0 0 2.82 0l6.58-6.58a2 2 0 0 0 0-2.82L12 2z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "BmsDetailIcons" });

const props = withDefaults(
  defineProps<{
    name:
      | "chip"
      | "gauge"
      | "battery"
      | "layers"
      | "stack"
      | "voltage"
      | "current"
      | "percent"
      | "loop"
      | "signal"
      | "thermometer"
      | "cells"
      | "link"
      | "tag";
    size?: "sm" | "md" | "lg";
  }>(),
  { size: "md" }
);

const sizeClass = computed(() =>
  props.size === "sm" ? "bms-detail-icon--sm" : props.size === "lg" ? "bms-detail-icon--lg" : ""
);
</script>

<style scoped lang="scss">
.bms-detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
  vertical-align: middle;

  svg {
    width: 1em;
    height: 1em;
    display: block;
  }

  &--sm {
    font-size: 16px;
  }
  &--md {
    font-size: 20px;
  }
  &--lg {
    font-size: 24px;
  }
}
</style>
