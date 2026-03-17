<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsVoltageMV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "CellOvTab" });

const props = defineProps<{
  /** 参数范围（由父组件根据材料类型请求） */
  ranges: BmsRangesMap;
  loadingRanges: boolean;
}>();

/** 表单存接口单位：T/RT mV，D/RD 100ms */
const form = reactive({
  cell_OVT: 3650,
  cell_OVD: 10,
  cell_OVRT: 3550,
  cell_OVRD: 100
});

const ovtOptions = computed(() => {
  const r = props.ranges.cell_OVT;
  if (!r) return fallbackOvt;
  return generateOptionsVoltageMV(r);
});
const ovdOptions = computed(() => {
  const r = props.ranges.cell_OVD;
  if (!r) return fallbackOvd;
  return generateTimeOptionsOnePointS(r);
});
const ovrtOptions = computed(() => {
  const r = props.ranges.cell_OVRT;
  if (!r) return fallbackOvrt;
  return generateOptionsVoltageMV(r);
});
const ovrdOptions = computed(() => {
  const r = props.ranges.cell_OVRD;
  if (!r) return fallbackOvrd;
  return generateTimeOptionsTenOrMore(r);
});

const fallbackOvt = generateOptionsVoltageMV([3000, 4000]);
const fallbackOvd = generateTimeOptionsOnePointS([0, 600]);
const fallbackOvrt = generateOptionsVoltageMV([3000, 3900]);
const fallbackOvrd = generateTimeOptionsTenOrMore([100, 6000]);

watch(
  () => props.ranges,
  ranges => {
    if (ranges.cell_OVT?.length === 2) form.cell_OVT = ranges.cell_OVT[0];
    if (ranges.cell_OVD?.length === 2) form.cell_OVD = ranges.cell_OVD[0];
    if (ranges.cell_OVRT?.length === 2) form.cell_OVRT = ranges.cell_OVRT[0];
    if (ranges.cell_OVRD?.length === 2) form.cell_OVRD = ranges.cell_OVRD[0];
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(form.cell_OVT) ||
    !Number.isFinite(form.cell_OVD) ||
    !Number.isFinite(form.cell_OVRT) ||
    !Number.isFinite(form.cell_OVRD)
  ) {
    return false;
  }
  if (Number(form.cell_OVT) <= Number(form.cell_OVRT)) return false;
  return true;
}

function handleUpdate(fieldKey: string, value: number | string) {
  const numValue = typeof value === "string" ? Number(value) : value;
  if (fieldKey === "cell_OVT") form.cell_OVT = numValue;
  else if (fieldKey === "cell_OVD") form.cell_OVD = numValue;
  else if (fieldKey === "cell_OVRT") form.cell_OVRT = numValue;
  else if (fieldKey === "cell_OVRD") form.cell_OVRD = numValue;
}

function getPayload() {
  return {
    T: Number(form.cell_OVT),
    D: typeof form.cell_OVD === "string" ? Math.round(Number(form.cell_OVD) * 10) : Number(form.cell_OVD),
    RT: Number(form.cell_OVRT),
    RD: typeof form.cell_OVRD === "string" ? Math.round(Number(form.cell_OVRD) * 10) : Number(form.cell_OVRD)
  };
}

defineExpose({
  form,
  validate,
  getPayload
});
</script>

<template>
  <div class="cell-ov-tab">
    <ParamFormRow
      :fields="[
        {
          label: '触发门限(mV)',
          modelValue: form.cell_OVT,
          options: ovtOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_OVT',
          span: 14

        },
        {
          label: '延时(S)',
          modelValue: form.cell_OVD,
          options: ovdOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_OVD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <ParamFormRow
      :fields="[
        {
          label: '恢复门限(mV)',
          modelValue: form.cell_OVRT,
          options: ovrtOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_OVRT',
          span: 14
        },
        {
          label: '延时(S)',
          modelValue: form.cell_OVRD,
          options: ovrdOptions,
          loading: props.loadingRanges,
          fieldKey: 'cell_OVRD',
          span: 10
        }
      ]"
      @update:field="handleUpdate"
    />
    <div class="hint">触发门限需大于恢复门限</div>
  </div>
</template>

<style scoped lang="scss">
.cell-ov-tab {
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
