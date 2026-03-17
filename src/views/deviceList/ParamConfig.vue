<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getBmsParamsReq, getThirdServerListReq, setBmsParamsReq } from "@/api/bms";
import { cell_mat_dict, getDictLabel } from "@/utils/dict";
import type { BmsParamsMap, BmsRangesMap, BmsThirdServerItem } from "@/api/bms/types";

defineOptions({ name: "DeviceParamConfig" });

const route = useRoute();
const router = useRouter();

const sectionList = [
  "BT码设置",
  "三方后台配置",
  "基础参数",
  "电芯过压保护",
  "电芯欠压保护",
  "总压过压保护",
  "总压欠压保护",
  "I级放电过流",
  "II级放电过流",
  "放电短路保护",
  "I级充电过流",
  "II级充电过流",
  "放电电芯高温保护",
  "放电电芯低温保护",
  "充电电芯高温保护",
  "充电电芯低温保护",
  "mos高温保护",
  "I级(软件)电芯过压保护"
] as const;

type SectionName = (typeof sectionList)[number];

const activeSection = ref<SectionName>(sectionList[0]);

const bmsId = computed(() => String(route.query.bmsId ?? "").trim());

const loading = ref(false);
const params = ref<BmsParamsMap>({});
const ranges = ref<BmsRangesMap>({});

const thirdSrvList = ref<BmsThirdServerItem[]>([]);
const selectedThirdSrvValue = ref<string>("");

const btCodeInput = ref<string>("");

const basicForm = reactive({
  cell_mat: 1 as 1 | 2,
  cell_cnt: 0,
  designed_capD: "" // Ah（展示/输入）
});

const designedCapHint = computed(() => {
  const v = Number(basicForm.designed_capD);
  if (!Number.isFinite(v)) return "-";
  return `${Math.round(v * 10)} (0.1Ah)`;
});

async function handleQuery() {
  if (!bmsId.value) {
    ElMessage.warning("请先从设备列表选择设备，或在地址栏传入 bmsId");
    return;
  }

  loading.value = true;
  try {
    const [paramRes, srvRes] = await Promise.all([
      getBmsParamsReq(bmsId.value),
      getThirdServerListReq()
    ]);

    if (paramRes.errno !== 0 || !paramRes.data) {
      ElMessage.error(paramRes.errmsg ?? "获取参数失败");
      return;
    }

    params.value = (paramRes.data.bmsParams ?? {}) as BmsParamsMap;
    ranges.value = (paramRes.data.ranges ?? {}) as BmsRangesMap;

    // BT码：接口字段可能是 btCode / bt_code / btcode，这里优先从已知字段取
    btCodeInput.value =
      String(
        (params.value["btCode"] ??
          params.value["bt_code"] ??
          params.value["btcode"] ??
          "") as string
      ) || "";

    // 基础参数：cell_mat / cell_cnt / designed_cap
    const cm = Number(params.value["cell_mat"] ?? 1);
    basicForm.cell_mat = (cm === 2 ? 2 : 1) as 1 | 2;
    basicForm.cell_cnt = Number(params.value["cell_cnt"] ?? 0);
    const designedCap = Number(params.value["designed_cap"] ?? 0); // 0.1Ah
    basicForm.designed_capD = designedCap ? (designedCap / 10).toFixed(1) : "";

    if (srvRes.errno === 0 && srvRes.data?.tsrv_list) {
      thirdSrvList.value = srvRes.data.tsrv_list;
    }
    selectedThirdSrvValue.value =
      String(params.value["t_server"] ?? params.value["tServer"] ?? "") || "";
  } catch {
    ElMessage.error("网络错误，请重试");
  } finally {
    loading.value = false;
  }
}

function handleBack() {
  router.back();
}

async function handleWriteBtCode() {
  if (!bmsId.value) return;
  const btcode = btCodeInput.value.trim();
  if (!btcode) {
    ElMessage.warning("请输入 BT 码");
    return;
  }
  loading.value = true;
  try {
    const res = await setBmsParamsReq("/bms/api/set/params/btCode", bmsId.value, { btcode });
    if (res.errno === 0) {
      ElMessage.success("BT码写入成功");
      await handleQuery();
    } else {
      ElMessage.error(res.errmsg ?? "BT码写入失败");
    }
  } finally {
    loading.value = false;
  }
}

async function handleWriteThirdServer() {
  if (!bmsId.value) return;
  if (!selectedThirdSrvValue.value) {
    ElMessage.warning("请选择服务器地址");
    return;
  }
  loading.value = true;
  try {
    const res = await setBmsParamsReq("/bms/api/set/params/server", bmsId.value, {
      ctsrv: selectedThirdSrvValue.value
    });
    if (res.errno === 0) {
      ElMessage.success("三方后台地址写入成功");
      await handleQuery();
    } else {
      ElMessage.error(res.errmsg ?? "写入失败");
    }
  } finally {
    loading.value = false;
  }
}

