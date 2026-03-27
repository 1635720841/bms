<template>
  <div class="batch-fun-ctrl-switch-tab">
    <el-form-item label="开关类型">
      <el-checkbox-group v-model="form.kind" class="kind-checkbox-group">
        <el-checkbox v-for="opt in options" :key="opt.paramKey" :value="opt.paramKey">{{ opt.label }}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="开关状态">
      <el-radio-group v-model="form.op">
        <el-radio :value="1">开启</el-radio>
        <el-radio :value="0">关闭</el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="hint">当前：{{ currentLabel }} — {{ form.op === 1 ? "开启" : "关闭" }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";

defineOptions({ name: "BatchFunCtrlSwitchTab" });

/** 与 setBatchFunCtrlReq / funCtrl 接口字段一致 */
export type BmsBatchFunCtrlSwitchKey = "discharge" | "charge" | "blindChg" | "preventSpark";

export interface BmsBatchFunCtrlSwitchOption {
  paramKey: BmsBatchFunCtrlSwitchKey;
  label: string;
}

const props = defineProps<{
  options: ReadonlyArray<BmsBatchFunCtrlSwitchOption>;
  defaultParamKey?: BmsBatchFunCtrlSwitchKey;
  defaultOp?: 0 | 1;
}>();

const form = ref<{ kind: BmsBatchFunCtrlSwitchKey[]; op: 0 | 1 }>({
  kind: props.defaultParamKey ? [props.defaultParamKey] : props.options[0]?.paramKey ? [props.options[0].paramKey] : ["discharge"],
  op: props.defaultOp ?? 1
});

watchEffect(() => {
  const first = props.options[0]?.paramKey;
  if (!first) return;
  const preferred = props.defaultParamKey ?? first;
  const validKind = props.options.some(o => o.paramKey === preferred) ? preferred : first;
  form.value.kind = [validKind];
  form.value.op = props.defaultOp ?? 1;
});

const currentLabel = computed(
  () =>
    props.options
      .filter(o => form.value.kind.includes(o.paramKey))
      .map(o => o.label)
      .join("、")
);

function validate(): boolean {
  const okKind = form.value.kind.length > 0 && form.value.kind.every(k => props.options.some(o => o.paramKey === k));
  return okKind && (form.value.op === 0 || form.value.op === 1);
}

/** 批量 funCtrl 单字段 params */
function getPayload(): Record<string, 0 | 1> {
  return form.value.kind.reduce<Record<string, 0 | 1>>((acc, key) => {
    acc[key] = form.value.op;
    return acc;
  }, {});
}

function getConfigName(): string {
  const label = currentLabel.value;
  return label ? `${label}配置` : "功能开关配置";
}

defineExpose({ form, validate, getPayload, getConfigName });
</script>

<style scoped lang="scss">
.batch-fun-ctrl-switch-tab {
  margin-top: 4px;
}

.kind-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.hint {
  margin-top: -6px;
  margin-bottom: 8px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>
