
<template>
  <div class="edit-user-dialog">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="所属组织">
        <el-input v-model="formData.org_name" disabled />
      </el-form-item>

      <el-form-item label="登录账号">
        <el-input v-model="formData.usr_name" disabled />
      </el-form-item>

      <el-form-item label="电子邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入电子邮箱"
          maxlength="50"
          clearable
        />
      </el-form-item>

      <el-form-item label="手机号码" prop="mobile">
        <el-input
          v-model="formData.mobile"
          placeholder="请输入手机号码"
          maxlength="11"
          clearable
        />
      </el-form-item>

      <el-form-item label="备注信息" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          placeholder="请输入备注信息"
          maxlength="100"
          :rows="3"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { updateUserReq } from "@/api/systemManage";
import type { UserItem } from "@/api/systemManage/types";

defineOptions({
  name: "EditUserDialog"
});

const props = defineProps<{
  user: UserItem | null;
}>();

const emit = defineEmits<{
  (e: "success"): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const loading = ref(false);

const formData = reactive({
  usr_id: "",
  org_name: "",
  usr_name: "",
  email: "",
  mobile: "",
  comment: ""
});

const rules: Record<string, import("element-plus").FormItemRule[]> = {
  email: [
    {
      type: "email" as const,
      message: "请输入正确的邮箱格式",
      trigger: "blur"
    }
  ],
  mobile: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ]
};

watch(
  () => props.user,
  user => {
    if (user) {
      formData.usr_id = user.usr_id;
      formData.org_name = user.org_name;
      formData.usr_name = user.usr_name;
      formData.email = user.email || "";
      formData.mobile = user.mobile || "";
      formData.comment = user.comment || "";
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const params = {
      usr_id: formData.usr_id,
      email: formData.email || undefined,
      mobile: formData.mobile || undefined,
      comment: formData.comment || undefined
    };

    const res = await updateUserReq(params);

    if (res.errno === 0) {
      ElMessage.success("修改成功");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "修改失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("网络错误，请重试");
    }
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit("cancel");
}
</script>

<style scoped lang="scss">
.edit-user-dialog {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* 表单深色适配 */
:deep(.el-form-item__label) {
  color: #475569;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  color: #0f172a;
  transition: all 0.2s ease;
}

:deep(.el-input__inner) {
  color: #0f172a;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f1f5f9;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}

:deep(.el-input.is-disabled .el-input__inner) {
  color: #94a3b8;
}

:deep(.el-button--primary) {
  background: #60a5fa;
  border-color: #60a5fa;
  color: #ffffff;
}

:deep(.el-button--primary:hover) {
  background: #60a5fa;
  border-color: #60a5fa;
}
</style>































