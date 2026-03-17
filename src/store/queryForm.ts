import { defineStore } from "pinia";

export const useQueryFormStore = defineStore("query-form", {
  state: () => ({
    formData: {} as Record<string, unknown>
  }),
  actions: {
    setFormDataFn(data: Record<string, unknown>) {
      this.formData = data;
    },
    queryBtn(_form: Record<string, unknown>, _pageName?: string) {
      // 供 TableSearch 调用，BMS 暂不需要跨页面缓存
    }
  }
});
