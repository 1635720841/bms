<template>
  <div v-loading="submitting" class="pm-panel">
    <el-form label-width="100px" class="pm-form">
      <el-form-item v-if="isTransfer" :label="orgLabel" :required="orgRequired">
        <div class="pm-org-row">
          <el-button type="primary" plain @click="orgSelectVisible = true">选择组织</el-button>
          <div class="pm-org-name">
            <span class="pm-org-name__text">
              {{ selectedOrg?.org_name || orgPlaceholder }}
            </span>
            <el-button v-if="selectedOrg" link type="danger" @click="clearOrg">清除</el-button>
          </div>
        </div>
      </el-form-item>

      <DeviceCodeInputPanel
        ref="codeInputRef"
        :initial-bms-ids="initialBmsIds"
        :required="true"
        :recognize-button-plain="true"
      />
    </el-form>

    <OrgSelectDialog v-model="orgSelectVisible" @select="handleOrgSelected" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import OrgSelectDialog from "@/views/systemManage/userManage/OrgSelectDialog.vue";
import { addDeviceReq, transferDeviceReq } from "@/api/bms";
import type { BmsDeviceEntryReq, BmsDeviceTransferReq } from "@/api/bms/types";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";
import DeviceCodeInputPanel from "./DeviceCodeInputPanel.vue";

type Mode = "entry" | "transfer";

const props = withDefaults(
  defineProps<{
    /** entry: 设备录入；transfer: 设备调拨 */
    mode: Mode;
    /** 表格多选带入 */
    initialBmsIds?: string[];
  }>(),
  {
    mode: "entry",
    initialBmsIds: () => []
  }
);

defineOptions({
  name: "DeviceEntryTransferPanel"
});

const emit = defineEmits<{
  (e: "success"): void;
}>();

const orgSelectVisible = ref(false);
const selectedOrg = ref<{ org_id: string | number; org_name: string } | null>(null);

type DeviceCodeInputExpose = {
  getDevString: () => string;
  clearInputDevs: () => void;
};

const codeInputRef = ref<DeviceCodeInputExpose | null>(null);
const submitting = ref(false);

const isTransfer = computed(() => props.mode === "transfer");

const orgLabel = computed(() => (isTransfer.value ? "调拨到" : "录入到"));
const orgRequired = computed(() => isTransfer.value);
const orgPlaceholder = computed(() =>
  isTransfer.value ? "请选择调拨的组织单位" : "可选：请选择录入的组织单位"
);

const confirmText = computed(() =>
  isTransfer.value ? "确定调拨设备？" : "确定录入设备？"
);

function handleOrgSelected(org: { org_id: string | number; org_name: string }) {
  selectedOrg.value = org;
}

function clearOrg() {
  selectedOrg.value = null;
}

async function submit(): Promise<boolean> {
  if (isTransfer.value && !selectedOrg.value) {
    ElMessage.warning("请选择要调拨的组织单位");
    return false;
  }

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
    await ElMessageBox.confirm(confirmText.value, "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return false;
  }

  submitting.value = true;
  try {
    if (isTransfer.value) {
      const payload: BmsDeviceTransferReq = {
        bms_id_list: validItems,
        org_id: selectedOrg.value!.org_id,
        org_name: selectedOrg.value!.org_name
      };
      const res = await transferDeviceReq(payload);
      if (res.errno === 0) {
        const updateCnt = res.data?.update_cnt ?? 0;
        await ElMessageBox.alert(
          `提交调拨 ${validItems.length} 个设备，调拨成功 ${updateCnt} 个设备`,
          "调拨结果",
          { confirmButtonText: "确定", type: "success" }
        );
        codeInput.clearInputDevs();
        clearOrg();
        emit("success");
        return true;
      }
      ElMessage.error(res.errmsg || "设备调拨失败");
      return false;
    }

    const payload: BmsDeviceEntryReq = {
      bms_id_list: validItems
    };
    if (selectedOrg.value) {
      payload.org_id = selectedOrg.value.org_id;
      payload.org_name = selectedOrg.value.org_name;
    }

    const res = await addDeviceReq(payload);
    if (res.errno === 0) {
      const addCnt = res.data?.add_cnt ?? 0;
      await ElMessageBox.alert(
        `提交录入 ${validItems.length} 个设备，录入成功 ${addCnt} 个设备`,
        "录入结果",
        { confirmButtonText: "确定", type: "success" }
      );
      codeInput.clearInputDevs();
      clearOrg();
      emit("success");
      return true;
    }
    ElMessage.error(res.errmsg || "设备录入失败");
    return false;
  } finally {
    submitting.value = false;
  }
}

defineExpose({
  submit
});
</script>

<style scoped lang="scss">
.pm-panel {
  padding: 8px 6px;
}

.pm-form :deep(.el-form-item__label) {
  color: var(--bms-text-secondary);
}

.pm-org-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.pm-org-name {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.pm-org-name__text {
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>


