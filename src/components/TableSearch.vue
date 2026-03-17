<template>
	<!-- <Card>	 -->
	<div class="container-search">
		<!-- <div v-if="!noShowUp" @click="isUp = !isUp" class="search-title">
			<div :class="isUp && 'up'"><el-icon>
					<ArrowDownBold />
				</el-icon></div>
			<div style="margin-left: 10px;">搜索</div>
		</div> -->
		<div v-show="!isUp" class="form">
			<el-form :label-width="labelWidth" :inline="true">
				<el-form-item v-for="item in visibleFormItems" :key="item.field"
					:class="item.type === 'select-date' && 'select-date-form'" style="margin-right: 5px;">
					<!-- 自定义 -->
					<slot :name="item.slot"></slot>
					<template v-if="!item.slot">
						<!-- 输入框 -->
						<el-input :prefix-icon="Search" class="common" v-if="item.type === 'input'"
							@input="valueChange($event, item.field)" :model-value="form[item.field]" :placeholder="item.label"
							:clearable="item.clear === 'no' ? false : true" :style="{ width: item.width || defaultWidth }" />
						<!-- 单选 -->
						<el-select :model-value="form[item.field]" @change="valueChange($event, item.field)" class="common"
							:placeholder="item.label" :clearable="item.clear === 'no' ? false : true"
							:style="{ width: item.width || defaultWidth }"
							v-if="item.type === 'select' && !item.multiple">
							<el-option v-for="option in item.selectOption" :key="option.value"
								:label="item.selectName && item.selectName.label ? option[item.selectName.label] : option.label"
								:value="item.selectName && item.selectName.value ? option[item.selectName.value] : option.value" />
						</el-select>
						<!-- 多选 -->
						<el-select multiple collapse-tags collapse-tags-tooltip :model-value="form[item.field]"
							@change="valueChange($event, item.field)" class="common" :placeholder="item.label"
							:clearable="item.clear === 'no' ? false : true" :style="{ width: item.width || defaultWidth }"
							v-if="item.type === 'select' && item.multiple">
							<el-option v-for="option in item.selectOption" :key="option.value" :label="option.label"
								:value="option.value" />
						</el-select>
						
						 <!-- 时间 -->
            <!-- <el-date-picker @clear="clearSelected" :editable="false" :clearable="item.clear === 'no' ? false : true" v-model="dateForm[item.field]"
              @calendar-change="dateChange($event, item)" type="daterange" :start-placeholder="item.label"
              end-placeholder="" :range-separator="dateForm[item.field] ? '-' : ''" v-if="item.type === 'date'" class="common" style="width: 205px;" /> -->
						<!-- 日期范围选择器 -->
						<DateRangePicker 
							v-if="item.type === 'date'"
							v-model="dateForm[item.field]"
							:start-placeholder="item.startPlaceholder"
							:end-placeholder="item.endPlaceholder"
							:clearable="item.clear !== 'no'"
							:range-separator="item.rangeSeparator || '至'"
							:start-field="item.startDateField || 'startDate'"
							:end-field="item.endDateField || 'endDate'"
							:style="{ width: item.width || defaultWidth }"
							@change="handleDateRangeChange($event, item)"
							@clear="handleDateRangeClear"
						/>
				</template>
					<!-- 选择+时间 -->
					<template v-if="item.type === 'select-date' && item.selectOption" #label>
						<div class="select-date-title">
							<el-select :editable="false" :model-value="form[item.field]" @change="valueChange($event, item.field)" placeholder="不限">
								<el-option v-for="option in item.selectOption" :key="option.value" :label="option.label"
									:value="option.value" />
							</el-select>
						</div>
					</template>
					<template v-if="item.type === 'select-date'" #default>
						<div class="select-date-content">
							<el-date-picker :clearable="item.clear === 'no' ? false : true" v-if="item.type === 'select-date'"
								v-model="dateForm" @calendar-change="dateChange($event, item.dateField)" type="daterange"
								start-placeholder="开始时间" end-placeholder="结束时间" class="common"
								:style="{ width: item.width || defaultWidth }" />
						</div>
					</template>
				</el-form-item>
				<!-- 高级条件区域 -->
				<el-form-item v-for="item in advancedFormItems" :key="item.field" v-show="showMore"
					:class="item.type === 'select-date' && 'select-date-form'" style="margin-right: 5px;">
					<!-- 自定义 -->
					<slot :name="item.slot"></slot>
					<template v-if="!item.slot">
						<!-- 输入框 -->
						<el-input :prefix-icon="Search" class="common" v-if="item.type === 'input'"
							@input="valueChange($event, item.field)" :model-value="form[item.field]" :placeholder="item.label"
							:clearable="item.clear === 'no' ? false : true" :style="{ width: item.width || defaultWidth }" />
						<!-- 单选 -->
						<el-select :model-value="form[item.field]" @change="valueChange($event, item.field)" class="common"
							:placeholder="item.label" :clearable="item.clear === 'no' ? false : true"
							:style="{ width: item.width || defaultWidth }"
							v-if="item.type === 'select' && !item.multiple">
							<el-option v-for="option in item.selectOption" :key="option.value"
								:label="item.selectName && item.selectName.label ? option[item.selectName.label] : option.label"
								:value="item.selectName && item.selectName.value ? option[item.selectName.value] : option.value" />
						</el-select>
						<!-- 多选 -->
						<el-select multiple collapse-tags collapse-tags-tooltip :model-value="form[item.field]"
							@change="valueChange($event, item.field)" class="common" :placeholder="item.label"
							:clearable="item.clear === 'no' ? false : true" :style="{ width: item.width || defaultWidth }"
							v-if="item.type === 'select' && item.multiple">
							<el-option v-for="option in item.selectOption" :key="option.value" :label="option.label"
								:value="option.value" />
						</el-select>
						<!-- 日期范围选择器 -->
						<DateRangePicker 
							v-if="item.type === 'date'"
							v-model="dateForm[item.field]"
							:start-placeholder="item.startPlaceholder"
							:end-placeholder="item.endPlaceholder"
							:clearable="item.clear !== 'no'"
							:range-separator="item.rangeSeparator || '至'"
							:start-field="item.startDateField || 'startDate'"
							:end-field="item.endDateField || 'endDate'"
							:style="{ width: item.width || defaultWidth }"
							@change="handleDateRangeChange($event, item)"
							@clear="handleDateRangeClear"
						/>
					</template>
					<!-- 选择+时间 -->
					<template v-if="item.type === 'select-date' && item.selectOption" #label>
						<div class="select-date-title">
							<el-select :editable="false" :model-value="form[item.field]" @change="valueChange($event, item.field)" placeholder="不限">
								<el-option v-for="option in item.selectOption" :key="option.value" :label="option.label"
									:value="option.value" />
							</el-select>
						</div>
					</template>
					<template v-if="item.type === 'select-date'" #default>
						<div class="select-date-content">
							<el-date-picker :clearable="item.clear === 'no' ? false : true" v-if="item.type === 'select-date'"
								v-model="dateForm" @calendar-change="dateChange($event, item.dateField)" type="daterange"
								start-placeholder="开始时间" end-placeholder="结束时间" class="common"
								:style="{ width: item.width || defaultWidth }" />
						</div>
					</template>
				</el-form-item>
				<el-form-item>
					<div class="search-btn">
						<slot name="beforeButtons"></slot>
						<el-button :icon="RefreshLeft" @click="reset">重置</el-button>
						<el-button :icon="RefreshRight" @click="queryBtn" type="primary">搜索</el-button>
						<el-button v-if="hasAdvancedItems" link type="primary" @click="showMore = !showMore">
							{{ showMore ? '收起' : '展开' }}
							<el-icon style="margin-left: 4px;">
								<ArrowDownBold :class="{ 'up': showMore }" />
							</el-icon>
						</el-button>
					</div>
				</el-form-item>
			</el-form>
		</div>
	</div>
