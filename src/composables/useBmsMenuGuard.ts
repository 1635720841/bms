/**
 * BMS 菜单 & 按钮级权限包装
 *
 * 说明：
 * - 基于 useBmsAuth 进行简单封装，便于在各个页面统一使用
 */
import { computed } from "vue";
import { useBmsAuth } from "./useBmsAuth";

export function useBmsMenuGuard() {
  const { mngDev, mngOrg, mngUsr, bmsCfg } = useBmsAuth();

  /** 是否可以访问系统管理-用户管理 */
  const canVisitUserManage = computed(() => mngUsr.value.list);

  /** 是否可以访问设备列表批量参数配置 */
  const canUseBatchConfig = computed(
    () =>
      bmsCfg.value.basic ||
      bmsCfg.value.btCode ||
      bmsCfg.value.tServer ||
      bmsCfg.value.voltparams ||
      bmsCfg.value.currparams ||
      bmsCfg.value.tempparams
  );
  console.log('bmsCfg', bmsCfg)
  /** 是否可以管理组织（新增/修改） */
  const canManageOrg = computed(
    () => mngOrg.value.add || mngOrg.value.update
  );

  return {
    // 原始权限对象
    mngDev,
    mngOrg,
    mngUsr,
    bmsCfg,
    // 派生能力
    canVisitUserManage,
    canUseBatchConfig,
    canManageOrg
  };
}


