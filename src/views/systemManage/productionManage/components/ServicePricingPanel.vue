<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";
import { setServicePriceReq } from "@/api/bms";
import type { BmsSetServicePriceReq } from "@/api/bms/types";
import DeviceCodeInputPanel from "./DeviceCodeInputPanel.vue";

defineOptions({
  name: "ServicePricingPanel"
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
const price = ref<number | null>(null);
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

  if (price.value == null || Number.isNaN(price.value)) {
    ElMessage.warning("请输入价格");
    return false;
  }

  if (price.value < 0) {
    ElMessage.warning("价格不能为负数");
    return false;
  }

  try {
    await ElMessageBox.confirm("确定提交服务价格？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return false;
  }

  const payload: BmsSetServicePriceReq = {
    bms_id_list: validItems,
    // Web 端与小程序保持一致，按「分」为单位
    price: Math.round(price.value * 100)
  };

  submitting.value = true;
  try {
    const res = await setServicePriceReq(payload);
    if (res.errno === 0) {
      const updateCnt = res.data?.update_cnt ?? 0;
      await ElMessageBox.alert(
        `提交定价 ${validItems.length} 个设备，定价成功 ${updateCnt} 个设备`,
        "定价结果",
        {
          confirmButtonText: "确定",
          type: "success"
        }
      );
      codeInput.clearInputDevs();
      price.value = null;
      emit("success");
      return true;
    }
    ElMessage.error(res.errmsg || "服务价格设置失败");
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

      <el-form-item label="价格(元/年)" required>
        <el-input-number
          v-model="price"
          class="pm-number"
          :min="0"
          :max="999999"
          :precision="2"
          :controls="false"
          placeholder="请输入价格"
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


