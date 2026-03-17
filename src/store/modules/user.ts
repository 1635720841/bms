import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import {
  type UserResult,
  type RefreshTokenResult,
  getLogin,
  refreshTokenApi
} from "@/api/user";
import {
  bmsLoginReq,
  handleBmsLoginSuccess,
  bmsLogout
} from "@/api/bms";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, setToken, removeToken, userKey } from "@/utils/auth";

export const useUserStore = defineStore("pure-user", {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            if (data?.success) setToken(data.data);
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** BMS 登入 */
    async loginByBms(data: { username: string; password: string }) {
      return new Promise<UserResult>((resolve, reject) => {
        bmsLoginReq(data.username, data.password)
          .then(res => {
            if (res?.errno === 0 && res?.data) {
              const sessionData = handleBmsLoginSuccess(res, data.username);
              setToken({
                accessToken: sessionData.session,
                refreshToken: sessionData.session,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                username: sessionData.account,
                nickname: sessionData.orgName,
                roles: ["bms"],
                permissions: [] // BMS 权限通过 auth 对象管理，不使用 permissions 数组
              });
              resolve({
                success: true,
                data: {
                  accessToken: sessionData.session,
                  refreshToken: sessionData.session,
                  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  username: sessionData.account,
                  nickname: sessionData.orgName,
                  avatar: "",
                  roles: ["bms"],
                  permissions: [] // BMS 权限通过 auth 对象管理，不使用 permissions 数组
                }
              } as UserResult);
            } else {
              reject(
                new Error(
                  res?.errmsg ??
                  (res?.errno === 1000
                    ? "账号或密码错误"
                    : res?.errno === 1001
                      ? "安全性校验失败"
                      : "登录失败")
                )
              );
            }
          })
          .catch(error => reject(error));
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      removeToken();
      bmsLogout();
      // 清除 BMS 管理的 sessionStorage 缓存
      try {
        sessionStorage.removeItem("bms_manage_current_bmsId");
      } catch {
        // 忽略清除错误
      }
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<RefreshTokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(data => {
            if (data) {
              setToken(data.data);
              resolve(data);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
