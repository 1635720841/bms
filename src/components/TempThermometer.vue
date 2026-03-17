<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: "TempThermometer" });

interface Props {
  temperature: number;
  state?: 'normal' | 'warn' | 'danger' | 'low';
  /** 温度计最大刻度；不传则自动根据温度扩展（≥100 时按 25 递增） */
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  state: undefined,
  max: undefined
});

// 根据温度值自动判断状态
const computedState = computed(() => {
  // 如果用户手动指定了 state，优先使用
  if (props.state) {
    return props.state;
  }

  // 根据温度值自动判断
  const temp = props.temperature;
  if (temp < 25) {
    return 'low'; // 低温：0-25，蓝色
  } else if (temp < 40) {
    return 'normal'; // 正常：25-40，绿色
  } else if (temp < 50) {
    return 'warn'; // 警告：40-50，黄色
  } else {
    return 'danger'; // 危险：50-100，红色
  }
});

function roundUpToStep(value: number, step: number) {
  if (!Number.isFinite(value) || step <= 0) return 100;
  return Math.ceil(value / step) * step;
}

const scaleMax = computed(() => {
  if (typeof props.max === 'number' && Number.isFinite(props.max) && props.max > 0) {
    return props.max;
  }
  // 默认量程 0~100；当温度超过 100 时自动扩展刻度
  const t = props.temperature;
  return t > 100 ? Math.max(125, roundUpToStep(t, 25)) : 100;
});

const rulerTicks = computed(() => {
  // 5 个刻度：0、1/4、1/2、3/4、max
  const max = scaleMax.value;
  const step = max / 4;
  return [0, step, step * 2, step * 3, max].map(v => Math.round(v));
});

// 计算横向宽度百分比 (量程 0 ~ 100)
function getTempPercent(t: number) {
  const min = 0;
  const max = scaleMax.value;
  const val = Math.max(min, Math.min(max, t));
  const pct = ((val - min) / (max - min)) * 100;
  return pct + '%';
}
</script>

<template>
  <div class="t-center-wrapper" :class="computedState">
    <div class="t-outer-tube">
      <div class="t-body">
        <div class="t-bulb"></div>
        <div class="t-track">
          <div class="t-fill" :style="{ width: getTempPercent(temperature) }"></div>
        </div>
      </div>
    </div>

    <div class="t-ruler-values">
      <span v-for="t in rulerTicks" :key="t">{{ t }}°</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 中间包装器 (包含条和刻度字) */
.t-center-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
}

/* 外层透明管状容器 - 凹凸轮廓，从圆形到矩形的过渡 */
.t-outer-tube {
  position: relative;
  /* 左侧（液泡部分）padding更大，右侧（身体部分）padding更小 */
  /* 创建从液泡（宽）到身体（窄）的过渡 */
  /* 增加内边距，让内部温度计离外壳更远 */
  padding: 5px 5px 5px 7px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* 左侧大圆角（液泡部分，约18px），右侧小圆角（身体部分，约6px） */
  /* 使用椭圆圆角创建从圆形到矩形的平滑过渡 */
  border-radius: 18px 6px 6px 18px / 18px 6px 6px 18px;
  box-shadow:
    /* 外凸效果 - 上方和左侧高光 */
    inset -2px -2px 4px rgba(255, 255, 255, 0.15),
    inset 2px 2px 4px rgba(0, 0, 0, 0.3),
    /* 内凹效果 - 下方和右侧阴影 */
    inset 0 -1px 2px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    /* 外部阴影增强立体感 */
    0 2px 6px rgba(0, 0, 0, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  width: 100%;
  overflow: visible;

  /* 添加顶部高光条 - 跟随形状 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 100%
    );
    border-radius: 18px 6px 6px 18px / 18px 6px 0 0;
    pointer-events: none;
  }

  /* 添加底部阴影条 - 跟随形状 */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 100%
    );
    border-radius: 0 0 6px 18px / 0 0 6px 18px;
    pointer-events: none;
  }
}

/* 温度计主体 (液泡+轨道) */
.t-body {
  display: flex;
  align-items: center;
  height: 18px; /* 固定高度 */
  position: relative;
}

.t-bulb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: currentColor;
  /* 凹凸效果 - 内凹和外凸 */
  box-shadow:
    /* 内凹效果 - 上方和左侧阴影 */
    inset 2px 2px 6px rgba(0, 0, 0, 0.5),
    inset -1px -1px 3px rgba(255, 255, 255, 0.2),
    /* 外凸效果 - 下方和右侧高光 */
    inset -2px -2px 4px rgba(255, 255, 255, 0.15),
    /* 外部阴影增强立体感 */
    0 2px 6px rgba(0, 0, 0, 0.4),
    0 1px 3px rgba(0, 0, 0, 0.3),
    /* 发光效果 */
    0 0 12px currentColor;
  z-index: 3;
  flex-shrink: 0;
  position: relative;
  margin-left: -2px;
  margin-top: -1px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  /* 添加渐变背景增强凹凸感 */
  background-image:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, currentColor 0%, currentColor 100%);

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.9);
    border-radius: 50%;
    box-shadow:
      0 0 4px rgba(255,255,255,0.6),
      inset 0 0 2px rgba(255,255,255,0.8);
  }
}

