<script setup lang="ts">
import { reactive } from "vue";
import { cell_mat_dict, getDictLabel } from "@/utils/dict";

defineOptions({ name: "BasicParamsTab" });

/** 串数 14～24，与小程序一致 */
const seriesOptions = Array.from({ length: 11 }, (_, i) => i + 14);

/**
 * 电芯容量选项：与小程序一致 caps = [30, 40, 50, 60, 20, 21, ..., 99]
 * 先 30/40/50/60，再 20～99 中其余整数（Ah）
 */
const capacityOptions: number[] = (() => {
  const caps = [30, 40, 50, 60];
  for (let i = 20; i < 100; i++) {
    if (i !== 30 && i !== 40 && i !== 50 && i !== 60) caps.push(i);
  }
  return caps;
})();

const form = reactive({
  cell_mat: 1 as 1 | 2,
  cell_cnt: 14,
  /** 电芯容量 Ah（与小程序 params.designed_capD 一致：整数，下拉或输入） */
  designed_capD: 20 as number | string
});

/** 与小程序 validateBasicParams 一致：capMin=capacityOptions[4]=20，capMax=最后一项=99 */
defineExpose({
  form,
  validate(): boolean {
    const v = Number(form.designed_capD);
    const capMin = capacityOptions[4];
    const capMax = capacityOptions[capacityOptions.length - 1];
    return Number.isFinite(v) && v >= capMin && v <= capMax;
  },
  /** 提交：capacity 为 0.1Ah 单位，与小程序 params.designed_cap = designed_capD*10 一致 */
  getPayload() {
    return {
      cM: form.cell_mat,
      cN: form.cell_cnt,
      capacity: Math.round(Number(String(form.designed_capD).trim()) * 10)
    };
  }
});
</script>

<template>
  <div class="basic-params-tab">
    <el-row :gutter="16">
      <el-col :span="12">
    <el-form-item label="电芯材料">
      <el-select v-model="form.cell_mat" placeholder="请选择" style="width: 100%">
        <el-option
          v-for="item in cell_mat_dict"
          :key="item.value"
          :label="getDictLabel(cell_mat_dict, item.value)"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    </el-col>
    <el-col :span="12">
    <el-form-item label="电芯串数">
      <el-select v-model="form.cell_cnt" placeholder="请选择" style="width: 100%">
        <el-option
          v-for="n in seriesOptions"
          :key="n"
          :label="String(n)"
          :value="n"
        />
      </el-select>
    </el-form-item>
    </el-col>
    <el-col :span="12">
    <el-form-item label="电芯容量(Ah)">
      <el-select
        v-model="form.designed_capD"
        filterable
        allow-create
        default-first-option
        placeholder="请选择或输入"
        style="width: 100%"
      >
        <el-option
          v-for="n in capacityOptions"
          :key="n"
          :label="String(n)"
          :value="n"
        />
      </el-select>
    </el-form-item>
    </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.basic-params-tab {
  margin-top: 4px;
}
</style>
