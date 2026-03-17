const http = require('../../utils/httpUtil.js');
const log = require('../../utils/logUtil.js');
const util = require('../../utils/util.js');
const GPS = require("../../utils/gpsUtil.js")


let cmdTimeout = null

const baseInfoTestData = {
  errno: 0,
  data: {
    bms_id: "BMS00123456",
    capactiy: 350, // 35.0Ah
    cell_mat: 1, // 铁锂
    cell_cnt: 16,
    version: "V2.1.5",
    imsi: "460001234567890",
    bt_code: "BT207205512SWZL000000001",
    x_server: "swslink.com",
    t_server: "thirdparty.com",
    online: 1, // 在线
    updatetime: "2025-09-10 14:30:25"
  }
}


const runInfoTestData = {
  errno: 0,
  data: {
    btCode: "BT207205512SWZL000000001",
    soc: 85,
    soh: 92,
    current: 25, // 2.5A
    cell_cnt: 16,
    cell_volts: [3450, 3460, 3470, 3455, 3465, 3440, 3458, 3462, 3450, 3460, 3470, 3455, 3465, 3440, 3458, 3462],
    cell_balance: [false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false],
    cell_T: [28, 29, 27],
    cell_T_cnt: 3,
    mos_T: 35,
    env_T: 26,
    protect: 0,
    status: 10,
    switch_ctrl: 3, // 充放电MOS都开启
    functrl: 0,
    batVolt: 553, // 55.3V
    loop: 125,
    remCap: 320, // 32.0Ah
    fullCap: 350, // 35.0Ah
    designedCap: 350,
    updatetime: "2025-09-10 14:30:25"
  }
}


