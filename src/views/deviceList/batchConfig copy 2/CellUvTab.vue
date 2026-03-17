<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsVoltageMV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";

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

<template>
  <div class="cell-uv-tab">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="触发门限(mV)">
          <el-select
            v-model="form.cell_UVT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in uvtOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="触发延时(S)">
          <el-select
            v-model="form.cell_UVD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in uvdOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="恢复门限(mV)">
          <el-select
            v-model="form.cell_UVRT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in uvrtOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="恢复延时(S)">
          <el-select
            v-model="form.cell_UVRD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in uvrdOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <div class="hint">触发门限需小于恢复门限</div>
  </div>
</template>

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

