<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  setBatchBtCodeReq,
  setBatchThirdServerReq,
  setBatchBasicParamsReq,
  setBatchCellOVReq,
  setBatchCellUVReq,
  setBatchBatOCD1Req,
  setBatchBatOCD2Req,
  setBatchBatSCDReq,
  setBatchBatOVReq,
  setBatchFunCtrlReq
} from "@/api/bms";
import type { BmsOfflineTask, BmsThirdServerItem } from "@/api/bms/types";
import BtcodeTab from "./BtcodeTab.vue";
import ThirdServerTab from "./ThirdServerTab.vue";
import BasicParamsTab from "./BasicParamsTab.vue";
import CellOvTab from "./CellOvTab.vue";
import CellUvTab from "./CellUvTab.vue";
import DischargeOcdTab from "./DischargeOcdTab.vue";
import DischargeScdTab from "./DischargeScdTab.vue";
import PackOvTab from "./PackOvTab.vue";
import SwitchTab from "./SwitchTab.vue";
import { getThirdServerListReq, getParamsRangeReq } from "@/api/bms";
import type { BmsRangesMap } from "@/api/bms/types";

defineOptions({ name: "BatchConfigDialog" });

const props = defineProps<{
  /** 初始勾选的设备编码列表（来自列表多选） */
  initialBmsIds?: string[];
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "success"): void;
}>();

const activeTab = ref<
  | "btcode"
  | "thirdServer"
  | "basicParams"
  | "cellOv"
  | "cellUv"
  | "packOv"
  | "dischargeOcd1"
  | "dischargeOcd2"
  | "dischargeScd"
  | "dischargeSwitch"
  | "blindChargeSwitch"
>("btcode");
const loading = ref(false);

const offlineTask = ref<BmsOfflineTask>(0);

const bmsText = ref<string>((props.initialBmsIds ?? []).join(","));
const bmsIds = computed(() => normalizeList(bmsText.value));

const btcodeText = ref<string>("");
const btcodes = computed(() => normalizeList(btcodeText.value));

const thirdSrvList = ref<BmsThirdServerItem[]>([]);
const selectedThirdSrvValue = ref<string>("");

/** 统一请求的参数范围（无 cell_mat 参数），供 DischargeOcdTab、DischargeScdTab 使用 */
const commonRanges = ref<BmsRangesMap>({});
const loadingRanges = ref(false);

