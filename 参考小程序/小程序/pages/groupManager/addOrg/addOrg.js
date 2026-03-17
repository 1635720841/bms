// pages/groupManager/addOrg/addOrg.js

const http = require('../../../utils/httpUtil.js');
const util = require('../../../utils/util.js');

let privacyResolves = new Set()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountOption: 1, // 1-暂不创建，2-立即创建
    read_protocol:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (options.node) {
      that.setData({
        parent: JSON.parse(options.node)
      })
    }


  },

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
        contact_number1: val
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

  accountChange(e) {
    console.log("")
    this.setData({
      accountOption: parseInt(e.detail.value)
    })
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
    if(!that.data.read_protocol){
      wx.showToast({
        title: '请先阅读并同意《用户隐私保护协议》',
        icon:'none'
      })
      return
    }

    if (!that.validateParams()) {
      return;
    }

    let url = '/bms/api/mng/org/add'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "org_name": that.data.org_name, //公司组织名称
      "contact_person1": that.data.contact_person1, //联系人1
      "contact_number1": that.data.contact_number1, //联系人1手机号
      // "parent_org_id": that.data.parent.org_id, //归属的上级公司组织，如不存在则为顶级节点组织
    }

    if(that.data.parent.org_id != -1){
      params.parent_org_id = that.data.parent.org_id //归属的上级公司组织，如不存在则为顶级节点组织
      params.parent_org_name =  that.data.parent.org_name
    }

    if (!!that.data.org_addr) {
      params.org_addr = that.data.org_addr //地址
    }

    if (!!that.data.org_tax_id) {
      params.org_tax_id = that.data.org_tax_id //公司税号
    }

    if (that.data.accountOption == 2) {
      params.usr = {
        name: that.data.name,
        password: that.data.password,
      }
      if (!!that.data.email) {
        params.usr.email = that.data.email
      }
      if (!!that.data.mobile) {
        params.usr.mobile = that.data.mobile
      }
      if (!!that.data.comment) {
        params.usr.comment = that.data.comment
      }
    }

    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        wx.showModal({
          content: '新增成功',
          complete: (res) => {
            if (res.confirm) {
              const pages = getCurrentPages();
              if (pages && pages.length >= 2) {
                const prevPage = pages[pages.length - 2];
                try {
                  if (prevPage && typeof prevPage.handleRefresh === 'function') {
                    prevPage.handleRefresh();
                  } 
                } catch (err) {
                  console.warn('handleRefresh: failed to notify previous page', err);
                }
              }
              // 返回上一页
              wx.navigateBack({
                delta: 1
              });
            }
          }
        })

      } else {
        wx.showToast({
          title: res.errmsg || '新增失败',
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
    if (!that.data.org_name) {
      wx.showToast({
        title: '请先输入组织名',
        icon: 'none'
      })
      return false;
    }
    // if (!that.data.org_addr) {
    //   wx.showToast({
    //     title: '请先输入地址',
    //     icon: 'none'
    //   })
    //   return false;
    // }

    let taxId = that.data.org_tax_id
    if (!!taxId) {
      // let taxId = taxId.trim()
      if (!util.isValidUSCC(taxId)) {
        wx.showToast({
          title: '输入的税号格式有误',
          icon: 'none'
        })
        return false;
      }
    }


    if (!that.data.contact_person1) {
      wx.showToast({
        title: '请先输入联系人姓名',
        icon: 'none'
      })
      return false;
    }

    if (!that.data.contact_number1) {
      wx.showToast({
        title: '请先输入联系人号码',
        icon: 'none'
      })
      return false;
    } else if (!util.validatePhoneNumber(that.data.contact_number1)) {
      wx.showToast({
        title: '输入的手机号码格式有误',
        icon: 'none'
      })
      return false;
    }

    if (that.data.accountOption == 2) { // 创建登录账号
      if (!that.data.name) {
        wx.showToast({
          title: '请输入登录账号',
          icon: 'none'
        })
        return false;
      }
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
  openPrivacyContract() {
    let that = this;
    wx.openPrivacyContract({
      success: res => {
        console.log('openPrivacyContract success')
        that.setData({
          read_protocol: true
        })
      },
      fail: res => {
        console.error('openPrivacyContract fail', res)
      }
    })
  },
  handleAgree: util.throttle(function (e) {
    console.log("handleAgree")
    let that = this;
    // 这里演示了同时调用多个wx隐私接口时要如何处理：让隐私弹窗保持单例，点击一次同意按钮即可让所有pending中的wx隐私接口继续执行 （看page/index/index中的 wx.getLocation 和 wx.chooseImage）
    privacyResolves.forEach(resolve => {
      resolve({
        event: 'agree',
        buttonId: 'agree-btn'
      })
    })
    privacyResolves.clear()
    that.setData({
      read_protocol: !that.data.read_protocol
    })
  }, 300),

  handleDisagree(e) {
    privacyResolves.forEach(resolve => {
      resolve({
        event: 'disagree',
      })
    })
    privacyResolves.clear()
  },

  showProtocolTip: function () {
    console.log("showProtocolTip")
    let that = this
    that.setData({
      isShowDialog: true,
      message: "请阅读并勾选同意协议"
    })
  },
})