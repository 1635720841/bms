/**
 * BMS 业务字典
 */
export const cell_mat_dict = [
  { value: 1, label: "铁锂" },
  { value: 2, label: "三元" }
];

export const online_status_dict: {
  value: number;
  label: string;
  type: "success" | "info";
}[] = [
    { value: 1, label: "在线", type: "success" },
    { value: 0, label: "离线", type: "info" }
  ];

/** 根据 value 获取 label */
export function getDictLabel(
  dict: { value: number; label: string }[],
  val: number
): string {
  return dict.find(d => d.value === val)?.label ?? "-";
}

/** 根据 value 获取完整项 */
export function getDictItem<T extends { value: number }>(
  dict: T[],
  val: number
): T | undefined {
  return dict.find(d => d.value === val);
}
/** 保护状态位配置：bit 置位表示“是”(红)，否则“否”(绿) */
export const protect_bit_config: { bit: number; label: string }[] = [
  { bit: 1, label: "电芯过压保护" },
  { bit: 2, label: "电芯欠压保护" },
  { bit: 4, label: "I放电过流保护" },
  { bit: 8, label: "I充电过流保护" },
  { bit: 16, label: "II放电过流保护" },
  { bit: 32, label: "II充电过流保护" },
  { bit: 64, label: "短路保护" },
  { bit: 128, label: "总压高保护" },
  { bit: 256, label: "总压低保护" },
  { bit: 512, label: "放电高温保护" },
  { bit: 1024, label: "放电低温保护" },
  { bit: 2048, label: "充电高温保护" },
  { bit: 4096, label: "充电低温保护" },
  { bit: 8192, label: "MOS高温保护" }
];

/** 告警状态 */
export const warning_bit_config_value: { bit: number; label: string; value: string }[] = [
  { bit: 1, label: "电芯过压", value: "cov" },
  { bit: 2, label: "电芯欠压", value: "cuv" },
  { bit: 3, label: "电池组过压", value: "bov" },
  { bit: 4, label: "电池组欠压", value: "buv" },
  { bit: 5, label: "放电短路", value: "dsc" },
  { bit: 6, label: "一级放电过流", value: "doc1" },
  { bit: 7, label: "二级放电过流", value: "doc2" },
  { bit: 8, label: "一级充电过流", value: "coc1" },
  { bit: 9, label: "二级充电过流", value: "coc2" },
  { bit: 10, label: "电芯放电高温", value: "dot" },
  { bit: 11, label: "电芯放电低温", value: "dut" },
  { bit: 12, label: "电芯充电高温", value: "cot" },
  { bit: 13, label: "电芯充电低温", value: "cut" },
  { bit: 14, label: "MOS高温保护", value: "mot" },
  { bit: 15, label: "AFE通信异常", value: "afelost" },
  { bit: 16, label: "温感掉线", value: "ntclost" },
  { bit: 17, label: "电芯采集线掉线", value: "celllost" },
  { bit: 18, label: "充电MOS失效", value: "cmosfault" },
  { bit: 19, label: "放电MOS失效", value: "dmosfault" }
];

/** status 位配置：onText/offText 显示文案，onIsGood 为 true 表示置位时显示绿色(正常) */
export const status_bit_config: {
  bit: number;
  label: string;
  onText: string;
  offText: string;
  onIsGood: boolean;
}[] = [
    { bit: 1, label: "放电MOS", onText: "接通", offText: "断开", onIsGood: true },
    { bit: 2, label: "充电MOS", onText: "接通", offText: "断开", onIsGood: true },
    { bit: 4, label: "负载接入", onText: "接入", offText: "未接入", onIsGood: true },
    { bit: 8, label: "充电器接入", onText: "接入", offText: "未接入", onIsGood: true },
    { bit: 16, label: "AFE通信", onText: "异常", offText: "正常", onIsGood: false },
    { bit: 32, label: "温感线", onText: "异常", offText: "正常", onIsGood: false },
    { bit: 64, label: "电芯采集线", onText: "异常", offText: "正常", onIsGood: false },
    { bit: 128, label: "串数配错", onText: "错误", offText: "正常", onIsGood: false },
    { bit: 256, label: "充电MOS失效", onText: "失效", offText: "正常", onIsGood: false },
    { bit: 512, label: "放电MOS失效", onText: "失效", offText: "正常", onIsGood: false }
  ];

/** switch_fun_ctrl 位配置：置位显示 onText(绿)，否则 offText(红) */
export const switch_fun_ctrl_bit_config: {
  bit: number;
  label: string;
  onText: string;
  offText: string;
}[] = [
    { bit: 1, label: "放电开关", onText: "开", offText: "关" },
    { bit: 2, label: "充电开关", onText: "开", offText: "关" },
    { bit: 4, label: "盲充功能", onText: "允许", offText: "禁止" },
    { bit: 8, label: "防打火功能", onText: "允许", offText: "禁止" }
  ];
