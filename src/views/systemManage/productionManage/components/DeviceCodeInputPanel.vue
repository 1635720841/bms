<template>
  <el-form-item :label="label" :required="required">
    <div class="pm-input-head">
      <div class="pm-input-head__hint">逗号 / 空格 / 换行分割</div>
      <div class="pm-input-head__count">{{ devCount }}</div>
    </div>
    <el-input
      v-model="devString"
      type="textarea"
      :rows="5"
      placeholder="请输入设备编码..."
    />
    <div class="pm-input-actions">
      <el-button @click="clearInputDevs">清空</el-button>
      <el-button
        type="primary"
        :plain="recognizeButtonPlain"
        @click="preview"
      >
        识别
      </el-button>
    </div>
  </el-form-item>

  <el-form-item v-if="isPreview" :label="previewLabel">
    <div class="pm-preview">
      <el-scrollbar max-height="180px">
        <div class="pm-preview__tags">
          <el-tag
            v-for="it in validDevList"
            :key="it"
            type="info"
            effect="plain"
          >
            {{ it }}
          </el-tag>
        </div>
      </el-scrollbar>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";

defineOptions({
  name: "DeviceCodeInputPanel"
});

const props = withDefaults(
  defineProps<{
    /** 初始设备编码列表（例如表格多选带入） */
    initialBmsIds?: string[];
    /** 表单项标签文本 */
    label?: string;
    /** 是否必填 */
    required?: boolean;
    /** 预览区域标签文本 */
    previewLabel?: string;
    /** 识别按钮是否使用 plain 样式 */
    recognizeButtonPlain?: boolean;
  }>(),
  {
    initialBmsIds: () => [],
    label: "设备编码",
    required: false,
    previewLabel: "清单预览",
    recognizeButtonPlain: false
  }
);

const devString = ref("");
const validDevList = ref<string[]>([]);
const isPreview = ref(false);

watch(
  () => props.initialBmsIds,
  ids => {
    if (ids && ids.length > 0) {
      devString.value = ids.join(",");
      validDevList.value = [...ids];
      isPreview.value = false;
    } else {
      devString.value = "";
      validDevList.value = [];
      isPreview.value = false;
    }
  },
  { immediate: true }
);

const devCount = computed(() => validDevList.value.length);

function clearInputDevs() {
  devString.value = "";
  validDevList.value = [];
  isPreview.value = false;
}

async function preview() {
  if (!devString.value) {
    ElMessage.warning("请先输入设备编码");
    return;
  }

  const { validItems, invalidItems, repeatItems, error, result } = parseDeviceCodeInput(devString.value);

  if (result) {
    validDevList.value = validItems;
    isPreview.value = false;
    return;
  }

  if (invalidItems.length > 0) {
    ElMessage.error(error || "含非法字符");
    return;
  }

  if (repeatItems.length > 0) {
    validDevList.value = validItems;
    isPreview.value = true;
    ElMessage.warning("检测到重复数据，已自动剔除重复项");
    return;
  }

  if (error) ElMessage.error(error);
}

function getDevString() {
  return devString.value;
}

defineExpose({
  getDevString,
  clearInputDevs
});
</script>

<style scoped lang="scss">
.pm-input-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pm-input-head__hint,
.pm-input-head__count {
  font-size: 12px;
  color: var(--bms-text-secondary);
}

.pm-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.pm-preview {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.pm-preview__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>


