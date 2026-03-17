const util = require('../../utils/util.js');

Page({
  data: {
    activeSize: "small",
    userInfo: {
      isLogin: false,
      username: '',
      company: ''
    },
    version: 'V0.1.0'
  },
  onLoad() {
    let session = wx.getStorageSync('3rdsession') || ''
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    let auth = wx.getStorageSync('auth')
    // 增加权限
    let orgListPerm = auth?.mng?.org?.list || false //查看组织列表权限
    let userListPerm = auth?.mng?.usr?.list || false //查看用户列表权限
    let devListPerm = auth?.mng?.dev?.list || false //查看设备列表权限

    let loginOrg = wx.getStorageSync("loginOrg")
    if(loginOrg){
      this.setData({
        org_name:loginOrg.org_name
      })
    }

    console.log("orgListPerm = ",orgListPerm,"; userListPerm = ",userListPerm,"; devListPerm = ",devListPerm)

    this.setData({
      orgListPerm,
      userListPerm,
      devListPerm
    })

  },
  onShow() {
    // 可从Storage或接口获取用户信息
    let session = wx.getStorageSync('3rdsession') || '';
    let account = wx.getStorageSync("account") || ''

    this.setData({
      isLogin: !!session,
      username: account || '',

    });
  },
  onLogin: util.throttle(function () {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  }, 400),
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({
            userInfo: {
              isLogin: false,
              username: '',
              company: ''
            }
          });
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      }
    });
  },

  // 联系客服
  onContactService: util.throttle(function () {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  }, 400),

  // 查看配置记录
  onViewConfigLogs: util.throttle(function () {
    wx.showToast({
      title: '开发中，敬请期待',
      icon: 'none'
    })
    return;
    wx.navigateTo({
      url: '/pages/configLogs/configLogs'
    });
  }, 400),

  // 组织管理
  onGroupMng: util.throttle(function () {
    // wx.showToast({
    //   title: '开发中，敬请期待',
    //   icon:'none'
    // })
    // return;
    wx.navigateTo({
      url: '/pages/groupManager/orgTree/index'
    });
  }, 400),

  // 用户管理
  onUserMng: util.throttle(function () {
     
    wx.navigateTo({
      url: '/pages/userManager/index/index'
    });
  }, 400),

  // 设备管理
  onDeviceMng: util.throttle(function () {
    // wx.showToast({
    //   title: '开发中，敬请期待',
    //   icon:'none'
    // })
    // return;
    wx.navigateTo({
      url: '/pages/deviceManager/index/index'
    });
  }, 400),

    // 修改密码
    onModifyPwd: util.throttle(function (e) {
      console.log("onModifyPwd")
      let item = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: '../userManager/modifyPwd/modifyPwd' ,
      })
    }, 300),
  
})