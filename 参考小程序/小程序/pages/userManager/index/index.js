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
    let addUserPerm = auth?.mng?.usr?.add || false; //用户创建权限
     let userListPerm = auth?.mng?.usr?.list || false //查看用户列表权限

    that.setData({
      addUserPerm,
      userListPerm
    })
 
    let elements = []
    if(addUserPerm){
      elements.push({
        title: '添加账号',
        name: 'addUser',
        color: 'blue',
        icon: 'add'
      })
    }
    if(userListPerm){
      elements.push({
        title: '账号列表',
        name: 'userList',
        color: 'cyan',
        icon: 'list'
      })
    }
 

    that.setData({
      elements
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