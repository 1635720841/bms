<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";

defineOptions({ name: "SwitchTab" });

const props = defineProps<{
  /** 标题：用于提示文案 */
  title: string;
  /** 默认值（0 关，1 开） */
  defaultValue?: 0 | 1;
}>();

const form = ref<{ op: 0 | 1 }>({ op: props.defaultValue ?? 1 });

watchEffect(() => {
  form.value.op = props.defaultValue ?? 1;
});

const opLabel = computed(() => (form.value.op === 1 ? "开启" : "关闭"));

function validate(): boolean {
  return form.value.op === 0 || form.value.op === 1;
}

function getPayload() {
  return { op: form.value.op };
}

defineExpose({ form, validate, getPayload });
</script>

<template>
  <div class="switch-tab">
    <el-form-item :label="title">
      <el-radio-group v-model="form.op">
        <el-radio :value="1">开启</el-radio>
        <el-radio :value="0">关闭</el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="hint">当前选择：{{ opLabel }}</div>
  </div>
</template>

<style scoped lang="scss">
.switch-tab {
  margin-top: 4px;
}
.hint {
  margin-top: -6px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>

