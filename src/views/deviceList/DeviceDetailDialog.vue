<template>
  <el-dialog
    :model-value="modelValue"
    :title="bmsId ? `设备总览 · ${bmsId}` : '设备总览'"
    class="bms-dashboard-dialog"
    width="95vw"
    top="3vh"
    destroy-on-close
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="dashboard-body">
      <template v-if="!loading && (baseInfo || runInfo)">

        <div class="col-side col-left">

          <div class="dash-card battery-card">
            <div class="card-head">
              <span class="title">实时状态</span>
              <span class="status-badge" :class="runInfo?.online === 1 ? 'online' : 'offline'">
                {{ runInfo?.online === 1 ? "在线" : "离线" }}
              </span>
            </div>
            <div class="battery-wrapper">
              <div class="battery-3d-box" :style="{ '--fill-color': currentSocColor, '--glow-color': currentSocColor }">
                <div class="battery-body">
                  <div class="fill" :style="{ width: (runInfo?.soc ?? 0) + '%' }"><div class="wave"></div></div>
                  <div class="lines"><span v-for="i in 6" :key="i"></span></div>
                  <div v-if="isCharging" class="bolt">⚡</div>
                </div>
                <div class="battery-cap"></div>
                <div class="overlay">
                  <span class="num">{{ runInfo?.soc ?? "--" }}</span><span class="unit">%</span>
                </div>
              </div>
              <div class="battery-stats">
                 <div class="b-stat"><span class="l">剩余容量</span><span class="v">{{ runInfo?.remCapD ?? "--" }} Ah</span></div>
                 <div class="b-stat"><span class="l">满电容量</span><span class="v">{{ runInfo?.fullCapD ?? "--" }} Ah</span></div>
                 <div class="b-stat"><span class="l">循环次数</span><span class="v">{{ runInfo?.loop ?? "--" }} 次</span></div>
              </div>
            </div>
          </div>

          <div class="dash-card gauges-card">
             <div class="gauges-grid">
               <div class="gauge-cell" ref="gaugeVoltRef"></div>
               <div class="gauge-cell" ref="gaugeCurrentRef"></div>
               <div class="gauge-cell" ref="gaugeSocRef"></div>
               <div class="gauge-cell" ref="gaugeSohRef"></div>
             </div>
          </div>
        </div>

        <div class="col-main">

          <div class="chart-row">
            <div class="dash-card vol-chart-card">
               <div class="card-head">
                 <span class="title">电芯电压一致性 (mV)</span>
                 <div class="legend">
                    <span class="tag max">Max: {{ runInfo?.maxCellIndex != null ? runInfo.maxCellIndex + 1 : '-' }}#</span>
                    <span class="tag min">Min: {{ runInfo?.minCellIndex != null ? runInfo.minCellIndex + 1 : '-' }}#</span>
                 </div>
               </div>
               <div class="chart-content" ref="cellVoltsChartRef"></div>
            </div>

            <div class="dash-card temp-card">
               <div class="card-head"><span class="title">温度 (°C)</span></div>
               <div class="temp-body">
                  <div class="temp-main-row">
                     <div class="temp-box mos">
                       <span class="n">MOS</span><span class="v">{{ runInfo?.mos_T }}</span>
                       <div class="p-bar"><div :style="{width: tempBarPercent(runInfo?.mos_T)+'%'}"></div></div>
                     </div>
                     <div class="temp-box env">
                       <span class="n">环境</span><span class="v">{{ runInfo?.env_T }}</span>
                       <div class="p-bar"><div :style="{width: tempBarPercent(runInfo?.env_T)+'%'}"></div></div>
                     </div>
                  </div>
                  <div class="divider"></div>
                  <div class="temp-grid">
                     <div v-for="(t, idx) in (runInfo?.cell_T || [])" :key="idx" class="t-cell">
                        <span class="k">电芯温度{{idx+1}}</span><span class="val" :class="{hot: t>60}">{{t}}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div class="dash-card tabs-card">
            <el-tabs v-model="activeTab" class="custom-tabs">

               <el-tab-pane label="基础档案" name="info">
                 <div class="info-grid-tab">
                    <div class="info-item">
                      <span class="label">BMS ID</span>
                      <span class="value mono highlight">{{ baseInfo?.bmsId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">设备规格</span>
                      <span class="value">{{ baseInfo?.cellCnt }}串 / {{ cellMatLabel(baseInfo?.cellMat) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">额定容量</span>
                      <span class="value">{{ baseInfo?.capactiyD }} Ah</span>
                    </div>
                    <div class="info-item">
                      <span class="label">电池编码 (BT)</span>
                      <span class="value">{{ baseInfo?.btCode || '--' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">软件版本</span>
                      <span class="value">{{ baseInfo?.version }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">IMSI</span>
                      <span class="value">{{ baseInfo?.imsi }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">数据更新时间</span>
                      <span class="value">{{ runInfo?.timeF }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">三方后台</span>
                      <span class="value">{{ baseInfo?.tServer || '--' }}</span>
                    </div>
                 </div>
               </el-tab-pane>

               <el-tab-pane label="保护状态" name="protect">
                 <div class="status-grid">
                    <div v-for="item in protect_bit_config" :key="item.bit" class="status-item" :class="protectBit(item.bit).isActive ? 'is-danger' : 'is-safe'">
                       <span class="dot"></span>
                       <span class="lbl">{{ item.label }}</span>
                       <span class="val">{{ protectBit(item.bit).text }}</span>
                    </div>
                 </div>
               </el-tab-pane>

               <el-tab-pane label="系统状态" name="status">
                 <div class="status-grid">
                    <div v-for="item in status_bit_config" :key="item.bit" class="status-item" :class="statusBit(item).isGood ? 'is-safe' : 'is-warn'">
                       <span class="dot"></span>
                       <span class="lbl">{{ item.label }}</span>
                       <span class="val">{{ statusBit(item).text }}</span>
                    </div>
                 </div>
               </el-tab-pane>

               <el-tab-pane label="开关状态" name="switch">
                 <div class="status-grid">
                    <div v-for="item in switch_fun_ctrl_bit_config" :key="item.bit" class="status-item" :class="switchBit(item).isOn ? 'is-safe' : 'is-off'">
                       <span class="dot"></span>
                       <span class="lbl">{{ item.label }}</span>
                       <span class="val">{{ switchBit(item).text }}</span>
                    </div>
                 </div>
               </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <div class="col-side col-right">
          <div class="dash-card control-card">
             <div class="card-head"><span class="title">控制中心</span></div>
             <div v-if="refreshing" class="refresh-overlay">
               <div class="refresh-tip">
                 <el-icon class="is-loading"><Loading /></el-icon>
                 <span>等待设备执行指令，即将刷新数据...</span>
               </div>
             </div>
             <div class="ctrl-body">
                <div v-if="bmsOp.chg || bmsOp.dschg" class="ctrl-group ctrl-group-charge">
                   <div class="g-title">充放电控制</div>
                   <div v-if="bmsOp.chg" class="btn-row">
                      <button
                        type="button"
                        class="c-btn primary"
                        aria-label="开启充电"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('charge', 1)"
                      >
                         <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                         <span>开启充电</span>
                      </button>
                      <button
                        type="button"
                        class="c-btn danger"
                        aria-label="关闭充电"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('charge', 0)"
                      >
                         <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                         <span>关闭充电</span>
                      </button>
                   </div>
                   <div v-if="bmsOp.dschg" class="btn-row">
                      <button
                        type="button"
                        class="c-btn primary"
                        aria-label="开启放电"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('discharge', 1)"
                      >
                         <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                         <span>开启放电</span>
                      </button>
                      <button
                        type="button"
                        class="c-btn danger"
                        aria-label="关闭放电"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('discharge', 0)"
                      >
                         <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                         <span>关闭放电</span>
                      </button>
                   </div>
                </div>
                <div v-if="bmsOp.blindchg || bmsOp.beep || bmsOp.predschg" class="ctrl-group">
                   <div class="g-title">功能开关</div>
                   <div class="btn-grid">
                      <template v-if="bmsOp.blindchg">
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('blindChg', 1)"
                        >
                          允盲充
                        </button>
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('blindChg', 0)"
                        >
                          禁盲充
                        </button>
                      </template>
                      <template v-if="bmsOp.beep">
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('beep', 1)"
                        >
                          开蜂鸣
                        </button>
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('beep', 0)"
                        >
                          关蜂鸣
                        </button>
                      </template>
                      <template v-if="bmsOp.predschg">
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('preventSpark', 1)"
                        >
                          开防火
                        </button>
                        <button
                          class="c-btn"
                          :disabled="cmdLoading"
                          :class="{ 'is-loading': cmdLoading }"
                          @click="handleFunCtrl('preventSpark', 0)"
                        >
                          关防火
                        </button>
                      </template>
                   </div>
                </div>

                <div v-if="bmsOp.scRecov || bmsOp.mosRecov || bmsOp.reset || bmsCfg.basic || bmsCfg.btCode || bmsCfg.tServer || bmsCfg.voltparams || bmsCfg.currparams || bmsCfg.tempparams" class="ctrl-group">
                   <div class="g-title">维护操作</div>
                   <div class="btn-col">
                      <button
                        v-if="bmsOp.scRecov"
                        class="c-btn warn"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('scRecov', 1)"
                      >
                        短路恢复
                      </button>
                      <button
                        v-if="bmsOp.mosRecov"
                        class="c-btn warn"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('mosFailRecov', 1)"
                      >
                        MOS故障恢复
                      </button>
                      <button
                        v-if="bmsOp.reset"
                        class="c-btn danger full"
                        :disabled="cmdLoading"
                        :class="{ 'is-loading': cmdLoading }"
                        @click="handleFunCtrl('reset', 1)"
                      >
                        重启 BMS
                      </button>
                      <button v-if="bmsCfg.basic || bmsCfg.btCode || bmsCfg.tServer || bmsCfg.voltparams || bmsCfg.currparams || bmsCfg.tempparams" class="c-btn success full" @click="handleSetParams">参数配置</button>
                   </div>
                </div>

             </div>
          </div>
        </div>

      </template>
      <div v-else class="empty-state">暂无数据</div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getBasicInfoReq,
  getBatDataReq,
  processBasicInfo,
  processRunInfo
} from "@/api/bms";
import {
  cell_mat_dict,
  getDictLabel,
  protect_bit_config,
  status_bit_config,
  switch_fun_ctrl_bit_config
} from "@/utils/dict";
import type { BmsBasicInfo, BmsRunInfo } from "@/api/bms/types";
import echarts from "@/plugins/echarts";
import { useFunCtrl, type FunCtrlFunc } from "./useFunCtrl";
import { useBmsAuth } from "@/composables/useBmsAuth";
import { Loading } from "@element-plus/icons-vue";

defineOptions({ name: "DeviceDetailDialog" });

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    bmsId?: string;
  }>(),
  { bmsId: "" }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const router = useRouter();
const loading = ref(false);
const activeTab = ref("info"); // 默认选中基础档案
const baseInfo = ref<BmsBasicInfo | null>(null);
const runInfo = ref<BmsRunInfo | null>(null);

// 功能控制
const { cmdLoading, refreshing, sendFunCtrl } = useFunCtrl({
  onAfterSend: (id: string) => {
    loadDetail(id);
  }
});

// 权限管理
const { bmsOp, bmsCfg } = useBmsAuth();

// Refs for charts
const gaugeSocRef = ref<HTMLElement | null>(null);
const gaugeSohRef = ref<HTMLElement | null>(null);
const gaugeVoltRef = ref<HTMLElement | null>(null);
const gaugeCurrentRef = ref<HTMLElement | null>(null);
const cellVoltsChartRef = ref<HTMLElement | null>(null);

let chartSoc: ReturnType<typeof echarts.init> | null = null;
let chartSoh: ReturnType<typeof echarts.init> | null = null;
let chartVolt: ReturnType<typeof echarts.init> | null = null;
let chartCurrent: ReturnType<typeof echarts.init> | null = null;
let chartCellVolts: ReturnType<typeof echarts.init> | null = null;

const themeColor = "#00bcd4";
const successColor = "#00e676";
const warningColor = "#ffb300";
const dangerColor = "#ff5252";

const isCharging = computed(() => {
  const current = parseFloat(runInfo.value?.currentD ?? "0");
  return current > 0.5;
});

const currentSocColor = computed(() => {
  const soc = runInfo.value?.soc ?? 0;
  if (soc > 50) return successColor;
  if (soc > 20) return warningColor;
  return dangerColor;
});

function formatDateTime(ts: Date) {
  return (
    ts.getFullYear() + "-" +
    String(ts.getMonth() + 1).padStart(2, "0") + "-" +
    String(ts.getDate()).padStart(2, "0") + " " +
    String(ts.getHours()).padStart(2, "0") + ":" +
    String(ts.getMinutes()).padStart(2, "0") + ":" +
    String(ts.getSeconds()).padStart(2, "0")
  );
}

// 仪表盘初始化
function initGauge(el: HTMLElement | null, value: number, title: string, unit: string, max: number, color: string) {
  if (!el) return;
  const chart = echarts.init(el);
  const safeValue = Math.min(max, Math.max(0, value));
  chart.setOption({
    series: [{
      type: "gauge",
      startAngle: 180, endAngle: 0, min: 0, max,
      splitNumber: 1, radius: "100%", center: ["50%", "75%"],
      itemStyle: { color: color, shadowColor: color, shadowBlur: 10 },
      progress: { show: true, width: 8, roundCap: true },
      axisLine: { roundCap: true, lineStyle: { width: 8, color: [[1, "rgba(255,255,255,0.1)"]] } },
      pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      title: { show: true, offsetCenter: [0, "20%"], fontSize: 13, color: "rgba(255,255,255,0.7)" },
      detail: {
        valueAnimation: true, offsetCenter: [0, "-25%"], fontSize: 22, fontWeight: 'bold',
        formatter: (val: number) => val.toFixed(unit === ' A' || unit === ' V' ? 1 : 0),
        color: "#fff"
      },
      data: [{ value: safeValue, name: title }]
    }]
  });
  return chart;
}

function updateGauges() {
  const r = runInfo.value;
  if (!r) return;
  if (gaugeSocRef.value) {
    chartSoc?.dispose();
    chartSoc = initGauge(gaugeSocRef.value, r.soc ?? 0, "SOC", "%", 100, currentSocColor.value);
  }
  if (gaugeSohRef.value) {
    chartSoh?.dispose();
    chartSoh = initGauge(gaugeSohRef.value, r.soh ?? 0, "SOH", "%", 100, themeColor);
  }
  const volt = parseFloat(r.batVoltD ?? "0") || 0;
  if (gaugeVoltRef.value) {
    chartVolt?.dispose();
    chartVolt = initGauge(gaugeVoltRef.value, volt, "总压", " V", Math.max(60, volt * 1.2), themeColor);
  }
  const cur = parseFloat(r.currentD ?? "0") || 0;
  const absCur = Math.abs(cur);
  if (gaugeCurrentRef.value) {
    chartCurrent?.dispose();
    chartCurrent = initGauge(
      gaugeCurrentRef.value, absCur, "电流", " A", Math.max(50, absCur * 1.5), cur >= 0 ? successColor : warningColor
    );
  }
}

function initCellVoltsChart() {
  const el = cellVoltsChartRef.value;
  const r = runInfo.value;
  if (!el || !r?.cell_volts?.length) return;
  chartCellVolts?.dispose();
  chartCellVolts = echarts.init(el);
  const vols = r.cell_volts;
  const minIdx = r.minCellIndex ?? -1;
  const maxIdx = r.maxCellIndex ?? -1;
  const data = vols.map((v, i) => {
    let color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: themeColor }, { offset: 1, color: "rgba(0, 188, 212, 0.1)" }]);
    if (i === minIdx) color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: dangerColor }, { offset: 1, color: "rgba(244, 67, 54, 0.1)" }]);
    if (i === maxIdx) color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: warningColor }, { offset: 1, color: "rgba(255, 179, 0, 0.1)" }]);
    return { value: v, itemStyle: { color, borderRadius: [3, 3, 0, 0] } };
  });

  chartCellVolts.setOption({
    grid: { left: 10, right: 10, top: 20, bottom: 20, containLabel: true },
    tooltip: { trigger: "axis", backgroundColor: "rgba(20, 20, 20, 0.9)", borderColor: "#333", textStyle: { color: "#fff" }, formatter: "{b}: {c} mV" },
    xAxis: { type: "category", data: vols.map((_, i) => `${i + 1}`), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#999", fontSize: 11 } },
    yAxis: { type: "value", scale: true, splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } }, axisLabel: { color: "#999", fontSize: 11 } },
    series: [{ type: "bar", data, barWidth: "60%", barMaxWidth: 24 }]
  });
}

