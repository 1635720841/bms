<template>
  <div class="bat-scd-tab">
    <ParamFormRow :fields="[
      {
        label: '触发门限(A)',
        modelValue: form.bat_SCDT,
        options: scdtOptions,
        loading: props.loadingRanges,
        fieldKey: 'bat_SCDT'
      },
      {
        label: '延时(us)',
        modelValue: form.bat_SCDD,
        options: scddOptions,
        loading: props.loadingRanges,
        fieldKey: 'bat_SCDD'
      }
    ]" @update:field="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateSCDTOptions,
  generateTimeOptionsMicroseconds
} from "@/utils/paramsRangeOptions";
import ParamFormRow from "./ParamFormRow.vue";

defineOptions({ name: "DischargeScdTab" });

const props = defineProps<{
  /** 参数范围（由父组件统一请求） */
  ranges: BmsRangesMap;
  /** 加载状态（由父组件统一管理） */
  loadingRanges: boolean;
}>();

/** 表单：T 存 A（展示），D 存 us（展示）；提交时 T→0.1A，D→接口单位（10us） */
const form = reactive({
  bat_SCDT: 500 as number | string,
  bat_SCDD: 1000 as number | string
});

const scdtOptions = computed(() => {
  const r = props.ranges.bat_SCDT;
  if (!r) return fallbackScdt;
  return generateSCDTOptions(r).map(o => ({
    /** 展示为整数 A（例如 50），不带小数点 */
    label: String(o.value / 10),
    value: o.value / 10
  }));
});
const scddOptions = computed(() => {
  const r = props.ranges.bat_SCDD;
  if (!r) return fallbackScdd;
  // generateTimeOptionsMicroseconds 已返回 { label: us字符串, value: 接口单位 }
  return generateTimeOptionsMicroseconds(r).map(o => ({
    label: o.label,
    value: Number(o.label) // 表单存 us 数值
  }));
});

const fallbackScdt = generateSCDTOptions([100, 20000]).map(o => ({
  label: String(o.value / 10),
  value: o.value / 10
}));
const fallbackScdd = generateTimeOptionsMicroseconds([0, 10000]).map(o => ({
  label: o.label,
  value: Number(o.label)
}));

/** 当 ranges 变化时，更新表单初始值 */
watch(
  () => props.ranges,
  ranges => {
    if (ranges.bat_SCDT?.length === 2) {
      const [minT] = ranges.bat_SCDT;
      form.bat_SCDT = minT / 10;
    }
    if (ranges.bat_SCDD?.length === 2) {
      const [minD] = ranges.bat_SCDD;
      // minD 是接口单位（10us），转换为 us
      form.bat_SCDD = minD * 10;
    }
  },
  { immediate: true }
);

function validate(): boolean {
  const T = Number(form.bat_SCDT);
  const D = Number(form.bat_SCDD);
  return Number.isFinite(T) && T > 0 && Number.isFinite(D) && D >= 0;
}

function handleUpdate(fieldKey: string, value: number | string) {
  if (fieldKey === "bat_SCDT") form.bat_SCDT = value;
  else if (fieldKey === "bat_SCDD") form.bat_SCDD = value;
}

function getPayload() {
  return {
    T: Math.round(Number(form.bat_SCDT) * 10),
    D: Math.round(Number(form.bat_SCDD) / 10)
  };
}

defineExpose({ form, validate, getPayload });
</script>


<style scoped lang="scss">
.bat-scd-tab {
  margin-top: 4px;
}
</style>
