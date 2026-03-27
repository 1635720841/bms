<template>
  <div class="bocdisc-bms-list-dialog">
    <div class="search-row" style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px">
      <el-input v-model="searchBmsId" class="search-bms" clearable placeholder="输入设备ID" style="width: 200px" />

      <DateRangePicker v-model="timeRange" :start-placeholder="'开始时间'" :end-placeholder="'结束时间'" :clearable="true"
        start-field="begin" end-field="end" />

      <div class="search-actions" style="margin-left: auto; display: inline-flex; gap: 8px">
        <el-button type="primary" :disabled="loading" @click="handleSearch"> 搜索 </el-button>
        <el-button :disabled="loading" @click="handleReset"> 重置 </el-button>
      </div>
    </div>

    <pageTable notauto :page="page" :data="list" :columns="columns" :loading="loading" rowkey="id" :height="360"
      @GetData="GetData">
      <template #id="{ row }">
        <div class="bms-id-cell">
          <el-button link class="bms-op-link" @click.stop="goBmsMonitor(row)">
            {{ row?.id || "-" }}
          </el-button>

          <el-icon
            v-if="row?.id"
            v-copy:click="row.id"
            class="bms-copy-icon"
            @click.stop
          >
            <CopyDocument />
          </el-icon>
        </div>
      </template>
    </pageTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { BmsBocDiscBmsListItem, BmsBocDiscBmsListParams } from "@/api/bms/types";
import { getBocDiscBmsListReq } from "@/api/bms";
import { dateYMDHMS } from "@/utils/util";
import { ElMessage } from "element-plus";
import DateRangePicker from "@/components/DateRangePicker.vue";
import { CopyDocument } from "@element-plus/icons-vue";
import { closeDialog, dialogStore } from "@/components/ReDialog";

defineOptions({ name: "BocDiscBmsListDialog" });

const loading = ref(false);

const list = ref<Array<{ id: string; timeText: string }>>([]);

const searchBmsId = ref<string>("");

const timeRange = ref<[Date | null, Date | null]>([null, null]);

const page = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
});

const router = useRouter();

const columns = [
  { label: "设备ID", prop: "id", slots: "id", minWidth: 180, align: "center" as const },
  { label: "时间", prop: "timeText", minWidth: 220, align: "center" as const }
];

function formatTime(time: number | string | undefined): string {
  if (time === undefined || time === null || time === "") return "-";

  if (typeof time === "string") {
    const n = Number(time);
    if (!Number.isNaN(n)) return formatTime(n);
    return time;
  }

  // time 为时间戳：秒/毫秒兼容
  const ms = time < 1e12 ? time * 1000 : time;
  return dateYMDHMS(ms);
}

function normalizeTimeToText(time: number | string | undefined): string {
  return formatTime(time);
}

function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 0);
  return d;
}

function getBeginEndFromRange(range: [Date | null, Date | null]): {
  begin?: string;
  end?: string;
} {
  const beginDate = range[0];
  const endDate = range[1];

  const beginTime = beginDate ? toStartOfDay(beginDate).getTime() : undefined;
  const endTime = endDate ? toEndOfDay(endDate).getTime() : undefined;

  return {
    begin: typeof beginTime === "number" && Number.isFinite(beginTime) ? dateYMDHMS(beginTime) : undefined,
    end: typeof endTime === "number" && Number.isFinite(endTime) ? dateYMDHMS(endTime) : undefined
  };
}

function handleSearch() {
  if (loading.value) return;
  page.currentPage = 1;
  GetData({ currentPage: 1, pageSize: page.pageSize });
}

function handleReset() {
  if (loading.value) return;
  searchBmsId.value = "";
  timeRange.value = [null, null];
  page.currentPage = 1;
  GetData({ currentPage: 1, pageSize: page.pageSize });
}

