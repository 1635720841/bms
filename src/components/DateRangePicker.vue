<template>
	<div class="date-range-container">
		<el-date-picker 
			@clear="clearStartDate" 
			:editable="false" 
			:clearable="clearable" 
			v-model="startDate" 
			@change="startDateChange" 
			type="date" 
			:placeholder="startPlaceholder || '开始时间'" 
			:disabled-date="disabledStartDate"
			:default-value="startDefaultValue"
			class="date-picker-start" 
		/>
		<span class="date-separator">{{ rangeSeparator }}</span>
		<el-date-picker 
			@clear="clearEndDate" 
			:editable="false" 
			:clearable="clearable" 
			v-model="endDate" 
			@change="endDateChange" 
			type="date" 
			:placeholder="endPlaceholder || '结束时间'" 
			:disabled-date="disabledEndDate"
			:default-value="endDefaultValue"
			class="date-picker-end" 
		/>
	</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
	// 开始时间值
	modelValue: {
		type: Array,
		default: () => []
	},
	// 开始时间占位符
	startPlaceholder: {
		type: String,
		default: '开始时间'
	},
	// 范围分隔符
	rangeSeparator: {
		type: String,
		default: '至'
	},
	// 结束时间占位符
	endPlaceholder: {
		type: String,
		default: '结束时间'
	},
	// 是否可清空
	clearable: {
		type: Boolean,
		default: true
	},
	// 开始时间字段名
	startField: {
		type: String,
		default: 'startDate'
	},
	// 结束时间字段名
	endField: {
		type: String,
		default: 'endDate'
	}
})

const emit = defineEmits(['update:modelValue', 'change', 'clear'])

// 内部状态
const startDate = ref(null)
const endDate = ref(null)

// 计算开始日期的默认值
const startDefaultValue = computed(() => {
	// 如果开始日期已有值，显示开始日期的位置
	if (startDate.value) {
		return startDate.value
	}
	// 如果结束日期已选择，从结束日期开始显示
	if (endDate.value) {
		return endDate.value
	}
	// 否则显示当前日期
	return new Date()
})

// 计算结束日期的默认值
const endDefaultValue = computed(() => {
	// 如果结束日期已有值，显示结束日期的位置
	if (endDate.value) {
		return endDate.value
	}
	// 如果开始日期已选择，从开始日期开始显示
	if (startDate.value) {
		return startDate.value
	}
	// 否则显示当前日期
	return new Date()
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
	if (newVal && Array.isArray(newVal) && newVal.length === 2) {
		startDate.value = newVal[0]
		endDate.value = newVal[1]
	} else {
		startDate.value = null
		endDate.value = null
	}
}, { immediate: true })

// 开始时间变化
const startDateChange = (val) => {
	// 如果开始日期晚于结束日期，清空结束日期
	if (val && endDate.value && val > endDate.value) {
		endDate.value = null
	}
	updateValue()
	emit('change', {
		startDate: val,
		endDate: endDate.value,
		startField: props.startField,
		endField: props.endField
	})
}

// 结束时间变化
const endDateChange = (val) => {
	// 如果结束日期早于开始日期，清空结束日期
	if (val && startDate.value && val < startDate.value) {
		endDate.value = null
		// 提示用户
		ElMessage.warning('结束日期不能早于开始日期')
		return
	}
	updateValue()
	emit('change', {
		startDate: startDate.value,
		endDate: val,
		startField: props.startField,
		endField: props.endField
	})
}

// 更新值
const updateValue = () => {
	const newValue = [startDate.value, endDate.value]
	emit('update:modelValue', newValue)
}

// 清空开始时间
const clearStartDate = () => {
	startDate.value = null
	endDate.value = null
	updateValue()
	emit('clear', 'all')
}

// 清空结束时间
const clearEndDate = () => {
	startDate.value = null
	endDate.value = null
	updateValue()
	emit('clear', 'all')
}

// 清空所有
const clearAll = () => {
	startDate.value = null
	endDate.value = null
	updateValue()
	emit('clear', 'all')
}

// 禁用开始日期的逻辑
const disabledStartDate = (time) => {
	// 如果已选择结束日期，开始日期不能晚于结束日期
	if (endDate.value) {
		return time.getTime() > endDate.value.getTime()
	}
	return false
}

// 禁用结束日期的逻辑
const disabledEndDate = (time) => {
	// 如果已选择开始日期，结束日期不能早于开始日期
	if (startDate.value) {
		return time.getTime() < startDate.value.getTime()
	}
	return false
}

// 暴露方法给父组件
defineExpose({
	clearAll,
	startDate,
	endDate
})
</script>

<style lang="scss" scoped>
/* 日期范围选择器容器样式 */
.date-range-container {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--el-border-color);
	border-radius: 6px;
	background-color: var(--el-fill-color-blank);
	transition: var(--el-transition-box-shadow);
	width: 260px;
	overflow: hidden;
}

.date-range-container:hover {
	border-color: var(--el-color-primary);
}

.date-range-container:focus-within {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

/* 开始日期选择器样式 */
.date-picker-start {
	border: none;
	border-radius: 6px 0 0 6px;
	flex: 1;
}

.date-picker-start :deep(.el-input__wrapper) {
	border: none;
	box-shadow: none;
	border-radius: 6px 0 0 6px;
	background-color: transparent;

}
.date-picker-start :deep(.el-input__suffix){
    display: none !important;
}
:deep(.date-picker-start){
    .el-input__suffix{
      display: none !important;

    }
}
/* 分隔符样式 */
.date-separator {
	padding: 0 8px;
	color: var(--el-text-color-regular);
	font-size: 14px;
	white-space: nowrap;
}

/* 结束日期选择器样式 */
.date-picker-end {
	border: none;
	border-radius: 0 6px 6px 0;
	flex: 1;
}

:deep(.date-picker-end) {
	.el-input__prefix {
		display: none;
	}
}

.date-picker-end :deep(.el-input__wrapper) {
	border: none;
	box-shadow: none;
	border-radius: 0 6px 6px 0;
	background-color: transparent;
}

.date-range-container :deep(.el-input__wrapper) {
	box-shadow: none !important;
	width: 100%;
	padding: 1px 5px;
}

/* 移除内部边框，使两个选择器看起来更一体化 */
.date-range-container :deep(.el-input__inner) {
	border: none;
	background-color: transparent;
}

/* 当选择器获得焦点时的样式 */
.date-range-container :deep(.el-input.is-focus .el-input__wrapper) {
	box-shadow: none !important;
}
</style>
