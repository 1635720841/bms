// pages/locOnMap/locOnMap.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (options.runInfo) {
      let runInfo = JSON.parse(options.runInfo)
      let marker = {
        width: 50,
        height: 50,
        iconPath: runInfo.online == 1 ? "/images/icon_map_cabinet_marker2.png" : "/images/icon_map_cabinet_marker_gray.png",
        id: 1,
        latitude: Number(runInfo.gcj02.lat), //坐标必须是数字，ios上才会显示
        longitude: Number(runInfo.gcj02.lng),
        
      }

      let markers = [marker]

      that.setData({
        latitude:runInfo.gcj02.lat,
        longitude:runInfo.gcj02.lng,
        runInfo: runInfo,
        allMarkers: markers
      })
    }

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})