<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { isAllEmpty } from "@pureadmin/utils";
import { useRoute } from "vue-router";
import { usePermissionStoreHook } from "@/store/modules/permission";
import LaySidebarItem from "../lay-sidebar/components/SidebarItem.vue";

defineOptions({ name: "LayMenuBar" });

const menuRef = ref();
const route = useRoute();

const defaultActive = computed(() =>
  !isAllEmpty(route.meta?.activePath) ? route.meta.activePath : route.path
);

nextTick(() => {
  menuRef.value?.handleResize();
});
</script>

<template>
  <!-- 主导航菜单栏（放在标签位，参考 BMS 主管端：主页、设备管理等） -->
  <div class="lay-menu-bar">
    <el-menu
      ref="menuRef"
      mode="horizontal"
      popper-class="pure-scrollbar"
      class="lay-menu-bar-menu"
      :default-active="defaultActive"
    >
      <LaySidebarItem
        v-for="item in usePermissionStoreHook().wholeMenus"
        :key="item.path"
        :item="item"
        :base-path="item.path"
      />
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.lay-menu-bar {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  background: var(--pure-theme-menu-bg);
  border-bottom: 1px solid var(--pure-border-color);

  :deep(.lay-menu-bar-menu) {
    flex: 1;
    min-width: 0;
    height: 40px;
    border: none;
    background: transparent;

    .el-menu-item,
    .el-sub-menu__title {
      height: 40px;
      line-height: 40px;
      font-size: var(--bms-menu-item-size, 20px) !important;
      color: var(--pure-theme-menu-text);
      border-bottom: 2px solid transparent;
      padding: 15px 0px;
      margin: 0 15px;
      &:hover {
        color: var(--pure-theme-menu-title-hover);
      }
    }
    .el-text{
      font-size: var(--bms-menu-item-size, 20px) !important;
      font-weight: 600 !important;
    }
    .el-menu-item.is-active,
    .is-active > .el-sub-menu__title {
      color: var(--pure-theme-sub-menu-active-text);
      border-bottom-color: var(--el-menu-active-color);
    }
  }
}
</style>
