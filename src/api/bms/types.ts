/** BMS 登录请求参数 */
export interface BmsLoginParams {
  name: string;
  pwd: string;
  appid: string;
  ct: number;
  rand: string;
  digest: string;
}

/** BMS 登录响应 */
export interface BmsLoginRes {
  errno: number;
  errmsg?: string;
  data?: {
    "3rdsession": string;
    org_id: string;
    org_name: string;
    auth?: string[];
  };
}

/** 设备列表筛选 */
export interface BmsListFilters {
  bmsId?: string;
  online?: number;
  ceMat?: number;
  ceCnt?: number;
  btCode?: string;
  orgId?: string;
  /**
   * 离线时长（秒）
   * getbmslist 接口要求：查询离线设备时需要同时携带 online=0 与 offlinetime
   */
  offlinetime?: number;
}

/** 设备列表请求参数 */
export interface BmsListParams {
  "3rdsession": string;
  pageSize: number;
  page: number;
  filters?: BmsListFilters;
}

/** 设备项 */
export interface BmsDeviceItem {
  bmsId: string;
  cellCnt: number;
  cellMat: number;
  capactiyD?: string;
  batCapacity?: number;
  online: number;
  btCode: string;
  tServer: string;
  /** 发货时间（原始时间戳或已格式化字符串） */
  outTime?: number | string;
  /** 激活时间（原始时间戳或已格式化字符串） */
  activeTime?: number | string;
  /** 服务到期时间（原始时间戳或已格式化字符串） */
  srvEndTime?: number | string;
  /** 最近续费时间 / 最后续费时间（列表中复用 updateTime 字段） */
  updateTime?: number | string;
  /** 服务价格（单位：分或已格式化字符串，视具体接口而定） */
  srvFee?: number | string;
  checked?: boolean;
  /**
   * 最后数据时间/最后在线时间（后端字段可能为 lastDataTime 或 updateTime）
   * 原始时间戳，单位通常为秒或毫秒
   */
  lastDataTime?: number | string;
  /**
   * 前端格式化后的时间（YYYY-MM-DD HH:mm:ss）
   */
  lastDataTimeText?: string;
  /**
   * 离线时长（秒）
   */
  offlineSeconds?: number;
  /**
   * 离线时长展示文案，例如：3天5小时 / 2小时10分 / 5分
   */
  offlineDuration?: string;
}

/** 设备列表响应 */
export interface BmsListRes {
  errno: number;
  errmsg?: string;
  data?: {
    bmsList: BmsDeviceItem[];
    total: number;
  };
}

/** 设备基础信息（接口原始/处理后通用） */
export interface BmsBasicInfo {
  bms_id?: string;
  bmsId?: string;
  capactiy?: number;
  capactiyD?: string;
  batCapacity?: number;
  cell_mat?: number;
  cellMat?: number;
  cell_cnt?: number;
  cellCnt?: number;
  version?: string;
  imsi?: string;
  bt_code?: string;
  btCode?: string;
  x_server?: string;
  xServer?: string;
  t_server?: string;
  tServer?: string;
  online?: number;
  updateTime?: string | number;
  timeF?: string;
  outTime?: number;
  activeTime?: number;
  lastRenewalTime?: number;
  srvEndTime?: number;
  price?: number;
  // 前端格式化字段
  outTimeF?: string;
  activeTimeF?: string;
  lastRenewalTimeF?: string;
  srvEndTimeF?: string;
  priceF?: string;
}

/** 设备运行信息（接口原始/处理后） */
export interface BmsRunInfo {
  btCode?: string;
  soc?: number;
  soh?: number;
  current?: number;
  currentD?: string;
  cell_cnt?: number;
  cell_volts?: number[];
  cell_balance?: boolean[];
  cell_T?: number[];
  cell_T_cnt?: number;
  mos_T?: number;
  env_T?: number;
  protect?: number;
  status?: number;
  switch_ctrl?: number;
  switch_fun_ctrl?: number;
  functrl?: number;
  batVolt?: number;
  batVoltD?: string;
  loop?: number;
  remCap?: number;
  remCapD?: string;
  fullCap?: number;
  fullCapD?: string;
  designedCap?: number;
  designedCapD?: string;
  time?: number;
  timeF?: string;
  online?: number;
  gps_sat_cnt?: number;
  gps_lng?: number;
  gps_lat?: number;
  lng?: string;
  lat?: string;
  minCellIndex?: number;
  maxCellIndex?: number;
}

