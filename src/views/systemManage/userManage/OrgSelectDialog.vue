<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { getOrgListReq } from "@/api/bms";
import type { BmsOrgNode } from "@/api/bms/types";

defineOptions({
  name: "OrgSelectDialog"
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "select", org: { org_id: string | number; org_name: string }): void;
}>();

const visible = ref(false);
const loading = ref(false);
const selectedOrg = ref<BmsOrgNode | null>(null);
const orgTreeRef = ref();
const loadedOrgNodes = ref<Record<string, boolean>>({});

watch(
  () => props.modelValue,
  val => {
    visible.value = val;
  }
);

watch(visible, val => {
  emit("update:modelValue", val);
});

async function loadOrgChildren(node: any, resolve: (data: BmsOrgNode[]) => void) {
  const orgId = node.data.org_id;
  const orgIdStr = String(orgId);
  const sessionStr = localStorage.getItem("bms-session");
  const sessionData = JSON.parse(sessionStr);
  if (!node.data.org_name) {
    resolve([{
      org_id: sessionData.account === "admin" ? null : sessionData.orgId,
      org_name: sessionData.account === "admin" ? "admin" : sessionData.orgName,
      isLeaf: false,
      _loading: false,
      children: []
    }]);
    return;
  }
  // 如果已经加载过，直接返回
  if (loadedOrgNodes.value[orgIdStr]) {
    resolve(node.data.children || []);
    return;
  }

  try {
    const res = await getOrgListReq({ org_id: orgId, next_only: 1 });

    if (res.errno === 0 && res.data?.orgList) {
      const children = res.data.orgList.map(item => ({
        org_id: item.org_id,
        org_name: item.org_name,
        parent_org_id: item.parent_org_id,
        isLeaf: item.isLeaf ?? false
      }));

      loadedOrgNodes.value[orgIdStr] = true;
      resolve(children);
    } else {
      ElMessage.error(res.errmsg || "获取子组织失败");
      resolve([]);
    }
  } catch (error) {
    console.error("加载子组织失败:", error);
    ElMessage.error("网络错误，请重试");
    resolve([]);
  }
}

function handleNodeClick(node: BmsOrgNode) {
  selectedOrg.value = node;
}

function handleConfirm() {
  if (!selectedOrg.value) {
    ElMessage.warning("请选择组织");
    return;
  }
  emit("select", {
    org_id: selectedOrg.value.org_id,
    org_name: selectedOrg.value.org_name
  });
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="选择组织"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="org-select-content">
      <el-tree
        ref="orgTreeRef"
        node-key="org_id"
        :props="{
          label: 'org_name',
          children: 'children',
          isLeaf: (data: BmsOrgNode) => data.isLeaf === true
        }"
        :expand-on-click-node="false"
        :highlight-current="true"
        :lazy="true"
        :load="loadOrgChildren"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <svg class="tree-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="tree-node-label">{{ data.org_name }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.org-select-content {
  min-height: 300px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #606266;
  box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.25);

  /* 自定义滚动条样式（主要适配 Chrome / Edge） */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.8); /* #94a3b8 */
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #60a5fa;
  }
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 4px 0;
}

.tree-node-icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.tree-node-label {
  font-size: 14px;
  color: #606266;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Element Plus Tree 深色主题适配 */
:deep(.el-tree) {
  background: transparent;
  color: #606266;

  .el-tree-node__content {
    background: transparent;
    border-radius: 6px;
    padding: 8px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 188, 212, 0.08);
    }
  }

  .el-tree-node.is-current > .el-tree-node__content {
    background: rgba(0, 188, 212, 0.12);

    .tree-node-label {
      color: #60a5fa;
      font-weight: 500;
    }

    .tree-node-icon {
      color: #60a5fa;
    }
  }

  .el-tree-node__expand-icon {
    color: #94a3b8;
    transition: transform 0.2s ease, color 0.2s ease;

    &.is-leaf {
      color: transparent;
    }

    &:hover {
      color: #60a5fa;
    }
  }
}

/* 对话框深色适配 */
:deep(.el-dialog) {
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__title) {
  color: #606266;
}

:deep(.el-dialog__close) {
  color: #94a3b8;

  &:hover {
    color: #60a5fa;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-button--primary) {
  background: #60a5fa;
  border-color: #60a5fa;
}

:deep(.el-button--primary:hover) {
  background: #60a5fa;
  border-color: #60a5fa;
}
</style>





