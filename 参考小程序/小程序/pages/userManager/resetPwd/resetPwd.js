// pages/userManager/resetPwd/resetPwd.js
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
      // if (!that.validateParams()) {
      //   return;
      // }

      let url = '/bms/api/mng/usr/pwd_reset'
      const session = wx.getStorageSync('3rdsession') || '';
      let params = {
        '3rdsession': session,
        "org_id": that.data.org_id,
        "usr_id": that.data.usr_id,
        "name": that.data.name
      }

      // if (!that.data.password) {
      //   wx.showToast({
      //     title: '请输入登录密码',
      //     icon: 'none'
      //   })
      //   return;
      // } else if (that.data.password.length < 6) {
      //   wx.showToast({
      //     title: '密码不能少于6位',
      //     icon: 'none'
      //   })
      //   return;
      // }
      // if (!that.data.repwd) {
      //   wx.showToast({
      //     title: '请输入确认密码',
      //     icon: 'none'
      //   })
      //   return false;
      // }

      // if (that.data.password != that.data.repwd) {
      //   wx.showToast({
      //     title: '两次输入的密码不一致',
      //     icon: 'none'
      //   })
      //   return false;
      // }

      // params.password = that.data.password

      http.post(url, params, {}, true).then(res => {
        if (res.errno === 0) {
          wx.showToast({
            title: '重置成功',
            icon: 'none',
            success() {
              wx.navigateBack()
            }
          })


        } else {
          wx.showToast({
            title: res.errmsg || '重置失败',
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

  // 校验输入参数
  validateParams() {
    console.log("validateParams")
    let that = this;
    if (!that.data.password) {
      wx.showToast({
        title: '请输入登录密码',
        icon: 'none'
      })
      return false;
    } else if (that.data.password.length < 6) {
      wx.showToast({
        title: '密码不能少于6位',
        icon: 'none'
      })
      return;
    }

    if (!that.data.repwd) {
      wx.showToast({
        title: '请输入确认密码',
        icon: 'none'
      })
      return false;
    }

    if (that.data.password != that.data.repwd) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      })
      return false;
    }




    return true;
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