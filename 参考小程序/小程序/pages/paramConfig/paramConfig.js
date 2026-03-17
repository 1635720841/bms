const http = require('../../utils/httpUtil.js');
const log = require('../../utils/logUtil.js')
const util = require('../../utils/util.js');

let cmdTimeout = null

Page({

  data: {
    productWay: 1, //bt码生产方式： 1-自动生成，2-自定义
    refreshing: false, // 下拉刷新状态
    activeSize: 'small', // 小号按钮
    deviceCode: "",
    sectionList: [
      'BT码设置',
      '三方后台配置',
      '基础参数',
      '电芯过压保护',
      '电芯欠压保护',
      '总压过压保护',
      '总压欠压保护',
      'I级放电过流',
      'II级放电过流',
      '放电短路保护',
      'I级充电过流',
      'II级充电过流',
      '放电电芯高温保护',
      '放电电芯低温保护',
      '充电电芯高温保护',
      '充电电芯低温保护',
      'mos高温保护',
      'I级(软件)电芯过压保护'

    ],
    // 三方服务器配置
    tServerAddress: '',
    selectedSection: 0, //跳去的埋单下标
    materialArray: [{
      title: '铁锂',
      value: 1
    }, {
      title: '三元',
      value: 2
    }],
    selectedMaterial: null,
    params: null,
    ranges: null,

    // BT码编辑相关数据
    showBtCodeDialog: false,
    btMaterialOptions: ['铁锂', '三元'],
    btMaterialIndex: 0,
    btVoltageValue: '048',
    btCapacityValue: '020',
    btCycleLifeValue: '12',
    btManufacturerValue: '00SW',
    btProductionYear: '25',
    btProductionMonth: '05',
    btProductionDay: '07',
    btSerialNumber: '001',
  },
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
    this.setData({
      refreshing: true
    });
    this.onDeviceCodeConfirm().finally(() => {
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    });
  },

  onLoad() {
    let that = this;
    let session = wx.getStorageSync('3rdsession') || ''
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    // 获取当前系统时间
    const now = new Date();
    const year = Number(now.getFullYear().toString().substring(2));

    //增加的 start
    let starTime = Number(year - 1) + '-01-01'
    let endTime = Number(year + 1) + '-12-31'
    that.setData({
      starTimeD: starTime,
      endTimeD: endTime
    })

  },



  onShow() {
    console.info('onShow : isScanning = ', this.data.isScanning);
    this.queryThirdServerList()
    if (!this.data.isScanning) {
      const code = wx.getStorageSync('deviceCode') || '';
      // if (code) {
      this.setData({
        deviceCode: code
      });
      this.onDeviceCodeConfirm(); // 自动查询设备信息
      // } 
      // else if (this.data.deviceCode) {
      //   this.fetchParams(); // 自动查询设备信息
      // }
    }

  },

  //清空设备编号
  clearCode: util.throttle(function () {
    console.warn("===========  clearCode  ==============")
    this.setData({
      deviceCode: null,
      params: null,
      paramsCopy: null,
      selectedMaterial: null,
      ranges: null,
      selectedSection: 0,
      baseInfo: null,
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
      return Promise.all([
        this.fetchParams(),
        this.fetchBasicInfo()
      ]).catch(err => {
        console.error('onDeviceCodeConfirm error:', err);
        wx.showToast({
          title: '查询出错：' + err,
          icon: 'none'
        })
        // throw err;
      });
    } else {
      this.clearCode();
      return Promise.reject('请输入设备编号');
    }
  },

  // 扫码获取设备编号
  onScanCode() {
    console.info('onScanCode');
    this.clearCode()
    this.data.isScanning = true;
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
        this.data.isScanning = false;
      }
    });
  },


  /**
   * 请求设备参数配置接口
   * @desc 使用post方法请求 /bms/api/get/params，参数为3rdsession和bms_id
   * @returns {void}
   */
  fetchParams() {
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    return http.post('/bms/api/get/params', {
      '3rdsession': session,
      'bms_id': bms_id
    }).then(res => {
      if (res.errno == 0) {
        let params = res.data.bmsParams;
        if (JSON.stringify(params) !== '{}' && !!params) {
          // 处理显示用的转换值
          let processedParams = this.processParamsForDisplay(res.data.bmsParams);
          console.log("原始range改造后的 OTDT温度，", processedParams.bat_OTDT)
          let selectedMaterial = this.data.materialArray.find(item => item.value == processedParams.cell_mat);
          //深拷贝，用于点击写入时，对比数据是否发生变化，变化了才去网络请求
          const deepCopiedObj = JSON.parse(JSON.stringify(processedParams));
          this.setData({
            params: processedParams,
            paramsCopy: deepCopiedObj,
            selectedMaterial: selectedMaterial,
          })

          //处理ranges
          let testRanges = res.data.ranges;
          if (JSON.stringify(testRanges) !== '{}' && !!testRanges) {
            const capacityOptions = this.generateCapacityOptions(testRanges.designed_cap);
            // 电芯过压保护选项
            const ovtOptions = this.generateOptionsVolatageMV(testRanges.cell_OVT);
            const ovrtOptions = this.generateOptionsVolatageMV(testRanges.cell_OVRT);
            const ovdOptions = this.generateTimeOptionsOnePointS(testRanges.cell_OVD); // 使用原始100ms单位的范围
            const ovrdOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_OVRD); // 使用原始100ms单位的范围

            // 生成电芯欠压保护选项
            const cellUvtOptions = this.generateOptionsVolatageMV(testRanges.cell_UVT);
            const cellUvrtOptions = this.generateOptionsVolatageMV(testRanges.cell_UVRT);
            const cellUvdOptions = this.generateTimeOptionsOnePointS(testRanges.cell_UVD); // 使用原始100ms单位的范围
            const cellUvrdOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_UVRD); // 使用原始100ms单位的范围

            // 生成总压过压保护选项,门限单位0.1V，时间单位 100ms(0.1S)
            const batOVTOptions = this.generateOptionsOnePointV(testRanges.bat_OVT);
            const batOVRTOptions = this.generateOptionsOnePointV(testRanges.bat_OVRT);
            const batOVDOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OVD); // 使用原始100ms单位的范围
            const batOVRDOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OVRD); // 使用原始100ms单位的范围
            // 生成总压欠压保护选项
            const batUTVOptions = this.generateOptionsOnePointV(testRanges.bat_UVT);
            const batUVRTOptions = this.generateOptionsOnePointV(testRanges.bat_UVRT); // 使用原始100ms单位的范围
            const batUVDOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UVD);
            const batUVRDOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UVRD); // 使用原始100ms单位的范围
            // 生成I级放电过流选项
            const ocd1tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD1T);
            const ocd1rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD1RT);
            const ocd1dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCD1D);
            const ocd1rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCD1RD);

            // 生成I级充电过流选项
            const occ1tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC1T);
            const occ1rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC1RT);
            const occ1dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCC1D);
            const occ1rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCC1RD);

            // 生成II级充电过流选项
            const occ2tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC2T);
            const occ2rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCC2RT);
            const occ2dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCC2D);
            const occ2rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCC2RD);

            // 生成放电电芯高温保护选项
            const otdtOptions = this.generateTemperatureOptions(testRanges.bat_OTDT);
            const otdrtOptions = this.generateTemperatureOptions(testRanges.bat_OTDRT);
            const otddOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OTDD);
            const otdrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OTDRD);

            // 生成放电电芯低温保护选项
            const utdtOptions = this.generateTemperatureOptions(testRanges.bat_UTDT);
            const utdrtOptions = this.generateTemperatureOptions(testRanges.bat_UTDRT);
            const utddOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UTDD);
            const utdrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UTDRD);

            // 生成充电电芯高温保护选项
            const otctOptions = this.generateTemperatureOptions(testRanges.bat_OTCT);
            const otcrtOptions = this.generateTemperatureOptions(testRanges.bat_OTCRT);
            const otcdOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OTCD);
            const otcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OTCRD);

            // 生成充电电芯低温保护选项
            const utctOptions = this.generateTemperatureOptions(testRanges.bat_UTCT);
            const utcrtOptions = this.generateTemperatureOptions(testRanges.bat_UTCRT);
            const utcdOptions = this.generateTimeOptionsOnePointS(testRanges.bat_UTCD);
            const utcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_UTCRD);

            // 生成mos高温保护选项
            const mosotctOptions = this.generateTemperatureOptions(testRanges.mos_OTCT);
            const mosotcrtOptions = this.generateTemperatureOptions(testRanges.mos_OTCRT);
            const mosotcdOptions = this.generateTimeOptionsOnePointS(testRanges.mos_OTCD);
            const mosotcrdOptions = this.generateTimeOptionsTenOrMore(testRanges.mos_OTCRD);

            // 电芯过压保护选项
            const ov1tOptions = this.generateOptionsVolatageMV(testRanges.cell_OV1T);
            const ovr1tOptions = this.generateOptionsVolatageMV(testRanges.cell_OVR1T);
            const ov1dOptions = this.generateTimeOptionsOnePointS(testRanges.cell_OV1D); // 使用原始100ms单位的范围
            const ovr1dOptions = this.generateTimeOptionsTenOrMore(testRanges.cell_OVR1D); // 使用原始100ms单位的范围

            // 生成II级放电过流选项
            const ocd2tOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD2T);
            const ocd2rtOptions = this.generateOptionsTenPerOnePointV(testRanges.bat_OCD2RT);
            const ocd2dOptions = this.generateTimeOptionsOnePointS(testRanges.bat_OCD2D);
            const ocd2rdOptions = this.generateTimeOptionsTenOrMore(testRanges.bat_OCD2RD);

            // 生成放电短路保护选项
            const scdtOptions = this.generateSCDTOptions(testRanges.bat_SCDT);
            const scddOptions = this.generateTimeOptionsMicroseconds(testRanges.bat_SCDD);

            // 生成电芯串数选项 (步长1)
            const seriesOptions = [];
            for (let i = testRanges.cell_cnt[0]; i <= testRanges.cell_cnt[1]; i++) {
              seriesOptions.push(i);
            }
            this.setData({
              ranges: testRanges,
              capacityOptions: capacityOptions,
              ovtOptions: ovtOptions,
              ovrtOptions: ovrtOptions,
              ovdOptions: ovdOptions,
              ovrdOptions: ovrdOptions,
              cellUvtOptions: cellUvtOptions,
              cellUvrtOptions: cellUvrtOptions,
              cellUvdOptions: cellUvdOptions,
              cellUvrdOptions: cellUvrdOptions,
              batOVTOptions: batOVTOptions,
              batOVRTOptions: batOVRTOptions,
              batOVDOptions: batOVDOptions,
              batOVRDOptions: batOVRDOptions,
              batUTVOptions: batUTVOptions,
              batUVRTOptions: batUVRTOptions,
              batUVDOptions: batUVDOptions,
              batUVRDOptions: batUVRDOptions,
              ocd1tOptions,
              ocd1dOptions,
              ocd1rtOptions,
              ocd1rdOptions,
              occ1tOptions,
              occ1dOptions,
              occ1rtOptions,
              occ1rdOptions,
              occ2tOptions,
              occ2dOptions,
              occ2rtOptions,
              occ2rdOptions,
              otdtOptions,
              otddOptions,
              otdrtOptions,
              otdrdOptions,
              utdtOptions,
              utddOptions,
              utdrtOptions,
              utdrdOptions,
              otctOptions,
              otcdOptions,
              otcrtOptions,
              otcrdOptions,
              utctOptions,
              utcdOptions,
              utcrtOptions,
              utcrdOptions,
              mosotctOptions,
              mosotcdOptions,
              mosotcrtOptions,
              mosotcrdOptions,

              ov1tOptions,
              ovr1tOptions,
              ov1dOptions,
              ovr1dOptions,

              ocd2tOptions,
              ocd2dOptions,
              ocd2rtOptions,
              ocd2rdOptions,
              scdtOptions,
              scddOptions,
              seriesOptions: seriesOptions
            });
          } else {
            wx.showToast({
              title: '查询ranges结果为空',
              icon: 'none'
            })
          }

        } else {
          wx.showToast({
            title: '查询params结果为空',
            icon: 'none'
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

  // 处理参数单位转换用于显示
  processParamsForDisplay(params) {
    if (!params) return {};

    const processed = {
      ...params
    };

    // 容量 0.1Ah → Ah
    if (processed.designed_cap !== undefined) {
      processed.designed_capD = (processed.designed_cap / 10).toFixed(1);
      console.log('容量单位转换:', {
        '原始值(0.1Ah)': processed.designed_cap,
        '转换值(Ah)': processed.designed_capD
      });
    }

    // 总压相关参数 0.1V → V
    const voltageFields = ['bat_OVT', 'bat_OVRT', 'bat_UVT', 'bat_UVRT'];
    voltageFields.forEach(field => {
      if (processed[field] !== undefined) {
        processed[`${field}D`] = (processed[field] / 10).toFixed(1);
      }
    });

    // 电流相关参数 0.1A → A
    const currentFields = [
      'bat_OCD1T', 'bat_OCD1RT', 'bat_OCD2T', 'bat_OCD2RT',
      'bat_OCC1T', 'bat_OCC1RT', 'bat_OCC2T', 'bat_OCC2RT',
      'bat_SCDT'
    ];
    currentFields.forEach(field => {
      if (processed[field] !== undefined) {
        processed[`${field}D`] = (processed[field] / 10).toFixed(1);
      }
    });

    // 温度参数 (减去273)
    const tempFields = [
      'bat_OTDT', 'bat_OTDRT', 'bat_UTDT', 'bat_UTDRT',
      'bat_OTCT', 'bat_OTCRT', 'bat_UTCT', 'bat_UTCRT',
      'mos_OTCT', 'mos_OTCRT'
    ];
    tempFields.forEach(field => {
      if (processed[field] !== undefined) {
        processed[`${field}D`] = parseFloat(processed[field] - 273).toFixed(1);
      }
    });

    // 时间参数处理 (100ms → s)
    const timeFields = [
      'cell_OVD', 'cell_OVRD',
      'cell_UVD', 'cell_UVRD',
      'bat_OVD', 'bat_OVRD',
      'bat_UVD', 'bat_UVRD', 'bat_OCD1D', 'bat_OCD1RD', 'bat_OCC1D',
      'bat_OCC1RD', 'bat_OCD2D', 'bat_OCD2RD', 'bat_OCC2D', 'bat_OCC2RD',
      'bat_OTDD', 'bat_OTDRD', 'bat_UTDD', 'bat_UTDRD', 'bat_OTCD',
      'bat_OTCRD', 'bat_UTCD', 'bat_UTCRD', 'mos_OTCD', 'mos_OTCRD', 'cell_OV1D',
      'cell_OVR1D'
    ];


    timeFields.forEach(field => {
      if (processed[field] !== undefined) {
        processed[`${field}D`] = parseFloat(processed[field] / 10).toFixed(1); // 100ms转换为s
      }
    });

    // 放电短路保护的时间，单位是10us---bat_SCDD
    processed['bat_SCDDD'] = parseFloat(processed['bat_SCDD'] * 10).toFixed(1); //  

    return processed;
  },

  // 保存参数时恢复原始单位
  processParamsForSave(params) {
    const processed = {
      ...params
    };

    // 容量 Ah → 0.1Ah
    if (processed.designed_capD !== undefined) {
      processed.designed_cap = Math.round(processed.designed_capD * 10);
      delete processed.designed_capD;
    }

    // 总压相关参数 V → 0.1V
    const voltageFields = ['bat_OVT', 'bat_OVRT', 'bat_UVT', 'bat_UVRT'];
    voltageFields.forEach(field => {
      if (processed[`${field}D`] !== undefined) {
        processed[field] = Math.round(processed[`${field}D`] * 10);
        delete processed[`${field}D`];
      }
    });

    // 电流相关参数 A → 0.1A
    const currentFields = [
      'bat_OCD1T', 'bat_OCD1RT', 'bat_OCD2T', 'bat_OCD2RT',
      'bat_OCC1T', 'bat_OCC1RT', 'bat_OCC2T', 'bat_OCC2RT',
      'bat_SCDT'
    ];
    currentFields.forEach(field => {
      if (processed[`${field}D`] !== undefined) {
        processed[field] = Math.round(processed[`${field}D`] * 10);
        delete processed[`${field}D`];
      }
    });

    // 温度参数 (加回273)
    const tempFields = [
      'bat_OTDT', 'bat_OTDRT', 'bat_UTDT', 'bat_UTDRT',
      'bat_OTCT', 'bat_OTCRT', 'bat_UTCT', 'bat_UTCRT',
      'mos_OTCT', 'mos_OTCRT'
    ];
    tempFields.forEach(field => {
      if (processed[`${field}D`] !== undefined) {
        processed[field] = processed[`${field}D`] + 273;
        delete processed[`${field}D`];
      }
    });

    return processed;
  },

  // 输入处理函数示例 (其他函数类似)
  onCapacityInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      cellCapacity: isNaN(numVal) ? 0 : numVal,
      'params.designed_capD': val,
      'params.designed_cap': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10
    });
    return val;
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
    const val = parseFloat(this.data.params.designed_capD);
    const range = this.data.ranges.designed_cap;
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





    // // 将100ms单位转换为秒
    // const range = [batOVDRanges[0] / 10, batOVDRanges[1] / 10];
    // const min = Math.ceil(range[0] * 2) / 2; // 转换为0.5步长
    // const max = Math.floor(range[1] * 2) / 2;

    // const options = [];
    // for (let i = min; i <= max; i += 0.5) {
    //   options.push(i);
    // }
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
      // if (cha > 0 && cha <= 100) {
      //   //步长5
      //   step = 5;
      // } else if (cha > 100 && cha <= 1000) {
      //   step = 50;
      // } else if (cha > 1000 && cha <= 5000) {
      //   step = 500;
      // } else if (cha > 5000) {
      //   step = 1000;
      // }


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


  onSectionChange(e) {
    this.setData({
      selectedSection: e.detail.value
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

  // 选材料
  onMaterialChange222(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      btMaterialIndex: idx,
    });
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
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OV1T': isNaN(numVal) ? 0 : numVal
    });
    return val;
  },


  onCellOV1DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OV1D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.cell_OV1DD': val
    });
    return val;
  },

  onCellOVR1TInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OVR1T': isNaN(numVal) ? 0 : numVal
    });
    return val;
  },

  onCellOVR1DInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.cell_OVR1D': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10, // 存储为100ms单位
      'params.cell_OVRD1D': val // 显示为秒单位
    });
    return val;
  },


  onCellUVTInput(e) {
    this.setData({
      'params.cell_UVT': Number(e.detail.value)
    });
  },

  onCellUVDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
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
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTDT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_OTDTD': val,
    });
    return val;
  },
  onBatOTDDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTDD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OTDDD': val
    });
    return val;
  },

  onBatOTDRTInput(e) {
    console.log("onBatOTDRTInput")
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTDRT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_OTDRTD': val,
    });
    return val;
  },

  onBatOTDRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTDRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OTDRDD': val
    });
    return val;
  },

  // 放电电芯低温保护输入监听函数
  onBatUTDTInput(e) {
    console.log("onBatUTDTInput")
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTDT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_UTDTD': val
    });
    return val;
  },
  onBatUTDDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTDD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UTDDD': val
    });
    return val;
  },

  onBatUTDRTInput(e) {
    console.log("onBatUTDRTInput")
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTDRT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_UTDRTD': isNaN(numVal) ? 0 : numVal,
    });
    return val;
  },

  onBatUTDRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTDRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UTDRDD': val
    });
    return val;
  },

  // 充电电芯高温保护输入监听函数
  onBatOTCTInput(e) {
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTCT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_OTCTD': val
    });
    return val;
  },
  onBatOTCDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTCD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OTCDD': val
    });
    return val;
  },

  onBatOTCRTInput(e) {
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTCRT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_OTCRTD': val
    });
    return val;
  },

  onBatOTCRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_OTCRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_OTCRDD': val
    });
    return val;
  },

  // 充电电芯低温保护输入监听函数
  onBatUTCTInput(e) {
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTCT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_UTCTD': val,
    });
    return val;
  },
  onBatUTCDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTCD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UTCDD': val
    });
    return val;
  },

  onBatUTCRTInput(e) {
    console.log("onBatUTCRTInput")
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTCRT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.bat_UTCRTD': val
    });
    return val;
  },

  onBatUTCRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.bat_UTCRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.bat_UTCRDD': val
    });
    return val;
  },

  // mos高温保护输入监听函数
  onMosOTCTInput(e) {
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.mos_OTCT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.mos_OTCTD': val
    });
    return val;
  },
  onMosOTCDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.mos_OTCD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.mos_OTCDD': val
    });
    return val;
  },

  onMosOTCRTInput(e) {
    let val = e.detail.value;
    if (val.startsWith("-") && val.length == 1) {
      return;
    }
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 2) {
      val = val.substring(0, val.indexOf('.') + 3);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.mos_OTCRT': isNaN(numVal) ? 0 : Math.round(numVal + 273),
      'params.mos_OTCRTD': val
    });
    return val;
  },

  onMosOTCRDInput(e) {
    let val = e.detail.value;
    if (val.charAt(0) == '.') val = '0' + val;
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = val.substring(0, val.indexOf('.') + 2);
    }
    const numVal = parseFloat(val);
    this.setData({
      'params.mos_OTCRD': isNaN(numVal) ? 0 : Math.round(numVal * 100) / 10,
      'params.mos_OTCRDD': val
    });
    return val;
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



  // 电芯过压保护写入
  onCellOVWrite: util.throttle(function () {
    let that = this;
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.voltparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    // 参数校验
    if (!this.validateCellOVParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    // 准备参数
    const params = {
      T: this.data.params.cell_OVT, // mV
      D: this.data.params.cell_OVD, // 已经是100ms单位
      RT: this.data.params.cell_OVRT, // mV
      RD: this.data.params.cell_OVRD // 已经是100ms单位
    };

    this.confirmDialog(
      '确定写入电芯过压保护参数？',
      '/bms/api/set/params/ceOV',
      params,
    );

  }, 500),

  // I级软件 电芯过压保护写入
  onCellOV1Write: util.throttle(function () {
    console.log("onCellOV1Write")
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.voltparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    // 参数校验
    if (!this.validateCellOV1Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    // 准备参数
    const params = {
      T: this.data.params.cell_OV1T, // mV
      D: this.data.params.cell_OV1D, // 已经是100ms单位
      RT: this.data.params.cell_OVR1T, // mV
      RD: this.data.params.cell_OVR1D, // 已经是100ms单位
      enable: this.data.params.cell_OVRP1flag, //使能开关 0-不使能 1-使能
    };
    this.confirmDialog(
      '确定写入I级（软件）电芯过压保护参数？',
      '/bms/api/set/params/ceOV1',
      params,

    );
  }, 500),

  // 电芯欠压保护写入
  onCellUVWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.voltparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.validateCellUVParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.cell_UVT,
      D: this.data.params.cell_UVD,
      RT: this.data.params.cell_UVRT,
      RD: this.data.params.cell_UVRD
    };
    this.confirmDialog(
      '确定写入电芯欠压保护参数？',
      '/bms/api/set/params/ceUV',
      params,

    );

  }, 500),

  // 总压过压保护写入
  onPackOVWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.voltparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.validatePackOVParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OVT,
      D: this.data.params.bat_OVD,
      RT: this.data.params.bat_OVRT,
      RD: this.data.params.bat_OVRD
    };
    this.confirmDialog(
      '确定写入总压过压保护参数？',
      '/bms/api/set/params/batOV',
      params,

    );

  }, 500),

  // 总压欠压保护写入
  onPackUVWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.voltparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.validatePackUVParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_UVT,
      D: this.data.params.bat_UVD,
      RT: this.data.params.bat_UVRT,
      RD: this.data.params.bat_UVRD
    };
    this.confirmDialog(
      '确定写入总压欠压保护参数？',
      '/bms/api/set/params/batUV',
      params,

    );

  }, 500),

  // I级放电过流写入
  onDisOC1Write: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.validateDisOC1Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OCD1T,
      D: this.data.params.bat_OCD1D,
      RT: this.data.params.bat_OCD1RT,
      RD: this.data.params.bat_OCD1RD
    };
    this.confirmDialog(
      '确定写入I级放电过流参数？',
      '/bms/api/set/params/batOCD1',
      params,

    );

  }, 500),

  // I级充电过流写入
  onOCC1Write: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateOCC1Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OCC1T,
      D: this.data.params.bat_OCC1D,
      RT: this.data.params.bat_OCC1RT,
      RD: this.data.params.bat_OCC1RD
    };
    this.confirmDialog(
      '确定写入I级充电过流参数？',
      '/bms/api/set/params/batOCC1',
      params,

    );

  }, 500),

  // II级充电过流写入
  onOCC2Write: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateOCC2Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OCC2T,
      D: this.data.params.bat_OCC2D,
      RT: this.data.params.bat_OCC2RT,
      RD: this.data.params.bat_OCC2RD
    };
    this.confirmDialog(
      '确定写入II级充电过流参数？',
      '/bms/api/set/params/batOCC2',
      params,

    );

  }, 500),

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
    let val = e.detail.value;
    // 限制只能输入整数，过滤掉任何非数字字符（如小数点）
    val = val.replace(/[^\d]/g, '');
    const numVal = parseInt(val);
    this.setData({
      'params.bat_SCDD': isNaN(numVal) ? 0 : parseFloat(numVal / 10).toFixed(1),
      'params.bat_SCDDD': val,
    });
    return val;
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

    // 校验触发门限(0.1A)
    if (params.bat_SCDT < ranges.bat_SCDT[0] || params.bat_SCDT > ranges.bat_SCDT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_SCDT[0]/10}~${ranges.bat_SCDT[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(us)
    if (params.bat_SCDD < ranges.bat_SCDD[0] || params.bat_SCDD > ranges.bat_SCDD[1]) {
      wx.showToast({
        title: `触发延时范围${ranges.bat_SCDD[0] * 10}~${ranges.bat_SCDD[1]*10}us`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 放电短路保护写入
  onSCDWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateSCDParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_SCDT,
      D: Number(this.data.params.bat_SCDD)
    };
    this.confirmDialog(
      '确定写入放电短路保护参数？',
      '/bms/api/set/params/batSCD',
      params,

    );

  }, 500),

  // II级放电过流写入
  onDisOC2Write: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateDisOC2Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OCD2T,
      D: this.data.params.bat_OCD2D,
      RT: this.data.params.bat_OCD2RT,
      RD: this.data.params.bat_OCD2RD
    };
    this.confirmDialog(
      '确定写入II级放电过流参数？',
      '/bms/api/set/params/batOCD2',
      params,

    );

  }, 500),

  // 校验电芯过压保护参数
  validateCellOVParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    // 校验触发门限(mV)
    if (params.cell_OVT < ranges.cell_OVT[0] || params.cell_OVT > ranges.cell_OVT[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.cell_OVT[0]}~${ranges.cell_OVT[1]}mV`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
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

    // 校验触发门限(0.1A)
    if (params.bat_OCD1T < ranges.bat_OCD1T[0] || params.bat_OCD1T > ranges.bat_OCD1T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCD1T[0]/10}~${ranges.bat_OCD1T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const ocd1dMin = ranges.bat_OCD1D[0] / 10;
    const ocd1dMax = ranges.bat_OCD1D[1] / 10;
    if (params.bat_OCD1D < ranges.bat_OCD1D[0] || params.bat_OCD1D > ranges.bat_OCD1D[1]) {
      wx.showToast({
        title: `触发延时范围${ocd1dMin}~${ocd1dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // I级放电过流 < II级放电过流
    if (params.bat_OCD1T >= params.bat_OCD2T) {
      wx.showToast({
        title: "I级放电过流触发门限 需小于 II级放电过流触发门限",
        icon: 'none'
      });
      return false
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

    // 校验触发门限(0.1A)
    if (params.bat_OCC1T < ranges.bat_OCC1T[0] || params.bat_OCC1T > ranges.bat_OCC1T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCC1T[0]/10}~${ranges.bat_OCC1T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
    const occ1dMin = ranges.bat_OCC1D[0] / 10;
    const occ1dMax = ranges.bat_OCC1D[1] / 10;
    if (params.bat_OCC1D < ranges.bat_OCC1D[0] || params.bat_OCC1D > ranges.bat_OCC1D[1]) {
      wx.showToast({
        title: `触发延时范围${occ1dMin}~${occ1dMax}s`,
        icon: 'none'
      });
      return false;
    }

    // I级放电过流 < II级放电过流
    if (params.bat_OCC1T >= params.bat_OCC2T) {
      wx.showToast({
        title: "I级充电过流触发门限 需小于 II级充电过流触发门限",
        icon: 'none'
      });
      return false
    }

    // // 校验恢复门限(0.1A)
    // if (params.bat_OCC1RT < ranges.bat_OCC1RT[0] || params.bat_OCC1RT > ranges.bat_OCC1RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCC1RT[0]/10}~${ranges.bat_OCC1RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
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

    // 校验触发门限(0.1A)
    if (params.bat_OCC2T < ranges.bat_OCC2T[0] || params.bat_OCC2T > ranges.bat_OCC2T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCC2T[0]/10}~${ranges.bat_OCC2T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
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
    if (params.bat_OCC1T >= params.bat_OCC2T) {
      wx.showToast({
        title: "I级充电过流触发门限 需小于 II级充电过流触发门限",
        icon: 'none'
      });
      return false
    }

    // 校验恢复门限(0.1A)
    // if (params.bat_OCC2RT < ranges.bat_OCC2RT[0] || params.bat_OCC2RT > ranges.bat_OCC2RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCC2RT[0]/10}~${ranges.bat_OCC2RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
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

    // 校验触发门限(0.1A)
    if (params.bat_OCD2T < ranges.bat_OCD2T[0] || params.bat_OCD2T > ranges.bat_OCD2T[1]) {
      wx.showToast({
        title: `触发门限范围${ranges.bat_OCD2T[0]/10}~${ranges.bat_OCD2T[1]/10}A`,
        icon: 'none'
      });
      return false;
    }

    // 校验触发延时(s)
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
    if (params.bat_OCD1T >= params.bat_OCD2T) {
      wx.showToast({
        title: "I级放电过流触发门限 需小于 II级放电过流触发门限",
        icon: 'none'
      });
      return false
    }

    // // 校验恢复门限(0.1A)
    // if (params.bat_OCD2RT < ranges.bat_OCD2RT[0] || params.bat_OCD2RT > ranges.bat_OCD2RT[1]) {
    //   wx.showToast({
    //     title: `恢复门限范围${ranges.bat_OCD2RT[0]/10}~${ranges.bat_OCD2RT[1]/10}A`,
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // 校验恢复延时(s)
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

  // II级放电过流写入
  onDisOC2Write: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.currparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateDisOC2Params()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OCD2T,
      D: this.data.params.bat_OCD2D,
      RT: this.data.params.bat_OCD2RT,
      RD: this.data.params.bat_OCD2RD
    };
    wx.showModal({
      content: '确定写入II级放电过流参数 ？',
      complete: (res) => {

        if (res.confirm) {
          wx.showLoading({
            title: '指令下发中',
            mask: true
          })
          cmdTimeout = setTimeout(() => {
            wx.hideLoading()
            that.onUpdateParams()
          }, 5 * 1000);

          http.post('/bms/api/set/params/batOCD2', {
            params: params,
            '3rdsession': session,
            bms_id: bms_id
          }).then(res => {
            if (res.errno == 0) {
              // wx.showToast({
              //   title: '写入成功',
              //   icon: 'none'
              // });
            } else {
              wx.showToast({
                title: res.msg || '写入失败',
                icon: 'none'
              });

              if (!!cmdTimeout) {
                clearTimeout(cmdTimeout)
              }
              wx.hideLoading()
            }
          }).catch(err => {
            wx.showToast({
              title: err.msg || '网络错误',
              icon: 'none'
            });
            if (!!cmdTimeout) {
              clearTimeout(cmdTimeout)
            }
            wx.hideLoading()
          });
        }
      }
    })

  }, 500),

  // 校验基础参数
  validateBasicParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

    // 校验电芯材料
    if (![1, 2].includes(params.cell_mat)) {
      wx.showToast({
        title: '请选择正确的电芯材料',
        icon: 'none'
      });
      return false;
    }

    // 校验电芯串数
    if (params.cell_cnt < ranges.cell_cnt[0] || params.cell_cnt > ranges.cell_cnt[1]) {
      wx.showToast({
        title: `电芯串数范围${ranges.cell_cnt[0]}~${ranges.cell_cnt[1]}`,
        icon: 'none'
      });
      return false;
    }

    // 校验电芯容量
    const capMin = ranges.designed_cap[0];
    const capMax = ranges.designed_cap[1];
    if (params.designed_cap < capMin || params.designed_cap > capMax) {
      wx.showToast({
        title: `电芯容量范围${capMin/10}~${capMax/10}Ah`,
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 基础参数写入
  onBasicParamsWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.basic) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    // 参数校验
    if (!this.validateBasicParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    // 准备参数
    const params = {
      cM: this.data.params.cell_mat, // 1-铁锂 2-三元
      cN: this.data.params.cell_cnt, // 串数
      capacity: this.data.params.designed_cap // 0.1Ah单位
    };

    console.log('基础参数API请求:', params);
    this.confirmDialog(
      '确定写入基础参数？',
      '/bms/api/set/params/cMcN',
      params,

    );
  }, 500),

  // 校验放电电芯高温保护参数
  validateOTDParams() {
    const params = this.data.params;
    const ranges = this.data.ranges;

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

  // 放电电芯高温保护写入
  onOTDWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.tempparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.validateOTDParams()) {
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OTDT,
      D: this.data.params.bat_OTDD,
      RT: this.data.params.bat_OTDRT,
      RD: this.data.params.bat_OTDRD
    };
    this.confirmDialog(
      '确定写入放电电芯高温保护参数？',
      '/bms/api/set/params/ceOTD',
      params,

    );

  }, 500),

  // 放电电芯低温保护写入
  onUTDWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.tempparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateUTDParams()) {
      return;
    }
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_UTDT,
      D: this.data.params.bat_UTDD,
      RT: this.data.params.bat_UTDRT,
      RD: this.data.params.bat_UTDRD
    };
    this.confirmDialog(
      '确定写入放电电芯低温保护参数？',
      '/bms/api/set/params/ceUTD',
      params,

    );

  }, 500),

  // 充电电芯高温保护写入
  onOTCWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.tempparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateOTCParams()) {
      return;
    }
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请登录并选择设备',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_OTCT,
      D: this.data.params.bat_OTCD,
      RT: this.data.params.bat_OTCRT,
      RD: this.data.params.bat_OTCRD
    };
    this.confirmDialog(
      '确定写入充电电芯高温保护参数？',
      '/bms/api/set/params/ceOTC',
      params,

    );
  }, 500),

  // 充电电芯低温保护写入
  onUTCWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.tempparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateUTCParams()) {
      return;
    }
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.bat_UTCT,
      D: this.data.params.bat_UTCD,
      RT: this.data.params.bat_UTCRT,
      RD: this.data.params.bat_UTCRD
    };
    this.confirmDialog(
      '确定写入充电电芯低温保护参数？',
      '/bms/api/set/params/ceUTC',
      params,

    );

  }, 500),

  // mos高温保护写入
  onMosWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.tempparams) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    if (!this.validateMosParams()) {
      return;
    }
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    const params = {
      T: this.data.params.mos_OTCT,
      D: this.data.params.mos_OTCD,
      RT: this.data.params.mos_OTCRT,
      RD: this.data.params.mos_OTCRD
    };
    this.confirmDialog(
      '确定写入mos高温保护参数？',
      '/bms/api/set/params/mosOTC',
      params,

    );

  }, 500),

  /**
   * 请求设备基础信息接口，主要获取btcode 和 服务器地址
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
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    console.info('fetchBasicInfo: 开始请求基础信息', {
      deviceCode,
      session
    });

    // 清空之前的数据
    that.setData({
      baseInfo: null,
    });

    http.post('/bms/api/get/basicinfo', {
      '3rdsession': session,
      'bms_id': deviceCode
    }).then(res => {
      console.info('fetchBasicInfo: 请求成功', res);
      if (res.errno == 0) {
        // 处理基础信息数据，进行单位换算
        const baseInfo = res.data.basicInfo || {};
        let {
          btCode,
          tServer
        } = baseInfo;
        that.setData({
          baseInfo: baseInfo,
          generatedBtCode: btCode || '',
          tServerAddress: tServer || ''

        });

      } else {
        console.error('fetchBasicInfo: 接口返回错误', res.data);
      }
    }).catch(err => {
      console.error('fetchBasicInfo: 请求失败', err);
      // 请求失败，弹出提示
      wx.showToast({
        title: err.msg || '获取基础信息失败',
        icon: 'none'
      });
    });
  },

  //设置bt码
  onSetBtCode: util.throttle(function () {
    console.log("onSetBtCode");
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.btCode) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }
    // 检查基础参数是否配置
    const {
      selectedMaterial,
      params
    } = this.data;
    if (!selectedMaterial || !params.cell_mat) {
      wx.showToast({
        title: '请先配置基础参数',
        icon: 'none'
      });
      return;
    }

    // 设置弹窗标题（根据是否有BT码）
    // const {
    //   baseInfo
    // } = this.data;
    const dialogTitle = this.data.generatedBtCode ? '编辑BT码' : '创建BT码';

    // 获取当前系统时间
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    // 设置材料体系（从基础参数获取，不可修改）
    const materialIndex = params.cell_mat === 1 ? 0 : 1;

    // 如果有现有的BT码，尝试解析
    if (this.data.generatedBtCode) {
      this.parseBtCode(this.data.generatedBtCode);
    } else {
      // 设置默认值（使用系统时间）
      this.setData({
        btMaterialIndex: materialIndex,
        btProductionYear: year,
        btProductionMonth: month,
        btProductionDay: day,
        btVoltageValue: '048',
        btCapacityValue: '020',
        btCycleLifeValue: '12',
        btManufacturerValue: '00SW',
      });
      // this.generateBtCode();
    }

    this.setData({
      showBtCodeDialog: true,
      isShowPreview: false,
      btDialogTitle: dialogTitle,
      isMaterialFixed: true // 标记材料体系不可修改
    });
  }, 500),

  // 关闭BT码弹窗
  onCloseBtCodeDialog: util.throttle(function () {
    this.setData({
      showBtCodeDialog: false,
      isShowPreview: false
    });
  }, 300),

  // 预览BT码
  onPreviewBtCode: util.throttle(function () {
    // 先校验所有输入字段
    if (!this.validateBtCodeInputs()) {
      return;
    }
    // 生成最终BT码
    this.generateBtCode(true);

    this.setData({
      isShowPreview: true
    });
  }, 300),

  // 电压等级输入
  onBtVoltageInput: function (e) {
    let value = e.detail.value;
    this.setData({
      btVoltageValue: value
    });
  },

  // 容量等级输入
  onBtCapacityInput: function (e) {
    let value = e.detail.value
    this.setData({
      btCapacityValue: value
    });
  },

  // 循环寿命输入
  onBtCycleLifeInput: function (e) {
    let value = e.detail.value
    this.setData({
      btCycleLifeValue: value
    });
  },


  // 厂家代码输入
  onbtManufacturerValueInput: function (e) {
    let value = e.detail.value
    this.setData({
      btManufacturerValue: value
    });
  },

  // 生产年份输入
  onBtProductionYearInput: function (e) {
    let value = e.detail.value
    this.setData({
      btProductionYear: value
    });
  },

  // 生产月份输入
  onBtProductionMonthInput: function (e) {
    let value = e.detail.value
    this.setData({
      btProductionMonth: value
    });
  },

  // 生产日期输入
  onBtProductionDayInput: function (e) {
    let value = e.detail.value
    this.setData({
      btProductionDay: value
    });
  },

  // 流水号输入
  onBtSerialNumberInput: function (e) {
    let value = e.detail.value
    this.setData({
      btSerialNumber: value
    });
  },

  // 三方服务器地址输入
  onTServerInput: function (e) {
    const value = e.detail.value.trim();
    this.setData({
      tServerAddress: value
    });
  },

  // 生成BT码
  generateBtCode: function (isPreview) {
    console.log("generateBtCode");
    let that = this;
    const {
      btMaterialIndex,
      btVoltageValue,
      btCapacityValue,
      btCycleLifeValue,
      btManufacturerValue,
      btProductionYear,
      btProductionMonth,
      btProductionDay,
      btSerialNumber
    } = this.data;

    // 材料体系 (1位: 1=铁锂, 2=三元)
    const materialCode = btMaterialIndex + 1;

    // 电压等级 (3位)
    const voltageCode = btVoltageValue.padStart(3, '0').substring(0, 3);

    // 容量等级 (3位)
    const capacityCode = btCapacityValue.padStart(3, '0').substring(0, 3);

    // 循环寿命 (2位)
    const cycleLifeCode = btCycleLifeValue.padStart(2, '0').substring(0, 2);

    // 厂家代码 (4位, 不足补0)
    const manufacturerCode = btManufacturerValue.padEnd(4, '0').substring(0, 4);

    // 生成完整的BT码
    let btCode = '';

    if(that.data.productWay == 1){// 自动
      btCode = `BT${materialCode}${voltageCode}${capacityCode}${cycleLifeCode}${manufacturerCode}${btProductionYear}`;
      if (that.data.deviceCode.length >= 7) {
        //取bmsId 的后6位拼接
        let endFix = that.data.deviceCode.slice(-7)
        btCode +=  endFix;
      } else {
        console.log("bmsId的长度不足7位，补0，bmsId = ", that.data.deviceCode)
       let endFix = that.data.deviceCode.padStart(7, '0').substring(0, 7)
       btCode += endFix;
       }

    }else if(that.data.productWay == 2){ // 自定义
      btCode = `BT${materialCode}${voltageCode}${capacityCode}${cycleLifeCode}${manufacturerCode}${btProductionYear}${btProductionMonth}${btProductionDay}${btSerialNumber}`;
    }


    if (isPreview) {
      this.setData({
        prview_bt_code: btCode
      });
    } else {
      this.setData({
        generatedBtCode: btCode
      });
    }

  },

  // 校验BT码输入字段
  validateBtCodeInputs() {
    console.log("validateBtCodeInputs")
    let that = this;
    const {
      btVoltageValue,
      btCapacityValue,
      btCycleLifeValue,
      btManufacturerValue,
      btProductionYear,
      btProductionMonth,
      btProductionDay,
      btSerialNumber
    } = this.data;

    // 校验电压等级 (3位数字)
    if (!btVoltageValue || btVoltageValue.length !== 3 || isNaN(btVoltageValue)) {
      wx.showToast({
        title: '电压等级需为3位数字',
        icon: 'none'
      });
      return false;
    }

    // 校验容量等级 (3位数字)
    if (!btCapacityValue || btCapacityValue.length !== 3 || isNaN(btCapacityValue)) {
      wx.showToast({
        title: '容量等级需为3位数字',
        icon: 'none'
      });
      return false;
    }

    // 校验循环寿命 (2位数字)
    if (!btCycleLifeValue || btCycleLifeValue.length !== 2 || isNaN(btCycleLifeValue)) {
      wx.showToast({
        title: '循环寿命需为2位数字',
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

    // // 校验生产年份 (2位数字)
    // if (!btProductionYear || btProductionYear.length !== 2 || isNaN(btProductionYear)) {
    //   wx.showToast({
    //     title: '生产年份需为2位数字',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // // 校验生产月份 (2位数字, 01-12)
    // if (!btProductionMonth || btProductionMonth.length !== 2 || isNaN(btProductionMonth) ||
    //   parseInt(btProductionMonth) < 1 || parseInt(btProductionMonth) > 12) {
    //   wx.showToast({
    //     title: '生产月份需为01-12',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    // // 校验生产日期 (2位数字, 01-31)
    // if (!btProductionDay || btProductionDay.length !== 2 || isNaN(btProductionDay) ||
    //   parseInt(btProductionDay) < 1 || parseInt(btProductionDay) > 31) {
    //   wx.showToast({
    //     title: '生产日期需为01-31',
    //     icon: 'none'
    //   });
    //   return false;
    // }

    if (that.data.productWay == 2) { // 自定义
      // 校验生产年份 (2位数字)
      let time = isNaN(btProductionYear) || isNaN(btProductionMonth) || isNaN(btProductionDay)
      if (time) {
        wx.showToast({
          title: '请选择生产日期',
          icon: 'none'
        });
        return false;
      }

      // 校验流水号 (3位数字)
      if (!btSerialNumber || btSerialNumber.length !== 3 || isNaN(btSerialNumber)) {
        wx.showToast({
          title: '流水号需为3位数字',
          icon: 'none'
        });
        return false;
      }

    } else if (that.data.productWay == 1) { // 自动
      // 校验生产年份 (2位数字)
      let time = isNaN(btProductionYear)
      if (time) {
        wx.showToast({
          title: '请选择年份',
          icon: 'none'
        });
        return false;
      }
    }

    return true;
  },

  // 确认BT码 (带校验)
  onValidateAndConfirmBtCode: util.throttle(function () {
    // 先校验所有输入字段
    if (!this.validateBtCodeInputs()) {
      return;
    }

    // 生成最终BT码
    this.generateBtCode();
    const {
      generatedBtCode
    } = this.data;
    console.log("确认的btcode = ", generatedBtCode)
    // 更新baseInfo中的bt_code
    this.setData({
      'baseInfo.bt_code': generatedBtCode,
      showBtCodeDialog: false
    });

    // wx.showToast({
    //   title: 'BT码设置成功',
    //   icon: 'success'
    // });

    // 这里可以添加将BT码发送到设备的逻辑
    console.log('确认BT码:', generatedBtCode);
  }, 500),

  // 保存三方服务器配置
  onTServerSave: util.throttle(function () {
    console.log("onTServerSave")
    let that = this;
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.t_server) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    // const {
    //   tServerAddress
    // } = this.data;

    // if (!tServerAddress) {
    //   wx.showToast({
    //     title: '请输入服务器地址',
    //     icon: 'none'
    //   });
    //   return;
    // }

    // if (!util.validateIPAddress(tServerAddress)) {
    //   wx.showToast({
    //     title: '请输入有效的服务器地址',
    //     icon: 'none'
    //   });
    //   return;
    // }

    let thirdSrv = that.data.thirdSrv
    if(!thirdSrv){
         wx.showToast({
        title: '请选择服务器地址',
        icon: 'none'
      });
      return;
    }

    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    // 对比是否发生了变化
    let _address = null;
    if (this.data.baseInfo) {
      _address = this.data.baseInfo.tServer || null
    }
    if (thirdSrv.value === _address) {
      wx.showToast({
        title: '服务器地址未发生变化，无需写入',
        icon: 'none'
      });
      return;
    }


    this.confirmDialog(
      '确定写入三方后台地址？',
      '/bms/api/set/params/server', {
        ctsrv: thirdSrv.value
      },

    );

  }, 500),

  // 解析BT码
  parseBtCode: function (btCode) {
    if (!btCode || btCode.length !== 24 || !btCode.startsWith('BT')) {
      wx.showToast({
        title: 'BT码格式错误',
        icon: 'none'
      });
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
        btMaterialIndex: materialCode - 1 >= 0 ? materialCode - 1 : 0,
        btVoltageValue: voltageCode,
        btCapacityValue: capacityCode,
        btCycleLifeValue: cycleLifeCode,
        btManufacturerValue: manufacturerCode,
        btProductionYear: productionYear,
        btProductionMonth: productionMonth,
        btProductionDay: productionDay,
        btSerialNumber: serialNumber
      });

      // 生成新的BT码（用于验证）
      // this.generateBtCode();

    } catch (error) {
      wx.showToast({
        title: 'BT码解析失败',
        icon: 'none'
      });
    }
  },

  // BT码设置
  onBTcodeWrite: util.throttle(function () {
    let auth = wx.getStorageSync('auth') || {}
    if (!auth.bms || !auth.bms.cfg || !auth.bms.cfg.btCode) {
      wx.showToast({
        title: '无操作权限',
        icon: 'none'
      });
      return;
    }

    if (!this.data.generatedBtCode) {
      wx.showToast({
        title: '请先输入BT码',
        icon: 'none'
      });
      return;
    }
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }

    // 对比是否发生了变化
    let _bt = null;
    if (this.data.baseInfo) {
      _bt = this.data.baseInfo.btCode || null
    }
    if (this.data.generatedBtCode === _bt) {
      wx.showToast({
        title: 'BT码未发生变化，无需写入',
        icon: 'none'
      });
      return;
    }

    const params = {
      btcode: this.data.generatedBtCode,
    };
    this.confirmDialog(
      '确定写入BT码？',
      '/bms/api/set/params/btCode',
      params,

    );
  }, 500),

  // 更新 btcode 和 三方服务显示  
  onUpdateBtcoeOrServer: util.throttle(function () {
    console.log("onUpdateBtcoeOrServer")
    let that = this;
    that.fetchBasicInfo()

  }, 500),

  // 查询刷新params参数
  onUpdateParams: util.throttle(function () {
    console.log("onUpdateParams")
    let that = this;
    that.fetchParams()

  }, 500),

  // 复制btcode
  onCopyBtcode: util.throttle(function (e) {
    console.log("onCopyBtcode")
    let that = this;
    let btcode = that.data.generatedBtCode;

    wx.setClipboardData({
      data: btcode,
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
    const type = e.currentTarget.dataset.type;
    const op = e.currentTarget.dataset.op;
    console.log("buttonTouchStart type = ", type, "; op =", op)
    this.setData({
      [`${type}${op}Pressed`]: true
    });
  },

  // 按钮释放效果
  buttonTouchEnd: function (e) {
    const type = e.currentTarget.dataset.type;
    const op = e.currentTarget.dataset.op;
    console.log("buttonTouchEnd type = ", type, "; op =", op)

    this.setData({
      [`${type}${op}Pressed`]: false
    });
  },

  // 手指移出按钮区域
  buttonTouchCancel: function (e) {
    const type = e.currentTarget.dataset.type;
    const op = e.currentTarget.dataset.op;
    console.log("buttonTouchCancel type = ", type, "; op =", op)

    this.setData({
      [`${type}${op}Pressed`]: false
    });
  },

  // 阻止触摸滚动事件
  preventTouchMove: function () {
    return false;
  },

  /**
   * 通用二次确认框
   * @param {string} message 提示文字
   * @param {string} apiName 接口路径(如'/bms/api/set/params/btCode')
   * @param {object} params 请求参数
   * @param {function} [successCallback] 成功回调
   * @param {function} [failCallback] 失败回调
   */
  confirmDialog(message, apiName, params, successCallback, failCallback) {
    console.log("confirmDialog ")
    const session = wx.getStorageSync('3rdsession') || '';
    const bms_id = this.data.deviceCode || '';
    if (!session || !bms_id) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      });
      return;
    }
    wx.showModal({
      content: message,
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '指令下发中',
            mask: true
          });

          cmdTimeout = setTimeout(() => {
            wx.hideLoading();
            if (apiName.includes('btCode') || apiName.includes('server')) {
              this.onUpdateBtcoeOrServer();
            } else {
              this.onUpdateParams();
            }
          }, 5 * 1000);

          http.post(apiName, {
            params: params,
            '3rdsession': session,
            bms_id: bms_id
          }).then(res => {
            if (res.errno == 0) {
              // successCallback && successCallback(res);
            } else {
              wx.showToast({
                title: res.msg || '写入失败',
                icon: 'none'
              });
              // failCallback && failCallback(res);
              if (cmdTimeout) {
                clearTimeout(cmdTimeout);
              }
              wx.hideLoading();
            }
          }).catch(err => {
            wx.showToast({
              title: err.msg || '网络错误',
              icon: 'none'
            });
            // failCallback && failCallback(err);
            if (cmdTimeout) {
              clearTimeout(cmdTimeout);
            }
            wx.hideLoading();
          }).finally(() => {
            // if (cmdTimeout) {
            //   clearTimeout(cmdTimeout);
            // }
            // wx.hideLoading();
          });
        }
      }
    });
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
  //BT码生成方式
  productWayChange(e) {
    console.log("productWayChange")
    let that = this;
    let val = parseInt(e.detail.value)
    if(val != that.data.productWay){
      that.setData({
        productWay: val,
        prview_bt_code:null,
        isShowPreview:false
      })
    }
   
  },

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


  onThirdSrvChage(e){
    console.log("onThirdSrvChage")
    let that = this;
    let index = Number( e.detail.value);
    that.setData({
      thirdSrv:that.data.thirdSrvList[index]
    })
  }
})