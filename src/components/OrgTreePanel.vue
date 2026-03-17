<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  getOrgListReq,
  addOrgReq,
  updateOrgReq,
  getOrgDetailReq
} from "@/api/bms";
import type { BmsOrgNode } from "@/api/bms/types";
import { useBmsAuth } from "@/composables/useBmsAuth";

defineOptions({
  name: "OrgTreePanel"
});

const props = withDefaults(
  defineProps<{
    /** 是否显示组织管理操作按钮（新增 / 修改） */
    showManageActions?: boolean;
  }>(),
  {
    showManageActions: true
  }
);

const { mngOrg } = useBmsAuth();
const canAddOrg = computed(() => mngOrg.value.add);
const canEditOrg = computed(() => mngOrg.value.update);

const emit = defineEmits<{
  (e: "change", payload: { orgId: string | number; orgName: string }): void;
  (e: "clear"): void;
  /** 组织管理：新增子组织 */
  (e: "add", payload: { node: BmsOrgNode }): void;
  /** 组织管理：编辑当前组织 */
  (e: "edit", payload: { node: BmsOrgNode }): void;
}>();

const orgTreeData = ref<BmsOrgNode[]>([]);
const loadingOrg = ref(false);
const loadedOrgNodes = ref<Record<string, "loaded" | "loading" | "error">>({});
const selectedOrgName = ref("");
const orgTreeRef = ref<InstanceType<typeof import("element-plus").ElTree> | null>(null);

type OrgDialogMode = "add" | "edit";

const orgDialogVisible = ref(false);
const orgDialogMode = ref<OrgDialogMode>("add");
const orgDialogLoading = ref(false);
const currentOrgIdForEdit = ref<string | number | null>(null);

const orgDialogForm = reactive<{
  org_name: string;
  org_addr: string;
  org_tax_id: string;
  contact_person1: string;
  contact_number1: string;
  parent_org_id?: string | number;
  parent_org_name: string;
}>({
  org_name: "",
  org_addr: "",
  org_tax_id: "",
  contact_person1: "",
  contact_number1: "",
  parent_org_id: undefined,
  parent_org_name: ""
});

async function loadOrgChildren(node: any, resolve: (data: BmsOrgNode[]) => void) {
  const orgId = node.data.org_id;
  const orgIdStr = String(orgId);
  const sessionStr = localStorage.getItem("bms-session");
  const sessionData = sessionStr ? JSON.parse(sessionStr) : null;

  if (!node.data.org_name && sessionData) {
    resolve([
      {
        org_id: sessionData.account === "admin" ? null : sessionData.orgId,
        org_name: sessionData.account === "admin" ? "admin" : sessionData.orgName,
        isLeaf: false,
        _loading: false,
        children: []
      }
    ]);
    return;
  }

  // 如果已经加载过，直接返回
  if (loadedOrgNodes.value[orgIdStr] === "loaded") {
    resolve(node.data.children || []);
    return;
  }

  // 如果正在加载中，等待
  if (loadedOrgNodes.value[orgIdStr] === "loading") {
    resolve([]);
    return;
  }

  // 标记为加载中
  loadedOrgNodes.value[orgIdStr] = "loading";

  try {
    const res = await getOrgListReq({ org_id: orgId, next_only: 1 });
    if (res.errno === 0 && res.data?.orgList) {
      const children = res.data.orgList.map(item => ({
        ...item,
        isLeaf: item.isLeaf ?? false,
        _loading: false
      }));

      loadedOrgNodes.value[orgIdStr] = "loaded";
      resolve(children);
    } else {
      ElMessage.error(res.errmsg || "获取子组织失败");
      loadedOrgNodes.value[orgIdStr] = "error";
      resolve([]);
    }
  } catch (error) {
    console.error("加载子组织失败:", error);
    ElMessage.error("网络错误，请重试");
    loadedOrgNodes.value[orgIdStr] = "error";
    resolve([]);
  }
}

function handleOrgNodeClick(data: BmsOrgNode) {
  selectedOrgName.value = data.org_name;
  emit("change", { orgId: data.org_id, orgName: data.org_name });
}

