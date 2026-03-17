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
const btVoltageValue = ref<string>("048");
const btCapacityValue = ref<string>("020");
const btCycleLifeValue = ref<string>("12");
const btManufacturerValue = ref<string>("00SW");
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

  const now = new Date();
  const year = Number(now.getFullYear().toString().slice(2));
  yearOptions.value = [year - 1, year, year + 1];
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
</script>

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
      <el-button
        type="primary"
        
        class="btcode-clear-btn"
        :disabled="!modelValue"
        @click="emit('update:btcodeText', '')"
      >
        清除
      </el-button>
    </div>
    <div class="hint">数量：{{ btCount }}</div>
  </el-form-item>

  <div class="bt-rule-card">
    <div class="bt-rule-title">BT码生成规则</div>
    <div class="bt-rule-body">
      <div class="bt-rule-col">
        <el-form-item label="产品名称">
          <span>BT</span>
        </el-form-item>

        <el-form-item label="电压等级">
          <div class="inline-group">
            <el-input
              v-model="btVoltageValue"
              type="number"
              placeholder="30-99"
              class="inline-input"
            />
            <el-select
              v-model="btVoltageValue"
              class="inline-select"
              placeholder="快速选择"
            >
              <el-option
                v-for="item in btVolOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="循环寿命">
          <div class="inline-group">
            <el-input
              v-model="btCycleLifeValue"
              type="number"
              placeholder="10-40"
              class="inline-input"
            />
            <el-select
              v-model="btCycleLifeValue"
              class="inline-select"
              placeholder="快速选择"
            >
              <el-option
                v-for="item in btLoopOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="生产年份">
          <el-select
            v-model="btProductionYear"
            placeholder="请选择年份"
            style="width: 140px"
          >
            <el-option
              v-for="item in yearOptions"
              :key="item"
              :label="`20${item}`"
              :value="String(item).padStart(2, '0')"
            />
          </el-select>
        </el-form-item>
      </div>

      <div class="bt-rule-col">
        <el-form-item label="材料体系">
          <el-select
            v-model="selectedMaterial"
            placeholder="请选择材料体系"
            style="width: 160px"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="容量等级">
          <div class="inline-group">
            <el-input
              v-model="btCapacityValue"
              type="number"
              placeholder="20-99"
              class="inline-input"
            />
            <el-select
              v-model="btCapacityValue"
              class="inline-select"
              placeholder="快速选择"
            >
              <el-option
                v-for="item in btCapacityOptions"
                :key="item"
                :label="item"
                :value="String(item)"
              />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="厂家代码">
          <el-input
            v-model="btManufacturerValue"
            maxlength="4"
            placeholder="输入 4 位厂家代码（字母）"
            style="width: 200px"
          />
        </el-form-item>
      </div>
    </div>

    <div class="bt-rule-actions">
      <el-button @click="handleClearGenerateBtCode">清除</el-button>
      <el-button type="primary" @click="handleGenerateBtCodes">生产BT码</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hint {
  margin-top: 6px;
  color: var(--bms-text-secondary);
  font-size: 12px;
}
.btcode-textarea-wrap{
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.bt-rule-card {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--bms-border);
  background: var(--bms-bg-card);
}

.bt-rule-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--bms-text);
}

.bt-rule-body {
  display: flex;
  gap: 24px;
}

.bt-rule-col {
  flex: 1;
  min-width: 0;
}

.bt-rule-actions {
  margin-top: 8px;
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

