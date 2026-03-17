<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsTenPerOnePointV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "PackOvTab" });

const props = defineProps<{
  /** 参数范围（由父组件统一请求，无 cell_mat） */
  ranges: BmsRangesMap;
  loadingRanges: boolean;
}>();

/** 表单存接口单位：T/RT 0.1V，D/RD 100ms */
const form = reactive({
  bat_OVT: 480,
  bat_OVD: 0,
  bat_OVRT: 470,
  bat_OVRD: 100
});

const ovtOptions = computed(() => {
  const r = props.ranges.bat_OVT;
  if (!r) return fallbackOvt;
  return generateOptionsTenPerOnePointV(r);
});
const ovdOptions = computed(() => {
  const r = props.ranges.bat_OVD;
  if (!r) return fallbackOvd;
  return generateTimeOptionsOnePointS(r);
});
const ovrtOptions = computed(() => {
  const r = props.ranges.bat_OVRT;
  if (!r) return fallbackOvrt;
  return generateOptionsTenPerOnePointV(r);
});
const ovrdOptions = computed(() => {
  const r = props.ranges.bat_OVRD;
  if (!r) return fallbackOvrd;
  return generateTimeOptionsTenOrMore(r);
});

const fallbackOvt = generateOptionsTenPerOnePointV([300, 1000]);
const fallbackOvd = generateTimeOptionsOnePointS([0, 600]);
const fallbackOvrt = generateOptionsTenPerOnePointV([300, 1000]);
const fallbackOvrd = generateTimeOptionsTenOrMore([100, 6000]);

watch(
  () => props.ranges,
  ranges => {
    if (ranges.bat_OVT?.length === 2) form.bat_OVT = ranges.bat_OVT[0];
    if (ranges.bat_OVD?.length === 2) form.bat_OVD = ranges.bat_OVD[0];
    if (ranges.bat_OVRT?.length === 2) form.bat_OVRT = ranges.bat_OVRT[0];
    if (ranges.bat_OVRD?.length === 2) form.bat_OVRD = ranges.bat_OVRD[0];
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(Number(form.bat_OVT)) ||
    !Number.isFinite(Number(form.bat_OVD)) ||
    !Number.isFinite(Number(form.bat_OVRT)) ||
    !Number.isFinite(Number(form.bat_OVRD))
  ) {
    return false;
  }
  /** 过压：触发门限需大于恢复门限 */
  if (Number(form.bat_OVT) <= Number(form.bat_OVRT)) return false;
  return true;
}

/** 选项 value 为 0.1V；用户输入可能是 V，≤100 时按 V×10 转为 0.1V */
function to01V(val: number | string): number {
  const n = Number(val);
  return n < 100 ? Math.round(n * 10) : n;
}
/** 选项 value 为 100ms（数字）；用户输入为字符串时按 S 转为 100ms */
function to100ms(val: number | string): number {
  if (typeof val === "string") return Math.round(Number(val) * 10);
  return Number(val);
}

function handleUpdate(fieldKey: string, value: number | string) {
  const numValue = typeof value === "string" ? Number(value) : value;
  if (fieldKey === "bat_OVT") form.bat_OVT = numValue;
  else if (fieldKey === "bat_OVD") form.bat_OVD = numValue;
  else if (fieldKey === "bat_OVRT") form.bat_OVRT = numValue;
  else if (fieldKey === "bat_OVRD") form.bat_OVRD = numValue;
}

function getPayload() {
  return {
    T: to01V(form.bat_OVT),
    D: to100ms(form.bat_OVD),
    RT: to01V(form.bat_OVRT),
    RD: to100ms(form.bat_OVRD)
  };
}

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="bat-ov-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(V)',
          modelValue: form.bat_OVT,
          options: ovtOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_OVT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.bat_OVD,
          options: ovdOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_OVD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <ParamFormRow
      :fields="[
        {
          label: '恢复门限(V)',
          modelValue: form.bat_OVRT,
          options: ovrtOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_OVRT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.bat_OVRD,
          options: ovrdOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_OVRD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <div class="hint">触发门限需大于恢复门限</div>
  </div>
</template>

<style scoped lang="scss">
.bat-ov-tab {
  margin-top: 4px;
}
.hint {
  margin-top: -8px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>

