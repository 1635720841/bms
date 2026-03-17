<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateTemperatureOptions,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "TempProtectTab" });

const props = defineProps<{
  /** 温度保护类型：OTD-放电高温 UTD-放电低温 OTC-充电高温 UTC-充电低温 mosOTC-mos高温 */
  variant: "OTD" | "UTD" | "OTC" | "UTC" | "mosOTC";
  /** 参数范围（由父组件统一请求） */
  ranges: BmsRangesMap;
  /** 加载状态（由父组件统一管理） */
  loadingRanges: boolean;
}>();

const rangePrefix = computed(() => {
  if (props.variant === "mosOTC") return "mos_OTC";
  return `bat_${props.variant}`;
});

const rangeKeyT = computed(() => `${rangePrefix.value}T`);
const rangeKeyD = computed(() => `${rangePrefix.value}D`);
const rangeKeyRT = computed(() => `${rangePrefix.value}RT`);
const rangeKeyRD = computed(() => `${rangePrefix.value}RD`);

/** 表单存接口单位：T/RT 温度（℃），D/RD 100ms */
const form = reactive({
  T: 60,
  D: 0,
  RT: 50,
  RD: 100
});

const tOptions = computed(() => {
  const r = props.ranges[rangeKeyT.value];
  // 温度范围后端为开尔文，前端展示为摄氏度 → 统一减去 273 再生成选项
  if (r && r.length === 2) {
    const rangeC: [number, number] = [r[0] - 273, r[1] - 273];
    return generateTemperatureOptions(rangeC);
  }
  return fallbackT;
});
const dOptions = computed(() => {
  const r = props.ranges[rangeKeyD.value];
  return r ? generateTimeOptionsOnePointS(r) : fallbackD;
});
const rtOptions = computed(() => {
  const r = props.ranges[rangeKeyRT.value];
  if (r && r.length === 2) {
    const rangeC: [number, number] = [r[0] - 273, r[1] - 273];
    return generateTemperatureOptions(rangeC);
  }
  return fallbackRT;
});
const rdOptions = computed(() => {
  const r = props.ranges[rangeKeyRD.value];
  return r ? generateTimeOptionsTenOrMore(r) : fallbackRD;
});

const fallbackT = generateTemperatureOptions([-40, 100]);
const fallbackD = generateTimeOptionsOnePointS([0, 600]);
const fallbackRT = generateTemperatureOptions([-40, 100]);
const fallbackRD = generateTimeOptionsTenOrMore([100, 6000]);

/** 当 ranges 变化时，更新表单初始值 */
watch(
  () => props.ranges,
  ranges => {
    const tRange = ranges[rangeKeyT.value];
    const dRange = ranges[rangeKeyD.value];
    const rtRange = ranges[rangeKeyRT.value];
    const rdRange = ranges[rangeKeyRD.value];

    // 温度：后端为 K，表单展示为 ℃，取最小值做默认
    if (tRange && tRange.length === 2) form.T = tRange[0] - 273;
    // 延时：后端为 100ms，表单展示为秒，取最小值 /10
    if (dRange && dRange.length === 2) form.D = dRange[0] / 10;
    if (rtRange && rtRange.length === 2) form.RT = rtRange[0] - 273;
    if (rdRange && rdRange.length === 2) form.RD = rdRange[0] / 10;
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(Number(form.T)) ||
    !Number.isFinite(Number(form.D)) ||
    !Number.isFinite(Number(form.RT)) ||
    !Number.isFinite(Number(form.RD))
  ) {
    return false;
  }
  // 高温保护：触发门限需大于恢复门限
  if (props.variant === "OTD" || props.variant === "OTC" || props.variant === "mosOTC") {
    if (Number(form.T) <= Number(form.RT)) return false;
  }
  // 低温保护：触发门限需小于恢复门限
  if (props.variant === "UTD" || props.variant === "UTC") {
    if (Number(form.T) >= Number(form.RT)) return false;
  }
  return true;
}

function to100ms(val: number | string): number {
  const num = typeof val === "string" ? Number(val) : val;
  return Math.round(Number(num) * 10);
}

function toKelvin(val: number | string): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num + 273);
}

function handleUpdate(fieldKey: string, value: number | string) {
  const numValue = typeof value === "string" ? Number(value) : value;
  if (fieldKey === "T") form.T = numValue;
  else if (fieldKey === "D") form.D = numValue;
  else if (fieldKey === "RT") form.RT = numValue;
  else if (fieldKey === "RD") form.RD = numValue;
}

function getPayload() {
  return {
    // 与小程序保持一致：接口 T/RT 为开尔文，D/RD 为 100ms
    T: toKelvin(form.T),
    D: to100ms(form.D),
    RT: toKelvin(form.RT),
    RD: to100ms(form.RD)
  };
}

const hintText = computed(() => {
  if (props.variant === "OTD" || props.variant === "OTC" || props.variant === "mosOTC") {
    return "触发门限需大于恢复门限";
  }
  return "触发门限需小于恢复门限";
});

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="temp-protect-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(℃)',
          modelValue: form.T,
          options: tOptions,
          loading: props.loadingRanges,
          fieldKey: 'T',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.D,
          options: dOptions,
          loading: props.loadingRanges,
          fieldKey: 'D',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <ParamFormRow
      :fields="[
        {
          label: '恢复门限(℃)',
          modelValue: form.RT,
          options: rtOptions,
          loading: props.loadingRanges,
          fieldKey: 'RT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.RD,
          options: rdOptions,
          loading: props.loadingRanges,
          fieldKey: 'RD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <div class="hint">{{ hintText }}</div>
  </div>
</template>

<style scoped lang="scss">
.temp-protect-tab {
  margin-top: 4px;
}
.hint {
  margin-top: -8px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>