/** 设备基础信息响应 */
export interface BmsBasicInfoRes {
  errno: number;
  errmsg?: string;
  data?: {
    basicInfo: BmsBasicInfo;
  };
}

/** 设备运行信息响应 */
export interface BmsBatDataRes {
  errno: number;
  errmsg?: string;
  data?: {
    batData: BmsRunInfo;
  };
}

/** 告警信息项 */
export interface BmsWarningItem {
  t: string;
  /**
   * 告警码：
   * - 正常告警：1-19
   * - 告警恢复：10000+bit 或 100000+bit（例如 100001）
   * 后端可能返回 string，这里做兼容。
   */
  e: number | string;
  /** 兼容后端可能返回的附加信息字段 */
  info?: number | string;
}

/** 告警信息响应 */
export interface BmsWarningRes {
  errno: number;
  errmsg?: string;
  data?: { warnings: BmsWarningItem[] };
}

/** 参数配置：params（不同固件可能字段不同，按接口透传） */
export type BmsParamsMap = Record<string, number | string | null>;

/** 参数配置：ranges（范围通常为 [min,max]） */
export type BmsRangesMap = Record<string, [number, number]>;

/** 获取参数范围请求（小程序：/bms/api/get/paramsrange，可选 cell_mat 1-铁锂 2-三元） */
export interface BmsGetParamsRangeParams {
  cell_mat?: 1 | 2;
}

/** 获取参数范围响应 */
export interface BmsGetParamsRangeRes {
  errno: number;
  errmsg?: string;
  data?: { ranges: BmsRangesMap };
}

/** 获取参数配置响应 */
export interface BmsGetParamsRes {
  errno: number;
  errmsg?: string;
  data?: {
    bmsParams: BmsParamsMap;
    ranges: BmsRangesMap;
  };
}

/** 写入/更新参数响应 */
export interface BmsSetParamsRes {
  errno: number;
  errmsg?: string;
}

/** 三方后台地址条目 */
export interface BmsThirdServerItem {
  title: string;
  value: string;
}

/** 三方后台地址列表响应 */
export interface BmsThirdServerListRes {
  errno: number;
  errmsg?: string;
  data?: {
    tsrv_list: BmsThirdServerItem[];
  };
}

/** 主平台（主服务器）条目（小程序：/bms/api/mng/xsrv/list 的 xsrv_list） */
export interface BmsMainServerItem {
  title: string;
  value: string;
}

/** 主平台（主服务器）列表响应 */
export interface BmsMainServerListRes {
  errno: number;
  errmsg?: string;
  data?: {
    xsrv_list: BmsMainServerItem[];
  };
}

/** 生产配置模板（profile）条目 */
export interface BmsFacProfileItem {
  id: number;
  name: string;
}

/** 生产配置模板列表响应（/bms/api/mng/fac/profile/list） */
export interface BmsFacProfileListRes {
  errno: number;
  errmsg?: string;
  data?: {
    profile_list: BmsFacProfileItem[];
  };
}

/** 生产配置模板详情（主要用于展示，可按接口透传） */
export interface BmsFacProfileDetail {
  title?: string[];
  value?: Array<string | number>;
}

/** 生产配置模板详情响应（/bms/api/mng/fac/profile/get） */
export interface BmsFacProfileDetailRes {
  errno: number;
  errmsg?: string;
  data?: {
    profile?: BmsFacProfileDetail | null;
  };
}

/** 批量写入：离线任务（0 仅在线，1 包含离线任务） */
export type BmsOfflineTask = 0 | 1;

/** 批量写入 BT码 请求体（对应小程序：/bms/api/set_batch/params/btCode） */
export interface BmsBatchSetBtCodeParams {
  bms_id: string[];
  btcode: string[];
}

export interface BmsBatchSetBtCodeReq {
  offline_task: BmsOfflineTask;
  params: BmsBatchSetBtCodeParams;
}

/** 批量写入三方后台 请求体（对应小程序：/bms/api/set_batch/params/server） */
export interface BmsBatchSetThirdServerReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    ctsrv: string;
  };
}

/** 批量写入主平台（主服务器） 请求体（小程序：/bms/api/set_batch/params/server，params.xuesrv） */
export interface BmsBatchSetMainServerReq {
  bms_id_list: string[];
  /**
   * 兼容：后台通常使用 offline_task；小程序用 offlineTask。
   * 我们发送时建议两者同时携带，提升兼容性。
   */
  offline_task: BmsOfflineTask;
  offlineTask?: BmsOfflineTask;
  params: {
    xuesrv: string;
  };
}

