// pages/userManager/modifyPwd/modifyPwd.js
const util = require('../../../utils/util.js');
const http = require('../../../utils/httpUtil.js');


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
    if (options.item) {
      let item = JSON.parse(options.item)
      let {
        org_id,
        org_name,
        usr_name,
        usr_id
      } = item
      that.setData({
        item: item,
        org_id,
        org_name,
        name:usr_name,
        usr_id
      })
    }else {
      let org_name = wx.getStorageSync('account')
      that.setData({
        name:org_name
      })
    }
  },

  onInput(e) {
    console.log("onInput")
    let that = this;
    let index = parseInt(e.currentTarget.dataset.index)
    let val = e.detail.value
    if (index == 6) { // 登录账号
      that.setData({
        name: val,
        ['usr.name']: val
      })
    } else if (index == 7) { // 密码
      that.setData({
        password: val
      })
    } else if (index == 8) { // 确认密码
      that.setData({
        repwd: val
      })
    } else if (index == 9) { // 新密码
      that.setData({
        new_password: val
      })
    } else if (index == 10) { // 新密码确认
      that.setData({
        new_repwd: val
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


  onCancel: util.throttle(function () {
    wx.navigateBack()
  }, 300),

  onSubmit: util.throttle(function () {
      let that = this;
      let url = '/bms/api/mng/usr/pwd_change'
      const session = wx.getStorageSync('3rdsession') || '';
      let params = {
        '3rdsession': session,
        // "org_id": that.data.org_id,
        // "usr_id": that.data.usr_id,
        // "name": that.data.name
      }

      if(!!that.data.usr_id){
        params.usr_id = that.data.usr_id
      }
      if(!!that.data.name){
        params.name = that.data.name
      }
   

      // 先判断输入的旧密码是否正确
      if (!that.data.password) {
        wx.showToast({
          title: '请输入原登录密码',
          icon: 'none'
        })
        return;
      }
      if (that.data.password.length < 6) {
        wx.showToast({
          title: '原登录密码不能少于6位',
          icon: 'none'
        })
        return;
      }
      if (!that.data.new_password) {
        wx.showToast({
          title: '请输入新登录密码',
          icon: 'none'
        })
        return;
      } else if (that.data.new_password.length < 6) {
        wx.showToast({
          title: '新登录密码不能少于6位',
          icon: 'none'
        })
        return;
      }

      if (!that.data.new_repwd) {
        wx.showToast({
          title: '请输入确认密码',
          icon: 'none'
        })
        return;
      }
      if (that.data.new_password != that.data.new_repwd) {
        // 再判断新密码2次是否一致
        wx.showToast({
          title: '2次输入的新登录密码不一致',
          icon: 'none'
        })
        return;
      }

      params.password_old = that.data.password //旧密码
      params.password_new = that.data.new_password //新密码
      http.post(url, params, {}, true).then(res => {
        if (res.errno === 0) {
          wx.clearStorageSync()
          wx.showToast({
            title: '修改成功',
            icon: 'none',
            success() {
              wx.reLaunch({
                url: '/pages/login/login',
              })
            }
          })


        } else {
          wx.showToast({
            title: res.errmsg || '修改失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      });

    },
    300),


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