.t-track {
  flex: 1;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.08); /* 轨道底色，更透明 */
  border-radius: 0 6px 6px 0;
  margin-left: -6px;
  z-index: 1;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-left: none;
  /* 凹凸效果 - 内凹轨道 */
  box-shadow:
    /* 内凹效果 - 上方和下方阴影 */
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 -1px 2px rgba(0, 0, 0, 0.3),
    /* 内凹高光 - 中间高光条 */
    inset 0 0 1px rgba(255, 255, 255, 0.1),
    /* 外部阴影 */
    0 1px 2px rgba(0, 0, 0, 0.2);
  /* 添加渐变背景增强内凹感 */
  background-image:
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(0, 0, 0, 0.15) 100%
    );

  /* === 核心：CSS绘制刻度线（只显示下半部分） === */
  /* 1) 先绘制一层底部刻度（在填充条下方） */
  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%; /* 只显示下半部分 */
    background-image: repeating-linear-gradient(
      to right,
      rgba(255, 255, 255, 0.3) 0px,
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px,
      transparent 25%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* 2) 再绘制一层顶部刻度（在填充条上方），确保高温/高亮色也能看清刻度 */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background-image: repeating-linear-gradient(
      to right,
      rgba(255, 255, 255, 0.55) 0px,
      rgba(255, 255, 255, 0.55) 1px,
      transparent 1px,
      transparent 25%
    );
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: overlay;
    opacity: 0.9;
  }
}

.t-fill {
  position: relative;
  height: 100%;
  background: currentColor;
  border-radius: 0 6px 6px 0;
  transition: width 0.5s ease;
  z-index: 1;
  /* 凹凸效果 - 液体在凹槽中的立体感 */
  box-shadow:
    /* 内凹效果 - 上方和左侧阴影 */
    inset 0 1px 3px rgba(0, 0, 0, 0.4),
    inset -1px 0 2px rgba(0, 0, 0, 0.3),
    /* 外凸效果 - 下方和右侧高光 */
    inset 0 -1px 2px rgba(255, 255, 255, 0.2),
    /* 外部阴影和发光 */
    2px 0 4px rgba(0,0,0,0.3),
    0 0 8px currentColor,
    0 0 4px rgba(255, 255, 255, 0.1);
  /* 让填充条半透明一点点，这样能隐约看到底下的刻度线（可选） */
  opacity: 0.92;
  /* 添加渐变背景增强液体感 */
  background-image:
    linear-gradient(to bottom,
      rgba(255, 255, 255, 0.2) 0%,
      currentColor 30%,
      currentColor 70%,
      rgba(0, 0, 0, 0.2) 100%
    );
  /* 添加液体表面高光 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 100%
    );
    border-radius: 0 6px 0 0;
    pointer-events: none;
  }
}

/* 刻度数值行 */
.t-ruler-values {
  display: flex;
  justify-content: space-between;
  padding-left: 8px; /* 稍微避开液泡的位置 */
  padding-right: 0;
  margin-top: -2px;

  span {
    font-size: 10px;
    color: #e6edf3;
    font-family: Arial, sans-serif;
    /* 让数字居中对齐刻度线 */
    width: 12px;
    text-align: center;
    /* 第一个和最后一个数字需要特殊对齐，防止超出 */
    &:first-child { text-align: left; }
    &:last-child { text-align: right; }
  }
}

/* === 状态颜色 (currentColor 自动应用到 bulb 和 fill) === */
.t-center-wrapper.normal {
  color: #00e676;
  .t-fill {
    box-shadow:
      0 0 6px rgba(0, 230, 118, 0.3),
      inset 0 1px 3px rgba(0, 0, 0, 0.4),
      inset -1px 0 2px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.2),
      2px 0 4px rgba(0,0,0,0.3),
      0 0 8px currentColor,
      0 0 4px rgba(255, 255, 255, 0.1);
  }
}
.t-center-wrapper.warn {
  color: #ffb300;
  .t-fill {
    box-shadow:
      0 0 6px rgba(255, 179, 0, 0.3),
      inset 0 1px 3px rgba(0, 0, 0, 0.4),
      inset -1px 0 2px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.2),
      2px 0 4px rgba(0,0,0,0.3),
      0 0 8px currentColor,
      0 0 4px rgba(255, 255, 255, 0.1);
  }
}
.t-center-wrapper.danger {
  color: #ff5252;
  .t-fill {
    box-shadow:
      0 0 8px rgba(255, 82, 82, 0.5),
      inset 0 1px 3px rgba(0, 0, 0, 0.4),
      inset -1px 0 2px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.2),
      2px 0 4px rgba(0,0,0,0.3),
      0 0 8px currentColor,
      0 0 4px rgba(255, 255, 255, 0.1);
  }
}
.t-center-wrapper.low {
  color: #00bcd4;
  .t-fill {
    box-shadow:
      0 0 6px rgba(0, 188, 212, 0.3),
      inset 0 1px 3px rgba(0, 0, 0, 0.4),
      inset -1px 0 2px rgba(0, 0, 0, 0.3),
      inset 0 -1px 2px rgba(255, 255, 255, 0.2),
      2px 0 4px rgba(0,0,0,0.3),
      0 0 8px currentColor,
      0 0 4px rgba(255, 255, 255, 0.1);
  }
}
</style>

