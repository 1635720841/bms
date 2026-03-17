// pages/userManager/editUser/editUser.js

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
        mobile,
        email,
        comment,
        usr_id
      } = item
      that.setData({
        item: item,
        org_id,
        org_name,
        name: usr_name,
        mobile,
        email,
        comment,
        usr_id
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


  onInput(e) {
    console.log("onInput")
    let that = this;
    let index = parseInt(e.currentTarget.dataset.index)
    let val = e.detail.value
    if (index == 1) { //组织名
      that.setData({
        org_name: val
      })
    } else if (index == 2) { // 地址
      that.setData({
        org_addr: val
      })
    } else if (index == 3) { //税号
      that.setData({
        org_tax_id: val
      })
    } else if (index == 4) { // 姓名
      that.setData({
        contact_person1: val
      })
    } else if (index == 5) { // 手机号
      that.setData({
        contact_phone: val
      })
    } else if (index == 6) { // 登录账号
      that.setData({
        name: val
      })
    } else if (index == 7) { // 密码
      that.setData({
        password: val
      })
    } else if (index == 8) { // 确认密码
      that.setData({
        repwd: val
      })
    } else if (index == 21) { //  电子邮箱
      that.setData({
        email: val
      })
    } else if (index == 22) { // 手机号码
      that.setData({
        mobile: val
      })
    } else if (index == 23) { // 备注信息
      that.setData({
        comment: val
      })
    }
  },

  onSubmit: util.throttle(function () {
    let that = this;
    if (!that.validateParams()) {
      return;
    }

    //接口带定义
    let url = '/bms/api/mng/usr/update'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "usr_id": that.data.usr_id,
    }



    if (!!that.data.email) {
      params.email = that.data.email
    }

    if (!!that.data.mobile) {
      params.mobile = that.data.mobile
    }

    if (!!that.data.comment) {
      params.comment = that.data.comment
    }


    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        wx.showModal({
          content: '修改成功',
          showCancel: false,
          complete: (res) => {
            if (res.confirm) {
              wx.navigateBack()
            }
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

  }, 300),

  // 校验输入参数
  validateParams() {
    console.log("validateParams")
    let that = this;
    let email = that.data.email
    if (!!email) {
      if (!util.validateEmail(email)) {
        wx.showToast({
          title: '输入的邮箱格式有误',
          icon: 'none'
        })
        return false;
      }
    }

    let mobile = that.data.mobile
    if (!!mobile) {
      if (!util.validatePhoneNumber(mobile)) {
        wx.showToast({
          title: '输入的手机号码格式有误',
          icon: 'none'
        })
        return false;
      }
    }


    return true;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

})