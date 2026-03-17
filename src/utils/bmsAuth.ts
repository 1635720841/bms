/**
 * BMS 登录态存储
 * 存储 3rdsession、组织、权限等
 */
import { storageLocal } from "@pureadmin/utils";
import type { BmsAuth } from "@/api/bms/types";

export const BMS_SESSION_KEY = "bms-session";
export const BMS_ORG_KEY = "bms-login-org";
export const BMS_ACCOUNT_KEY = "bms-account";

export interface BmsSessionData {
  /** 会话标识 */
  session: string;
  /** 组织ID */
  orgId: string;
  /** 组织名称 */
  orgName: string;
  /** 账号 */
  account: string;
  /** 权限对象 */
  auth?: BmsAuth;
}

export function getBmsSession(): string {
  const data = storageLocal().getItem<BmsSessionData>(BMS_SESSION_KEY);
  return data?.session ?? "";
}

export function setBmsSession(data: BmsSessionData): void {
  storageLocal().setItem(BMS_SESSION_KEY, data);
  storageLocal().setItem(BMS_ACCOUNT_KEY, data.account);
  storageLocal().setItem(BMS_ORG_KEY, { org_id: data.orgId, org_name: data.orgName });
}

export function removeBmsSession(): void {
  storageLocal().removeItem(BMS_SESSION_KEY);
  storageLocal().removeItem(BMS_ACCOUNT_KEY);
  storageLocal().removeItem(BMS_ORG_KEY);
}

export function hasBmsSession(): boolean {
  return !!getBmsSession();
}
