<template>
  <div class="bat-occ-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(A)',
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
          label: '恢复延时(S)',
          modelValue: form.RD,
          options: rdOptions,
          loading: false,
          fieldKey: 'RD',
          span: 14
        }
      ]"
      @update:field="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsTenPerOnePointV,
  generateTimeOptionsOnePointS
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "ChargeOccTab" });

const props = defineProps<{
  /** 充电过流档位：occ1 / occ2，对应不同接口字段与初始值 */
  variant: "occ1" | "occ2";
  /** 参数范围（由父组件统一请求） */
  ranges: BmsRangesMap;
  /** 加载状态（由父组件统一管理） */
  loadingRanges: boolean;
}>();

const rangeKeyT = computed(() => (props.variant === "occ1" ? "bat_OCC1T" : "bat_OCC2T"));
const rangeKeyD = computed(() => (props.variant === "occ1" ? "bat_OCC1D" : "bat_OCC2D"));

const initialValues = computed(() =>
  props.variant === "occ1" ? { T: 100, D: 0, RD: 100 } : { T: 150, D: 0, RD: 100 }
);

/** 表单存接口单位：T 0.1A，D/RD 100ms（注意：小程序中无RT恢复门限字段） */
const form = reactive({
  T: initialValues.value.T,
  D: initialValues.value.D,
  RD: initialValues.value.RD
});

const tOptions = computed(() => {
  const r = props.ranges[rangeKeyT.value];
  return r ? generateOptionsTenPerOnePointV(r) : fallbackOccT;
});
const dOptions = computed(() => {
  const r = props.ranges[rangeKeyD.value];
  return r ? generateTimeOptionsOnePointS(r) : fallbackOccD;
});
/** 延时选项：小程序使用固定值 [1,10,20,30,40,50,60] */
const rdOptions = computed(() => {
  return [
    { label: "1", value: 10 },
    { label: "10", value: 100 },
    { label: "20", value: 200 },
    { label: "30", value: 300 },
    { label: "40", value: 400 },
    { label: "50", value: 500 },
    { label: "60", value: 600 }
  ];
});

const fallbackOccT = generateOptionsTenPerOnePointV([100, 5000]);
const fallbackOccD = generateTimeOptionsOnePointS([0, 600]);

/** 当 ranges 变化时，更新表单初始值 */
watch(
  () => props.ranges,
  ranges => {
    if (ranges[rangeKeyT.value]?.length === 2) form.T = ranges[rangeKeyT.value][0];
    if (ranges[rangeKeyD.value]?.length === 2) form.D = ranges[rangeKeyD.value][0];
    // RD 使用固定默认值 100 (对应10s)
    form.RD = 100;
  },
  { immediate: true }
);

function validate(): boolean {
  return (
    Number.isFinite(Number(form.T)) &&
    Number.isFinite(Number(form.D)) &&
    Number.isFinite(Number(form.RD))
  );
}

function to01A(val: number | string): number {
  const n = Number(val);
  return n < 100 ? Math.round(n * 10) : n;
}
function to100ms(val: number | string): number {
  if (typeof val === "string") return Math.round(Number(val) * 10);
  return Number(val);
}

function handleUpdate(fieldKey: string, value: number | string) {
  const numValue = typeof value === "string" ? Number(value) : value;
  if (fieldKey === "T") form.T = numValue;
  else if (fieldKey === "D") form.D = numValue;
  else if (fieldKey === "RD") form.RD = numValue;
}

function getPayload() {
  return {
    T: to01A(form.T),
    D: to100ms(form.D),
    RD: to100ms(form.RD)
  };
}

defineExpose({ form, validate, getPayload });
</script>