function goBmsMonitor(row: { id: string }) {
  if (!row?.id) return;

  // 路由跳转前关闭当前“放电过流设备列表”弹窗，避免切页后仍覆盖在新页面上
  for (let i = dialogStore.value.length - 1; i >= 0; i--) {
    const opt = dialogStore.value[i];
    const cls = opt?.class ?? "";
    if (typeof cls === "string" && cls.includes("bocdisc-bms-list-dialog")) {
      closeDialog(opt, i);
    }
  }

  router.push({ name: "BmsManage", query: { bmsId: row.id } });
}

async function GetData(pageData?: { currentPage?: number; pageSize?: number }) {
  const currentPage = pageData?.currentPage ?? page.currentPage;
  const pageSize = pageData?.pageSize ?? page.pageSize;
  page.currentPage = currentPage;
  page.pageSize = pageSize;
  loading.value = true;
  try {
    const { begin, end } = getBeginEndFromRange(timeRange.value);

    const filters: NonNullable<BmsBocDiscBmsListParams["filters"]> = {};
    if (searchBmsId.value) {
      filters.bmsId = searchBmsId.value;
    }
    if (typeof begin === "string") {
      // 维持运行时传参为字符串 YYYY-MM-DD HH:mm:ss
      filters.begin = begin as unknown as NonNullable<BmsBocDiscBmsListParams["filters"]>["begin"];
    }
    if (typeof end === "string") {
      // 维持运行时传参为字符串 YYYY-MM-DD HH:mm:ss
      filters.end = end as unknown as NonNullable<BmsBocDiscBmsListParams["filters"]>["end"];
    }

    const hasFilters = Object.keys(filters).length > 0;

    const payload: BmsBocDiscBmsListParams = {
      page: currentPage,
      pageSize,
      ...(hasFilters ? { filters } : {})
    };

    const res = await getBocDiscBmsListReq(payload);
    if (res.errno !== 0) {
      ElMessage.error(res.errmsg ?? "获取放电过流设备失败");
      list.value = [];
      page.total = 0;
      return;
    }

    const data = res.data;
    const rawList: BmsBocDiscBmsListItem[] = data?.bmsList ?? data?.bocdiscbmslist ?? data?.bocDiscBmsList ?? data?.list ?? [];

    list.value = (Array.isArray(rawList) ? rawList : []).map(item => ({
      id: String(item.bms_id ?? item.id ?? ""),
      timeText: normalizeTimeToText(item.time)
    }));

    const total = typeof data?.total === "number" ? data.total : typeof data?.totalPage === "number" ? data.totalPage * pageSize : typeof data?.totalPages === "number" ? data.totalPages * pageSize : typeof data?.total_page === "number" ? data.total_page * pageSize : 0;

    page.total = total;
  } catch {
    ElMessage.error("获取放电过流设备失败");
    list.value = [];
    page.total = 0;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  GetData({ currentPage: page.currentPage, pageSize: page.pageSize });
});
</script>

<style scoped lang="scss">
.bocdisc-bms-list-dialog {
  --page-table-header-bg: transparent;
  --page-table-header-color: rgba(230, 237, 243, 0.9);
  --page-table-wrap-bg: transparent;
  --page-table-shadow: none;
  padding: 15px 0;
  --page-table-radius: 10px;
}

:deep(.el-table thead th.el-table__cell) {
  background: transparent !important;
}

.bms-op-link {
  --bms-link-color: var(--bms-primary, #00d9ff);
  --bms-link-hover: var(--bms-primary-hover, #26c6da);

  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
  height: auto !important;
  line-height: 1.2;
  color: var(--bms-link-color) !important;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: var(--bms-link-hover) !important;
    background: transparent !important;
  }

  &:active {
    transform: translateY(0.5px);
  }

  &:focus,
  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
}

.bms-id-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bms-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--bms-primary, #00d9ff);
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: var(--bms-primary-hover, #26c6da);
  }

  &:active {
    transform: translateY(0.5px);
  }
}
</style>
