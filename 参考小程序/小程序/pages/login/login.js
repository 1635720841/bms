const util = require('../../utils/util.js');
const log = require('../../utils/logUtil.js');
const http = require('../../utils/httpUtil.js');
const CryptoJS = require('crypto-js');
const crypto = {
  sha256: content => CryptoJS.SHA256(content).toString()
};
const app = getApp()

function generateRandomString(length) {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Page({
  data: {
    activeSize: "medium",
    account: '',
    password: ''
  },
  onAccountInput(e) {
    log.info('onAccountInput');
    this.setData({
      account: e.detail.value
    });
  },
  onPasswordInput(e) {
    log.info('onPasswordInput');
    this.setData({
      password: e.detail.value
    });
  },
  onLogin: util.throttle(function () {
    log.info('onLogin');
    if (!this.data.account || !this.data.password) {
      wx.showToast({
        title: '请输入账号和密码',
        icon: 'none'
      });
      return;
    }

    const appId = 'appid_SWBi2oO0c67sqm9d4zkle';
    const appKey = 'opq5svxyv6nvosm284j69zhwlqXnv61V';
    const randStr = generateRandomString(32);
    const digestStr = crypto.sha256(appId + appKey + this.data.account + this.data.password + randStr);

    let params = {
      "name": this.data.account,
      "pwd": this.data.password,
      "appid": appId,
      "ct": 2,
      "rand": randStr,
      "digest": digestStr
    }

    http.post('/bms/api/login', params, {}, true).then(res => {
      if (res && res.errno === 0) {
        let session = res.data["3rdsession"];
        let {
          org_name,
          org_id,
          auth
        } = res.data

        wx.setStorageSync('3rdsession', session);
        wx.setStorageSync('account', this.data.account)
        wx.setStorageSync('loginOrg', {org_id:org_id,org_name:org_name});
        wx.setStorageSync('auth', auth);
        wx.switchTab({
          url: '/pages/deviceInfo/deviceInfo',
        });

      } else if (res.errno === 1000) {
        wx.showToast({
          title: '账号或密码错误',
          icon: 'none'
        });
      } else if (res.errno === 1001) {
        wx.showToast({
          title: '安全性校验失败',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: res.errmsg || '登录失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.showToast({
        title: err.msg || '网络错误',
        icon: 'none'
      });
    });

  }, 500),


  onRegister: util.throttle(function () {
    log.info('onRegister');
    wx.showToast({
      title: '注册功能待开发',
      icon: 'none'
    });
  }, 500),
  onForgot: util.throttle(function () {
    log.info('onForgot');
    wx.showToast({
      title: '请联系管理员',
      icon: 'none'
    });
  }, 500),


  // 按钮按下效果
  buttonTouchStart: function (e) {
    this.setData({
      isPressed: true
    });
  },

  // 按钮释放效果
  buttonTouchEnd: function (e) {
    this.setData({
      isPressed: false
    });
  },

  // 手指移出按钮区域
  buttonTouchCancel: function (e) {
    this.setData({
      isPressed: false
    });
  }
});