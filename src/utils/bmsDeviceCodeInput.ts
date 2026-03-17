export interface ParseDeviceCodeInputResult {
  validItems: string[];
  invalidItems: string[];
  repeatItems: string[];
  /** 是否完全合法（无非法字符、无重复） */
  result: boolean;
  /** 错误信息（无错误则为 null） */
  error: string | null;
}

/**
 * 解析设备编码输入（支持逗号/空格/换行分割），并校验仅允许字母数字。
 * 逻辑对齐小程序：非法字符 → invalidItems；重复 → repeatItems；合法唯一项 → validItems。
 */
export function parseDeviceCodeInput(input: string): ParseDeviceCodeInputResult {
  if (!input || typeof input !== "string") {
    return {
      validItems: [],
      invalidItems: [],
      repeatItems: [],
      result: false,
      error: "输入类型有误"
    };
  }

  // 1. 去除前后空格
  const trimmed = input.trim();
  // 2. 替换多个连续空格为单个空格
  const singleSpaced = trimmed.replace(/\s+/g, " ");
  // 3. 组合分割（逗号、空格、换行符）
  const combinedSplit = singleSpaced.split(/[,\s\n]+/);
  const items = combinedSplit.filter(item => item.trim().length > 0);

  const validItems: string[] = [];
  const invalidItems: string[] = [];
  const repeatItems: string[] = [];
  const regex = /^[a-zA-Z0-9]+$/;

  for (const raw of items) {
    const item = raw.trim();
    if (!item) continue;
    if (!regex.test(item)) {
      invalidItems.push(item);
      continue;
    }
    if (validItems.includes(item)) {
      repeatItems.push(item);
      continue;
    }
    validItems.push(item);
  }

  const error = invalidItems.length ? "含非法字符" : (repeatItems.length ? "有重复数据" : null);
  return {
    validItems,
    invalidItems,
    repeatItems,
    result: invalidItems.length === 0 && repeatItems.length === 0,
    error
  };
}









































































































