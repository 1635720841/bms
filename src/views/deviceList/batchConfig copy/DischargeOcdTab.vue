<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsTenPerOnePointV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";

defineOptions({ name: "DischargeOcdTab" });

const props = defineProps<{
  /** 放电过流档位：ocd1 / ocd2，对应不同接口字段与初始值 */
  variant: "ocd1" | "ocd2";
  /** 参数范围（由父组件统一请求） */
  ranges: BmsRangesMap;
  /** 加载状态（由父组件统一管理） */
  loadingRanges: boolean;
}>();

const rangeKeyT = computed(() => (props.variant === "ocd1" ? "bat_OCD1T" : "bat_OCD2T"));
const rangeKeyD = computed(() => (props.variant === "ocd1" ? "bat_OCD1D" : "bat_OCD2D"));
const rangeKeyRT = computed(() => (props.variant === "ocd1" ? "bat_OCD1RT" : "bat_OCD2RT"));
const rangeKeyRD = computed(() => (props.variant === "ocd1" ? "bat_OCD1RD" : "bat_OCD2RD"));

const initialValues = computed(() =>
  props.variant === "ocd1" ? { T: 100, D: 0, RT: 80, RD: 100 } : { T: 150, D: 0, RT: 120, RD: 100 }
);

/** 表单存接口单位：T/RT 0.1A，D/RD 100ms */
const form = reactive({
  T: initialValues.value.T,
  D: initialValues.value.D,
  RT: initialValues.value.RT,
  RD: initialValues.value.RD
});

const tOptions = computed(() => {
  const r = props.ranges[rangeKeyT.value];
  return r ? generateOptionsTenPerOnePointV(r) : fallbackOcdT;
});
const dOptions = computed(() => {
  const r = props.ranges[rangeKeyD.value];
  return r ? generateTimeOptionsOnePointS(r) : fallbackOcdD;
});
const rtOptions = computed(() => {
  const r = props.ranges[rangeKeyRT.value];
  return r ? generateOptionsTenPerOnePointV(r) : fallbackOcdRT;
});
const rdOptions = computed(() => {
  const r = props.ranges[rangeKeyRD.value];
  return r ? generateTimeOptionsTenOrMore(r) : fallbackOcdRD;
});

const fallbackOcdT = generateOptionsTenPerOnePointV([100, 5000]);
const fallbackOcdD = generateTimeOptionsOnePointS([0, 600]);
const fallbackOcdRT = generateOptionsTenPerOnePointV([80, 4000]);
const fallbackOcdRD = generateTimeOptionsTenOrMore([100, 6000]);

/** 当 ranges 变化时，更新表单初始值 */
watch(
  () => props.ranges,
  ranges => {
    if (ranges[rangeKeyT.value]?.length === 2) form.T = ranges[rangeKeyT.value][0];
    if (ranges[rangeKeyD.value]?.length === 2) form.D = ranges[rangeKeyD.value][0];
    if (ranges[rangeKeyRT.value]?.length === 2) form.RT = ranges[rangeKeyRT.value][0];
    if (ranges[rangeKeyRD.value]?.length === 2) form.RD = ranges[rangeKeyRD.value][0];
  },
  { immediate: true }
);

function validate(): boolean {
  return (
    Number.isFinite(Number(form.T)) &&
    Number.isFinite(Number(form.D)) &&
    Number.isFinite(Number(form.RT)) &&
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

function getPayload() {
  return {
    T: to01A(form.T),
    D: to100ms(form.D),
    RT: to01A(form.RT),
    RD: to100ms(form.RD)
  };
}

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="bat-ocd-tab">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="触发门限(A)">
          <el-select
            v-model="form.T"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in tOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="触发延时(S)">
          <el-select
            v-model="form.D"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in dOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="恢复门限(A)">
          <el-select
            v-model="form.RT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in rtOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="恢复延时(S)">
          <el-select
            v-model="form.RD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="props.loadingRanges"
          >
            <el-option
              v-for="opt in rdOptions"
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
.bat-ocd-tab {
  margin-top: 4px;
}
</style>
