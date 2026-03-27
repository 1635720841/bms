<template>
  <el-row class="page-table-row">
    <div class="page-table-wrap">
      <el-table :data="data" :class="['page-table', { 'h5-right-fixed-enable': enableMobileRightFixedCollapse }]"
        :max-height="maxheight" :height="height" v-bind="$attrs" stripe :row-key="rowkey"
        :row-class-name="tableRowClassName" v-loading="props.loading" @selection-change="change"
        @sort-change="sortChange" lazy="lazy" :load="load" :key="mathkey ? Math.random() : '1'" :tree-props="treeprops">
        <columnItem v-for="(item, index) in columns" :item="item" :key="index">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </columnItem>
      </el-table>
    </div>
    <el-pagination style="margin-top: 15px;" v-if="page && isMobile" background small class="h5-smali-pager"
      size="small" :pager-count="3" @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="defaultPage.currentPage" :page-sizes="defaultPage.pageSizes" :page-size="defaultPage.pageSize"
      layout="total, sizes, prev, pager, next" :total="page.total"></el-pagination>
    <el-pagination style="margin-top: 15px;" v-if="page && !isMobile" background small @size-change="handleSizeChange"
      @current-change="handleCurrentChange" :current-page="defaultPage.currentPage" :page-sizes="defaultPage.pageSizes"
      :page-size="defaultPage.pageSize" layout="total, sizes, prev, pager, next" :total="page.total"></el-pagination>
  </el-row>
</template>

<script setup>
import columnItem from './columnItem.vue'
import { ref, reactive, watch, onMounted, computed, provide } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  rowkey: {
    type: String,
    default: () => 'id',
  },
  activekey: {
    type: String,
    default: () => '',
  },
  columns: {
    type: Array,
    default: () => [],
  },
  page: {
    type: Object,
    default: () => null,
  },
  maxheight: {
    type: String,
    default: () => '2000',
  },
  height: {
    type: Number,
    default: () => undefined,
  },
  lazy: {
    type: Boolean,
    default: () => false,
  },
  notauto: {
    type: Boolean,
    default: () => false,
  },
  mathkey: {
    // 动态表头时候设置, 不然切换会出现不更新,一般表格设置true 更新数据会闪烁
    type: Boolean,
    default: () => false,
  },
  treeprops: {
    type: Object,
    default: () => {
      return { children: 'children', hasChildren: 'hasChildren' }
    },
  },
  loading: {
    type: Boolean,
    default: () => false,
  },
  rowClassName: {
    type: Function,
    default: null,
  },
})
const deviceType = localStorage.getItem("deviceType")
const isMobile = ref(deviceType === 'mobile' ? true : false)

const defaultPage = reactive({ pageSize: 10, pageSizes: [10, 20, 30, 50, 100, 300], currentPage: 1, total: 0 })

const MOBILE_RIGHT_FIXED_COLLAPSED_WIDTH = 44
const mobileRightFixedCollapsed = ref(true)

const hasRightFixedColumn = (cols) => {
  if (!Array.isArray(cols) || cols.length === 0) return false
  return cols.some((c) => {
    if (!c) return false
    if (c.fixed === 'right') return true
    if (Array.isArray(c.children) && c.children.length > 0) return hasRightFixedColumn(c.children)
    return false
  })
}

const enableMobileRightFixedCollapse = computed(() => isMobile.value && hasRightFixedColumn(props.columns))
watch(enableMobileRightFixedCollapse, (val) => {
  if (!val) {
    mobileRightFixedCollapsed.value = false
  } else if (val && mobileRightFixedCollapsed.value === false) {
    // 移动端进入含 right fixed 的表格时，默认收起
    mobileRightFixedCollapsed.value = true
  }
}, { immediate: true })

const toggleMobileRightFixedCollapsed = () => {
  if (!enableMobileRightFixedCollapse.value) return
  mobileRightFixedCollapsed.value = !mobileRightFixedCollapsed.value
}

provide('pageTableMobileRightFixedCollapse', {
  enabled: enableMobileRightFixedCollapse,
  collapsed: mobileRightFixedCollapsed,
  collapsedWidth: MOBILE_RIGHT_FIXED_COLLAPSED_WIDTH,
  toggle: toggleMobileRightFixedCollapsed,
})