async function loadDetail(bmsId: string) {
  loading.value = true;
  baseInfo.value = null; runInfo.value = null;
  try {
    const [basicRes, batRes] = await Promise.all([getBasicInfoReq(bmsId), getBatDataReq(bmsId)]);
    if (basicRes.errno === 0 && basicRes.data?.basicInfo) {
      baseInfo.value = processBasicInfo(basicRes.data.basicInfo);
      if (baseInfo.value?.updateTime) baseInfo.value.timeF = formatDateTime(new Date(baseInfo.value.updateTime));
    }
    if (batRes.errno === 0 && batRes.data?.batData) {
      runInfo.value = processRunInfo(batRes.data.batData);
      if (runInfo.value?.time) runInfo.value.timeF = formatDateTime(new Date(runInfo.value.time * 1000));
    }
  } catch { ElMessage.error("获取详情失败"); } finally {
    loading.value = false; await nextTick(); updateGauges(); initCellVoltsChart();
  }
}

watch(() => [props.modelValue, props.bmsId] as const, ([visible, bmsId]) => {
  if (visible && bmsId) {
    activeTab.value = 'info'; // 每次打开重置为基础档案
    loadDetail(bmsId);
  }
}, { immediate: true });

onBeforeUnmount(() => {
  chartSoc?.dispose(); chartSoh?.dispose(); chartVolt?.dispose(); chartCurrent?.dispose(); chartCellVolts?.dispose();
});

