<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
import type { EChartsOption, GeoComponentOption } from "echarts";
import echarts from "@/plugins/echarts";
import { registerMap, use } from "echarts/core";
import { LinesChart, EffectScatterChart, ScatterChart, MapChart } from "echarts/charts";
import { TooltipComponent, VisualMapComponent, GeoComponent } from "echarts/components";

// 注册所需组件
use([LinesChart, EffectScatterChart, ScatterChart, MapChart, TooltipComponent, VisualMapComponent, GeoComponent]);

defineOptions({
  name: "BmsDeviceMap"
});

interface DeviceRegionItem {
  name: string;
  value: number;
}

interface MapFeatureProperties {
  name?: string;
  centroid?: [number, number];
  center?: [number, number];
}

interface MapFeature {
  geometry: {
    type: string;
    coordinates?: unknown;
  };
  properties: MapFeatureProperties;
}

interface MapGeoJSON {
  features: MapFeature[];
}

type EChartsInstance = ReturnType<typeof echarts.init>;
type RegisterMapInput = Parameters<typeof registerMap>[1];

const mapChartInstance = shallowRef<EChartsInstance | null>(null);

const deviceRegionList: DeviceRegionItem[] = [
  { name: "北京市", value: 120 },
  { name: "上海市", value: 98 },
  { name: "广东省", value: 260 },
  { name: "浙江省", value: 180 },
  { name: "江苏省", value: 190 },
  { name: "四川省", value: 140 },
  { name: "湖北省", value: 110 },
  { name: "山东省", value: 170 }
];