const basicParamsTabRef = ref<InstanceType<typeof BasicParamsTab> | null>(null);
const cellOvTabRef = ref<InstanceType<typeof CellOvTab> | null>(null);
const cellUvTabRef = ref<InstanceType<typeof CellUvTab> | null>(null);
const packOvTabRef = ref<InstanceType<typeof PackOvTab> | null>(null);
const dischargeOcd1TabRef = ref<InstanceType<typeof DischargeOcdTab> | null>(null);
const dischargeOcd2TabRef = ref<InstanceType<typeof DischargeOcdTab> | null>(null);
const dischargeScdTabRef = ref<InstanceType<typeof DischargeScdTab> | null>(null);
const dischargeSwitchTabRef = ref<InstanceType<typeof SwitchTab> | null>(null);
const blindChargeSwitchTabRef = ref<InstanceType<typeof SwitchTab> | null>(null);

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

  loading.value = true;
  try {
    const res = await setBatchBtCodeReq({
      offline_task: offlineTask.value,
      params: { bms_id: bmsIds.value, btcode: finalBtCodes }
    });
    if (res.errno === 0) {
      ElMessage.success("BT码批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "BT码批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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

  loading.value = true;
  try {
    const res = await setBatchThirdServerReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: { ctsrv: selectedThirdSrvValue.value }
    });
    if (res.errno === 0) {
      ElMessage.success("三方后台批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "三方后台批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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

  loading.value = true;
  try {
    const res = await setBatchBasicParamsReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("基础参数批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "基础参数批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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

  loading.value = true;
  try {
    const res = await setBatchCellOVReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("电芯过压保护批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "电芯过压保护批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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
  loading.value = true;
  try {
    const res = await setBatchBatOCD1Req({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("I级放电过流批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "I级放电过流批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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
  loading.value = true;
  try {
    const res = await setBatchBatOCD2Req({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("II级放电过流批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "II级放电过流批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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
  loading.value = true;
  try {
    const res = await setBatchBatSCDReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("放电短路保护批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "放电短路保护批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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

  loading.value = true;
  try {
    const res = await setBatchCellUVReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("电芯欠压保护批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "电芯欠压保护批量配置失败");
    }
  } finally {
    loading.value = false;
  }
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

  loading.value = true;
  try {
    const res = await setBatchBatOVReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: tab.getPayload()
    });
    if (res.errno === 0) {
      ElMessage.success("总压过压保护批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "总压过压保护批量配置失败");
    }
  } finally {
    loading.value = false;
  }
}

async function submitDischargeSwitch() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = dischargeSwitchTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请选择放电开关状态");
    return;
  }
  loading.value = true;
  try {
    const res = await setBatchFunCtrlReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: { discharge: tab.getPayload().op }
    });
    if (res.errno === 0) {
      ElMessage.success("放电开关批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "放电开关批量配置失败");
    }
  } finally {
    loading.value = false;
  }
}

async function submitBlindChargeSwitch() {
  if (bmsIds.value.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  const tab = blindChargeSwitchTabRef.value;
  if (!tab?.validate()) {
    ElMessage.warning("请选择盲充开关状态");
    return;
  }
  loading.value = true;
  try {
    const res = await setBatchFunCtrlReq({
      bms_id_list: bmsIds.value,
      offline_task: offlineTask.value,
      params: { blindChg: tab.getPayload().op }
    });
    if (res.errno === 0) {
      ElMessage.success("盲充开关批量配置已下发");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "盲充开关批量配置失败");
    }
  } finally {
    loading.value = false;
  }
}

function getSectionTitle(): string {
  const map: Record<typeof activeTab.value, string> = {
    btcode: "BT码设置（批量）",
    thirdServer: "三方后台配置（批量）",
    basicParams: "基础参数配置（批量）",
    cellOv: "电芯过压保护配置（批量）",
    cellUv: "电芯欠压保护配置（批量）",
    packOv: "总压过压保护配置（批量）",
    dischargeOcd1: "I级放电过流配置（批量）",
    dischargeOcd2: "II级放电过流配置（批量）",
    dischargeScd: "放电短路保护配置（批量）",
    dischargeSwitch: "放电开关配置（批量）",
    blindChargeSwitch: "盲充开关配置（批量）"
  };
  return map[activeTab.value];
}

function handleSubmit() {
  if (activeTab.value === "btcode") submitBtCode();
  else if (activeTab.value === "thirdServer") submitThirdServer();
  else if (activeTab.value === "basicParams") submitBasicParams();
  else if (activeTab.value === "cellOv") submitCellOv();
  else if (activeTab.value === "cellUv") submitCellUv();
  else if (activeTab.value === "packOv") submitPackOv();
  else if (activeTab.value === "dischargeOcd1") submitDischargeOcd1();
  else if (activeTab.value === "dischargeOcd2") submitDischargeOcd2();
  else if (activeTab.value === "dischargeScd") submitDischargeScd();
  else if (activeTab.value === "dischargeSwitch") submitDischargeSwitch();
  else if (activeTab.value === "blindChargeSwitch") submitBlindChargeSwitch();
}

loadThirdServerList();
loadCommonRanges();
</script>

<template>
  <div v-loading="loading" class="batch-dialog">
    <div class="batch-card">
      <div class="batch-card__head">
        <div class="section-title">
          {{ getSectionTitle() }}
        </div>
      </div>

      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="BT码设置" name="btcode" />
        <el-tab-pane label="三方后台配置" name="thirdServer" />
        <el-tab-pane label="基础参数配置" name="basicParams" />
        <el-tab-pane label="电芯过压保护配置" name="cellOv" />
        <el-tab-pane label="电芯欠压保护配置" name="cellUv" />
        <el-tab-pane label="总压过压保护配置" name="packOv" />
        <el-tab-pane label="I级放电过流配置" name="dischargeOcd1" />
        <el-tab-pane label="II级放电过流配置" name="dischargeOcd2" />
        <el-tab-pane label="放电短路保护配置" name="dischargeScd" />
        <el-tab-pane label="放电开关配置" name="dischargeSwitch" />
        <el-tab-pane label="盲充开关配置" name="blindChargeSwitch" />
      </el-tabs>

      <el-form label-width="110px" class="form">
        <el-form-item label="设备编码">
          <el-input
            v-model="bmsText"
            type="textarea"
            :rows="3"
            placeholder="逗号、换行分割，可从设备列表多选自动带入"
          />
          <div class="hint">数量：{{ bmsIds.length }}</div>
        </el-form-item>

        <el-form-item label="离线任务">
          <el-radio-group v-model="offlineTask">
            <el-radio :value="0">仅配置在线设备</el-radio>
            <el-radio :value="1">配置所有设备（包括离线任务）</el-radio>
          </el-radio-group>
        </el-form-item>

        <BtcodeTab
          v-if="activeTab === 'btcode'"
          v-model:btcode-text="btcodeText"
          :bt-count="btcodes.length"
          :bms-ids="bmsIds"
        />

        <ThirdServerTab
          v-else-if="activeTab === 'thirdServer'"
          v-model:selected-value="selectedThirdSrvValue"
          :third-srv-list="thirdSrvList"
        />

        <BasicParamsTab v-else-if="activeTab === 'basicParams'" ref="basicParamsTabRef" />

        <CellOvTab v-else-if="activeTab === 'cellOv'" ref="cellOvTabRef" />

        <CellUvTab v-else-if="activeTab === 'cellUv'" ref="cellUvTabRef" />

        <PackOvTab
          v-else-if="activeTab === 'packOv'"
          ref="packOvTabRef"
          :ranges="commonRanges"
          :loading-ranges="loadingRanges"
        />

        <DischargeOcdTab
          v-else-if="activeTab === 'dischargeOcd1'"
          ref="dischargeOcd1TabRef"
          variant="ocd1"
          :ranges="commonRanges"
          :loading-ranges="loadingRanges"
        />

        <DischargeOcdTab
          v-else-if="activeTab === 'dischargeOcd2'"
          ref="dischargeOcd2TabRef"
          variant="ocd2"
          :ranges="commonRanges"
          :loading-ranges="loadingRanges"
        />

        <DischargeScdTab
          v-else-if="activeTab === 'dischargeScd'"
          ref="dischargeScdTabRef"
          :ranges="commonRanges"
          :loading-ranges="loadingRanges"
        />

        <SwitchTab
          v-else-if="activeTab === 'dischargeSwitch'"
          ref="dischargeSwitchTabRef"
          title="放电开关"
          :default-value="1"
        />

        <SwitchTab
          v-else-if="activeTab === 'blindChargeSwitch'"
          ref="blindChargeSwitchTabRef"
          title="盲充开关"
          :default-value="1"
        />

        <el-form-item style="margin-top: 10px;">
          <el-button @click="emit('cancel')">取消</el-button>
          <el-button
            type="primary"
            :disabled="bmsIds.length === 0"
            @click="handleSubmit"
          >
            下发配置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.batch-dialog {
  padding: 4px;
}

.batch-card {
  background: var(--bms-bg-card);
  border-radius: 10px;
  border: 1px solid var(--bms-border);
  padding: 14px 16px 10px;
}

.batch-card__head {
  margin-bottom: 8px;
}

.hint {
  margin-top: 6px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}

.batch-dialog :deep(.el-textarea__inner),
.batch-dialog :deep(.el-input__wrapper),
.batch-dialog :deep(.el-select__wrapper) {
  background: var(--bms-bg-input) !important;
  border-color: var(--bms-border);
  color: var(--bms-text);
}

.section-title {
  font-weight: 600;
  color: var(--bms-text);
}
</style>

