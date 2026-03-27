<template>
  <el-dialog :model-value="modelValue" title="批量配置" width="1300px" top="10px" destroy-on-close append-to-body
    class="batch-config-dialog" @update:model-value="emit('update:modelValue', $event)">
    <div v-loading="loading" class="batch-dialog">
      <div class="batch-card">
        <div class="batch-card__head">
          <div class="section-title">
            {{ getSectionTitle() }}
          </div>
        </div>

        <div class="custom-tabs">
          <div v-for="tab in tabList" :key="tab.name" :class="['tab-item', { active: activeTab === tab.name }]"
            @click="activeTab = tab.name">
            {{ tab.label }}
          </div>
        </div>

        <el-form label-width="110px" class="form">
          <el-form-item label="设备编码">
            <el-input v-model="bmsText" type="textarea" :rows="3" placeholder="逗号、换行分割，可从设备列表多选自动带入" />
            <div class="hint">数量：{{ bmsIds.length }}</div>
          </el-form-item>

          <el-form-item label="离线任务">
            <el-radio-group v-model="offlineTask">
              <el-radio :value="0">仅配置在线设备</el-radio>
              <el-radio :value="1">配置所有设备（包括离线任务）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="shouldShowMaterialType()" label="材料类型">
            <el-radio-group v-model="materialType">
              <el-radio :value="1">按铁锂参数配</el-radio>
              <el-radio :value="2">按三元参数配</el-radio>
            </el-radio-group>
          </el-form-item>

          <BtcodeTab v-if="activeTab === 'btcode'" v-model:btcode-text="btcodeText" :bt-count="btcodes.length"
            :bms-ids="bmsIds" />

          <ThirdServerTab v-else-if="activeTab === 'thirdServer'" v-model:selected-value="selectedThirdSrvValue"
            :third-srv-list="thirdSrvList" />

          <BasicParamsTab v-else-if="activeTab === 'basicParams'" ref="basicParamsTabRef" />

          <CellOvTab v-else-if="activeTab === 'cellOv'" ref="cellOvTabRef" :ranges="materialRanges"
            :loading-ranges="loadingMaterialRanges" />

          <CellUvTab v-else-if="activeTab === 'cellUv'" ref="cellUvTabRef" :ranges="materialRanges"
            :loading-ranges="loadingMaterialRanges" />

          <PackOvTab v-else-if="activeTab === 'packOv'" ref="packOvTabRef" :ranges="materialRanges"
            :loading-ranges="loadingMaterialRanges" />

          <PackUvTab v-else-if="activeTab === 'packUv'" ref="packUvTabRef" :ranges="materialRanges"
            :loading-ranges="loadingMaterialRanges" />

          <DischargeOcdTab v-else-if="activeTab === 'dischargeOcd1'" ref="dischargeOcd1TabRef" variant="ocd1"
            :ranges="commonRanges" :loading-ranges="loadingRanges" />

          <DischargeOcdTab v-else-if="activeTab === 'dischargeOcd2'" ref="dischargeOcd2TabRef" variant="ocd2"
            :ranges="commonRanges" :loading-ranges="loadingRanges" />

          <DischargeOcdTab v-else-if="activeTab === 'dischargeOcd3'" ref="dischargeOcd3TabRef" variant="ocd3"
            :ranges="commonRanges" :loading-ranges="loadingRanges" />

          <ChargeOccTab v-else-if="activeTab === 'chargeOcc1'" ref="chargeOcc1TabRef" variant="occ1"
            :ranges="commonRanges" :loading-ranges="loadingRanges" />

          <ChargeOccTab v-else-if="activeTab === 'chargeOcc2'" ref="chargeOcc2TabRef" variant="occ2"
            :ranges="commonRanges" :loading-ranges="loadingRanges" />

          <DischargeScdTab v-else-if="activeTab === 'dischargeScd'" ref="dischargeScdTabRef" :ranges="commonRanges"
            :loading-ranges="loadingRanges" />

          <BatchFunCtrlSwitchTab v-else-if="activeTab === 'funCtrlSwitch'" ref="funCtrlSwitchTabRef"
            :options="funCtrlSwitchOptions" />

          <el-form-item style="margin-top: 10px;">
            <el-button @click="emit('update:modelValue', false)">取消</el-button>
            <el-button type="primary" :disabled="bmsIds.length === 0" @click="handleSubmit">
              下发配置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  setBatchBtCodeReq,
  setBatchThirdServerReq,
  setBatchBasicParamsReq,
  setBatchCellOVReq,
  setBatchCellUVReq,
  setBatchBatOCD1Req,
  setBatchBatOCD2Req,
  setBatchBatOCD3Req,
  setBatchBatOCC1Req,
  setBatchBatOCC2Req,
  setBatchBatSCDReq,
  setBatchBatOVReq,
  setBatchBatUVReq,
  setBatchFunCtrlReq
} from "@/api/bms";
import type { BmsOfflineTask, BmsThirdServerItem } from "@/api/bms/types";
import BtcodeTab from "./BtcodeTab.vue";
import ThirdServerTab from "./ThirdServerTab.vue";
import BasicParamsTab from "./BasicParamsTab.vue";
import CellOvTab from "./CellOvTab.vue";
import CellUvTab from "./CellUvTab.vue";
import DischargeOcdTab from "./DischargeOcdTab.vue";
import ChargeOccTab from "./ChargeOccTab.vue";
import DischargeScdTab from "./DischargeScdTab.vue";
import PackOvTab from "./PackOvTab.vue";
import PackUvTab from "./PackUvTab.vue";
import BatchFunCtrlSwitchTab from "./BatchFunCtrlSwitchTab.vue";
import HardwareOcdTab from "./HardwareOcdTab.vue";
import { getThirdServerListReq, getParamsRangeReq } from "@/api/bms";
import type { BmsRangesMap } from "@/api/bms/types";
import { useConfigConfirm } from "@/composables/useConfigConfirm";

