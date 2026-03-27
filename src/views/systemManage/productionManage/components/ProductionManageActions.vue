<template>
  <div class="bms-prod-actions">
    <div class="bms-prod-actions__btns">
      <!-- 生产配置：统一入口，下拉区分“设备录入 / 生产配置” -->
      <el-dropdown @command="handleProdCommand" :teleported="false" popper-class="bms-prod-dropdown">
        <el-button type="primary" size="small">
          生产配置
          <el-icon class="bms-prod-actions__caret">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="entry">设备录入</el-dropdown-item>
            <el-dropdown-item command="config">生产配置</el-dropdown-item>
            <el-dropdown-item command="config-manage">生产参数配置</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 调拨配置：统一入口，下拉区分“设备调拨 / 主平台配置” -->
      <el-dropdown @command="handleTransferCommand" :teleported="false" popper-class="bms-prod-dropdown">
        <el-button type="success" size="small">
          调拨配置
          <el-icon class="bms-prod-actions__caret">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="device">设备调拨</el-dropdown-item>
            <el-dropdown-item command="platform">主平台配置</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 服务配置：下拉切换“设置服务价格 / 设置服务时间” -->
      <el-dropdown @command="handleServiceConfigCommand" :teleported="false" popper-class="bms-prod-dropdown">
        <el-button type="warning" size="small">
          服务配置
          <el-icon class="bms-prod-actions__caret">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="pricing">设置服务价格</el-dropdown-item>
            <el-dropdown-item command="time">设置服务时间</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from "vue";
import { ElMessage } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import { addDialog } from "@/components/ReDialog";
import DeviceEntryTransferPanel from "./DeviceEntryTransferPanel.vue";
import MainPlatformConfigPanel from "./MainPlatformConfigPanel.vue";
import ProductionConfigPanel from "./ProductionConfigPanel.vue";
import ServicePricingPanel from "./ServicePricingPanel.vue";
import ServiceTimePanel from "./ServiceTimePanel.vue";
import ProfileListDialog from "./ProfileListDialog.vue";
import type { BmsFacProfileItem } from "@/api/bms/types";

defineOptions({
  name: "ProductionManageActions"
});

const props = defineProps<{
  /** 是否已勾选设备（控制除“设备录入”外的按钮禁用态） */
  hasSelection: boolean;
  /** 当前勾选的 BMS 编码列表 */
  selectedBmsIds: string[];
}>();

const emit = defineEmits<{
  /** 提交成功后通知父级刷新列表 */
  (e: "refresh"): void;
}>();

type PanelExpose = {
  submit: () => Promise<boolean>;
};

function handleAdd() {
  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设备录入",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(DeviceEntryTransferPanel, {
        ref: panelRef,
        mode: "entry"
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleProdConfig() {
  // if (!props.hasSelection || !props.selectedBmsIds.length) {
  //   ElMessage.warning("请先在表格中勾选设备");
  //   return;
  // }

  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "生产配置",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () => h(ProductionConfigPanel, { ref: panelRef, initialBmsIds: props.selectedBmsIds }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function openDeviceAllocationDialog() {
  // if (!props.hasSelection || !props.selectedBmsIds.length) {
  //   ElMessage.warning("请先在表格中勾选设备");
  //   return;
  // }

  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设备调拨",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(DeviceEntryTransferPanel, {
        ref: panelRef,
        initialBmsIds: props.selectedBmsIds,
        mode: "transfer"
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function openMainPlatformConfigDialog() {
  // if (!props.hasSelection || !props.selectedBmsIds.length) {
  //   ElMessage.warning("请先在表格中勾选设备");
  //   return;
  // }

  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "主平台配置",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () => h(MainPlatformConfigPanel, { ref: panelRef, initialBmsIds: props.selectedBmsIds }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleServicePricing() {
  // if (!props.hasSelection || !props.selectedBmsIds.length) {
  //   ElMessage.warning("请先在表格中勾选设备");
  //   return;
  // }

  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设置服务价格",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ServicePricingPanel, {
        ref: panelRef,
        initialBmsIds: props.selectedBmsIds
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleServiceTime() {
  // if (!props.hasSelection || !props.selectedBmsIds.length) {
  //   ElMessage.warning("请先在表格中勾选设备");
  //   return;
  // }

  const panelRef = ref<PanelExpose | null>(null);
  addDialog({
    title: "设置服务时间",
    width: "760px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ServiceTimePanel, {
        ref: panelRef,
        initialBmsIds: props.selectedBmsIds
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
          emit("refresh");
        }
      } finally {
        closeLoading();
      }
    }
  });
}

function handleProdCommand(command: "entry" | "config" | "config-manage") {
  if (command === "entry") {
    handleAdd();
    return;
  }
  if (command === "config-manage") {
    handleProfileManage();
    return;
  }
  handleProdConfig();
}

function handleTransferCommand(command: "device" | "platform") {
  if (command === "device") {
    openDeviceAllocationDialog();
    return;
  }
  openMainPlatformConfigDialog();
}

function handleServiceConfigCommand(command: "pricing" | "time") {
  if (command === "pricing") {
    handleServicePricing();
    return;
  }
  handleServiceTime();
}

function handleProfileManage() {
  addDialog({
    title: "生产参数配置",
    width: "1100px",
    contentRenderer: () =>
      h(ProfileListDialog, {
        onSelect: (profile: BmsFacProfileItem) => {
          ElMessage.success(`已选择配置：${profile.name}`);
        }
      }),
    footerButtons: []
  });
}
</script>


<style scoped lang="scss">
.bms-prod-actions {
  display: flex;
  align-items: center;
}

.bms-prod-actions__btns {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.bms-prod-actions__caret {
  margin-left: 4px;
  font-size: 12px;
}
:deep(.bms-prod-dropdown.el-popper) {
  transform-origin: center top !important;
}

:deep(.bms-prod-dropdown.el-popper) {
  transform-origin: center top !important;
}

/* 关闭 el-zoom-in-top 的缩放/位移动画，只保留很轻的透明度过渡 */
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-active),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-active) {
  transition: opacity 0.12s ease-out !important;
}

:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-from),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-to) {
  opacity: 0;
  transform: none !important;
}

:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-enter-to),
:deep(.bms-prod-dropdown.el-popper.el-zoom-in-top-leave-from) {
  opacity: 1;
  transform: none !important;
}
</style>


