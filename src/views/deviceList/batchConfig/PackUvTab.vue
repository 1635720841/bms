<template>
  <div class="bat-uv-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(V)',
          modelValue: form.bat_UVT,
          options: uvtOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_UVT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.bat_UVD,
          options: uvdOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_UVD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <ParamFormRow
      :fields="[
        {
          label: '恢复门限(V)',
          modelValue: form.bat_UVRT,
          options: uvrtOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_UVRT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.bat_UVRD,
          options: uvrdOptions,
          loading: props.loadingRanges,
          fieldKey: 'bat_UVRD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <div class="hint">触发门限需小于恢复门限</div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsOnePointV,
  generateOptionsTenPerOnePointV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "PackUvTab" });

const props = defineProps<{
  /** 参数范围（由父组件统一请求，无 cell_mat） */
  ranges: BmsRangesMap;
  loadingRanges: boolean;
}>();

/** 表单存接口单位：T/RT 0.1V，D/RD 100ms */
const form = reactive({
  bat_UVT: 300,
  bat_UVD: 0,
  bat_UVRT: 310,
  bat_UVRD: 100
});

const uvtOptions = computed(() => {
  const r = props.ranges.bat_UVT;
  if (!r) return fallbackUvt;
  return generateOptionsOnePointV(r);
});
const uvdOptions = computed(() => {
  const r = props.ranges.bat_UVD;
  if (!r) return fallbackUvd;
  return generateTimeOptionsOnePointS(r);
});
const uvrtOptions = computed(() => {
  const r = props.ranges.bat_UVRT;
  if (!r) return fallbackUvrt;
  return generateOptionsOnePointV(r);
});
const uvrdOptions = computed(() => {
  const r = props.ranges.bat_UVRD;
  if (!r) return fallbackUvrd;
  return generateTimeOptionsTenOrMore(r);
});

const fallbackUvt = generateOptionsOnePointV([200, 800]);
const fallbackUvd = generateTimeOptionsOnePointS([0, 600]);
const fallbackUvrt = generateOptionsOnePointV([200, 800]);
const fallbackUvrd = generateTimeOptionsTenOrMore([100, 6000]);

watch(
  () => props.ranges,
  ranges => {
    if (ranges.bat_UVT?.length === 2) form.bat_UVT = ranges.bat_UVT[0];
    if (ranges.bat_UVD?.length === 2) form.bat_UVD = ranges.bat_UVD[0];
    if (ranges.bat_UVRT?.length === 2) form.bat_UVRT = ranges.bat_UVRT[0];
    if (ranges.bat_UVRD?.length === 2) form.bat_UVRD = ranges.bat_UVRD[0];
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(Number(form.bat_UVT)) ||
    !Number.isFinite(Number(form.bat_UVD)) ||
    !Number.isFinite(Number(form.bat_UVRT)) ||
    !Number.isFinite(Number(form.bat_UVRD))
  ) {
    return false;
  }
  /** 欠压：触发门限需小于恢复门限 */
  if (Number(form.bat_UVT) >= Number(form.bat_UVRT)) return false;
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
  if (fieldKey === "bat_UVT") form.bat_UVT = numValue;
  else if (fieldKey === "bat_UVD") form.bat_UVD = numValue;
  else if (fieldKey === "bat_UVRT") form.bat_UVRT = numValue;
  else if (fieldKey === "bat_UVRD") form.bat_UVRD = numValue;
}

function getPayload() {
  return {
    T: to01V(form.bat_UVT),
    D: to100ms(form.bat_UVD),
    RT: to01V(form.bat_UVRT),
    RD: to100ms(form.bat_UVRD)
  };
}

defineExpose({ form, validate, getPayload });
</script>


<style scoped lang="scss">
.bat-uv-tab {
  margin-top: 4px;
}
.hint {
  margin-top: -8px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>








