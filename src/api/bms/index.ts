/**
 * BMS API
 */
import { sha256Hex } from "@/utils/crypto";
import {
  setBmsSession,
  removeBmsSession,
  type BmsSessionData
} from "@/utils/bmsAuth";
import { bmsHttp } from "./http";
import type {
  BmsLoginRes,
  BmsListParams,
  BmsListRes,
  BmsDeviceItem,
  BmsBasicInfo,
  BmsBasicInfoRes,
  BmsRunInfo,
  BmsBatDataRes,
  BmsWarningRes,
  BmsGetParamsRes,
  BmsGetParamsRangeRes,
  BmsSetParamsRes,
  BmsThirdServerListRes,
  BmsBatchSetBtCodeReq,
  BmsBatchSetThirdServerReq,
  BmsMainServerListRes,
  BmsBatchSetMainServerReq,
  BmsFacProfileListParams,
  BmsFacProfileListRes,
  BmsFacProfileDetailRes,
  BmsBatchSetBasicParamsReq,
  BmsBatchSetCellOVReq,
  BmsBatchSetCellUVReq,
  BmsBatchSetBatOVReq,
  BmsBatchSetBatUVReq,
  BmsBatchSetBatOCDReq,
  BmsBatchSetBatOCCReq,
  BmsBatchSetBatSCDReq,
  BmsBatchFunCtrlReq,
  BmsDeviceTransferReq,
  BmsDeviceTransferRes,
  BmsDeviceEntryReq,
  BmsDeviceEntryRes,
  BmsFacConfigReq,
  BmsFacConfigRes,
  BmsOrgNode,
  BmsGetOrgRootRes,
  BmsGetOrgListParams,
  BmsGetOrgListRes,
  BmsAddOrgParams,
  BmsUpdateOrgParams,
  BmsOrgCommonRes,
  BmsGetOrgDetailRes,
  BmsWarningListParams,
  BmsWarningListRes,
  BmsWarningStaticsRes,
  BmsSetServicePriceReq,
  BmsSetServicePriceRes,
  BmsSetServiceTimeReq,
  BmsSetServiceTimeRes,
  BmsChangePasswordReq,
  BmsChangePasswordRes,
  BmsAddFacProfileReq,
  BmsAddFacProfileRes,
  BmsUpdateFacProfileReq,
  BmsUpdateFacProfileRes,
  BmsGetStockRes,
  BmsGetAllstaticsRes
} from "./types";

/** 登录用 appId、key（用户指定） */
export const BMS_APP_ID = "0000000000000000";
export const BMS_APP_KEY = "0000000000000000";

function generateRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * BMS 登录
 */
export async function bmsLoginReq(
  account: string,
  password: string
): Promise<BmsLoginRes> {
  const randStr = generateRandomString(32);
  const digestStr = await sha256Hex(
    BMS_APP_ID + BMS_APP_KEY + account + password + randStr
  );

  const params = {
    name: account,
    pwd: password,
    appid: BMS_APP_ID,
    ct: 2,
    rand: randStr,
    digest: digestStr
  };

  return bmsHttp.post("/bms/api/login", params) as Promise<BmsLoginRes>;
}

/**
 * 处理 BMS 登录成功，存储会话并返回适配的 token 数据
 */
export function handleBmsLoginSuccess(
  res: BmsLoginRes,
  account: string
): BmsSessionData {
  const data = res.data!;
  const sessionData: BmsSessionData = {
    session: data["3rdsession"],
    orgId: data.org_id,
    orgName: data.org_name,
    account,
    auth: data.auth
  };
  setBmsSession(sessionData);
  return sessionData;
}

/**
 * BMS 登出（清除本地会话）
 */
export function bmsLogout(): void {
  removeBmsSession();
}

/**
 * 获取设备列表
 */
export function getBmsListReq(
  params: Omit<BmsListParams, "3rdsession">
): Promise<BmsListRes> {
  return bmsHttp.post("/bms/api/get/bmslist", params) as Promise<BmsListRes>;
}

/**
 * 获取告警列表
 */
export function getWarningBmsListReq(
  params: Omit<BmsWarningListParams, "3rdsession">
): Promise<BmsWarningListRes> {
  return bmsHttp.post("/bms/api/get/warningbmslist", params) as Promise<BmsWarningListRes>;
}