function cellMatLabel(val: number | undefined) { return val != null ? getDictLabel(cell_mat_dict, val) : "--"; }
function tempBarPercent(t: number | undefined, max = 80) { if (t == null) return 0; return Math.min(100, Math.max(0, (t / max) * 100)); }

function protectBit(bit: number) {
  const val = runInfo.value?.protect ?? 0; const active = !!(val & bit);
  return { text: active ? "是" : "否", isActive: active };
}
function statusBit(cfg: any) {
  const val = runInfo.value?.status ?? 0; const set = !!(val & cfg.bit); const isGood = cfg.onIsGood ? set : !set;
  return { text: set ? cfg.onText : cfg.offText, isGood };
}
function switchBit(cfg: any) {
  const val = runInfo.value?.switch_fun_ctrl ?? 0; const isOn = !!(val & cfg.bit);
  return { text: isOn ? cfg.onText : cfg.offText, isOn };
}
function handleFunCtrl(func: FunCtrlFunc, op: 0 | 1) {
  const bmsId = String(props.bmsId ?? "").trim();
  if (!bmsId) {
    ElMessage.warning("缺少设备编码");
    return;
  }
  sendFunCtrl(bmsId, func, op);
}
function handleSetParams() {
  const bmsId = String(props.bmsId ?? "").trim();
  if (!bmsId) {
    ElMessage.warning("缺少设备编码");
    return;
  }
  router.push({ name: "DeviceParamConfig", query: { bmsId } });
}
</script>