Page({
  // timer: null, // 定时器ID
  data: {
    refreshing: false, // 下拉刷新状态
    activeSize: 'small', // 默认中号按钮
    isScanning: false,
    batteryPercent: 0, // 电池电量百分比
    deviceCode: '', // 设备编号
    baseInfo: null, // 设备基础信息
    runInfo: null, // 设备运行信息
    activeImage: {
      discharge: false,
      charge: false,
      blindChg: false,
      beep: false,
      preventSpark: false,
      reset: false,
      setParams: false
    },
    // 金属按钮独立按下状态
    dischargePressed1: false, // 放电开启按钮
    chargePressed1: false, // 充电开启按钮
    dischargePressed0: false, // 放电关闭按钮
    chargePressed0: false, // 充电关闭按钮
    blindChgPressed1: false, // 允许盲充按钮
    beepPressed1: false, // 开启蜂鸣器按钮
    preventSparkPressed1: false, // 开启防打火按钮
    resetPressed1: false, // 重启BMS按钮
    blindChgPressed0: false, // 禁止盲充按钮
    beepPressed0: false, // 关闭蜂鸣器按钮
    preventSparkPressed0: false, // 关闭防打火按钮
    setParamsPressed0: false // 参数配置按钮
  },

  // 页面显示时，回填设备（如有）
  onShow() {
    console.info('onShow: isScanning = ', this.data.isScanning);
    if (!this.data.isScanning) {
      const code = wx.getStorageSync('deviceCode') || '';
      this.setData({
        deviceCode: code
      });
      this.onDeviceCodeConfirm();

      // 启动5秒定时器
      // if (!this.timer && this.data.deviceCode) {
      //   this.timer = setInterval(() => {
      //     this.fetchBasicInfo();
      //   }, 5000);
      // }


      // else if (this.data.deviceCode) {
      //   this.fetchBasicInfo(); // 自动查询设备信息
      // }
    }

  },

  // 页面加载时，处理参数并请求设备基础信息
  // 下拉刷新事件处理
  onPullDownRefresh() {
    console.log("onPullDownRefresh")
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      wx.stopPullDownRefresh();
      this.setData({
        refreshing: false
      });
      return;
    }

    // 停止定时器
    // if (this.timer) {
    //   clearInterval(this.timer);
    //   this.timer = null;
    // }

    this.setData({
      refreshing: true
    });
    this.fetchBasicInfo().finally(() => {
      console.log("onPullDownRefresh finally")
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();

      // 重新启动定时器
      // if (!this.timer && this.data.deviceCode) {
      //   this.timer = setInterval(() => {
      //     this.fetchBasicInfo();
      //   }, 5000);
      // }
    });
  },

  onHide() {
    // 清除定时器
    // if (this.timer) {
    //   clearInterval(this.timer);
    //   this.timer = null;
    // }

    if (!!cmdTimeout) {
      clearTimeout(cmdTimeout)
    }
    wx.hideLoading()
  },

  onLoad(options) {
    console.info('onLoad', options);
    let that = this;

    let session = wx.getStorageSync('3rdsession') || ''
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }
  },

  //清空设备编号
  clearCode: util.throttle(function () {
    this.setData({
      deviceCode: null,
      baseInfo: null,
      runInfo: null
    });
    wx.removeStorageSync('deviceCode')
  }, 500),

  // 输入框设备编号变化
  onDeviceCodeInput(e) {
    console.info('onDeviceCodeInput', e.detail.value);
    this.setData({
      deviceCode: e.detail.value
    });
  },

  // 输入框确认（回车）事件
  onDeviceCodeConfirm() {
    console.info('onDeviceCodeConfirm', this.data.deviceCode);
    if (this.data.deviceCode) {
      wx.setStorageSync('deviceCode', this.data.deviceCode);
      this.fetchBasicInfo();
    } else {
      this.clearCode()
      // wx.showToast({
      //   title: '请输入设备编号',
      //   icon: 'none'
      // });
    }
  },

  // 扫码获取设备编号
  onScanCode() {
    console.info('onScanCode');
    let that = this;
    that.data.isScanning = true;
    wx.scanCode({
      success: (res) => {
        console.info('scanCode success', res.result);
        if (res.result) {
          this.setData({
            deviceCode: res.result
          });
          this.onDeviceCodeConfirm();
        }
      },
      fail: (err) => {
        console.error('scanCode fail', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      },
      complete() {
        that.data.isScanning = false
      }
    });
  },



  /**
   * 请求设备基础信息接口
   * @desc 使用post方法请求 /bms/api/get/basicinfo，参数为3rdsession和bms_id
   * @returns {void}
   */
  fetchBasicInfo() {
    console.info('fetchBasicInfo');
    let that = this
    const {
      deviceCode
    } = that.data;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!deviceCode || !session) {
      console.warn('fetchBasicInfo: 缺少设备编号或session');
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return Promise.reject('缺少设备编号或session');
    }

    console.info('fetchBasicInfo: 开始请求基础信息', {
      deviceCode,
      session
    });

    // 清空之前的数据
    that.setData({
      baseInfo: null,
      runInfo: null,
    });

    return http.post('/bms/api/get/basicinfo', {
      '3rdsession': session,
      'bms_id': deviceCode
    }).then(res => {
      console.info('fetchBasicInfo: 请求成功', res);
      if (res.errno == 0) {
        // 处理基础信息数据，进行单位换算
        const baseInfo = that.processBaseInfoData(res.data.basicInfo || {});
        if (baseInfo.updateTime) {
          let ts = new Date(baseInfo.updateTime)
          let timeF = util.formatTime(ts)
          baseInfo.timeF = timeF
        }
        that.setData({
          baseInfo: baseInfo,
        });



        console.info('fetchBasicInfo: 基础信息设置完成', baseInfo);

        // baseInfo.online // 是否在线 1-在线 0-离线 ;如果为1或者不存在，则直接请求运行信息
        if (typeof baseInfo.online === 'undefined' || baseInfo.online == 1) {
          console.info('fetchBasicInfo: 设备在线，开始获取运行信息');
          // 请求运行信息
          that.fetchRunInfo();
        } else {
          console.info('fetchBasicInfo: 设备离线，不获取运行信息');
        }
      } else if (res.errno === 2000) {
        wx.clearStorageSync()
        wx.reLaunch({
          url: '/pages/login/login',
        })

      } else {
        console.error('fetchBasicInfo: 接口返回错误', res.data);
        // 请求失败，弹出提示
        wx.showToast({
          title: res.data.errmsg || '获取基础信息失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('fetchBasicInfo: 请求失败', err);
      // 请求失败，弹出提示
      wx.showToast({
        title: JSON.stringify(err) || '获取基础信息失败',
        icon: 'none'
      });
    });
  },

  /**
   * 请求设备运行信息接口
   * @desc 使用post方法请求 /bms/api/get/batdata，参数为3rdsession和bms_id
   * @returns {void}
   */
  fetchRunInfo() {
    console.info('fetchRunInfo');
    let that = this;
    const {
      deviceCode
    } = that.data;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!deviceCode || !session) {
      console.warn('fetchRunInfo: 缺少设备编号或session');
      return;
    }

    console.info('fetchRunInfo: 开始请求运行信息', {
      deviceCode,
      session
    });

    http.post('/bms/api/get/batdata', {
      '3rdsession': session,
      'bms_id': deviceCode
    }).then(res => {
      console.info('fetchRunInfo: 请求成功', res);
      if (res.errno == 0) {
        let info = res.data.batData
        if (!!info && JSON.stringify(info) !== '{}') {
          // 处理运行信息数据，进行单位换算
          const runInfo = that.processRunInfoData(info);
          if (runInfo.time) {
            let ts = new Date(runInfo.time * 1000)
            runInfo.timeF = util.formatTime(ts)
          }

          if (runInfo.gps_lng && runInfo.gps_lat) {
            runInfo.lng = parseFloat(runInfo.gps_lng / 1000000).toFixed(6)
            runInfo.lat = parseFloat(runInfo.gps_lat / 1000000).toFixed(6)
            // 转化gcj02坐标
            runInfo.gcj02 = GPS.gcj_encrypt(Number(runInfo.lat), Number(runInfo.lng))

          }

          that.setData({
            runInfo: runInfo,
          });
          console.info('fetchRunInfo: 设备运行信息获取成功', runInfo);
        } else {
          console.warn("fetchRunInfo: empty")
        }


      } else {
        console.error('fetchRunInfo: 接口返回错误', res);
      }
    }).catch(err => {
      console.error('fetchRunInfo: 请求失败', err);
      wx.showToast({
        title: err.msg || '获取运行信息失败',
        icon: 'none'
      });
    });
  },

  /**
   * 处理基础信息数据，进行单位换算
   * @param {Object} baseInfo 原始基础信息数据
   * @returns {Object} 处理后的基础信息数据
   */
  processBaseInfoData(baseInfo) {
    if (!baseInfo) return null;

    const processed = {
      ...baseInfo
    };

    // 容量单位换算: 0.1Ah → Ah
    if (typeof processed.batCapacity === 'number') {
      processed.capactiyD = (processed.batCapacity * 0.1).toFixed(1);
    }

    return processed;
  },

  /**
   * 处理运行信息数据，进行单位换算
   * @param {Object} runInfo 原始运行信息数据
   * @returns {Object} 处理后的运行信息数据
   */
  processRunInfoData(runInfo) {
    if (!runInfo) return null;

    const processed = {
      ...runInfo
    };

    // 总压单位换算: 0.1V → V
    if (typeof processed.batVolt === 'number') {
      processed.batVoltD = (processed.batVolt * 0.1).toFixed(1);
    }

    // 电流单位换算: 0.1A → A
    if (typeof processed.current === 'number') {
      processed.currentD = (processed.current * 0.1).toFixed(1);
    }

    // 剩余容量单位换算: 0.1Ah → Ah
    if (typeof processed.remCap === 'number') {
      processed.remCapD = (processed.remCap * 0.1).toFixed(1);
    }

    // 总容量单位换算: 0.1Ah → Ah
    if (typeof processed.fullCap === 'number') {
      processed.fullCapD = (processed.fullCap * 0.1).toFixed(1);
    }

    // 设计容量单位换算: 0.1Ah → Ah
    if (typeof processed.designedCap === 'number') {
      processed.designedCapD = (processed.designedCap * 0.1).toFixed(1);
    }


    // 计算最高和最低电芯电压索引
    if (processed.cell_volts && processed.cell_volts.length > 0) {
      let minIndex = 0;
      let maxIndex = 0;
      let minValue = processed.cell_volts[0];
      let maxValue = processed.cell_volts[0];

      for (let i = 1; i < processed.cell_volts.length; i++) {
        if (processed.cell_volts[i] < minValue) {
          minValue = processed.cell_volts[i];
          minIndex = i;
        }
        if (processed.cell_volts[i] > maxValue) {
          maxValue = processed.cell_volts[i];
          maxIndex = i;
        }
      }

      processed.minCellIndex = minIndex;
      processed.maxCellIndex = maxIndex;
    }

    return processed;
  },


  setActiveImage: function (e) {
    let func = e.currentTarget.dataset.func;
    let op = e.currentTarget.dataset.op;
    let key = func + op
    this.setData({
      [`activeImage.${key}`]: true
    })
  },

  setNormalImage: function (e) {
    let func = e.currentTarget.dataset.func;
    let op = e.currentTarget.dataset.op;
    let key = func + op
    this.setData({
      [`activeImage.${key}`]: false
    })
  },

  funCtrl: util.throttle(function (e) {
    let that = this;
    const {
      func,
      op,
      confirm
    } = e.currentTarget.dataset;
    const {
      deviceCode
    } = this.data;
    const session = wx.getStorageSync('3rdsession') || '';
    const auth = wx.getStorageSync('auth') || {};

    console.info('执行功能控制', {
      func,
      op,
      deviceCode,
      confirm
    });

    if (!deviceCode || !session) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
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
              that.fetchBasicInfo()
            }, 5 * 1000);

            this.executeFunCtrl(func, op, deviceCode, session);
          }
        }
      });
    } else {
      this.executeFunCtrl(func, op, deviceCode, session);
    }
  }, 400),

  // 执行功能控制
  executeFunCtrl(func, op, deviceCode, session) {
    http.post('/bms/api/set/params/funCtrl', {
      '3rdsession': session,
      'bms_id': deviceCode,
      'params': {
        [`${func}`]: Number(op)
      }
    }).then(res => {
      console.info('功能控制成功', res);
      if (res.errno == 0) {
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

  setParams: util.throttle(function (e) {
    console.info('设置参数');
    // 需要传值设备编号
    wx.setStorageSync('deviceCode', this.data.deviceCode);

    wx.switchTab({
      url: '/pages/paramConfig/paramConfig',
    });
  }, 400),

  // 复制
  onCopyData: util.throttle(function (e) {
    console.log("onCopyData")
    let that = this;
    let content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })


  }, 500),

  // 按钮按下效果
  buttonTouchStart: function (e) {
    const func = e.currentTarget.dataset.func;
    const op = e.currentTarget.dataset.op;
    this.setData({
      [`${func}Pressed${op}`]: true
    });
  },

  // 按钮释放效果
  buttonTouchEnd: function (e) {
    const func = e.currentTarget.dataset.func;
    const op = e.currentTarget.dataset.op;
    this.setData({
      [`${func}Pressed${op}`]: false
    });
  },

  // 手指移出按钮区域
  buttonTouchCancel: function (e) {
    const func = e.currentTarget.dataset.func;
    const op = e.currentTarget.dataset.op;
    this.setData({
      [`${func}Pressed${op}`]: false
    });
  },

  // 地图显示
  onShowMap(e) {
    console.log("onShowMap")
    let that = this;
    if(that.data.runInfo?.gcj02){
        wx.navigateTo({
          url: '../locOnMap/locOnMap?runInfo='+JSON.stringify(that.data.runInfo),
        })
    }else{
      console.log("没有坐标")
    }

  }

})