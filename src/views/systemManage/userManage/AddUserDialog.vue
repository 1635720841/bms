<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { addUserReq } from "@/api/systemManage";
import OrgSelectDialog from "./OrgSelectDialog.vue";

defineOptions({
  name: "AddUserDialog"
});

const emit = defineEmits<{
  (e: "success"): void;
  (e: "cancel"): void;
}>();

const formRef = ref();
const loading = ref(false);
const orgSelectVisible = ref(false);

const formData = reactive({
  org_id: "",
  org_name: "",
  name: "",
  password: "",
  confirmPassword: "",
  email: "",
  mobile: "",
  comment: ""
});

const rules: Record<string, import("element-plus").FormItemRule[]> = {
  org_id: [{ required: true, message: "请选择所属组织", trigger: "change" }],
  name: [
    { required: true, message: "请输入登录账号", trigger: "blur" },
    { min: 1, max: 30, message: "账号长度在 1 到 30 个字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入登录密码", trigger: "blur" },
    { min: 6, message: "密码不能少于6位", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请输入确认密码", trigger: "blur" },
    {
      validator: (rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== formData.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
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

function openOrgSelect() {
  orgSelectVisible.value = true;
}

function handleOrgSelected(org: { org_id: string | number; org_name: string }) {
  formData.org_id = String(org.org_id);
  formData.org_name = org.org_name;
  orgSelectVisible.value = false;
}

function clearOrg() {
  formData.org_id = "";
  formData.org_name = "";
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const params = {
      org_id: formData.org_id,
      name: formData.name,
      password: formData.password,
      email: formData.email || undefined,
      mobile: formData.mobile || undefined,
      comment: formData.comment || undefined
    };

    const res = await addUserReq(params);

    if (res.errno === 0) {
      ElMessage.success("添加成功");
      emit("success");
    } else {
      ElMessage.error(res.errmsg ?? "添加失败");
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

<template>
  <div class="add-user-dialog">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <el-form-item label="所属组织" prop="org_id">
        <div v-if="formData.org_name" class="org-selected">
          <span class="org-name">{{ formData.org_name }}</span>
          <div class="org-actions">
            <el-button size="small" text type="primary" @click="openOrgSelect">
              重新选择
            </el-button>
            <el-icon class="clear-icon" @click="clearOrg">
              <Close />
            </el-icon>
          </div>
        </div>
        <el-button v-else type="primary" plain @click="openOrgSelect">
          选择组织
        </el-button>
      </el-form-item>

      <el-form-item label="登录账号" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入登录账号"
          maxlength="30"
          clearable
        />
      </el-form-item>

      <el-form-item label="登录密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入登录密码"
          show-password
          clearable
        />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          clearable
        />
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

    <OrgSelectDialog
      v-model="orgSelectVisible"
      @select="handleOrgSelected"
    />
  </div>
</template>

<style scoped lang="scss">
.add-user-dialog {
  padding: 20px 0;
}

.org-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  width: 100%;
}

.org-name {
  flex: 1;
  color: #0f172a;
  font-size: 14px;
}

.org-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-icon {
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  transition: color 0.2s ease;

  &:hover {
    color: #f56c6c;
  }
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


