import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { setBmsParamsReq } from "@/api/bms";
import { checkBmsPermission } from "@/composables/useBmsAuth";

export type FunCtrlFunc =
  | "discharge"
  | "charge"
  | "blindChg"
  | "beep"
  | "preventSpark"
  | "reset"
  | "mosFailRecov"
  | "scRecov";

interface UseFunCtrlOptions {
  /** 指令下发成功后，用于刷新当前设备详情等 */
  onAfterSend?: (bmsId: string) => void;
}

/** 功能控制权限映射 */
const permissionMap: Record<FunCtrlFunc, string[]> = {
  discharge: ["bms", "op", "dschg"],
  charge: ["bms", "op", "chg"],
  blindChg: ["bms", "op", "blindchg"],
  beep: ["bms", "op", "beep"],
  preventSpark: ["bms", "op", "predschg"],
  reset: ["bms", "op", "reset"],
  mosFailRecov: ["bms", "op", "mos_recov"],
  scRecov: ["bms", "op", "sc_recov"]
};

export function useFunCtrl(options?: UseFunCtrlOptions) {
  const cmdLoading = ref(false);
  const refreshing = ref(false);

  const actionTextMap: Record<
    FunCtrlFunc,
    { 0?: string; 1?: string } | string
  > = {
    discharge: { 1: "打开放电", 0: "关闭放电" },
    charge: { 1: "打开充电", 0: "关闭充电" },
    blindChg: { 1: "允许盲充", 0: "禁止盲充" },
    beep: { 1: "开启蜂鸣器", 0: "关闭蜂鸣器" },
    preventSpark: { 1: "开启防打火", 0: "关闭防打火" },
    reset: "重启BMS",
    mosFailRecov: "mos故障恢复",
    scRecov: "短路恢复"
  };

  async function sendFunCtrl(bmsId: string, func: FunCtrlFunc, op: 0 | 1) {
    const id = (bmsId || "").trim();
    if (!id) {
      ElMessage.warning("缺少设备编码");
      return;
    }

    // 权限检查
    const permissionPath = permissionMap[func];
    if (!checkBmsPermission(permissionPath)) {
      ElMessage.warning("无操作权限");
      return;
    }

    const mapItem = actionTextMap[func];
    const actionText =
      typeof mapItem === "string"
        ? mapItem
        : mapItem?.[op] ?? "执行操作";

    // 操作确认
    try {
      await ElMessageBox.confirm(`确定要${actionText}吗？`, "操作确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      });
    } catch {
      // 用户取消
      return;
    }

    cmdLoading.value = true;
    try {
      const res = await setBmsParamsReq(
        "/bms/api/set/params/funCtrl",
        id,
        { [func]: op }
      );
      if (res.errno === 0) {
        ElMessage.success(`${actionText}指令已下发`);
        // 等待一段时间再刷新，给 BMS 执行指令的时间
        if (options?.onAfterSend) {
          refreshing.value = true;
          setTimeout(() => {
            options.onAfterSend?.(id);
            refreshing.value = false;
          }, 4000);
        }
      } else {
        ElMessage.error(res.errmsg ?? "操作失败");
      }
    } catch (error) {
      ElMessage.error("操作失败");
    } finally {
      cmdLoading.value = false;
    }
  }

  return {
    cmdLoading,
    refreshing,
    sendFunCtrl
  };
}


