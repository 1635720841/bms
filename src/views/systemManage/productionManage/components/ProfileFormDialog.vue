<template>
  <div class="profile-form-dialog">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="配置名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入配置名称" clearable />
      </el-form-item>
      <el-form-item label="软件版本" prop="softwareVer">
        <el-input v-model="formData.softwareVer" placeholder="请输入软件版本" clearable />
      </el-form-item>
      <el-form-item label="4G信号" prop="RSSI">
        <el-input-number v-model="formData.RSSI" :min="50" :max="90" :controls="false" style="width: 100%" placeholder="请输入4G信号" />
      </el-form-item>
      <el-form-item label="GPS星数" prop="GPS">
        <el-input-number v-model="formData.GPS" :min="0"  :controls="false" style="width: 100%" placeholder="请输入GPS星数" />
      </el-form-item>
      <el-form-item label="主平台">
        <el-input v-model="formData.server" placeholder="请输入主平台地址" clearable />
      </el-form-item>
      <el-form-item label="三方平台">
        <el-input v-model="formData['3rdServer']" placeholder="请输入三方平台地址" clearable />
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { addFacProfileReq, updateFacProfileReq } from "@/api/bms";
import type { BmsFacProfileItem } from "@/api/bms/types";

defineOptions({
  name: "ProfileFormDialog"
});

const props = defineProps<{
  mode: "add" | "edit";
  profileData?: BmsFacProfileItem;
}>();

const emit = defineEmits<{
  (e: "success"): void;
}>();

const formRef = ref();
const formData = reactive({
  name: props.profileData?.name || "",
  softwareVer: props.profileData?.softwareVer || "",
  RSSI: props.profileData?.RSSI ?? null,
  GPS: props.profileData?.GPS ?? null,
  server: props.profileData?.server || "",
  "3rdServer": props.profileData?.["3rdServer"] || ""
});

const rules = {
  name: [{ required: true, message: "请输入配置名称", trigger: "blur" }],
  softwareVer: [{ required: true, message: "请输入软件版本", trigger: "blur" }],
  RSSI: [{ required: true, message: "请输入4G信号", trigger: "blur" }],
  GPS: [{ required: true, message: "请输入GPS星数", trigger: "blur" }]
};

async function submit(): Promise<boolean> {
  try {
    await formRef.value?.validate();

    const payload: any = {
      name: formData.name,
      softwareVer: formData.softwareVer || undefined,
      RSSI: formData.RSSI ?? undefined,
      GPS: formData.GPS ?? undefined,
      server: formData.server || undefined,
      "3rdServer": formData["3rdServer"] || undefined
    };

    if (props.mode === "edit" && props.profileData) {
      payload.profile_id = props.profileData.id;
      const res = await updateFacProfileReq(payload);
      if (res.errno === 0) {
        ElMessage.success("修改成功");
        emit("success");
        return true;
      } else {
        ElMessage.error(res.errmsg || "修改失败");
        return false;
      }
    } else {
      const res = await addFacProfileReq(payload);
      if (res.errno === 0) {
        ElMessage.success("新增成功");
        emit("success");
        return true;
      } else {
        ElMessage.error(res.errmsg || "新增失败");
        return false;
      }
    }
  } catch {
    return false;
  }
}

defineExpose({
  submit
});
</script>


<style scoped lang="scss">
.profile-form-dialog {
  padding: 20px 10px;

  :deep(.el-input-number) {
    .el-input__inner {
      text-align: left;
    }
  }
}
</style>

