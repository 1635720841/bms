<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsVoltageMV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";

defineOptions({ name: "CellOv1Tab" });

const props = defineProps<{
  /** 参数范围（由父组件根据材料类型请求） */
  ranges: BmsRangesMap;
  loadingRanges: boolean;
}>();

/** 表单存接口单位：T/RT mV，D/RD 100ms */
const form = reactive({
  cell_OV1T: 3650,
  cell_OV1D: 0,
  cell_OVR1T: 3600,
  cell_OVR1D: 100,
  cell_OVRP1flag: 1 as 0 | 1
});

const ov1tOptions = computed(() => {
  const r = props.ranges.cell_OV1T;
  return r ? generateOptionsVoltageMV(r) : fallbackOv1t;
});
const ov1dOptions = computed(() => {
  const r = props.ranges.cell_OV1D;
  return r ? generateTimeOptionsOnePointS(r) : fallbackOv1d;
});
const ovr1tOptions = computed(() => {
  const r = props.ranges.cell_OVR1T;
  return r ? generateOptionsVoltageMV(r) : fallbackOvr1t;
});
const ovr1dOptions = computed(() => {
  const r = props.ranges.cell_OVR1D;
  return r ? generateTimeOptionsTenOrMore(r) : fallbackOvr1d;
});

const fallbackOv1t = generateOptionsVoltageMV([3000, 4000]);
const fallbackOv1d = generateTimeOptionsOnePointS([0, 600]);
const fallbackOvr1t = generateOptionsVoltageMV([3000, 3900]);
const fallbackOvr1d = generateTimeOptionsTenOrMore([100, 6000]);

watch(
  () => props.ranges,
  ranges => {
    if (ranges.cell_OV1T?.length === 2) form.cell_OV1T = ranges.cell_OV1T[0];
    if (ranges.cell_OV1D?.length === 2) form.cell_OV1D = ranges.cell_OV1D[0];
    if (ranges.cell_OVR1T?.length === 2) form.cell_OVR1T = ranges.cell_OVR1T[0];
    if (ranges.cell_OVR1D?.length === 2) form.cell_OVR1D = ranges.cell_OVR1D[0];
  },
  { immediate: true }
);

function validate(): boolean {
  if (
    !Number.isFinite(Number(form.cell_OV1T)) ||
    !Number.isFinite(Number(form.cell_OV1D)) ||
    !Number.isFinite(Number(form.cell_OVR1T)) ||
    !Number.isFinite(Number(form.cell_OVR1D))
  ) {
    return false;
  }
  if (Number(form.cell_OV1T) <= Number(form.cell_OVR1T)) return false;
  return true;
}

function getPayload() {
  return {
    T: Number(form.cell_OV1T),
    D: typeof form.cell_OV1D === "string" ? Math.round(Number(form.cell_OV1D) * 10) : Number(form.cell_OV1D),
    RT: Number(form.cell_OVR1T),
    RD: typeof form.cell_OVR1D === "string" ? Math.round(Number(form.cell_OVR1D) * 10) : Number(form.cell_OVR1D),
    enable: Number(form.cell_OVRP1flag) === 0 ? 0 : 1
  };
}

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="cell-ov1-tab">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="触发门限(mV)">
          <el-select
            v-model="form.cell_OV1T"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in ov1tOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="延时(S)">
          <el-select
            v-model="form.cell_OV1D"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in ov1dOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="恢复门限(mV)">
          <el-select
            v-model="form.cell_OVR1T"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in ovr1tOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="延时(S)">
          <el-select
            v-model="form.cell_OVR1D"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option v-for="opt in ovr1dOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="使能开关">
      <el-radio-group v-model="form.cell_OVRP1flag">
        <el-radio :value="1">开</el-radio>
        <el-radio :value="0">关</el-radio>
      </el-radio-group>
    </el-form-item>

    <div class="hint">触发门限需大于恢复门限</div>
  </div>
</template>

<style scoped lang="scss">
.cell-ov1-tab {
  margin-top: 4px;
}
.hint {
  margin-top: -8px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>

