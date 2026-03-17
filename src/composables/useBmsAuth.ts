/**
 * BMS 权限管理 Composable
 * 提供权限检查、权限获取等功能
 */
import { computed } from "vue";
import { getBmsSession, type BmsSessionData } from "@/utils/bmsAuth";
import { storageLocal } from "@pureadmin/utils";
import type { BmsAuth } from "@/api/bms/types";

const BMS_SESSION_KEY = "bms-session";

/**
 * 获取当前用户的权限对象
 */
export function getBmsAuth(): BmsAuth | null {
  const data = storageLocal().getItem<BmsSessionData>(BMS_SESSION_KEY);
  return data?.auth ?? null;
}

/**
 * 检查权限（支持嵌套路径，如 'bms.op.dschg'）
 * @param path 权限路径，如 'bms.op.dschg' 或 ['bms', 'op', 'dschg']
 * @returns 是否有权限（1 表示有权限，0 或 undefined 表示无权限）
 */
export function checkBmsPermission(
  path: string | string[]
): boolean {
  const auth = getBmsAuth();
  if (!auth) return false;

  const keys = typeof path === "string" ? path.split(".") : path;
  let current: any = auth;

  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return false;
    }
    current = current[key];
  }

  return current === 1;
}

/**
 * BMS 权限管理 Composable
 */
export function useBmsAuth() {
  const auth = computed(() => getBmsAuth());

  /**
   * 检查权限
   */
  const hasPermission = (path: string | string[]): boolean => {
    return checkBmsPermission(path);
  };

  /**
   * BMS 操作权限
   */
  const bmsOp = computed(() => ({
    dschg: hasPermission(["bms", "op", "dschg"]),
    chg: hasPermission(["bms", "op", "chg"]),
    blindchg: hasPermission(["bms", "op", "blindchg"]),
    beep: hasPermission(["bms", "op", "beep"]),
    predschg: hasPermission(["bms", "op", "predschg"]),
    reset: hasPermission(["bms", "op", "reset"]),
    mosRecov: hasPermission(["bms", "op", "mos_recov"]),
    scRecov: hasPermission(["bms", "op", "sc_recov"])
  }));

  /**
   * BMS 配置参数权限
   */
  const bmsCfg = computed(() => ({
    basic: hasPermission(["bms", "cfg", "basic"]),
    btCode: hasPermission(["bms", "cfg", "btCode"]),
    tServer: hasPermission(["bms", "cfg", "t_server"]),
    voltparams: hasPermission(["bms", "cfg", "voltparams"]),
    currparams: hasPermission(["bms", "cfg", "currparams"]),
    tempparams: hasPermission(["bms", "cfg", "tempparams"])
  }));
  console.log('bmsCfg', bmsCfg)
  /**
   * 设备管理权限
   */
  const mngDev = computed(() => ({
    add: hasPermission(["mng", "dev", "add"]),
    update: hasPermission(["mng", "dev", "update"]),
    trans: hasPermission(["mng", "dev", "trans"]),
    list: hasPermission(["mng", "dev", "list"]),
    xsrv: hasPermission(["mng", "dev", "xsrv"])
  }));

  /**
   * 组织管理权限
   */
  const mngOrg = computed(() => ({
    add: hasPermission(["mng", "org", "add"]),
    update: hasPermission(["mng", "org", "update"]),
    list: hasPermission(["mng", "org", "list"])
  }));

  /**
   * 用户管理权限
   */
  const mngUsr = computed(() => ({
    add: hasPermission(["mng", "usr", "add"]),
    update: hasPermission(["mng", "usr", "update"]),
    list: hasPermission(["mng", "usr", "list"]),
    pwdchg: hasPermission(["mng", "usr", "pwdchg"])
  }));

  /**
   * 生产配置权限
   */
  const mngFac = computed(() => ({
    add: hasPermission(["mng", "fac", "add"]),
    update: hasPermission(["mng", "fac", "update"])
  }));

  /**
   * 价格管理权限
   */
  const mngPrice = computed(() => ({
    update: hasPermission(["mng", "price", "update"])
  }));

  /**
   * 服务时间权限
   */
  const mngSrvtime = computed(() => ({
    update: hasPermission(["mng", "srvtime", "update"])
  }));

  /**
   * 升级维护权限
   */
  const mngUpgrade = computed(() => ({
    excute: hasPermission(["mng", "upgrade", "excute"]),
    upload: hasPermission(["mng", "upgrade", "upload"])
  }));

  return {
    auth,
    hasPermission,
    bmsOp,
    bmsCfg,
    mngDev,
    mngOrg,
    mngUsr,
    mngFac,
    mngPrice,
    mngSrvtime,
    mngUpgrade
  };
}