/** 设备录入 请求体（小程序：/bms/api/mng/dev/add） */
export interface BmsDeviceEntryReq {
  bms_id_list: string[];
  org_id?: string | number;
  org_name?: string;
}

/** 设备录入 响应 */
export interface BmsDeviceEntryRes {
  errno: number;
  errmsg?: string;
  data?: {
    add_cnt: number;
  };
}

/** 设备调拨 请求体（小程序：/bms/api/mng/dev/trans） */
export interface BmsDeviceTransferReq {
  bms_id_list: string[];
  org_id: string | number;
  org_name: string;
}

/** 设备调拨 响应 */
export interface BmsDeviceTransferRes {
  errno: number;
  errmsg?: string;
  data?: {
    update_cnt: number;
  };
}

/** 生产配置 请求体（小程序：/bms/api/mng/fac/config） */
export interface BmsFacConfigReq {
  bms_id_list: string[];
  profile_id: number;
}

/** 生产配置 响应 */
export interface BmsFacConfigRes {
  errno: number;
  errmsg?: string;
  data?: {
    update_cnt: number;
  };
}

/** 批量写入基础参数 请求体（对应小程序：/bms/api/set_batch/params/cMcN） */
export interface BmsBatchSetBasicParamsReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    cM: number; // 1-铁锂 2-三元
    cN: number; // 串数
    capacity: number; // 0.1Ah 单位
  };
}

/** 批量写入电芯过压保护 请求体（对应小程序：/bms/api/set_batch/params/ceOV） */
export interface BmsBatchSetCellOVReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 mV
    D: number; // 触发延时 100ms 单位
    RT: number; // 恢复门限 mV
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入电芯欠压保护 请求体（对应小程序：/bms/api/set_batch/params/ceUV） */
export interface BmsBatchSetCellUVReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 mV
    D: number; // 触发延时 100ms 单位
    RT: number; // 恢复门限 mV
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入总压过压保护 请求体（对应小程序：/bms/api/set_batch/params/batOV，T/RT 0.1V 单位，D/RD 100ms 单位） */
export interface BmsBatchSetBatOVReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 0.1V 单位
    D: number; // 触发延时 100ms 单位
    RT: number; // 恢复门限 0.1V 单位
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入总压欠压保护 请求体（对应小程序：/bms/api/set_batch/params/batUV，T/RT 0.1V 单位，D/RD 100ms 单位） */
export interface BmsBatchSetBatUVReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 0.1V 单位
    D: number; // 触发延时 100ms 单位
    RT: number; // 恢复门限 0.1V 单位
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入 I/II 级放电过流 请求体（T/RT 0.1A 单位，D/RD 100ms 单位） */
export interface BmsBatchSetBatOCDReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 0.1A 单位
    D: number; // 触发延时 100ms 单位
    RT?: number; // 恢复门限 0.1A 单位（部分固件/小程序无该字段）
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入 I/II 级充电过流 请求体（T/RT 0.1A 单位，D/RD 100ms 单位） */
export interface BmsBatchSetBatOCCReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 0.1A 单位
    D: number; // 触发延时 100ms 单位
    RT?: number; // 恢复门限 0.1A 单位（部分固件/小程序无该字段）
    RD: number; // 恢复延时 100ms 单位
  };
}

/** 批量写入放电短路保护 请求体（T 0.1A 单位，D 0.1ms 单位即 us/10） */
export interface BmsBatchSetBatSCDReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: {
    T: number; // 触发门限 0.1A 单位
    D: number; // 触发延时 0.1ms 单位（100us 对应 10）
  };
}

/** 功能控制批量请求体（对应小程序：/bms/api/set_batch/params/funCtrl，例如 { discharge: 1 } / { blindChg: 0 }） */
export interface BmsBatchFunCtrlReq {
  bms_id_list: string[];
  offline_task: BmsOfflineTask;
  params: Record<string, number>;
}

/** 组织树节点 */
export interface BmsOrgNode {
  org_id: number | string;
  org_name: string;
  parent_org_id?: number | string;
  isLeaf?: boolean;
  root?: boolean;
  children?: BmsOrgNode[];
  _loading?: boolean;
}

/** 获取根组织节点响应 */
export interface BmsGetOrgRootRes {
  errno: number;
  errmsg?: string;
  data?:
    | BmsOrgNode
    | BmsOrgNode[]
    | {
        root: boolean;
        org_id: number[] | { org_id: number; org_name: string }[];
      };
}

