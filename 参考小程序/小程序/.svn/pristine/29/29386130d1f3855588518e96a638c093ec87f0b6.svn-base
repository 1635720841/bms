// pages/deviceManager/serviceTime/serviceTime.js
const app = getApp();
const util = require("../../../utils/util.js")
const http = require("../../../utils/httpUtil.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wayOption: 1, //1-增加天数，2-时间，3-减少天数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
    // 获取当前系统时间
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    let startTime = [year, month, day].join('-')
    that.setData({
      startTime: startTime
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

  wayChange(e) {
    console.log("wayChange")
    let that = this
    let val = parseInt(e.detail.value)
    that.setData({
      wayOption: val
    })

  },
  onInputDev(e) {
    console.log("onInputDev")
    let that = this;
    let value = e.detail.value
    that.setData({
      devString: value
    })
  },
  onInputDays: function (e) {
    console.log('onInputDays ', e.detail.value)
    this.setData({
      days: e.detail.value
    })
  },

  clearInputDevs: util.throttle(function () {
    console.log("clearInputDevs")
    let that = this
    that.setData({
      devString: null,
      validDevList: [],
      isPreview: false
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

 
  onSubmitTime: util.throttle(function () {
    console.log("onSubmitTime")
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
      if (that.data.wayOption == 1 || that.data.wayOption == 2) { // 天数
        if (!that.data.days) {
          wx.showToast({
            title: '请输入天数',
            icon: 'none'
          })
          return;
        }
  
      } else if (that.data.wayOption == 2) { // 日期
        if (!that.data.date) {
          wx.showToast({
            title: '请选择日期',
            icon: 'none'
          })
          return;
        }
  
      }
  
      wx.showModal({
        content: "确定提交？",
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            that.sendTimeReq()
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
        
              if (that.data.wayOption == 1 || that.data.wayOption == 2) { // 天数
                if (!that.data.days) {
                  wx.showToast({
                    title: '请输入天数',
                    icon: 'none'
                  })
                  return;
                }
          
              } else if (that.data.wayOption == 2) { // 日期
                if (!that.data.date) {
                  wx.showToast({
                    title: '请选择日期',
                    icon: 'none'
                  })
                  return;
                }
          
              }
          
              wx.showModal({
                content: "确定提交？",
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    that.sendTimeReq()
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
 

  

  sendTimeReq() {
    console.log("sendTimeReq")
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
    }

    if (that.data.wayOption == 1) { // 增加天数
       params.move_days = Number( that.data.days)  //单位:天，bms的服务到期时间往后延期30天
    } else if (that.data.wayOption == 2) { // YYYYMMDD, bms的服务器到期时间调整到2026/02/01
      params.move_to_date = that.data.date.replaceAll('-','');
    }else if(that.data.wayOption == 3){ // 减少天数
      params.move_days = 0 - Number( that.data.days )// 负数表示减少天数
    }

  

    let url = '/bms/api/mng/srvtime/set'

    http.post(url, params, {}, true).then(res => {
      console.log('修改服务到期时间成功', res);
      if (res.errno === 0) {
        let count = res.data.update_cnt;
        let content = "提交" + list.length + "个设备，修改服务到期时间成功" + count + "个设备"

        wx.showModal({
          content: content,
          confirmText: '继续修改',
          cancelText: '返回',
          complete: (res) => {
            if (res.cancel) {
              wx.navigateBack()
            }
            if (res.confirm) {
              that.setData({
                devString: '',
                days:'',
                date:'',
                wayOption:1,
                validDevList: [],
                isPreview: false,
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
      console.log('定价失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });

    });
  },

  bindDateChange(e) {
    console.log("bindDateChange")
    let that = this;
    let val = e.detail.value;
    that.setData({
      date: val
    })
  },

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