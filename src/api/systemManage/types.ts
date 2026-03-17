/** 用户列表筛选 */
export interface UserListFilters {
  name?: string;
  org_name?: string;
  mobile?: string;
  email?: string;
}

/** 用户列表请求参数 */
export interface UserListParams {
  pageSize: number;
  page: number;
  filters?: UserListFilters;
}

/** 用户项 */
export interface UserItem {
  org_id: string;
  org_name: string;
  usr_id: string;
  usr_name: string;
  name?: string;
  email?: string;
  mobile?: string;
  comment?: string;
}

/** 用户列表响应 */
export interface UserListRes {
  errno: number;
  errmsg?: string;
  data?: {
    usr_list: UserItem[];
    total: number;
  };
}

/** 添加用户请求参数 */
export interface AddUserParams {
  org_id: string;
  name: string;
  password: string;
  email?: string;
  mobile?: string;
  comment?: string;
}

/** 添加用户响应 */
export interface AddUserRes {
  errno: number;
  errmsg?: string;
  data?: {
    usr_id?: string;
  };
}

/** 获取用户详情请求参数 */
export interface GetUserParams {
  usr_id: string;
}

/** 获取用户详情响应 */
export interface GetUserRes {
  errno: number;
  errmsg?: string;
  data?: UserItem;
}

/** 重置密码请求参数 */
export interface ResetPasswordParams {
  org_id: string;
  usr_id: string;
  name: string;
}

/** 重置密码响应 */
export interface ResetPasswordRes {
  errno: number;
  errmsg?: string;
  data?: {
    password_new: string;
  };
}

/** 更新用户请求参数 */
export interface UpdateUserParams {
  usr_id: string;
  email?: string;
  mobile?: string;
  comment?: string;
}

/** 更新用户响应 */
export interface UpdateUserRes {
  errno: number;
  errmsg?: string;
}