/** 获取组织子节点列表请求参数 */
export interface BmsGetOrgListParams {
  org_id?: number | string;
  next_only?: 0 | 1; // 1-仅获取下一级，0-获取所有子级
}

/** 获取组织子节点列表响应 */
export interface BmsGetOrgListRes {
  errno: number;
  errmsg?: string;
  data?: {
    orgList: BmsOrgNode[];
  };
}

/** 通用组织接口响应 */
export interface BmsOrgCommonRes {
  errno: number;
  errmsg?: string;
}

/** 新增组织请求参数（对应小程序：/bms/api/mng/org/add） */
export interface BmsAddOrgParams {
  org_name: string;
  contact_person1: string;
  contact_number1: string;
  parent_org_id?: number | string;
  parent_org_name?: string;
  org_addr?: string;
  org_tax_id?: string;
}

/** 修改组织请求参数（对应小程序：/bms/api/mng/org/update） */
export interface BmsUpdateOrgParams {
  org_name: string;
  contact_person1: string;
  contact_number1: string;
  parent_org_id?: number | string;
  parent_org_name?: string;
  org_addr?: string;
  org_tax_id?: string;
}

/** 获取组织详情响应（对应小程序：/bms/api/mng/org/get，带 org_id/name） */
export interface BmsGetOrgDetailRes {
  errno: number;
  errmsg?: string;
  data?: {
    org_name: string;
    org_tax_id?: string;
    org_addr?: string;
    contact_person1?: string;
    contact_number1?: string;
    parent_org_id?: number | string;
    parent_org_name?: string;
  };
}

/** 告警列表项（布尔字段对应 protect_bit_config 中的 value） */
export interface BmsWarningListItem {
  bmsId: string;
  /**
   * 告警发生时间（后端可能返回秒/毫秒时间戳，或可被 Date 解析的字符串）
   */
  time?: number | string;
  afelost?: boolean;
  bov?: boolean;
  buv?: boolean;
  celllost?: boolean;
  cmosfault?: boolean;
  coc1?: boolean;
  coc2?: boolean;
  cot?: boolean;
  cov?: boolean;
  cut?: boolean;
  cuv?: boolean;
  doc1?: boolean;
  doc2?: boolean;
  dmosfault?: boolean;
  dot?: boolean;
  dsc?: boolean;
  dut?: boolean;
  mot?: boolean;
  ntclost?: boolean;
}

/** 告警类型 key（与 protect_bit_config 中的 value 一一对应） */
export type BmsWarningKey = "cov" | "cuv" | "bov" | "buv" | "dsc" | "doc1" | "doc2" | "coc1" | "coc2" | "dot" | "dut" | "cot" | "cut" | "mot" | "afelost" | "ntclost" | "celllost" | "cmosfault" | "dmosfault";

/** 告警统计映射（/bms/api/get/warningstatics 的 statistics 字段） */
export type BmsWarningStatisticsMap = Record<BmsWarningKey, number>;

/** 告警列表请求参数 */
export interface BmsWarningListParams {
  "3rdsession": string;
  pageSize: number;
  page: number;
}

/** 告警列表响应 */
export interface BmsWarningListRes {
  errno: number;
  errmsg?: string;
  data?: {
    "3rdsession": string;
    total: number;
    bmsList: BmsWarningListItem[];
  };
}

/** 告警统计响应（/bms/api/get/warningstatics） */
export interface BmsWarningStaticsRes {
  errno: number;
  errmsg?: string;
  data?: {
    "3rdsession": string;
    update_time: number;
    statistics: BmsWarningStatisticsMap;
  };
}

/** 设置服务价格请求体（小程序：/bms/api/mng/price/set） */
export interface BmsSetServicePriceReq {
  bms_id_list: string[];
  price: number;
}

/** 设置服务价格响应 */
export interface BmsSetServicePriceRes {
  errno: number;
  errmsg?: string;
  data?: {
    update_cnt: number;
  };
}

/** 设置服务时间请求体（小程序：/bms/api/mng/srvtime/set） */
export interface BmsSetServiceTimeReq {
  bms_id_list: string[];
  /** 移动天数（正数表示增加，负数表示减少） */
  move_days?: number;
  /** 移动到指定日期（格式：YYYYMMDD） */
  move_to_date?: string;
}

/** 设置服务时间响应 */
export interface BmsSetServiceTimeRes {
  errno: number;
  errmsg?: string;
  data?: {
    update_cnt: number;
  };
}

