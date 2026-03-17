/**
 * 系统管理 API
 */
import { bmsHttp } from "@/api/bms/http";
import type {
  UserListParams,
  UserListRes,
  AddUserParams,
  AddUserRes,
  GetUserParams,
  GetUserRes,
  ResetPasswordParams,
  ResetPasswordRes,
  UpdateUserParams,
  UpdateUserRes
} from "./types";

/**
 * 获取用户列表
 */
export function getUserListReq(params: Omit<UserListParams, "3rdsession">): Promise<UserListRes> {
  return bmsHttp.post("/bms/api/mng/usr/list", params) as Promise<UserListRes>;
}

/**
 * 添加用户
 */
export function addUserReq(params: Omit<AddUserParams, "3rdsession">): Promise<AddUserRes> {
  return bmsHttp.post("/bms/api/mng/usr/add", params) as Promise<AddUserRes>;
}

/**
 * 获取用户详情
 */
export function getUserDetailReq(params: Omit<GetUserParams, "3rdsession">): Promise<GetUserRes> {
  return bmsHttp.post("/bms/api/mng/usr/get", params) as Promise<GetUserRes>;
}

/**
 * 重置密码
 */
export function resetPasswordReq(
  params: Omit<ResetPasswordParams, "3rdsession">
): Promise<ResetPasswordRes> {
  return bmsHttp.post("/bms/api/mng/usr/pwd_reset", params) as Promise<ResetPasswordRes>;
}

/**
 * 更新用户信息
 */
export function updateUserReq(
  params: Omit<UpdateUserParams, "3rdsession">
): Promise<UpdateUserRes> {
  return bmsHttp.post("/bms/api/mng/usr/update", params) as Promise<UpdateUserRes>;
}