async function handleWriteBasicParams() {
  if (!bmsId.value) return;
  const cM = basicForm.cell_mat;
  const cN = Number(basicForm.cell_cnt);
  const capAh = Number(basicForm.designed_capD);
  if (!Number.isFinite(cN) || cN <= 0) {
    ElMessage.warning("请输入正确的电芯串数");
    return;
  }
  if (!Number.isFinite(capAh) || capAh <= 0) {
    ElMessage.warning("请输入正确的电芯容量(Ah)");
    return;
  }
  const capacity = Math.round(capAh * 10); // 0.1Ah

  // 可选：根据 ranges 做基本校验（存在才校验）
  const r = ranges.value;
  const cntRange = r["cell_cnt"];
  if (cntRange && (cN < cntRange[0] || cN > cntRange[1])) {
    ElMessage.warning(`电芯串数范围 ${cntRange[0]}~${cntRange[1]}`);
    return;
  }
  const capRange = r["designed_cap"];
  if (capRange && (capacity < capRange[0] || capacity > capRange[1])) {
    ElMessage.warning(`电芯容量范围 ${(capRange[0] / 10).toFixed(1)}~${(capRange[1] / 10).toFixed(1)}Ah`);
    return;
  }

  loading.value = true;
  try {
    const res = await setBmsParamsReq("/bms/api/set/params/cMcN", bmsId.value, {
      cM,
      cN,
      capacity
    });
    if (res.errno === 0) {
      ElMessage.success("基础参数写入成功");
      await handleQuery();
    } else {
      ElMessage.error(res.errmsg ?? "写入失败");
    }
  } finally {
    loading.value = false;
  }
}

watch(
  () => bmsId.value,
  val => {
    if (val) handleQuery();
  },
  { immediate: true }
);

onMounted(() => {
  if (bmsId.value) handleQuery();
});
</script>

<template>
  <div class="bms-param-config">
    <div v-loading="loading" class="bms-card">
      <div class="bms-card__head">
        <div class="bms-card__title">参数配置</div>
        <div class="bms-card__sub">
          <span>设备编码：</span>
          <span class="mono">{{ bmsId || "-" }}</span>
        </div>
        <div class="bms-card__actions">
          <el-button type="primary" @click="handleQuery">刷新</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>

      <div class="bms-body">
        <div class="bms-left">
          <el-scrollbar height="calc(100vh - 260px)">
            <el-menu
              :default-active="activeSection"
              class="bms-menu"
              @select="activeSection = $event as SectionName"
            >
              <el-menu-item
                v-for="name in sectionList"
                :key="name"
                :index="name"
              >
                {{ name }}
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </div>

        <div class="bms-right">
          <el-card class="bms-section-card" shadow="never">
            <template #header>
              <div class="section-title">{{ activeSection }}</div>
            </template>

            <div class="section-content">
              <template v-if="activeSection === 'BT码设置'">
                <el-form label-width="110px">
                  <el-form-item label="BT码">
                    <el-input v-model="btCodeInput" placeholder="请输入BT码" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleWriteBtCode">写入</el-button>
                  </el-form-item>
                </el-form>
              </template>

              <template v-else-if="activeSection === '三方后台配置'">
                <el-form label-width="110px">
                  <el-form-item label="服务器地址">
                    <el-select v-model="selectedThirdSrvValue" filterable placeholder="请选择">
                      <el-option
                        v-for="it in thirdSrvList"
                        :key="it.value"
                        :label="it.title"
                        :value="it.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleWriteThirdServer">写入</el-button>
                  </el-form-item>
                </el-form>
              </template>

              <template v-else-if="activeSection === '基础参数'">
                <el-form label-width="110px">
                  <el-form-item label="电芯材料">
                    <el-select v-model="basicForm.cell_mat" style="width: 240px">
                      <el-option :label="getDictLabel(cell_mat_dict, 1)" :value="1" />
                      <el-option :label="getDictLabel(cell_mat_dict, 2)" :value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="电芯串数">
                    <el-input-number v-model="basicForm.cell_cnt" :min="1" :max="999" controls-position="right" />
                  </el-form-item>
                  <el-form-item label="电芯容量(Ah)">
                    <div class="row">
                      <el-input v-model="basicForm.designed_capD" style="width: 240px" placeholder="例如 20.0" />
                      <span class="muted">0.1Ah：{{ designedCapHint }}</span>
                    </div>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleWriteBasicParams">写入</el-button>
                  </el-form-item>
                </el-form>
              </template>

              <template v-else>
                <!-- <div class="hint">
                  该分组写入接口已在小程序存在（`/bms/api/set/params/...`），
                  我可以按同样方式继续把此分组字段逐项补齐并接入写入/更新。
                </div> -->
              </template>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bms-param-config {
  padding: 10px;
  min-height: 100%;
  background: var(--bms-bg);
}

.bms-card {
  background: var(--bms-bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--bms-border);
}

.bms-card__head {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 10px 16px;
  align-items: center;
  margin-bottom: 16px;
}

.bms-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bms-text);
}

.bms-card__sub {
  grid-column: 1 / 2;
  color: var(--bms-text-secondary);
  font-size: 13px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}

.bms-card__actions {
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.bms-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  min-height: calc(100vh - 260px);
}

.bms-left {
  border: 1px solid var(--bms-border);
  border-radius: 10px;
  background: var(--bms-bg-input);
  overflow: hidden;
}

.bms-right {
  min-width: 0;
}

.bms-param-config :deep(.bms-menu) {
  background: transparent;
  border-right: none;
  --el-menu-text-color: var(--bms-text-secondary);
  --el-menu-active-color: var(--bms-primary);
  --el-menu-hover-bg-color: rgba(88, 166, 255, 0.12);
  --el-menu-bg-color: transparent;
}

.bms-param-config :deep(.el-menu-item.is-active) {
  background: rgba(88, 166, 255, 0.16);
}

.bms-section-card {
  background: var(--bms-bg-card);
  border: 1px solid var(--bms-border);
}

.bms-param-config :deep(.el-card__header) {
  border-bottom: 1px solid var(--bms-border);
  color: var(--bms-text);
}

.section-title {
  font-weight: 600;
  color: var(--bms-text);
}

.hint {
  color: var(--bms-text-secondary);
  line-height: 1.8;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.muted {
  color: var(--bms-text-secondary);
  font-size: 12px;
}
</style>
