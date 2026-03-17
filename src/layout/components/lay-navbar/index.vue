<script setup lang="ts">
import { h, ref } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { addDialog } from "@/components/ReDialog";
import ChangePasswordPanel from "@/views/systemManage/userManage/ChangePasswordPanel.vue";
import LaySearch from "../lay-search/index.vue";
import LayNotice from "../lay-notice/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";

import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import Setting from "~icons/ri/settings-3-line";

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  getLogo,
  title,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar
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
</script>

<template>
  <div class="navbar bg-white shadow-xs shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <!-- 顶部左侧：Logo | 系统名称 | 账号名称（参考 BMS 主管端） -->
    <div
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="navbar-left"
    >
      <img :src="getLogo()" alt="logo" class="navbar-logo" />
      <span class="navbar-title">{{ title }}</span>
      <span class="navbar-divider">|</span>
      <span class="navbar-username">{{ username || '未登录' }}</span>
    </div>

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 消息通知 -->
      <LayNotice id="header-notice" />
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="openChangePasswordDialog">
              修改密码
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <IconifyIconOffline
                :icon="LogoutCircleRLine"
                style="margin: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        title="打开系统配置"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .navbar-left {
    display: flex;
    align-items: center;
    float: left;
    height: 48px;
    margin-left: 16px;
    gap: 12px;

    .navbar-logo {
      height: 28px;
      width: auto;
    }

    .navbar-title {
      font-size: var(--bms-header-title-size, 20px);
      font-weight: 600;
      color: inherit;
    }

    .navbar-divider {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .navbar-username {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
