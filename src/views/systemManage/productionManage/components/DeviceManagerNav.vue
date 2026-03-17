<script setup lang="ts">
defineOptions({
  name: "DeviceManagerNav"
});

export type DeviceManagerNavName =
  | "deviceEntry"
  | "configuration"
  | "deviceAllocation"
  | "serviceAddress"
  | "servicePricing"
  | "serviceTime";

export interface DeviceManagerNavItem {
  title: string;
  name: DeviceManagerNavName;
  /** 仅用于 UI 配色 */
  color?: "blue" | "green" | "cyan" | "orange";
  /** 是否禁用（未开放/无权限） */
  disabled?: boolean;
}

const props = defineProps<{
  items: DeviceManagerNavItem[];
}>();

const emit = defineEmits<{
  (e: "select", item: DeviceManagerNavItem): void;
}>();

function handleClick(item: DeviceManagerNavItem) {
  if (item.disabled) return;
  emit("select", item);
}

function getColorClass(item: DeviceManagerNavItem) {
  return item.color ? `pm-nav-item--${item.color}` : "pm-nav-item--cyan";
}
</script>

<template>
  <div v-if="props.items?.length" class="pm-section">
    <div class="pm-section__title">设备生产配置</div>
    <div class="pm-nav-list">
      <button
        v-for="item in props.items"
        :key="item.name"
        type="button"
        class="pm-nav-item"
        :class="[getColorClass(item), { 'is-disabled': item.disabled }]"
        @click="handleClick(item)"
      >
        <div class="pm-nav-item__text">
          <div class="pm-nav-item__title">{{ item.title }}</div>
          <div class="pm-nav-item__name">{{ item.name }}</div>
        </div>
        <svg class="pm-nav-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pm-section {
  margin: 8px 0 14px;
  padding: 14px 16px 12px;
  border-radius: 10px;
  background: radial-gradient(circle at top left, rgba(88, 166, 255, 0.12), transparent 55%),
    radial-gradient(circle at bottom right, rgba(0, 188, 212, 0.1), transparent 55%);
  border: 1px solid rgba(88, 166, 255, 0.25);
}

.pm-section__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--bms-text);
  margin-bottom: 10px;
}

.pm-nav-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.pm-nav-item {
  border: none;
  width: 100%;
  text-align: left;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(10, 14, 23, 0.7);
  border: 1px solid rgba(88, 166, 255, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pm-nav-item:hover {
  border-color: var(--bms-primary);
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.25);
  transform: translateY(-1px);
}

.pm-nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

.pm-nav-item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--bms-text);
}

.pm-nav-item__name {
  margin-top: 2px;
  font-size: 12px;
  color: var(--bms-text-secondary);
}

.pm-nav-item__icon {
  width: 18px;
  height: 18px;
  color: var(--bms-text-secondary);
  flex-shrink: 0;
}

.pm-nav-item--blue {
  border-color: rgba(88, 166, 255, 0.35);
}

.pm-nav-item--green {
  border-color: rgba(46, 204, 113, 0.35);
}

.pm-nav-item--cyan {
  border-color: rgba(0, 188, 212, 0.35);
}

.pm-nav-item--orange {
  border-color: rgba(243, 156, 18, 0.35);
}
</style>