function buildDeviceMapOption(
  regionCode: string,
  list: DeviceRegionItem[],
  geoJson: MapGeoJSON
): EChartsOption {
  // 🌟 大屏科技感核心配色方案
  const neonCyan = "#00eaff"; // 极光青（主线/发光）
  const neonBlue = "#0a58fa"; // 深邃电光蓝
  const neonGold = "#ffb200"; // 琥珀金（核心点对比色）

  const accentBorder = "rgba(0, 234, 255, 0.8)";
  const glowStrong = "rgba(0, 234, 255, 0.6)";

  const totalDeviceCount = list.reduce((sum, item) => sum + item.value, 0);

  function normalizeProvinceName(name: string) {
    return (name ?? "")
      .replace(/特别行政区$/g, "")
      .replace(/壮族自治区$|回族自治区$|维吾尔自治区$|自治区$/g, "")
      .replace(/省$/g, "")
      .replace(/市$/g, "");
  }

  function formatProvinceLabel(name: string) {
    const n = normalizeProvinceName(name);
    if (!n) return "";
    if (["内蒙古", "黑龙江", "广西", "宁夏", "新疆", "西藏"].includes(n)) return n.slice(0, 2);
    return n.length <= 2 ? n : n.slice(0, 2);
  }

  const regionLabelOffsets: Record<string, [number, number]> = {
    "广东省": [-6, -4],
    "河北省": [0, 38],
    "河北": [0, 38],
    "香港特别行政区": [22, 8],
    "澳门特别行政区": [10, 18]
  };

  function clamp(num: number, min: number, max: number) {
    return Math.min(max, Math.max(min, num));
  }

  // 🌟 侧壁颜色：从顶部的电光蓝过渡到底部的深黑蓝，增强科幻金属质感
  function getSideWallColor(layerIndex: number, totalLayers: number) {
    const t = clamp(layerIndex / Math.max(1, totalLayers - 1), 0, 1);
    const start = { r: 0, g: 60, b: 140 };
    const end = { r: 1, g: 9, b: 21 };
    const r = Math.round(start.r + (end.r - start.r) * t);
    const g = Math.round(start.g + (end.g - start.g) * t);
    const b = Math.round(start.b + (end.b - start.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const centerMap: Record<string, [number, number]> = {};
  geoJson.features.forEach(feature => {
    const props = feature.properties;
    const point = props.centroid ?? props.center;
    if (props.name && point) {
      centerMap[props.name] = point;
    }
  });

  const scatterData = list
    .map(item => {
      const center = centerMap[item.name];
      if (!center) return null;
      return {
        name: item.name,
        value: [center[0], center[1], item.value]
      };
    })
    .filter((item): item is { name: string; value: [number, number, number] } => item !== null);

  const shenzhenCoord: [number, number] = [114.0579, 22.5431];
  const topScatter = [...scatterData].sort((a, b) => b.value[2] - a.value[2]).slice(0, 4);
  const flyLines = topScatter.map(item => ({
    coords: [shenzhenCoord, [item.value[0], item.value[1]]],
    value: item.value[2]
  }));

  const valueMap = new Map<string, number>(list.map(i => [i.name, i.value]));
  const mapData = geoJson.features
    .map(f => f.properties.name)
    .filter((name): name is string => Boolean(name && name.trim()))
    .map(name => {
      const value = valueMap.get(name);
      const offset = regionLabelOffsets[name] ?? regionLabelOffsets[normalizeProvinceName(name)] ?? undefined;
      return {
        name,
        ...(typeof value === "number" ? { value } : {}),
        ...(offset ? { label: { offset } } : {})
      };
    });

  const mapZoom = 1.06;
  const layoutSize = "95%";
  const baseCenterY = 42;
  const layerCount = 10; // 增加到10层，厚度更饱满
  const layerOffset = 0.8;

  const geoLayers: GeoComponentOption[] = [];

  // 1. 顶层：发光扫描面
  geoLayers.push({
    map: regionCode,
    roam: false,
    zoom: mapZoom,
    layoutCenter: ["50%", `${baseCenterY}%`],
    layoutSize: layoutSize,
    label: { show: false },
    itemStyle: {
      borderColor: neonCyan,
      borderWidth: 1.5,
      areaColor: {
        type: "radial",
        x: 0.5, y: 0.5, r: 0.8,
        colorStops: [
          { offset: 0, color: "rgba(0, 30, 80, 0.8)" },
          { offset: 1, color: "rgba(0, 234, 255, 0.15)" } // 边缘透出青色背光
        ]
      },
      shadowColor: glowStrong,
      shadowBlur: 15,
    },
    z: layerCount + 1
  });

  // 2. 侧壁：深邃装甲感
  for (let i = 1; i < layerCount; i++) {
    geoLayers.push({
      map: regionCode,
      roam: false,
      zoom: mapZoom,
      layoutCenter: ["50%", `${baseCenterY + i * layerOffset}%`],
      layoutSize: layoutSize,
      itemStyle: {
        areaColor: getSideWallColor(i, layerCount),
        borderColor: getSideWallColor(i, layerCount),
        borderWidth: 1
      },
      silent: true,
      z: layerCount - i
    });
  }

  // 3. 底部阴影
  geoLayers.push({
    map: regionCode,
    roam: false,
    zoom: mapZoom,
    layoutCenter: ["50%", `${baseCenterY + layerCount * layerOffset}%`],
    layoutSize: layoutSize,
    itemStyle: {
      areaColor: "#000",
      borderColor: "#000",
      shadowColor: "rgba(0, 234, 255, 0.2)", // 底部透出微弱的青光
      shadowBlur: 40,
      shadowOffsetY: 10
    },
    silent: true,
    z: 0
  });

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(4, 18, 40, 0.85)", // 玻璃拟物感
      borderColor: neonCyan,
      borderWidth: 1,
      padding: [10, 15],
      textStyle: { color: "#fff", fontSize: 13, fontFamily: "monospace" },
      formatter(params) {
        const p = params as { name: string; data?: { value: [number, number, number] } };
        if (!p.data) return p.name;
        const count = p.data.value[2];
        const percent = totalDeviceCount > 0 ? ((count / totalDeviceCount) * 100).toFixed(1) : "0.0";
        // HUD 风格提示框
        return `
          <div style="border-bottom: 1px solid rgba(0,234,255,0.3); padding-bottom: 5px; margin-bottom: 5px; font-weight: bold; color: ${neonCyan};">
            [ ${p.name} ] NODE_STATUS
          </div>
          <div><span style="color:#8ab4f8;">联机终端：</span><span style="color:#fff; font-size: 16px; font-weight: bold;">${count}</span> Unit</div>
          <div><span style="color:#8ab4f8;">网络占比：</span>${percent}%</div>
        `;
      }
    },
    visualMap: {
      show: true,
      left: 30,
      bottom: 30,
      text: ["HIGH", "LOW"],
      textStyle: { color: neonCyan, fontFamily: "monospace", fontSize: 10 },
      itemWidth: 12,
      itemHeight: 80,
      pieces: [
        { gte: 200 }, { gte: 100, lt: 200 }, { gte: 50, lt: 100 }, { lt: 50 }
      ],
      inRange: {
        color: [
          "rgba(0, 40, 100, 0.8)", // 最低：暗蓝
          "rgba(0, 100, 200, 0.8)",
          "rgba(0, 180, 255, 0.9)",
          "rgba(0, 234, 255, 1)"   // 最高：亮青
        ]
      }
    },
    geo: geoLayers,
    series: [
      {
        name: "设备数量",
        type: "map",
        map: regionCode,
        roam: false,
        zoom: mapZoom,
        layoutCenter: ["50%", `${baseCenterY}%`],
        layoutSize: layoutSize,
        label: {
          show: true,
          // 🌟 HUD 风格的标签格式：加括号、等宽字体
          formatter: params => `{p|[ ${formatProvinceLabel(params.name as string)} ]}`,
          rich: {
            p: {
              color: "#a4dcf3",
              fontSize: 11,
              fontFamily: "monospace",
              fontWeight: 600,
              backgroundColor: "rgba(2, 12, 28, 0.6)",
              borderColor: "rgba(0, 234, 255, 0.3)",
              borderWidth: 1,
              borderRadius: 2, // 赛博风通常直角或小圆角
              padding: [3, 5],
              shadowColor: neonCyan,
              shadowBlur: 2
            }
          }
        },
        labelLayout: { hideOverlap: false, moveOverlap: "shiftY" },
        itemStyle: {
          areaColor: "transparent",
          borderColor: accentBorder,
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(0, 234, 255, 0.2)",
            borderColor: "#fff",
            borderWidth: 2,
            shadowColor: neonCyan,
            shadowBlur: 20,
          },
          label: { show: true }
        },
        data: mapData,
        z: layerCount + 2
      },
      // 🌟 科技感飞线：流星拖尾效果
      {
        name: "数据传输",
        type: "lines",
        coordinateSystem: "geo",
        geoIndex: 0,
        z: layerCount + 5,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.6, // 拖尾拉长
          color: neonCyan,
          symbol: "arrow", // 箭头更具方向感
          symbolSize: 5
        },
        lineStyle: {
          color: neonBlue,
          width: 1.5,
          opacity: 0.4,
          curveness: 0.3
        },
        data: flyLines
      },
      // 🌟 核心枢纽：使用醒目的金/橙色对比，突出中心
      {
        name: "主服务器",
        type: "effectScatter",
        coordinateSystem: "geo",
        geoIndex: 0,
        z: layerCount + 6,
        symbolSize: 12,
        rippleEffect: { scale: 6, brushType: "fill" },
        itemStyle: {
          color: neonGold, // 对比色
          shadowBlur: 20,
          shadowColor: neonGold
        },
        data: [{ name: "深圳 (HUB)", value: [shenzhenCoord[0], shenzhenCoord[1], 1] }]
      },
      // 🌟 普通节点：呼吸灯点位
      {
        name: "终端节点",
        type: "effectScatter",
        coordinateSystem: "geo",
        geoIndex: 0,
        data: scatterData,
        symbolSize: 6,
        rippleEffect: { scale: 4, brushType: "stroke" },
        itemStyle: {
          color: neonCyan,
          shadowBlur: 10,
          shadowColor: neonCyan
        },
        label: { show: false },
        z: layerCount + 4
      }
    ]
  };

  return option;
}

