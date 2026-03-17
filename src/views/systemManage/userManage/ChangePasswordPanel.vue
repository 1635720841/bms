<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { changePasswordReq } from "@/api/bms";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "ChangePasswordPanel"
});

const loading = ref(false);
const formRef = ref();

const form = ref({
  password_old: "",
  password_new: "",
  password_confirm: ""
});

const rules = {
  password_old: [
    { required: true, message: "请输入原登录密码", trigger: "blur" }
  ],
  password_new: [
    { required: true, message: "请输入新登录密码", trigger: "blur" },
    { min: 6, message: "新登录密码不能少于6位", trigger: "blur" }
  ],
  password_confirm: [
    { required: true, message: "请再次输入新登录密码", trigger: "blur" },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error("请再次输入新登录密码"));
          return;
        }
        if (value !== form.value.password_new) {
          callback(new Error("两次输入的新登录密码不一致"));
          return;
        }
        callback();
      },
      trigger: "blur"
    }
  ]
};

const userStore = useUserStoreHook();

/**
 * 提交修改密码
 * 暴露给外层 ReDialog 的 beforeSure 调用
 */
async function submit(): Promise<boolean> {
  console.log("userStore.username", formRef.value.validate());
  if (!formRef.value) return false;
  try {
    loading.value = true;
    await formRef.value.validate();

    const res = await changePasswordReq({
      password_old: form.value.password_old,
      password_new: form.value.password_new,
      name: userStore.username || undefined
    });

    if (res.errno === 0) {
      ElMessage.success("修改成功，请使用新密码重新登录");
      // 修改成功后按小程序逻辑：清空会话并退回登录页
      userStore.logOut();
      return true;
    }

    ElMessage.error(res.errmsg || "修改失败");
    return false;
  } catch (error: unknown) {
    if (error) {
      // 表单校验错误已在组件内部提示，这里只处理接口异常
      if (error instanceof Error && error.message) {
        ElMessage.error(error.message);
      } else {
        // ElMessage.error("网络错误，请稍后重试");
      }
    }
    return false;
  } finally {
    loading.value = false;
  }
}

defineExpose({
  submit
});
</script>

<template>
  <div class="bms-change-pwd">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      label-position="right"
      :disabled="loading"
    >
      <el-form-item label="登录账号">
        <span class="bms-change-pwd__account">
          {{ userStore.username || "当前登录账号" }}
        </span>
      </el-form-item>
      <el-form-item prop="password_old" label="原密码">
        <el-input
          v-model="form.password_old"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请输入原登录密码"
        />
      </el-form-item>
      <el-form-item prop="password_new" label="新密码">
        <el-input
          v-model="form.password_new"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请输入新登录密码，至少6位"
        />
      </el-form-item>
      <el-form-item prop="password_confirm" label="确认密码">
        <el-input
          v-model="form.password_confirm"
          type="password"
          show-password
          autocomplete="off"
          placeholder="请再次输入新登录密码"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.bms-change-pwd {
  padding: 8px 4px 0;
}

.bms-change-pwd__account {
  color: #585858;
  font-weight: 500;
}
</style>


