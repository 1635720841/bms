<template>
  <div class="kpi-item kpi-bocdisc" role="button" tabindex="0" @click="handleBocDiscClick"
    @keydown.enter="handleBocDiscClick">
    <div class="kpi-label">当前放电过流</div>
    <div class="kpi-value">
      {{ value }}<span class="kpi-unit">台</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { addDialog, closeDialog } from "@/components/ReDialog";
import BocDiscBmsListDialog from "./BocDiscBmsListDialog.vue";

defineOptions({ name: "BocDiscOvercurrentDialogModule" });

const props = defineProps<{
  value: number;
}>();

const isBocDiscLoading = ref(false);

function handleBocDiscClick() {
  if (isBocDiscLoading.value) return;
  isBocDiscLoading.value = true;

  addDialog({
    title: "放电过流设备列表",
    width: "820px",
    draggable: true,
    class: "bocdisc-bms-list-dialog",
    contentRenderer: () => h(BocDiscBmsListDialog),
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

  // 防抖：避免用户连点导致重复弹框
  window.setTimeout(() => {
    isBocDiscLoading.value = false;
  }, 300);
}
</script>

<style scoped lang="scss">
.kpi-item {
  --kpi-accent-rgb: 0, 217, 255;
  position: relative;
  border-radius: 14px;
  padding: clamp(8px, 0.9vw, 10px) clamp(8px, 0.9vw, 10px) clamp(7px, 0.8vw, 9px);
  background:
    radial-gradient(circle at 18% 0%,
      rgba(var(--kpi-accent-rgb), 0.22) 0%,
      transparent 55%),
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

.kpi-bocdisc {
  --kpi-accent-rgb: 255, 140, 0;
  cursor: pointer;
}

.kpi-label {
  position: relative;
  font-size: var(--text-sm);
  color: rgba(230, 237, 243, 0.72);
  letter-spacing: 0.6px;
  margin-bottom: clamp(4px, 0.6vw, 6px);
}

.kpi-value {
  position: relative;
  font-size: clamp(16px, 1.45vw, 16px);
  font-weight: 900;
  line-height: 1;
}

.kpi-unit {
  margin-left: clamp(4px, 0.5vw, 6px);
  font-size: var(--text-sm);
  font-weight: 700;
  color: rgba(230, 237, 243, 0.55);
}

.kpi-bocdisc .kpi-value {
  color: #ff8c00;
  text-shadow: 0 0 18px rgba(255, 140, 0, 0.22);
}

:deep(.bocdisc-bms-list-dialog.el-dialog) {
  --el-dialog-bg-color: #1c2128;
  --el-text-color-primary: #e6edf3;
  --el-text-color-regular: #e6edf3;
  --el-border-color: rgba(88, 166, 255, 0.25);
}

:deep(.bocdisc-bms-list-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(88, 166, 255, 0.18);
}

:deep(.bocdisc-bms-list-dialog .el-dialog__body) {
  padding: 12px 20px 18px;
  background: transparent;
}
</style>
