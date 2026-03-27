<template>
  <div class="cell-uv-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(mV)',
          modelValue: form.cell_UVT,
          options: uvtOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_UVT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.cell_UVD,
          options: uvdOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_UVD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <ParamFormRow
      :fields="[
        {
          label: '恢复门限(mV)',
          modelValue: form.cell_UVRT,
          options: uvrtOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_UVRT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.cell_UVRD,
          options: uvrdOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_UVRD',
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
  generateOptionsVoltageMV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "CellUvTab" });

const props = defineProps<{
  /** 参数范围（由父组件根据材料类型请求） */
  ranges: BmsRangesMap;
  loadingRanges: boolean;
}>();

/** 表单存接口单位：T/RT mV，D/RD 100ms */
const form = reactive({
  cell_UVT: 2500,
  cell_UVD: 10,
  cell_UVRT: 2700,
  cell_UVRD: 100
});

const uvtOptions = computed(() => {
  const r = props.ranges.cell_UVT;
  if (!r) return fallbackUvt;
  return generateOptionsVoltageMV(r);
});
const uvdOptions = computed(() => {
  const r = props.ranges.cell_UVD;
  if (!r) return fallbackUvd;
  return generateTimeOptionsOnePointS(r);
});
const uvrtOptions = computed(() => {
  const r = props.ranges.cell_UVRT;
  if (!r) return fallbackUvrt;
  return generateOptionsVoltageMV(r);
});
const uvrdOptions = computed(() => {
  const r = props.ranges.cell_UVRD;
  if (!r) return fallbackUvrd;
  return generateTimeOptionsTenOrMore(r);
});

const fallbackUvt = generateOptionsVoltageMV([2000, 3200]);
const fallbackUvd = generateTimeOptionsOnePointS([0, 600]);
const fallbackUvrt = generateOptionsVoltageMV([2200, 3400]);
const fallbackUvrd = generateTimeOptionsTenOrMore([100, 6000]);

watch(
  () => props.ranges,
  ranges => {
    if (ranges.cell_UVT?.length === 2) form.cell_UVT = ranges.cell_UVT[0];
    if (ranges.cell_UVD?.length === 2) form.cell_UVD = ranges.cell_UVD[0];
    if (ranges.cell_UVRT?.length === 2) form.cell_UVRT = ranges.cell_UVRT[0];
    if (ranges.cell_UVRD?.length === 2) form.cell_UVRD = ranges.cell_UVRD[0];
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(form.cell_UVT) ||
    !Number.isFinite(form.cell_UVD) ||
    !Number.isFinite(form.cell_UVRT) ||
    !Number.isFinite(form.cell_UVRD)
  ) {
    return false;
  }
  /** 欠压：触发门限需小于恢复门限 */
  if (Number(form.cell_UVT) >= Number(form.cell_UVRT)) return false;
  return true;
}

function handleUpdate(fieldKey: string, value: number | string) {
  const numValue = typeof value === "string" ? Number(value) : value;
  if (fieldKey === "cell_UVT") form.cell_UVT = numValue;
  else if (fieldKey === "cell_UVD") form.cell_UVD = numValue;
  else if (fieldKey === "cell_UVRT") form.cell_UVRT = numValue;
  else if (fieldKey === "cell_UVRD") form.cell_UVRD = numValue;
}

function getPayload() {
  return {
    T: Number(form.cell_UVT),
    D: typeof form.cell_UVD === "string" ? Math.round(Number(form.cell_UVD) * 10) : Number(form.cell_UVD),
    RT: Number(form.cell_UVRT),
    RD: typeof form.cell_UVRD === "string" ? Math.round(Number(form.cell_UVRD) * 10) : Number(form.cell_UVRD)
  };
}

defineExpose({
  form,
  validate,
  getPayload
});
</script>


<style scoped lang="scss">
.cell-uv-tab {
  margin-top: 4px;
}
.material-radio {
  margin-right: 16px;
}
.hint {
  margin-top: -8px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>

