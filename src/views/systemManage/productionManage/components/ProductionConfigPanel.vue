<template>
  <div v-loading="submitting" class="pm-panel">
    <el-form label-width="100px" class="pm-form">
      <DeviceCodeInputPanel
        ref="codeInputRef"
        :initial-bms-ids="initialBmsIds"
        :required="true"
      />

      <el-form-item label="生产配置" required>
        <el-select
          v-model="selectedProfileId"
          class="pm-select"
          placeholder="请选择生产配置"
          :loading="loadingProfiles"
          @change="handleProfileChange"
        >
          <el-option
            v-for="it in profileList"
            :key="it.id"
            :label="it.name"
            :value="it.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="profileDetail" label="配置详情">
        <div class="pm-profile">
          <el-scrollbar max-height="240px">
            <ul v-if="profileDetail.title && profileDetail.value">
              <li
                v-for="(t, idx) in profileDetail.title"
                :key="`${t}-${idx}`"
                class="pm-profile__row"
              >
                <span class="pm-profile__label">{{ t }}</span>
                <span class="pm-profile__value">
                  {{ profileDetail.value?.[idx] ?? "" }}
                </span>
              </li>
            </ul>
            <div v-else class="pm-profile__empty">暂无详情</div>
          </el-scrollbar>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getFacProfileListReq,
  getFacProfileDetailReq,
  setFacConfigReq
} from "@/api/bms";
import type {
  BmsFacConfigReq,
  BmsFacProfileDetail,
  BmsFacProfileItem
} from "@/api/bms/types";
import { parseDeviceCodeInput } from "@/utils/bmsDeviceCodeInput";
import DeviceCodeInputPanel from "./DeviceCodeInputPanel.vue";

defineOptions({
  name: "ProductionConfigPanel"
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

const profileList = ref<BmsFacProfileItem[]>([]);
const selectedProfileId = ref<number | null>(null);
const profileDetail = ref<BmsFacProfileDetail | null>(null);

const loadingProfiles = ref(false);
const loadingDetail = ref(false);
const submitting = ref(false);

async function loadProfiles() {
  loadingProfiles.value = true;
  try {
    const res = await getFacProfileListReq();
    if (res.errno === 0) {
      profileList.value = res.data?.profile_list ?? [];
    } else {
      ElMessage.error(res.errmsg || "获取生产配置列表失败");
    }
  } finally {
    loadingProfiles.value = false;
  }
}

async function loadProfileDetail(id: number) {
  loadingDetail.value = true;
  try {
    const res = await getFacProfileDetailReq(id);
    if (res.errno === 0) {
      profileDetail.value = res.data?.profile ?? null;
    } else {
      ElMessage.error(res.errmsg || "获取生产配置详情失败");
    }
  } finally {
    loadingDetail.value = false;
  }
}

function handleProfileChange(id: number) {
  selectedProfileId.value = id || null;
  if (selectedProfileId.value != null) {
    loadProfileDetail(selectedProfileId.value);
  } else {
    profileDetail.value = null;
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

  if (!selectedProfileId.value) {
    ElMessage.warning("请选择生产配置");
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
    await ElMessageBox.confirm("确定提交生产配置？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
  } catch {
    return false;
  }

  const payload: BmsFacConfigReq = {
    bms_id_list: validItems,
    profile_id: selectedProfileId.value!
  };

  submitting.value = true;
  try {
    const res = await setFacConfigReq(payload);
    if (res.errno === 0) {
      const updateCnt = res.data?.update_cnt ?? 0;
      await ElMessageBox.alert(
        `提交生产配置 ${validItems.length} 个设备，生产配置成功 ${updateCnt} 个设备`,
        "生产配置结果",
        { confirmButtonText: "确定", type: "success" }
      );
      codeInput.clearInputDevs();
      selectedProfileId.value = null;
      profileDetail.value = null;
      emit("success");
      return true;
    }
    ElMessage.error(res.errmsg || "生产配置失败");
    return false;
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadProfiles();
});

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

.pm-select {
  width: 100%;
}

.pm-profile {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #f3f3f3;
  border: 1px solid #e2e8f0;
}

.pm-profile__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.pm-profile__label {
  color: #3a3a3a;
  margin-right: 8px;
}

.pm-profile__value {
  color: #757575;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pm-profile__empty {
  font-size: 13px;
  color: var(--bms-text-secondary);
}
</style>