<style lang="scss">
/* 弹窗容器 - 配色与详情页一致 */
.bms-dashboard-dialog {
  /* 标题栏背景 #1a1e24 | 主体深色背景 #0f1216 | 表格/卡片 #1a1e24 形成层次对比 */
  --bg-body: #0f1216;
  --bg-card: #1a1e24;
  --bg-card-hover: #21262d;
  --border-color: #30363d;
  --primary: #00bcd4;
  --success: #00e676;
  --warning: #ffb300;
  --danger: #ff5252;
  --text-main: #e6edf3;
  --text-sub: #8b949e;

  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0,0,0,0.7);

  /* 下方深色背景 #0f1216 */
  .el-dialog__body {
    background: #0f1216 !important;
    padding: 16px;
    height: 88vh; /* 撑满屏幕 */
    overflow: hidden;
    color: var(--text-main);
  }
}
</style>

<style scoped lang="scss">
.dashboard-body {
  height: 100%;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

/* 栏位布局 */
.col-side {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.col-left { width: 340px; }
.col-right { width: 260px; }
.col-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* 通用卡片 - 表格/卡片背景 #1a1e24 与深色背景形成对比 */
.dash-card {
  background: #1a1e24;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .card-head {
    height: 42px;
    padding: 0 16px;
    background: #1a1e24;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
    .title {
      font-size: 14px; font-weight: 600; color: var(--text-sub);
      &::before { content: ""; display: inline-block; width: 3px; height: 14px; background: var(--primary); margin-right: 10px; border-radius: 2px; vertical-align: middle; }
    }
  }
}

/* === 左侧栏 (电池 + 仪表) === */
.battery-card {
  flex: 0 0 auto; /* 高度自适应 */
  background: #1a1e24;
  .status-badge {
    font-size: 12px; padding: 2px 8px; border-radius: 4px;
    &.online { color: #00e676; background: rgba(0,230,118,0.15); }
    &.offline { color: #999; background: rgba(255,255,255,0.1); }
  }
  .battery-wrapper {
    padding: 30px 16px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 24px;

    .battery-stats {
      width: 100%; display: flex; justify-content: space-between;
      .b-stat { display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .l { font-size: 13px; color: var(--text-sub); }
      .v { font-size: 15px; color: var(--text-main); font-weight: 600; }
    }
  }
}

/* 3D 电池 */
.battery-3d-box {
  width: 240px; height: 100px; /* 增大尺寸 */
  position: relative; display: flex; align-items: center;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));

  .battery-body {
    flex: 1; height: 100%;
    border: 3px solid #555; border-right: none; border-radius: 12px 0 0 12px;
    background: rgba(30,30,30,0.8); position: relative; overflow: hidden;
    .fill {
      height: 100%; background: var(--fill-color); transition: width 0.5s; position: relative;
      box-shadow: 0 0 20px var(--glow-color);
      .wave { position: absolute; right: -10px; top: 0; bottom: 0; width: 20px; background: rgba(255,255,255,0.2); filter: blur(5px); transform: skewX(-15deg); }
    }
    .lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-evenly; span { width: 1px; background: rgba(0,0,0,0.3); } }
    .bolt { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 40px; color: #fff; text-shadow: 0 0 10px #fff; animation: pulse 1s infinite; }
  }
  .battery-cap { width: 16px; height: 50%; background: #444; border: 3px solid #555; border-left: none; border-radius: 0 8px 8px 0; }
  .overlay {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    text-shadow: 0 2px 4px rgba(0,0,0,0.9);
    .num { font-size: 42px; font-weight: 800; color: #fff; }
    .unit { font-size: 18px; color: #ddd; margin-left: 2px; }
  }
}

.gauges-card {
  flex: 1; /* 填充左侧剩余 */
  .gauges-grid {
    height: 100%; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
    .gauge-cell { width: 100%; height: 100%; border-right: 1px solid rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.02); }
  }
}

/* === 中间栏 === */
.chart-row {
  flex: 0 0 45%; /* 上半部分高度 */
  display: flex; gap: 16px;

  .vol-chart-card {
    flex: 1;
    .legend { display: flex; gap: 10px; font-size: 12px; .tag { padding: 2px 6px; border-radius: 4px; color: #1a1e24; font-weight: bold; } .max { background: #ffb300; } .min { background: #ff5252; } }
    .chart-content { flex: 1; min-height: 0; }
  }

  .temp-card {
    width: 260px; flex-shrink: 0;
    .temp-body { padding: 16px; flex: 1; overflow-y: auto; }
    .temp-main-row {
      display: flex; gap: 12px; margin-bottom: 16px;
      .temp-box {
        flex: 1; background: #1a1e24; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; display: flex; flex-direction: column; align-items: center;
        .n { font-size: 12px; color: var(--text-sub); }
        .v { font-size: 20px; font-weight: 600; margin: 6px 0; }
        .p-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; div { height: 100%; background: var(--primary); border-radius: 2px; } }
        &.mos .p-bar div { background: #ff7043; } &.env .p-bar div { background: #42a5f5; }
      }
    }
    .divider { height: 1px; background: var(--border-color); margin-bottom: 16px; }
    .temp-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      .t-cell {
        background: #1a1e24; border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; text-align: center;
        .k { display: block; font-size: 12px; color: #666; }
        .val { display: block; font-size: 14px; font-weight: 500; &.hot { color: #ff5252; } }
      }
    }
  }
}

/* Tabs 区域 */
.tabs-card {
  flex: 1;
  .custom-tabs {
    height: 100%; display: flex; flex-direction: column;
    :deep(.el-tabs__header) { margin: 0; background: #1a1e24; border-bottom: 1px solid var(--border-color); }
    :deep(.el-tabs__nav-wrap::after) { display: none; }
    :deep(.el-tabs__item) { height: 44px; line-height: 44px; font-size: 14px; color: var(--text-sub); padding: 0 24px; &.is-active { color: var(--primary); font-weight: 600; font-size: 15px; } }
    :deep(.el-tabs__content) { flex: 1; overflow-y: auto; padding: 0; }
  }

  /* 基础档案 Grid - 表格背景 #1a1e24 */
  .info-grid-tab {
    padding: 20px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;
    .info-item {
      display: flex; flex-direction: column; gap: 6px;
      padding: 12px; background: #1a1e24; border-radius: 6px; border: 1px solid var(--border-color);
      .label { font-size: 12px; color: var(--text-sub); }
      .value { font-size: 15px; color: var(--text-main); font-weight: 500; }
      .value.highlight { color: var(--primary); font-family: 'Roboto Mono', monospace; }
    }
  }

  /* 状态 Grid - 表格背景 #1a1e24 */
  .status-grid {
    padding: 20px;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;

    .status-item {
      background: #1a1e24; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 6px; position: relative;

      .dot { width: 8px; height: 8px; border-radius: 50%; background: #555; position: absolute; top: 12px; right: 12px; }
      .lbl { font-size: 13px; color: var(--text-sub); }
      .val { font-size: 15px; font-weight: 600; margin-top: 2px; }

      &.is-safe { background: rgba(0,230,118,0.06); border-color: rgba(0,230,118,0.15); .dot { background: #00e676; } .val { color: #00e676; } }
      &.is-danger { background: rgba(255,82,82,0.06); border-color: rgba(255,82,82,0.15); .dot { background: #ff5252; } .val { color: #ff5252; } }
      &.is-warn { background: rgba(255,179,0,0.06); border-color: rgba(255,179,0,0.15); .dot { background: #ffb300; } .val { color: #ffb300; } }
      &.is-off { opacity: 0.7; }
    }
  }
}

/* === 右侧栏 (Control) === */
.control-card {
  height: 100%;
  position: relative;

  .refresh-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 8px;
    animation: fadeIn 0.3s ease;

    .refresh-tip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 24px;
      background: rgba(26, 30, 36, 0.95);
      border: 1px solid rgba(0, 188, 212, 0.4);
      border-radius: 8px;
      color: var(--primary);
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

      .el-icon {
        font-size: 18px;
        animation: spin 1s linear infinite;
      }
    }
  }

  .ctrl-body {
    flex: 1; overflow-y: auto; padding: 16px;
    display: flex; flex-direction: column; gap: 24px;

    .ctrl-group {
      .g-title { font-size: 13px; color: var(--text-sub); font-weight: 600; margin-bottom: 12px; display: block; border-left: 3px solid var(--primary); padding-left: 8px; }
      .btn-row { display: flex; gap: 10px; margin-bottom: 10px; &:last-child { margin-bottom: 0; } }
      .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .btn-col { display: flex; flex-direction: column; gap: 10px; }

      .btn-row .c-btn { flex: 1; }
      .c-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-main);
        padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;
        transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        &:hover {
          background: rgba(255,255,255,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        &:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        &.primary {
          background: rgba(0,188,212,0.15); border-color: rgba(0,188,212,0.3); color: var(--primary);
          &:hover { background: rgba(0,188,212,0.25); box-shadow: 0 2px 8px rgba(0,188,212,0.2); }
          &:focus-visible { outline-color: var(--primary); }
        }
        &.danger {
          background: rgba(255,82,82,0.15); border-color: rgba(255,82,82,0.3); color: var(--danger);
          &:hover { background: rgba(255,82,82,0.25); box-shadow: 0 2px 8px rgba(255,82,82,0.2); }
          &:focus-visible { outline-color: var(--danger); }
        }
        &.warn { color: var(--warning); border-color: rgba(255,179,0,0.3); }
        &.success { color: var(--success); border-color: rgba(0,230,118,0.3); }
        &.full { width: 100%; }
      }
      .c-btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
    }
  }
}

@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
@keyframes spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
@keyframes fadeIn { 0% { opacity: 0; transform: translateY(-4px); } 100% { opacity: 1; transform: translateY(0); } }
.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; color: #555; }
</style>