/** 点击“新增子组织” */
function handleAddNode(node: BmsOrgNode) {
  if (!canAddOrg.value) {
    ElMessage.warning("当前账号无创建组织权限");
    return;
  }
  orgDialogMode.value = "add";
  currentOrgIdForEdit.value = null;
  orgDialogForm.org_name = "";
  orgDialogForm.org_addr = "";
  orgDialogForm.org_tax_id = "";
  orgDialogForm.contact_person1 = "";
  orgDialogForm.contact_number1 = "";

  if (String(node.org_id) === "-1") {
    orgDialogForm.parent_org_id = undefined;
    orgDialogForm.parent_org_name = "根组织";
  } else {
    orgDialogForm.parent_org_id = node.org_id;
    orgDialogForm.parent_org_name = node.org_name;
  }

  orgDialogVisible.value = true;
  emit("add", { node });
}

/** 点击“编辑当前组织” */
async function handleEditNode(node: BmsOrgNode) {
  if (!canEditOrg.value) {
    ElMessage.warning("当前账号无修改组织权限");
    return;
  }
  // 根节点不允许编辑（与小程序保持一致）
  if (String(node.org_id) === "-1") return;

  orgDialogMode.value = "edit";
  currentOrgIdForEdit.value = node.org_id;
  orgDialogVisible.value = true;
  orgDialogLoading.value = true;

  try {
    const res = await getOrgDetailReq({ org_id: node.org_id, name: node.org_name });
    if (res.errno === 0 && res.data) {
      const detail = res.data;
      orgDialogForm.org_name = detail.org_name ?? node.org_name;
      orgDialogForm.org_addr = detail.org_addr ?? "";
      orgDialogForm.org_tax_id = detail.org_tax_id ?? "";
      orgDialogForm.contact_person1 = detail.contact_person1 ?? "";
      orgDialogForm.contact_number1 = detail.contact_number1 ?? "";

      if (detail.parent_org_id != null && String(detail.parent_org_id) !== "-1") {
        orgDialogForm.parent_org_id = detail.parent_org_id;
        orgDialogForm.parent_org_name = detail.parent_org_name ?? "";
      } else {
        orgDialogForm.parent_org_id = undefined;
        orgDialogForm.parent_org_name = "根组织";
      }
    } else {
      ElMessage.error(res.errmsg || "获取组织详情失败");
      orgDialogVisible.value = false;
    }
  } catch (error) {
    console.error("获取组织详情失败:", error);
    ElMessage.error("网络错误，请重试");
    orgDialogVisible.value = false;
  } finally {
    orgDialogLoading.value = false;
  }

  emit("edit", { node });
}

function validateOrgDialogForm(): boolean {
  if (!orgDialogForm.org_name.trim()) {
    ElMessage.warning("请先输入组织名称");
    return false;
  }
  if (!orgDialogForm.contact_person1.trim()) {
    ElMessage.warning("请先输入联系人姓名");
    return false;
  }
  if (!orgDialogForm.contact_number1.trim()) {
    ElMessage.warning("请先输入联系人电话");
    return false;
  }
  return true;
}

