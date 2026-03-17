<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getMainServerListReq, setBatchMainServerReq } from "@/api/bms";
import type { BmsMainServerItem, BmsOfflineTask } from "@/api/bms/types";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";
import DeviceCodeInputPanel from "./DeviceCodeInputPanel.vue";

defineOptions({
  name: "MainPlatformConfigPanel"
});

const props = withDefaults(
  defineProps<{
    initialBmsIds?: string[];
  }>(),
  {
    initialBmsIds: () => []
  }
);

const emit = defineEmits<{
  (e: "success"): void;
}>();

type DeviceCodeInputExpose = {
  getDevString: () => string;
  clearInputDevs: () => void;
};

const codeInputRef = ref<DeviceCodeInputExpose | null>(null);

const offlineTask = ref<BmsOfflineTask>(0);

const loadingList = ref(false);
const submitting = ref(false);

const serverList = ref<BmsMainServerItem[]>([]);
const selectedServerValue = ref<string>("");

async function loadServerList() {
  loadingList.value = true;
  try {
    const res = await getMainServerListReq();
    if (res.errno === 0) {
      serverList.value = res.data?.xsrv_list ?? [];
      return;
    }
    ElMessage.error(res.errmsg || "获取主服务器列表失败");
  } finally {
    loadingList.value = false;
  }
}

async function submit(): Promise<boolean> {
  const codeInput = codeInputRef.value;
  if (!codeInput || !codeInput.getDevString()) {
    ElMessage.warning("请先输入设备编码");
    return false;
  }

  const { validItems, invalidItems, repeatItems, error, result } = parseDeviceCodeInput(
    codeInput.getDevString()
  );
  if (invalidItems.length > 0) {
    ElMessage.error(error || "含非法字符");
    return false;
  }

  if (!selectedServerValue.value) {
    ElMessage.warning("请选择主服务器");
    return false;
  }

  if (!result && repeatItems.length > 0) {
    try {
      await ElMessageBox.confirm("有重复数据，剔除重复数据后继续提交吗？", "提示", {
        confirmButtonText: "继续提交",
        cancelButtonText: "取消",
        type: "warning"
      });
    } catch {
      return false;
    }
  }

  if (validItems.length === 0) {
    ElMessage.warning("录入的设备为空，请重新输入");
    return false;
  }

  try {
    await ElMessageBox.confirm("确定提交主服务器配置？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return false;
  }

  submitting.value = true;
  try {
    const res = await setBatchMainServerReq({
      bms_id_list: validItems,
      offline_task: offlineTask.value,
      offlineTask: offlineTask.value,
      params: { xuesrv: selectedServerValue.value }
    });

    if (res.errno === 0) {
      await ElMessageBox.alert("已成功提交后台处理", "提交成功", { confirmButtonText: "确定", type: "success" });
      codeInput.clearInputDevs();
      selectedServerValue.value = "";
      offlineTask.value = 0;
      emit("success");
      return true;
    }
    ElMessage.error(res.errmsg || "主平台配置提交失败");
    return false;
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadServerList();
});

defineExpose({
  submit
});
</script>

<template>
  <div v-loading="submitting" class="pm-panel">
    <el-form label-width="100px" class="pm-form">
      <DeviceCodeInputPanel
        ref="codeInputRef"
        :initial-bms-ids="initialBmsIds"
        :recognize-button-plain="true"
      />

      <el-form-item label="主服务器" required>
        <el-select
          v-model="selectedServerValue"
          class="pm-select"
          placeholder="请选择服务器"
          filterable
          :loading="loadingList"
        >
          <el-option v-for="it in serverList" :key="it.value" :label="it.title" :value="it.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="离线任务">
        <el-radio-group v-model="offlineTask">
          <el-radio :value="0">仅配置在线设备</el-radio>
          <el-radio :value="1">配置所有设备（包括离线设备，系统配置离线任务，待设备上线后执行）</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.pm-panel {
  padding: 8px 6px;
}

.pm-form :deep(.el-form-item__label) {
  color: var(--bms-text-secondary);
}

.pm-select {
  width: 100%;
}
</style>


