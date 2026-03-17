<template>
	<el-dialog :title="props.title" :width="props.width" v-model="dialogFormVisible" :close-on-click-modal="props.closeonclick" append-to-body>
		<el-row :gutter="12">
			<el-form :model="ruleForm" ref="formRef" :label-width="props.labelWidth" size="small" :label-position="props.labelPosition" :inline="true">
				<el-col :span="item.span || 12" v-for="(item, index) in fieldsList" :key="index">
					<el-form-item :label="item.title" :prop="item.dataIndex" :rules="{ required: !item.required, message: `请输入${item.title}` }">
						<el-select v-if="item.type === 'select'" v-model="ruleForm[item.dataIndex]" filterable clearable :placeholder="`请选择${item.title}`" :disabled="props.readonly">
							<el-option v-for="sitem in selstList[item.selectList]" :key="sitem.id" :label="sitem.name" :value="sitem.id"></el-option>
						</el-select>
						<el-date-picker v-else-if="item.type === 'datepicker'" v-model="ruleForm[item.dataIndex]" type="date" :placeholder="`请选择${item.title}`" :disabled="props.readonly"></el-date-picker>
						<el-date-picker v-else-if="item.type === 'datetimerange'" v-model="ruleForm[item.dataIndex]" type="datetimerange" :disabled="props.readonly" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
						<el-radio-group v-else-if="item.type === 'radio'" v-model="ruleForm[item.dataIndex]" :disabled="props.readonly">
							<el-radio v-for="sitem in selstList[item.selectList]" :label="sitem.id" :key="sitem.id">
								<template v-if="sitem.icon">
									<img :src="sitem.icon" style="width: 80px" :title="sitem.name" />
								</template>
								<template v-else>
									{{ sitem.name }}
								</template>
							</el-radio>
						</el-radio-group>
						<el-input v-else v-model="ruleForm[item.dataIndex]" :type="item.inputType || 'text'" :rows="4" :disabled="props.readonly"></el-input>
					</el-form-item>
				</el-col>
			</el-form>
		</el-row>
		<div slot="footer" class="dialog-footer" v-if="!props.readonly">
			<el-button size="mini" @click="dialogFormVisible = false">取 消</el-button>
			<el-button size="mini" type="primary" @click="Sub(formRef)" :loading="loading">确 定</el-button>
		</div>
	</el-dialog>
</template>

<script lang="ts" setup>
// 参考数据格式
// const fieldsList = [
// 	{ title: '工单编号', dataIndex: 'gwbh', required: true, inputType: 'tel' },
// 	{ title: '所属区县', dataIndex: 'ssqx', required: true, type: 'select', selectList: 'ssqx' },
// 	{ title: '所属台区', dataIndex: 'sstq' },
// 	{ title: '所属台区', dataIndex: 'sstqMc' },
// 	{ title: '受理业务一级类型', dataIndex: 'yjlx', required: true, type: 'select', selectList: 'yjtslx' },
// 	{ title: '受理业务二级类型', dataIndex: 'ejlx', required: true, type: 'select', selectList: 'ejtslx' },
// 	{ title: '受理业务三级类型', dataIndex: 'sjlx', required: true, type: 'select', selectList: 'sjtslx' },
// 	{ title: '是否属实', dataIndex: 'sfss', required: true, type: 'select', selectList: 'sfsx' },
// 	{ title: '联系人', dataIndex: 'lxr', required: true },
// 	{ title: '联系电话', dataIndex: 'lxdh', required: true, inputType: 'tel', maxlength: 11 },
// 	{ title: '联系地址', dataIndex: 'lxdz', required: true },
// 	{ title: '处理状态', dataIndex: 'tsClzt', required: true, type: 'select', selectList: 'clzt' },
// 	{ title: '受理时间', dataIndex: 'slsj', required: true, type: 'datepicker' },
// 	{ title: '受理内容', dataIndex: 'slnr', required: true, span: 24, inputType: 'textarea' },
// 	{ title: '处理结果', dataIndex: 'cljg', required: true, span: 24, inputType: 'textarea' }
// ]

import { reactive, ref, watch } from 'vue'

const props = defineProps({
	model: {
		type: Object,
		default: () => null,
	},
	fields: {
		type: Array,
		default: () => [],
	},
	selstDataList: {
		type: Object,
		default: () => null,
	},
	title: {
		type: String,
		default: () => '',
	},
	width: {
		type: String,
		default: () => '800px',
	},
	readonly: {
		type: Boolean,
		default: () => false,
	},
	closeonclick: {
		type: Boolean,
		default: () => false,
	},
	labelWidth: {
		type: String,
		default: () => '100px',
	},
	labelPosition: {
		type: String,
		default: () => 'top', // left right top
	},
})

const dialogFormVisible = ref(false)
const subloading = ref(false)
const ruleForm = reactive({})
const formRef = ref()
const selstList = ref([])
const fieldsList = ref([])

if (props.selstDataList) {
	selstList.value = props.selstDataList
}

if (props.fields) {
	fieldsList.value = props.fields
}

watch(
	() => props.model,
	(count, prevCount) => {
		fieldsList.value.forEach((v) => {
			ruleForm[v.dataIndex] = count[v.dataIndex] || ''
		})
	},
	{ deep: true }
)

const $emit = defineEmits(['back'])
const Sub = (formEl) => {
	if (!formEl) return
	formEl.validate((valid) => {
		if (valid) {
			subloading.value = true
			console.log(ruleForm)
			$emit('back', ruleForm)
		} else {
			console.log('error submit!')
			return false
		}
	})
}
defineExpose({
	dialogFormVisible,
	subloading,
})
</script>
<style scoped lang="scss">
:deep(.el-select),
:deep(.el-date-editor.el-input),
:deep(.el-input__wrapper),
.el-form {
	width: 100%;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
	border-left: none;
}
:deep(.el-radio-button__inner) {
	border: none;
	margin-right: 20px;
}
:deep(.el-radio-button__inner) {
	padding: 3px;
	border-radius: 4px;
}
:deep(.el-form--inline .el-form-item) {
	margin-right: 0;
}
.dialog-footer {
	text-align: right;
}
</style>