/**
 * 处理设备列表数据（容量单位换算等）
 */
export function processDeviceList(list: BmsDeviceItem[]): BmsDeviceItem[] {
  if (!list || !Array.isArray(list)) return [];

  return list.map(device => {
    const processed: BmsDeviceItem = {
      ...device,
      checked: false
    };
    if (typeof device.batCapacity === "number") {
      processed.capactiyD = (device.batCapacity * 0.1).toFixed(1);
    }
    return processed;
  });
}

/**
 * 获取设备基础信息
 */
export function getBasicInfoReq(bmsId: string): Promise<BmsBasicInfoRes> {
  return bmsHttp.post("/bms/api/get/basicinfo", {
    bms_id: bmsId
  }) as Promise<BmsBasicInfoRes>;
}

/**
 * 获取设备运行信息（电池数据）
 */
export function getBatDataReq(bmsId: string): Promise<BmsBatDataRes> {
  return bmsHttp.post("/bms/api/get/batdata", {
    bms_id: bmsId
  }) as Promise<BmsBatDataRes>;
}

/**
 * 获取告警信息
 */
export function getWarningReq(bmsId: string): Promise<BmsWarningRes> {
  return bmsHttp.post("/bms/api/get/warning", {
    bms_id: bmsId
  }) as Promise<BmsWarningRes>;
}

/**
 * 获取参数配置（params + ranges）
 */
export function getBmsParamsReq(bmsId: string): Promise<BmsGetParamsRes> {
  return bmsHttp.post("/bms/api/get/params", {
    bms_id: bmsId
  }) as Promise<BmsGetParamsRes>;
}

/**
 * 获取参数范围（小程序：/bms/api/get/paramsrange，可选 cell_mat 1-铁锂 2-三元）
 */862317043748180
export function getParamsRangeReq(params?: { cell_mat?: 1 | 2 }): Promise<BmsGetParamsRangeRes> {
  return bmsHttp.post("/bms/api/get/paramsrange", params ?? {}) as Promise<BmsGetParamsRangeRes>;
}

/**
 * 写入/更新参数配置（小程序统一协议：{ bms_id, params: {...} }）
 */
export function setBmsParamsReq(
  apiPath: string,
  bmsId: string,
  params: Record<string, unknown>
): Promise<BmsSetParamsRes> {
  return bmsHttp.post(apiPath, {
    bms_id: bmsId,
    params
  }) as Promise<BmsSetParamsRes>;
}

/**
 * 三方后台地址列表
 */
export function getThirdServerListReq(): Promise<BmsThirdServerListRes> {
  return bmsHttp.post("/bms/api/mng/tsrv/list", {}) as Promise<BmsThirdServerListRes>;
}

/**
 * 主平台（主服务器）列表
 * 小程序：/bms/api/mng/xsrv/list
 */
export function getMainServerListReq(): Promise<BmsMainServerListRes> {
  return bmsHttp.post("/bms/api/mng/xsrv/list", {}) as Promise<BmsMainServerListRes>;
}

/**
 * 生产配置模板列表
 * 小程序：/bms/api/mng/fac/profile/list
 */
export function getFacProfileListReq(params?: BmsFacProfileListParams): Promise<BmsFacProfileListRes> {
  return bmsHttp.post("/bms/api/mng/fac/profile/list", params ?? {}) as Promise<BmsFacProfileListRes>;
}

/**
 * 生产配置模板详情
 * 小程序：/bms/api/mng/fac/profile/get
 */
export function getFacProfileDetailReq(profileId: number): Promise<BmsFacProfileDetailRes> {
  return bmsHttp.post("/bms/api/mng/fac/profile/get", {
    profile_id: profileId
  }) as Promise<BmsFacProfileDetailRes>;
}

/**
 * 新增生产配置模板
 * /bms/api/mng/fac/profile/add
 */
export function addFacProfileReq(payload: BmsAddFacProfileReq): Promise<BmsAddFacProfileRes> {
  return bmsHttp.post("/bms/api/mng/fac/profile/add", payload) as Promise<BmsAddFacProfileRes>;
}

/**
 * 修改生产配置模板
 * /bms/api/mng/fac/profile/update
 */
