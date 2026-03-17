/**
 * BMS 专用 HTTP 客户端
 * baseURL 可通过 VITE_BMS_API 配置，默认 https://www.swslink.net
 * 认证方式：
 *  1）请求头 Authorization: Bearer <3rdsession>
 *  2）请求体字段 3rdsession
 */
import Axios, { type AxiosInstance } from "axios";
import { getBmsSession } from "@/utils/bmsAuth";
import { formatToken } from "@/utils/auth";

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
      config.headers = config.headers || {};
      config.headers["Authorization"] = formatToken(session);

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
  res => res.data,
  err => Promise.reject(err)
);

export { bmsHttp };
