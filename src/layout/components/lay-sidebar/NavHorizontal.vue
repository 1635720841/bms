<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import { responsiveStorageNameSpace } from "@/config";
import { useRoute } from "vue-router";
import router from "@/router";
import NProgress from "@/utils/progress";
import { handleAliveRoute } from "@/router/utils";
import { storageLocal } from "@pureadmin/utils";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import { addDialog } from "@/components/ReDialog";
import ChangePasswordPanel from "@/views/systemManage/userManage/ChangePasswordPanel.vue";

import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import UserAvatar from "~icons/ri/account-circle-fill";
import UserLine from "~icons/ri/user-line";

const showLogo = ref(
  storageLocal().getItem<StorageConfigs>(
    `${responsiveStorageNameSpace()}configure`
  )?.showLogo ?? true
);

const {
  title,
  logout,
  username,
  backTopMenu
} = useNav();

type ChangePwdPanelExpose = {
  submit: () => Promise<boolean>;
};

function openChangePasswordDialog() {
  const panelRef = ref<ChangePwdPanelExpose | null>(null);
  addDialog({
    title: "修改密码",
    width: "480px",
    sureBtnLoading: true,
    contentRenderer: () =>
      h(ChangePasswordPanel, {
        ref: panelRef
      }),
    beforeSure: async (done, { closeLoading }) => {
      try {
        const ok = await panelRef.value?.submit();
        if (ok) {
          done();
        }
      } finally {
        closeLoading();
      }
    }
  });
}

const route = useRoute();

function handleRefresh() {
  NProgress.start();
  const { fullPath, query } = route;
  router.replace({
    path: "/redirect" + fullPath,
    query
  });
  handleAliveRoute(route as ToRouteType, "refresh");
  NProgress.done();
}

onMounted(() => {
  emitter.on("logoChange", key => {
    showLogo.value = key;
  });
});
</script>

<template>
  <!-- 数据管理系统专业头部设计 -->
  <header class="bms-header">
    <div class="bms-header-container">
      <!-- 左侧：品牌标识区 -->
      <div class="bms-header-left" @click="backTopMenu">
        <div class="bms-header-brand">
          <h1 class="bms-header-title" :data-title="title">{{ title }}</h1>
          <div class="bms-header-divider"></div>
          <div class="bms-header-user-info">
            <IconifyIconOffline :icon="UserLine" class="bms-user-icon" />
            <span class="bms-header-username">{{ username || '未登录' }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：工具功能区 -->
      <div class="bms-header-right">
        <div class="bms-header-tools">
          <!-- 菜单搜索 -->
          <!-- <div class="bms-tool-item">
            <LaySearch id="header-search" />
          </div> -->
          <!-- 刷新当前页 -->
          <div class="bms-tool-item">
            <el-tooltip content="刷新当前页" placement="bottom">
              <div class="refresh-icon" @click="handleRefresh">
                <svg
                  class="refresh-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 8.5A7 7 0 0 1 19 9.75M19 4.5V9.5H14"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.5 15.5A7 7 0 0 1 5 14.25M5 19.5V14.5H10"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </el-tooltip>
          </div>
          <!-- 全屏 -->
          <div class="bms-tool-item">
            <LaySidebarFullScreen id="full-screen" />
          </div>
          <!-- 用户菜单 -->
          <el-dropdown
            trigger="click"
            placement="bottom-end"
            class="bms-user-dropdown"
          >
            <div class="bms-user-trigger">
              <div class="bms-user-avatar">
                <IconifyIconOffline :icon="UserAvatar" class="bms-avatar-icon" />
              </div>
              <span v-if="username" class="bms-user-name">{{ username }}</span>
              <IconifyIconOffline
                icon="ri:arrow-down-s-line"
                class="bms-dropdown-arrow"
              />
            </div>
            <template #dropdown>
              <el-dropdown-menu class="bms-dropdown-menu">
                <el-dropdown-item class="bms-dropdown-item" @click="openChangePasswordDialog">
                  <svg style="margin-right: 8px;margin-left: 3px;" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16a1 1 0 1 1-2 0a1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path fill="currentColor" fill-rule="evenodd" d="M5.25 8v1.303q-.34.023-.642.064c-.9.12-1.658.38-2.26.981c-.602.602-.86 1.36-.981 2.26c-.117.867-.117 1.97-.117 3.337v.11c0 1.367 0 2.47.117 3.337c.12.9.38 1.658.981 2.26c.602.602 1.36.86 2.26.982c.867.116 1.97.116 3.337.116h8.11c1.367 0 2.47 0 3.337-.116c.9-.122 1.658-.38 2.26-.982s.86-1.36.982-2.26c.116-.867.116-1.97.116-3.337v-.11c0-1.367 0-2.47-.116-3.337c-.122-.9-.38-1.658-.982-2.26s-1.36-.86-2.26-.981a10 10 0 0 0-.642-.064V8a6.75 6.75 0 0 0-13.5 0M12 2.75A5.25 5.25 0 0 0 6.75 8v1.253q.56-.004 1.195-.003h8.11q.635 0 1.195.003V8c0-2.9-2.35-5.25-5.25-5.25m-7.192 8.103c-.734.099-1.122.28-1.399.556c-.277.277-.457.665-.556 1.4c-.101.755-.103 1.756-.103 3.191s.002 2.436.103 3.192c.099.734.28 1.122.556 1.399c.277.277.665.457 1.4.556c.754.101 1.756.103 3.191.103h8c1.435 0 2.436-.002 3.192-.103c.734-.099 1.122-.28 1.399-.556c.277-.277.457-.665.556-1.4c.101-.755.103-1.756.103-3.191s-.002-2.437-.103-3.192c-.099-.734-.28-1.122-.556-1.399c-.277-.277-.665-.457-1.4-.556c-.755-.101-1.756-.103-3.191-.103H8c-1.435 0-2.437.002-3.192.103" clip-rule="evenodd"/></svg>
                  <span>修改密码</span>
                </el-dropdown-item>
                <div class="bms-dropdown-divider"></div>
                <el-dropdown-item class="bms-dropdown-item"  @click="logout">
                  <IconifyIconOffline style="margin-right: 8px;" :icon="LogoutCircleRLine" class="bms-menu-icon" />
                  <span>退出系统</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.bms-dropdown-divider{
  height: 1px;
  width: 100%;
  background-color:rgba(150, 150, 150, 0.1);
  margin: 4px 0;
}
.bms-header {
  position: relative;
  width: 100%;
  // 高级玻璃态效果
  background: rgba(26, 30, 36, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--bms-border, rgba(255, 255, 255, 0.1));
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.2) inset,
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  z-index: 1000;
  overflow: hidden;

  // 顶部动态光效扫描线
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--bms-primary, #00bcd4) 30%,
      rgba(0, 188, 212, 0.8) 50%,
      var(--bms-primary, #00bcd4) 70%,
      transparent 100%
    );
    opacity: 0.6;
    animation: headerGlow 3s ease-in-out infinite;
  }

  // 底部微光效果
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 188, 212, 0.3) 50%,
      transparent 100%
    );
    opacity: 0.4;
  }
}