const handleResize = () => {
  if (mapChartInstance.value) {
    try {
      mapChartInstance.value.resize();
    } catch (error) {
      console.warn("地图 resize 失败", error);
    }
  }
};

async function initDeviceMap() {
  const el = document.getElementById("bms-device-map");
  if (!el) return;

  if (mapChartInstance.value) {
    mapChartInstance.value.dispose();
    mapChartInstance.value = null;
  }

  const chart = echarts.init(el);
  mapChartInstance.value = chart;

  const regionCode = "china_3d_pro";

  try {
    type LngLat = [number, number];

    const isLngLat = (val: unknown): val is LngLat => {
      return (
        Array.isArray(val) && val.length === 2 &&
        typeof val[0] === "number" && typeof val[1] === "number" &&
        Number.isFinite(val[0]) && Number.isFinite(val[1])
      );
    };

    const transformCoordinates = (coords: unknown, transform: (pt: LngLat) => LngLat): unknown => {
      if (isLngLat(coords)) return transform(coords);
      if (Array.isArray(coords)) return coords.map(c => transformCoordinates(c, transform));
      return coords;
    };

    const response = await fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json");
    const geoJson = (await response.json()) as MapGeoJSON;

    geoJson.features = geoJson.features.filter(feature => {
      const name = feature.properties.name;
      const geometryType = feature.geometry.type;
      if (name === "南海诸岛") return false;
      if (!name || name.trim() === "") return false;
      if (geometryType === "LineString" || geometryType === "MultiLineString") return false;
      return true;
    });

    const cleanProvinces = ["海南省", "广东省", "台湾省", "福建省", "浙江省", "广西壮族自治区"];
    geoJson.features.forEach(feature => {
      const name = feature.properties.name;
      if (name && cleanProvinces.includes(name) && feature.geometry.type === "MultiPolygon") {
        const geometry = feature.geometry as { type: "MultiPolygon"; coordinates: number[][][][]; };
        let maxPoints = 0;
        let mainLand: number[][][] | null = null;
        geometry.coordinates.forEach(polygon => {
          const pointsCount = polygon?.[0]?.length ?? 0;
          if (pointsCount > maxPoints) {
            maxPoints = pointsCount;
            mainLand = polygon;
          }
        });
        if (mainLand) geometry.coordinates = [mainLand];
      }
    });

    const hkMoTransforms: Record<string, { scale: number; translate: LngLat }> = {
      "香港特别行政区": { scale: 3.2, translate: [1.2, -0.2] },
      "澳门特别行政区": { scale: 4.2, translate: [0.8, -0.5] }
    };

    geoJson.features.forEach(feature => {
      const name = feature.properties.name;
      if (!name) return;
      const t = hkMoTransforms[name];
      if (!t) return;
      const anchor = feature.properties.centroid ?? feature.properties.center;
      if (!anchor) return;
      const [cx, cy] = anchor;

      feature.geometry.coordinates = transformCoordinates(
        feature.geometry.coordinates,
        ([x, y]) => [(x - cx) * t.scale + cx + t.translate[0], (y - cy) * t.scale + cy + t.translate[1]]
      );
    });

    registerMap(regionCode, geoJson as unknown as RegisterMapInput);

    const option = buildDeviceMapOption(regionCode, deviceRegionList, geoJson);

    if (chart) {
      chart.setOption(option, { notMerge: true });
    }
  } catch (error) {
    console.error("设备分布地图加载失败", error);
  }
}

