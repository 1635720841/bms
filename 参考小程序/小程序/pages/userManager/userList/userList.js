// pages/userManager/userList/userList.js
const util = require('../../../utils/util.js');
const http = require('../../../utils/httpUtil.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // usr_list:[
    //   {
    //     org_id:'1',
    //     org_name:'123',
    //     usr_id:'u111',
    //     name:'yezi',
    //     email:'123@qq.com',
    //     mobile:'18162544399',
    //     comment:'备注zzzz'
    //   },
    //   {
    //     org_id:'2',
    //     org_name:'111123',
    //     usr_id:'u112',
    //     name:'yezi222',
    //     email:'123@qq.com',
    //     mobile:'18162544399',
    //     comment:'备注zzzz'
    //   },

    //   {
    //     org_id:'1',
    //     org_name:'123',
    //     usr_id:'u113',
    //     name:'yezi222',
    //     email:'',
    //     mobile:'',
    //     comment:''
    //   },

    //   {
    //     org_id:'2',
    //     org_name:'111123',
    //     usr_id:'u113',
    //     name:'yezi222',
    //     email:'',
    //     mobile:'',
    //     comment:'zzdfafafa'
    //   },

    // ],

    usr_list: [],
    pageSize: 20, // 每页显示数量
    pageNum: 1, // 当前页码
    loadingMore: false, // 是否正在加载更多
    noMore: false, // 是否没有更多数据
    refreshing: false, // 是否正在下拉刷新
    searchKey: '', // 搜索文本
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    const windowInfo = wx.getWindowInfo()
    this.setData({
      winHeight: windowInfo.windowHeight,
    })

    let auth = wx.getStorageSync('auth')
    let addUserPerm = auth?.mng?.usr?.add || false; //用户创建权限
    let updateUserPerm = auth?.mng?.usr?.update || false; //信息修改权限
    let pwdchgPerm = auth?.mng?.usr?.pwdchg || false; //给其它账户修改密码的权限

    this.setData({
      addUserPerm,
      updateUserPerm,
      pwdchgPerm
    })

    that.onSearchKeyConfirm()
  },

  onSearchKeyInput(e) {
    this.setData({
      searchKey: e.detail.value
    })
  },

  clearCode: util.throttle(function () {
    console.log("clearCode")
    this.setData({
      searchKey: null
    })
  }, 1000),

  onPullRefresh: util.throttle(function () {
    console.log("onPullRefresh")
    let that = this;

    this.setData({
      pageNum: 1,
      usr_list: [],
      loadingMore: false,
      noMore: false,
      refresherTriggered: true
    });
    this.queryUserList();
  }, 500),

  // 刷新按钮点击事件
  onSearchKeyConfirm() {
    console.log("onSearchKeyConfirm")
    // return
    // this.setData({
    //   pageNum: 1,
    //   usr_list: [],
    //   loadingMore: false,
    //   noMore: false
    // });
    this.queryUserList();
  },

  queryUserList() {
    console.log("queryUserList")
    let that = this;

    // return;

    const session = wx.getStorageSync('3rdsession') || '';
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }


    const {
      pageNum,
      pageSize,
      searchKey
    } = this.data;
    let params = {
      '3rdsession': session,
      'pageSize': pageSize,
      'page': pageNum
    }

    if (searchKey) {
      params.filter = {
        name: searchKey //按账号名字过滤
      }
    }

    let url = '/bms/api/mng/usr/list';
    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        // 处理设备列表数据，进行单位换算
        const newUsrList = res.data.usr_list || [];
        if (pageNum === 1) {
          // 第一数据
          this.setData({
            usr_list: newUsrList,
            noMore: newUsrList.length < pageSize
          });
        } else {
          // 加载更多数据
          this.setData({
            usr_list: this.data.usr_list.concat(newUsrList),
            noMore: newUsrList.length < pageSize
          });
        }
      } else if (res.errno === 2000) {
        wx.clearStorageSync()
        wx.reLaunch({
          url: '/pages/login/login',
        })

      } else {
        wx.showToast({
          title: res.errmsg,
          icon: 'none',
          duration: 2000
        });
      }

      this.setData({
        loadingMore: false,
        refresherTriggered: false
      });
    }).catch(err => {
      log.error('获取设备列表失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
      this.setData({
        loadingMore: false,
        refresherTriggered: false
      });
    });


  },

  // 加载更多数据
  loadMore() {
    console.log("loadMore")
    if (this.data.loadingMore || this.data.noMore) return;

    this.setData({
      loadingMore: true,
      pageNum: this.data.pageNum + 1
    });
    this.queryUserList()
  },

  onUserDetail: util.throttle(function (e) {
    console.log("onUserDetail")
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../userDetail/userDetail?item=' + JSON.stringify(item),
    })
  }, 300),

  //修改登录信息
  onEditAccount: util.throttle(function (e) {
    console.log("onEditAccount")
    let that = this;

    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    that.setData({
      editItem: item,
      editIndex: index
    })
    wx.navigateTo({
      url: '../editUser/editUser?item=' + JSON.stringify(item),
    })
  }, 300),

  // 修改密码
  onModifyPwd: util.throttle(function (e) {
    console.log("onModifyPwd")
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../modifyPwd/modifyPwd?item=' + JSON.stringify(item),
    })
  }, 300),

  //重置密码
  onResetPwd: util.throttle(function (e) {
    console.log("onResetPwd")
    let that = this;
    let item = e.currentTarget.dataset.item;
    let content = '确定要重置账号"' + item.usr_name + '"的密码吗？'
    wx.showModal({
      content: content,
      complete: (res) => {
        if (res.confirm) {
          //直接发请求，不跳转输入了
          // wx.navigateTo({
          //   url: '../resetPwd/resetPwd?item='+JSON.stringify(item),
          // })

          that.sendResetPwdReq(item)
        }
      }
    })

  }, 300),

  sendResetPwdReq(item) {
    console.log("sendResetPwdReq")
    let that = this;
    let url = '/bms/api/mng/usr/pwd_reset'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "org_id": item.org_id,
      "usr_id": item.usr_id,
      "name": item.usr_name
    }


    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {

        let new_pwd = res.data.password_new
        let content = '"' + item.usr_name + '"账号的密码已被重置为：' + new_pwd
        wx.showModal({
          content: content,
          confirmText: '复制',
          complete: (res) => {
            if (res.confirm) {

              wx.setClipboardData({
                data: new_pwd,
                success(res) {
                  wx.getClipboardData({
                    success(res) {
                      console.log(res.data) // data
                    }
                  })
                }
              })
            }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("onShow")
    let that = this;
    if (that.data.editItem) {
      that.queryUserDetail()
    }
  },

  queryUserDetail() {
    console.log("queryUserDetail")
    let that = this;

    let url = '/bms/api/mng/usr/get'
    const session = wx.getStorageSync('3rdsession') || '';
    let params = {
      '3rdsession': session,
      "usr_id": that.data.editItem.usr_id,
    }

    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        let item = res.data;
        if (!!item) {
          let key = `usr_list[${that.data.editIndex}]`
          that.setData({
            [key]: item,
            editItem: null,
            editIndex: -1
          })

        }


      } else {
        wx.showToast({
          title: res.errmsg || '查询失败',
          icon: 'none'
        });

        that.setData({
          editItem: null,
          editIndex: -1
        })
      }
    }).catch(err => {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });

      that.setData({
        editItem: null,
        editIndex: -1
      })
    });
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