@keyframes headerGlow {
  0%, 100% {
    opacity: 0.4;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1.02);
  }
}

.bms-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 32px;
  max-width: 100%;
  position: relative;
  z-index: 1;
}

// 左侧品牌区
.bms-header-left {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: linear-gradient(180deg, var(--bms-primary, #00bcd4), transparent);
    border-radius: 2px;
    transition: height 0.3s ease;
    opacity: 0;
  }

}

.bms-header-brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.bms-header-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  letter-spacing: 1px;
  white-space: nowrap;
  position: relative;
  // 高级渐变文字效果
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    var(--bms-text, #e6edf3) 20%,
    var(--bms-primary, #00bcd4) 60%,
    rgba(0, 188, 212, 0.8) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 200%;
  animation: titleShimmer 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(0, 188, 212, 0.3);

  // 文字光晕效果（使用伪元素创建光晕）
  &::after {
    content: attr(data-title);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--bms-primary, #00bcd4), transparent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0.4;
    filter: blur(6px);
    z-index: -1;
    pointer-events: none;
  }
}

@keyframes titleShimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bms-header-divider {
  width: 1px;
  height: 24px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  opacity: 0.5;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--bms-primary, #00bcd4);
    opacity: 0.6;
    box-shadow: 0 0 8px rgba(0, 188, 212, 0.5);
  }
}

.bms-header-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 188, 212, 0.1),
      transparent
    );
    transition: left 0.5s ease;
  }
}

.bms-user-icon {
  width: 14px;
  height: 14px;
  color: var(--bms-text-secondary, #8b949e);
  flex-shrink: 0;
}

.bms-header-username {
  font-size: 13px;
  font-weight: 400;
  color: var(--bms-text-secondary, #8b949e);
  white-space: nowrap;
}

// 右侧工具区
.bms-header-right {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.bms-header-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bms-tool-item {
  display: flex;
  align-items: center;
  position: relative;

  // 统一工具按钮样式 - 高级设计
  :deep(.search-container),
  :deep(.fullscreen-icon),
  .refresh-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    color: var(--bms-text-secondary, #8b949e);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
    overflow: hidden;

    // 光效背景
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(0, 188, 212, 0.3) 0%,
        transparent 70%
      );
      transform: translate(-50%, -50%);
      transition: width 0.4s ease, height 0.4s ease;
    }

  }
}

.refresh-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

// 用户下拉菜单
.bms-user-dropdown {
  margin-left: 4px;
}

.bms-user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;

  // 光效扫描
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 188, 212, 0.15),
      transparent
    );
    transition: left 0.5s ease;
  }

}

