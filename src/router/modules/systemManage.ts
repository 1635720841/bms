const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/system-manage",
    name: "SystemManage",
    component: Layout,
    redirect: "/system-manage/user-manage",
    meta: {
      icon: "ep:tools",
      title: "更多管理",
      rank: 10,
      // BMS 权限标识：需要用户列表权限才显示此菜单
      bmsAuth: ["mng", "usr", "list"]
    },
    children: [
      {
        path: "/system-manage/user-manage",
        name: "UserManage",
        component: () => import("@/views/systemManage/userManage/index.vue"),
        meta: {
          title: "用户管理",
          showLink: true,
          keepAlive: true,
          // 子路由也需要权限标识
          bmsAuth: ["mng", "usr", "list"]
        }
      },
      {
        path: "/system-manage/production-manage",
        name: "ProductionManage",
        component: () => import("@/views/systemManage/productionManage/index.vue"),
        meta: {
          title: "生产管理",
          showLink: true,
          keepAlive: true,
          // 生产配置权限：对应小程序 auth.mng.fac.update
          bmsAuth: ["mng", "fac", "update"]
        }
      }
    ]
  }
] satisfies RouteConfigsTable[];

