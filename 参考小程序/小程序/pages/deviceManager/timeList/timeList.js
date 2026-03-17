// pages/deviceManager/servicePriceList/servicePriceList.js
const util = require('../../../utils/util.js');
const http = require('../../../utils/httpUtil.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: 0,
    deviceList: [], // 完整的设备列表
    pageSize: 20, // 每页显示数量
    pageNum: 1, // 当前页码
    loadingMore: false, // 是否正在加载更多
    noMore: false, // 是否没有更多数据
    refreshing: false, // 是否正在下拉刷新
    deviceCode: '', // 搜索文本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const windowInfo = wx.getWindowInfo()
    this.setData({
      winHeight: windowInfo.windowHeight,
    })
    this.onSearchConfirm();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },



  //清空设备编号
  clearCode: util.throttle(function () {
    this.setData({
      deviceCode: null,
    });
  }, 500),


  // 输入框设备编号变化
  onDeviceCodeInput(e) {
    console.log('onDeviceCodeInput', e.detail.value);
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
    console.log('onScanCode');
    wx.scanCode({
      success: (res) => {
        console.log('scanCode success', res.result);
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
      console.log('获取设备列表成功', res);
      if (res.errno === 0) {
        // 处理设备列表数据，进行单位换算
        let newDeviceList = res.data.bmsList || [];
        if (newDeviceList.length > 0) {
          newDeviceList = newDeviceList.map(item => {
            if (item.srvEndTime) {
              let ts = new Date(item.srvEndTime)
              let timeF = util.formatTime(ts)
              item.srvEndTimeD = timeF
            }
            return item
          })
        }
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

})