.bms-user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--bms-primary, #00bcd4) 0%,
    var(--bms-primary-hover, #00acc1) 50%,
    rgba(0, 188, 212, 0.8) 100%
  );
  box-shadow:
    0 4px 16px rgba(0, 188, 212, 0.4),
    0 0 0 2px rgba(0, 188, 212, 0.2) inset,
    0 0 20px rgba(0, 188, 212, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  // 光晕动画
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 70%
    );
    animation: avatarPulse 3s ease-in-out infinite;
  }

}

@keyframes avatarPulse {
  0%, 100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.bms-avatar-icon {
  width: 18px;
  height: 18px;
  color: #fff;
}

.bms-user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--bms-text, #e6edf3);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bms-dropdown-arrow {
  width: 14px;
  height: 14px;
  color: var(--bms-text-secondary, #8b949e);
  transition: transform 0.2s ease;
}

// 下拉菜单样式 - 高级玻璃态
.bms-dropdown-menu {
  min-width: 130px;
  padding: 6px;
  background: linear-gradient(135deg, rgba(15, 18, 24, 0.96), rgba(20, 26, 34, 0.98));
  backdrop-filter: blur(18px) saturate(180%);
  border-radius: 10px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  position: relative;

  // 背景光晕
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(0, 188, 212, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
}

@keyframes menuGlow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.bms-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 14px;
  border-radius: 8px;
  color: var(--bms-text, #e6edf3);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-bottom: 2px;

  // 左侧光条
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: linear-gradient(180deg, var(--bms-primary, #00bcd4), transparent);
    border-radius: 0 2px 2px 0;
    transition: height 0.3s ease;
    opacity: 0;
  }
  :deep(.el-dropdown-menu__item) {
    padding: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

/* 悬浮效果：轻一点的高亮和描边，保持简洁 */
.bms-dropdown-item:hover {
  background: radial-gradient(
    circle at 0% 50%,
    rgba(0, 188, 212, 0.18),
    transparent 70%
  );
  box-shadow:
    0 0 0 1px rgba(0, 188, 212, 0.28),
    0 4px 14px rgba(0, 0, 0, 0.5);
  color: #ffffff;

  .bms-menu-icon {
    color: var(--bms-primary, #00bcd4);
    transform: translateX(1px);
  }
}

.bms-menu-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--bms-text-secondary, #8b949e);
}

// 响应式设计
@media (max-width: 768px) {
  .bms-header-container {
    padding: 0 20px;
    height: 64px;
  }

  .bms-header-title {
    font-size: 18px;
    letter-spacing: 0.5px;
  }

  .bms-header-username {
    display: none;
  }

  .bms-user-name {
    display: none;
  }

  .bms-header-divider {
    display: none;
  }

  .bms-tool-item {
    :deep(.search-container),
    :deep(.fullscreen-icon),
    .refresh-icon {
      width: 40px;
      height: 40px;
    }
  }

  .bms-user-avatar {
    width: 32px;
    height: 32px;
  }
}

// 暗色模式优化
html.dark {
  .bms-header {
    background: var(--pure-theme-menu-bg, #1a1e24);
  }
}

// 亮色模式支持
html[data-theme="light"] {
  .bms-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom-color: rgba(0, 0, 0, 0.1);
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.05) inset,
      0 1px 0 rgba(255, 255, 255, 0.8) inset;

    &::before {
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--el-color-primary, #4091f7) 30%,
        rgba(64, 145, 247, 0.8) 50%,
        var(--el-color-primary, #4091f7) 70%,
        transparent 100%
      );
    }
  }

  .bms-header-title {
    background: linear-gradient(
      135deg,
      #1f2937 0%,
      #374151 20%,
      var(--el-color-primary, #4091f7) 60%,
      rgba(64, 145, 247, 0.8) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 4px rgba(64, 145, 247, 0.2));
  }

  .bms-header-username {
    color: var(--el-text-color-regular, #606266);
  }

  .bms-user-icon {
    color: var(--el-text-color-regular, #606266);
  }

  .bms-header-user-info {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
  }

  .bms-dropdown-menu {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-color: rgba(0, 0, 0, 0.12);
    border-top-color: var(--el-color-primary, #4091f7);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.05) inset;
  }

  .bms-dropdown-item {
    color: var(--el-text-color-primary, #303133);
  }

  .bms-tool-item {
    :deep(.search-container),
    :deep(.fullscreen-icon) {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.08);
    }
  }

  .bms-user-trigger {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);

  }
}
</style>
