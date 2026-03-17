import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

/**
 * 配置下发确认选项
 */
export interface ConfigConfirmOptions {
  /** 配置名称（用于提示信息） */
  configName: string;
  /** 是否批量配置 */
  isBatch?: boolean;
  /** 设备数量（批量时使用） */
  deviceCount?: number;
  /** 执行配置下发的异步函数 */
  execute: () => Promise<{ errno: number; errmsg?: string }>;
  /** 成功后的回调 */
  onSuccess?: () => void;
  /** 失败后的回调 */
  onError?: (errmsg?: string) => void;
}

/**
 * 统一配置下发确认 Composable
 *
 * @example
 * ```ts
 * const { confirmAndSubmit } = useConfigConfirm();
 *
 * await confirmAndSubmit({
 *   configName: 'BT码配置',
 *   execute: async () => {
 *     return await setBmsParamsReq('/bms/api/set/params/btCode', bmsId, { btcode });
 *   },
 *   onSuccess: () => {
 *     emit('success');
 *   }
 * });
 * ```
 */
export function useConfigConfirm() {
  const loading = ref(false);

  /**
   * 确认并执行配置下发
   */
  async function confirmAndSubmit(options: ConfigConfirmOptions): Promise<void> {
    const { configName, isBatch = false, deviceCount, execute, onSuccess, onError } = options;

    // 构建确认消息
    let message = `确定要下发${configName}吗？`;
    if (isBatch && deviceCount) {
      message = `确定要对 ${deviceCount} 个设备下发${configName}吗？`;
    }

    try {
      // 显示确认对话框
      await ElMessageBox.confirm(message, "配置下发确认", {
        confirmButtonText: "确定下发",
        cancelButtonText: "取消",
        type: "warning",
        distinguishCancelAndClose: true
      });

      // 用户确认后执行
      loading.value = true;
      try {
        const res = await execute();
        if (res.errno === 0) {
          const successMsg = isBatch
            ? `${configName}批量配置已下发`
            : `${configName}已下发`;
          ElMessage.success(successMsg);
          onSuccess?.();
        } else {
          const errorMsg = res.errmsg ?? `${configName}失败`;
          ElMessage.error(errorMsg);
          onError?.(res.errmsg);
        }
      } catch (error: any) {
        const errorMsg = error?.errmsg ?? error?.message ?? `${configName}失败`;
        ElMessage.error(errorMsg);
        onError?.(error?.errmsg ?? error?.message);
      } finally {
        loading.value = false;
      }
    } catch {
      // 用户取消，不执行任何操作
    }
  }

  return {
    loading,
    confirmAndSubmit
  };
}
