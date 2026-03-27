<template>
  <el-dialog :model-value="modelValue" title="参数配置" width="1650px" top="30px" destroy-on-close append-to-body
    class="param-config-dialog param-config-dialog-light" @update:model-value="emit('update:modelValue', $event)">
    <div v-loading="loading || loadingParams || refreshingAfterSubmit"
      :element-loading-text="refreshingAfterSubmit ? '配置下发成功，5秒后自动刷新...' : ''" class="param-dialog">
      <div class="param-card">
        <div class="param-card__head">
          <div class="section-title">
            {{ sectionTitle }}
          </div>
          <div v-if="bmsId" class="bms-id">设备编码：{{ bmsId }}</div>
        </div>

        <el-form label-width="110px" class="form">
          <div class="main-tabs">
            <div v-for="tab in mainTabs" :key="tab.name"
              :class="['main-tab-item', { active: activeMainTab === tab.name }]" @click="activeMainTab = tab.name">
              {{ tab.label }}
            </div>
          </div>

          <!-- 基础配置：BT码 / 三方后台 / 基础参数 -->
          <template v-if="activeMainTab === 'basic'">
            <div class="card-grid-basic">
              <div v-for="config in basicConfigTabs" :key="config.key" class="param-card-item">
                <div class="param-card-item__header">
                  <div class="param-card-item__title">{{ config.title }}</div>
                  <div class="param-card-item__desc">{{ config.desc }}</div>
                </div>
                <div class="param-card-item__body">
                  <component :is="config.component" :ref="(el: any) => { if (el) tabRefs[config.key] = el }"
                    v-bind="config.key === 'btcode' ? { btcodeText, 'onUpdate:btcodeText': (val: string) => btcodeText = val, btCount: btcodes ? 1 : 0, bmsIds: bmsId ? [bmsId] : [] } : config.key === 'thirdServer' ? { selectedValue: selectedThirdSrvValue, 'onUpdate:selectedValue': (val: string) => selectedThirdSrvValue = val, thirdSrvList } : {}" />
                </div>
                <div class="param-card-item__footer">
                  <el-button type="primary" size="small" :disabled="!bmsId" @click="handleSubmit(config.key)">
                    下发配置
                  </el-button>
                </div>
              </div>
            </div>
          </template>

          <!-- 其它配置：保护类 / 开关类 / 温度类 等 -->
          <template v-else>
            <el-form-item label="材料类型">
              <el-radio-group v-model="materialType">
                <el-radio :value="1">按铁锂参数配</el-radio>
                <el-radio :value="2">按三元参数配</el-radio>
              </el-radio-group>
            </el-form-item>

            <div class="card-grid">
              <div v-for="config in advancedConfigTabs" :key="config.key" class="param-card-item">
                <div class="param-card-item__header">
                  <div class="param-card-item__title">{{ config.title }}</div>
                  <div class="param-card-item__desc">{{ config.desc }}</div>
                </div>
                <div class="param-card-item__body">
                  <component :is="config.component" :ref="(el: any) => { if (el) tabRefs[config.key] = el }"
                    :variant="config.variant" :title="config.title" :default-value="config.defaultValue"
                    :ranges="config.rangeType === 'material' ? materialRanges : commonRanges"
                    :loading-ranges="config.rangeType === 'material' ? loadingMaterialRanges : loadingRanges"
                    :hardware-ocd="config.key === 'hardwareOcd' ? hardwareOcdDisplay : undefined" />
                </div>
                <div v-if="config.key !== 'hardwareOcd'" class="param-card-item__footer">
                  <el-button type="primary" size="small" :disabled="!bmsId" @click="handleSubmit(config.key)">
                    下发配置
                  </el-button>
                </div>
              </div>
            </div>
          </template>
          <!--
          <el-form-item class="dialog-footer">
            <el-button @click="emit('update:modelValue', false)">取消</el-button>
          </el-form-item> -->
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import { getBmsParamsReq, getBasicInfoReq, getParamsRangeReq, getThirdServerListReq, setBmsParamsReq } from "@/api/bms"
import type { BmsParamsMap, BmsRangesMap, BmsThirdServerItem } from "@/api/bms/types"
import { useConfigConfirm } from "@/composables/useConfigConfirm"
import BtcodeTab from "./batchConfig/BtcodeTab.vue"
import ThirdServerTab from "./batchConfig/ThirdServerTab.vue"
import BasicParamsTab from "./batchConfig/BasicParamsTab.vue"
import CellOvTab from "./batchConfig/CellOvTab.vue"
import CellUvTab from "./batchConfig/CellUvTab.vue"
import DischargeOcdTab from "./batchConfig/DischargeOcdTab.vue"
import ChargeOccTab from "./batchConfig/ChargeOccTab.vue"
import DischargeScdTab from "./batchConfig/DischargeScdTab.vue"
import PackOvTab from "./batchConfig/PackOvTab.vue"
import PackUvTab from "./batchConfig/PackUvTab.vue"
import TempProtectTab from "./batchConfig/TempProtectTab.vue"
import CellOv1Tab from "./batchConfig/CellOv1Tab.vue"
import HardwareOcdTab from "./batchConfig/HardwareOcdTab.vue"