<!-- </Card> -->
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { dateYMD } from '@/utils/util'
import { useQueryFormStore } from "@/store/queryForm";
import { Search, ArrowDownBold, RefreshRight, RefreshLeft } from '@element-plus/icons-vue'
import DateRangePicker from '@/components/DateRangePicker.vue'

const queryFormStore = useQueryFormStore()
const emit = defineEmits(['formData', 'queryBtn', 'resetBtn'])
const props = defineProps({
	loading: {
		type: Boolean,
		default: false,
	},
	labelWidth: {
		type: String,
		default: '100px',
	},
	defaultWidth: {
		type: String,
		default: '150px',
	},
	/***
	 * label 标题
	 * field 字段
	 * type input输入框|date时间|select选择
	 * placeholder 默认值
	 * selectOption 选项，当type为select时
	 * multiple 是否多选，当type为select时
	 * isAdvanced 是否为高级条件，默认false（常用条件），true为高级条件（默认折叠）
	 * width 自定义宽度，如果不传则使用defaultWidth
	 */
	formItem: {
		type: Array,
	},
	pageName: {
		type: String
	},
	noShowUp: {
		type: Boolean,
		default: false,
	},
	defaultFormData: {
		type: Object,
		default: () => {},
	},
})

const dateForm = ref({})
const form = ref({})
const deviceType = localStorage.getItem("deviceType")
const isUp = ref( deviceType === 'mobile' ? true : false)
const showMore = ref(false)

