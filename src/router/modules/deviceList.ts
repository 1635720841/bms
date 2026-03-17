export default [
  {
    path: "/device-list",
    name: "DeviceList",
    component: () => import("@/views/deviceList/index.vue"),
    meta: {
      icon: "ep/monitor",
      title: "BMS管理",
      showLink: true,
      rank: 1,
      keepAlive: true
    },

  },
  {
    path: "/device-list/bms-manage",
    name: "BmsManage",
    component: () => import("@/views/deviceList/BmsManage.vue"),
    meta: {
      icon: "typcn:battery-full",
      title: "BMS监控",
      showLink: true,
      rank: 2
    }
  },
  {
    path: "/warning-list",
    name: "WarningList",
    component: () => import("@/views/warningList/index.vue"),
    meta: {
      icon: "ep:warning",
      title: "告警列表",
      showLink: true,
      rank: 3,
      keepAlive: false
    }
  },
  {
    path: "/device-list/param-config",
    name: "DeviceParamConfig",
    component: () => import("@/views/deviceList/ParamConfig.vue"),
    meta: {
      title: "参数配置",
      showLink: false
    }
  },


] satisfies RouteConfigsTable[];
