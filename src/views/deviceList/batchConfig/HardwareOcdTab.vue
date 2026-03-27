
<template>
  <div class="hardware-ocd-tab">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="触发门限(A)">
          <el-input :model-value="props.hardwareOcd?.T ?? '--'" disabled />
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="延时(S)">
          <el-input :model-value="props.hardwareOcd?.D ?? '--'" disabled />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="14">
        <el-form-item label="恢复门限(A)">
          <el-input :model-value="props.hardwareOcd?.RT ?? '--'" disabled />
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label="恢复延时(S)">
          <el-input :model-value="props.hardwareOcd?.RD ?? '--'" disabled />
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "HardwareOcdTab" });

const props = defineProps<{
  /** 硬件级放电过流参数（单位已换算：电流 A，时间 S） */
  hardwareOcd?: {
    T?: number;
    D?: number;
    RT?: number;
    RD?: number;
  };
}>();
</script>

<style scoped lang="scss">
.hardware-ocd-tab {
  margin-top: 4px;
}
</style>

