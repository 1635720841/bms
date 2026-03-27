/**
 * BMS 专用 HTTP 客户端
 * baseURL 可通过 VITE_BMS_API 配置，默认 https://www.swslink.net
 * 认证方式：
 *  1）请求头 Authorization: Bearer <3rdsession>
 *  2）请求体字段 3rdsession
 */
import Axios, { AxiosHeaders, type AxiosInstance } from "axios";
import { getBmsSession, removeBmsSession } from "@/utils/bmsAuth";
import { formatToken } from "@/utils/auth";
import { router } from "@/router";
import { ElMessage } from "element-plus";

type BmsApiEnvelope = { errno?: number; errmsg?: string; data?: unknown };

let authInvalidNotified = false;
let authInvalidRedirectTimer: number | null = null;

function redirectToLoginWithDelayOnce(message: string, delayMs = 3000) {
  if (authInvalidNotified) return;
  authInvalidNotified = true;

  ElMessage.warning(message);

  if (authInvalidRedirectTimer) {
    window.clearTimeout(authInvalidRedirectTimer);
  }

  authInvalidRedirectTimer = window.setTimeout(() => {
    removeBmsSession();
    const currentPath = router.currentRoute.value.fullPath;
    if (router.currentRoute.value.path !== "/login") {
      // router 有时在应用启动早期不可用，这里做兜底
      router.replace({ path: "/login", query: { redirect: currentPath } }).catch(() => {
        window.location.href = "/login";
      });
    }
  }, delayMs);
}

function handleAuthInvalid(data: unknown): Error | null {
  if (!data || typeof data !== "object" || !("errno" in data)) return null;
  const { errno, errmsg } = data as BmsApiEnvelope;
  if (errno === 2000 || errno === 1020) {
    const msg =
      errmsg ?? (errno === 2000 ? "会话过期，请重新登录" : "请求缺少令牌参数，请联系客户以及技术人员处理");
    redirectToLoginWithDelayOnce(`${msg}，${Math.ceil(3000 / 1000)}秒后跳转登录页`);
    return new Error(msg);
  }
  return null;
}

const BMS_BASE_URL =
  import.meta.env.VITE_BMS_API ??
  (import.meta.env.DEV ? "/bms-api" : "/");

const bmsHttp: AxiosInstance = Axios.create({
  baseURL: BMS_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

/** 请求头自动注入 Authorization: Bearer <3rdsession>（login 除外），并在 body 中补充 3rdsession */
bmsHttp.interceptors.request.use(config => {
  const isLogin = (config.url ?? "").includes("/login");
  if (!isLogin) {
    const session = getBmsSession();
    if (session) {
      // 1）请求头携带 Authorization
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", formatToken(session));

      // 2）请求体补充 3rdsession（仅对象类型 data）
      if (config.data && typeof config.data === "object") {
        if (!("3rdsession" in config.data)) {
          config.data["3rdsession"] = session;
        }
      }
    }
  }

  return config;
});

bmsHttp.interceptors.response.use(
  // @ts-expect-error 业务层期望直接拿到 res.data
  res => {
    const data = res.data as unknown;
    const authErr = handleAuthInvalid(data);
    if (authErr) return Promise.reject(authErr);
    return data;
  },
  err => {
    const data = (err as { response?: { data?: unknown } })?.response?.data;
    const authErr = handleAuthInvalid(data);
    if (authErr) return Promise.reject(authErr);
    return Promise.reject(err);
  }
);

export { bmsHttp };
