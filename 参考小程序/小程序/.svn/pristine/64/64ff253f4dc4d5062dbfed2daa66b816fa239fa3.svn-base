// pages/deviceManager/deviceAllocation/deviceAllocation.js

const app = getApp();
const util = require("../../../utils/util.js")
const http = require("../../../utils/httpUtil.js")


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

  onInputDev(e) {
    console.log("onInputDev")
    let that = this;
    let value = e.detail.value
    that.setData({
      devString: value
    })
  },

  onSelectGroup:function(){
    console.log("onSelectGroup")
    let that = this;
    wx.navigateTo({
      url: '../../groupManager/orgTree/index?radio=true',
     })
  },

  // 选择页调用
  onOrgSelected(org){
    console.log("onOrgSelected")
    let that = this;
    that.setData({
      selectedOrg:org
    })
  },

  clearOrg: util.throttle(function () {
    console.log("clearOrg")
    let that = this
    that.setData({
      selectedOrg: null
    })

  }, 1000),

  clearInputDevs: util.throttle(function () {
    console.log("clearInputDevs")
    let that = this
    that.setData({
      devString: null,
      validDevList:[],
      isPreview:false
    })

  }, 1000),
  onPreview: util.throttle(function () {
    console.log("onPreview")
    let that = this;
    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }
  
    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
      // if (validItems.length > 50) {
      //   wx.showToast({
      //     title: '最多输入50组编码',
      //     icon: 'none'
      //   })
      //   return
      // } else {
        that.setData({
          validDevList: validItems,
        })
      // }
      
    } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })

        that.setData({
          validDevList: validItems,
          isPreview:true
        })
         return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })
      }
    }

  }, 1000),

  //字符串处理
  processString() {
    console.log("processString")
    let that = this;
    let input = that.data.devString
    if (!input || typeof input !== 'string') {
      return {
        validItems: [],
        result: false,
        invalidItems: [],
        repeatItems: [],
        error: '输入类型有误'
      };
    }

    try {
      // // 处理步骤
      // let trimmed = input.trim().replaceAll("\n", ",").replaceAll("\r\n", ",").replaceAll(/\s+/g, '').replaceAll("，", ',');
      // const items = trimmed.split(/[,，\n]/).map(item => item.trim()).filter(Boolean);

      // 1. 去除前后空格
      const trimmed = input.trim();
      // 2. 替换多个连续空格为单个空格
      const singleSpaced = trimmed.replace(/\s+/g, ' ');
      // 3. 组合分割（逗号、空格、换行符）
      const combinedSplit = singleSpaced.split(/[,\s\n]+/);
      // 过滤空字符串
      const items = combinedSplit.filter(item => item.trim().length > 0);

      // 验证每个项目,合法项
      const validItems = [];
      //不合法项
      const invalidItems = [];
      //重复项
      const repeatItems = [];
      const regex = /^[a-zA-Z0-9]+$/; // 只允许字母和数字

      items.forEach(item => {
        if (regex.test(item)) {
          if (validItems.length == 0) {
            validItems.push(item);
          } else {
            if (!validItems.includes(item)) {
              validItems.push(item);
            } else {
              repeatItems.push(item)
            }
          }


        } else {
          invalidItems.push(item);
        }
      });

      return {
        validItems: validItems,
        result: invalidItems.length === 0 && repeatItems.length === 0,
        invalidItems,
        repeatItems,
        error:  invalidItems.length ? '含非法字符' : (repeatItems.length ? '有重复数据':null)   
      };
    } catch (e) {
      return {
        validItems: [],
        result: false,
        invalidItems: [],
        repeatItems: [],
        error: e.message
      };
    }
  },

  // 调拨
  onConfirmAllocate: util.throttle(function () {
    console.log("onConfirmAllocate")
    let that = this;

    if(!that.data.selectedOrg) {
      wx.showToast({
        title: '请选择要调拨的组织单位',
        icon:"none"
      })
      return;
    }

    if (!that.data.devString) {
      wx.showToast({
        title: '请先输入设备编码',
        icon: 'none'
      })
      return
    }

    let {
      validItems,
      result,
      invalidItems,
      repeatItems,
      error
    } = that.processString()

    if (result) {
      // if (validItems.length > 50) {
      //   wx.showToast({
      //     title: '最多输入50组编码',
      //     icon: 'none'
      //   })
      //   return
      // } else {
        that.setData({
          validDevList: validItems,
        })
      // }

      wx.showModal({
        content: "确定调拨设备？",
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            that.allocateDeviceList()
          }
        }
      });

    } else {
      if (invalidItems.length > 0) {
        wx.showToast({
          title: error,
          icon: "error"
        })
        return;
      } else if (repeatItems.length > 0) {
        wx.showModal({
          content: '有重复数据，剔除重复数据后继续提交吗？',
          complete: (res) => {
            if (res.confirm) {
              // if (validItems.length > 50) {
              //   wx.showToast({
              //     title: '最多输入50组编码',
              //     icon: 'none'
              //   })
              //   return
              // } else {
                that.setData({
                  validDevList: validItems,
                })
              // }
        
              wx.showModal({
                content: "确定调拨设备？",
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    that.allocateDeviceList()
                  }
                }
              });
            }
          }
        })

        return;
      } else if (error) {
        wx.showToast({
          title: error,
          icon: "error"
        })
      }
    }

 
  }, 1000),

 
  
    // 录入设备列表
    allocateDeviceList() {
      console.log("allocateDeviceList")
      let that = this;
      const session = wx.getStorageSync('3rdsession') || '';
      if (!session) {
        wx.reLaunch({
          url: '/pages/login/login',
        })
        return;
      }
  
      let list =  that.data.validDevList || [];
      if(list.length == 0){
        wx.showToast({
          title: '录入的设备为空，请重新输入',
          icon:'none'
        })
        return;
      }
  
      let params = {
        '3rdsession': session,
        "bms_id_list":list, //要录入的设备清单
        // "org_name":"xxxxx", //录入哪个公司组织下，此参数可以不带，如果没有指定要录入的公司组织
      }
  
      if(!!that.data.selectedOrg){ // 有选择目的地
        params.org_name = that.data.selectedOrg.org_name
        params.org_id = that.data.selectedOrg.org_id
      }else{
        wx.showToast({
          title: '请选择要调拨的组织单位',
          icon:"none"
        })
        return;
      }
  
      let url = '/bms/api/mng/dev/trans'
      http.post(url, params, {}, true).then(res => {
        console.log('设备调拨成功', res);
        if (res.errno === 0) {
          let count = res.data.update_cnt;
          let content = "提交调拨" + list.length + "个设备，调拨成功"+ count + "个设备"
          wx.showModal({
            content: content,
            confirmText: '继续调拨',
            cancelText: '返回',
            complete: (res) => {
              if (res.cancel) {
                wx.navigateBack()
              }
              if (res.confirm) {
                that.setData({
                  devString: '',
                selectedOrg: null,
                validDevList:[],
                isPreview:false,
                })
              }
            }
          })
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
  
      }).catch(err => {
        console.log('调拨失败', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
  
      });
    },


     // 扫码获取设备编号
  onScanCode() {
    console.log('onScanCode');
    let that = this;
    wx.scanCode({
      success: (res) => {
        if (res.result) {
          let sn = res.result;
          if (!!that.data.devString) {
            that.setData({
              devString: that.data.devString + ',' + sn
            })
          } else {
            that.setData({
              devString: sn
            })
          }


        }
      },
      fail: (err) => {
        console.log('scanCode fail', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
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