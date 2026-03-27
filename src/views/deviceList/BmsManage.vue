<template>
  <div class="bms-manage-page">
    <div class="bms-manage-header">
      <div class="header-title">BMS管理</div>
      <div class="header-search">
        <el-input v-model="bmsIdInput" placeholder="请输入设备编码" clearable style="width: 300px" @keyup.enter="handleSearch">
          <template #append>
            <el-button :icon="Search" @click="handleSearch">查询</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div v-loading="loading" class="dashboard-body">
      <div class="col-side col-left">

        <div class="dash-card battery-card">
          <div class="card-head">
            <span class="title">实时状态</span>
            <span class="status-badge" :class="baseInfo?.online === 1 ? 'online' : 'offline'">
              {{ baseInfo?.online === 1 ? "在线" : baseInfo?.online === 0 ? "离线" : "--" }}
            </span>
          </div>
          <div class="battery-wrapper">
            <div class="battery-3d-box" :style="{ '--fill-color': currentSocColor, '--glow-color': currentSocColor }">
              <div class="battery-body">
                <div class="fill" :style="{ width: (runInfo?.soc ?? 0) + '%' }">
                  <div class="wave"></div>
                </div>
                <div class="lines"><span v-for="i in 6" :key="i"></span></div>
                <div v-if="isCharging" class="bolt">
                  <svg viewBox="0 0 32 32" class="bolt-icon" aria-hidden="true">
                    <path d="M18 2L6 18h7l-1 12 12-16h-7L18 2z" fill="currentColor" stroke="currentColor"
                      stroke-width="1.2" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
              <div class="battery-cap"></div>
              <div class="overlay">
                <span class="num">{{ runInfo?.soc ?? "--" }}</span><span class="unit">%</span>
              </div>
            </div>
            <div class="battery-stats">
              <div class="b-stat"><span class="l">剩余容量</span><span class="v">{{ runInfo?.remCapD ?? "--" }} Ah</span>
              </div>
              <div class="b-stat"><span class="l">满电容量</span><span class="v">{{ runInfo?.fullCapD ?? "--" }} Ah</span>
              </div>
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
                <span class="tag diff">压差: {{ cellVoltDiff ?? "--" }} mV</span>
                <span class="tag max">最大: {{ maxCellVolt ?? "--" }} mV</span>
                <span class="tag min">最小: {{ minCellVolt ?? "--" }} mV</span>
              </div>
            </div>
            <div class="chart-content" ref="cellVoltsChartRef"></div>
          </div>

          <div class="dash-card temp-card">
            <div class="card-head">
              <span class="title">MOS & 环境温度 (°C)</span>

            </div>
            <div class="temp-body">
              <!-- <div class="cell-temp-label">MOS & 环境</div> -->
              <div class="temp-grid-horizontal">
                <div class="temp-item">
                  <span class="t-idx">MOS</span>
                  <TempThermometer :temperature="runInfo?.mos_T ?? 0" />
                  <span class="t-val">{{ runInfo?.mos_T }}°</span>
                </div>
                <div class="temp-item">
                  <span class="t-idx">环境</span>
                  <TempThermometer :temperature="runInfo?.env_T  ?? 0" />
                  <span class="t-val">{{ runInfo?.env_T }}°</span>
                </div>
              </div>
              <div class="divider"></div>

              <div class="cell-temp-label">电芯温度 (°C)</div>
              <div class="temp-grid-horizontal">
                <div
                  v-for="(t, idx) in (runInfo?.cell_T || [])"
                  :key="`temp-${idx}`"
                  class="temp-item"
                >
                  <span class="t-idx">#{{ idx + 1 }}</span>

                  <TempThermometer :temperature="t" />

                  <span class="t-val">{{ t }}°</span>
                </div>
              </div>
            </div>
        </div>
      </div>

       <div class="bottom-row">
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
                  <span class="label">发货时间</span>
                  <span class="value">{{ baseInfo?.outTimeF || '--' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">激活时间</span>
                  <span class="value">{{ baseInfo?.activeTimeF || '--' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">最近续费时间</span>
                  <span class="value">{{ baseInfo?.lastRenewalTimeF || '--' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">服务到期时间</span>
                  <span class="value">{{ baseInfo?.srvEndTimeF || '--' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">服务价格</span>
                  <span class="value">{{ baseInfo?.priceF || '--' }}</span>
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

            <el-tab-pane label="电池状态" name="battery">
              <div class="status-section">
                <div class="section-title">保护状态</div>
                <div class="status-grid">
                  <div v-for="item in protect_bit_config" :key="'protect-' + item.bit" class="status-item"
                    :class="protectBit(item.bit).isActive ? 'is-danger' : 'is-safe'">
                    <!-- <span class="dot"></span> -->
                    <span class="lbl">{{ item.label }}</span>
                    <span class="val">{{ protectBit(item.bit).text }}</span>
                  </div>
                </div>
              </div>

              <div class="status-section">
                <div class="section-title">系统状态</div>
                <div class="status-grid">
                  <div v-for="item in status_bit_config" :key="'status-' + item.bit" class="status-item"
                    :class="statusBit(item).isGood ? 'is-safe' : 'is-warn'">
                    <!-- <span class="dot"></span> -->
                    <span class="lbl">{{ item.label }}</span>
                    <span class="val">{{ statusBit(item).text }}</span>
                  </div>
                </div>
              </div>

              <div class="status-section">
                <div class="section-title">开关状态</div>
                <div class="status-grid">
                  <div v-for="item in switch_fun_ctrl_bit_config" :key="'switch-' + item.bit" class="status-item"
                    :class="switchBit(item).isOn ? 'is-safe' : 'is-off'">
                    <!-- <span class="dot"></span> -->
                    <span class="lbl">{{ item.label }}</span>
                    <span class="val">{{ switchBit(item).text }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="dash-card warning-card">
          <div class="card-head"><span class="title">告警信息</span></div>
          <div class="warning-body">
            <div v-if="!warningList || warningList.length === 0" class="empty-tip">暂无告警信息</div>
            <div v-else class="warning-list">
              <div
                v-for="(item, idx) in warningList"
                :key="idx"
                class="warning-row"
                :class="{ 'is-even': idx % 2 === 0 }">
                <span class="w-time">{{ item.t }}</span>
                <div class="w-items">
                  <span
                    v-for="warn in parseWarningBits(item.e)"
                    :key="warn.bit"
                    class="w-tag"
                    :class="{ 'is-recover': warn.isRecover }">
                    {{ warn.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
       </div>
      </div>

      <div class="col-side col-right">
        <div class="dash-card control-card">
          <div class="card-head"><span class="title">控制中心</span></div>
          <div v-if="refreshing" class="refresh-overlay">
            <div class="refresh-tip">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <span>指令已下发，即将刷新数据...</span>
            </div>
          </div>
          <div class="ctrl-body">
            <div v-if="bmsOp.chg || bmsOp.dschg" class="ctrl-group ctrl-group-charge">
              <div class="g-title">充放电控制</div>
              <div v-if="bmsOp.chg" class="btn-row">
                <button type="button" class="c-btn primary" aria-label="开启充电" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('charge', 1)">
                  <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>开启充电</span>
                </button>
                <button type="button" class="c-btn danger" aria-label="关闭充电" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('charge', 0)">
                  <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span>关闭充电</span>
                </button>
              </div>
              <div v-if="bmsOp.dschg" class="btn-row">
                <button type="button" class="c-btn primary" aria-label="开启放电" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('discharge', 1)">
                  <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  <span>开启放电</span>
                </button>
                <button type="button" class="c-btn danger" aria-label="关闭放电" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('discharge', 0)">
                  <svg class="c-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  <span>关闭放电</span>
                </button>
              </div>
            </div>
            <div v-if="bmsOp.blindchg || bmsOp.beep || bmsOp.predschg" class="ctrl-group">
              <div class="g-title">功能开关</div>
              <div class="btn-grid">
                <template v-if="bmsOp.blindchg">
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('blindChg', 1)">
                    允盲充
                  </button>
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('blindChg', 0)">
                    禁盲充
                  </button>
                </template>
                <template v-if="bmsOp.beep">
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('beep', 1)">
                    开蜂鸣
                  </button>
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('beep', 0)">
                    关蜂鸣
                  </button>
                </template>
                <template v-if="bmsOp.predschg">
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('preventSpark', 1)">
                    开防火
                  </button>
                  <button class="c-btn" :disabled="cmdLoading" :class="{ 'is-loading': cmdLoading }"
                    @click="handleFunCtrl('preventSpark', 0)">
                    关防火
                  </button>
                </template>
              </div>
            </div>

            <div
              v-if="bmsOp.scRecov || bmsOp.mosRecov || bmsOp.reset || bmsCfg.basic || bmsCfg.btCode || bmsCfg.tServer || bmsCfg.voltparams || bmsCfg.currparams || bmsCfg.tempparams"
              class="ctrl-group">
              <div class="g-title">维护操作</div>
              <div class="btn-col">
                <button v-if="bmsOp.scRecov" class="c-btn warn" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('scRecov', 1)">
                  短路恢复
                </button>
                <button v-if="bmsOp.mosRecov" class="c-btn warn" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('mosFailRecov', 1)">
                  MOS故障恢复
                </button>
                <button v-if="bmsOp.reset" class="c-btn danger full" :disabled="cmdLoading"
                  :class="{ 'is-loading': cmdLoading }" @click="handleFunCtrl('reset', 1)">
                  重启 BMS
                </button>
                <button
                  v-if="bmsCfg.basic || bmsCfg.btCode || bmsCfg.tServer || bmsCfg.voltparams || bmsCfg.currparams || bmsCfg.tempparams"
                  class="c-btn success full" @click="handleSetParams">参数配置</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ParamConfigDialog v-model="paramConfigVisible" :bms-id="paramConfigBmsId"
      @success="loadDetail(paramConfigBmsId)" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed, onMounted, onActivated } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getBasicInfoReq,
  getBatDataReq,
  getWarningReq,
  processBasicInfo,
  processRunInfo
} from "@/api/bms";
import {
  cell_mat_dict,
  getDictLabel,
  protect_bit_config,
  status_bit_config,
  switch_fun_ctrl_bit_config,
  warning_bit_config_value
} from "@/utils/dict";
import type { BmsBasicInfo, BmsRunInfo, BmsWarningItem } from "@/api/bms/types";
import echarts from "@/plugins/echarts";
import { Search, Loading } from "@element-plus/icons-vue";
import { useFunCtrl, type FunCtrlFunc } from "./useFunCtrl";
import ParamConfigDialog from "./ParamConfigDialog.vue";
import { useBmsAuth } from "@/composables/useBmsAuth";
import TempThermometer from "@/components/TempThermometer.vue";

defineOptions({ name: "BmsManage" });

// sessionStorage 缓存 key
const BMS_CACHE_KEY = "bms_manage_current_bmsId";

// 从 sessionStorage 获取缓存的 bmsId
function getCachedBmsId(): string {
  try {
    return sessionStorage.getItem(BMS_CACHE_KEY) || "";
  } catch {
    return "";
  }
}

// 保存 bmsId 到 sessionStorage
function setCachedBmsId(bmsId: string) {
  try {
    if (bmsId && bmsId.trim()) {
      sessionStorage.setItem(BMS_CACHE_KEY, bmsId.trim());
    } else {
      sessionStorage.removeItem(BMS_CACHE_KEY);
    }
  } catch {
    // 忽略存储错误
  }
}

// 清除缓存的 bmsId
function clearCachedBmsId() {
  try {
    sessionStorage.removeItem(BMS_CACHE_KEY);
  } catch {
    // 忽略清除错误
  }
}

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const activeTab = ref("info");
const baseInfo = ref<BmsBasicInfo | null>(null);
const runInfo = ref<BmsRunInfo | null>(null);
const warningList = ref<BmsWarningItem[]>([]);
const bmsIdInput = ref("");
const paramConfigVisible = ref(false);
const paramConfigBmsId = ref("");

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

const maxCellVolt = computed(() => {
  const r = runInfo.value;
  if (!r?.cell_volts || r.maxCellIndex == null) return null;
  const v = r.cell_volts[r.maxCellIndex];
  return typeof v === "number" ? v : null;
});

const minCellVolt = computed(() => {
  const r = runInfo.value;
  if (!r?.cell_volts || r.minCellIndex == null) return null;
  const v = r.cell_volts[r.minCellIndex];
  return typeof v === "number" ? v : null;
});

const cellVoltDiff = computed(() => {
  const max = maxCellVolt.value;
  const min = minCellVolt.value;
  if (max == null || min == null) return null;
  return max - min;
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

/**
 * 告警码解析
 * - 正常告警：1-19（对应 dict.ts 的 warning_bit_config_value.bit）
 * - 告警恢复：10000+bit 或 100000+bit（例如 100001 / 10001）
 */
function parseWarningBits(
  value: number | string | undefined | null
): { bit: number; label: string; isRecover: boolean }[] {
  if (value == null || value === "") return [];
  const code = Number(value);
  if (!Number.isFinite(code) || code <= 0) return [];

  const RECOVER_BASES = [100000, 10000] as const;
  const hitBase = RECOVER_BASES.find(base => code > base);
  const isRecover = !!hitBase;
  const bit = hitBase ? code - hitBase : code;

  const cfg = warning_bit_config_value.find(item => item.bit === bit);
  if (!cfg) return [];

  return [{ bit: code, label: isRecover ? `${cfg.label}恢复` : cfg.label, isRecover }];
}

// 仪表盘初始化
function initGauge(el: HTMLElement | null, value: number, title: string, unit: string, max: number, color: string) {
  if (!el) return;
  // 确保容器有尺寸
  if (el.offsetWidth === 0 || el.offsetHeight === 0) {
    el.style.width = el.style.width || '100%';
    el.style.height = el.style.height || '200px';
  }
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
  // 延迟 resize 确保容器尺寸已更新
  setTimeout(() => chart.resize(), 50);
  return chart;
}

function updateGauges() {
  const r = runInfo.value;
  // 使用 nextTick 确保 DOM 已更新
  nextTick(() => {
    if (gaugeSocRef.value) {
      chartSoc?.dispose();
      chartSoc = initGauge(gaugeSocRef.value, r?.soc ?? 0, "SOC", "%", 100, r ? currentSocColor.value : themeColor);
    }
    if (gaugeSohRef.value) {
      chartSoh?.dispose();
      chartSoh = initGauge(gaugeSohRef.value, r?.soh ?? 0, "SOH", "%", 100, themeColor);
    }
    const volt = parseFloat(r?.batVoltD ?? "0") || 0;
    if (gaugeVoltRef.value) {
      chartVolt?.dispose();
      chartVolt = initGauge(gaugeVoltRef.value, volt, "总压", " V", Math.max(60, volt * 1.2 || 60), themeColor);
    }
    const cur = parseFloat(r?.currentD ?? "0") || 0;
    const absCur = Math.abs(cur);
    if (gaugeCurrentRef.value) {
      chartCurrent?.dispose();
      chartCurrent = initGauge(
        gaugeCurrentRef.value, absCur, "电流", " A", Math.max(50, absCur * 1.5 || 50), cur >= 0 ? successColor : warningColor
      );
    }
  });
}

function initCellVoltsChart() {
  const el = cellVoltsChartRef.value;
  if (!el) {
    const retryCount = (initCellVoltsChart as any).__retryCount || 0;
    if (retryCount < 10) {
      (initCellVoltsChart as any).__retryCount = retryCount + 1;
      setTimeout(() => initCellVoltsChart(), 100);
    }
    return;
  }
  (initCellVoltsChart as any).__retryCount = 0;

  // 确保容器有固定尺寸
  if (el.offsetWidth === 0 || el.offsetHeight === 0) {
    el.style.width = el.style.width || '100%';
    el.style.height = el.style.height || '300px';
    // 如果尺寸仍为0，延迟初始化
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      setTimeout(() => initCellVoltsChart(), 100);
      return;
    }
  }

  const r = runInfo.value;
  chartCellVolts?.dispose();
  chartCellVolts = echarts.init(el);

  if (!r?.cell_volts?.length) {
    chartCellVolts.setOption({
      grid: { left: 40, right: 20, top: 20, bottom: 30, containLabel: false },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: [], show: true },
      yAxis: { type: "value", show: true },
      series: [{ type: "bar", data: [] }]
    });
    setTimeout(() => chartCellVolts?.resize(), 50);
    return;
  }

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
    grid: { left: 28, right: 16, top: 20, bottom: 28, containLabel: true },
    tooltip: { trigger: "axis", backgroundColor: "rgba(20, 20, 20, 0.9)", borderColor: "#333", textStyle: { color: "#fff" }, formatter: "{b}: {c} mV" },
    xAxis: {
      type: "category",
      data: vols.map((_, i) => `${i + 1}`),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#999", fontSize: 11, interval: 0, showMinLabel: true, showMaxLabel: true, hideOverlap: false, margin: 10
      }
    },
    yAxis: {
      type: "value",
      min: (value: { min: number }) => Math.floor(value.min - 5),
      max: (value: { max: number }) => Math.ceil(value.max + 5),
      scale: true,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisLabel: { color: "#999", fontSize: 11 }
    },
    series: [{ type: "bar", data, barWidth: "60%", barMaxWidth: 24 }]
  });
  chartCellVolts.resize();
}
// =============================

async function loadDetail(bmsId: string) {
  if (!bmsId || !bmsId.trim()) {
    ElMessage.warning("请输入设备编码");
    return;
  }
  loading.value = true;
  baseInfo.value = null; runInfo.value = null; warningList.value = [];
  try {
    const [basicRes, batRes, warningRes] = await Promise.all([getBasicInfoReq(bmsId.trim()), getBatDataReq(bmsId.trim()), getWarningReq(bmsId.trim())]);
    if (basicRes.errno === 0 && basicRes.data?.basicInfo) {
      baseInfo.value = processBasicInfo(basicRes.data.basicInfo);
      if (baseInfo.value?.updateTime) baseInfo.value.timeF = formatDateTime(new Date(baseInfo.value.updateTime));
      if (baseInfo.value?.outTime) baseInfo.value.outTimeF = formatDateTime(new Date(baseInfo.value.outTime));
      if (baseInfo.value?.activeTime) baseInfo.value.activeTimeF = formatDateTime(new Date(baseInfo.value.activeTime));
      if (baseInfo.value?.lastRenewalTime) baseInfo.value.lastRenewalTimeF = formatDateTime(new Date(baseInfo.value.lastRenewalTime));
      if (baseInfo.value?.srvEndTime) baseInfo.value.srvEndTimeF = formatDateTime(new Date(baseInfo.value.srvEndTime));
      if (baseInfo.value?.price !== null && baseInfo.value?.price !== undefined) {
        const fee = Number(baseInfo.value.price);
        if (!Number.isNaN(fee)) {
          baseInfo.value.priceF = `¥${(fee / 100).toFixed(2)}`;
        }
      }
    }
    if (batRes.errno === 0 && batRes.data?.batData) {
      runInfo.value = processRunInfo(batRes.data.batData);
      if (runInfo.value?.time) runInfo.value.timeF = formatDateTime(new Date(runInfo.value.time * 1000));
    }
    if (warningRes.errno === 0 && warningRes.data) {
      console.log(warningRes.data);
      warningList.value = warningRes.data.warnings;
    }
    router.replace({ query: { bmsId: bmsId.trim() } });
    // 保存到 sessionStorage
    setCachedBmsId(bmsId.trim());
  } catch { ElMessage.error("获取详情失败"); } finally {
    loading.value = false;
    await nextTick();
    updateGauges();
    initCellVoltsChart();
    // 温度计由Vue响应式自动渲染，无需手动初始化
  }
}

function handleSearch() {
  if (!bmsIdInput.value || !bmsIdInput.value.trim()) {
    ElMessage.warning("请输入设备编码");
    return;
  }
  loadDetail(bmsIdInput.value);
}

function handleSetParams() {
  const bmsId = bmsIdInput.value.trim() || (route.query.bmsId as string) || "";
  if (!bmsId) {
    ElMessage.warning("缺少设备编码");
    return;
  }
  paramConfigBmsId.value = bmsId;
  paramConfigVisible.value = true;
}

onMounted(async () => {
  const queryBmsId = route.query.bmsId as string;
  if (queryBmsId) {
    bmsIdInput.value = queryBmsId;
    loadDetail(queryBmsId);
  } else {
    // 如果没有 query 参数，尝试从 sessionStorage 恢复
    const cachedBmsId = getCachedBmsId();
    if (cachedBmsId) {
      bmsIdInput.value = cachedBmsId;
      // 恢复路由参数
      router.replace({ query: { bmsId: cachedBmsId } });
      loadDetail(cachedBmsId);
    } else {
      await nextTick();
      setTimeout(() => {
        updateGauges();
        initCellVoltsChart();
      }, 200);
    }
  }

  // 窗口大小变化时重绘图表
  window.addEventListener('resize', handleResize);
});

// 页面激活时（keepAlive 缓存后返回）重新初始化图表
onActivated(async () => {
  await nextTick();

  // 检查是否有缓存的 bmsId，如果有但路由参数丢失，则恢复
  const queryBmsId = route.query.bmsId as string;
  const cachedBmsId = getCachedBmsId();

  if (!queryBmsId && cachedBmsId) {
    // 恢复路由参数和输入框
    bmsIdInput.value = cachedBmsId;
    router.replace({ query: { bmsId: cachedBmsId } });
    // 如果有缓存但数据为空，重新加载
    if (!runInfo.value) {
      loadDetail(cachedBmsId);
      return;
    }
  } else if (queryBmsId && queryBmsId !== cachedBmsId) {
    // 如果路由参数存在但与缓存不一致，更新缓存
    setCachedBmsId(queryBmsId);
    bmsIdInput.value = queryBmsId;
  }

  // 延迟一下确保 DOM 已完全渲染
  setTimeout(() => {
    // 重新初始化所有图表
    if (runInfo.value) {
      updateGauges();
      initCellVoltsChart();
    } else {
      // 即使没有数据也初始化空图表，避免容器被挤压
      updateGauges();
      initCellVoltsChart();
    }
  }, 100);
});

const handleResize = () => {
  chartSoc?.resize();
  chartSoh?.resize();
  chartVolt?.resize();
  chartCurrent?.resize();
  chartCellVolts?.resize();
};

watch(() => route.query.bmsId, (newBmsId) => {
  if (newBmsId && typeof newBmsId === "string" && newBmsId !== bmsIdInput.value) {
    bmsIdInput.value = newBmsId;
    // 更新缓存
    setCachedBmsId(newBmsId);
    loadDetail(newBmsId);
  } else if (!newBmsId) {
    // 如果路由参数被清除，尝试从缓存恢复
    const cachedBmsId = getCachedBmsId();
    if (cachedBmsId && cachedBmsId !== bmsIdInput.value) {
      bmsIdInput.value = cachedBmsId;
      router.replace({ query: { bmsId: cachedBmsId } });
      loadDetail(cachedBmsId);
    }
  }
});

onBeforeUnmount(() => {
  chartSoc?.dispose(); chartSoh?.dispose(); chartVolt?.dispose(); chartCurrent?.dispose(); chartCellVolts?.dispose();
  window.removeEventListener('resize', handleResize);
});

function cellMatLabel(val: number | undefined) { return val != null ? getDictLabel(cell_mat_dict, val) : "--"; }

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
  const bmsId = bmsIdInput.value.trim() || (route.query.bmsId as string) || "";
  if (!bmsId) {
    ElMessage.warning("请先输入设备编码并查询设备");
    return;
  }
  sendFunCtrl(bmsId, func, op);
}
</script>

<style scoped lang="scss">
.bms-manage-page {
  margin: 10px;
  background: var(--bms-bg);
}

.bms-manage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px 24px;
  background: var(--bms-bg-card);
  border-radius: 12px;
  border: 1px solid var(--bms-border);

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--bms-text);
  }

  .header-search {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.dashboard-body {
  height: calc(100vh - 230px);
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

.col-left {
  width: 340px;
}

.col-right {
  width: 260px;
}

.col-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.bottom-row {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;

  .tabs-card {
    flex: 1;
    min-width: 0;
  }

  .warning-card {
    width: 478px;
    flex-shrink: 0;

    .warning-body {
      padding: 12px 16px 14px;

      .warning-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .warning-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 4px;

        &.is-even {
          background: rgba(255, 255, 255, 0.02);
        }

        .w-time {
          flex: 0 0 auto;
          width: 120px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .w-items {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .w-tag {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 3px;
          background: rgba(255, 87, 34, 0.15);
          color: #ffab91;
          border: 1px solid rgba(255, 87, 34, 0.4);

          &.is-recover {
            background: rgba(0, 230, 118, 0.15);
            color: #b9f6ca;
            border-color: rgba(0, 230, 118, 0.4);
          }
        }
      }

      .empty-tip {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
        padding: 12px 0;
      }
    }
  }
}

/* 通用卡片 */
.dash-card {
  background: var(--bms-bg-card);
  border: 1px solid var(--bms-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .card-head {
    height: 42px;
    padding: 0 16px;
    background: var(--bms-bg-card);
    border-bottom: 1px solid var(--bms-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bms-text-secondary);

      &::before {
        content: "";
        display: inline-block;
        width: 3px;
        height: 14px;
        background: var(--bms-primary);
        margin-right: 10px;
        border-radius: 2px;
        vertical-align: middle;
      }
    }
  }
}

/* === 左侧栏 (电池 + 仪表) === */
.battery-card {
  flex: 0 0 auto;

  .status-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;

    &.online {
      color: #00e676;
      background: rgba(0, 230, 118, 0.15);
    }

    &.offline {
      color: #999;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .battery-wrapper {
    padding: 30px 16px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;

    .battery-stats {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .b-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }

      .l {
        font-size: 13px;
        color: var(--bms-text-secondary);
      }

      .v {
        font-size: 15px;
        color: var(--bms-text);
        font-weight: 600;
      }
    }
  }
}

/* 3D 电池 */
.battery-3d-box {
  width: 240px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));

  .battery-body {
    flex: 1;
    height: 100%;
    border: 3px solid #555;
    border-right: none;
    border-radius: 12px 0 0 12px;
    background: rgba(30, 30, 30, 0.8);
    position: relative;
    overflow: hidden;

    .fill {
      height: 100%;
      background: var(--fill-color);
      transition: width 0.5s;
      position: relative;
      box-shadow: 0 0 20px var(--glow-color);

      .wave {
        position: absolute;
        right: -10px;
        top: 0;
        bottom: 0;
        width: 20px;
        background: rgba(255, 255, 255, 0.2);
        filter: blur(5px);
        transform: skewX(-15deg);
      }
    }

    .lines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-evenly;

      span {
        width: 1px;
        background: rgba(0, 0, 0, 0.3);
      }
    }

    .bolt {
      position: absolute;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #ffeb3b;
      text-shadow: 0 0 10px #ffeb3b;
      animation: pulse 1s infinite;

      .bolt-icon {
        width: 60px;
        height: 60px;
        display: block;
      }
    }
  }

  .battery-cap {
    width: 16px;
    height: 50%;
    background: #444;
    border: 3px solid #555;
    border-left: none;
    border-radius: 0 8px 8px 0;
  }

  .overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);

    .num {
      font-size: 42px;
      font-weight: 800;
      color: #fff;
    }

    .unit {
      font-size: 18px;
      color: #ddd;
      margin-left: 2px;
    }
  }
}

