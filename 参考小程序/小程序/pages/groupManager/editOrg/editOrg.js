// pages/groupManager/editOrg/editOrg.js

const http = require('../../../utils/httpUtil.js');
const util = require('../../../utils/util.js');
let privacyResolves = new Set()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountOption: 1, // 1-暂不创建，2-立即创建
    flag: true,
    read_protocol:false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    if (options.node) {
      that.setData({
        currentNode: JSON.parse(options.node)
      })
    }

    let auth = wx.getStorageSync('auth')
    let addUserPerm = auth?.mng?.usr?.add || false; //用户创建权限
    let updateUserPerm = auth?.mng?.usr?.update || false; //信息修改权限
    let pwdchgPerm = auth?.mng?.usr?.pwdchg || false; //给其它账户修改密码的权限

    this.setData({
      addUserPerm,
      updateUserPerm,
      pwdchgPerm
    })

    // 判断是否进入的根结点
    let rootGroup = wx.getStorageSync('rootGroup')
    let isRootUser = rootGroup.org_id == that.data.currentNode.org_id
    that.setData({
      isRootUser: isRootUser
    })

    that.queryOrgDetail()

  },

  queryOrgDetail() {
    console.log("queryOrgDetail")
    let that = this;

    let url = '/bms/api/mng/org/get'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "name":that.data.currentNode.org_name,
      "org_id": that.data.currentNode.org_id, //公司组织名称
    }
    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        let item = res.data;
        let {
          org_name,
          org_tax_id,
          org_addr,
          contact_person1,
          contact_number1
        } = item
        if (!!item) {
          that.setData({
            item,
            org_name,
            org_tax_id,
            org_addr,
            contact_person1,
            contact_number1
          })
        }
      } else {
        wx.showToast({
          title: res.errmsg || '查询失败',
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



  onCreatAccount: util.throttle(function () {
    console.log('onCreatAccount')
    let that = this;
    wx.navigateTo({
      url: '../../userManager/addUser/addUser?org_id=' + that.data.currentNode.org_id + '&org_name=' + that.data.currentNode.org_name,
    })

  }, 500),

  onUserDetail: util.throttle(function () {
    console.log('onUserDetail')
    let that = this;
    wx.navigateTo({
      url: '../../userManager/userDetail/userDetail?org_id=' + that.data.currentNode.org_id + '&org_name=' + that.data.currentNode.org_name,
    })

  }, 500),

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

    let url = '/bms/api/mng/org/update'  
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "org_name": that.data.org_name, //公司组织名称
      "contact_person1": that.data.contact_person1, //联系人1
      "contact_number1": that.data.contact_number1, //联系人1手机号
      // "parent_org_id": that.data.parent.org_id, //归属的上级公司组织，如不存在则为顶级节点组织
    }
    if(that.data.currentNode.parent_org_id != -1){
      params.parent_org_id = that.data.item.org_id //归属的上级公司组织，如不存在则为顶级节点组织
      params.parent_org_name =  that.data.item.org_name
    }

    if (!!that.data.org_addr) {
      params.org_addr = that.data.org_addr //地址
    }

    if (!!that.data.org_tax_id) {
      params.org_tax_id = that.data.org_tax_id //公司税号
    }

    // if (that.data.accountOption == 2) {
    //   params.usr = {
    //     name: that.data.name,
    //     password: that.data.password
    //   }
    // }

    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: '新增成功',
          icon: 'none',
          success() {
            wx.navigateBack()
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

  //修改登录信息
  onEditAccount: util.throttle(function () {
    console.log("onEditAccount")
    this.setData({
      isShowAccountCfg: true,
      name: this.data.usr.name,
      action: 'edit'
    })
  }, 300),

  // 修改密码
  onModifyPwd: util.throttle(function () {
    console.log("onModifyPwd")
    this.setData({
      isShowAccountCfg: true,
      action: 'modify',
      name: this.data.usr.name
    })
  }, 300),

  //重置密码
  onResetPwd: util.throttle(function () {
    console.log("onResetPwd")
    this.setData({
      isShowAccountCfg: true,
      action: 'reset',
      name: this.data.usr.name
    })
    return;
    let url = '/bms/api/mng/usr/pwd_reset'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "org_id": that.data.currentNode.org_id, //公司组织名称

    }

  }, 300),

  // 提交账号修改
  onHandlerAccount: util.throttle(function () {
    console.log("onHandlerAccount")
    let that = this;
    let action = that.data.action
    let url = ''


    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "org_id": that.data.currentNode.org_id, //公司组织名称
    }

    if (!!that.data.name) {
      params.name = that.data.name
    } else {
      wx.showToast({
        title: '请输入登录账号',
        icon: 'none'
      })
      return;
    }

    if (action == 'add') {
      url = '/bms/api/mng/usr/add'
      if (!that.data.password) {
        wx.showToast({
          title: '请输入登录密码',
          icon: 'none'
        })
        return;
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
        return;
      }

      if (that.data.password != that.data.repwd) {
        wx.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        })
        return;
      }

      params.password = that.data.password

    } else if (action == 'modify') { //修改自己的密码
      url = '/bms/api/mng/usr/pwd_change'
      // 先判断输入的旧密码是否正确
      if (!that.data.password) {
        wx.showToast({
          title: '请输入原登录密码',
          icon: 'none'
        })
        return;
      }

      if (that.data.password != that.data.usr.password) {
        wx.showToast({
          title: '输入的原登录密码不正确',
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

    } else if (action == 'reset') { // 重置某个账号的密码 
      url = '/bms/api/mng/usr/pwd_reset'
      if (!that.data.password) {
        wx.showToast({
          title: '请输入登录密码',
          icon: 'none'
        })
        return;
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

      params.password = that.data.password

    }

    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        if (that.data.action == 'modify') { // 跳去的登录页
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/login/login',
          })
        } else {
          that.setData({
            isShowAccountCfg: false,
            name: '',
            password: '',
            new_password: '',
            new_repwd: ''
          })

          that.queryOrgDetail()
        }


      } else {
        wx.showToast({
          title: res.errmsg || '操作失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });

  }, 500),

  //隐藏弹框
  onHideDialog: util.throttle(function () {
    console.log("onHideDialog")
    let that = this;
    that.setData({
      isShowAccountCfg: false,
      action: ''
    })
  }, 500),

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