export function updateFacProfileReq(payload: BmsUpdateFacProfileReq): Promise<BmsUpdateFacProfileRes> {
  return bmsHttp.post("/bms/api/mng/fac/profile/update", payload) as Promise<BmsUpdateFacProfileRes>;
}

/**
 * 批量写入 BT码（小程序：/bms/api/set_batch/params/btCode）
 */
export function setBatchBtCodeReq(payload: BmsBatchSetBtCodeReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/btCode", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入三方后台地址（小程序：/bms/api/set_batch/params/server）
 */
export function setBatchThirdServerReq(payload: BmsBatchSetThirdServerReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/server", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入主平台（主服务器）
 * 小程序：/bms/api/set_batch/params/server，params.xuesrv
 */
export function setBatchMainServerReq(payload: BmsBatchSetMainServerReq): Promise<BmsSetParamsRes> {
  // 兼容：同时带上 offlineTask（小程序字段）与 offline_task（Web 规范字段）
  const finalPayload: BmsBatchSetMainServerReq = {
    ...payload,
    offlineTask: payload.offlineTask ?? payload.offline_task
  };
  return bmsHttp.post("/bms/api/set_batch/params/server", finalPayload) as Promise<BmsSetParamsRes>;
}

/**
 * 设备调拨
 * 小程序：/bms/api/mng/dev/trans
 */
export function transferDeviceReq(payload: BmsDeviceTransferReq): Promise<BmsDeviceTransferRes> {
  return bmsHttp.post("/bms/api/mng/dev/trans", payload) as Promise<BmsDeviceTransferRes>;
}

/**
 * 设备录入
 * 小程序：/bms/api/mng/dev/add
 */
export function addDeviceReq(payload: BmsDeviceEntryReq): Promise<BmsDeviceEntryRes> {
  return bmsHttp.post("/bms/api/mng/dev/add", payload) as Promise<BmsDeviceEntryRes>;
}

/**
 * 生产配置
 * 小程序：/bms/api/mng/fac/config
 */
export function setFacConfigReq(payload: BmsFacConfigReq): Promise<BmsFacConfigRes> {
  return bmsHttp.post("/bms/api/mng/fac/config", payload) as Promise<BmsFacConfigRes>;
}

/**
 * 设置服务价格
 * 小程序：/bms/api/mng/price/set
 */
export function setServicePriceReq(
  payload: BmsSetServicePriceReq
): Promise<BmsSetServicePriceRes> {
  return bmsHttp.post("/bms/api/mng/price/set", payload) as Promise<BmsSetServicePriceRes>;
}

/**
 * 设置服务时间
 * 小程序：/bms/api/mng/srvtime/set
 */
export function setServiceTimeReq(
  payload: BmsSetServiceTimeReq
): Promise<BmsSetServiceTimeRes> {
  return bmsHttp.post("/bms/api/mng/srvtime/set", payload) as Promise<BmsSetServiceTimeRes>;
}

/**
 * 批量写入基础参数（电芯材料/串数/容量，小程序：/bms/api/set_batch/params/cMcN）
 */
export function setBatchBasicParamsReq(payload: BmsBatchSetBasicParamsReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/cMcN", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入电芯过压保护（小程序：/bms/api/set_batch/params/ceOV）
 */
export function setBatchCellOVReq(payload: BmsBatchSetCellOVReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/ceOV", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入电芯欠压保护（小程序：/bms/api/set_batch/params/ceUV）
 */
export function setBatchCellUVReq(payload: BmsBatchSetCellUVReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/ceUV", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入 I 级放电过流（小程序：/bms/api/set_batch/params/batOCD1）
 */
export function setBatchBatOCD1Req(payload: BmsBatchSetBatOCDReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOCD1", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入 II 级放电过流（小程序：/bms/api/set_batch/params/batOCD2）
 */
export function setBatchBatOCD2Req(payload: BmsBatchSetBatOCDReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOCD2", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入 III 级放电过流（约定：/bms/api/set_batch/params/batOCD3）
 */
export function setBatchBatOCD3Req(payload: BmsBatchSetBatOCDReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOCD3", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入 I 级充电过流（小程序：/bms/api/set_batch/params/batOCC1）
 */
export function setBatchBatOCC1Req(payload: BmsBatchSetBatOCCReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOCC1", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入 II 级充电过流（小程序：/bms/api/set_batch/params/batOCC2）
 */
export function setBatchBatOCC2Req(payload: BmsBatchSetBatOCCReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOCC2", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入总压过压保护（小程序：/bms/api/set_batch/params/batOV）
 */
export function setBatchBatOVReq(payload: BmsBatchSetBatOVReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batOV", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入总压欠压保护（小程序：/bms/api/set_batch/params/batUV）
 */
export function setBatchBatUVReq(payload: BmsBatchSetBatUVReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batUV", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 批量写入放电短路保护（小程序：/bms/api/set_batch/params/batSCD）
 */
export function setBatchBatSCDReq(payload: BmsBatchSetBatSCDReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/batSCD", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 功能控制批量下发（小程序：/bms/api/set_batch/params/funCtrl，例如放电/盲充开关）
 */
export function setBatchFunCtrlReq(payload: BmsBatchFunCtrlReq): Promise<BmsSetParamsRes> {
  return bmsHttp.post("/bms/api/set_batch/params/funCtrl", payload) as Promise<BmsSetParamsRes>;
}

/**
 * 修改当前登录账号密码（对应小程序：/bms/api/mng/usr/pwd_change）
 */
export function changePasswordReq(
  payload: BmsChangePasswordReq
): Promise<BmsChangePasswordRes> {
  return bmsHttp.post("/bms/api/mng/usr/pwd_change", payload) as Promise<BmsChangePasswordRes>;
}

/**
 * 获取告警统计
 */
export function getWarningStaticsReq(): Promise<BmsWarningStaticsRes> {
  return bmsHttp.post("/bms/api/get/warningstatics", { page: 1, pageSize: 100 }) as Promise<BmsWarningStaticsRes>;
}

/**
 * 处理基础信息（容量 0.1Ah→Ah，统一字段名）
 */
export function processBasicInfo(raw: BmsBasicInfo | undefined): BmsBasicInfo | null {
  if (!raw) return null;
  const processed: BmsBasicInfo = {
    bmsId: (raw.bms_id ?? raw.bmsId) as string,
    capactiyD: raw.capactiyD,
    batCapacity: raw.batCapacity,
    cellMat: (raw.cell_mat ?? raw.cellMat) as number,
    cellCnt: (raw.cell_cnt ?? raw.cellCnt) as number,
    version: raw.version,
    imsi: raw.imsi,
    btCode: (raw.bt_code ?? raw.btCode) as string,
    xServer: (raw.x_server ?? raw.xServer) as string,
    tServer: (raw.t_server ?? raw.tServer) as string,
    online: raw.online,
    updateTime: raw.updateTime,
    timeF: raw.timeF,
    outTime: raw.outTime,
    activeTime: raw.activeTime,
    lastRenewalTime: raw.lastRenewalTime,
    srvEndTime: raw.srvEndTime,
    price: raw.price
  };
  if (typeof raw.batCapacity === "number") {
    processed.capactiyD = (raw.batCapacity * 0.1).toFixed(1);
  }
  return processed;
}

/**
 * 处理运行信息（单位换算，统一字段名）
 */
export function processRunInfo(raw: BmsRunInfo | undefined): BmsRunInfo | null {
  if (!raw) return null;
  const processed: BmsRunInfo = { ...raw };
  if (typeof raw.batVolt === "number") {
    processed.batVoltD = (raw.batVolt * 0.1).toFixed(1);
  }
  if (typeof raw.current === "number") {
    processed.currentD = (raw.current * 0.1).toFixed(1);
  }
  if (typeof raw.remCap === "number") {
    processed.remCapD = (raw.remCap * 0.1).toFixed(1);
  }
  if (typeof raw.fullCap === "number") {
    processed.fullCapD = (raw.fullCap * 0.1).toFixed(1);
  }
  if (typeof raw.designedCap === "number") {
    processed.designedCapD = (raw.designedCap * 0.1).toFixed(1);
  }
  if (processed.cell_volts && processed.cell_volts.length > 0) {
    let minIndex = 0;
    let maxIndex = 0;
    let minV = processed.cell_volts[0];
    let maxV = processed.cell_volts[0];
    for (let i = 1; i < processed.cell_volts.length; i++) {
      if (processed.cell_volts[i] < minV) {
        minV = processed.cell_volts[i];
        minIndex = i;
      }
      if (processed.cell_volts[i] > maxV) {
        maxV = processed.cell_volts[i];
        maxIndex = i;
      }
    }
    processed.minCellIndex = minIndex;
    processed.maxCellIndex = maxIndex;
  }
  return processed;
}

/**
 * 获取根组织节点（用户归属的组织信息）
 */
export function getOrgRootReq(): Promise<BmsGetOrgRootRes> {
  return bmsHttp.post("/bms/api/mng/org/get", {}) as Promise<BmsGetOrgRootRes>;
}

/**
 * 获取组织子节点列表
 */
export function getOrgListReq(params: BmsGetOrgListParams): Promise<BmsGetOrgListRes> {
  return bmsHttp.post("/bms/api/mng/org/list", {
    next_only: 1,
    ...params
  }) as Promise<BmsGetOrgListRes>;
}

/**
 * 获取组织详情（用于编辑组织时回显）
 */
export function getOrgDetailReq(params: {
  org_id: number | string;
  name?: string;
}): Promise<BmsGetOrgDetailRes> {
  return bmsHttp.post("/bms/api/mng/org/get", params) as Promise<BmsGetOrgDetailRes>;
}

/**
 * 新增组织（对应小程序：/bms/api/mng/org/add）
 */
export function addOrgReq(params: BmsAddOrgParams): Promise<BmsOrgCommonRes> {
  return bmsHttp.post("/bms/api/mng/org/add", params) as Promise<BmsOrgCommonRes>;
}

/**
 * 修改组织（对应小程序：/bms/api/mng/org/update）
 */
export function updateOrgReq(params: BmsUpdateOrgParams): Promise<BmsOrgCommonRes> {
  return bmsHttp.post("/bms/api/mng/org/update", params) as Promise<BmsOrgCommonRes>;
}

/**
 * 获取库存组织（/bms/api/mng/org/getstock）
 */
export function getStockReq(): Promise<BmsGetStockRes> {
  return bmsHttp.post("/bms/api/mng/org/getstock", {}) as Promise<BmsGetStockRes>;
}

/**
 * 获取统计（/bms/api/mng/get/allstatics）
 */
export function getAllstaticsReq(): Promise<BmsGetAllstaticsRes> {
  return bmsHttp.post("/bms/api/get/allstatics", {}) as Promise<BmsGetAllstaticsRes>;
}

/**
 * 处理根组织节点数据（适配不同的返回格式）
 */
export function processOrgRoot(data: BmsGetOrgRootRes["data"]): BmsOrgNode[] {
  if (!data) return [];

  // 如果是 admin 账号，返回的是 { root: true, org_id: [...] }
  if (typeof data === "object" && "root" in data && data.root) {
    const rootOrg: BmsOrgNode = {
      org_id: -1,
      org_name: "根组织",
      root: true,
      isLeaf: false,
      _loading: false,
      children: []
    };

    if (Array.isArray(data.org_id)) {
      rootOrg.children = data.org_id.map((item: any) => ({
        org_id: typeof item === "object" ? item.org_id : item,
        org_name: typeof item === "object" ? item.org_name : `组织${item}`,
        parent_org_id: -1,
        root: false,
        isLeaf: false,
        _loading: false
      }));
    }

    return [rootOrg];
  }

  // 如果是普通账号，返回的是对象或数组
  if (Array.isArray(data)) {
    return data.map(node => ({
      org_id: node.org_id,
      org_name: node.org_name,
      parent_org_id: node.parent_org_id,
      root: node.root,
      children: node.children,
      isLeaf: node.isLeaf ?? false,
      _loading: false
    }));
  }

  // 单个对象（必须是 BmsOrgNode 类型，排除 admin 特殊格式）
  if ('org_name' in data) {
    return [{
      org_id: typeof data.org_id === 'number' || typeof data.org_id === 'string' ? data.org_id : -1,
      org_name: data.org_name,
      parent_org_id: data.parent_org_id,
      root: data.root,
      children: data.children,
      isLeaf: data.isLeaf ?? false,
      _loading: false
    }];
  }

  // 其他情况返回空数组
  return [];
}
