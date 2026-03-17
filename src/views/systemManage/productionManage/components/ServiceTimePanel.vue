<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";
import { setServiceTimeReq } from "@/api/bms";
import type { BmsSetServiceTimeReq } from "@/api/bms/types";
import DeviceCodeInputPanel from "./DeviceCodeInputPanel.vue";

defineOptions({
  name: "ServiceTimePanel"
});

const props = withDefaults(
  defineProps<{
    /** 表格多选带入 */
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

// 1-增加天数，2-按日期，3-减少天数（与小程序保持一致）
const wayOption = ref<1 | 2 | 3>(1);
const days = ref<number | null>(null);
const date = ref<string>("");

const submitting = ref(false);

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

  if (wayOption.value === 1 || wayOption.value === 3) {
    if (days.value == null || Number.isNaN(days.value) || days.value <= 0) {
      ElMessage.warning("请输入大于 0 的天数");
      return false;
    }
  } else if (wayOption.value === 2) {
    if (!date.value) {
      ElMessage.warning("请选择日期");
      return false;
    }
  }

  try {
    await ElMessageBox.confirm("确定提交服务到期时间？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return false;
  }

  const payload: BmsSetServiceTimeReq = {
    bms_id_list: validItems
  };

  if (wayOption.value === 1 && days.value != null) {
    payload.move_days = Number(days.value);
  } else if (wayOption.value === 3 && days.value != null) {
    payload.move_days = -Number(days.value);
  } else if (wayOption.value === 2 && date.value) {
    payload.move_to_date = date.value.replace(/-/g, "");
  }

  submitting.value = true;
  try {
    const res = await setServiceTimeReq(payload);
    if (res.errno === 0) {
      const updateCnt = res.data?.update_cnt ?? 0;
      await ElMessageBox.alert(
        `提交 ${validItems.length} 个设备，修改服务到期时间成功 ${updateCnt} 个设备`,
        "修改结果",
        {
          confirmButtonText: "确定",
          type: "success"
        }
      );
      codeInput.clearInputDevs();
      wayOption.value = 1;
      days.value = null;
      date.value = "";
      emit("success");
      return true;
    }
    ElMessage.error(res.errmsg || "服务时间设置失败");
    return false;
  } finally {
    submitting.value = false;
  }
}

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
        :required="true"
        :recognize-button-plain="true"
      />

      <el-form-item label="修改方式" required>
        <el-radio-group v-model="wayOption">
          <el-radio :value="1">增加天数</el-radio>
          <el-radio :value="3">减少天数</el-radio>
          <el-radio :value="2">按日期</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="wayOption === 1 || wayOption === 3" label="天数" required>
        <el-input-number
          v-model="days"
          class="pm-number"
          :min="1"
          :max="9999"
          :precision="0"
          :controls="false"
          placeholder="请输入天数"
        />
      </el-form-item>

      <el-form-item v-if="wayOption === 2" label="日期" required>
        <el-date-picker
          v-model="date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          style="width: 100%"
        />
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

.pm-number {
  width: 100%;
}
</style>