/** 修改密码请求体（对应小程序：/bms/api/mng/usr/pwd_change） */
export interface BmsChangePasswordReq {
  password_old: string;
  password_new: string;
  name?: string;
}

/** 修改密码响应 */
export interface BmsChangePasswordRes {
  errno: number;
  errmsg?: string;
}

/** 生产配置模板列表请求参数 */
export interface BmsFacProfileListParams {
  [key: string]: unknown;
}

/** 新增生产配置模板请求体（对应小程序：/bms/api/mng/fac/profile/add） */
export interface BmsAddFacProfileReq {
  name: string;
  softwareVer?: string;
  RSSI?: number | null;
  GPS?: number | null;
  server?: string;
  "3rdServer"?: string;
}

/** 新增生产配置模板响应 */
export interface BmsAddFacProfileRes {
  errno: number;
  errmsg?: string;
}

/** 修改生产配置模板请求体（对应小程序：/bms/api/mng/fac/profile/update） */
export interface BmsUpdateFacProfileReq {
  profile_id: number;
  name: string;
  softwareVer?: string;
  RSSI?: number | null;
  GPS?: number | null;
  server?: string;
  "3rdServer"?: string;
}

/** 修改生产配置模板响应 */
export interface BmsUpdateFacProfileRes {
  errno: number;
  errmsg?: string;
}

/** 获取库存组织响应（对应小程序：/bms/api/mng/org/getstock） */
export interface BmsGetStockRes {
  errno: number;
  errmsg?: string;
  data?: {
    stockProduct?: number;
    maintainStockOrgId?: number;
  };
}

/** 时间维度统计（周/月/当前/天） */
export interface BmsTimeDimensionStats {
  week: number;
  month: number;
  now: number;
  day?: number;
}

/** 获取统计响应（/bms/api/mng/get/allstatics） */
export interface BmsGetAllstaticsRes {
  errno: number;
  errmsg?: string;
  data?: {
    "3rdsession": string;
    offline: BmsTimeDimensionStats;
    /**
     * 设备定位分布（省_市 -> 数量）
     * 例如：{ "广东_深圳市": 1603, "香港_香港特别行政区": 7 }
     */
    loc?: Record<string, number>;
    update_time: number;
    expired: Omit<BmsTimeDimensionStats, "day">;
    nogps: BmsTimeDimensionStats;
    /** 电池断开统计（接口可能返回） */
    bocDisc?: BmsTimeDimensionStats;
    statistics: BmsWarningStatisticsMap;
  };
}

/** 放电过流设备列表项 */
export interface BmsBocDiscBmsListItem {
  /** 设备 id（接口可能返回 bms_id 或 id，这里统一做兼容） */
  bms_id?: string;
  id?: string;
  /** 发生/记录时间（秒/毫秒时间戳 或 字符串） */
  time?: number | string;
}

/** 放电过流设备列表请求参数 */
export interface BmsBocDiscBmsListParams {
  page?: number;
  pageSize?: number;
  /** 筛选条件（与 deviceList 一致，包在 filters 字段里） */
  filters?: {
    /**
     * 设备 id（后端字段可能为 bmsId 或 bms_id）
     * 这里同时传递兼容字段，避免后端实现差异导致过滤失效
     */
    bmsId?: string;
    bms_id?: string;
    /**
     * 时间范围过滤（YYYY-MM-DD HH:mm:ss）
     */
    begin?: number | string;
    end?: number | string;
  };
}

/** 放电过流设备列表响应（/bms/api/get/bocdiscbmslist） */
export interface BmsBocDiscBmsListRes {
  errno: number;
  errmsg?: string;
  data?: {
    /** 接口字段（按接口命名可能为 bocdiscbmslist） */
    bocdiscbmslist?: BmsBocDiscBmsListItem[];
    /** 兼容：可能返回驼峰字段名 */
    bocDiscBmsList?: BmsBocDiscBmsListItem[];
    /** 兼容：可能直接返回 list */
    list?: BmsBocDiscBmsListItem[];
    /** 接口返回：bmsList */
    bmsList?: BmsBocDiscBmsListItem[];
    /** 总数（如果接口直接返回总条数） */
    total?: number;
    /** 当前页码 */
    page?: number;
    /** 总页数（接口可能返回 totalPage / total_pages / totalPages 等） */
    totalPage?: number;
    totalPages?: number;
    total_page?: number;
    /** 兼容：请求分页参数回显 */
    pageSize?: number;
    page_size?: number;
  };
}
