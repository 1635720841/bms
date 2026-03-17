<script setup lang="ts">
defineOptions({ name: "ParamFormRow" });

interface FormField {
  /** 字段 label */
  label: string;
  /** v-model 绑定的值 */
  modelValue: number | string;
  /** 选项列表 */
  options: Array<{ label: string; value: number | string }>;
  /** 是否显示 loading */
  loading?: boolean;
  /** 字段标识，用于区分不同字段 */
  fieldKey: string;
  /** 栅格占位格数，默认为 12 */
  span?: number;
}

const props = defineProps<{
  /** 字段配置数组，支持 1-2 个字段 */
  fields: FormField[];
}>();

const emit = defineEmits<{
  (e: "update:field", fieldKey: string, value: number | string): void;
}>();

function handleUpdate(fieldKey: string, value: number | string) {
  emit("update:field", fieldKey, value);
}
</script>

<template>
  <el-row :gutter="16">
    <el-col v-for="field in fields" :key="field.fieldKey" :span="field.span ?? 12">
      <el-form-item :label="field.label">
        <el-select
          :model-value="field.modelValue"
          filterable
          allow-create
          default-first-option
          placeholder="请选择或输入"
          style="width: 100%"
          :loading="field.loading"
          @update:model-value="handleUpdate(field.fieldKey, $event)"
        >
          <el-option
            v-for="opt in field.options"
            :key="String(opt.value)"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
</template>

