<template>
  <el-form-item label="BT码">
    <div class="btcode-textarea-wrap">
      <el-input
        v-model="modelValue"
        type="textarea"
        :rows="3"
        readonly
        placeholder="逗号、换行分割；只填 1 个 BT码 时会自动应用到所有设备"
      />
      <div class="btcode-buttons">
        <el-button
          type="primary"
          class="btcode-copy-btn"
          :disabled="!modelValue"
          @click="handleCopyBtCodes"
        >
          复制
        </el-button>
        <el-button
          type="danger"
          class="btcode-clear-btn"
          style="margin-left: 0;"
          :disabled="!modelValue"
          @click="emit('update:btcodeText', '')"
        >
          清除
        </el-button>
      </div>
    </div>
    <div class="hint">数量：{{ btCount }}</div>
  </el-form-item>

  <div class="bt-rule-card">
    <div class="bt-rule-title">BT码生成规则</div>
    <div class="bt-rule-body">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="产品名称">
            <span>BT</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="材料体系">
            <el-select
              v-model="selectedMaterial"
              placeholder="请选择材料体系"
              style="width: 100%"
            >
              <el-option
                v-for="item in materialOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="电压等级">
            <el-select
              v-model="btVoltageValue"
              placeholder="30-99，可输入或选择"
              style="width: 100%"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in btVolOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="容量等级">
            <el-select
              v-model="btCapacityValue"
              placeholder="20-99，可输入或选择"
              style="width: 100%"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in btCapacityOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="循环寿命">
            <el-select
              v-model="btCycleLifeValue"
              placeholder="10-40，可输入或选择"
              style="width: 100%"
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="item in btLoopOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="厂家代码">
            <el-input
              v-model="btManufacturerValue"
              maxlength="4"
              placeholder="输入 4 位厂家代码（字母）"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="生产年份">
            <el-select
              v-model="btProductionYear"
              placeholder="请选择年份"
              style="width: 100%"
            >
              <el-option
                v-for="item in yearOptions"
                :key="item"
                :label="`${item}年`"
                :value="String(item).slice(2)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <div class="bt-rule-actions">
      <el-button @click="handleClearGenerateBtCode">清除</el-button>
      <el-button type="primary" @click="handleGenerateBtCodes">生产BT码</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";

interface MaterialOption {
  label: string;
  value: number;
}

const props = defineProps<{
  /** 文本框中的 BT 码（父组件使用 v-model:btcode-text 传入） */
  btcodeText: string;
  /** 当前 BT 码数量（父组件根据 btcodeText 解析后传入） */
  btCount: number;
  /** 已选设备编码列表，用于“生产BT码”时拼接后缀 */
  bmsIds: string[];
}>();

const emit = defineEmits<{
  (e: "update:btcodeText", value: string): void;
}>();

const modelValue = computed({
  get: () => props.btcodeText,
  set: value => emit("update:btcodeText", value)
});

const materialOptions: MaterialOption[] = [
  { label: "铁锂", value: 1 },
  { label: "三元", value: 2 }
];

const selectedMaterial = ref<number | null>(null);
const btVoltageValue = ref<string>("");
const btCapacityValue = ref<string>("");
const btCycleLifeValue = ref<string>("");
const btManufacturerValue = ref<string>("");
const btProductionYear = ref<string>(new Date().getFullYear().toString().slice(2));

const btVolOptions = ref<number[]>([]);
const btCapacityOptions = ref<number[]>([]);
const btLoopOptions = ref<number[]>([]);
const yearOptions = ref<number[]>([]);

function initOptions() {
  const vols: number[] = [48, 60, 72];
  for (let i = 30; i < 100; i += 1) {
    if (i !== 48 && i !== 60 && i !== 72) vols.push(i);
  }
  btVolOptions.value = vols;

  const caps: number[] = [30, 40, 50, 60];
  for (let i = 20; i < 100; i += 1) {
    if (i !== 30 && i !== 40 && i !== 50 && i !== 60) caps.push(i);
  }
  btCapacityOptions.value = caps;

  const loops: number[] = [];
  for (let i = 10; i <= 40; i += 5) {
    loops.push(i);
  }
  btLoopOptions.value = loops;

  const startYear = 1900;
  const endYear = 2100;
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y += 1) {
    years.push(y);
  }
  yearOptions.value = years;
}

initOptions();