async function handleOrgDialogConfirm() {
  if (!validateOrgDialogForm()) return;

  orgDialogLoading.value = true;
  try {
    if (orgDialogMode.value === "add") {
      const payload = {
        org_name: orgDialogForm.org_name.trim(),
        contact_person1: orgDialogForm.contact_person1.trim(),
        contact_number1: orgDialogForm.contact_number1.trim(),
        org_addr: orgDialogForm.org_addr.trim() || undefined,
        org_tax_id: orgDialogForm.org_tax_id.trim() || undefined,
        parent_org_id: orgDialogForm.parent_org_id,
        parent_org_name: orgDialogForm.parent_org_name || undefined
      };

      const res = await addOrgReq(payload);
      if (res.errno === 0) {
        ElMessage.success("新增组织成功");
        orgDialogVisible.value = false;
        const parentIdStr = orgDialogForm.parent_org_id != null ? String(orgDialogForm.parent_org_id) : null;
        // 清除父节点的缓存
        if (parentIdStr) {
          delete loadedOrgNodes.value[parentIdStr];
        }
        // 在下一个 tick 中处理父节点的展开，以触发重新加载
        await nextTick();
        if (parentIdStr && orgTreeRef.value) {
          const parentNode = orgTreeRef.value.getNode(parentIdStr);
          if (parentNode) {
            if (parentNode.expanded) {
              // 如果已展开，先收起再展开以触发重新加载
              parentNode.collapse();
              await nextTick();
              parentNode.loaded = false;
              parentNode.expand();
            } else {
              // 如果未展开，直接展开以加载子节点
              parentNode.loaded = false;
              parentNode.expand();
            }
          }
        }
      } else {
        ElMessage.error(res.errmsg || "新增组织失败");
      }
    } else if (orgDialogMode.value === "edit") {
      const payload = {
        org_name: orgDialogForm.org_name.trim(),
        contact_person1: orgDialogForm.contact_person1.trim(),
        contact_number1: orgDialogForm.contact_number1.trim(),
        org_addr: orgDialogForm.org_addr.trim() || undefined,
        org_tax_id: orgDialogForm.org_tax_id.trim() || undefined,
        parent_org_id: orgDialogForm.parent_org_id,
        parent_org_name: orgDialogForm.parent_org_name || undefined
      };

      const res = await updateOrgReq(payload);
      if (res.errno === 0) {
        ElMessage.success("修改组织成功");
        orgDialogVisible.value = false;
        const currentIdStr = currentOrgIdForEdit.value != null ? String(currentOrgIdForEdit.value) : null;
        const parentIdStr = orgDialogForm.parent_org_id != null ? String(orgDialogForm.parent_org_id) : null;
        // 清除当前节点和父节点的缓存
        if (currentIdStr) {
          delete loadedOrgNodes.value[currentIdStr];
        }
        if (parentIdStr) {
          delete loadedOrgNodes.value[parentIdStr];
        }
        // 在下一个 tick 中处理父节点的展开，以触发重新加载
        await nextTick();
        if (parentIdStr && orgTreeRef.value) {
          const parentNode = orgTreeRef.value.getNode(parentIdStr);
          if (parentNode) {
            if (parentNode.expanded) {
              // 如果已展开，先收起再展开以触发重新加载
              parentNode.collapse();
              await nextTick();
              parentNode.loaded = false;
              parentNode.expand();
            } else {
              // 如果未展开，直接展开以加载子节点
              parentNode.loaded = false;
              parentNode.expand();
            }
          }
        }
      } else {
        ElMessage.error(res.errmsg || "修改组织失败");
      }
    }
  } catch (error) {
    console.error("提交组织信息失败:", error);
    ElMessage.error("网络错误，请重试");
  } finally {
    orgDialogLoading.value = false;
  }
}

function clearOrgSelection() {
  selectedOrgName.value = "";
  emit("clear");
}

onMounted(() => {
  // 根节点由 loadOrgChildren 处理，无需单独加载
});
</script>

