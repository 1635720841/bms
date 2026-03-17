<template>
	<el-table-column :min-width="resolvedMinWidth" v-if="item.children" :label="item.label" :width="resolvedWidth" :fixed="resolvedFixed" :align="`${item.align ? item.align : 'center'}`">
		<template v-if="item.headerSlots" #header>
			<slot :name="item.headerSlots" />
		</template>
		<columnItem :prop="itemII.prop" v-for="(itemII, i) in item.children" :key="i" :class-name="itemII.className" :item="itemII">
			<template v-for="slot in Object.keys($slots)" #[slot]="scope">
				<slot :name="slot" v-bind="scope" />
			</template>
		</columnItem>
	</el-table-column>
	<el-table-column v-else-if="item.type" :min-width="resolvedMinWidth" :type="item.type" :label="item.label" :width="resolvedWidth" :fixed="resolvedFixed" :align="`${item.align ? item.align : 'center'}`" show-overflow-tooltip />
	<el-table-column
		v-else-if="item.slots"
		:min-width="resolvedMinWidth"
		:sort-orders="item.sortOrders"
		:sortable="item.sortable"
		:prop="item.prop"
		:label="item.label"
		:width="resolvedWidth"
		:fixed="resolvedFixed"
		:align="`${item.align ? item.align : 'center'}`"
		show-overflow-tooltip
	>
		<!-- 只有在移动端且右侧固定列时，才使用自定义折叠表头 -->
		<template v-if="canToggleRightFixed" #header>
			<div class="right-fixed-header" :class="{ 'is-collapsed': isCollapsedRightFixed }">
				<slot v-if="item.headerSlots" :name="item.headerSlots" />
				<span v-else class="right-fixed-title">{{ item.label }}</span>
				<el-button v-if="canToggleRightFixed" link class="right-fixed-toggle" @click.stop="toggleRightFixed">
					<span v-if="isCollapsedRightFixed">»</span>
					<span v-else>«</span>
				</el-button>
			</div>
		</template>
		<!-- 其他有 slots 的列，使用默认表头渲染，避免影响排序/筛选按钮位置 -->
		<template v-else-if="item.headerSlots" #header>
			<slot :name="item.headerSlots" />
		</template>
		<template v-else #header>
			{{ item.label }}
		</template>

		<!-- 只有可折叠的右固定列才使用折叠内容布局 -->
		<template v-if="canToggleRightFixed" #default="slotProps">
			<div class="right-fixed-cell" :class="{ 'is-collapsed': isCollapsedRightFixed }">
				<el-button v-if="isCollapsedRightFixed && canToggleRightFixed" link class="right-fixed-toggle" @click.stop="toggleRightFixed">
					<span>»</span>
				</el-button>
				<div v-else class="right-fixed-content">
					<slot :name="item.slots" :row="slotProps.row" :index="slotProps.$index" :column="item"></slot>
				</div>
			</div>
		</template>
		<!-- 普通有 slots 的列，保持默认单元格渲染 -->
		<template v-else #default="slotProps">
			<slot :name="item.slots" :row="slotProps.row" :index="slotProps.$index" :column="item"></slot>
		</template>
	</el-table-column>
	<el-table-column v-else-if="item.sortable" :min-width="resolvedMinWidth"  :sort-orders="item.sortOrders" :sortable="item.sortable" :prop="item.prop" :label="item.label" :width="resolvedWidth" :fixed="resolvedFixed" :align="`${item.align ? item.align : 'center'}`" show-overflow-tooltip>
		<template v-if="item.headerSlots" #header>
			<slot :name="item.headerSlots" />
		</template>
		<template #default="scope">
			<span>{{ scope.row[item.prop] || scope.row[item.prop] === 0 ? scope.row[item.prop] : '-' }}</span>
		</template>
	</el-table-column>
	<el-table-column v-else-if="item.selectData" :min-width="resolvedMinWidth" :prop="item.prop" :label="item.label" :width="resolvedWidth" :fixed="resolvedFixed" :align="`${item.align ? item.align : 'center'}`" show-overflow-tooltip>
		<template v-if="item.headerSlots" #header>
			<slot :name="item.headerSlots" />
		</template>
		<template #default="scope">
			<el-tag v-if="getSelectDataType(item.selectData, scope.row[item.prop])" :type="getSelectDataType(item.selectData, scope.row[item.prop])" size="small">
				{{ selectDataFn(item.selectData, scope.row[item.prop]) }}
			</el-tag>
			<span v-else>{{ selectDataFn(item.selectData, scope.row[item.prop]) }}</span>
		</template>
	</el-table-column>
	<el-table-column v-else :prop="item.prop" :min-width="resolvedMinWidth" :label="item.label" :width="resolvedWidth" :fixed="resolvedFixed" :align="`${item.align ? item.align : 'center'}`" show-overflow-tooltip>
		<template #default="scope">
			<span>{{ scope.row[item.prop] || scope.row[item.prop] === 0 ? scope.row[item.prop] :item.nullZero ? 0: '-' }}</span>
		</template>
	</el-table-column>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef, type Ref } from 'vue'

