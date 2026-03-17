const util = require('../../utils/util.js');
const http = require('../../utils/httpUtil.js');
const log = require('../../utils/logUtil.js');
let cmdTimeout = null

Page({
  data: {


    materialArray: [{
      title: '铁锂',
      value: 1
    }, {
      title: '三元',
      value: 2
    }],
    selectedMaterial: null,


    btVolArray: [], // 电压等级选项
    btCapacityArray: [], // 容量等级选项
    btLoopArray: [], // 循环
    btYearArray: [], // 生产年份
    btMonthArray: [], // 月份
    btDayArray: [], // 日期
    btSerialNumArray: [], // 流水号

    sectionList: [{
        id: 0,
        selectTitle: '请选择批量设置参数',
        dialogTitle: '请选择批量设置参数'
      },
      {
        id: 1,
        selectTitle: 'BT码设置',
        dialogTitle: 'BT码设置'
      },
      {
        id: 2,
        selectTitle: '三方后台配置',
        dialogTitle: '三方后台配置'
      },
      {
        id: 3,
        selectTitle: '基础参数配置',
        dialogTitle: '基础参数配置'
      },
      {
        id: 4,
        selectTitle: '电芯过压保护配置',
        dialogTitle: '电芯过压保护配置'
      },

      {
        id: 5,
        selectTitle: 'I级放电过流配置',
        dialogTitle: 'I级放电过流配置'
      },
      {
        id: 6,
        selectTitle: 'II级放电过流配置',
        dialogTitle: 'II级放电过流配置'
      },
      {
        id: 7,
        selectTitle: '放电短路保护配置',
        dialogTitle: '放电短路保护配置'
      },
      {
        id: 8,
        selectTitle: 'I级充电过流配置',
        dialogTitle: 'I级充电过流配置'
      },
      {
        id: 9,
        selectTitle: 'II级充电过流配置',
        dialogTitle: 'II级充电过流配置'
      },
      {
        id: 10,
        selectTitle: '电芯欠压保护配置',
        dialogTitle: '电芯欠压保护配置'
      },
      {
        id: 11,
        selectTitle: '总压过压保护配置',
        dialogTitle: '总压过压保护配置'
      },
      {
        id: 12,
        selectTitle: '总压欠压保护配置',
        dialogTitle: '总压欠压保护配置'
      },
      {
        id: 13,
        selectTitle: '放电开关配置',
        dialogTitle: '放电开关配置'
      },
      {
        id: 14,
        selectTitle: '充电开关配置',
        dialogTitle: '充电开关配置'
      },
      {
        id: 15,
        selectTitle: '盲充开关配置',
        dialogTitle: '盲充开关配置'
      },

      // '电芯欠压保护',
      // '总压过压保护',
      // '总压欠压保护',
      // '放电电芯高温保护',
      // '放电电芯低温保护',
      // '充电电芯高温保护',
      // '充电电芯低温保护',
      // 'mos高温保护',
      // 'I级(软件)电芯过压保护'

    ],
    selectedSection: {
      id: 0,
      selectTitle: '请选择批量设置参数',
      dialogTitle: '请选择批量设置参数'
    }, // 选中的批量操作

    activeSize: 'small', // 小号按钮
    deviceList: [], // 完整的设备列表
    pageSize: 20, // 每页显示数量
    pageNum: 1, // 当前页码
    loadingMore: false, // 是否正在加载更多
    noMore: false, // 是否没有更多数据
    refreshing: false, // 是否正在下拉刷新
    deviceCode: '', // 搜索文本
    testMode: false, // 测试模式
    selectAll: false, // 是否全选
    winHeight: 0,
    showCapacityModal: false, // 是否显示容量配置弹框
    capacityInput: '', // 容量输入值
    offlineTask: 0, // 离线任务配置选项
    selectedBmsText: '', // 已选设备文本
    sameCellCnt: true, // 所选设备串数是否一致
    sameCellMat: true, // 所选设备材料是否一致
    warningMsg: '', // 警告信息
    showServerModal: false, // 是否显示修改后台地址弹框
    serverInput: '', // 后台地址输入值
    thirdSrv:null,
    // 金属按钮独立按下状态
    setBtCodePressed: false, // 设置BT码按钮
    configCapacityPressed: false, // 配置容量按钮
    modifyServerPressed: false, // 修改后台地址按钮

    onlineOptions: [{
        title: '在线',
        value: 1
      },
      {
        title: '离线',
        value: 0
      },
    ],



    touchS: [0, 0],
    touchE: [0, 0]
  },

  onLoad(options) {
    let session = wx.getStorageSync('3rdsession') || ''
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }
    const windowInfo = wx.getWindowInfo()
    this.setData({
      winHeight: windowInfo.windowHeight,
    })
    this.onSearchConfirm();
    this.initBasicRanges()
  },

  onShow(){
    this.queryThirdServerList()
  },

  initBasicRanges() {
    console.log("initBasicRanges")
    let that = this;
    // 1. BT码的选项
    //电压；
    let vols = [48, 60, 72]
    for (let i = 30; i < 100; i++) {
      if (i != 48 && i != 60 && i != 72) {
        vols.push(i)
      }
    }

    // 容量
    let caps = [30, 40, 50, 60]
    for (let i = 20; i < 100; i++) {
      if (i != 30 && i != 40 && i != 50 && i != 60) {
        caps.push(i)
      }
    }
    // 循环
    let loops = []
    for (let i = 10; i <= 40; i += 5) {
      loops.push(i)
    }

    // 获取当前系统时间
    const now = new Date();
    const year = Number(now.getFullYear().toString().substring(2));

    //增加的 start
    let starTime = Number(year - 1) + '-01-01'
    let endTime = Number(year + 1) + '-12-31'
    that.setData({
      starTimeY: starTime,
      starTimeM: starTime,
      starTimeD: starTime,
      endTimeY: endTime,
      endTimeM: endTime,
      endTimeD: endTime
    })
    //增加的 end 

    let years = [year - 1, year, year + 1]
    let months = []
    for (let i = 1; i <= 12; i++) {
      if (i < 10) {
        months.push('0' + i)
      } else {
        months.push(i)
      }
    }
    let days = []
    for (let i = 1; i <= 31; i++) {
      if (i < 10) {
        days.push('0' + i)
      } else {
        days.push(i)
      }
    }


    let serNums = []
    for (let i = 1; i <= 1000; i++) {
      serNums.push(i)
    }


    that.setData({
      btVolArray: vols,
      btCapacityArray: caps,
      btLoopArray: loops,
      btYearArray: years,
      btMonthArray: months,
      btDayArray: days,
      btSerialNumArray: serNums
    })

    //3.基础参数
    let seriesOptions = [] // 串数
    for (let i = 14; i <= 24; i++) {
      seriesOptions.push(i)
    }
    that.setData({
      seriesOptions: seriesOptions,
      capacityOptions: caps
    })



  },



  //清空设备编号
  clearCode: util.throttle(function () {
    this.setData({
      deviceCode: null,
    });
  }, 500),


  // 输入框设备编号变化
  onDeviceCodeInput(e) {
    log.info('onDeviceCodeInput', e.detail.value);
    this.setData({
      deviceCode: e.detail.value
    });
  },

  // 搜索确认事件
  onSearchConfirm() {
    console.log("onSearchConfirm")
    this.setData({
      pageNum: 1,
      deviceList: [],
      loadingMore: false,
      noMore: false,
      refresherTriggered: true
    });
    this.fetchDeviceList();
  },

  // 扫码获取设备编号
  onScanCode() {
    log.info('onScanCode');
    wx.scanCode({
      success: (res) => {
        log.info('scanCode success', res.result);
        if (res.result) {
          this.setData({
            deviceCode: res.result
          });
          this.onSearchConfirm();
        }
      },
      fail: (err) => {
        log.error('scanCode fail', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 扫码获取设备编号
  onScanCodeBT() {
    log.info('onScanCodeBT');
    wx.scanCode({
      success: (res) => {
        log.info('scanCode success', res.result);
        if (res.result) {
          this.setData({
            filterBtCode: res.result
          });
        }
      },
      fail: (err) => {
        log.error('scanCode fail', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 处理设备列表数据，进行单位换算
   * @param {Array} deviceList 原始设备列表数据
   * @returns {Array} 处理后的设备列表数据
   */
  processDeviceList(deviceList) {
    if (!deviceList || !Array.isArray(deviceList)) return [];

    return deviceList.map(device => {
      const processed = {
        ...device,
        checked: false // 初始化时默认未选中
      };

      // 容量单位换算: 0.1Ah → Ah
      if (typeof processed.batCapacity === 'number') {
        processed.capactiyD = (processed.batCapacity * 0.1).toFixed(1);
      }

      return processed;
    });
  },

  // 全选/取消全选
  onToggleSelectAll() {
    const selectAll = !this.data.selectAll;
    const deviceList = this.data.deviceList.map(item => ({
      ...item,
      checked: selectAll
    }));

    this.setData({
      selectAll,
      deviceList
    });
  },

  // 选择单个项目
  onCheckItem(e) {
    const index = e.currentTarget.dataset.index;
    const deviceList = [...this.data.deviceList];
    deviceList[index].checked = !deviceList[index].checked;

    // 检查是否全部选中
    const selectAll = deviceList.every(item => item.checked);

    this.setData({
      deviceList,
      selectAll
    });
  },

  // 获取设备列表
  fetchDeviceList() {
    console.log("fetchDeviceList")
    let that = this;
    const {
      pageNum,
      pageSize,
      deviceCode
    } = this.data;
    const session = wx.getStorageSync('3rdsession') || '';

    if (!session) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    let params = {
      '3rdsession': session,
      'pageSize': pageSize,
      'page': pageNum
    }

    let filters = {}

    if (deviceCode) { // 设备码
      filters.bmsId = deviceCode
    }
    if (that.data.selectDevOnlineItem) { // 在线状态
      filters.online = that.data.selectDevOnlineItem.value
    }
    if (that.data.selectMetarailFilterItem) { // 材料
      filters.ceMat = that.data.selectMetarailFilterItem.value
    }

    if (that.data.filterCellCnt) { // 电芯串数
      filters.ceCnt = that.data.filterCellCnt
    }
    if (that.data.filterBtCode) { // bt码
      filters.btCode = that.data.filterBtCode
    }
    if (that.data.selectedOrg) { // 组织
      filters.orgId = that.data.selectedOrg.org_id
    }

    if (!!filters && JSON.stringify(filters) !== '{}') {
      params.filters = filters;
    }

    http.post('/bms/api/get/bmslist', params, {}, true).then(res => {
      log.info('获取设备列表成功', res);
      if (res.errno === 0) {
        // 处理设备列表数据，进行单位换算
        const newDeviceList = this.processDeviceList(res.data.bmsList || []);
        if (pageNum === 1) {
          // 第一数据
          this.setData({
            deviceList: newDeviceList,
            noMore: newDeviceList.length < pageSize
          });
        } else {
          // 加载更多数据
          this.setData({
            deviceList: this.data.deviceList.concat(newDeviceList),
            noMore: newDeviceList.length < pageSize
          });
        }
      } else if (res.errno === 2000) {
        wx.clearStorageSync()
        wx.reLaunch({
          url: '/pages/login/login',
        })

      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none',
          duration: 2000
        });
      }

      this.setData({
        loadingMore: false,
        refresherTriggered: false
      });
    }).catch(err => {
      log.error('获取设备列表失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      this.setData({
        loadingMore: false,
        refresherTriggered: false
      });
    });
  },

  // 加载更多数据
  loadMore() {
    console.log("loadMore")
    if (this.data.loadingMore || this.data.noMore) return;

    this.setData({
      loadingMore: true,
      pageNum: this.data.pageNum + 1
    });
    this.fetchDeviceList()
  },



  // 按钮按下效果
  buttonTouchStart: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      [`${type}Pressed`]: true
    });
  },

  // 按钮释放效果
  buttonTouchEnd: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      [`${type}Pressed`]: false
    });
  },

  // 手指移出按钮区域
  buttonTouchCancel: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      [`${type}Pressed`]: false
    });
  },

  // 设备行点击事件
  onRowTap: util.throttle(function (e) {
    console.log("onRowTap")
    const code = e.currentTarget.dataset.code;
    wx.setStorageSync('deviceCode', code);
    wx.switchTab({
      url: '/pages/deviceInfo/deviceInfo'
    });
  }, 400),

  // 刷新按钮点击事件
  onRefresh() {
    console.log("onRefresh")
    this.setData({
      pageNum: 1,
      deviceList: [],
      loadingMore: false,
      noMore: false
    });
    this.fetchDeviceList();
  },

  onSetBtCode: util.throttle(function () {
    console.log("onSetBtCode")
    const selectedDevices = this.data.deviceList.filter(item => item.checked);
    if (selectedDevices.length === 0) {
      wx.showToast({
        title: '请至少选择一条数据',
        icon: 'none'
      });
      return;
    }
    // 这里可以添加配置容量的具体逻辑
    wx.showToast({
      title: '开发中，敬请期待', // `已选中${selectedDevices.length}条数据`,
      icon: 'none'
    });
  }, 500),

  // 显示容量配置弹框
  showCapacityModal() {

    this.setData({
      showCapacityModal: true,
    })

    return;

    const selectedDevices = this.data.deviceList.filter(item => item.checked);
    if (selectedDevices.length > 20) {
      wx.showToast({
        title: '超出最大可配置条数20，请重新选择',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    const firstDevice = selectedDevices[0];
    // 检查所有选中设备的串数和材料是否一致
    const sameCellCnt = selectedDevices.every(d => d.cellCnt === firstDevice.cellCnt);
    const sameCellMat = selectedDevices.every(d => d.cellMat === firstDevice.cellMat);

    this.setData({
      showCapacityModal: true,
      capacityInput: '',
      offlineTask: 0,
      selectedDevices: selectedDevices,
      sameCellCnt,
      sameCellMat,
      warningMsg: sameCellCnt && sameCellMat ? '' : '警告：所选设备的串数或材料不一致，请确认配置'
    });

    if (!sameCellCnt || !sameCellMat) {
      wx.showToast({
        title: '所选设备的串数或材料不一致',
        icon: 'none',
        duration: 3000
      });
    }
  },





  // 容量输入变化
  onCapacityInput(e) {
    this.setData({
      capacityInput: e.detail.value
    });
  },

  // 提交容量配置
  submitCapacityConfig() {
    const {
      capacityInput,
      offlineTask
    } = this.data;
    const selectedDevices = this.data.deviceList.filter(item => item.checked);

    const capacity = parseFloat(capacityInput);
    if (isNaN(capacity) || capacity < 10 || capacity > 200) {
      wx.showToast({
        title: '容量值需在10-200Ah范围内',
        icon: 'none'
      });
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bmsIdList = selectedDevices.map(item => item.bmsId);

    http.post('/bms/api/set_batch/params/capacity', {
      '3rdsession': session,
      'bms_id_list': bmsIdList,
      'capacity': capacity * 10, // 转换为0.1Ah单位
      'offline_task': offlineTask
    }).then(res => {
      this.hideCapacityModal();
      if (res.errno === 0) {
        wx.showToast({
          title: '配置成功',
          icon: 'success'
        });
        this.onSearchConfirm(); // 刷新列表
      } else {
        wx.showToast({
          title: res.errmsg || '配置失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.hideCapacityModal();
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });
  },

  // 配置容量按钮点击事件
  onConfigCapacity: util.throttle(function () {
    const selectedDevices = this.data.deviceList.filter(item => item.checked);
    if (selectedDevices.length === 0) {
      wx.showToast({
        title: '请至少选择一条数据',
        icon: 'none'
      });
      return;
    }

    // 检查权限
    const auth = wx.getStorageSync('auth') || {};
    if (!auth.bms?.cfg?.basic) {
      wx.showToast({
        title: '无配置容量权限',
        icon: 'none'
      });
      return;
    }

    this.showCapacityModal();
  }, 500),

  // 弹出配置框
  showCfgDialog() {
    console.log("showCfgDialog")
    let that = this;
    // const selectedDevices = that.data.deviceList.filter(item => item.checked);


    if (!!that.data.selectedSection) {
      let id = that.data.selectedSection.id;
      console.log("showDialog id = ", id);
      if (id == 1) { //BT码设置
        // 这里可以添加配置容量的具体逻辑
        // wx.showToast({
        //   title: '开发中，敬请期待', // `已选中${selectedDevices.length}条数据`,
        //   icon: 'none'
        // });
        // return;

        //使用新的弹框
        that.setData({
          isShowBtCfgDialog: true,
          offlineTask: 0,
          // selectedDevices: selectedDevices
        })

        // that.initBtCode();

      } else if (id > 1) { // '三方后台配置'   ，权限判断，放在生成下拉项中
        that.setData({
          isShowCfgDialog: true,
          offlineTask: 0,
          // selectedDevices: selectedDevices
        });
      }

    }


  },

  //清除
  onClearDialogContent: util.throttle(function () {
    console.log("onClearDialogContent")
    this.setData({
      selectedSection: {
        id: 0,
        selectTitle: '请选择批量设置参数',
        dialogTitle: '请选择批量设置参数'
      },
      warningMsg: '',
      capacityInput: '',
      serverInput: '',
      thirdSrv:null,
      offlineTask: 0,

    });
  }, 1000),

  // 隐藏配置弹框
  hideDialogModal: util.throttle(function () {
    console.log("hideDialogModal")
    this.setData({
      // selectedSection: {
      //   id: 0,
      //   selectTitle: '请选择批量设置参数',
      //   dialogTitle: '请选择批量设置参数'
      // },
      isShowMultiDialog: false,
       // devString: null,
      // validDevList: [],
      // bt_code_list: [],
      // warningMsg: '',
      // capacityInput: '',
      // thirdSrv:null,
      // offlineTask: 0,
      ranges: null,
      params: null

    });
  }, 1000),


  // 后台地址输入变化
  onServerInput(e) {
    this.setData({
      serverInput: e.detail.value
    });
  },

  // 离线任务选择变化(后台地址)
  onOfflineTaskChange(e) {
    this.setData({
      offlineTask: parseInt(e.detail.value)
    });
  },

  onInputDev(e) {
    console.log("onInputDev")
    let that = this;
    let value = e.detail.value
    that.setData({
      devString: value
    })
  },

  // 提交总入口
  dailogConfirmSubmit: util.throttle(function () {
    console.log("dailogConfirmSubmit")
    let that = this;
    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }

    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
      // if (validItems.length > 50) {
      //   wx.showToast({
      //     title: '最多输入50组编码',
      //     icon: 'none'
      //   })
      //   return
      // } else {
        that.setData({
          validDevList: validItems,
        })
      // }

      let _id = that.data.selectedSection.id ;
      if (!that.data.dialogMaterial && (_id == 4 || _id == 10 || _id == 11 || _id == 12)) {
        wx.showToast({
          title: '请选择按铁锂还是三元参数配',
          icon: 'none'
        })
        return;
      }

      that.packSend(validItems)

    } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showModal({
          content: '有重复数据，剔除重复数据后继续提交吗？',
          complete: (res) => {
            if (res.confirm) {
              // if (validItems.length > 50) {
              //   wx.showToast({
              //     title: '最多输入50组编码',
              //     icon: 'none'
              //   })
              //   return
              // } else {
                that.setData({
                  validDevList: validItems,
                })
              // }
              let _id = that.data.selectedSection.id ;
              if (!that.data.dialogMaterial && (_id == 4 || _id == 10 || _id == 11 || _id == 12)) {
                wx.showToast({
                  title: '请选择按铁锂还是三元参数配',
                  icon: 'none'
                })
                return;
              }
              that.packSend(validItems)
            }
          }
        })

        return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        return;
      }
    }



  }, 1000),


  packSend() {
    console.log("packSend")
    let that = this;
    let id = that.data.selectedSection.id;
    let title = that.data.selectedSection.dialogTitle

    const session = wx.getStorageSync('3rdsession') || '';
    const bmsIdList = that.data.validDevList // that.data.selectedDevices.map(item => item.bmsId);
    const offlineTask = that.data.offlineTask

    //通用参数
    let params = {
      '3rdsession': session,
      'bms_id_list': bmsIdList,
      'offline_task': offlineTask
    }

    let url = ''
    let content = ''

    if (id == 2) { // '三方后台配置'   ，权限判断，放在生成下拉项中
      if (that.validateServerCfg()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/server';
        params.params = {
          'ctsrv': that.data.thirdSrv.value // that.data.serverInput
        }
        content = '设备数量：' + bmsIdList.length + '；\r\n 服务器地址：' + that.data.thirdSrv.title + '；\r\n  确定要设置吗？'
      } else {
        return;
      }

    } else if (id == 3) { // '基础参数',
      if (that.validateBasicParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/cMcN';
       
        let cellmat = that.data.params.cell_mat
        if(!cellmat){
          cellmat = that.data.selectedMaterial.value
        }
        params.params = {
          cM: cellmat, // 1-铁锂 2-三元
          cN: that.data.params.cell_cnt, // 串数
          capacity: that.data.params.designed_cap // 0.1Ah单位
        }
        content = '设备数量：' + bmsIdList.length + '；\r\n 材料：' + that.data.selectedMaterial.title + '；串数：' + that.data.params.cell_cnt + '；容量：' + that.data.params.designed_capD + '；\r\n  确定要设置吗？'
      } else {
        return;
      }
    } else if (id == 4) { //  电芯过压保护配置
      if (that.validateCellOVParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/ceOV';
        params.params = {
          T: this.data.params.cell_OVT, // mV
          D: this.data.params.cell_OVD, // 已经是100ms单位
          RT: this.data.params.cell_OVRT, // mV
          RD: this.data.params.cell_OVRD // 已经是100ms单位
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.cell_OVT + '；触发延时：' + that.data.params.cell_OVDD + '；\r\n 恢复门限：' + that.data.params.cell_OVRT + '；恢复延时：' + that.data.params.cell_OVRDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    } else if (id == 5) { // I级放电过流
      if (that.validateDisOC1Params()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batOCD1';
        params.params = {
          T: this.data.params.bat_OCD1T,
          D: this.data.params.bat_OCD1D,
          RT: this.data.params.bat_OCD1RT,
          RD: this.data.params.bat_OCD1RD
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_OCD1TD + '；触发延时：' + that.data.params.bat_OCD1DD + '；恢复延时：' + that.data.params.bat_OCD1RDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    } else if (id == 6) { // II级放电过流
      if (that.validateDisOC2Params()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batOCD2';
        params.params = {
          T: this.data.params.bat_OCD2T,
          D: this.data.params.bat_OCD2D,
          RT: this.data.params.bat_OCD2RT,
          RD: this.data.params.bat_OCD2RD
        }
        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_OCD2TD + '；触发延时：' + that.data.params.bat_OCD2DD + '；恢复延时：' + that.data.params.bat_OCD2RDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    } else if (id == 7) { // 放电短路保护配置
      if (that.validateSCDParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batSCD';
        params.params = {
          T: this.data.params.bat_SCDT,
          D: Number(this.data.params.bat_SCDD)
        }
        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_SCDTD + '；触发延时：' + that.data.params.bat_SCDDD + '；\r\n  确定要设置吗？'


      } else {
        return;
      }
    } else if (id == 8) { //  I级充电过流配置
      if (that.validateOCC1Params()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batOCC1';
        params.params = {
          T: this.data.params.bat_OCC1T,
          D: this.data.params.bat_OCC1D,
          RT: this.data.params.bat_OCC1RT,
          RD: this.data.params.bat_OCC1RD
        }
        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_OCC1TD + '；触发延时：' + that.data.params.bat_OCC1DD + '；恢复延时：' + that.data.params.bat_OCC1RDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    } else if (id == 9) { //  II级充电过流配置
      if (that.validateOCC2Params()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batOCC2';
        params.params = {
          T: this.data.params.bat_OCC2T,
          D: this.data.params.bat_OCC2D,
          RT: this.data.params.bat_OCC2RT,
          RD: this.data.params.bat_OCC2RD
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_OCC2TD + '；触发延时：' + that.data.params.bat_OCC2DD + '；恢复延时：' + that.data.params.bat_OCC2RDD + '；\r\n  确定要设置吗？'


      } else {
        return;
      }


    }else if (id == 10) { // 10 - 电芯欠压保护配置   
      if (that.validateCellUVParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/ceUV';
        params.params = {
          T: this.data.params.cell_UVT,
          D: this.data.params.cell_UVD,
          RT: this.data.params.cell_UVRT,
          RD: this.data.params.cell_UVRD
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.cell_UVT + '；触发延时：' + that.data.params.cell_UVDD + '；\r\n 恢复门限：' + that.data.params.cell_UVRT + '；恢复延时：' + that.data.params.cell_UVRDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    }else if (id == 11) { // 11 - 总压过压保护配置   
      if (that.validatePackOVParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batOV';
        params.params = {
          T: this.data.params.bat_OVT,
          D: this.data.params.bat_OVD,
          RT: this.data.params.bat_OVRT,
          RD: this.data.params.bat_OVRD
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_OVTD + '；触发延时：' + that.data.params.bat_OVDD + '；\r\n 恢复门限：' + that.data.params.bat_OVRTD + '；恢复延时：' + that.data.params.bat_OVRDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    }else if (id == 12) { // 12 - 总压过压保护配置   
      if (that.validatePackUVParams()) {
        //校验通过，走http
        url = '/bms/api/set_batch/params/batUV';
        params.params = {
           T: this.data.params.bat_UVT,
          D: this.data.params.bat_UVD,
          RT: this.data.params.bat_UVRT,
          RD: this.data.params.bat_UVRD
        }

        content = '设备数量：' + bmsIdList.length + '；\r\n 触发门限：' + that.data.params.bat_UVTD + '；触发延时：' + that.data.params.bat_UVDD + '；\r\n 恢复门限：' + that.data.params.bat_UVRTD + '；恢复延时：' + that.data.params.bat_UVRDD + '；\r\n  确定要设置吗？'

      } else {
        return;
      }
    }

    wx.showModal({
      title: that.data.selectedSection.dialogTitle,
      content: content,
      complete: (res) => {
        if (res.confirm) {
          that.sendHttpReq(url, params, true)
        }
      }
    })

  },

  //校验服务器地址
  validateServerCfg() {
    console.log("validateServerCfg")
    let that = this;
    if(!that.data.thirdSrv){
      wx.showToast({
        title: '请选择服务器地址',
        icon: 'none'
      });
      return false;
    }

    return true;

    const {
      serverInput
    } = that.data;
    if (!serverInput) {
      wx.showToast({
        title: '请输入后台地址',
        icon: 'none'
      });
      return false;
    }

    if (!util.validateIPAddress(serverInput)) {
      wx.showToast({
        title: '请输入有效的后台地址',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // http请求
  sendHttpReq(url, params, showLoading) {
    console.log("sendHttpReq url = ", url)
    let that = this;
    http.post(url, params, {}, showLoading).then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: that.data.selectedSection.dialogTitle + '成功',
          icon: 'success'
        });
        // that.hideDialogModal();
        // //重新查，会重置选中状态；
        // that.onSearchConfirm();
      } else {
        wx.showToast({
          title: res.errmsg || '配置失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      // this.hideDialogModal();
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });

  },

  // 清空对话框的配置参数
  clearDialogData() {
    console.log("clearDialogData")
    this.setData({

    })
  },

  // 下拉选项
  onSectionChange(e) {
    let that = this;
    let index = parseInt(e.detail.value)
    console.log("onSectionChange index = ", index)
    this.setData({
      selectedSection: that.data.sectionList[index]
    });

    // 先注释掉，不用勾选，改为输入框
    // const selectedDevices = that.data.deviceList.filter(item => item.checked);
    // if (selectedDevices.length === 0) {
    //   wx.showToast({
    //     title: '请至少选择一条数据',
    //     icon: 'none'
    //   });
    //   return;
    // }
    // if (selectedDevices.length > 20) {
    //   wx.showToast({
    //     title: '超出最大可配置条数20，请重新选择',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return;
    // }





  },

  // 显示批量设备的page-container
  showMultiDialog: util.throttle(function () {
    console.log("showMultiDialog")
    let that = this;
    if (that.data.selectedSection && that.data.selectedSection.id != 0) {
      let index = that.data.selectedSection?.id || 0;
      if (index == 0) {} else if (index == 3) { // 基础参数，不做限制
        let auth = wx.getStorageSync('auth')
        let basicPerm = auth?.bms?.cfg?.basic || false;
        if (!basicPerm) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        }
      } else {
        //判断权限
        let auth = wx.getStorageSync('auth')
        let btCodePerm = auth?.bms?.cfg?.btCode || false;
        let serverPerm = auth?.bms?.cfg?.t_server || false;
        let currPerm = auth?.bms?.cfg?.currparams || false;
        let volPerm = auth?.bms?.cfg?.voltparams || false;
        if (index == 1 && !btCodePerm) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        } else if (index == 2 && !serverPerm) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        } else if ((index == 4|| index == 10 || index == 11 || index == 12) && !volPerm) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        } else if (index > 4 && !currPerm) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        }
      }

      let selectedDevices = that.data.deviceList?.filter(item => item.checked) || [];
      let devString = null
      if (selectedDevices.length > 0) {
        let bmsListString = selectedDevices.map(item => item.bmsId).join(",")
        devString = bmsListString
      }

      that.setData({
        devString,
        isShowMultiDialog: true
      })

      let _id = that.data.selectedSection.id
      // if(that.data.selectedSection.id > 4){
      if(_id != 4 && _id != 10 && _id != 11 && _id != 12){
        that.fetchRanges()
      }

    } else {
      wx.showToast({
        title: '请选择批量设置参数',
        icon: 'none'
      })
      return;
    }

  }, 1000),

  // 获取范围
  fetchRanges(dialogMaterial) {
    console.log("fetchRanges , dialogMaterial = ", dialogMaterial)
    let that = this;
    const session = wx.getStorageSync('3rdsession') || '';
    let param = {
      '3rdsession': session,
      // "cell_mat": device.cellMat, //电芯材料1-铁锂 2-三元
      // "cell_cnt": device.cellCnt, //电芯串数
    }
    if (dialogMaterial) {
      param.cell_mat = dialogMaterial
    }
    return http.post('/bms/api/get/paramsrange', param).then(res => {
      if (res.errno == 0) {
        //处理ranges
        let testRanges = res.data.ranges;
        if (JSON.stringify(testRanges) !== '{}' && !!testRanges) {
          // const capacityOptions = this.generateCapacityOptions(testRanges.designed_cap);

          // 电芯过压保护选项
          if (testRanges.cell_OVT) {
            const ovtOptions = this.generateOptionsVolatageMV(testRanges.cell_OVT);
            const ovrtOptions = this.generateOptionsVolatageMV(testRanges.cell_OVRT);
            const ovdOptions = this.generateTimeOptionsOnePointS(testRanges.cell_OVD); // 使用原始100ms单位的范围
            const ovrdOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_OVRD); // 使用原始100ms单位的范围
            that.setData({
              ovtOptions: ovtOptions,
              ovrtOptions: ovrtOptions,
              ovdOptions: ovdOptions,
              ovrdOptions: ovrdOptions
            })
          }

          // 生成电芯欠压保护选项
          if (testRanges.cell_UVT) {
            const cellUvtOptions = this.generateOptionsVolatageMV(testRanges.cell_UVT);
            const cellUvrtOptions = this.generateOptionsVolatageMV(testRanges.cell_UVRT);
            const cellUvdOptions = this.generateTimeOptionsOnePointS(testRanges.cell_UVD); // 使用原始100ms单位的范围
            const cellUvrdOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_UVRD); // 使用原始100ms单位的范围
            that.setData({
              cellUvtOptions: cellUvtOptions,
              cellUvrtOptions: cellUvrtOptions,
              cellUvdOptions: cellUvdOptions,
              cellUvrdOptions: cellUvrdOptions
            })
          }

          // 生成总压过压保护选项,门限单位0.1V，时间单位 100ms(0.1S)
          if (testRanges.bat_OVT) {
            const batOVTOptions = this.generateOptionsOnePointV(testRanges.bat_OVT);
            const batOVRTOptions = this.generateOptionsOnePointV(testRanges.bat_OVRT);
            const batOVDOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OVD); // 使用原始100ms单位的范围
            const batOVRDOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OVRD); // 使用原始100ms单位的范围
            that.setData({
              batOVTOptions: batOVTOptions,
              batOVRTOptions: batOVRTOptions,
              batOVDOptions: batOVDOptions,
              batOVRDOptions: batOVRDOptions
            })
          }

          // 生成总压欠压保护选项
          if (testRanges.bat_UVT) {
            const batUTVOptions = this.generateOptionsOnePointV(testRanges.bat_UVT);
            const batUVRTOptions = this.generateOptionsOnePointV(testRanges.bat_UVRT); // 使用原始100ms单位的范围
            const batUVDOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UVD);
            const batUVRDOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UVRD); // 使用原始100ms单位的范围
            that.setData({
              batUTVOptions: batUTVOptions,
              batUVRTOptions: batUVRTOptions,
              batUVDOptions: batUVDOptions,
              batUVRDOptions: batUVRDOptions
            })
          }

          // 生成I级放电过流选项
          if (testRanges.bat_OCD1T) {
            const ocd1tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD1T);
            const ocd1rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD1RT);
            const ocd1dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCD1D);
            const ocd1rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCD1RD);
            that.setData({
              ocd1tOptions,
              ocd1dOptions,
              ocd1rtOptions,
              ocd1rdOptions
            })
          }

          // 生成I级充电过流选项
          if(testRanges.bat_OCC1T){
            const occ1tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC1T);
            const occ1rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC1RT);
            const occ1dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCC1D);
            const occ1rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCC1RD);
            that.setData({
              occ1tOptions,
              occ1dOptions,
              occ1rtOptions,
              occ1rdOptions
            })
          }
          
          // 生成II级充电过流选项
          if(testRanges.bat_OCC2T){
            const occ2tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC2T);
            const occ2rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC2RT);
            const occ2dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCC2D);
            const occ2rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCC2RD);
            that.setData({
              occ2tOptions,
              occ2dOptions,
              occ2rtOptions,
              occ2rdOptions
            })
          }
         
          // 生成放电电芯高温保护选项
          if(testRanges.bat_OTDT){
            const otdtOptions = this.generateTemperatureOptions(testRanges.bat_OTDT);
            const otdrtOptions = this.generateTemperatureOptions(testRanges.bat_OTDRT);
            const otddOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OTDD);
            const otdrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OTDRD);
            that.setData({
              otdtOptions,
              otddOptions,
              otdrtOptions,
              otdrdOptions
            })
          }
         
          // 生成放电电芯低温保护选项
          if(testRanges.bat_UTDT){
            const utdtOptions = this.generateTemperatureOptions(testRanges.bat_UTDT);
            const utdrtOptions = this.generateTemperatureOptions(testRanges.bat_UTDRT);
            const utddOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UTDD);
            const utdrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UTDRD);
            that.setData({
              utdtOptions,
              utddOptions,
              utdrtOptions,
              utdrdOptions
            })
          }
        
          // 生成充电电芯高温保护选项
          if(testRanges.bat_OTCT){
            const otctOptions = this.generateTemperatureOptions(testRanges.bat_OTCT);
            const otcrtOptions = this.generateTemperatureOptions(testRanges.bat_OTCRT);
            const otcdOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OTCD);
            const otcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OTCRD);
            that.setData({
              otctOptions,
              otcdOptions,
              otcrtOptions,
              otcrdOptions
            })
          }
        
          // 生成充电电芯低温保护选项
          if(testRanges.bat_UTCT){
            const utctOptions = this.generateTemperatureOptions(testRanges.bat_UTCT);
            const utcrtOptions = this.generateTemperatureOptions(testRanges.bat_UTCRT);
            const utcdOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UTCD);
            const utcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UTCRD);
            that.setData({
              utctOptions,
              utcdOptions,
              utcrtOptions,
              utcrdOptions
            })
          }
          
          // 生成mos高温保护选项
          if(testRanges.mos_OTCT){
            const mosotctOptions = this.generateTemperatureOptions(testRanges.mos_OTCT);
            const mosotcrtOptions = this.generateTemperatureOptions(testRanges.mos_OTCRT);
            const mosotcdOptions = this.generateTimeOptionsOnePointS(testRanges.mos_OTCD);
            const mosotcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.mos_OTCRD);
            that.setData({
              mosotctOptions,
              mosotcdOptions,
              mosotcrtOptions,
              mosotcrdOptions
            })
          }
         
          if (testRanges.cell_OV1T) {
            // 电芯过压保护选项
            const ov1tOptions = this.generateOptionsVolatageMV(testRanges.cell_OV1T);
            const ovr1tOptions = this.generateOptionsVolatageMV(testRanges.cell_OVR1T);
            const ov1dOptions = this.generateTimeOptionsOnePointS(testRanges.cell_OV1D); // 使用原始100ms单位的范围
            const ovr1dOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_OVR1D); // 使用原始100ms单位的范围
            that.setData({
              ov1tOptions,
              ovr1tOptions,
              ov1dOptions,
              ovr1dOptions
            })
          }
          // 生成II级放电过流选项
          if(testRanges.bat_OCD2T){
            const ocd2tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD2T);
            const ocd2rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD2RT);
            const ocd2dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCD2D);
            const ocd2rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCD2RD);
            that.setData({
              ocd2tOptions,
              ocd2dOptions,
              ocd2rtOptions,
              ocd2rdOptions
            })
          }
          
          // 生成放电短路保护选项
          if(testRanges.bat_SCDT){
            const scdtOptions = this.generateSCDTOptions(testRanges.bat_SCDT);
            const scddOptions = this.generateTimeOptionsMicroseconds(testRanges.bat_SCDD);
            that.setData({
              scdtOptions,
              scddOptions
            })
          }
 
          that.setData({
            ranges: testRanges,
          });
        } else {
          console.log("查询range结果为空")
          // that.hideDialogModal();
          wx.showModal({
            title: '',
            content: '查参数可配置范围为空，暂不可批量配置～',
          })
        }

      } else if (res.errno === 2000) {
        wx.clearStorageSync()
        wx.reLaunch({
          url: '/pages/login/login',
        })

      } else {
        wx.showToast({
          title: '参数获取失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: err.msg || '网络错误',
        icon: 'none'
      });
    });
  },

  // 输入处理函数示例 (其他函数类似)
  onCapacityInput(e) {
    const val = parseInt(e.detail.value);
    if (isNaN(val)) {
      return;
    }
    this.setData({
      cellCapacity: val,
      'params.designed_capD': val,
      'params.designed_cap': val * 10
    });
  },

  // 电芯容量选项选中处理
  onCapacitySelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.capacityOptions[idx];
    this.setData({
      cellCapacity: val,
      'params.designed_capD': val,
      'params.designed_cap': val * 10
    });
  },

  // 提交时验证容量范围
  validateCapacity() {
    const ranges = this.data.ranges;
    if (!ranges || !ranges.designed_cap) {
      return true;
    }
    const val = parseFloat(this.data.params.designed_capD);
    const range = ranges.designed_cap;
    const min = range[0] / 10; // 转换为Ah单位
    const max = range[1] / 10;
    if (isNaN(val) || val < min || val > max) {
      wx.showToast({
        title: `容量范围${min.toFixed(1)}~${max.toFixed(1)}Ah`,
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // 生成电芯容量选项 (0.1Ah单位转换为Ah显示)
  generateCapacityOptions(capRanges) {
    console.log("generateCapacityOptions", capRanges);
    const range = capRanges;
    const min = range[0] / 10; // 转换为Ah单位
    const max = range[1] / 10;

    // 生成10.0-100.0的步进10选项
    const options = [];
    for (let i = 10; i <= 100; i += 10) {
      if (i >= min && i <= max) {
        options.push(i.toFixed(1)); // 显示为10.0, 20.0等
      }
    }

    // 生成200.0-500.0的步进100选项
    for (let i = 200; i <= max; i += 100) {
      if (i >= min) {
        options.push(i.toFixed(1)); // 显示为200.0, 300.0等
      }
    }

    return options;
  },

  // 生成门限选项 (50步长 ），单位mV,不用转换
  generateOptionsVolatageMV(ovrtRanges) {
    console.log("generateOptionsVolatageMV 门限选项，单位mv，不转换：", ovrtRanges)
    const range = ovrtRanges;
    const min = Math.ceil(range[0] / 50) * 50;
    const max = Math.floor(range[1] / 50) * 50;

    const options = [];
    for (let i = min; i <= max; i += 50) {
      options.push(i);
    }
    return options;
  },



  // 生成保护触发门限选项 (0.1V单位)
  generateOptionsOnePointV(range) {
    console.log("generateOptionsOnePointV 门限选项，单位0.1V，转换：", range)
    const options = [];
    for (let i = range[0]; i <= range[1]; i += 5) {
      let val = parseFloat(i / 10).toFixed(1)
      options.push(val); // 转换为V单位显示
    }
    return options;
  },

  // 单位0.1v  步长10，100，
  generateOptionsTenPerOnePointV(range) {
    console.log("generateOptionsTenPerOnePointV 门限选项，单位0.1V，转换：", range)
    const options = [];
    let cha = range[1] - range[0];
    let step = 0;
    for (let i = range[0]; i <= range[1]; i += step) {
      if (cha > 0 && cha <= 100) {
        //步长5
        step = 5;
      } else if (cha > 100 && cha <= 1000) {
        step = 50;
      } else if (cha > 1000 && cha <= 5000) {
        step = 500;
      } else if (cha > 5000) {
        step = 1000;
      }


      let val = parseFloat(i / 10).toFixed(1)
      options.push(val); // 转换为V单位显示
      if (i % step != 0) { //为了后面的数是整十整百
        if (i / step < 0) {
          i = 0
        } else {
          i = parseInt(i / step) * step
        }
      }

    }



    return options;
  },



  // 生成延时选项 (0.5步长),时间单位 100ms(0.1S)
  generateTimeOptionsOnePointS(range) {
    console.log("延时(原始100ms单位)，步长0.5：", range)
    const options = [];
    let cha = range[1] - range[0];
    let step = 0;
    for (let i = range[0]; i <= range[1]; i += step) {
      if (cha > 0 && cha <= 100) {
        //步长5
        step = 5;
      } else if (cha > 100 && cha <= 1000) {
        step = 50;
      } else if (cha > 1000 && cha <= 5000) {
        step = 500;
      } else if (cha > 5000) {
        step = 1000;
      }


      let val = parseFloat(i / 10).toFixed(1)
      options.push(val); // 转换为V单位显示
      if (i % step != 0) { //为了后面的数是整十整百
        if (i / step < 0) {
          i = 0
        } else {
          i = parseInt(i / step) * step
        }
      }

    }

    return options;
  },

  // 生成延时选项 (10步长),时间单位 100ms(0.1S)
  generateTimeOptionsTenOrMore(batOVDRanges) {
    console.log("延时(原始100ms单位)，步长10：", batOVDRanges)
    // 将100ms单位转换为秒
    const range = [batOVDRanges[0] / 10, batOVDRanges[1] / 10];
    const min = Math.ceil(range[0] * 2) / 2; // 转换为0.5步长
    const max = Math.floor(range[1] * 2) / 2;

    const options = [];
    let i = min;
    if (i < 10) {
      options.push(i);
      i = 10
    }
    for (; i <= max; i += 10) {
      options.push(i);
    }
    return options;
  },

  // 生成延时选项 (微秒单位)，步长 10， 需 * 10
  generateTimeOptionsMicroseconds(scddRanges) {
    console.log("延时(微秒单位)：", scddRanges);
    const range = scddRanges;
    const min = range[0] * 10;
    const max = range[1] * 10;
    const options = [];
    let cha = max - min;
    let step = 100;
    for (let i = min; i <= max; i += step) {
      let val = parseFloat(i).toFixed(1)
      options.push(val); // 转换为V单位显示
      if (i % step != 0) { //为了后面的数是整十整百
        if (i / step < 0) {
          i = 0
        } else {
          i = parseInt(i / step) * step
        }
      }

    }
    return options;
  },

  // 生成放电短路保护门限选项 (0.1A单位) - 分段步长处理
  generateSCDTOptions(range) {
    const options = [];

    // 第一段: 100-1000, 步长100
    for (let i = 100; i <= 1000; i += 100) {
      options.push(i / 10);
    }

    // 第二段: 1000-5000, 步长500
    for (let i = 1000; i <= 5000; i += 500) {
      options.push(i / 10);
    }

    // 第三段: 5000-20000, 步长1000
    for (let i = 5000; i <= range[1]; i += 1000) {
      options.push(i / 10);
    }

    return options;
  },

  // 生成温度选项 (摄氏度单位)
  generateTemperatureOptions(range) {
    console.log("generateTemperatureOptions 温度选项，单位℃，转换：", range)
    // 将开尔文温度转换为摄氏度 (减去273)
    const min = Math.ceil((range[0] - 273) / 5) * 5;
    const max = Math.floor((range[1] - 273) / 5) * 5;

    const options = [];
    for (let i = min; i <= max; i += 5) {
      options.push(parseFloat(i).toFixed(1));
    }
    return options;
  },


  // 触发门限延时选中处理
  onOVDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovdOptions[idx];
    this.setData({
      'params.cell_OVD': val * 10, // 存储为100ms单位
      'params.cell_OVDD': val // 显示为秒单位
    });
  },

  // 恢复门限延时选中处理
  onOVRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovrdOptions[idx];
    this.setData({
      'params.cell_OVRD': val * 10, // 存储为100ms单位
      'params.cell_OVRDD': val // 显示为秒单位
    });
  },

  // 电芯欠压保护触发门限选中处理
  onCellUVTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.cellUvtOptions[idx]; // 转换为0.1V单位
    this.setData({
      'params.cell_UVT': val,
    });
  },

  // 电芯欠压保护恢复门限选中处理
  oCellUVRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.cellUvrtOptions[idx];
    this.setData({
      'params.cell_UVRT': val,
    });
  },

  // 电芯欠压保护恢复门限选中处理
  onBatUVRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batUVRTOptions[idx];
    this.setData({
      'params.bat_UVRT': val * 10,
      'params.bat_UVRTD': val
    });
  },

  // 欠压触发门限延时选中处理
  onCellUVDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.cellUvdOptions[idx];
    this.setData({
      'params.cell_UVD': val * 10, // 存储为100ms单位
      'params.cell_UVDD': val // 显示为秒单位
    });
  },


  // 欠压恢复门限延时选中处理
  onCellUVRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.cellUvrdOptions[idx];
    this.setData({
      'params.cell_UVRD': val * 10, // 存储为100ms单位
      'params.cell_UVRDD': val // 显示为秒单位
    });
  },


  // 总压过压保护触发门限选中处理
  onBatOVTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batOVTOptions[idx];
    this.setData({
      'params.bat_OVT': val * 10,
      'params.bat_OVTD': val // 显示为V单位
    });
  },

  // 总压过压保护恢复门限选中处理
  onBatOVRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batOVRTOptions[idx]; // 转换为0.1V单位
    this.setData({
      'params.bat_OVRT': val * 10,
      'params.bat_OVRTD': val // 显示为V单位
    });
  },

  // 总压过压保护触发延时选中处理
  onBatOVDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batOVDOptions[idx];
    this.setData({
      'params.bat_OVD': val * 10, // 存储为100ms单位
      'params.bat_OVDD': val // 显示为秒单位
    });
  },

  // 总压过压保护恢复延时选中处理
  onBatOVRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batOVRDOptions[idx];
    this.setData({
      'params.bat_OVRD': val * 10, // 存储为100ms单位
      'params.bat_OVRDD': val // 显示为秒单位
    });
  },

  // 电芯过压保护触发门限选中处理
  onOVTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovtOptions[idx];
    this.setData({
      'params.cell_OVT': val
    });
  },

  // 电芯过压保护恢复门限选中处理
  onOVRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovrtOptions[idx];
    this.setData({
      'params.cell_OVRT': val
    });
  },



  // I级软件电芯过压保护触发门限选中处理
  onOV1TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ov1tOptions[idx];
    this.setData({
      'params.cell_OV1T': val
    });
  },

  // I级软件电芯过压保护恢复门限选中处理
  onOVR1TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovr1tOptions[idx];
    this.setData({
      'params.cell_OVR1T': val
    });
  },


  // I级软件触发门限延时选中处理
  onOV1DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ov1dOptions[idx];
    this.setData({
      'params.cell_OV1D': val * 10, // 存储为100ms单位
      'params.cell_OV1DD': val // 显示为秒单位
    });
  },

  // I级软件恢复门限延时选中处理
  onOVR1DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ovr1dOptions[idx];
    this.setData({
      'params.cell_OVR1D': val * 10, // 存储为100ms单位
      'params.cell_OVR1DD': val // 显示为秒单位
    });
  },



  // 材料
  onMaterialChange(e) {
    const idx = e.detail.value;
    const item = this.data.materialArray[idx];
    this.setData({
      selectedMaterial: item,
      'params.cell_mat': item.value
    });

  },

  //批量弹框中选中的材料
  onMaterialRadioChange(e) {
    const idx = parseInt(e.detail.value);
    let that = this;
    that.setData({
      dialogMaterial: idx,
    });

    // 查询范围
    that.fetchRanges(idx)

  },


  //串数
  onSeriesChange(e) {
    const idx = e.detail.value;
    const cell = this.data.seriesOptions[idx];
    this.setData({
      cellSeries: cell,
      'params.cell_cnt': cell
    });
  },
  //使能
  onCellOVRP1FlagChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      'params.cell_OVRP1flag': idx
    });
  },




  onCellOVTInput(e) {
    this.setData({
      'params.cell_OVT': Number(e.detail.value)
    });
  },

  onCellOVDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OVD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.cell_OVDD': val
    });
    return val;
  },

  onCellOVRTInput(e) {
    this.setData({
      'params.cell_OVRT': Number(e.detail.value)
    });
  },

  onCellOVRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OVRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10, // 存储为100ms单位
      'params.cell_OVRDD': val // 显示为秒单位
    });
    return val;
  },


  onCellOV1TInput(e) {
    this.setData({
      'params.cell_OV1T': Number(e.detail.value)
    });
  },


  onCellOV1DInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.cell_OV1D': val * 10,
      'params.cell_OV1DD': val
    });
  },

  onCellOVR1TInput(e) {
    this.setData({
      'params.cell_OVR1T': Number(e.detail.value)
    });
  },

  onCellOVR1DInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.cell_OVR1D': val * 10, // 存储为100ms单位
      'params.cell_OVRD1D': val // 显示为秒单位
    });
  },


  onCellUVTInput(e) {
    this.setData({
      'params.cell_UVT': Number(e.detail.value)
    });
  },

  onCellUVDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    // 处理超过1位小数的情况
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_UVD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.cell_UVDD': val
    });
    return val;
  },

  onCellUVRTInput(e) {
    this.setData({
      'params.cell_UVRT': Number(e.detail.value)
    });
  },

  onCellUVRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    // 处理超过1位小数的情况
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_UVRDD': val,
      'params.cell_UVRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
    });
    return val;
  },

  /**
   * 总压过压触发门限输入处理
   * @param {Object} e 事件对象，包含输入值e.detail.value
   * 将输入值转换为10倍存储(单位:0.1V)，同时保留原始值
   */
  onBatOVTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OVT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OVTD': val,
    });
    return val;
  },

  /**
   * 总压过压恢复门限输入处理
   * @param {Object} e 事件对象，包含输入值e.detail.value
   * 直接存储输入值(单位:V)
   */
  onBatOVRTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OVRT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OVRTD': val,
    });
    return val;
  },


  /**
   * 总压过压延时输入处理
   * @param {Object} e 事件对象，包含输入值e.detail.value
   * 自动处理超过1位小数的情况
   * 将输入值转换为10倍存储(单位:100ms)，同时保留原始值(单位:s)
   */
  onBatOVDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OVD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OVDD': val
    });
    return val;
  },

  /**
   * 总压过压恢复延时输入处理
   * @param {Object} e 事件对象，包含输入值e.detail.value
   * 自动处理超过1位小数的情况
   * 将输入值转换为10倍存储(单位:100ms)，同时保留原始值(单位:s)
   */
  onBatOVRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OVRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OVRDD': val
    });
    return val;
  },
  // 总压过压保护
  /**
   * 总压过压触发门限下拉选择处理
   * @param {Object} e 事件对象，包含选择项索引e.detail.value
   * 从预设范围中选择值
   */
  onPackOVTChange(e) {
    let idx = e.detail.value
    this.setData({
      'params.pack_OVT': this.data.ranges.pack_OVT[idx],
      'params.pack_OVTD': this.data.ranges.pack_OVT[idx] / 10 // 转换为V单位显示
    });
  },
  /**
   * 总压过压触发门限手动输入处理
   * @param {Object} e 事件对象，包含输入值e.detail.value
   * 直接存储输入值(单位:V)
   */
  onPackOVTInput(e) {
    this.setData({
      'params.pack_OVT': Number(e.detail.value)
    });
  },

  // 总压欠压保护输入监听函数
  onBatUVTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UVT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UVTD': val,
    });
    return val;
  },

  onBatUVDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UVD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UVDD': val
    });
    return val;
  },

  onBatUVRTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UVRT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UVRTD': val,
    });
    return val;
  },

  onBatUVRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UVRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UVRDD': val
    });
    return val;
  },

  // 总压欠压保护下拉选择监听函数
  onBatUVTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batUTVOptions[idx];
    this.setData({
      'params.bat_UVTD': val,
      'params.bat_UVT': val * 10,
    });
  },

  onBatUVDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batUVDOptions[idx];
    this.setData({
      'params.bat_UVDD': val,
      'params.bat_UVD': val * 10
    });
  },

  onUVRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.batUVRDOptions[idx];
    this.setData({
      'params.bat_UVRDD': val,
      'params.bat_UVRD': val * 10
    });
  },


  onBatUVRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.cellUvrdOptions[idx];
    this.setData({
      'params.bat_UVRD': val * 10, // 存储为100ms单位
      'params.bat_UVRDD': val // 显示为秒单位
    });
  },

  // I级放电过流保护输入监听函数
  onBatOCD1TInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD1T': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD1TD': val,
    });
    return val;
  },
  onBatOCD1DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD1D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD1DD': val
    });
    return val;
  },

  onBatOCD1RTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD1RT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD1RTD': val,
    });
    return val;
  },

  onBatOCD1RDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD1RD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD1RDD': val
    });
    return val;
  },

  // I级充电过流输入监听函数
  onBatOCC1TInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC1T': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC1TD': val,
    });
    return val;
  },
  onBatOCC1DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC1D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC1DD': val
    });
    return val;
  },

  onBatOCC1RTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC1RT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC1RTD': val,
    });
    return val;
  },

  onBatOCC1RDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC1RD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC1RDD': val
    });
    return val;
  },

  // II级充电过流输入监听函数
  onBatOCC2TInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC2T': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC2TD': val,
    });
    return val;
  },
  onBatOCC2DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC2D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC2DD': val
    });
    return val;
  },

  onBatOCC2RTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC2RT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC2RTD': val,
    });
    return val;
  },

  onBatOCC2RDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCC2RD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCC2RDD': val
    });
    return val;
  },

  // 放电电芯高温保护输入监听函数
  onBatOTDTInput(e) {
    console.log('onBatOTDTInput')
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_OTDT': Number(val) + 273,
      'params.bat_OTDTD': val,
    });
  },
  onBatOTDDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_OTDD': val * 10,
      'params.bat_OTDDD': val
    });
  },

  onBatOTDRTInput(e) {
    console.log("onBatOTDRTInput")
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_OTDRT': Number(val) + 273,
      'params.bat_OTDRTD': val,
    });
  },

  onBatOTDRDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_OTDRD': val * 10,
      'params.bat_OTDRDD': val
    });
  },

  // 放电电芯低温保护输入监听函数
  onBatUTDTInput(e) {
    console.log("onBatUTDTInput")
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_UTDT': Number(val) + 273,
      'params.bat_UTDTD': val
    });
  },
  onBatUTDDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_UTDD': val * 10,
      'params.bat_UTDDD': val
    });
  },

  onBatUTDRTInput(e) {
    console.log("onBatUTDRTInput")
    let val = e.detail.val;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_UTDRT': Number(val) + 273,
      'params.bat_UTDRTD': Number(val),
    });
  },

  onBatUTDRDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_UTDRD': val * 10,
      'params.bat_UTDRDD': val
    });
  },

  // 充电电芯高温保护输入监听函数
  onBatOTCTInput(e) {
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_OTCT': Number(val) + 273,
      'params.bat_OTCTD': val
    });
  },
  onBatOTCDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_OTCD': val * 10,
      'params.bat_OTCDD': val
    });
  },

  onBatOTCRTInput(e) {
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_OTCRT': Number(val) + 273,
      'params.bat_OTCRTD': val
    });
  },

  onBatOTCRDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_OTCRD': val * 10,
      'params.bat_OTCRDD': val
    });
  },

  // 充电电芯低温保护输入监听函数
  onBatUTCTInput(e) {
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_UTCT': Number(val) + 273,
      'params.bat_UTCTD': val,
    });
  },
  onBatUTCDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_UTCD': val * 10,
      'params.bat_UTCDD': val
    });
  },

  onBatUTCRTInput(e) {
    console.log("onBatUTCRTInput")
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.bat_UTCRT': Number(val) + 273,
      'params.bat_UTCRTD': val
    });
  },

  onBatUTCRDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.bat_UTCRD': val * 10,
      'params.bat_UTCRDD': val
    });
  },

  // mos高温保护输入监听函数
  onMosOTCTInput(e) {
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.mos_OTCT': parseInt(val) + 273,
      'params.mos_OTCTD': val
    });
  },
  onMosOTCDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.mos_OTCD': val * 10,
      'params.mos_OTCDD': val
    });
  },

  onMosOTCRTInput(e) {
    let val = e.detail.value
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    this.setData({
      'params.mos_OTCRT': parseInt(val) + 273,
      'params.mos_OTCRTD': val
    });
  },

  onMosOTCRDInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    this.setData({
      'params.mos_OTCRD': val * 10,
      'params.mos_OTCRDD': val
    });
  },

  // II级放电过流保护输入监听函数
  onBatOCD2TInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD2T': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD2TD': val,
    });
    return val;
  },
  onBatOCD2DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD2D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD2DD': val
    });
    return val;
  },

  onBatOCD2RTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD2RT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD2RTD': val,
    });
    return val;
  },

  onBatOCD2RDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OCD2RD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OCD2RDD': val
    });
    return val;
  },

  // I级放电过流下拉选择监听函数
  onOCD1TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd1tOptions[idx];
    this.setData({
      'params.bat_OCD1T': val * 10,
      'params.bat_OCD1TD': val
    });
  },

  onOCD1DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd1dOptions[idx];
    this.setData({
      'params.bat_OCD1D': val * 10,
      'params.bat_OCD1DD': val
    });
  },

  onOCD1RTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd1rtOptions[idx];
    this.setData({
      'params.bat_OCD1RT': val * 10,
      'params.bat_OCD1RTD': val
    });
  },

  onOCD1RDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd1rdOptions[idx];
    this.setData({
      'params.bat_OCD1RD': val * 10,
      'params.bat_OCD1RDD': val
    });
  },

  // I级充电过流下拉选择监听函数
  onOCC1TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ1tOptions[idx];
    this.setData({
      'params.bat_OCC1T': val * 10,
      'params.bat_OCC1TD': val
    });
  },

  onOCC1DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ1dOptions[idx];
    this.setData({
      'params.bat_OCC1D': val * 10,
      'params.bat_OCC1DD': val
    });
  },

  onOCC1RTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ1rtOptions[idx];
    this.setData({
      'params.bat_OCC1RT': val * 10,
      'params.bat_OCC1RTD': val
    });
  },

  onOCC1RDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ1rdOptions[idx];
    this.setData({
      'params.bat_OCC1RD': val * 10,
      'params.bat_OCC1RDD': val
    });
  },

  // II级充电过流下拉选择监听函数
  onOCC2TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ2tOptions[idx];
    this.setData({
      'params.bat_OCC2T': val * 10,
      'params.bat_OCC2TD': val
    });
  },

  onOCC2DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ2dOptions[idx];
    this.setData({
      'params.bat_OCC2D': val * 10,
      'params.bat_OCC2DD': val
    });
  },

  onOCC2RTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ2rtOptions[idx];
    this.setData({
      'params.bat_OCC2RT': val * 10,
      'params.bat_OCC2RTD': val
    });
  },

  onOCC2RDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.occ2rdOptions[idx];
    this.setData({
      'params.bat_OCC2RD': val * 10,
      'params.bat_OCC2RDD': val
    });
  },

  // 放电电芯高温保护下拉选择监听函数
  onOTDTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.otdtOptions[idx]);
    this.setData({
      'params.bat_OTDT': val + 273,
      'params.bat_OTDTD': val
    });
  },

  onOTDDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.otddOptions[idx];
    this.setData({
      'params.bat_OTDD': val * 10,
      'params.bat_OTDDD': val
    });
  },

  onOTDRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.otdrtOptions[idx]);
    this.setData({
      'params.bat_OTDRT': val + 273,
      'params.bat_OTDRTD': val
    });
  },

  onOTDRDSelect(e) {
    console.log("onOTDRDSelect")
    let idx = parseInt(e.detail.value)
    const val = this.data.otdrdOptions[idx];
    this.setData({
      'params.bat_OTDRD': val * 10,
      'params.bat_OTDRDD': val
    });
  },

  // 放电电芯低温保护下拉选择监听函数
  onUTDTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.utdtOptions[idx]);
    this.setData({
      'params.bat_UTDT': val + 273,
      'params.bat_UTDTD': val
    });
  },

  onUTDDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.utddOptions[idx];
    this.setData({
      'params.bat_UTDD': val * 10,
      'params.bat_UTDDD': val
    });
  },

  onUTDRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.utdrtOptions[idx]);
    this.setData({
      'params.bat_UTDRT': val + 273,
      'params.bat_UTDRTD': val
    });
  },

  onUTDRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.utdrdOptions[idx];
    this.setData({
      'params.bat_UTDRD': val * 10,
      'params.bat_UTDRDD': val
    });
  },

  // 充电电芯高温保护下拉选择监听函数
  onOTCTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.otctOptions[idx]);
    this.setData({
      'params.bat_OTCT': val + 273,
      'params.bat_OTCTD': val
    });
  },

  onOTCDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.otcdOptions[idx];
    this.setData({
      'params.bat_OTCD': val * 10,
      'params.bat_OTCDD': val
    });
  },

  onOTCRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.otcrtOptions[idx]);
    this.setData({
      'params.bat_OTCRT': val + 273,
      'params.bat_OTCRTD': val
    });
  },

  onOTCRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.otcrdOptions[idx];
    this.setData({
      'params.bat_OTCRD': val * 10,
      'params.bat_OTCRDD': val
    });
  },

  // 充电电芯低温保护下拉选择监听函数
  onUTCTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.utctOptions[idx]);
    this.setData({
      'params.bat_UTCT': val + 273,
      'params.bat_UTCTD': val
    });
  },

  onUTCDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.utcdOptions[idx];
    this.setData({
      'params.bat_UTCD': val * 10,
      'params.bat_UTCDD': val
    });
  },

  onUTCRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.utcrtOptions[idx]);
    this.setData({
      'params.bat_UTCRT': val + 273,
      'params.bat_UTCRTD': val
    });
  },

  onUTCRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.utcrdOptions[idx];
    this.setData({
      'params.bat_UTCRD': val * 10,
      'params.bat_UTCRDD': val
    });
  },

  // mos高温保护下拉选择监听函数
  onMosOTCTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.mosotctOptions[idx]);
    this.setData({
      'params.mos_OTCT': val + 273,
      'params.mos_OTCTD': val
    });
  },

  onMosOTCDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.mosotcdOptions[idx];
    this.setData({
      'params.mos_OTCD': val * 10,
      'params.mos_OTCDD': val
    });
  },

  onMosOTCRTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = Number(this.data.mosotcrtOptions[idx]);
    this.setData({
      'params.mos_OTCRT': val + 273,
      'params.mos_OTCRTD': val
    });
  },

  onMosOTCRDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.mosotcrdOptions[idx];
    this.setData({
      'params.mos_OTCRD': val * 10,
      'params.mos_OTCRDD': val
    });
  },

  // II级放电过流下拉选择监听函数
  onOCD2TSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd2tOptions[idx];
    this.setData({
      'params.bat_OCD2T': val * 10,
      'params.bat_OCD2TD': val
    });
  },

  onOCD2DSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd2dOptions[idx];
    this.setData({
      'params.bat_OCD2D': val * 10,
      'params.bat_OCD2DD': val
    });
  },

  onOCD2RTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd2rtOptions[idx];
    this.setData({
      'params.bat_OCD2RT': val * 10,
      'params.bat_OCD2RTD': val
    });
  },

  onOCD2RDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.ocd2rdOptions[idx];
    this.setData({
      'params.bat_OCD2RD': val * 10,
      'params.bat_OCD2RDD': val
    });
  },


  // 放电短路保护输入监听函数
  onBatSCDTInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_SCDT': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_SCDTD': val,
    });
    return val;
  },
  onBatSCDDInput(e) {
    this.setData({
      'params.bat_SCDD': parseFloat(Number(e.detail.value) / 10).toFixed(1),
      'params.bat_SCDDD': Number(e.detail.value),
    });
  },

  // 放电短路保护下拉选择监听函数
  onSCDTSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.scdtOptions[e.detail.value];
    this.setData({
      'params.bat_SCDT': val * 10,
      'params.bat_SCDTD': val
    });
  },
  onSCDDSelect(e) {
    let idx = parseInt(e.detail.value)
    const val = this.data.scddOptions[e.detail.value];
    this.setData({
      'params.bat_SCDD': parseFloat(val / 10).toFixed(1),
      'params.bat_SCDDD': val
    });
  },

  // 校验放电短路保护参数
  validateSCDParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择2个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.bat_SCDTD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }

    // 校验触发门限(0.1A)
    if (params.bat_SCDT < ranges.bat_SCDT[0] || params.bat_SCDT > ranges.bat_SCDT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_SCDT[0]/10}~${ranges.bat_SCDT[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(us)

    if (typeof params.bat_SCDDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }
    if (params.bat_SCDD < ranges.bat_SCDD[0] || params.bat_SCDD > ranges.bat_SCDD[1]) {
      wx.showToast({
        title: `触发延时范围${ranges.bat_SCDD[0] * 10}~${ranges.bat_SCDD[1]*10}us`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验电芯过压保护参数
  validateCellOVParams() {
    console.log("validateCellOVParams")
    let that = this;

    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择4个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.cell_OVT == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }


    // 校验触发门限(mV)
    if (params.cell_OVT < ranges.cell_OVT[0] || params.cell_OVT > ranges.cell_OVT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.cell_OVT[0]}~${ranges.cell_OVT[1]}mV`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    if (typeof params.cell_OVDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }

    const ovdMin = ranges.cell_OVD[0] / 10; // 转换为秒
    const ovdMax = ranges.cell_OVD[1] / 10;
    // 检查转换后的秒单位值
    if (params.cell_OVDD < ovdMin || params.cell_OVDD > ovdMax) {
      wx.showToast({
        title: `触发延时范围${ovdMin}~${ovdMax}s`,
        icon: 'none'
      });
      return false;
    }
    // 检查原始100ms单位值
    if (params.cell_OVD < ranges.cell_OVD[0] || params.cell_OVD > ranges.cell_OVD[1]) {
      wx.showToast({
        title: `触发延时范围${ovdMin}~${ovdMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(mV)

    if (typeof params.cell_OVRT == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复门限',
        icon: 'none'
      });
      return false;
    }

    if (params.cell_OVRT < ranges.cell_OVRT[0] || params.cell_OVRT > ranges.cell_OVRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.cell_OVRT[0] }~${ranges.cell_OVRT[1] }mV`,
        icon: 'none'
      });
      return false;
    }
    // 过压触发门限 > 恢复门限
    if (params.cell_OVT <= params.cell_OVRT) {
      wx.showToast({
        title: "触发门限需大于恢复门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)

    if (typeof params.cell_OVRDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复延时',
        icon: 'none'
      });
      return false;
    }
    const ovrdMin = ranges.cell_OVRD[0] / 10; // 转换为秒
    const ovrdMax = ranges.cell_OVRD[1] / 10;
    console.log('恢复延时校验:', {
      '当前值': params.cell_OVRD,
      '最小值': ovrdMin,
      '最大值': ovrdMax,
      '原始范围': ranges.cell_OVRD
    });
    if (params.cell_OVRD < ranges.cell_OVRD[0] || params.cell_OVRD > ranges.cell_OVRD[1]) {
      wx.showToast({
        title: `恢复延时范围${ovrdMin}~${ovrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验I级软件 电芯过压保护参数
  validateCellOV1Params() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    // 校验触发门限(mV)
    if (params.cell_OV1T < ranges.cell_OV1T[0] || params.cell_OV1T > ranges.cell_OV1T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.cell_OV1T[0]}~${ranges.cell_OV1T[1]}mV`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const ovdMin = ranges.cell_OV1D[0] / 10; // 转换为秒
    const ovdMax = ranges.cell_OV1D[1] / 10;
    // 检查转换后的秒单位值
    if (params.cell_OV1DD < ovdMin || params.cell_OV1DD > ovdMax) {
      wx.showToast({
        title: `触发延时范围${ovdMin}~${ovdMax}s`,
        icon: 'none'
      });
      return false;
    }
    // 检查原始100ms单位值
    if (params.cell_OV1D < ranges.cell_OV1D[0] || params.cell_OV1D > ranges.cell_OV1D[1]) {
      wx.showToast({
        title: `触发延时范围${ovdMin}~${ovdMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(mV)
    if (params.cell_OVR1T < ranges.cell_OVR1T[0] || params.cell_OVR1T > ranges.cell_OVR1T[1]) {
      wx.showToast({
        title: `恢复门限范围${cell_OVR1T[0] }~${cell_OVR1T[1] }mV`,
        icon: 'none'
      });
      return false;
    }

    // 过压触发门限 > 恢复门限
    if (params.cell_OV1T <= params.cell_OVR1T) {
      wx.showToast({
        title: "触发门限需大于恢复门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const ovrdMin = ranges.cell_OVR1D[0] / 10; // 转换为秒
    const ovrdMax = ranges.cell_OVR1D[1] / 10;
    console.log('恢复延时校验:', {
      '当前值': params.cell_OVR1D,
      '最小值': ovrdMin,
      '最大值': ovrdMax,
      '原始范围': ranges.cell_OVR1D
    });
    if (params.cell_OVR1D < ranges.cell_OVR1D[0] || params.cell_OVR1D > ranges.cell_OVR1D[1]) {
      wx.showToast({
        title: `恢复延时范围${ovrdMin}~${ovrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验电芯欠压保护参数
  validateCellUVParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;
    if(!ranges || !ranges.cell_UVT){
      console.log("没查到范围，return true")
      return true;
    }

    // 校验触发门限(mV)
    if (params.cell_UVT < ranges.cell_UVT[0] || params.cell_UVT > ranges.cell_UVT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.cell_UVT[0]}~${ranges.cell_UVT[1]}mV`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const uvdMin = ranges.cell_UVD[0] / 10;
    const uvdMax = ranges.cell_UVD[1] / 10;
    if (params.cell_UVD < ranges.cell_UVD[0] || params.cell_UVD > ranges.cell_UVD[1]) {
      wx.showToast({
        title: `触发延时范围${uvdMin}~${uvdMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(mV)
    if (params.cell_UVRT < ranges.cell_UVRT[0] || params.cell_UVRT > ranges.cell_UVRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.cell_UVRT[0]}~${ranges.cell_UVRT[1]}mV`,
        icon: 'none'
      });
      return false;
    }
    // 欠压触发门限 < 恢复门限
    if (params.cell_UVRT <= params.cell_UVT) {
      wx.showToast({
        title: "触发门限需小于恢复门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const uvrdMin = ranges.cell_UVRD[0] / 10;
    const uvrdMax = ranges.cell_UVRD[1] / 10;
    if (params.cell_UVRD < ranges.cell_UVRD[0] || params.cell_UVRD > ranges.cell_UVRD[1]) {
      wx.showToast({
        title: `恢复延时范围${uvrdMin}~${uvrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验总压过压保护参数
  validatePackOVParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if(!ranges || !ranges.bat_OVT){
      console.log("没查到范围，return true")
      return true;
    }
    // 校验触发门限(0.1V)
    if (params.bat_OVT < ranges.bat_OVT[0] || params.bat_OVT > ranges.bat_OVT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OVT[0]/10}~${ranges.bat_OVT[1]/10}V`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const ovdMin = ranges.bat_OVD[0] / 10;
    const ovdMax = ranges.bat_OVD[1] / 10;
    if (params.bat_OVD < ranges.bat_OVD[0] || params.bat_OVD > ranges.bat_OVD[1]) {
      wx.showToast({
        title: `触发延时范围${ovdMin}~${ovdMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(0.1V)
    if (params.bat_OVRT < ranges.bat_OVRT[0] || params.bat_OVRT > ranges.bat_OVRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_OVRT[0]/10}~${ranges.bat_OVRT[1]/10}V`,
        icon: 'none'
      });
      return false;
    }

    // 过压触发门限 > 恢复门限
    if (params.bat_OVT <= params.bat_OVRT) {
      wx.showToast({
        title: "触发门限需大于恢复门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const ovrdMin = ranges.bat_OVRD[0] / 10;
    const ovrdMax = ranges.bat_OVRD[1] / 10;
    if (params.bat_OVRD < ranges.bat_OVRD[0] || params.bat_OVRD > ranges.bat_OVRD[1]) {
      wx.showToast({
        title: `恢复延时范围${ovrdMin}~${ovrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验总压欠压保护参数
  validatePackUVParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;
    if(!ranges || !ranges.bat_UVT){
      console.log("没查到范围，return true")
      return true;
    }
    // 校验触发门限(0.1V)
    if (params.bat_UVT < ranges.bat_UVT[0] || params.bat_UVT > ranges.bat_UVT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_UVT[0]/10}~${ranges.bat_UVT[1]/10}V`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const uvdMin = ranges.bat_UVD[0] / 10;
    const uvdMax = ranges.bat_UVD[1] / 10;
    if (params.bat_UVD < ranges.bat_UVD[0] || params.bat_UVD > ranges.bat_UVD[1]) {
      wx.showToast({
        title: `触发延时范围${uvdMin}~${uvdMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(0.1V)
    if (params.bat_UVRT < ranges.bat_UVRT[0] || params.bat_UVRT > ranges.bat_UVRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_UVRT[0]/10}~${ranges.bat_UVRT[1]/10}V`,
        icon: 'none'
      });
      return false;
    }

    // 欠压触发门限 < 恢复门限
    if (params.bat_UVRT <= params.bat_UVT) {
      wx.showToast({
        title: "触发门限需小于恢复门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const uvrdMin = ranges.bat_UVRD[0] / 10;
    const uvrdMax = ranges.bat_UVRD[1] / 10;
    if (params.bat_UVRD < ranges.bat_UVRD[0] || params.bat_UVRD > ranges.bat_UVRD[1]) {
      wx.showToast({
        title: `恢复延时范围${uvrdMin}~${uvrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验I级放电过流参数
  validateDisOC1Params() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择3个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.bat_OCD1TD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }




    // 校验触发门限(0.1A)
    if (params.bat_OCD1T < ranges.bat_OCD1T[0] || params.bat_OCD1T > ranges.bat_OCD1T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCD1T[0]/10}~${ranges.bat_OCD1T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)

    if (typeof params.bat_OCD1DD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }

    const ocd1dMin = ranges.bat_OCD1D[0] / 10;
    const ocd1dMax = ranges.bat_OCD1D[1] / 10;
    if (params.bat_OCD1D < ranges.bat_OCD1D[0] || params.bat_OCD1D > ranges.bat_OCD1D[1]) {
      wx.showToast({
        title: `触发延时范围${ocd1dMin}~${ocd1dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // // 校验恢复门限(0.1A)
    // if (params.bat_OCD1RT < ranges.bat_OCD1RT[0] || params.bat_OCD1RT > ranges.bat_OCD1RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCD1RT[0]/10}~${ranges.bat_OCD1RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }
    // 校验恢复延时(s)
    if (typeof params.bat_OCD1RDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复延时',
        icon: 'none'
      });
      return false;
    }

    const ocd1rdMin = ranges.bat_OCD1RD[0] / 10;
    const ocd1rdMax = ranges.bat_OCD1RD[1] / 10;
    if (params.bat_OCD1RD < ranges.bat_OCD1RD[0] || params.bat_OCD1RD > ranges.bat_OCD1RD[1]) {
      wx.showToast({
        title: `恢复延时范围${ocd1rdMin}~${ocd1rdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验I级充电过流参数
  validateOCC1Params() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择3个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.bat_OCC1TD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }

    // 校验触发门限(0.1A)
    if (params.bat_OCC1T < ranges.bat_OCC1T[0] || params.bat_OCC1T > ranges.bat_OCC1T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCC1T[0]/10}~${ranges.bat_OCC1T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    if (typeof params.bat_OCC1DD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }
    const occ1dMin = ranges.bat_OCC1D[0] / 10;
    const occ1dMax = ranges.bat_OCC1D[1] / 10;
    if (params.bat_OCC1D < ranges.bat_OCC1D[0] || params.bat_OCC1D > ranges.bat_OCC1D[1]) {
      wx.showToast({
        title: `触发延时范围${occ1dMin}~${occ1dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // // I级放电过流 < II级放电过流
    // if (params.bat_OCC1T >= params.bat_OCC2T) {
    //   wx.showToast({
    //     title: "I级充电过流触发门限 需小于 II级充电过流触发门限",
    //     icon: 'none'
    //   });
    //   return false
    // }

    // // 校验恢复门限(0.1A)
    // if (params.bat_OCC1RT < ranges.bat_OCC1RT[0] || params.bat_OCC1RT > ranges.bat_OCC1RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCC1RT[0]/10}~${ranges.bat_OCC1RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
    if (typeof params.bat_OCC1RDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复延时',
        icon: 'none'
      });
      return false;
    }
    const occ1rdMin = ranges.bat_OCC1RD[0] / 10;
    const occ1rdMax = ranges.bat_OCC1RD[1] / 10;
    if (params.bat_OCC1RD < ranges.bat_OCC1RD[0] || params.bat_OCC1RD > ranges.bat_OCC1RD[1]) {
      wx.showToast({
        title: `恢复延时范围${occ1rdMin}~${occ1rdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验II级充电过流参数
  validateOCC2Params() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择3个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.bat_OCC2TD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }


    // 校验触发门限(0.1A)
    if (params.bat_OCC2T < ranges.bat_OCC2T[0] || params.bat_OCC2T > ranges.bat_OCC2T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCC2T[0]/10}~${ranges.bat_OCC2T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    if (typeof params.bat_OCC2DD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }

    const occ2dMin = ranges.bat_OCC2D[0] / 10;
    const occ2dMax = ranges.bat_OCC2D[1] / 10;
    if (params.bat_OCC2D < ranges.bat_OCC2D[0] || params.bat_OCC2D > ranges.bat_OCC2D[1]) {
      wx.showToast({
        title: `触发延时范围${occ2dMin}~${occ2dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // I级放电过流 < II级放电过流
    // if (params.bat_OCC1T >= params.bat_OCC2T) {
    //   wx.showToast({
    //     title: "I级充电过流触发门限 需小于 II级充电过流触发门限",
    //     icon: 'none'
    //   });
    //   return false
    // }

    // 校验恢复门限(0.1A)
    // if (params.bat_OCC2RT < ranges.bat_OCC2RT[0] || params.bat_OCC2RT > ranges.bat_OCC2RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCC2RT[0]/10}~${ranges.bat_OCC2RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
    if (typeof params.bat_OCC2RDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复延时',
        icon: 'none'
      });
      return false;
    }
    const occ2rdMin = ranges.bat_OCC2RD[0] / 10;
    const occ2rdMax = ranges.bat_OCC2RD[1] / 10;
    if (params.bat_OCC2RD < ranges.bat_OCC2RD[0] || params.bat_OCC2RD > ranges.bat_OCC2RD[1]) {
      wx.showToast({
        title: `恢复延时范围${occ2rdMin}~${occ2rdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验II级放电过流参数
  validateDisOC2Params() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择3个参数',
        icon: 'none'
      });
      return false;
    }


    if (typeof params.bat_OCD2TD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发门限',
        icon: 'none'
      });
      return false;
    }

    // 校验触发门限(0.1A)
    if (params.bat_OCD2T < ranges.bat_OCD2T[0] || params.bat_OCD2T > ranges.bat_OCD2T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCD2T[0]/10}~${ranges.bat_OCD2T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    if (typeof params.bat_OCD2DD == 'undefined') {
      wx.showToast({
        title: '请输入/选择触发延时',
        icon: 'none'
      });
      return false;
    }

    const ocd2dMin = ranges.bat_OCD2D[0] / 10;
    const ocd2dMax = ranges.bat_OCD2D[1] / 10;
    if (params.bat_OCD2D < ranges.bat_OCD2D[0] || params.bat_OCD2D > ranges.bat_OCD2D[1]) {
      wx.showToast({
        title: `触发延时范围${ocd2dMin}~${ocd2dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // I级放电过流 < II级放电过流
    // if (params.bat_OCD1T >= params.bat_OCD2T) {
    //   wx.showToast({
    //     title: "I级放电过流触发门限 需小于 II级放电过流触发门限",
    //     icon: 'none'
    //   });
    //   return false
    // }

    // // 校验恢复门限(0.1A)
    // if (params.bat_OCD2RT < ranges.bat_OCD2RT[0] || params.bat_OCD2RT > ranges.bat_OCD2RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCD2RT[0]/10}~${ranges.bat_OCD2RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
    if (typeof params.bat_OCD2RDD == 'undefined') {
      wx.showToast({
        title: '请输入/选择恢复延时',
        icon: 'none'
      });
      return false;
    }
    const ocd2rdMin = ranges.bat_OCD2RD[0] / 10;
    const ocd2rdMax = ranges.bat_OCD2RD[1] / 10;
    if (params.bat_OCD2RD < ranges.bat_OCD2RD[0] || params.bat_OCD2RD > ranges.bat_OCD2RD[1]) {
      wx.showToast({
        title: `恢复延时范围${ocd2rdMin}~${ocd2rdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },
  // 校验基础参数
  validateBasicParams() {
    console.log("validateBasicParams")
    let that = this;
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    if (!params) {
      wx.showToast({
        title: '请先输入/选择3个参数',
        icon: 'none'
      });
      return false;
    }

    // 校验电芯材料
    if (typeof params.cell_mat == 'undefined' && !that.data.selectedMaterial) {
      wx.showToast({
        title: '请选择电芯材料',
        icon: 'none'
      });
      return false;
    }

    let cellmat = params.cell_mat
    if(!cellmat){
      cellmat = that.data.selectedMaterial.value
    }
    if (![1, 2].includes(cellmat)) {
      wx.showToast({
        title: '请选择正确的电芯材料',
        icon: 'none'
      });
      return false;
    }

    // 校验电芯串数
    if (typeof params.cell_cnt == 'undefined') {
      wx.showToast({
        title: '请选择电芯串数',
        icon: 'none'
      });
      return false;
    }
    if (params.cell_cnt < that.data.seriesOptions[0] || params.cell_cnt > that.data.seriesOptions[that.data.seriesOptions.length - 1]) {
      wx.showToast({
        title: `电芯串数范围${that.data.seriesOptions[0]}~${that.data.seriesOptions[that.data.seriesOptions.length-1]}`,
        icon: 'none'
      });
      return false;
    }

    // 校验电芯容量
    const capMin = that.data.capacityOptions[4]; //前面插入来30，40，50，60，才是20
    const capMax = that.data.capacityOptions[that.data.capacityOptions.length - 1]

    if (typeof params.designed_capD == 'undefined') {
      wx.showToast({
        title: "请输入/选择电芯容量",
        icon: 'none'
      });
      return false;
    }
    if (params.designed_capD < capMin || params.designed_capD > capMax) {
      wx.showToast({
        title: `电芯容量范围${capMin}~${capMax}Ah`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验放电电芯高温保护参数
  validateOTDParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    // 校验触发门限(开尔文温度)
    if (params.bat_OTDT < ranges.bat_OTDT[0] || params.bat_OTDT > ranges.bat_OTDT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OTDT[0] - 273}~${ranges.bat_OTDT[1] - 273}℃`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const otddMin = ranges.bat_OTDD[0] / 10;
    const otddMax = ranges.bat_OTDD[1] / 10;
    if (params.bat_OTDD < ranges.bat_OTDD[0] || params.bat_OTDD > ranges.bat_OTDD[1]) {
      wx.showToast({
        title: `触发延时范围${otddMin}~${otddMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(开尔文温度)
    if (params.bat_OTDRT < ranges.bat_OTDRT[0] || params.bat_OTDRT > ranges.bat_OTDRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_OTDRT[0]-273}~${ranges.bat_OTDRT[1]-273}℃`,
        icon: 'none'
      });
      return false;
    }


    //  高温保护触发门限要高于恢复门限，低温保护恢复门限要高于低温保护触发门限
    if (params.bat_OTDT <= params.bat_OTDRT) {
      wx.showToast({
        title: "高温保护触发门限  需大于  高温保护恢复门限 ",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const otdrdMin = ranges.bat_OTDRD[0] / 10;
    const otdrdMax = ranges.bat_OTDRD[1] / 10;
    if (params.bat_OTDRD < ranges.bat_OTDRD[0] || params.bat_OTDRD > ranges.bat_OTDRD[1]) {
      wx.showToast({
        title: `恢复延时范围${otdrdMin}~${otdrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验放电电芯低温保护参数
  validateUTDParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    if (!ranges) {
      return true;
    }

    // 校验触发门限(开尔文温度)
    if (params.bat_UTDT < ranges.bat_UTDT[0] || params.bat_UTDT > ranges.bat_UTDT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_UTDT[0] - 273}~${ranges.bat_UTDT[1] - 273}℃`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const otddMin = ranges.bat_UTDD[0] / 10;
    const otddMax = ranges.bat_UTDD[1] / 10;
    if (params.bat_UTDD < ranges.bat_UTDD[0] || params.bat_UTDD > ranges.bat_UTDD[1]) {
      wx.showToast({
        title: `触发延时范围${otddMin}~${otddMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(开尔文温度)
    if (params.bat_OTDRT < ranges.bat_UTDRT[0] || params.bat_UTDRT > ranges.bat_UTDRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_UTDRT[0]-273}~${ranges.bat_UTDRT[1]-273}℃`,
        icon: 'none'
      });
      return false;
    }

    //  高温保护触发门限要高于恢复门限，低温保护恢复门限要高于低温保护触发门限
    if (params.bat_OTDRT <= params.bat_UTDT) {
      wx.showToast({
        title: "低温保护恢复门限  需大于  低温保护触发门限 ",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const otdrdMin = ranges.bat_UTDRD[0] / 10;
    const otdrdMax = ranges.bat_UTDRD[1] / 10;
    if (params.bat_UTDRD < ranges.bat_UTDRD[0] || params.bat_UTDRD > ranges.bat_UTDRD[1]) {
      wx.showToast({
        title: `恢复延时范围${otdrdMin}~${otdrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验充电电芯高温保护参数
  validateOTCParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    // 校验触发门限(开尔文温度)
    if (params.bat_OTCT < ranges.bat_OTCT[0] || params.bat_OTCT > ranges.bat_OTCT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OTCT[0] - 273}~${ranges.bat_OTCT[1] - 273}℃`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const otddMin = ranges.bat_OTCD[0] / 10;
    const otddMax = ranges.bat_OTCD[1] / 10;
    if (params.bat_OTCD < ranges.bat_OTCD[0] || params.bat_OTCD > ranges.bat_OTCD[1]) {
      wx.showToast({
        title: `触发延时范围${otddMin}~${otddMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(开尔文温度)
    if (params.bat_OTCRT < ranges.bat_OTCRT[0] || params.bat_OTCRT > ranges.bat_OTCRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_OTCRT[0]-273}~${ranges.bat_OTCRT[1]-273}℃`,
        icon: 'none'
      });
      return false;
    }

    //  高温保护触发门限要高于恢复门限，低温保护恢复门限要高于低温保护触发门限
    if (params.bat_OTCT <= params.bat_OTCRT) {
      wx.showToast({
        title: "高温保护触发门限  需大于  高温保护恢复门限 ",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const otdrdMin = ranges.bat_OTCRD[0] / 10;
    const otdrdMax = ranges.bat_OTCRD[1] / 10;
    if (params.bat_OTCRD < ranges.bat_OTCRD[0] || params.bat_OTCRD > ranges.bat_OTCRD[1]) {
      wx.showToast({
        title: `恢复延时范围${otdrdMin}~${otdrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  //校验充电电芯低温保护参数
  validateUTCParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    // 校验触发门限(开尔文温度)
    if (params.bat_UTCT < ranges.bat_UTCT[0] || params.bat_UTCT > ranges.bat_UTCT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_UTCT[0] - 273}~${ranges.bat_UTCT[1] - 273}℃`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const otddMin = ranges.bat_UTCD[0] / 10;
    const otddMax = ranges.bat_UTCD[1] / 10;
    if (params.bat_UTCD < ranges.bat_UTCD[0] || params.bat_UTCD > ranges.bat_UTCD[1]) {
      wx.showToast({
        title: `触发延时范围${otddMin}~${otddMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(开尔文温度)
    if (params.bat_UTCRT < ranges.bat_UTCRT[0] || params.bat_UTCRT > ranges.bat_UTCRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.bat_UTCRT[0]-273}~${ranges.bat_UTCRT[1]-273}℃`,
        icon: 'none'
      });
      return false;
    }

    //  高温保护触发门限要高于恢复门限，低温保护恢复门限要高于低温保护触发门限
    if (params.bat_UTCRT <= params.bat_UTCT) {
      wx.showToast({
        title: "低温保护恢复门限  需大于  低温保护触发门限 ",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const otdrdMin = ranges.bat_UTCRD[0] / 10;
    const otdrdMax = ranges.bat_UTCRD[1] / 10;
    if (params.bat_UTCRD < ranges.bat_UTCRD[0] || params.bat_UTCRD > ranges.bat_UTCRD[1]) {
      wx.showToast({
        title: `恢复延时范围${otdrdMin}~${otdrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // mos 高温保护参数
  validateMosParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    // 校验触发门限(开尔文温度)
    if (params.mos_OTCT < ranges.mos_OTCT[0] || params.mos_OTCT > ranges.mos_OTCT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.mos_OTCT[0] - 273}~${ranges.mos_OTCT[1] - 273}℃`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const otddMin = ranges.mos_OTCD[0] / 10;
    const otddMax = ranges.mos_OTCD[1] / 10;
    if (params.mos_OTCD < ranges.mos_OTCD[0] || params.mos_OTCD > ranges.mos_OTCD[1]) {
      wx.showToast({
        title: `触发延时范围${otddMin}~${otddMax}s`,
        icon: 'none'
      });
      return false;
    }

    // 校验恢复门限(开尔文温度)
    if (params.mos_OTCRT < ranges.mos_OTCRT[0] || params.mos_OTCRT > ranges.mos_OTCRT[1]) {
      wx.showToast({
        title: `恢复门限范围${ranges.mos_OTCRT[0]-273}~${ranges.mos_OTCRT[1]-273}℃`,
        icon: 'none'
      });
      return false;
    }

    //  高温保护触发门限要高于恢复门限，低温保护恢复门限要高于低温保护触发门限
    if (params.mos_OTCT <= params.mos_OTCRT) {
      wx.showToast({
        title: "高温保护触发门限  需大于  高温保护恢复门限 ",
        icon: 'none'
      });
      return false
    }

    // 校验恢复延时(s)
    const otdrdMin = ranges.mos_OTCRD[0] / 10;
    const otdrdMax = ranges.mos_OTCRD[1] / 10;
    if (params.mos_OTCRD < ranges.mos_OTCRD[0] || params.mos_OTCRD > ranges.mos_OTCRD[1]) {
      wx.showToast({
        title: `恢复延时范围${otdrdMin}~${otdrdMax}s`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 校验BT码输入字段
  validateBtCodeInputs() {
    let that = this;
    const {
      btVoltageValue,
      btCapacityValue,
      btCycleLifeValue,
      btManufacturerValue,
      btProductionYear,
      // btProductionMonth,
      // btProductionDay,
      // btSerialNumber
    } = this.data;

    // 材料
    if (!that.data.selectedMaterial) {
      wx.showToast({
        title: '请先选择材料体系',
        icon: 'none'
      });
      return false;
    }

    // // 校验电压等级 (3位数字)
    if (!btVoltageValue || isNaN(btVoltageValue)) {
      wx.showToast({
        title: '电压等级需为数字',
        icon: 'none'
      });
      return false;
    } else if (btVoltageValue < 30 || btVoltageValue > 100) {
      wx.showToast({
        title: '电压等级范围30-99',
        icon: 'none'
      });
      return false;
    }

    // 校验容量等级 (3位数字)
    if (!btCapacityValue || isNaN(btCapacityValue)) {
      wx.showToast({
        title: '容量等级需为数字',
        icon: 'none'
      });
      return false;
    } else if (btCapacityValue < 20 || btCapacityValue > 100) {
      wx.showToast({
        title: '容量等级范围20-99',
        icon: 'none'
      });
      return false;
    }

    // 校验循环寿命 (2位数字)
    if (!btCycleLifeValue || isNaN(btCycleLifeValue)) {
      wx.showToast({
        title: '循环寿命需为2位数字',
        icon: 'none'
      });
      return false;
    } else if (btCycleLifeValue < 10 || btCycleLifeValue > 40) {
      wx.showToast({
        title: '循环寿命范围10-40',
        icon: 'none'
      });
      return false;
    }

    // 校验厂家代码 (4位字母数字)
    if (!btManufacturerValue) {
      wx.showToast({
        title: '请输入厂家代码',
        icon: 'none'
      });
      return false;
    } else if (!/^[A-Za-z]+$/.test(btManufacturerValue)) {
      wx.showToast({
        title: '输入的厂家代码需为字母',
        icon: 'none'
      });
      return false;
    }

    // // // 校验生产年份 (2位数字)
    // let time = isNaN(btProductionYear) || isNaN(btProductionMonth) || isNaN(btProductionDay)
    // if (time) {
    //   wx.showToast({
    //     title: '请输入生产日期',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // // 校验生产年份 (2位数字)
    let time = isNaN(btProductionYear)
    if (time) {
      wx.showToast({
        title: '请选择年份',
        icon: 'none'
      });
      return false;
    }

    // // 校验流水号 (3位数字)
    // if (!btSerialNumber || isNaN(btSerialNumber)) {
    //   wx.showToast({
    //     title: '流水号需为数字',
    //     icon: 'none'
    //   });
    //   return false;
    // } else if (btSerialNumber < 1 || btSerialNumber > 999) {
    //   wx.showToast({
    //     title: '流水号范围为1-999',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    return true;
  },


  //清空 ranges
  clearRanges: function () {
    console.warn("===========  clearRanges  ==============")
    this.setData({
      selectedMaterial: null,
      params: null,
      ranges: null,
      generatedBtCode: null,
      tServerAddress: null,
      materialIndex: -1,
      capacityOptions: null,
      ovtOptions: null,
      ovrtOptions: null,
      ovdOptions: null,
      ovrdOptions: null,
      cellUvtOptions: null,
      cellUvrtOptions: null,
      cellUvdOptions: null,
      cellUvrdOptions: null,
      batOVTOptions: null,
      batOVRTOptions: null,
      batOVDOptions: null,
      batOVRDOptions: null,
      batUTVOptions: null,
      batUVRTOptions: null,
      batUVDOptions: null,
      batUVRDOptions: null,
      ocd1tOptions: null,
      ocd1dOptions: null,
      ocd1rtOptions: null,
      ocd1rdOptions: null,
      occ1tOptions: null,
      occ1dOptions: null,
      occ1rtOptions: null,
      occ1rdOptions: null,
      occ2tOptions: null,
      occ2dOptions: null,
      occ2rtOptions: null,
      occ2rdOptions: null,
      otdtOptions: null,
      otddOptions: null,
      otdrtOptions: null,
      otdrdOptions: null,
      utdtOptions: null,
      utddOptions: null,
      utdrtOptions: null,
      utdrdOptions: null,
      otctOptions: null,
      otcdOptions: null,
      otcrtOptions: null,
      otcrdOptions: null,
      utctOptions: null,
      utcdOptions: null,
      utcrtOptions: null,
      utcrdOptions: null,
      mosotctOptions: null,
      mosotcdOptions: null,
      mosotcrtOptions: null,
      mosotcrdOptions: null,

      ov1tOptions: null,
      ovr1tOptions: null,
      ov1dOptions: null,
      ovr1dOptions: null,

      ocd2tOptions: null,
      ocd2dOptions: null,
      ocd2rtOptions: null,
      ocd2rdOptions: null,
      scdtOptions: null,
      scddOptions: null,
      seriesOptions: null
    });
  },

  // 解析BT码
  parseBtCode: function (btCode) {
    if (!btCode || btCode.length !== 24 || !btCode.startsWith('BT')) {
      // wx.showToast({
      //   title: 'BT码格式错误',
      //   icon: 'none'
      // });
      return;
    }

    try {
      // 解析BT码各部分
      const materialCode = parseInt(btCode.substring(2, 3));
      const voltageCode = btCode.substring(3, 6);
      const capacityCode = btCode.substring(6, 9);
      const cycleLifeCode = btCode.substring(9, 11);
      const manufacturerCode = btCode.substring(11, 15);
      const productionYear = btCode.substring(15, 17);
      const productionMonth = btCode.substring(17, 19);
      const productionDay = btCode.substring(19, 21);
      const serialNumber = btCode.substring(21, 24);

      // 设置对应的值到输入字段
      this.setData({
        btMaterialOptions: ['铁锂', '三元'],
        selectedMaterial: that.data.materialArray.find(item => item.value == materialCode),
        // btMaterialIndex: materialCode - 1 >= 0 ? materialCode - 1 : 0,
        btVoltageValue: voltageCode,
        btCapacityValue: capacityCode,
        btCycleLifeValue: cycleLifeCode,
        btManufacturerValue: manufacturerCode,
        btProductionYear: productionYear,
        btProductionMonth: productionMonth,
        btProductionDay: productionDay,
        btSerialNumber: serialNumber
      });

    } catch (error) {
      wx.showToast({
        title: 'BT码解析失败',
        icon: 'none'
      });
    }
  },

  // 设置初始bt码
  initBtCode() {
    console.log("initBtCode")
    let that = this;
    let firstDevice = that.data.selectedDevices[0]
    if (!!firstDevice && firstDevice.btCode) {
      that.parseBtCode(firstDevice.btCode)
    } else {
      // 获取当前系统时间
      const now = new Date();
      const year = now.getFullYear().toString().substring(2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      that.setData({
        // btProductionYear: year,
        // btProductionMonth: month,
        // btProductionDay: day,


        // btMaterialOptions: ['铁锂', '三元'],
        // btMaterialIndex: 0,
        btVoltageValue: '048',
        btCapacityValue: '020',
        btCycleLifeValue: '12',
        btManufacturerValue: '00SW',
        btSerialNumber: '001'
      })
    }




  },

  // 关闭BT码弹窗
  onCloseBtCodeDialog: util.throttle(function () {
    this.setData({
      showBtCodeDialog: false,
      isShowPreview: false
    });
  }, 300),

  // 清除btcode
  onClearGenerateBtcode: util.throttle(function () {
    console.log("onClearGenerateBtcode")
    this.setData({
      // btMaterialIndex: -1,
      selectedMaterial: null,
      btVoltageValue: '',
      btCapacityValue: '',
      btCycleLifeValue: '',
      btManufacturerValue: '',
      btProductionYear: '',
      btProductionMonth: '',
      btProductionDay: '',
      btSerialNumber: '',
      prview_bt_code: ''
    });
  }, 300),

  // 提交btcode
  onSubmitBtcodes: util.throttle(function () {
    console.log("onSubmitBtcodes")
    let that = this;
    if (that.data.bt_code_list && that.data.bt_code_list.length > 0) {
      let content = "设备数量：" + that.data.bt_code_list.length + "; \n 确定配置吗？"
      wx.showModal({
        title: '设置BT码',
        content: content,
        complete: (res) => {
          if (res.confirm) {

            // const bmsIdList = that.data.selectedDevices.map(item => item.bmsId);
            let url = '/bms/api/set_batch/params/btCode'
            let data = {
              "bms_id": that.data.validDevList, // bmsIdList,
              "btcode": that.data.bt_code_list
            }

            let session = wx.getStorageSync('3rdsession') || ''
            const offlineTask = that.data.offlineTask

            if (!session) {
              wx.reLaunch({
                url: '/pages/login/login',
              })
              return;
            }
            let params = {
              '3rdsession': session,
              'offline_task': offlineTask,
              'params': data
            }

            http.post(url, params, {}, true).then(res => {
              if (res.errno === 0) {
                wx.showToast({
                  title: '配置已下发成功',
                  icon: 'none'
                })
                let copyBtCode = that.data.bt_code_list.join(",")
                wx.setClipboardData({
                  data: copyBtCode,
                  success(res) {
                    wx.getClipboardData({
                      success(res) {
                        console.log(res.data) // data
                      }
                    })
                  }
                })
            

                // that.setData({
                //   params: null,
                //   ranges: null,
                //   devString: null,
                //   validDevList: [],
                //   bt_code_list: [],
                //   isShowMultiDialog: false,
                //   selectedSection: {
                //     id: 0,
                //     selectTitle: '请选择批量设置参数',
                //     dialogTitle: '请选择批量设置参数',
                //   },
                //   selectedMaterial: null,
                //   btVoltageValue: '',
                //   btCapacityValue: '',
                //   btCycleLifeValue: '',
                //   btManufacturerValue: '',
                //   btProductionYear: '',
                //   btProductionMonth: '',
                //   btProductionDay: '',
                //   btSerialNumber: '',
                //   prview_bt_code: ''
                // })

                //重新查，会重置选中状态；
                // that.onSearchConfirm();

              } else {
                wx.showToast({
                  title: res.errmsg || '配置失败',
                  icon: 'none'
                });
              }
            }).catch(err => {
              // this.hideDialogModal();
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            });
          }
        }
      })


    } else {
      wx.showToast({
        title: '请先生产BT码',
        icon: 'none'
      })
    }
  }, 300),

  queryThirdServerList(){
    console.log("queryThirdServerList")
    let that = this;
    let url = '/bms/api/mng/tsrv/list'
     let session = wx.getStorageSync('3rdsession') || ''
     let params = {
      '3rdsession': session,
     }

    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        let data = res.data.tsrv_list || []
        that.setData({
          thirdSrvList:data
        })
       } else {
        console.log("查三方服务地址列表失败："+ JSON.stringify(res))
      }
    }).catch(err => {
        console.log("查三方服务地址列表报错:",JSON.stringify(err))
    });
  },



  // 批量生产
  onMultiProduct: function () {
    console.log("onMultiProduct")
    let that = this;
    // 先校验所有输入字段
    if (!this.validateBtCodeInputs()) {
      return;
    }
    let btCodePrefix = that.generateBtCode();

    //对输入字段做解析；

    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }

    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
      // if (validItems.length > 50) {
      //   wx.showToast({
      //     title: '最多输入50组编码',
      //     icon: 'none'
      //   })
      //   return
      // } else {
        that.setData({
          validDevList: validItems,
        })
      // }

    } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        that.setData({
          validDevList: validItems,
          isPreview: true
        })
        return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        return
      }
    }


    // let bt_code_list = that.data.selectedDevices.map((item, index) => {
    //   if (item.bmsId.length >= 7) {
    //     //取bmsId 的后6位拼接
    //     let endFix = item.bmsId.slice(-7)
    //     let sn = btCodePrefix + endFix;
    //     console.log("sn = ", sn)
    //     return sn
    //   } else {
    //     console.log("bmsId的长度不足7位，补0，bmsId = ", item.bmsId)
    //    let endFix = item.bmsId.padStart(7, '0').substring(0, 7)
    //    let sn = btCodePrefix + endFix;
    //    console.log("sn = ", sn)
    //    return sn
    //   }

    //   // if (index == 0) {
    //   //   return generateCode;
    //   // } else {
    //   //   let prefix = generateCode.slice(0, generateCode.length - 3);
    //   //   let serialNumber = generateCode.slice(-3);
    //   //   let newNumber = parseInt(serialNumber) + index
    //   //   newNumber += ''

    //   //   if (newNumber.length == 1) {
    //   //     newNumber = '00' + newNumber
    //   //   } else if (newNumber.length == 2) {
    //   //     newNumber = '0' + newNumber
    //   //   }

    //   //   let sn = prefix + newNumber;
    //   //   console.log("sn = ", sn)
    //   //   return sn

    //   // }
    // })

    let bt_code_list = validItems.map((item, index) => {
      if (item.length >= 7) {
        //取bmsId 的后6位拼接
        let endFix = item.slice(-7)
        let sn = btCodePrefix + endFix;
        console.log("sn = ", sn)
        return sn
      } else {
        console.log("bmsId的长度不足7位，补0，bmsId = ", item.bmsId)
        let endFix = item.padStart(7, '0').substring(0, 7)
        let sn = btCodePrefix + endFix;
        console.log("sn = ", sn)
        return sn
      }

    })
    that.setData({
      bt_code_list: bt_code_list
    })
  },

  // 生成BT码
  generateBtCode: function () {
    console.log("generateBtCode");
    let that = this;
    const {
      // btMaterialIndex,
      selectedMaterial,
      btVoltageValue,
      btCapacityValue,
      btCycleLifeValue,
      btManufacturerValue,
      btProductionYear,
      // btProductionMonth,  // 只取到年份，后6位直接取用bmsId 的后6位
      // btProductionDay,
      // btSerialNumber
    } = this.data;

    // 材料体系 (1位: 1=铁锂, 2=三元)
    const materialCode = selectedMaterial.value; // that.data.materialArray[btMaterialIndex].value;

    // 电压等级 (3位)
    const voltageCode = btVoltageValue.padStart(3, '0').substring(0, 3);

    // 容量等级 (3位)
    const capacityCode = btCapacityValue.padStart(3, '0').substring(0, 3);

    // 循环寿命 (2位)
    const cycleLifeCode = btCycleLifeValue.padStart(2, '0').substring(0, 2);

    // 厂家代码 (4位, 后面不足补0)
    const manufacturerCode = btManufacturerValue.padEnd(4, '0').substring(0, 4);

    // // 流水号
    // const serialNumberCode = btSerialNumber.padStart(3, '0').substring(0, 3);

    // // 生成完整的BT码
    // const btCode = `BT${materialCode}${voltageCode}${capacityCode}${cycleLifeCode}${manufacturerCode}${btProductionYear}${btProductionMonth}${btProductionDay}${serialNumberCode}`;
    // // if (isPreview) {
    // this.setData({
    //   prview_bt_code: btCode
    // });
    //  return btCode

    // 生成bt码的前缀
    const btCodePrefix = `BT${materialCode}${voltageCode}${capacityCode}${cycleLifeCode}${manufacturerCode}${btProductionYear}`;

    return btCodePrefix

  },



  // 电压等级输入
  onBtVoltageInput(e) {
    let value = e.detail.value;
    this.setData({
      btVoltageValue: value
    });
  },

  onBtCycleLifeInput(e) {
    let value = e.detail.value;
    this.setData({
      btCycleLifeValue: value
    });
  },

  onBtVolChange(e) {
    let index = e.detail.value;
    console.log("onBtVolChange index = ", index)
    let _val = this.data.btVolArray[index] + ''
    this.setData({
      btVoltageValue: _val
    })
  },

  onBtLoopChange(e) {
    let index = e.detail.value;
    console.log("onBtLoopChange index = ", index)
    let _val = this.data.btLoopArray[index] + ''
    this.setData({
      btCycleLifeValue: _val
    })
  },

  onBtYearChange(e) {
    let index = e.detail.value;
    console.log("onBtYearChange index = ", index)
    let _val = this.data.btYearArray[index] + ''
    this.setData({
      btProductionYear: _val
    })
  },
  onBtYearChange222(e) {
    let value = e.detail.value;
    console.log("onBtYearChange222 value = ", value)
    if (value.length == 4) {
      let year = value.substring(2);
      this.setData({
        btProductionYear: year,
      })
    } else if (value.length == 2) {
      this.setData({
        btProductionYear: value,
      })
    }



  },

  onBtDayChange(e) {
    let index = e.detail.value;
    console.log("onBtDayChange index = ", index)
    let valNum = Number(this.data.btDayArray[index])
    let _val = this.data.btDayArray[index] + ''
    if (!!this.data.btProductionMonth) {
      if (Number(this.data.btProductionMonth) == 2) {
        //还需判断闰年
        if (!!this.data.btProductionYear) {
          let year = Number('20' + this.data.btProductionYear)
          if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) { // 有29号
            if (valNum > 29) {
              wx.showToast({
                title: '所选月份没有这个日期，请重选',
                icon: 'none'
              })
            }
          } else { // 只有28号

          }
        }
      } else if ([4, 6, 9, 11].indexOf(Number(this.data.btProductionMonth)) != -1) {

      }

    }



    this.setData({
      btProductionDay: _val
    })
  },

  onBtDayChange222(e) {
    let value = e.detail.value;
    console.log("onBtDayChange222 value = ", value)
    let list = value.split("-")
    let year = list[0].substring(2);
    let month = list[1];
    let day = list[2]
    this.setData({
      btProductionYear: year,
      btProductionMonth: month,
      btProductionDay: day
    })
  },

  showTips(e) {
    let that = this;
    console.log("showTips")
    let filed = e.currentTarget.dataset.filed;
    if (filed == 'day') {
      wx.showToast({
        title: '请先选择月份',
        icon: 'none'
      })
    } else if (filed == 'month') {
      wx.showToast({
        title: '请先选择年份',
        icon: 'none'
      })
    }
  },

  onBtCapacityChange(e) {
    let index = e.detail.value;
    console.log("onBtCapacityChange index = ", index)
    let _val = this.data.btCapacityArray[index] + ''
    this.setData({
      btCapacityValue: _val
    })
  },

  onBtMonthChange(e) {
    let that = this;
    let index = e.detail.value;
    console.log("onBtMonthChange index = ", index)
    let _val = this.data.btMonthArray[index] + ''


    let startTimeD = '20' + that.data.btProductionYear + '-' + index + '-01'
    let endTimeD = '20' + that.data.btProductionYear + '-' + index + '-31'


    this.setData({
      btProductionMonth: _val,
      startTimeD,
      endTimeD
    })
  },

  onBtMonthChange222(e) {
    let that = this;
    let value = e.detail.value;
    console.log("onBtMonthChange222 value = ", value)
  },

  onBtCapacityInput(e) {
    let value = e.detail.value;
    console.log("onBtCapacityInput value = ", value)
    this.setData({
      btCapacityValue: value
    })
  },

  onBtSerialNumberInput(e) {
    let value = e.detail.value;
    console.log("onBtSerialNumberInput value = ", value)
    this.setData({
      btSerialNumber: value
    })
  },

  onBtSerialNumChange(e) {
    let index = e.detail.value;
    console.log("onBtSerialNumChange index = ", index)
    let _val = this.data.btSerialNumArray[index] + ''
    this.setData({
      btSerialNumber: _val
    })
  },







  // 容量等级输入
  onBtCapacity(e) {
    let value = e.detail.value
    this.setData({
      btCapacityValue: value
    });
  },

  // 循环寿命输入
  onBtCycleLife(e) {
    let value = e.detail.value
    this.setData({
      btCycleLifeValue: value
    });
  },


  // 厂家代码输入
  onbtManufacturerValueInput(e) {
    let value = e.detail.value
    console.log("btManufacturerValue, value = ", value)
    this.setData({
      btManufacturerValue: value
    });
  },

  // 生产年份输入
  onBtProductionYearInput(e) {
    let value = e.detail.value
    this.setData({
      btProductionYear: value
    });
  },

  // 生产月份输入
  onBtProductionMonth(e) {
    let value = e.detail.value
    this.setData({
      btProductionMonth: value
    });
  },

  // 生产日期输入
  onBtProductionDay(e) {
    let value = e.detail.value
    this.setData({
      btProductionDay: value
    });
  },

  // 流水号输入
  onBtSerialNumber(e) {
    let value = e.detail.value
    this.setData({
      btSerialNumber: value
    });
  },



  hideBtDialog: util.throttle(function () {
    console.log("hideBtDialog")
    this.setData({
      // isShowBtCfgDialog: false,
      bt_code_list: [],
      validDevList: [],
      devString: null,
      selectedSection: {
        id: 0,
        selectTitle: '请选择批量设置参数',
        dialogTitle: '请选择批量设置参数',
      }
    })
  }, 1000),



  /** 显示过滤框 */
  showMoreFilter() {
    console.log("showMoreFilter")
    let that = this;
    // wx.showToast({
    //   title: '点击更多',
    // })
    that.setData({
      showFilter: true
    })
  },

  /** 重置 */
  onSelectReset() {
    console.log("onSelectReset")
    let that = this;
    // 清空筛选项内容
    that.setData({
      filterBtCode: null,
      filterCellCnt: null,
      selectedOrg: null,
      selectMetarailFilterItem: null,
      selectDevOnlineItem: null,
      //其他字段
      showFilter: false
    })
    that.onRefresh()

  },

  /** 确认过滤 */
  onFilterConfirm() {
    console.log("onFilterConfirm")
    let that = this;
    that.setData({
      showFilter: false
    })

    that.onRefresh()


  },

  /** 显示在线状态列表 */
  showDevOnlineList() {
    console.log("showDevTypeList");
    let that = this;
    that.setData({
      devOnlineShow: !that.data.devOnlineShow
    })
  },
  /** 选择在线状态 */
  selectDevOnline(e) {
    console.log("selectDevOnline")
    let that = this;
    let index = Number(e.currentTarget.dataset.index);
    that.setData({
      selectDevOnlineItem: that.data.onlineOptions[index],
      devOnlineShow: false
    })
  },

  /** 显示材料列表 */
  showMeterialList() {
    console.log("showMeterialList");
    let that = this;
    that.setData({
      meterialShow: !that.data.meterialShow
    })
  },
  /** 选择在线状态 */
  selectMeterial(e) {
    console.log("selectMeterial")
    let that = this;
    let index = Number(e.currentTarget.dataset.index);
    that.setData({
      selectMetarailFilterItem: that.data.materialArray[index],
      meterialShow: false
    })
  },

  // 输入电芯串数
  onInpuCellCount(e) {
    console.log("onInpuCellCount")
    let that = this;
    let value = e.detail.value;
    that.setData({
      filterCellCnt: value
    })
  },

  //输入bt码
  onInputBtCode(e) {
    console.log("onInputBtCode")
    let value = e.detail.val;
    let that = this;
    that.setData({
      filterBtCode: value
    })
  },

  onSelectGroup: function () {
    console.log("onSelectGroup")
    let that = this;
    wx.navigateTo({
      url: '../groupManager/orgTree/index?radio=true',
    })
  },

  // 选择页调用
  onOrgSelected(org) {
    console.log("onOrgSelected")
    let that = this;
    that.setData({
      selectedOrg: org
    })
  },

  clearOrg: util.throttle(function () {
    console.log("clearOrg")
    let that = this
    that.setData({
      selectedOrg: null
    })

  }, 1000),

  // 触摸开始事件
  touchStart: function (e) {
    // console.log(e.touches[0].pageX)
    let sx = e.touches[0].pageX
    let sy = e.touches[0].pageY
    this.data.touchS = [sx, sy]
  },
  // 触摸滑动事件
  touchMove: function (e) {
    let sx = e.touches[0].pageX;
    let sy = e.touches[0].pageY;
    this.data.touchE = [sx, sy]
  },
  // 触摸结束事件
  touchEnd: function (e) {
    let start = this.data.touchS
    let end = this.data.touchE
    // console.log(start)
    // console.log(end)
    if (start[0] < end[0] - 50) {
      // console.log('向右滑，这里可以调用方法，及页面跳转事件')
      this.onSelectReset()
      this.data.touchS = [0, 0]
      this.data.touchE = [0, 0]
    } else if (start[0] > end[0] + 50) {
      // console.log('向左滑，这里可以调用方法，及页面跳转事件')
    } else {
      // console.log('向上或向下滑动')
    }
  },




  clearInputDevs: util.throttle(function () {
    console.log("clearInputDevs")
    let that = this
    that.setData({
      devString: null,
      validDevList: [],
      isPreview: false
    })

  }, 1000),

  onPreview: util.throttle(function () {
    console.log("onPreview")
    let that = this;
    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }

    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
      // if (validItems.length > 50) {
      //   wx.showToast({
      //     title: '最多输入50组编码',
      //     icon: 'none'
      //   })
      //   return
      // } else {
        that.setData({
          validDevList: validItems,
        })
      // }

    } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        that.setData({
          validDevList: validItems,
          isPreview: true
        })
        return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })
      }
    }

  }, 1000),

  //字符串处理
  processString() {
    console.log("processString")
    let that = this;
    let input = that.data.devString
    if (!input || typeof input !== 'string') {
      return {
        validItems: [],
        result: false,
        invalidItems: [],
        repeatItems: [],
        error: '输入类型有误'
      };
    }

    try {
      // // 处理步骤
      // let trimmed = input.trim().replaceAll("\n", ",").replaceAll("\r\n", ",").replaceAll(/\s+/g, '').replaceAll("，", ',');
      // const items = trimmed.split(/[,，\n]/).map(item => item.trim()).filter(Boolean);
      // 1. 去除前后空格
      const trimmed = input.trim();
      // 2. 替换多个连续空格为单个空格
      const singleSpaced = trimmed.replace(/\s+/g, ' ');
      // 3. 组合分割（逗号、空格、换行符）
      const combinedSplit = singleSpaced.split(/[,\s\n]+/);
      // 过滤空字符串
      const items = combinedSplit.filter(item => item.trim().length > 0);

      // 验证每个项目,合法项
      const validItems = [];
      //不合法项
      const invalidItems = [];
      //重复项
      const repeatItems = [];
      const regex = /^[a-zA-Z0-9]+$/; // 只允许字母和数字

      items.forEach(item => {
        if (regex.test(item)) {
          if (validItems.length == 0) {
            validItems.push(item);
          } else {
            if (!validItems.includes(item)) {
              validItems.push(item);
            } else {
              repeatItems.push(item)
            }
          }


        } else {
          invalidItems.push(item);
        }
      });

      return {
        validItems: validItems,
        result: invalidItems.length === 0 && repeatItems.length === 0,
        invalidItems,
        repeatItems,
        error: invalidItems.length ? '含非法字符' : (repeatItems.length ? '有重复数据' : null)
      };
    } catch (e) {
      return {
        validItems: [],
        result: false,
        invalidItems: [],
        repeatItems: [],
        error: e.message
      };
    }
  },


  // 扫码获取设备编号
  onScanCodeWithDialog() {
    console.log('onScanCodeWithDialog');
    let that = this;
    wx.scanCode({
      success: (res) => {
        if (res.result) {
          let sn = res.result;
          if (!!that.data.devString) {
            that.setData({
              devString: that.data.devString + ',' + sn
            })
          } else {
            that.setData({
              devString: sn
            })
          }


        }
      },
      fail: (err) => {
        console.log('scanCode fail', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  onThirdSrvChage(e){
    console.log("onThirdSrvChage")
    let that = this;
    let index = Number( e.detail.value);
    that.setData({
      thirdSrv:that.data.thirdSrvList[index]
    })
  },

  funCtrl: util.throttle(function (e) {
    console.log("批量操作开关")
    let that = this;
    const {
      op,
      confirm
    } = e.currentTarget.dataset;

    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }

    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
         that.setData({
          validDevList: validItems,
        })
 
        const session = wx.getStorageSync('3rdsession') || '';
        const auth = wx.getStorageSync('auth') || {};
        let _id = that.data.selectedSection.id ;
        console.info('执行功能控制', {
          _id,
          op,
          confirm
        });
        
        const idMap ={
          13:'discharge',
          14:'charge',
          15:'blindChg'
        }
    
        // 权限检查
        const permissionMap = {
          discharge: 'dschg',
          charge: 'chg',
          blindChg: 'blindchg',
          beep: 'beep',
          preventSpark: 'predschg',
          reset: 'reset',
          mosFailRecov:'mos_recov',
          scRecov:'sc_recov'
        };
    
        let func = idMap[_id];
        if (!auth.bms || !auth.bms.op || !auth.bms.op[permissionMap[func]]) {
          wx.showToast({
            title: '无操作权限',
            icon: 'none'
          });
          return;
        }
    
        // 需要确认的操作
        if (confirm === 'true') {
          const actionNames = {
            discharge: op === '1' ? '打开放电' : '关闭放电',
            charge: op === '1' ? '打开充电' : '关闭充电',
            blindChg: op === '1' ? '允许盲充' : '禁止盲充',
            beep: op === '1' ? '开启蜂鸣器' : '关闭蜂鸣器',
            preventSpark: op === '1' ? '开启防打火' : '关闭防打火',
            reset: '重启BMS',
            mosFailRecov:'mos故障恢复',
            scRecov:'短路恢复'
          };
    
          wx.showModal({
            title: '操作确认',
            content: `确定要${actionNames[func]}吗？`,
            confirmText: '确定',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                wx.showLoading({
                  title: '指令下发中',
                  mask: true
                })
                cmdTimeout = setTimeout(() => {
                  wx.hideLoading()
                }, 5 * 1000);
                this.executeFunCtrl(func, op, validItems, session);
              }
            }
          });
        } else {
          this.executeFunCtrl(func, op, validItems, session);
        }

     } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showModal({
          content: '有重复数据，剔除重复数据后继续提交吗？',
          complete: (res) => {
            if (res.confirm) {
                 that.setData({
                  validDevList: validItems,
                })
 
                const session = wx.getStorageSync('3rdsession') || '';
                const auth = wx.getStorageSync('auth') || {};
                let _id = that.data.selectedSection.id ;
                console.info('执行功能控制', {
                  _id,
                  op,
                  confirm
                });
                
                const idMap ={
                  13:'discharge',
                  14:'charge',
                  15:'blindChg'
                }
            
                // 权限检查
                const permissionMap = {
                  discharge: 'dschg',
                  charge: 'chg',
                  blindChg: 'blindchg',
                  beep: 'beep',
                  preventSpark: 'predschg',
                  reset: 'reset',
                  mosFailRecov:'mos_recov',
                  scRecov:'sc_recov'
                };
            
                let func = idMap[_id];
                if (!auth.bms || !auth.bms.op || !auth.bms.op[permissionMap[func]]) {
                  wx.showToast({
                    title: '无操作权限',
                    icon: 'none'
                  });
                  return;
                }
            
                // 需要确认的操作
                if (confirm === 'true') {
                  const actionNames = {
                    discharge: op === '1' ? '打开放电' : '关闭放电',
                    charge: op === '1' ? '打开充电' : '关闭充电',
                    blindChg: op === '1' ? '允许盲充' : '禁止盲充',
                    beep: op === '1' ? '开启蜂鸣器' : '关闭蜂鸣器',
                    preventSpark: op === '1' ? '开启防打火' : '关闭防打火',
                    reset: '重启BMS',
                    mosFailRecov:'mos故障恢复',
                    scRecov:'短路恢复'
                  };
            
                  wx.showModal({
                    title: '操作确认',
                    content: `确定要${actionNames[func]}吗？`,
                    confirmText: '确定',
                    cancelText: '取消',
                    success: (res) => {
                      if (res.confirm) {
                        wx.showLoading({
                          title: '指令下发中',
                          mask: true
                        })
                        cmdTimeout = setTimeout(() => {
                          wx.hideLoading()
                        }, 5 * 1000);
                        this.executeFunCtrl(func, op, validItems, session);
                      }
                    }
                  });
                } else {
                  this.executeFunCtrl(func, op, validItems, session);
                }

             }
          }
        })
         return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        return;
      }
    }

  
  }, 400),

  // 执行功能控制
  executeFunCtrl(func, op, bms_list, session) {
    let that = this;
    http.post('/bms/api/set_batch/params/funCtrl', {
      '3rdsession': session,
      'bms_id_list': bms_list,
      'params': {
        [`${func}`]: Number(op)
      },
      'offline_task': that.data.offlineTask
    }).then(res => {
      console.info('功能控制成功', res);
      if (res.errno == 0) {
        wx.showToast({
          title: '操作已下发',
          icon: 'none'
        });  
        //  that.hideDialogModal();
        // //重新查，会重置选中状态；
        // that.onSearchConfirm();
      } else {
        wx.showToast({
          title: res.msg || '操作失败',
          icon: 'none'
        });  
      }

      if (!!cmdTimeout) {
        clearTimeout(cmdTimeout)
      }
      wx.hideLoading()
    }).catch(err => {
      // that.hideDialogModal();
      console.error('功能控制失败', err);
      wx.showToast({
        title: err.msg || '操作失败',
        icon: 'none'
      });

      if (!!cmdTimeout) {
        clearTimeout(cmdTimeout)
      }
      wx.hideLoading()
    });
  },

  onCopyBtCodes: util.throttle(function () {
    let that = this;
    if(that.data.bt_code_list && that.data.bt_code_list.length > 0){
      let copyBtCode = that.data.bt_code_list.join(",")
      wx.setClipboardData({
        data: copyBtCode,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log(res.data) // data
            }
          })
        }
      })
    }else{
      wx.showToast({
        title: '还未生成BT码',
        icon:'none'
      })
    }
  },500)

})