<script setup lang="ts">
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { ref, reactive } from "vue";
import { debounce } from "@pureadmin/utils";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter } from "@/router/utils";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const ruleForm = reactive({
  username: "",
  password: "",
  rememberPassword: false
});

// 简单的加密解密函数（Base64）
const encryptPassword = (password: string): string => {
  return btoa(encodeURIComponent(password));
};

const decryptPassword = (encrypted: string): string => {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return "";
  }
};

// 从 localStorage 读取记住的账号密码
const loadRememberedCredentials = () => {
  const remembered = localStorage.getItem("bms_remember_password");
  if (remembered === "true") {
    const username = localStorage.getItem("bms_username");
    const encryptedPassword = localStorage.getItem("bms_password");
    if (username && encryptedPassword) {
      ruleForm.username = username;
      ruleForm.password = decryptPassword(encryptedPassword);
      ruleForm.rememberPassword = true;
    }
  }
};

// 保存或清除记住的账号密码
const saveRememberedCredentials = () => {
  if (ruleForm.rememberPassword) {
    localStorage.setItem("bms_remember_password", "true");
    localStorage.setItem("bms_username", ruleForm.username);
    localStorage.setItem("bms_password", encryptPassword(ruleForm.password));
  } else {
    localStorage.removeItem("bms_remember_password");
    localStorage.removeItem("bms_username");
    localStorage.removeItem("bms_password");
  }
};

// 页面加载时读取记住的账号密码
loadRememberedCredentials();

const loginRules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        await useUserStoreHook().loginByBms({
          username: ruleForm.username,
          password: ruleForm.password
        });
        // 登录成功后保存或清除记住的账号密码
        saveRememberedCredentials();
        await initRouter();
        disabled.value = true;
        await router.push("/device-list");
        message("平台连接成功", { type: "success" });
      } catch (err: unknown) {
        message((err as Error)?.message ?? "登录失败", { type: "error" });
      } finally {
        loading.value = false;
        disabled.value = false;
      }
    }
  });
};

const immediateDebounce = debounce(() => onLogin(ruleFormRef.value), 500, true);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce();
});
</script>

<template>
  <div class="sci-fi-container">
    <div class="planet-bg"></div>
    <div class="grid-floor"></div>
    <div class="star-field"></div>

    <div class="login-box">
      <div class="data-panel">

        <div class="panel-decor-top">
          <div class="loading-bar"></div>
        </div>

        <div class="panel-content">
          <div class="header">
            <div class="logo-wrap">
              <div class="logo-circle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div class="logo-pulse"></div>
            </div>

            <div class="title-group">
              <h1 class="main-title">SW-BMS</h1>
              <div class="sub-title-box">
                <span class="line"></span>
                <span class="text">大数据智慧管理平台</span>
                <span class="line"></span>
              </div>
            </div>
          </div>

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            class="login-form"
            size="large"
          >
            <el-form-item prop="username">
              <el-input
                v-model="ruleForm.username"
                clearable
                placeholder="请输入管理员账号"
                class="tech-input"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="ruleForm.password"
                clearable
                show-password
                placeholder="请输入登录密码"
                class="tech-input"
                :prefix-icon="Lock"
                @keyup.enter="onLogin(ruleFormRef)"
              />
            </el-form-item>

            <el-form-item class="remember-password-item">
              <el-checkbox v-model="ruleForm.rememberPassword" class="remember-checkbox">
                记住密码
              </el-checkbox>
            </el-form-item>

            <div class="btn-wrapper">
              <el-button
                class="login-btn"
                :loading="loading"
                @click="onLogin(ruleFormRef)"
              >
                <span class="btn-text">进入数据平台</span>
                <span class="btn-glow"></span>
              </el-button>
            </div>
          </el-form>

          <!-- <div class="panel-footer">
            <span>SYS.STATUS: ONLINE</span>
            <span>VER: 2.0.4</span>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* --- 核心变量定义 --- */
$c-bg: #000510;
$c-primary: #00f0ff; /* 科技青，电池能量色 */
$c-blue: #0077ff;    /* 深蓝，大数据色 */
$c-text: #ffffff;
$c-input-bg: rgba(9, 15, 29, 0.8);

.sci-fi-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: $c-bg;
  overflow: hidden;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: $c-text;
}

/* ================= 背景视觉系统 ================= */
.planet-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
  /* 这里的图片可以替换为公司内部的高清服务器机房或抽象数据图 */
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
  background-size: cover; background-position: center;
  background-color: #000;
  /* 底部光晕叠加，让画面不至于太乱，突出中心卡片 */
  &::before {
    content: ''; position: absolute; bottom: -30%; left: 50%; transform: translateX(-50%);
    width: 120vw; height: 60vh; border-radius: 50% 50% 0 0;
    background: radial-gradient(circle at 50% 100%, rgba($c-blue, 0.4) 0%, rgba($c-bg, 0.9) 70%);
    box-shadow: 0 -50px 100px rgba(0, 119, 255, 0.1);
  }
}