defineOptions({ name: 'columnItem' })

type ElTableColumnFixed = boolean | 'left' | 'right' | undefined

interface SelectDataItem {
	value: string | number
	label: string
	type?: string
}

interface TableColumnItem {
	label?: string
	prop?: string
	width?: string | number
	minWidth?: string | number
	fixed?: ElTableColumnFixed
	align?: 'left' | 'center' | 'right'
	type?: string
	slots?: string
	headerSlots?: string
	sortable?: boolean | 'custom'
	sortOrders?: Array<'ascending' | 'descending' | null>
	selectData?: SelectDataItem[]
	className?: string
	children?: TableColumnItem[]
	nullZero?: boolean
}

interface MobileRightFixedCollapseCtx {
	enabled: ComputedRef<boolean>
	collapsed: Ref<boolean>
	collapsedWidth: number
	toggle: () => void
}

const props = defineProps<{
	item: TableColumnItem
	minWidth?: number
}>()

const isMobile = localStorage.getItem('deviceType') === 'mobile'
const mobileRightFixedCollapse = inject<MobileRightFixedCollapseCtx | null>('pageTableMobileRightFixedCollapse', null)

const isRightFixed = computed(() => props.item?.fixed === 'right')
const canToggleRightFixed = computed(() => isMobile && isRightFixed.value && !!mobileRightFixedCollapse?.enabled.value)
const isCollapsedRightFixed = computed(() => canToggleRightFixed.value && !!mobileRightFixedCollapse?.collapsed.value)

const resolvedFixed = computed<ElTableColumnFixed>(() => {
	const fixed = props.item?.fixed
	if (!isMobile) return fixed
	if (fixed === 'right') return 'right'
	return false
})

const resolvedWidth = computed<string | number | undefined>(() => {
	if (isCollapsedRightFixed.value) return mobileRightFixedCollapse?.collapsedWidth
	return props.item?.width
})

const resolvedMinWidth = computed<string | number>(() => {
	if (isCollapsedRightFixed.value) return mobileRightFixedCollapse?.collapsedWidth ?? 44
	return props.item?.minWidth ?? 0
})

const toggleRightFixed = () => {
	if (!canToggleRightFixed.value) return
	mobileRightFixedCollapse?.toggle()
}

const selectDataFn = (selectDataArr, val) => {
	if (typeof val === 'string') {
		if (val && val.indexOf(',') != -1) {
			const join = val.split(',')
			const arrData = []
			join.forEach((itemJoin) => {
				const find = selectDataArr.find((item) => item.value === itemJoin)
				if (find) {
					arrData.push(find.label)
				}
			})
			return arrData.join(',')
		}
	}
	const find = selectDataArr.find((item) => item.value === val)
	if (find) {
		return find.label
	} else {
		return '-'
	}
}

const getSelectDataType = (selectDataArr, val) => {
	if (typeof val === 'string') {
		if (val && val.indexOf(',') != -1) {
			// 多值情况，返回第一个找到的 type
			const join = val.split(',')
			for (const itemJoin of join) {
				const find = selectDataArr.find((item) => item.value === itemJoin)
				if (find && find.type) {
					return find.type
				}
			}
			return null
		}
	}
	const find = selectDataArr.find((item) => item.value === val)
	return find?.type || null
}

</script>

<style scoped lang="scss">
.right-fixed-header,
.right-fixed-cell {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	width: 100%;
}

.right-fixed-header.is-collapsed .right-fixed-title {
	display: none;
}

.right-fixed-content {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 100%;
}

:deep(.right-fixed-toggle) {
	padding: 0 !important;
	min-height: 24px;
	height: 24px;
	line-height: 24px;
}

.right-fixed-cell.is-collapsed :deep(.right-fixed-toggle) {
	width: 100%;
}
</style>
