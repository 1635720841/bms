/**
 * 表格与表单集成的hooks
 * 集成了API请求、分页、搜索、排序等功能
 * 适配 BMS 项目 API 格式（errno/errmsg）
 */
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useQueryFormStore } from '@/store/queryForm'

interface TableWithFormOptions {
  // API请求函数
  apiFunction: (params: any) => Promise<any>
  // 数据字段映射
  dataMapping?: {
    listField?: string // 列表数据字段，默认 'usr_list'
    totalField?: string // 总数字段，默认 'total'
    pageField?: string // 当前页字段，默认 'currentPage'
    pageSizeField?: string // 每页大小字段，默认 'pageSize'
  }
  // 默认排序字段
  defaultSort?: string
  // 默认表单数据
  defaultFormData?: any
  // 是否在挂载时自动加载数据
  autoLoad?: boolean
  // 参数处理函数，用于自定义参数转换逻辑
  paramsTransform?: (params: any) => any
  // 成功回调
  onSuccess?: (data: any) => void
  // 失败回调
  onError?: (error: any) => void
  // 权限检查函数（可选）
  canLoad?: () => boolean
}

export default function useTableWithForm(options: TableWithFormOptions) {
  const {
    apiFunction,
    dataMapping = {
      listField: 'usr_list',
      totalField: 'total',
      pageField: 'currentPage',
      pageSizeField: 'pageSize'
    },
    defaultSort = '',
    defaultFormData = null,
    autoLoad = true,
    paramsTransform,
    onSuccess,
    onError,
    canLoad
  } = options

  // 表格相关状态
  const TableRef = ref()
  const dataList = ref([])
  const loading = ref(false)
  const page = reactive({
    currentPage: 1,
    total: 0,
    pageSize: 20
  })

  // 表单相关状态
  const queryFormStore = useQueryFormStore()
  const formData = ref({})
  const searchForm = ref({})

  // 初始化表单数据
  const initFormData = () => {
    let form = {}
    if (defaultSort) form[defaultSort] = 'desc'
    if (defaultFormData) form = { ...form, ...defaultFormData }
    formData.value = { ...queryFormStore.formData, ...form }
    // 同时更新 searchForm 以保持同步
    searchForm.value = { ...form }
  }

  // 过滤空值的辅助函数
  const filterEmptyValues = (obj: any) => {
    const filtered: any = {}
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      // 过滤 undefined、null、空字符串，但保留 0 和 false
      if (value !== undefined && value !== null && value !== '') {
        filtered[key] = value
      }
    })
    return filtered
  }

  // API请求函数
  const requestData = async (params: any) => {
    // 权限检查
    if (canLoad && !canLoad()) {
      return { data: { list: [], total: 0 } }
    }

    try {
      loading.value = true

      // 先过滤空值
      const filteredParams = filterEmptyValues(params)

      // 构建API请求参数
      let apiParams

      if (paramsTransform && typeof paramsTransform === 'function') {
        // 使用自定义参数转换函数
        apiParams = paramsTransform({
          ...filteredParams,
          currentPage: filteredParams.currentPage || page.currentPage,
          pageSize: filteredParams.pageSize || page.pageSize
        })
      } else {
        // 默认参数处理：动态处理所有传入的参数
        apiParams = {
          page: filteredParams.currentPage || page.currentPage,
          pageSize: filteredParams.pageSize || page.pageSize,
          // 动态添加所有其他参数
          ...Object.keys(filteredParams).reduce((acc, key) => {
            if (key !== 'currentPage' && key !== 'pageSize') {
              acc[key] = filteredParams[key]
            }
            return acc
          }, {})
        }
      }

      const response = await apiFunction(apiParams)

      // BMS 项目使用 errno/errmsg 格式
      if (response.errno === 0 && response.data) {
        // 更新数据列表
        const listField = dataMapping.listField || 'usr_list'
        dataList.value = response.data[listField] || []

        // 更新分页信息
        page.total = response.data[dataMapping.totalField || 'total'] || 0
        // BMS 项目的分页信息通常不在响应中，保持当前值
        // page.currentPage = response.data[dataMapping.pageField || 'currentPage'] || page.currentPage
        // page.pageSize = response.data[dataMapping.pageSizeField || 'pageSize'] || page.pageSize

        onSuccess?.(response.data)
        return {
          data: {
            list: dataList.value,
            total: page.total
          }
        }
      } else if (response.errno === 2000) {
        // 会话过期
        ElMessage.error('会话过期，请重新登录')
        window.location.href = '/#/login'
        onError?.(response)
        return { data: { list: [], total: 0 } }
      } else {
        ElMessage.error(response.errmsg ?? '获取数据失败')
        onError?.(response)
        return { data: { list: [], total: 0 } }
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      ElMessage.error('网络错误，请重试')
      onError?.(error)
      return { data: { list: [], total: 0 } }
    } finally {
      loading.value = false
    }
  }

  // 获取数据
  const GetData = (pageData?: { currentPage?: number; pageSize?: number }, formData?: any) => {
    // 更新分页信息（如果提供了分页参数）
    if (pageData) {
      if (pageData.currentPage !== undefined) {
        page.currentPage = pageData.currentPage
      }
      if (pageData.pageSize !== undefined) {
        page.pageSize = pageData.pageSize
      }
    }

    // 合并表单数据和分页参数
    const params = {
      ...(formData || searchForm.value),
      currentPage: page.currentPage,
      pageSize: page.pageSize
    }
    return requestData(params)
  }

  // 搜索功能
  const handleSearch = (val: any) => {
    searchForm.value = { ...val }
    page.currentPage = 1
    GetData(undefined, searchForm.value)
  }

  // 重置搜索
  const handleReset = (val: any) => {
    searchForm.value = {}
    page.currentPage = 1
    GetData(undefined, {})
  }

  // 表单数据变化
  const handleFormChange = (val: any) => {
    searchForm.value = { ...val }
  }

  // 分页变化
  const handlePageChange = (pageNum: number) => {
    page.currentPage = pageNum
    GetData(undefined, searchForm.value)
  }

  const handleSizeChange = (size: number) => {
    page.pageSize = size
    page.currentPage = 1
    GetData(undefined, searchForm.value)
  }

  // 排序变化
  const handleSortChange = (val: any) => {
    // 清除旧的排序字段
    for (let key in searchForm.value) {
      if (key.indexOf('OrderBy') !== -1) {
        delete searchForm.value[key]
      }
    }

    // 添加新的排序字段
    if (val.prop === 'wcsj') {
      searchForm.value['jdsj' + 'OrderBy'] = val.order === 'descending' ? 'desc' : 'asc'
    } else {
      searchForm.value[val.prop + 'OrderBy'] = val.order === 'descending' ? 'desc' : 'asc'
    }

    GetData(undefined, searchForm.value)
  }

  // 选择变化
  const selectedRows = ref([])
  const handleSelectionChange = (val: any) => {
    selectedRows.value = val
  }

  // 页面挂载时初始化
  onMounted(() => {
    initFormData()
    if (autoLoad) {
      GetData()
    }
  })

  return {
    // 表格相关
    TableRef,
    dataList,
    page,
    loading,

    // 表单相关
    formData,
    searchForm,

    // 方法
    GetData,
    handleSearch,
    handleReset,
    handleFormChange,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
    handleSelectionChange,

    // 选择相关
    selectedRows
  }
}