// 计算常用条件和高级条件
const commonFormItems = computed(() => {
	return props.formItem?.filter(item => !item.isAdvanced) || []
})

const advancedFormItems = computed(() => {
	return props.formItem?.filter(item => item.isAdvanced) || []
})

const visibleFormItems = computed(() => {
	return commonFormItems.value
})

const hasAdvancedItems = computed(() => {
	return advancedFormItems.value.length > 0
})

// 下拉选择时间
const selectDateName = ref()
const defaultData = ref({})
watch(() => props.defaultFormData, (newData) => {
	if (newData && Object.keys(newData).length > 0) {
		console.log('defaultFormData received:', newData);
		form.value = { ...form.value, ...newData }
		emit('formData', form.value)
	}
}, { immediate: true, deep: true })
watch(
	() => props.formItem,
	(newData) => {
		if (newData) {
			newData.forEach((item) => {
				if (item.defaultData) {
					defaultData.value[item.field] = item.defaultData
					if (item.type === 'date') {
						dateForm.value[item.field] = item.defaultData
						form.value[item.startDateField ? item.startDateField : 'startDate'] = dateYMD(item.defaultData[0])
						form.value[item.endDateField ? item.endDateField : 'endDate'] = dateYMD(item.defaultData[1])
					}
				}
			})
			if (defaultData.value) form.value = { ...form.value, ...defaultData.value }
			// 给下拉选择时间赋值
			const selectDate = newData.find((item) => item.type === 'select-date')
			if (selectDate) {
				selectDateName.value = selectDate
				if (selectDateName.value.selectOption[0]) {
					form.value[selectDateName.value.field] = selectDateName.value.selectOption[0].value
				}
			}
		}
	},
	{ immediate: true, deep: true }
)

// 时间改变
watch(() => dateForm.value, (newData) => {
	if (!newData) {
		form.value.startDate = null
		form.value.endDate = null
	}
})


queryFormStore.setFormDataFn(form.value)
// 输入框value值改变
const valueChange = (val, field) => {
	console.log('val :>> ', val);

	form.value[field] = val
	queryFormStore.setFormDataFn(form.value)
	emit('formData', form.value)
}

const clearSelected = (val) => {
	console.log('val :>> ', val);
}

// 日期范围变化处理
const handleDateRangeChange = (data, item) => {
	if (data.startDate) {
		form.value[data.startField] = dateYMD(data.startDate)
	}
	if (data.endDate) {
		form.value[data.endField] = dateYMD(data.endDate)
	}
	emit('formData', form.value)
}

// 日期范围清空处理
const handleDateRangeClear = (type) => {
	console.log('Date range cleared:', type);
}

// 日期选择（保留原有逻辑用于其他类型）
const dateChange = (val, item) => {
	if (val[0] && val[1]) {
		dateForm.value = val
		// form.value[item.field] = val
		form.value[item.startDateField ? item.startDateField : 'startDate'] = dateYMD(val[0])
		form.value[item.endDateField ? item.endDateField : 'endDate'] = dateYMD(val[1])
	}
	emit('formData', form.value)
}

