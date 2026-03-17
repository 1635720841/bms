<script setup lang="ts">
import { computed } from "vue";
import type { BmsThirdServerItem } from "@/api/bms/types";

const props = defineProps<{
  thirdSrvList: BmsThirdServerItem[];
  selectedValue: string;
}>();

const emit = defineEmits<{
  (e: "update:selectedValue", value: string): void;
}>();

const selected = computed({
  get: () => props.selectedValue,
  set: value => emit("update:selectedValue", value)
});
</script>

<template>
  <el-form-item label="服务器地址">
    <el-select
      v-model="selected"
      filterable
      placeholder="请选择三方后台地址"
      style="width: 100%"
    >
      <el-option
        v-for="it in thirdSrvList"
        :key="it.value"
        :label="it.title"
        :value="it.value"
      />
    </el-select>
  </el-form-item>
</template>

<style scoped lang="scss">
</style>

