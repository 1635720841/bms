// pages/userManager/userDetail/userDetail.js
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
    if (options.org_name) {
      that.setData({
        org_id: options.org_id,
        org_name: options.org_name
      })

      // 查详情
      that.queryUserDetail()
    }else if(options.item){
      // that.setData({
      //   item:JSON.parse(options.item)
      // })
      let item = JSON.parse(options.item)
      that.setData({
        usr_id: item.usr_id
      })
      // 查详情
      that.queryUserDetail()
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

  queryUserDetail(){
    console.log("queryUserDetail")
    let that = this;
     
    let url = '/bms/api/mng/usr/get'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
       "usr_id": that.data.usr_id,
     }
 
    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
         let item = res.data;
         if(!!item){
          that.setData({
            item
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


  //修改登录信息
  onEditAccount: util.throttle(function (e) {
    console.log("onEditAccount")
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../editUser/editUser?item='+JSON.stringify(item),
    })
  }, 300),

  // 修改密码
  onModifyPwd: util.throttle(function (e) {
    console.log("onModifyPwd")
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../modifyPwd/modifyPwd?item='+JSON.stringify(item),
    })
  }, 300),

  //重置密码
  onResetPwd: util.throttle(function (e) {
    console.log("onResetPwd")
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../resetPwd/resetPwd?item='+JSON.stringify(item),
    })
 

  }, 300),

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