// 查询按钮
const queryBtn = () => {
	queryFormStore.queryBtn(form.value, props.pageName)
	emit('queryBtn', form.value)
}

// 产品型号
const seriesData = (val, field) => {
	form.value[field] = val
}

const seriesRef = ref()
// 重置按钮
const reset = () => {
	dateForm.value = {}
	if (seriesRef.value) seriesRef.value[0].resetFn()
	form.value = {}
	if (defaultData.value) {
		if (defaultData.value.dataScope) {
			form.value = { ...defaultData.value }
		}
	}
	if (selectDateName.value && selectDateName.value.selectOption[0]) {
		form.value[selectDateName.value.field] = selectDateName.value.selectOption[0].value
	}
	queryFormStore.queryBtn(form.value, props.pageName)
	emit('queryBtn', form.value)
}

// const formItem = reactive([
// { label: '关键字', field: 'keyword', type: 'input', placeholder: '姓名/电话/SN码/快递订单号' },
// { label: '状态', field: 'state', type: 'select', selectOption: getSelectDict('maintenance_wait_submission_state') },
// { label: '产品型号', field: 'series', type: 'series' },
// { label: '产品故障', field: 'accidentType', type: 'select', selectOption: getSelectDict('accident_type') },
// { label: '有无保险', field: 'insure', type: 'select', selectOption: getSelectDict('is_insure') },
// { label: '申请时间', field: 'time', type: 'date' },
// { label: '寄送方式', field: 'deliveryMethod', type: 'select', selectOption: getSelectDict('delivery_method') },
// {
// 	label: '申请日期',
// 	field: 'time1',
// 	type: 'select-date',
// 	dateField: 'selectOption',
// 	selectOption: getSelectDict('status_date'),
// },
// { label: '数据范围', field: 'insure', type: 'select', selectOption: getSelectDict('data_range') },

// { label: '关键字', field: 'keyword', type: 'input', placeholder: 'SN码' },
// { label: '状态', field: 'keyword1', type: 'input', placeholder: 'SN码' },
// { label: '状态', field: 'status', type: 'select', selectOption: [{ label: '已完成', value: '1' }] },
// {
// 	label: '状态',
// 	field: 'status1',
// 	multiple: true,
// 	type: 'select',
// 	selectOption: [
// 		{ label: '已完成', value: '1' },
// 		{ label: '未完成', value: '0' },
// 		{ label: '已受理', value: '2' },
// 		{ label: '已入库', value: '3' },
// 		{ label: '定损中', value: '4' },
// 		{ label: '维修中', value: '5' },
// 		{ label: '已寄回', value: '6' },
// 	],
// },
// { label: '申请时间', field: 'time', type: 'date' },
// ])

</script>

<style lang="scss" scoped>
:deep(.select-date-form) {
	.el-form-item__label {
		margin-right: 0;
		padding: 0 2px 0 0;
		width: 120px !important;

		.select-date-title {
			margin-right: 0;
			margin-left: 15px;
		}
	}

	.el-date-editor.el-input__wrapper {
		width: 210px;
	}
}

.search-btn {
	display: flex;
	gap: 8px;
}

:deep(.el-form-item--default) {
	margin: 5px;
}

.select-date {
	width: 100px;
	margin-left: 15px;
	margin-right: 5px;
}

:deep(.el-input__suffix-inner > :first-child) {
	margin-left: 5px;
}

:deep(.el-form--inline .el-form-item) {
	margin-right: 0px;
}

.common {
	width: 150px;
}

/* 确保日期选择器在同一行显示 */
:deep(.el-form-item) {
	display: inline-flex;
	align-items: center;
}

.form {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
}

.btn {
	width: 150px;
	flex: none;
	float: right;
}

.container-search {
	width: 100%;
	margin-right: 15px;
}

.search-title {
	display: flex;
	cursor: pointer;
	user-select: none;
	display: inline-flex;

}

.up {
	transform: rotate(180deg);
}
</style>