/* 3D 移动网格地板 - 营造纵深感 */
.grid-floor {
  position: absolute; top: 55%; left: -50%; width: 200%; height: 100%;
  background-image:
    linear-gradient(rgba($c-primary, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba($c-primary, 0.15) 1px, transparent 1px);
  background-size: 60px 60px;
  transform: perspective(800px) rotateX(70deg);
  mask-image: linear-gradient(to bottom, transparent 0%, black 30%, transparent 80%);
  animation: gridMove 20s linear infinite;
  pointer-events: none; z-index: 1;
}

@keyframes gridMove {
  0% { transform: perspective(800px) rotateX(70deg) translateY(0); }
  100% { transform: perspective(800px) rotateX(70deg) translateY(60px); }
}

.star-field {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px);
  background-size: 50px 50px; opacity: 0.15;
  animation: starFly 100s linear infinite; z-index: 1;
}
@keyframes starFly { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

/* ================= 登录面板 ================= */
.login-box {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  height: 100%;
}

.data-panel {
  width: 460px;
  /* 深空黑晶磨砂质感 */
  background: rgba(12, 18, 28, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px; /* 稍微硬朗一点的圆角 */
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s;

  &:hover {
    border-color: rgba($c-primary, 0.3);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba($c-primary, 0.05);
  }
}

/* 顶部动态扫描条 */
.panel-decor-top {
  position: relative;
  height: 4px;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;

  .loading-bar {
    position: absolute; bottom: 0; left: 0; height: 100%; width: 100%;
    background: linear-gradient(90deg, transparent, $c-primary, transparent);
    animation: loadingScan 3s ease-in-out infinite;
  }
}
@keyframes loadingScan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

.panel-content {
  padding: 40px 48px 20px;
}

/* 头部 Logo 区域 */
.header {
  text-align: center;
  margin-bottom: 40px;

  .logo-wrap {
    position: relative; width: 60px; height: 60px; margin: 0 auto 16px;
    display: flex; justify-content: center; align-items: center;
  }

  .logo-circle {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, darken($c-blue, 10%), $c-blue);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba($c-blue, 0.4);
    z-index: 2;
    svg { width: 32px; color: #fff; filter: drop-shadow(0 0 2px rgba(255,255,255,0.8)); }
  }

  /* 呼吸光环 - 模拟系统心跳 */
  .logo-pulse {
    position: absolute; inset: -4px; border-radius: 50%;
    border: 1px solid $c-primary; opacity: 0;
    animation: pulseBorder 3s infinite;
  }

  .title-group {
    .main-title {
      font-size: 36px; font-weight: 800; margin: 0;
      /* 金属渐变文字 */
      background: linear-gradient(to bottom, #fff 40%, #b0c4de 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      letter-spacing: 2px; font-family: 'Segoe UI', Roboto, sans-serif;
    }

    .sub-title-box {
      margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 12px;
      .text {
        font-size: 14px; color: $c-primary;
        font-weight: 500; letter-spacing: 1px;
        text-shadow: 0 0 10px rgba($c-primary, 0.3);
      }
      .line {
        width: 30px; height: 1px;
        background: linear-gradient(90deg, transparent, rgba($c-primary, 0.5), transparent);
      }
    }
  }
}
@keyframes pulseBorder {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* 表单区域 */
.login-form {
  :deep(.el-form-item) { margin-bottom: 24px; }
}

/* 记住密码复选框样式 */
.remember-password-item {
  margin-bottom: 16px !important;

  :deep(.el-form-item__content) {
    line-height: normal;
  }
}

.remember-checkbox {
  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    transition: color 0.3s;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: $c-primary;
    border-color: $c-primary;
  }

  :deep(.el-checkbox__inner) {
    border-color: rgba(255, 255, 255, 0.3);
    background-color: transparent;
    transition: all 0.3s;

    &:hover {
      border-color: $c-primary;
    }
  }

  &:hover {
    :deep(.el-checkbox__label) {
      color: $c-primary;
    }
  }
}

/* 科技感输入框复写 */
.tech-input {
  :deep(.el-input__wrapper) {
    background-color: $c-input-bg !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0 16px; height: 48px;
    box-shadow: none !important;
    transition: all 0.3s;

    &:hover {
      border-color: rgba(255, 255, 255, 0.3);
    }

    &.is-focus {
      border-color: $c-primary;
      background-color: rgba(0, 5, 10, 0.9) !important;
      box-shadow: 0 0 15px rgba($c-primary, 0.2) !important;
    }
  }

  :deep(.el-input__inner) {
    color: #fff; font-size: 15px;
    &::placeholder { color: rgba(255, 255, 255, 0.3); }
  }

  :deep(.el-input__prefix-inner) { color: $c-primary; font-size: 18px; opacity: 0.9; }
  :deep(.el-input__suffix) { color: rgba(255, 255, 255, 0.4); }
}

/* 按钮：能量流光效果 */
.btn-wrapper { margin-top: 36px; }

.login-btn {
  position: relative; width: 100%; height: 50px; border: none; border-radius: 4px;
  background: linear-gradient(90deg, #0060df, #00308f);
  overflow: hidden; transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 100, 255, 0.4);
  }

  .btn-text {
    font-size: 16px; font-weight: 600; letter-spacing: 4px; color: #fff;
    z-index: 2; position: relative;
  }

  /* 扫光动画 */
  .btn-glow {
    position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transform: skewX(-20deg);
    animation: shine 4s infinite;
  }
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

/* 底部状态栏 */
.panel-footer {
  margin-top: 24px; padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex; justify-content: space-between;
  font-size: 10px; color: rgba(255,255,255,0.2);
  font-family: 'Consolas', monospace; letter-spacing: 1px;
}
</style>
