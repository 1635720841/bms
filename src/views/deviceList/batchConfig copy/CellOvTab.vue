<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { getParamsRangeReq } from "@/api/bms";
import type { BmsRangesMap } from "@/api/bms/types";
import {
  generateOptionsVoltageMV,
  generateTimeOptionsOnePointS,
  generateTimeOptionsTenOrMore
} from "@/utils/paramsRangeOptions";

defineOptions({ name: "CellOvTab" });

const dialogMaterial = ref<1 | 2>(1);
const ranges = ref<BmsRangesMap>({});
const loadingRanges = ref(false);

/** 表单存接口单位：T/RT mV，D/RD 100ms */
const form = reactive({
  cell_OVT: 3650,
  cell_OVD: 10,
  cell_OVRT: 3550,
  cell_OVRD: 100
});

const ovtOptions = computed(() => {
  const r = ranges.value.cell_OVT;
  if (!r) return fallbackOvt;
  return generateOptionsVoltageMV(r);
});
const ovdOptions = computed(() => {
  const r = ranges.value.cell_OVD;
  if (!r) return fallbackOvd;
  return generateTimeOptionsOnePointS(r);
});
const ovrtOptions = computed(() => {
  const r = ranges.value.cell_OVRT;
  if (!r) return fallbackOvrt;
  return generateOptionsVoltageMV(r);
});
const ovrdOptions = computed(() => {
  const r = ranges.value.cell_OVRD;
  if (!r) return fallbackOvrd;
  return generateTimeOptionsTenOrMore(r);
});

const fallbackOvt = generateOptionsVoltageMV([3000, 4000]);
const fallbackOvd = generateTimeOptionsOnePointS([0, 600]);
const fallbackOvrt = generateOptionsVoltageMV([3000, 3900]);
const fallbackOvrd = generateTimeOptionsTenOrMore([100, 6000]);

async function fetchRanges() {
  loadingRanges.value = true;
  try {
    const res = await getParamsRangeReq({ cell_mat: dialogMaterial.value });
    if (res.errno === 0 && res.data?.ranges) {
      ranges.value = res.data.ranges;
      if (res.data.ranges.cell_OVT?.length === 2) {
        const [minT] = res.data.ranges.cell_OVT;
        form.cell_OVT = minT;
      }
      if (res.data.ranges.cell_OVD?.length === 2) {
        const [minD] = res.data.ranges.cell_OVD;
        form.cell_OVD = minD;
      }
      if (res.data.ranges.cell_OVRT?.length === 2) {
        const [minRT] = res.data.ranges.cell_OVRT;
        form.cell_OVRT = minRT;
      }
      if (res.data.ranges.cell_OVRD?.length === 2) {
        const [minR] = res.data.ranges.cell_OVRD;
        form.cell_OVRD = minR;
      }
    } else {
      ranges.value = {};
    }
  } catch {
    ranges.value = {};
  } finally {
    loadingRanges.value = false;
  }
}

onMounted(() => fetchRanges());
watch(dialogMaterial, () => fetchRanges());

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
  dialogMaterial,
  validate,
  getPayload
});
</script>

<template>
  <div class="cell-ov-tab">
    <el-form-item label="参数范围">
      <el-radio-group v-model="dialogMaterial" class="material-radio">
        <el-radio :value="1">按铁锂参数配</el-radio>
        <el-radio :value="2">按三元参数配</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="触发门限(mV)">
          <el-select
            v-model="form.cell_OVT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="loadingRanges"
          >
            <el-option
              v-for="opt in ovtOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="触发延时(S)">
          <el-select
            v-model="form.cell_OVD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="loadingRanges"
          >
            <el-option
              v-for="opt in ovdOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="恢复门限(mV)">
          <el-select
            v-model="form.cell_OVRT"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="loadingRanges"
          >
            <el-option
              v-for="opt in ovrtOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="恢复延时(S)">
          <el-select
            v-model="form.cell_OVRD"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入"
            style="width: 100%"
            :loading="loadingRanges"
          >
            <el-option
              v-for="opt in ovrdOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
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
