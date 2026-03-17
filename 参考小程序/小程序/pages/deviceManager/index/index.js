// pages/index/index.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
     
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let auth = wx.getStorageSync('auth')
    let addDevPerm = auth?.mng?.dev?.add || false //设备添加录入系统权限
    let transDevPerm = auth?.mng?.dev?.trans || false //设备转移调拨权限
    // let updateDevPerm = auth?.mng?.dev?.update || false //设备信息修改权限
    let xsrvPerm = auth?.mng?.dev?.xsrv || false // 对设备配置主平台权限

    let pricePerm = auth?.mng?.price?.update || false // 服务费定价
    let facPerm = auth?.mng?.fac?.update || false //   生产配置
    let serveTimePerm = auth?.mng?.srvtime?.update || false // 服务时间

    let elements1 = []
    if (addDevPerm) {
      elements1.push({
        title: '设备录入',
        name: 'deviceEntry',
        color: 'cyan',
        icon: 'newsfill'
      })
    }
    if (facPerm) {
      let cfgMenu = {
        title: '生产配置',
        name: 'configuration',
        color: 'pink',
        icon: 'settingsfill'
      }
      elements1.push(cfgMenu)
    }
    that.setData({
      elements1
    })
    let elements2 = []
    if (transDevPerm) {
      elements2.push({
        title: '设备调拨',
        name: 'deviceAllocation',
        color: 'blue',
        icon: 'forwardfill'
      })
    }

    if (xsrvPerm) {
      let xsrv = {
        title: '主平台配置',
        name: 'serviceAddress',
        color: 'green',
        icon: 'same'
      }
      elements2.push(xsrv)
    }
    that.setData({
      elements2
    })
   

    let elements3 = []
    if (pricePerm) {
      let priceDetail = {
        title: '查看',
        name: 'priceList',
        color: 'purple',
        icon: 'tagfill'
      }
      elements3.push(priceDetail)

      let priceMenu = {
        title: '设置',
        name: 'servicePricing',
        color: 'red',
        icon: 'tagfill'
      }
      elements3.push(priceMenu)
    }
    that.setData({
      elements3
    })

    let elements4 = []
    if (serveTimePerm) {
      let serveDetail= {
        title: '查看',
        name: 'timeList',
        color: 'olive',
        icon: 'timefill'
      }

      elements4.push(serveDetail)

      let serveTimeMenu = {
        title: '设置',
        name: 'serviceTime',
        color: 'orange',
        icon: 'timefill'
      }

      elements4.push(serveTimeMenu)

    }

    that.setData({
      elements4
    })



  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    return;

    let session = wx.getStorageSync('3rdsession') || ''
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    } else {

      let auth = wx.getStorageSync('auth')
      //   "add":1 - 设备添加录入系统权限 ; "trans":1 - 设备转移调拨权限
      let add = auth?.mng?.dev?.add || false;
      let trans = auth?.mng?.dev?.trans || false;

      let list = [];
      if (add == 1) {
        list.push({
          title: '设备录入',
          name: 'deviceEntry',
          color: 'cyan',
          icon: 'newsfill'
        })
      }
      if (trans == 1) {
        list.push({
          title: '设备调拨',
          name: 'deviceAllocation',
          color: 'blue',
          icon: 'colorlens'
        })

      }
      that.setData({
        elements: list
      })


    }
  },

  onLogin() {
    console.log("onLogin");
    wx.navigateTo({
      url: '../login/login',
    })
  },


  onImsiDetail() {
    console.log("onImsiDetail");
    let that = this;
    wx.navigateTo({
      url: '../imsiInfo/imsiInfo',
    })

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})