defineOptions({ name: "BatchConfigDialog" });

const props = withDefaults(
  defineProps<{
    /** 是否显示弹窗（由父组件 v-model 控制） */
    modelValue: boolean;
    /** 初始勾选的设备编码列表（来自列表多选） */
    initialBmsIds?: string[];
  }>(),
  {
    modelValue: false
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const activeTab = ref<
  | "btcode"
  | "thirdServer"
  | "basicParams"
  | "cellOv"
  | "cellUv"
  | "packOv"
  | "packUv"
  | "dischargeOcd1"
  | "dischargeOcd2"
  | "dischargeOcd3"
  | "hardwareOcd"
  | "chargeOcc1"
  | "chargeOcc2"
  | "dischargeScd"
  | "funCtrlSwitch"
>("btcode");

const { loading, confirmAndSubmit } = useConfigConfirm();

type TabName =
  | "btcode"
  | "thirdServer"
  | "basicParams"
  | "cellOv"
  | "cellUv"
  | "packOv"
  | "packUv"
  | "dischargeOcd1"
  | "dischargeOcd2"
  | "dischargeOcd3"
  | "hardwareOcd"
  | "chargeOcc1"
  | "chargeOcc2"
  | "dischargeScd"
  | "funCtrlSwitch";

const tabList: Array<{ label: string; name: TabName }> = [
  { label: "BT码", name: "btcode" },
  { label: "三方后台", name: "thirdServer" },
  { label: "基础参数", name: "basicParams" },
  { label: "电芯过压保护", name: "cellOv" },
  { label: "电芯欠压保护", name: "cellUv" },
  { label: "总压过压保护", name: "packOv" },
  { label: "总压欠压保护", name: "packUv" },
  { label: "I级放电过流", name: "dischargeOcd1" },
  { label: "II级放电过流", name: "dischargeOcd2" },
  { label: "III级放电过流", name: "dischargeOcd3" },
  { label: "I级充电过流", name: "chargeOcc1" },
  { label: "II级充电过流", name: "chargeOcc2" },
  { label: "放电短路保护", name: "dischargeScd" },
  { label: "功能开关", name: "funCtrlSwitch" }
];

/** 批量 funCtrl：放电 / 充电 / 盲充 / 防打火，由 BatchFunCtrlSwitchTab 通过 options 驱动 */
const funCtrlSwitchOptions = [
  { paramKey: "discharge" as const, label: "放电开关" },
  { paramKey: "charge" as const, label: "充电开关" },
  { paramKey: "blindChg" as const, label: "盲充开关" },
  { paramKey: "preventSpark" as const, label: "防打火开关" }
] as const;

const offlineTask = ref<BmsOfflineTask>(0);

const bmsText = ref<string>("");
const bmsIds = computed(() => normalizeList(bmsText.value));

const btcodeText = ref<string>("");
const btcodes = computed(() => normalizeList(btcodeText.value));

const thirdSrvList = ref<BmsThirdServerItem[]>([]);
const selectedThirdSrvValue = ref<string>("");

/** 统一请求的参数范围（无 cell_mat 参数），供 DischargeOcdTab、dischargeScdTab 使用 */
const commonRanges = ref<BmsRangesMap>({});
const loadingRanges = ref(false);

/** 材料类型：1-铁锂 2-三元（用于需要材料类型的配置项） */
const materialType = ref<1 | 2>(1);

/** 带材料类型的参数范围（用于 cellOv/cellUv/packOv/packUv） */
const materialRanges = ref<BmsRangesMap>({});
const loadingMaterialRanges = ref(false);

const basicParamsTabRef = ref<InstanceType<typeof BasicParamsTab> | null>(null);
const cellOvTabRef = ref<InstanceType<typeof CellOvTab> | null>(null);
const cellUvTabRef = ref<InstanceType<typeof CellUvTab> | null>(null);
const packOvTabRef = ref<InstanceType<typeof PackOvTab> | null>(null);
const packUvTabRef = ref<InstanceType<typeof PackUvTab> | null>(null);
const dischargeOcd1TabRef = ref<InstanceType<typeof DischargeOcdTab> | null>(null);
const dischargeOcd2TabRef = ref<InstanceType<typeof DischargeOcdTab> | null>(null);
const dischargeOcd3TabRef = ref<InstanceType<typeof DischargeOcdTab> | null>(null);
const hardwareOcdTabRef = ref<InstanceType<typeof HardwareOcdTab> | null>(null);
const chargeOcc1TabRef = ref<InstanceType<typeof ChargeOccTab> | null>(null);
const chargeOcc2TabRef = ref<InstanceType<typeof ChargeOccTab> | null>(null);
const dischargeScdTabRef = ref<InstanceType<typeof DischargeScdTab> | null>(null);
const funCtrlSwitchTabRef = ref<InstanceType<typeof BatchFunCtrlSwitchTab> | null>(null);

function normalizeList(input: string): string[] {
  const raw = String(input ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/，/g, ",")
    .replace(/\n/g, ",")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const uniq = new Set<string>();
  for (const it of raw) uniq.add(it);
  return Array.from(uniq);
}

async function loadThirdServerList() {
  const res = await getThirdServerListReq();
  if (res.errno === 0 && res.data?.tsrv_list) {
    thirdSrvList.value = res.data.tsrv_list;
  } else {
    thirdSrvList.value = [];
  }
}

/** 统一请求参数范围（无 cell_mat），避免各 Tab 重复请求 */
async function loadCommonRanges() {
  loadingRanges.value = true;
  try {
    const res = await getParamsRangeReq();
    if (res.errno === 0 && res.data?.ranges) {
      commonRanges.value = res.data.ranges;
    } else {
      commonRanges.value = {};
    }
  } catch {
    commonRanges.value = {};
  } finally {
    loadingRanges.value = false;
  }
}

/** 根据材料类型请求参数范围（用于 cellOv/cellUv/packOv/packUv） */
async function loadMaterialRanges() {
  loadingMaterialRanges.value = true;
  try {
    const res = await getParamsRangeReq({ cell_mat: materialType.value });
    if (res.errno === 0 && res.data?.ranges) {
      materialRanges.value = res.data.ranges;
    } else {
      materialRanges.value = {};
    }
  } catch {
    materialRanges.value = {};
  } finally {
    loadingMaterialRanges.value = false;
  }
}

async function submitBtCode() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  if (btcodes.value.length === 0) {
    ElMessage.warning("请先输入 BT 码（支持逗号/换行分割）");
    return;
  }

  const finalBtCodes =
    btcodes.value.length === 1
      ? Array.from({ length: bmsIds.value.length }).map(() => btcodes.value[0])
      : btcodes.value;

  if (finalBtCodes.length !== bmsIds.value.length) {
    ElMessage.warning(`BT码数量(${finalBtCodes.length})需与设备数量(${bmsIds.value.length})一致`);
    return;
  }

  await confirmAndSubmit({
    configName: "BT码配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBtCodeReq({
        offline_task: offlineTask.value,
        params: { bms_id: bmsIds.value, btcode: finalBtCodes }
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitThirdServer() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  if (!selectedThirdSrvValue.value) {
    ElMessage.warning("请选择三方后台地址");
    return;
  }

  await confirmAndSubmit({
    configName: "三方后台配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchThirdServerReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: { ctsrv: selectedThirdSrvValue.value }
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitBasicParams() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = basicParamsTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的基础参数（电芯容量 20～100 Ah）");
    return;
  }

  await confirmAndSubmit({
    configName: "基础参数配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBasicParamsReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitCellOv() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = cellOvTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的电芯过压保护参数（触发门限需大于恢复门限）");
    return;
  }

  await confirmAndSubmit({
    configName: "电芯过压保护配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchCellOVReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitDischargeOcd1() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = dischargeOcd1TabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的 I 级放电过流参数");
    return;
  }
  await confirmAndSubmit({
    configName: "I级放电过流配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOCD1Req({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitDischargeOcd2() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = dischargeOcd2TabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的 II 级放电过流参数");
    return;
  }
  await confirmAndSubmit({
    configName: "II级放电过流配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOCD2Req({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitDischargeOcd3() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = dischargeOcd3TabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的 III 级放电过流参数");
    return;
  }
  await confirmAndSubmit({
    configName: "III级放电过流配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOCD3Req({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitChargeOcc1() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = chargeOcc1TabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的 I 级充电过流参数");
    return;
  }
  await confirmAndSubmit({
    configName: "I级充电过流配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOCC1Req({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitChargeOcc2() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = chargeOcc2TabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的 II 级充电过流参数");
    return;
  }
  await confirmAndSubmit({
    configName: "II级充电过流配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOCC2Req({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitDischargeScd() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = dischargeScdTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的放电短路保护参数");
    return;
  }
  await confirmAndSubmit({
    configName: "放电短路保护配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatSCDReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitCellUv() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = cellUvTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的电芯欠压保护参数（触发门限需小于恢复门限）");
    return;
  }

  await confirmAndSubmit({
    configName: "电芯欠压保护配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchCellUVReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitPackOv() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = packOvTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的总压过压保护参数（触发门限需大于恢复门限）");
    return;
  }

  await confirmAndSubmit({
    configName: "总压过压保护配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatOVReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitPackUv() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = packUvTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请填写完整且有效的总压欠压保护参数（触发门限需小于恢复门限）");
    return;
  }

  await confirmAndSubmit({
    configName: "总压欠压保护配置",
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchBatUVReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

async function submitFunCtrlSwitch() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = funCtrlSwitchTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请选择开关类型与状态");
    return;
  }
  await confirmAndSubmit({
    configName: tab.getConfigName(),
    isBatch: true,
    deviceCount: bmsIds.value.length,
    execute: async () => {
      return await setBatchFunCtrlReq({
        bms_id_list: bmsIds.value,
        offline_task: offlineTask.value,
        params: tab.getPayload()
      });
    },
    onSuccess: () => {
      emit("success");
    }
  });
}

function getSectionTitle(): string {
  const map: Record<typeof activeTab.value, string> = {
    btcode: "BT码设置（批量）",
    thirdServer: "三方后台配置（批量）",
    basicParams: "基础参数配置（批量）",
    cellOv: "电芯过压保护配置（批量）",
    cellUv: "电芯欠压保护配置（批量）",
    packOv: "总压过压保护配置（批量）",
    packUv: "总压欠压保护配置（批量）",
    dischargeOcd1: "I级放电过流配置（批量）",
    dischargeOcd2: "II级放电过流配置（批量）",
    dischargeOcd3: "III级放电过流配置（批量）",
    hardwareOcd: "硬件级放电过流（只读）",
    chargeOcc1: "I级充电过流配置（批量）",
    chargeOcc2: "II级充电过流配置（批量）",
    dischargeScd: "放电短路保护配置（批量）",
    funCtrlSwitch: "功能开关配置（批量）"
  };
  return map[activeTab.value];
}

/** 判断当前 tab 是否需要显示材料类型选择 */
function shouldShowMaterialType(): boolean {
  return ["cellOv", "cellUv", "packOv", "packUv"].includes(activeTab.value);
}

function handleSubmit() {
  if (activeTab.value === "btcode") submitBtCode();
  else if (activeTab.value === "thirdServer") submitThirdServer();
  else if (activeTab.value === "basicParams") submitBasicParams();
  else if (activeTab.value === "cellOv") submitCellOv();
  else if (activeTab.value === "cellUv") submitCellUv();
  else if (activeTab.value === "packOv") submitPackOv();
  else if (activeTab.value === "packUv") submitPackUv();
  else if (activeTab.value === "dischargeOcd1") submitDischargeOcd1();
  else if (activeTab.value === "dischargeOcd2") submitDischargeOcd2();
  else if (activeTab.value === "dischargeOcd3") submitDischargeOcd3();
  else if (activeTab.value === "hardwareOcd") {
    ElMessage.warning("硬件级放电过流参数为只读，不允许批量配置");
    return;
  }
  else if (activeTab.value === "chargeOcc1") submitChargeOcc1();
  else if (activeTab.value === "chargeOcc2") submitChargeOcc2();
  else if (activeTab.value === "dischargeScd") submitDischargeScd();
  else if (activeTab.value === "funCtrlSwitch") submitFunCtrlSwitch();
}

loadThirdServerList();
loadCommonRanges();

/** 监听 props.initialBmsIds 变化，更新 bmsText */
watch(
  () => props.initialBmsIds,
  (newIds) => {
    if (newIds && newIds.length > 0) {
      bmsText.value = newIds.join(",");
    }
  },
  { immediate: true }
);

/** 监听 tab 切换，当切换到需要材料类型的 tab 时加载参数范围 */
watch(activeTab, (newTab) => {
  if (["cellOv", "cellUv", "packOv", "packUv"].includes(newTab)) {
    loadMaterialRanges();
  }
}, { immediate: true });

/** 监听材料类型变化，重新加载参数范围 */
watch(materialType, () => {
  if (shouldShowMaterialType()) {
    loadMaterialRanges();
  }
});
</script>

<style scoped lang="scss">
/* 容器基础设置 */
.batch-dialog {
  padding: 8px;
}

/* 修复 Label 宽度自适应 */
:deep(.el-form-item__label) {
  width: auto !important;
  color: #475569;
  font-weight: 500;
}

/* 主卡片容器 */
.batch-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.batch-card__head {
  margin-bottom: 10px;
  border-left: 4px solid var(--el-color-primary);
  padding-left: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.hint {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

/* Tab 切换器 */
.custom-tabs {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tab-item {
  padding: 10px 12px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  &:hover {
    color: #0f172a;
    border-color: rgba(64, 158, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }

  &.active {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    border-color: #3b82f6;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
}

/* 输入框与下拉框美化 */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-textarea__inner) {
  background-color: #ffffff !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 0 0 1px #94a3b8 inset !important;
  }

  &.is-focus,
  &:focus-within,
  &:focus {
    background-color: #ffffff !important;
    box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.1) !important;
  }
}

/* 输入框内部文字 */
:deep(.el-input__inner) {
  color: #000000 !important;
  font-weight: 500;
  height: 32px;

  &::placeholder {
    color: #cbd5e1;
  }
}

/* 文本域 */
:deep(.el-textarea__inner) {
  color: #000000 !important;
  font-weight: 500;
  padding: 8px 12px;

  &::placeholder {
    color: #cbd5e1;
  }
}


/* 单选框标签 */
:deep(.el-radio__label) {
  color: #606266 !important;
}

/* 禁用状态 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f1f5f9 !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;

  .el-input__inner {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }
}

/* 按钮样式 */
:deep(.el-button--primary) {
  border-radius: 8px;
  font-weight: 500;
  padding: 8px 16px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border: none;

  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}
</style>

<style lang="scss">
.batch-config-dialog {
  .el-dialog {
    border-radius: 20px !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;

    .el-dialog__header {
      background: #ffffff;
      margin-right: 0;
      padding: 20px 24px;
      border-radius: 20px 20px 0 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;

      .el-dialog__close {
        color: #94a3b8;
        font-size: 20px;

        &:hover {
          color: #0f172a;
        }
      }
    }

    .el-dialog__title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .el-dialog__body {
      padding: 0 !important;
      background: #ffffff;
      border-radius: 0 0 20px 20px;
    }


    .el-radio__label {
      color: #606266 !important;
    }

    .el-dialog__close:hover {
      background-color: #858585 !important;
      color: #0e0e0e !important;
    }

    .el-select__input {
      color: #000000 !important;
    }
  }

  /* 全局弹窗外框样式 */
  .el-popper.is-light {
    background: #ffffff !important;
    // border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #606266 !important;
    box-shadow: 0 0 0 1px #e2e8f0 inset !important;
    transition: all 0.2s ease !important;
  }

  .el-popper.is-light>.el-popper__arrow:before {
    background-color: #ffffff !important;
    border-top-color: #e2e8f0 !important;
    border-left-color: #e2e8f0 !important;
  }

  .el-select-dropdown__item {
    color: #606266 !important;
  }

  .el-select-dropdown__item.is-hovering {
    background: #e6e6e6 !important;
    color: #606266 !important;
  }
}
</style>