onMounted(() => {
  void initDeviceMap();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (mapChartInstance.value) {
    mapChartInstance.value.dispose();
    mapChartInstance.value = null;
  }
});
</script>

<template>
  <div class="map-wrapper">
    <div id="bms-device-map" class="map-container" />
    <div class="hud-corner top-left"></div>
    <div class="hud-corner top-right"></div>
    <div class="hud-corner bottom-left"></div>
    <div class="hud-corner bottom-right"></div>
  </div>
</template>

<style scoped lang="scss">
.map-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  background-color: #010915; // 深空暗色背景，凸显发光元素
  padding: 10px; // 给角落装饰留出空间
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  /* 移除原有的强发光渐变，改用深邃的径向渐变聚焦地图 */
  background: radial-gradient(circle at 50% 50%, rgba(10, 88, 250, 0.1) 0%, rgba(1, 9, 21, 1) 70%);
  position: relative;
  overflow: hidden;

  /* 科技感坐标网格底纹 */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0, 234, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 234, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: center center;
    z-index: 0;
    pointer-events: none;
  }

  /* 顶部扫描光效 */
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(0, 234, 255, 0.05), transparent);
    animation: scanLine 8s linear infinite;
    pointer-events: none;
    z-index: 1;
  }
}

/* 🌟 HUD 装饰角 CSS */
.hud-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00eaff;
  pointer-events: none;
  z-index: 10;
  opacity: 0.8;
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.5);

  &.top-left {
    top: 10px; left: 10px;
    border-right: none; border-bottom: none;
  }
  &.top-right {
    top: 10px; right: 10px;
    border-left: none; border-bottom: none;
  }
  &.bottom-left {
    bottom: 10px; left: 10px;
    border-right: none; border-top: none;
  }
  &.bottom-right {
    bottom: 10px; right: 10px;
    border-left: none; border-top: none;
  }
}

@keyframes scanLine {
  0% { transform: translateY(0); }
  100% { transform: translateY(200%); }
}
</style>