defineOptions({ name: "ParamConfigDialog" })

const props = withDefaults(
  defineProps<{
    /** 是否显示弹窗（由父组件 v-model 控制） */
    modelValue: boolean
    /** 设备编码 */
    bmsId?: string
  }>(),
  {
    modelValue: false
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void
}>()

const loadingParams = ref(false)
const refreshingAfterSubmit = ref(false)
const { loading, confirmAndSubmit } = useConfigConfirm()

type MainTab = "basic" | "advanced"

const mainTabs: Array<{ label: string; name: MainTab }> = [
  { label: "基础配置", name: "basic" },
  { label: "其它配置", name: "advanced" }
]
const activeMainTab = ref<MainTab>("basic")

const bmsParams = ref<BmsParamsMap>({})
const commonRanges = ref<BmsRangesMap>({})
const materialRanges = ref<BmsRangesMap>({})
const loadingRanges = ref(false)
const loadingMaterialRanges = ref(false)

const materialType = ref<1 | 2>(1)

const btcodeText = ref<string>("")
const btcodes = computed(() => {
  const raw = String(btcodeText.value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/，/g, ",")
    .replace(/\n/g, ",")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
  return raw.length > 0 ? raw[0] : ""
})

const thirdSrvList = ref<BmsThirdServerItem[]>([])
const selectedThirdSrvValue = ref<string>("")

/** 统一管理所有 Tab Refs */
const tabRefs = ref<Record<string, any>>({})

/** 温度转换工具函数 */
const kelvinToCelsius = (k: number) => k - 273
const celsiusToKelvin = (c: number) => c + 273

/** 电流/时间单位转换 */
const toDisplayCurrent = (raw: number) => (raw < 100 ? raw : raw / 10) // 0.1A -> A
const toDisplayTime = (raw: number) => raw / 10 // 100ms -> S
const toDisplayMicroseconds = (raw: number) => raw * 10 // 10us -> us

/** 硬件级放电过流（只读展示用） */
const hardwareOcdDisplay = computed(() => {
  const p = bmsParams.value
  const T = toDisplayCurrent(Number(p["v"] ?? 0))
  const D = toDisplayTime(Number(p["bat_OCD0D"] ?? 0))
  const RT = toDisplayCurrent(Number(p["bat_OCD0RT"] ?? 0))
  const RD = toDisplayTime(Number(p["bat_OCD0RD"] ?? 0))
  if (!T && !D && !RT && !RD) return undefined
  return { T, D, RT, RD }
})

/** Tab 配置定义 */
interface TabConfig {
  key: string
  title: string
  desc: string
  component: any
  variant?: string
  defaultValue?: number
  rangeType?: 'material' | 'common'
  apiPath?: string
  configName?: string
  validateMsg?: string
  initForm?: (tab: any, p: BmsParamsMap) => void
  getPayload?: (tab: any) => any
}

/** 基础配置 Tab */
const basicConfigTabs: TabConfig[] = [
  {
    key: 'btcode',
    title: 'BT码',
    desc: '设置当前设备的 BT 码',
    component: BtcodeTab,
    apiPath: '/bms/api/set/params/btCode',
    configName: 'BT码配置'
  },
  {
    key: 'thirdServer',
    title: '三方后台',
    desc: '配置三方后台服务器地址',
    component: ThirdServerTab,
    apiPath: '/bms/api/set/params/server',
    configName: '三方后台配置'
  },
  {
    key: 'basicParams',
    title: '基础参数',
    desc: '设置材料类型、电芯数量等基础参数',
    component: BasicParamsTab,
    apiPath: '/bms/api/set/params/cMcN',
    configName: '基础参数配置',
    validateMsg: '请填写完整且有效的基础参数（电芯容量 20～100 Ah）',
    initForm: (tab, p) => {
      tab.form.cell_mat = (Number(p["cell_mat"] ?? 1) === 2 ? 2 : 1) as 1 | 2
      tab.form.cell_cnt = Number(p["cell_cnt"] ?? 14)
      const cap = Number(p["designed_cap"] ?? 0)
      tab.form.designed_capD = cap ? cap / 10 : 20
    }
  }
]

/** 其它配置 Tab */
const advancedConfigTabs: TabConfig[] = [
  { key: 'cellOv', title: '电芯过压保护', desc: '设置单体电芯过压触发/恢复阈值', component: CellOvTab, rangeType: 'material', apiPath: '/bms/api/set/params/ceOV', configName: '电芯过压保护配置', validateMsg: '请填写完整且有效的电芯过压保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.cell_OVT = Number(p["cell_OVT"] ?? 3650); tab.form.cell_OVD = Number(p["cell_OVD"] ?? 10); tab.form.cell_OVRT = Number(p["cell_OVRT"] ?? 3550); tab.form.cell_OVRD = Number(p["cell_OVRD"] ?? 100) } },
  { key: 'cellUv', title: '电芯欠压保护', desc: '设置单体电芯欠压触发/恢复阈值', component: CellUvTab, rangeType: 'material', apiPath: '/bms/api/set/params/ceUV', configName: '电芯欠压保护配置', validateMsg: '请填写完整且有效的电芯欠压保护参数（触发门限需小于恢复门限）', initForm: (tab, p) => { tab.form.cell_UVT = Number(p["cell_UVT"] ?? 2500); tab.form.cell_UVD = Number(p["cell_UVD"] ?? 10); tab.form.cell_UVRT = Number(p["cell_UVRT"] ?? 2600); tab.form.cell_UVRD = Number(p["cell_UVRD"] ?? 100) } },
  { key: 'packOv', title: '总压过压保护', desc: '设置电池包总压过压触发/恢复阈值', component: PackOvTab, rangeType: 'material', apiPath: '/bms/api/set/params/packOV', configName: '总压过压保护配置', validateMsg: '请填写完整且有效的总压过压保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.bat_OVT = Number(p["bat_OVT"] ?? p["bat_OVTD"] ?? 480); tab.form.bat_OVD = Number(p["bat_OVD"] ?? 0); tab.form.bat_OVRT = Number(p["bat_OVRT"] ?? p["bat_OVRTD"] ?? 470); tab.form.bat_OVRD = Number(p["bat_OVRD"] ?? 100) } },
  { key: 'packUv', title: '总压欠压保护', desc: '设置电池包总压欠压触发/恢复阈值', component: PackUvTab, rangeType: 'material', apiPath: '/bms/api/set/params/packUV', configName: '总压欠压保护配置', validateMsg: '请填写完整且有效的总压欠压保护参数（触发门限需小于恢复门限）', initForm: (tab, p) => { tab.form.bat_UVT = Number(p["bat_UVT"] ?? p["bat_UVTD"] ?? 300); tab.form.bat_UVD = Number(p["bat_UVD"] ?? 0); tab.form.bat_UVRT = Number(p["bat_UVRT"] ?? p["bat_UVRTD"] ?? 310); tab.form.bat_UVRD = Number(p["bat_UVRD"] ?? 100) } },
  { key: 'dischargeOcd1', title: 'I级放电过流', desc: '设置 I 级放电过流阈值与延时', component: DischargeOcdTab, variant: 'ocd1', rangeType: 'common', apiPath: '/bms/api/set/params/batOCD1', configName: 'I级放电过流配置', validateMsg: '请填写完整且有效的 I 级放电过流参数', initForm: (tab, p) => { tab.form.T = toDisplayCurrent(Number(p["bat_OCD1T"] ?? 0)); tab.form.D = toDisplayTime(Number(p["bat_OCD1D"] ?? 0)); tab.form.RD = toDisplayTime(Number(p["bat_OCD1RD"] ?? 100)) } },
  { key: 'dischargeOcd2', title: 'II级放电过流', desc: '设置 II 级放电过流阈值与延时', component: DischargeOcdTab, variant: 'ocd2', rangeType: 'common', apiPath: '/bms/api/set/params/batOCD2', configName: 'II级放电过流配置', validateMsg: '请填写完整且有效的 II 级放电过流参数', initForm: (tab, p) => { tab.form.T = toDisplayCurrent(Number(p["bat_OCD2T"] ?? 0)); tab.form.D = toDisplayTime(Number(p["bat_OCD2D"] ?? 0)); tab.form.RD = toDisplayTime(Number(p["bat_OCD2RD"] ?? 100)) } },
  { key: 'dischargeOcd3', title: 'III级放电过流', desc: '设置 III 级放电过流阈值与延时', component: DischargeOcdTab, variant: 'ocd3', rangeType: 'common', apiPath: '/bms/api/set/params/batOCD3', configName: 'III级放电过流配置', validateMsg: '请填写完整且有效的 III 级放电过流参数', initForm: (tab, p) => { tab.form.T = toDisplayCurrent(Number(p["bat_OCD3T"] ?? 0)); tab.form.D = toDisplayTime(Number(p["bat_OCD3D"] ?? 0)); tab.form.RD = toDisplayTime(Number(p["bat_OCD3RD"] ?? 100)) } },
  { key: 'hardwareOcd', title: '硬件级放电过流', desc: '硬件级放电过流参数（只读）', component: HardwareOcdTab, rangeType: 'common', initForm: (tab, p) => { if (tab) tab.hardwareOcd = hardwareOcdDisplay.value } },
  { key: 'chargeOcc1', title: 'I级充电过流', desc: '设置 I 级充电过流阈值与延时', component: ChargeOccTab, variant: 'occ1', rangeType: 'common', apiPath: '/bms/api/set/params/batOCC1', configName: 'I级充电过流配置', validateMsg: '请填写完整且有效的 I 级充电过流参数', initForm: (tab, p) => { tab.form.T = toDisplayCurrent(Number(p["bat_OCC1T"] ?? 0)); tab.form.D = toDisplayTime(Number(p["bat_OCC1D"] ?? 0)); tab.form.RD = toDisplayTime(Number(p["bat_OCC1RD"] ?? 100)) } },
  { key: 'chargeOcc2', title: 'II级充电过流', desc: '设置 II 级充电过流阈值与延时', component: ChargeOccTab, variant: 'occ2', rangeType: 'common', apiPath: '/bms/api/set/params/batOCC2', configName: 'II级充电过流配置', validateMsg: '请填写完整且有效的 II 级充电过流参数', initForm: (tab, p) => { tab.form.T = toDisplayCurrent(Number(p["bat_OCC2T"] ?? 0)); tab.form.D = toDisplayTime(Number(p["bat_OCC2D"] ?? 0)); tab.form.RD = toDisplayTime(Number(p["bat_OCC2RD"] ?? 100)) } },
  { key: 'dischargeScd', title: '放电短路保护', desc: '设置放电短路电流阈值与延时', component: DischargeScdTab, rangeType: 'common', apiPath: '/bms/api/set/params/batSCD', configName: '放电短路保护配置', validateMsg: '请填写完整且有效的放电短路保护参数', initForm: (tab, p) => { tab.form.bat_SCDT = toDisplayCurrent(Number(p["bat_SCDT"] ?? 0)); tab.form.bat_SCDD = toDisplayMicroseconds(Number(p["bat_SCDD"] ?? 0)) } },
  { key: 'tempOTD', title: '放电高温保护', desc: '放电电芯高温触发/恢复阈值', component: TempProtectTab, variant: 'OTD', rangeType: 'common', apiPath: '/bms/api/set/params/batOTD', configName: '放电高温保护配置', validateMsg: '请填写完整且有效的放电高温保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.T = kelvinToCelsius(Number(p["bat_OTDT"] ?? 333)); tab.form.D = toDisplayTime(Number(p["bat_OTDD"] ?? 0)); tab.form.RT = kelvinToCelsius(Number(p["bat_OTDRT"] ?? 323)); tab.form.RD = toDisplayTime(Number(p["bat_OTDRD"] ?? 100)) } },
  { key: 'tempUTD', title: '放电低温保护', desc: '放电电芯低温触发/恢复阈值', component: TempProtectTab, variant: 'UTD', rangeType: 'common', apiPath: '/bms/api/set/params/batUTD', configName: '放电低温保护配置', validateMsg: '请填写完整且有效的放电低温保护参数（触发门限需小于恢复门限）', initForm: (tab, p) => { tab.form.T = kelvinToCelsius(Number(p["bat_UTDT"] ?? 253)); tab.form.D = toDisplayTime(Number(p["bat_UTDD"] ?? 0)); tab.form.RT = kelvinToCelsius(Number(p["bat_UTDRT"] ?? 263)); tab.form.RD = toDisplayTime(Number(p["bat_UTDRD"] ?? 100)) } },
  { key: 'tempOTC', title: '充电高温保护', desc: '充电电芯高温触发/恢复阈值', component: TempProtectTab, variant: 'OTC', rangeType: 'common', apiPath: '/bms/api/set/params/batOTC', configName: '充电高温保护配置', validateMsg: '请填写完整且有效的充电高温保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.T = kelvinToCelsius(Number(p["bat_OTCT"] ?? 328)); tab.form.D = toDisplayTime(Number(p["bat_OTCD"] ?? 0)); tab.form.RT = kelvinToCelsius(Number(p["bat_OTCRT"] ?? 318)); tab.form.RD = toDisplayTime(Number(p["bat_OTCRD"] ?? 100)) } },
  { key: 'tempUTC', title: '充电低温保护', desc: '充电电芯低温触发/恢复阈值', component: TempProtectTab, variant: 'UTC', rangeType: 'common', apiPath: '/bms/api/set/params/batUTC', configName: '充电低温保护配置', validateMsg: '请填写完整且有效的充电低温保护参数（触发门限需小于恢复门限）', initForm: (tab, p) => { tab.form.T = kelvinToCelsius(Number(p["bat_UTCT"] ?? 273)); tab.form.D = toDisplayTime(Number(p["bat_UTCD"] ?? 0)); tab.form.RT = kelvinToCelsius(Number(p["bat_UTCRT"] ?? 278)); tab.form.RD = toDisplayTime(Number(p["bat_UTCRD"] ?? 100)) } },
  { key: 'tempMosOTC', title: 'MOS高温保护', desc: 'MOS 管高温触发/恢复阈值', component: TempProtectTab, variant: 'mosOTC', rangeType: 'common', apiPath: '/bms/api/set/params/mosOTC', configName: 'MOS高温保护配置', validateMsg: '请填写完整且有效的MOS高温保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.T = kelvinToCelsius(Number(p["mos_OTCT"] ?? 353)); tab.form.D = toDisplayTime(Number(p["mos_OTCD"] ?? 0)); tab.form.RT = kelvinToCelsius(Number(p["mos_OTCRT"] ?? 343)); tab.form.RD = toDisplayTime(Number(p["mos_OTCRD"] ?? 100)) } },
  { key: 'cellOv1', title: 'I级(软件)电芯过压', desc: 'I级软件电芯过压触发/恢复阈值', component: CellOv1Tab, rangeType: 'material', apiPath: '/bms/api/set/params/ceOV1', configName: 'I级(软件)电芯过压保护配置', validateMsg: '请填写完整且有效的I级(软件)电芯过压保护参数（触发门限需大于恢复门限）', initForm: (tab, p) => { tab.form.cell_OV1T = Number(p["cell_OV1T"] ?? 3650); tab.form.cell_OV1D = Number(p["cell_OV1D"] ?? 0); tab.form.cell_OVR1T = Number(p["cell_OVR1T"] ?? 3600); tab.form.cell_OVR1D = Number(p["cell_OVR1D"] ?? 100); tab.form.cell_OVRP1flag = (Number(p["cell_OVRP1flag"] ?? 1) === 0 ? 0 : 1) as 0 | 1 } }
]

/** 加载设备参数和范围 */
async function loadParams(forceRefill = false) {
  if (!props.bmsId) return
  loadingParams.value = true
  try {
    const [basicRes, paramRes, srvRes] = await Promise.all([
      getBasicInfoReq(props.bmsId),
      getBmsParamsReq(props.bmsId),
      getThirdServerListReq()
    ])

    // 优先使用 basicInfo 中的数据（BT码、三方后台等）
    if (basicRes.errno === 0 && basicRes.data?.basicInfo) {
      const basic = basicRes.data.basicInfo
      bmsParams.value = { ...basic, ...(paramRes.data?.bmsParams ?? {}) }
      commonRanges.value = paramRes.data?.ranges ?? {}
    } else if (paramRes.errno === 0 && paramRes.data) {
      bmsParams.value = paramRes.data.bmsParams ?? {}
      commonRanges.value = paramRes.data.ranges ?? {}
    }

    if (Object.keys(bmsParams.value).length > 0) {
      // 初始化 BT 码
      btcodeText.value = String(bmsParams.value["btCode"] ?? bmsParams.value["bt_code"] ?? bmsParams.value["btcode"] ?? "")
      // 初始化三方后台
      selectedThirdSrvValue.value = String(bmsParams.value["t_server"] ?? bmsParams.value["tServer"] ?? "")
      // 初始化材料类型
      const cm = Number(bmsParams.value["cell_mat"] ?? 1)
      materialType.value = cm === 2 ? 2 : 1
      // 加载材料相关的范围
      await loadMaterialRanges()

      // 等待 Tab 组件挂载后再初始化表单数据
      await nextTick()
      if (forceRefill) await nextTick()
      initTabForms()
    } else {
      ElMessage.error(paramRes.errmsg ?? '获取参数失败')
    }

    if (srvRes.errno === 0 && srvRes.data?.tsrv_list) {
      thirdSrvList.value = srvRes.data.tsrv_list
    }
  } catch {
    ElMessage.error("加载参数失败")
  } finally {
    loadingParams.value = false
  }
}

/** 初始化各个 Tab 的表单数据 */
function initTabForms() {
  const p = bmsParams.value;
  [...basicConfigTabs, ...advancedConfigTabs].forEach(config => {
    const tab = tabRefs.value[config.key]
    if (tab && config.initForm) {
      config.initForm(tab, p)
    }
  })
}

/** 统一请求参数范围（无 cell_mat） */
async function loadCommonRanges() {
  loadingRanges.value = true
  try {
    const res = await getParamsRangeReq()
    if (res.errno === 0 && res.data?.ranges) {
      commonRanges.value = res.data.ranges
    } else {
      commonRanges.value = {}
    }
  } catch {
    commonRanges.value = {}
  } finally {
    loadingRanges.value = false
  }
}

/** 根据材料类型请求参数范围 */
async function loadMaterialRanges() {
  loadingMaterialRanges.value = true
  try {
    const res = await getParamsRangeReq({ cell_mat: materialType.value })
    if (res.errno === 0 && res.data?.ranges) {
      materialRanges.value = res.data.ranges
    } else {
      materialRanges.value = {}
    }
  } catch {
    materialRanges.value = {}
  } finally {
    loadingMaterialRanges.value = false
  }
}

/** 监听弹窗显示状态，打开时加载数据 */
watch(
  () => props.modelValue,
  async val => {
    if (val && props.bmsId) {
      await Promise.all([loadCommonRanges(), loadParams()])
    }
  },
  { immediate: true }
)

/** 统一的配置下发后刷新逻辑 */
async function refreshAfterSubmit() {
  emit("success")
  refreshingAfterSubmit.value = true
  setTimeout(async () => {
    await loadParams(true)
    refreshingAfterSubmit.value = false
  }, 5 * 1000)
}

/** 统一的提交处理函数 */
async function handleSubmit(configKey: string) {
  if (!props.bmsId) return

  const config = [...basicConfigTabs, ...advancedConfigTabs].find(c => c.key === configKey)
  if (!config) return

  const tab = tabRefs.value[configKey]

  // 特殊处理：BT码
  if (configKey === 'btcode') {
    const btcode = btcodes.value
    if (!btcode) {
      ElMessage.warning("请先输入 BT 码")
      return
    }
    await confirmAndSubmit({
      configName: config.configName!,
      execute: async () => setBmsParamsReq(config.apiPath!, props.bmsId!, { btcode }),
      onSuccess: refreshAfterSubmit
    })
    return
  }

  // 特殊处理：三方后台
  if (configKey === 'thirdServer') {
    if (!selectedThirdSrvValue.value) {
      ElMessage.warning("请选择三方后台地址")
      return
    }
    await confirmAndSubmit({
      configName: config.configName!,
      execute: async () => setBmsParamsReq(config.apiPath!, props.bmsId!, { ctsrv: selectedThirdSrvValue.value }),
      onSuccess: refreshAfterSubmit
    })
    return
  }

  // 特殊处理：硬件级放电过流（只读，不允许提交）
  if (configKey === 'hardwareOcd') {
    ElMessage.warning("硬件级放电过流参数为只读，不允许修改")
    return
  }

  // 通用处理：验证 + 提交
  if (!tab?.validate()) {
    ElMessage.warning(config.validateMsg || "请填写完整且有效的参数")
    return
  }

  const payload = config.getPayload ? config.getPayload(tab) : tab.getPayload()

  await confirmAndSubmit({
    configName: config.configName!,
    execute: async () => setBmsParamsReq(config.apiPath!, props.bmsId!, payload),
    onSuccess: refreshAfterSubmit
  })
}

const sectionTitle = computed(() => (activeMainTab.value === "basic" ? "基础配置" : "其它配置"))

/** 监听材料类型变化，重新加载参数范围 */
watch(materialType, () => {
  loadMaterialRanges()
})

/** 监听主 Tab 切换，重新初始化表单数据（解决切换后回显丢失问题） */
watch(activeMainTab, async () => {
  await nextTick()
  initTabForms()
})

/** 渲染配置卡片 */
function renderConfigCard(config: TabConfig) {
  const ranges = config.rangeType === 'material' ? materialRanges.value : commonRanges.value
  const loadingRange = config.rangeType === 'material' ? loadingMaterialRanges.value : loadingRanges.value

  return {
    ...config,
    ranges,
    loadingRange
  }
}
</script>

<style scoped lang="scss">
/* 容器基础设置 */
.param-dialog {
  padding: 8px;
}

/* 修复 Label 宽度自适应 */
:deep(.el-form-item__label) {
  width: auto !important;
  color: #475569;
  /* Label 颜色微调，不那么死黑 */
  font-weight: 500;
}

/* 主卡片容器 */
.param-card {
  background: #f3f7fa;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 15px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.param-card__head {
  margin-bottom: 20px;
  border-left: 4px solid var(--el-color-primary);
  padding-left: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.bms-id {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* Tab 切换器 */
.main-tabs {
  display: inline-flex;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e2e2;
}

.main-tab-item {
  min-width: 100px;
  padding: 8px 20px;
  text-align: center;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: #0f172a;
  }

  &.active {
    background: #ffffff;
    color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

/* 网格布局 */
.card-grid-basic,
.card-grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.card-grid-basic {
  grid-template-columns: repeat(3, 1fr);
}

.card-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  max-height: 60vh;
  overflow-y: auto;
  padding: 4px 10px 10px 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
}

/* 卡片单项 */
.param-card-item {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 10px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    border-color: rgba(64, 158, 255, 0.2);
  }
}

.param-card-item__header {
  margin-bottom: 16px;
}

.param-card-item__title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--el-color-primary);
    border-radius: 50%;
    margin-right: 8px;
    opacity: 0.7;
  }
}

.param-card-item__desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.param-card-item__body {
  flex: 1;
  background: #f8fafc;
  /* 浅灰底色，与白色输入框形成对比 */
  border-radius: 8px;
  padding: 12px;
}

.param-card-item__footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
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

/* --- 新增：输入框与下拉框美化 --- */
/* 统一处理输入框容器、下拉框容器、文本域 */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-textarea__inner) {
  background-color: #ffffff !important;
  /* 纯白背景 */
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  /* 极细的淡灰边框 */
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.2s ease;

  /* 悬停状态：边框稍微加深 */
  &:hover {
    box-shadow: 0 0 0 1px #94a3b8 inset !important;
  }

  /* 聚焦状态：主色边框 + 柔和光晕 */
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
  /* 黑色文字 */
  font-weight: 500;
  height: 32px;

  &::placeholder {
    color: #cbd5e1;
    /* 占位符颜色更淡，不抢视觉 */
  }
}


/* 禁用状态的特殊处理 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f1f5f9 !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;

  .el-input__inner {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    /* 兼容 Safari */
  }
}
</style>