function validateBtCodeInputs(): boolean {
  if (selectedMaterial.value == null) {
    ElMessage.warning("请先选择材料体系");
    return false;
  }

  const voltage = Number(btVoltageValue.value);
  if (Number.isNaN(voltage)) {
    ElMessage.warning("电压等级需为数字");
    return false;
  }
  if (voltage < 30 || voltage > 100) {
    ElMessage.warning("电压等级范围 30-99");
    return false;
  }

  const capacity = Number(btCapacityValue.value);
  if (Number.isNaN(capacity)) {
    ElMessage.warning("容量等级需为数字");
    return false;
  }
  if (capacity < 20 || capacity > 100) {
    ElMessage.warning("容量等级范围 20-99");
    return false;
  }

  const loop = Number(btCycleLifeValue.value);
  if (Number.isNaN(loop)) {
    ElMessage.warning("循环寿命需为数字");
    return false;
  }
  if (loop < 10 || loop > 40) {
    ElMessage.warning("循环寿命范围 10-40");
    return false;
  }

  if (!btManufacturerValue.value) {
    ElMessage.warning("请输入厂家代码");
    return false;
  }
  if (!/^[A-Za-z]+$/.test(btManufacturerValue.value)) {
    ElMessage.warning("厂家代码需为字母");
    return false;
  }

  const year = Number(btProductionYear.value);
  if (Number.isNaN(year)) {
    ElMessage.warning("请选择生产年份");
    return false;
  }

  return true;
}

function buildBtCodePrefix(): string {
  const materialCode = selectedMaterial.value ?? 0;
  const voltageCode = btVoltageValue.value.padStart(3, "0").substring(0, 3);
  const capacityCode = btCapacityValue.value.padStart(3, "0").substring(0, 3);
  const cycleLifeCode = btCycleLifeValue.value.padStart(2, "0").substring(0, 2);
  const manufacturerCode = btManufacturerValue.value.padEnd(4, "0").substring(0, 4);
  const yearCode = btProductionYear.value.padStart(2, "0").substring(0, 2);

  return `BT${materialCode}${voltageCode}${capacityCode}${cycleLifeCode}${manufacturerCode}${yearCode}`;
}

function handleGenerateBtCodes() {
  if (props.bmsIds.length === 0) {
    ElMessage.warning("请先输入设备编码");
    return;
  }
  if (!validateBtCodeInputs()) return;

  const prefix = buildBtCodePrefix();
  const codes = props.bmsIds.map(id => {
    const src = String(id ?? "");
    if (!src) return prefix;
    const endFix = src.length >= 7 ? src.slice(-7) : src.padStart(7, "0").substring(0, 7);
    return `${prefix}${endFix}`;
  });

  emit("update:btcodeText", codes.join("\n"));
  ElMessage.success("已根据规则生成 BT 码");
}

function handleClearGenerateBtCode() {
  selectedMaterial.value = null;
  btVoltageValue.value = "";
  btCapacityValue.value = "";
  btCycleLifeValue.value = "";
  btManufacturerValue.value = "";
  btProductionYear.value = "";
  emit("update:btcodeText", "");
}

async function handleCopyBtCodes() {
  if (!props.btcodeText) {
    ElMessage.warning("没有可复制的内容");
    return;
  }

  // 格式化BT码：添加序号
  const codes = props.btcodeText
    .split(/[\n,，]/)
    .map(code => code.trim())
    .filter(code => code);

  const formattedText = codes.map((code, index) => `${code}`).join("\n");

  try {
    await navigator.clipboard.writeText(formattedText);
    ElMessage.success("已复制到剪贴板");
  } catch (error) {
    // 降级方案：使用传统方法
    const textarea = document.createElement("textarea");
    textarea.value = formattedText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      ElMessage.success("已复制到剪贴板");
    } catch (err) {
      ElMessage.error("复制失败，请手动复制");
    } finally {
      document.body.removeChild(textarea);
    }
  }
}
</script>


<style scoped lang="scss">
.hint {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.btcode-textarea-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.btcode-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bt-rule-card {
  margin-top: 5px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.bt-rule-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.bt-rule-body {
  :deep(.el-form-item__label) {
    color: #475569;
    font-weight: 500;
  }
}

.bt-rule-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.inline-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-input {
  width: 140px;
}

.inline-select {
  width: 150px;
}
</style>