watch(
  () => props.page,
  (count, prevCount) => {
    if (count && count.pageSize) {
      defaultPage.pageSize = count.pageSize
    }
    if (count && count.currentPage) {
      defaultPage.currentPage = count.currentPage
    }
  },
  { deep: true }
)

const $emit = defineEmits(['GetData', 'load', 'selectionChange', 'sortChange'])
onMounted(() => {
  if (props.page) {
    if (props.page.pageSize) {
      defaultPage.pageSize = props.page.pageSize
    }
    if (props.page.currentPage) {
      defaultPage.currentPage = props.page.currentPage
    }
  }
  if (!props.notauto) {
    $emit('GetData')
  }
})

const load = (tree, treeNode, resolve1) => {
  $emit('load', tree, treeNode, resolve1)
}
const handleSizeChange = (val) => {
  defaultPage.pageSize = val
  handleCurrentChange(1)
}
const handleCurrentChange = (val) => {
  defaultPage.currentPage = val
  $emit('GetData', {
    currentPage: val,
    pageSize: defaultPage.pageSize
  })
}
const change = (selection) => {
  $emit('selectionChange', selection)
}
const tableRowClassName = computed(() => {
  return (row, rowIndex) => {
    const classes = []
    if (props.activekey && row.row[props.rowkey] === props.activekey) {
      classes.push('active-row')
    }
    if (props.rowClassName) {
      const customClass = props.rowClassName(row, rowIndex)
      if (customClass) {
        classes.push(customClass)
      }
    }
    return classes.join(' ')
  }
})
// 排序
const sortChange = (val) => {
  $emit('sortChange', val)
}

defineExpose({
  defaultPage,
})
</script>
<style scoped lang="scss">
.page-table-row {
  width: 100%;
}

/* 无边框表格容器：圆角 + 轻微阴影，卡片感 */
.page-table-wrap {
  overflow: hidden;
  width: 100%;
  border-radius: var(--page-table-radius, 8px);
  background: var(--page-table-wrap-bg, transparent);
  box-shadow: var(--page-table-shadow, 0 1px 3px rgba(0, 0, 0, 0.06));
}

/* 去掉 Element 表格所有边框 */
:deep(.el-table) {
  --el-table-border-color: transparent !important;
  --el-table-header-bg-color: var(--page-table-header-bg) !important;
}

:deep(.el-table::before),
:deep(.el-table::after),
:deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

:deep(.el-table th.el-table__cell),
:deep(.el-table td.el-table__cell) {
  border: none !important;
}

/* 表头：换配色 - 浅灰蓝底 + 深色字 */
:deep(.el-table thead th.el-table__cell) {
  background: var(--page-table-header-bg, #eef2f7) !important;
  color: var(--page-table-header-color, #334155) !important;
  font-weight: 600;
  font-size: var(--page-table-header-font-size, 13px);
  // padding: var(--page-table-cell-padding-y, 10px) var(--page-table-cell-padding-x, 10px);
}

:deep(.el-table thead tr th::before) {
  display: none !important;
}

/* 单元格：统一内边距、无边框 */
:deep(.el-table .cell) {
  max-height: 40px;
  white-space: nowrap;
  padding: 5px 0px;
}

:deep(.el-table td.el-table__cell) {
  padding: 0;
}

/* 行背景：浅色交替区分每一行（白 / 浅灰） */
:deep(.el-table tr) {
  background-color: var(--page-table-row-bg, #ffffff);
  transition: background-color 0.2s ease;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: var(--page-table-row-striped-bg, #f4f6f9);
}

:deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: var(--page-table-row-hover-bg, #e8ecf1) !important;
}

:deep(.el-pagination) {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  width: 100%;
}
</style>
<style lang="scss">
/* 当前行高亮（选中态），与主题变量一致 */
.page-table .active-row>td.el-table__cell,
.page-table .el-table__body tr.active-row.el-table__row--striped>td.el-table__cell,
.page-table .el-table__body tr.active-row>td.el-table__cell,
.page-table .el-table__body tr.active-row.hover-row.el-table__row--striped>td.el-table__cell,
.page-table .el-table__body tr.active-row.hover-row>td.el-table__cell {
  background-color: var(--page-table-active-row-bg, #f1f5f9) !important;
}
</style>