.gauges-card {
  flex: 1;

  .gauges-grid {
    padding: 10px;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    .gauge-cell {
      width: 100%;
      height: 100%;
      min-height: 180px;
      border-right: 1px solid rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
      padding: 10px;
      position: relative;
    }
  }
}

/* === 中间栏 === */
.chart-row {
  flex: 0.6;
  display: flex;
  gap: 16px;

  .vol-chart-card {
    flex: 1;

    .legend {
      display: flex;
      gap: 10px;
      font-size: 12px;

      .tag {
        padding: 2px 6px;
        border-radius: 4px;
        color: #1a1e24;
        font-weight: bold;
      }

      .max {
        background: #ffb300;
      }

      .diff {
        background: #00bcd4;
      }

      .min {
        background: #ff5252;
      }
    }

    .chart-content {
      flex: 1;
      min-height: 200px;
      height: 100%;
      width: 100%;
      position: relative;
    }
  }

  .temp-card {
    width: 480px;
    flex-shrink: 0;

    .card-head {
      .temp-legend {
        display: flex;
        gap: 8px;
        font-size: 10px;
        color: #999;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          transform: translateY(-1px);
        }

        .dot.normal {
          background: #00e676;
        }

        .dot.warn {
          background: #ffb300;
        }

        .dot.danger {
          background: #ff5252;
        }
      }
    }

    .temp-body {
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      /* 自定义滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        &:active {
          background: rgba(255, 255, 255, 0.35);
        }
      }
    }


    .divider {
      height: 1px;
      background: var(--bms-border);
      margin-bottom: 12px;
    }

    .cell-temp-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--bms-text-secondary);
      margin-bottom: 12px;
      padding-left: 4px;
      border-left: 3px solid var(--bms-primary);
    }

    /* 胶囊式温度计网格 */
    .temp-grid-new {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
      gap: 12px 8px;
      padding-bottom: 10px;

      .temp-capsule {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .t-val {
          font-size: 12px;
          font-weight: 600;
          color: var(--bms-text-secondary);
          transition: color 0.3s;
        }

        .t-idx {
          font-size: 10px;
          color: var(--bms-text-secondary);
          opacity: 0.7;
          font-family: 'Roboto Mono', monospace;
        }

        .t-track {
          width: 10px;
          height: 60px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .t-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: currentColor;
          border-radius: 10px;
          transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &.normal {
          .t-val {
            color: #00e676;
          }

          .t-fill {
            background: linear-gradient(to top, #00e676, #69f0ae);
            box-shadow: 0 0 8px rgba(0, 230, 118, 0.3);
          }
        }

        &.warn {
          .t-val {
            color: #ffb300;
          }

          .t-fill {
            background: linear-gradient(to top, #ffb300, #ffe57f);
            box-shadow: 0 0 8px rgba(255, 179, 0, 0.3);
          }
        }

        &.danger {
          .t-val {
            color: #ff5252;
          }

          .t-fill {
            background: linear-gradient(to top, #d50000, #ff5252);
            box-shadow: 0 0 10px rgba(255, 82, 82, 0.5);
          }
        }

        &.low {
          .t-val {
            color: #00bcd4;
          }

          .t-fill {
            background: linear-gradient(to top, #00bcd4, #80deea);
            box-shadow: 0 0 8px rgba(0, 188, 212, 0.3);
          }
        }
      }
    }
  }
}

/* Tabs 区域 */
.tabs-card {
  flex: 1;

  .custom-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      margin: 0;
      background: var(--bms-bg-card);
      border-bottom: 1px solid var(--bms-border);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__item) {
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      color: var(--bms-text-secondary);
      padding: 0 24px;

      &.is-active {
        color: var(--bms-primary);
        font-weight: 600;
        font-size: 15px;
      }
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
      padding: 0;

      /* 自定义滚动条 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        &:active {
          background: rgba(255, 255, 255, 0.35);
        }
      }
    }
  }

  .info-grid-tab {
    padding: 8px 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 9px;
      background: var(--bms-bg-input);
      border-radius: 6px;
      border: 1px solid var(--bms-border);

      .label {
        font-size: 12px;
        color: var(--bms-text-secondary);
      }

      .value {
        font-size: 15px;
        color: var(--bms-text);
        font-weight: 500;
      }

      .value.highlight {
        color: var(--bms-primary);
        font-family: 'Roboto Mono', monospace;
      }
    }
  }

  .status-section {
    padding: 10px 10px 0;

    &:last-child {
      padding-bottom: 20px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bms-text);
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid var(--bms-primary);
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
    gap: 5px;

    .status-item {
      background: var(--bms-bg-input);
      border: 1px solid var(--bms-border);
      border-radius: 6px;
      padding: 7px 7px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #555;
        flex-shrink: 0;
      }

      .lbl {
        font-size: 13px;
        color: var(--bms-text-secondary);
        flex: 1;
        min-width: 0;
      }

      .val {
        font-size: 13px;
        font-weight: 600;
        color: var(--bms-text);
        flex-shrink: 0;
      }

      &.is-safe {
        background: rgba(0, 230, 118, 0.06);
        border-color: rgba(0, 230, 118, 0.15);

        .dot {
          background: #00e676;
          box-shadow: 0 0 6px rgba(0, 230, 118, 0.5);
        }

        .val {
          color: #00e676;
        }
      }

      &.is-danger {
        background: rgba(255, 82, 82, 0.06);
        border-color: rgba(255, 82, 82, 0.15);

        .dot {
          background: #ff5252;
          box-shadow: 0 0 6px rgba(255, 82, 82, 0.5);
        }

        .val {
          color: #ff5252;
        }
      }

      &.is-warn {
        background: rgba(255, 179, 0, 0.06);
        border-color: rgba(255, 179, 0, 0.15);

        .dot {
          background: #ffb300;
          box-shadow: 0 0 6px rgba(255, 179, 0, 0.5);
        }

        .val {
          color: #ffb300;
        }
      }

      &.is-off {
        opacity: 0.7;
      }
    }
  }
}

/* 告警信息卡片 */
.warning-card {
  flex: 0 0 auto;
  min-height: 200px;
  // max-height: 400px;
  display: flex;
  flex-direction: column;

  .warning-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    // padding: 16px;

    /* 自定义滚动条 - 纵向 */
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      &:active {
        background: rgba(255, 255, 255, 0.35);
      }
    }

    /* 横向滚动条样式 */
    &::-webkit-scrollbar:horizontal {
      height: 6px;
    }

    &::-webkit-scrollbar-thumb:horizontal {
      border-radius: 3px;
    }

    .empty-tip {
      text-align: center;
      color: var(--bms-text-secondary);
      font-size: 13px;
      padding: 40px 20px;
    }

    .warning-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      min-width: fit-content;

      .warning-row {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--bms-border);
        transition: all 0.2s ease;
        gap: 12px;
        min-width: max-content;

        &:hover {
          background: rgba(255, 82, 82, 0.06);
        }

        &.is-even {
          background: rgba(255, 255, 255, 0.02);
        }

        &:last-child {
          border-bottom: none;
        }

        .w-time {
          flex: 0 0 auto;
          font-size: 12px;
          color: var(--bms-text-secondary);
          font-family: 'Roboto Mono', monospace;
          min-width: 140px;
          white-space: nowrap;
          position: sticky;
          left: 0;
          z-index: 2;
          padding: 8px 12px;
          padding-right: 16px;
          margin: -8px 0 -8px -12px;
          background: var(--bms-bg-card);
          border-right: 1px solid var(--bms-border);
          box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
        }

        &.is-even .w-time {
          background: rgba(36, 41, 48, 1);
        }

        &:hover .w-time {
          background: rgba(28, 33, 40, 1);
        }

        .w-items {
          flex: 0 1 auto;
          display: flex;
          flex-wrap: nowrap;
          gap: 6px;
          align-items: center;
          min-width: fit-content;
        }

        .w-tag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(255, 82, 82, 0.15);
          border: 1px solid rgba(255, 82, 82, 0.3);
          border-radius: 4px;
          font-size: 12px;
          color: #ff5252;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;

          &:hover {
            background: rgba(255, 82, 82, 0.25);
            border-color: rgba(255, 82, 82, 0.5);
          }
        }
      }
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
      margin: 20px;
      align-items: center;
      gap: 10px;
      padding: 16px 24px;
      background: rgba(26, 30, 36, 0.95);
      border: 1px solid rgba(0, 188, 212, 0.4);
      border-radius: 8px;
      color: var(--bms-primary);
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

      .el-icon {
        font-size: 18px;
        animation: spin 1s linear infinite;
      }
    }
  }

  .ctrl-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
      }

      &:active {
        background: rgba(255, 255, 255, 0.35);
      }
    }

    .ctrl-group {
      .g-title {
        font-size: 13px;
        color: var(--bms-text-secondary);
        font-weight: 600;
        margin-bottom: 12px;
        display: block;
        border-left: 3px solid var(--bms-primary);
        padding-left: 8px;
      }

      .btn-row {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .btn-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .btn-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .btn-row .c-btn {
        flex: 1;
      }

      .c-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: relative;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--bms-border);
        color: var(--bms-text);
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        &.is-loading,
        &:disabled {
          cursor: wait;
          opacity: 0.6;
          box-shadow: none;
          pointer-events: none;
        }

        &.is-loading::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          right: 8px;
          animation: spin 0.7s linear infinite;
        }

        &.primary {
          background: rgba(0, 188, 212, 0.15);
          border-color: rgba(0, 188, 212, 0.3);
          color: var(--bms-primary);

          &:hover {
            background: rgba(0, 188, 212, 0.25);
            box-shadow: 0 2px 8px rgba(0, 188, 212, 0.2);
          }
        }

        &.danger {
          background: rgba(255, 82, 82, 0.15);
          border-color: rgba(255, 82, 82, 0.3);
          color: #ff5252;

          &:hover {
            background: rgba(255, 82, 82, 0.25);
            box-shadow: 0 2px 8px rgba(255, 82, 82, 0.2);
          }
        }

        &.warn {
          color: #ffb300;
          border-color: rgba(255, 179, 0, 0.3);
        }

        &.success {
          color: #00e676;
          border-color: rgba(0, 230, 118, 0.3);
        }

        &.full {
          width: 100%;
        }
      }

      .c-btn-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
    }
  }
}
/* 替换之前的 .temp-grid-new 相关样式 */

.temp-grid-horizontal {
  display: grid;
  /* 固定每行显示两个 */
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 24px;
  padding-bottom: 10px;

  .temp-item {
    display: flex;
    align-items: center; /* 整体垂直居中 */
    gap: 10px;
    padding: 10px 5px;
    background: rgba(255, 255, 255, 0.02); /* 给每个单元格加个淡淡的背景，更像仪表盘 */
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.05);

    /* 1. 序号 */
    .t-idx {
      font-size: 12px;
      color: #e6edf3;
      font-family: 'Roboto Mono', monospace;
      // width: 24px;
      text-align: right;
    }

    /* 3. 当前值 */
    .t-val {
      font-size: 13px;
      font-weight: 600;
      color:#e6edf3;
      width: 36px;
      text-align: right;
    }

  }
}
</style>
