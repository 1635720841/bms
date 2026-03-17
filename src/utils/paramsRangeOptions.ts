/**
 * 批量配置参数范围选项生成（与小程序 generateOptions* 一致）
 * range 为 [min, max]，单位与接口一致；返回 { label 展示, value 接口值 }[]
 */

/**
 * 门限 0.1V 单位 → 展示 V，步长固定 0.5V（与小程序 generateOptionsOnePointV 一致）
 */
export function generateOptionsOnePointV(range: [number, number]): { label: string; value: number }[] {
  const [min, max] = range;
  const options: { label: string; value: number }[] = [];
  for (let i = min; i <= max; i += 5) {
    options.push({ label: (i / 10).toFixed(1), value: i });
  }
  return options;
}

/**
 * 门限 0.1A/0.1V 单位 → 展示值，步长根据区间自动调整
 * 完全按小程序 deviceList.js 中 generateOptionsTenPerOnePointV 逻辑实现
 */
export function generateOptionsTenPerOnePointV(range: [number, number]): { label: string; value: number }[] {
  const [min, max] = range;
  const options: { label: string; value: number }[] = [];
  const cha = max - min;
  let step = 0;

  for (let i = min; i <= max; i += step) {
    if (cha > 0 && cha <= 100) {
      step = 5;
    } else if (cha > 100 && cha <= 1000) {
      step = 50;
    } else if (cha > 1000 && cha <= 5000) {
      step = 500;
    } else if (cha > 5000) {
      step = 1000;
    }

    options.push({ label: (i / 10).toFixed(1), value: i });

    // 对齐到整十/整百，避免出现 51.0、101.0 这种偏移
    if (step !== 0 && i % step !== 0) {
      if (i / step < 0) {
        i = 0;
      } else {
        i = Math.trunc(i / step) * step;
      }
    }
  }

  return options;
}

/**
 * 延时 100ms 单位 → 展示 S（0.1S），步长同小程序 generateTimeOptionsOnePointS
 */
export function generateTimeOptionsOnePointS(range: [number, number]): { label: string; value: number }[] {
  const [min, max] = range;
  const options: { label: string; value: number }[] = [];
  const cha = max - min;
  let step = 0;

  for (let i = min; i <= max; i += step) {
    if (cha > 0 && cha <= 100) {
      step = 5;
    } else if (cha > 100 && cha <= 1000) {
      step = 50;
    } else if (cha > 1000 && cha <= 5000) {
      step = 500;
    } else if (cha > 5000) {
      step = 1000;
    }

    options.push({ label: (i / 10).toFixed(1), value: i });

    if (step !== 0 && i % step !== 0) {
      if (i / step < 0) {
        i = 0;
      } else {
        i = Math.trunc(i / step) * step;
      }
    }
  }

  return options;
}

/**
 * 延时 100ms 单位 → 展示 S，步长 10s，对齐逻辑同小程序 generateTimeOptionsTenOrMore
 */
export function generateTimeOptionsTenOrMore(range: [number, number]): { label: string; value: number }[] {
  // 小程序里先把 100ms 单位转成秒，然后用 0.5 的步长起步，再转回去
  const rangeS = [range[0] / 10, range[1] / 10] as [number, number];
  const min = Math.ceil(rangeS[0] * 2) / 2;
  const max = Math.floor(rangeS[1] * 2) / 2;

  const options: { label: string; value: number }[] = [];
  let i = min;

  if (i < 10) {
    options.push({ label: String(i), value: Math.round(i * 10) });
    i = 10;
  }

  for (; i <= max; i += 10) {
    options.push({ label: String(i), value: Math.round(i * 10) });
  }

  return options;
}

/** 门限 mV，步长 50（与小程序 generateOptionsVolatageMV 一致） */
export function generateOptionsVoltageMV(range: [number, number]): { label: string; value: number }[] {
  const min = Math.ceil(range[0] / 50) * 50;
  const max = Math.floor(range[1] / 50) * 50;
  const options: { label: string; value: number }[] = [];
  for (let i = min; i <= max; i += 50) {
    options.push({ label: String(i), value: i });
  }
  return options;
}

/** 放电短路门限 0.1A 单位 → 展示 A（与小程序 generateSCDTOptions 一致） */
export function generateSCDTOptions(range: [number, number]): { label: string; value: number }[] {
  const options: { label: string; value: number }[] = [];
  for (let i = 100; i <= 1000; i += 100) {
    if (i >= range[0] && i <= range[1]) options.push({ label: (i / 10).toFixed(1), value: i });
  }
  for (let i = 1000; i <= 5000; i += 500) {
    if (i >= range[0] && i <= range[1]) options.push({ label: (i / 10).toFixed(1), value: i });
  }
  for (let i = 5000; i <= range[1]; i += 1000) {
    if (i >= range[0]) options.push({ label: (i / 10).toFixed(1), value: i });
  }
  return options;
}

/** 延时 10us 单位 → 展示 us，步长 100us（与小程序 generateTimeOptionsMicroseconds 一致） */
export function generateTimeOptionsMicroseconds(range: [number, number]): { label: string; value: number }[] {
  const min = range[0] * 10; // 转换为 us
  const max = range[1] * 10;
  const options: { label: string; value: number }[] = [];
  const step = 100; // us 步长

  for (let i = min; i <= max; i += step) {
    options.push({ label: String(i), value: Math.round(i / 10) });

    // 对齐到整百，避免出现 110, 210 这种偏移
    if (i % step !== 0) {
      if (i / step < 0) {
        i = 0;
      } else {
        i = Math.trunc(i / step) * step;
      }
    }
  }
  return options;
}

/**
 * 电芯容量 0.1Ah 单位 → 下拉选项（与小程序 generateCapacityOptions 一致）
 * 小程序 picker range 为 ["10.0", "20.0", ...]，选中值为该字符串；此处 value 用同格式便于一致
 */
export function generateCapacityOptions(range: [number, number]): { label: string; value: string }[] {
  const minAh = range[0] / 10;
  const maxAh = range[1] / 10;
  const options: { label: string; value: string }[] = [];
  for (let i = 10; i <= 100; i += 10) {
    if (i >= minAh && i <= maxAh) options.push({ label: i.toFixed(1), value: i.toFixed(1) });
  }
  for (let i = 200; i <= maxAh; i += 100) {
    if (i >= minAh) options.push({ label: i.toFixed(1), value: i.toFixed(1) });
  }
  return options;
}

/**
 * 温度 ℃ → 展示值，步长 5℃（与小程序 generateTemperatureOptions 一致）
 */
export function generateTemperatureOptions(range: [number, number]): { label: string; value: number }[] {
  const [min, max] = range;
  const options: { label: string; value: number }[] = [];
  const step = 5;

  // 对齐到 5 的倍数
  const startTemp = Math.ceil(min / step) * step;
  const endTemp = Math.floor(max / step) * step;

  for (let i = startTemp; i <= endTemp; i += step) {
    options.push({ label: String(i), value: i });
  }

  return options;
}
