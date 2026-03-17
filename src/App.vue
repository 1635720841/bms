<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  computed: {
    currentLocale() {
      return zhCn;
    }
  }
});
</script>
<style lang="scss">
/* 全局滚动条样式设计 */
* {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: #94a3b8;
    }
  }

  &::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }
}

/* 全局弹窗外框样式（保持不变） */
.el-loading-mask{
 opacity: 0.3 !important;
  //background-color: rgba(255, 255, 255, 0.3) !important;
}
html.dark .pure-scrollbar{
  border-color: rgb(63, 64, 66) !important;
}
.el-popper.is-light{
      background: #ffffff !important;
      // border: none !important;
      border-color: transparent !important;
      border-radius: 8px !important;
      // padding: 4px 12px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #606266 !important;
      background: #ffffff !important;
      box-shadow: 0 0 0 1px #e2e8f0 inset !important;
      transition: all 0.2s ease !important;

    }
    .el-dropdown-menu,.el-dropdown-menu__item:not(.is-disabled):focus{
      background: #ffffff !important;
      border-radius: 8px !important;
      .el-dropdown-menu__item{
        color: #606266;
      }
    }
    .el-popper.is-light>.el-popper__arrow:before{
      background-color: #ffffff !important;
      border-top-color: #e2e8f0 !important;
      border-left-color: #e2e8f0 !important;
    }
    .el-select-dropdown__item{
      color: #606266 !important;
    }
      .el-select-dropdown__item.is-hovering{
        background: #e6e6e6 !important;
        color: #606266 !important;
      }
.el-dialog {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  background: #ffffff !important;

  /* 滚动条样式设计 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: #94a3b8;
    }
  }

  ::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }
  /* 下拉选择框内部文字 */
  .el-select__wrapper .el-select__selected-item,
  .el-select .el-input__inner {
    color: #606266;
    // -webkit-text-fill-color: #606266 !important;
  }
  .is-transparent{
    color: #cbd5e1 !important;
  }
  .el-input__inner , .el-textarea__inner{
    color: #606266 !important;
    // -webkit-text-fill-color: #606266 !important;
  }
  .el-input__wrapper, .el-textarea__inner{
    background-color: #ffffff !important;
    box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  }
  .el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):not(.el-button--danger):not(.el-button--info) {
    border-color: #dcdfe6 !important;
    color: #606266 !important;
    background-color: #ffffff !important;
  }
  .el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):not(.el-button--danger):not(.el-button--info):hover {
    background-color: #60a5fa !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
    border-color: #60a5fa !important;
  }
  .el-form-item__label{
    color: #606266 !important;
  }
  .el-radio__label {
    color: #606266 !important;
  }
  .el-textarea__inner:hover{
    box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  }
  .el-dialog__close:hover {
    background-color: #858585 !important;
    color: #0e0e0e !important;
  }

  .el-select__input {
    color: #000000 !important;
  }

  .el-dialog__header {
    background: #ffffff;
    margin-right: 0;
    padding: 10px 24px;
    border-radius: 20px 20px 0 0; /* 修复 header 圆角 */
    border-bottom: 1px solid #f1f5f9;
  }

  .el-dialog__headerbtn {
    top: 20px; /* 调整关闭按钮位置 */
    right: 20px;

    .el-dialog__close {
      color: #94a3b8;
      font-size: 20px;
      &:hover {
        color: #0f172a;
      }
    }
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .el-dialog__body {
    padding: 0 !important;
    background: #ffffff;
    border-radius: 0 0 20px 20px; /* 修复 body 底部圆角 */

    /* 内容区域滚动条样式 */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
      transition: background 0.2s ease;

      &:hover {
        background: #94a3b8;
      }
    }

    ::-webkit-scrollbar-corner {
      background: #f1f5f9;
    }
  }

  /* 弹框内的加载背景 */
  .el-loading-mask {
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  /* 全局弹窗外框样式（保持不变） */
  .el-popper.is-light {
    background: #ffffff !important;
    // border: 1px solid #e2e8f0 !important;
    // border-color: transparent !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    color: #606266 !important;
    box-shadow: 0 0 0 1px #e2e8f0 inset !important;
    transition: all 0.2s ease !important;
  }
.el-select__wrapper{
  border: 1px solid #cccccc !important;
  box-shadow: none;
}
.el-select__wrapper:hover{
  border: 1px solid #94a3b8 !important;
  box-shadow: none;
}
.el-select__wrapper.is-hovering:not(.is-focused){
  border: 1px solid #94a3b8 !important;
  box-shadow: none;
}
  .el-popper.is-light > .el-popper__arrow:before {
    background-color: #ffffff !important;
    border-top-color: #e2e8f0 !important;
    border-left-color: #e2e8f0 !important;
  }

  .el-select-dropdown__item {
    color: #606266 !important;
  }

  .el-select-dropdown__item.is-hovering {
    background: #e6e6e6 !important;
    color: #606266 !important;
  }
  .el-button.is-text:not(.is-disabled).is-has-bg{
    background-color: #60a5fa !important;
    color: #ffffff !important;
    border-color: #60a5fa !important;
  }
  .el-button--primary.is-plain{
    background-color: #60a5fa !important;
    color: #ffffff !important;
    border-color: #60a5fa !important;
  }

// 表格
  .el-table {
    --el-table-text-color: #303133;
    --el-table-header-text-color: #303133;
  }
 .el-pagination {
    .el-pagination__total,
    .btn-prev,
    .btn-next,
    .el-pager li {
      color: #606266;
    }
  }
 .el-pagination.is-background .el-pager li{
  background-color: #fff;
  border: 1px solid #e2e8f0;
 }
 .el-pagination.is-background .btn-next, .el-pagination.is-background .btn-prev, .el-pagination.is-background .el-pager li{
  background-color: #f0f2f5 !important;
  color: #303133 !important;
 }
.el-pagination.is-background .btn-next.is-active, .el-pagination.is-background .btn-prev.is-active, .el-pagination.is-background .el-pager li.is-active{
  background-color: #409eff !important;
  color: #ffffff !important;
}
}
.el-popper.is-light{
  // border: 1px solid rgba(28, 33, 40, 0.01) !important;
}

/* 关闭 el-zoom-in-top 的缩放/位移动画，只保留很轻的透明度过渡 */
.el-popper.el-zoom-in-top-enter-active,
.el-popper.el-zoom-in-top-leave-active {
  transition: opacity 0.32s ease-out !important;
}

.el-popper.el-zoom-in-top-enter-from,
.el-popper.el-zoom-in-top-leave-to {
  opacity: 0;
  transform: none !important;
}

.el-popper.el-zoom-in-top-enter-to,
.el-popper.el-zoom-in-top-leave-from {
  opacity: 1;
  transform: none !important;
}
</style>