<template>
  <div class="bms-org-tree-panel">
    <div class="org-tree-header">
      <svg class="org-tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="org-tree-title">组织列表</span>
    </div>
    <div class="org-tree-content">
      <el-tree
        ref="orgTreeRef"
        v-loading="loadingOrg"
        element-loading-text="加载中..."
        :props="{
          children: 'children',
          label: 'org_name',
          isLeaf: (data: BmsOrgNode) => data.isLeaf === true
        }"
        node-key="org_id"
        :default-expand-all="false"
        :highlight-current="true"
        :lazy="true"
        :load="loadOrgChildren"
        @node-click="handleOrgNodeClick"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <!-- 加载中状态 -->
            <svg
              v-if="loadedOrgNodes[String(data.org_id)] === 'loading'"
              class="tree-node-icon loading-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <!-- 用户组图标 -->
            <svg class="tree-node-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="tree-node-label">{{ node.label }}</span>

            <!-- 组织管理操作：新增 / 修改 -->
            <span
              v-if="props.showManageActions && (canAddOrg || canEditOrg)"
              class="tree-node-actions"
              @click.stop
            >
              <!-- 新增子组织 -->
              <svg
                v-if="canAddOrg"
                class="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                @click="handleAddNode(data)"
              >
                <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

              <!-- 编辑组织：根节点（org_id = -1）不允许编辑 -->
              <svg
                v-if="canEditOrg && String(data.org_id) !== '-1'"
                class="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                @click="handleEditNode(data)"
              >
                <path
                  d="M15.232 5.232l3.536 3.536M4 20h4.243L19.07 9.172a1 1 0 000-1.414l-2.828-2.828a1 1 0 00-1.414 0L4 16.757V20z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </span>
        </template>
      </el-tree>
    </div>
    <div v-if="selectedOrgName" class="org-selected-info">
      <svg class="selected-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="selected-label">已选择：</span>
      <span class="selected-value">{{ selectedOrgName }}</span>
      <svg
        class="clear-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        @click="clearOrgSelection"
      >
        <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- 新增 / 编辑组织弹窗 -->
    <el-dialog
      v-model="orgDialogVisible"
      :title="orgDialogMode === 'add' ? '新增组织' : '修改组织'"
      width="520px"
      append-to-body
    >
      <el-form
        v-loading="orgDialogLoading"
        label-width="90px"
        class="org-dialog-form"
      >
        <el-form-item label="上级组织">
          <el-input
            v-model="orgDialogForm.parent_org_name"
            disabled
            placeholder="根组织"
          />
        </el-form-item>
        <el-form-item label="组织名称" required>
          <el-input
            v-model="orgDialogForm.org_name"
            :disabled="orgDialogMode === 'edit'"
            placeholder="请输入组织名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="联系人" required>
          <el-input
            v-model="orgDialogForm.contact_person1"
            placeholder="请输入联系人姓名"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input
            v-model="orgDialogForm.contact_number1"
            placeholder="请输入联系人电话"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="orgDialogForm.org_addr"
            placeholder="可选：请输入地址"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="税号">
          <el-input
            v-model="orgDialogForm.org_tax_id"
            placeholder="可选：请输入税号"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="orgDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="orgDialogLoading"
          @click="handleOrgDialogConfirm"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.bms-org-tree-panel {
  width: 280px;
  min-width: 280px;
  height: calc(100vh - 150px);
  background: var(--bms-bg-card);
  border-radius: 12px;
  border: 1px solid var(--bms-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.org-tree-header {
  padding: 20px;
  border-bottom: 1px solid var(--bms-border);
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(0, 150, 136, 0.05) 100%);
}

.org-tree-icon {
  width: 24px;
  height: 24px;
  color: var(--bms-primary);
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 188, 212, 0.2));
}

.org-tree-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bms-text);
  letter-spacing: 0.3px;
}

.org-tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 188, 212, 0.3);
    border-radius: 3px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(0, 188, 212, 0.5);
    }
  }
}

.org-selected-info {
  padding: 14px 20px;
  border-top: 1px solid var(--bms-border);
  background: rgba(0, 188, 212, 0.06);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;

  .selected-icon {
    width: 16px;
    height: 16px;
    color: var(--bms-primary);
    flex-shrink: 0;
  }

  .selected-label {
    color: var(--bms-text-secondary);
  }

  .selected-value {
    color: var(--bms-primary);
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .clear-icon {
    width: 16px;
    height: 16px;
    color: var(--bms-text-secondary);
    flex-shrink: 0;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #f56c6c;
    }
  }
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 2px 0;
  cursor: pointer;
}

.tree-node-icon {
  width: 18px;
  height: 18px;
  color: var(--bms-text-secondary);
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.loading-icon {
  animation: rotate 1s linear infinite;
  color: var(--bms-primary);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tree-node-label {
  font-size: 14px;
  color: var(--bms-text);
  transition: color 0.2s ease;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: var(--bms-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: var(--bms-primary);
    transform: translateY(-1px);
  }
}

::deep(.el-tree) {
  background: transparent;
  color: var(--bms-text);

  .el-tree-node__content {
    background: transparent;
    border-radius: 8px;
    padding: 10px 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background: rgba(0, 188, 212, 0.08);

      .tree-node-label {
        color: var(--bms-primary);
      }

      .tree-node-icon {
        color: var(--bms-primary);
      }
    }
  }

  .el-tree-node.is-current > .el-tree-node__content {
    background: rgba(0, 188, 212, 0.12);

    .tree-node-label {
      color: var(--bms-primary);
      font-weight: 500;
    }

    .tree-node-icon {
      color: var(--bms-primary);
    }
  }

  .el-tree-node__expand-icon {
    color: var(--bms-text-secondary);
    font-size: 14px;
    transition: transform 0.2s ease, color 0.2s ease;

    &.is-leaf {
      color: transparent;
    }

    &:hover {
      color: var(--bms-primary);
    }
  }
}

::deep(.el-tree-node__loading-icon) {
  display: none;
}
</style>


