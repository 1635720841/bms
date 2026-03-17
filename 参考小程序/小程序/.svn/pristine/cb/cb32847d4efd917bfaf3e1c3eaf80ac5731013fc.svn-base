// pages/deviceManager/configuration/configuration.js

const app = getApp();
const util = require("../../../utils/util.js")
const http = require("../../../utils/httpUtil.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    cfgList: [
      //   {
      //   "name": "profilel",
      //   "id": 1
      // }, {
      //   "name": "profile2",
      //   "id": 1
      // }, {
      //   "name": "profile3",
      //   "id": 1
      // }
    ],

    // profile: {
    //   "title": [
    //     "名称",
    //     "创建时间",
    //     "软件版本",
    //     "4G信号",
    //     "名称",
    //     "创建时间",
    //     "软件版本",
    //     "4G信号"
    //   ],
    //   "value": [
    //     "20串_100A_JC1120",
    //     "2025-04-07 09:56:03",
    //     "SW_jc1120.20.100.v1.0.faw",
    //     "-77 dBm",
    //     "20串_100A_JC1120",
    //     "2025-04-07 09:56:03",
    //     "SW_jc1120.20.100.v1.0.faw",
    //     "-77 dBm"
    //   ]
    // }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.queryCfgSelections()
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



  // 查配置项
  queryCfgSelections() {
    console.log("queryCfgSelections")
    let that = this;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    let params = {
      '3rdsession': session,
    }

    let url = '/bms/api/mng/fac/profile/list'

    http.post(url, params, {}, true).then(res => {
      console.log('查配置成功', res);
      if (res.errno === 0) {
        //测试数据
        let cfgs = res.data.profile_list

        // || [{
        //   "name": "profilel",
        //   "id": 1
        // }, {
        //   "name": "profile2",
        //   "id": 1
        // }, {
        //   "name": "profile3",
        //   "id": 1
        // }]
        that.setData({
          cfgList: cfgs
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
      console.log('查配置失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });

    });
  },

  // 下拉选项
  onSectionChange(e) {
    let that = this;
    let index = parseInt(e.detail.value)
    console.log("onSectionChange index = ", index)
    this.setData({
      selectedSection: that.data.cfgList[index]
    });


    that.queryParamsDetail()

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

  onConfirmCfg: util.throttle(function () {
    console.log("onConfirmCfg")
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
      if (!that.data.selectedSection) {
        wx.showToast({
          title: '请选择生产配置',
          icon: "none"
        })
        return;
      }
  
      wx.showModal({
        content: "确定提交生产配置？",
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            that.cfgSubmit()
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
        
              if (!that.data.selectedSection) {
                wx.showToast({
                  title: '请选择生产配置',
                  icon: "none"
                })
                return;
              }
          
              wx.showModal({
                content: "确定提交生产配置？",
                confirmText: '确定',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    that.cfgSubmit()
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
  cfgSubmit() {
    console.log("cfgSubmit")
    let that = this;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }

    let list = that.data.validDevList || [];
    if (list.length == 0) {
      wx.showToast({
        title: '录入的设备为空，请重新输入',
        icon: 'none'
      })
      return;
    }

    let params = {
      '3rdsession': session,
      "bms_id_list": list, //要录入的设备清单
      // "org_name":"xxxxx", //录入哪个公司组织下，此参数可以不带，如果没有指定要录入的公司组织
    }

    if (!!that.data.selectedSection) { // 有选择目的地
      // params.org_name = that.data.selectedOrg.org_name
      params.profile_id = that.data.selectedSection.id
    } else {
      wx.showToast({
        title: '请选择生产配置',
        icon: "none"
      })
      return;
    }

    let url = '/bms/api/mng/fac/config'
    http.post(url, params, {}, true).then(res => {
      console.log('生产配置成功', res);
      if (res.errno === 0) {
        let count = res.data.update_cnt;
        let content = "提交生产配置" + list.length + "个设备，生产配置成功" + count + "个设备"
        wx.showModal({
          content: content,
          confirmText: '继续配置',
          cancelText: '返回',
          complete: (res) => {
            if (res.cancel) {
              wx.navigateBack()
            }
            if (res.confirm) {
              that.setData({
                devString: '',
                selectedSection: null,
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
      console.log('配置失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });

    });
  },

  queryParamsDetail(){
    console.log("queryParamsDetail")
    let that = this;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }
 

    let params = {
      '3rdsession': session,
     }

    if (!!that.data.selectedSection) { // 有选择目的地
       params.profile_id = that.data.selectedSection.id
    } else {
      wx.showToast({
        title: '请选择生产配置',
        icon: "none"
      })
      return;
    }

    let url = '/bms/api/mng/fac/profile/get'
    http.post(url, params, {}, true).then(res => {
      console.log('查参数详情成功', res);
      if (res.errno === 0) {
        let profile = res.data?.profile
        if(profile){
          that.setData({
            profile:profile
          })
        }else{
          that.setData({
            profile:null
          })
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

    }).catch(err => {
      console.log('配置失败', err);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });

    });
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