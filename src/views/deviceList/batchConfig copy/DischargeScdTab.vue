<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateSCDTOptions,
  generateTimeOptionsMicroseconds
} from "@/utils/paramsRangeOptions";

defineOptions({ name: "DischargeScdTab" });

const props = defineProps<{
  /** 参数范围（由父组件统一请求） */
  ranges: BmsRangesMap;
  /** 加载状态（由父组件统一管理） */
  loadingRanges: boolean;
}>();

/** 表单：T 存 A（展示），D 存 ms（展示）；提交时 T→0.1A，D→接口单位（10us） */
const form = reactive({
  bat_SCDT: 500 as number | string,
  bat_SCDD: 0.1 as number | string
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
  return generateTimeOptionsMicroseconds(r).map(o => {
    // o.value 为接口单位（10us）；展示成 ms（保留 1 位小数）
    const ms = Number((o.value / 100).toFixed(1));
    return { label: ms.toFixed(1), value: ms };
  });
});

const fallbackScdt = generateSCDTOptions([100, 20000]).map(o => ({
  label: String(o.value / 10),
  value: o.value / 10
}));
const fallbackScdd = generateTimeOptionsMicroseconds([0, 10000]).map(o => {
  const ms = Number((o.value / 100).toFixed(1));
  return { label: ms.toFixed(1), value: ms };
});

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
      form.bat_SCDD = Number((minD / 100).toFixed(1));
    }
  },
  { immediate: true }
);

function validate(): boolean {
  const T = Number(form.bat_SCDT);
  const D = Number(form.bat_SCDD);
  return Number.isFinite(T) && T > 0 && Number.isFinite(D) && D >= 0;
}

function getPayload() {
  return {
    T: Math.round(Number(form.bat_SCDT) * 10),
    D: Math.round(Number(form.bat_SCDD) * 100)
  };
}

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="bat-scd-tab">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="触发门限(A)">
          <el-select
            v-model="form.bat_SCDT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in scdtOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="触发延时(ms)">
          <el-select
            v-model="form.bat_SCDD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in scddOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.bat-scd-tab {
  margin-top: 4px;
}
</style>
