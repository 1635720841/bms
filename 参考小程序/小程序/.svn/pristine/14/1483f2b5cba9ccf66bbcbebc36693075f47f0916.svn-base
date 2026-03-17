const util = require('../../../utils/util.js');
const http = require('../../../utils/httpUtil.js');

Page({
  data: {

    isAdd: true, // 测试
    isEdit: true, // 测试
    // 树形结构数据 - 初始只有公司数据
    //   rootOrgData: [{
    //     org_name: "深圳市盛维智联科技有限公司",
    //     org_id: 1,
    //     isLeaf: false,
    //     children: [] // 初始为空，点击时动态加载
    //   },
    //   {
    //     org_name: "深圳市盛维智联科技有限公司",
    //     org_id: 11,
    //     isLeaf: false,
    //     children: [] // 初始为空，点击时动态加载
    //   }
    // ],

    //   // 模拟的子门店数据（group2）
    //   group2: [{
    //       org_name: "技术部",
    //       org_id: 2,
    //       parent_org_id: 1,
    //       isLeaf: true,
    //       children: []
    //     },
    //     {
    //       org_name: "市场部",
    //       org_id: 3,
    //       parent_org_id: 1,
    //       isLeaf: false,
    //       children: [] // 市场部有子节点，点击时加载
    //     }
    //   ],

    //   // 模拟的三级数据（group3）
    //   group3: [{
    //       org_name: "华南区",
    //       org_id: 4,
    //       parent_org_id: 3,
    //       isLeaf: false,
    //       children: []
    //     },
    //     {
    //       org_name: "华北区",
    //       org_id: 5,
    //       parent_org_id: 3,
    //       isLeaf: true,
    //       children: []
    //     }
    //   ],

    //   // 模拟的四级数据（group4）
    //   group4: [{
    //       org_name: "桃源路加长加长加长",
    //       org_id: 6,
    //       parent_org_id: 4,
    //       isLeaf: false,
    //       children: []
    //     },
    //     {
    //       org_name: "中山路",
    //       org_id: 7,
    //       parent_org_id: 4,
    //       isLeaf: true,
    //       children: []
    //     }
    //   ],
    //   // 模拟的五级数据（group5）
    //   group5: [{
    //       org_name: "粤海街道福克斯放假啊",
    //       org_id: 8,
    //       parent_org_id: 6,
    //       isLeaf: true,
    //       children: []
    //     },
    //     {
    //       org_name: "华北区",
    //       org_id: 9,
    //       parent_org_id: 7,
    //       isLeaf: true,
    //       children: []
    //     }
    //   ],

    // 已加载的节点记录
    loadedNodes: {},

    // 调试用数据
    debugData: {
      expandedNodes: {}
    }
  },


  onLoad(options) {
    console.log('页面加载完成，初始数据：', this.data);
    if (options.radio) {
      this.setData({
        isSingleRadio: options.radio
      })
      wx.setNavigationBarTitle({
        title: '选择组织',
      })
    } else {
      let auth = wx.getStorageSync('auth')
      let isAdd = auth?.mng?.org?.add || false;
      let isEdit = auth?.mng?.org?.update || false;
      this.setData({
        isAdd,
        isEdit
      })

    }

    // 用于防止短时间内重复 toggle 导致重复请求
    this._lastToggle = {
      id: null,
      time: 0
    };

    this.queryRootNode()
  },

  // 查根节点
  queryRootNode() {
    console.log("queryRootNode")
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
    let url = '/bms/api/mng/org/get' //获取用户自己归属的org信息
    http.post(url, params, {}, true).then(res => {
      if (res.errno === 0) {
        let node = res.data;
        if (!!node) {
          if (node.root) { // 如果是admin账号登录，则返回的是数组；
            //2025.11.18 ，需自行构造根结点
            let rootOrg = {
              "isLeaf": false,
              "org_id": -1,
              "org_name": "",
              "root": true,
              "_loading": false,
            }
            let loadedNodes = {
              '-1': true
            };
            let debugData = {
              expandedNodes: {
                '-1': true
              }
            };
            if (Array.isArray(node.org_id)) {
              let children = node.org_id || []
              if (children.length > 0) {
                children = children.map(item => {
                  item.parent_org_id = -1
                  item.root = false;
                  item._loading = false
                  item.isLeaf = false
                  return item;
                })
                rootOrg.children = children
              }
            }
            that.setData({
              rootOrgData: [rootOrg],
              loadedNodes: loadedNodes,
              debugData: debugData
            })


          } else {
            let newNodes = [];
            if (Array.isArray(node)) { // 如果是admin账号登录，则返回的是数组；
              newNodes = node;
            } else { // 非admin账号登录，则返回的是对象，需使用[]包裹成数组；
              newNodes = [node];
            }
            that.setData({
              rootOrgData: newNodes
            })
          }
        } else {
          that.setData({
            rootOrgData: []
          })
        }


      } else {
        wx.showToast({
          title: res.errmsg || '查根节点失败',
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

  // 查组织结构
  queryTreeNode(org_id) {
    console.log("queryTreeNode，org_id = ", org_id)
    let that = this;
    let parentId = org_id;
    const session = wx.getStorageSync('3rdsession') || '';
    if (!session) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
      return;
    }
    let params = {
      '3rdsession': session,
      "next_only": 1
    }

    if (org_id) {
      params.org_id = org_id
    }
    let url = '/bms/api/mng/org/list'
    http.post(url, params, {}, true).then(res => {
      const finalRoot = JSON.parse(JSON.stringify(that.data.rootOrgData));
      if (res.errno === 0) {
        let newNodes = res.data.orgList
        if (!!newNodes) {
          // 应用更新：填充 children 并将状态设为 loaded
          if (newNodes.length > 0) {
            that.findAndUpdateNode(finalRoot, parentId, newNodes);
          } else {
            // 若没有子节点，也确保 children 为空数组
            that.findAndUpdateNode(finalRoot, parentId, []);
          }
        }

        // 清除 loading 标识并更新 loadedNodes
        const updatedLoadedNodes2 = {
          ...that.data.loadedNodes
        };
        updatedLoadedNodes2[parentId] = 'loaded';
        const parentNode = that.findNode(finalRoot, parentId);
        if (parentNode && parentNode._loading) parentNode._loading = false;

        that.setData({
          rootOrgData: finalRoot,
          loadedNodes: updatedLoadedNodes2
        }, () => {
          console.log('异步子数据加载完成 (mock) for', parentId);
          console.log('updated rootOrgData (snippet):', JSON.stringify(finalRoot, null, 2).slice(0, 400));
        });
      } else {
        wx.showToast({
          title: res.errmsg || '查询失败',
          icon: 'none'
        });

        // 清除 loading 标识并更新 loadedNodes
        const updatedLoadedNodes2 = {
          ...that.data.loadedNodes
        };
        updatedLoadedNodes2[parentId] = 'error';
        const parentNode = that.findNode(finalRoot, parentId);
        if (parentNode && parentNode._loading) parentNode._loading = false;

        that.setData({
          rootOrgData: finalRoot,
          loadedNodes: updatedLoadedNodes2
        }, () => {
          console.log('异步子数据加载完成 (mock) for', parentId);
          console.log('updated rootOrgData (snippet):', JSON.stringify(finalRoot, null, 2).slice(0, 400));
        });
      }



    }).catch(err => {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });

  },

  handleToggle(e) {
    let that = this;
    const {
      org_id
    } = e.detail
    console.log('handleToggle 页面处理节点切换 raw org_id:', org_id, 'type:', typeof org_id)

    // 确保org_id是数字类型（兼容组件传 string 或 number）
    const nodeId = (typeof org_id === 'number') ? org_id : parseInt(org_id);
    if (Number.isNaN(nodeId)) {
      console.warn('handleToggle: received invalid org_id', org_id);
      return;
    }

    // 防抖：若短时间内对同一 id 重复触发，则忽略
    const now = Date.now();
    if (!!this._lastToggle) {
      if (this._lastToggle.id === nodeId && (now - this._lastToggle.time) < 300) {
        console.log('handleToggle: 忽略短时间内重复触发 for', nodeId);
        return;
      }
    }
    this._lastToggle = {
      id: nodeId,
      time: now
    };

    // 检查节点是否已展开
    const isExpanded = this.data.debugData.expandedNodes[nodeId];

    if (!isExpanded) {
      // 展开节点时，检查是否需要加载子数据
      if(nodeId == -1){
        console.log("admin 根节点展开收缩")
        //改下扩展的
        let debugData = {
          expandedNodes:{
            '-1':false
          }
        }

        that.setData({
          debugData:debugData
        })
      }else{ 
        this.loadChildNodes(nodeId);
      }
    }

    // 切换展开状态
    const newExpandedNodes = {
      ...this.data.debugData.expandedNodes
    };
    newExpandedNodes[nodeId] = !isExpanded;

    this.setData({
      'debugData.expandedNodes': newExpandedNodes
    });

    console.log('节点展开状态已更新:', newExpandedNodes);
  },

  handleAdd(e) {
    console.log("handleAdd e = ", JSON.stringify(e))
    let that = this;
    const node = e.detail.node
    that.data.addRootNode = node
    // 这里可以添加新增子节点的逻辑
    // 例如弹出表单让用户输入新节点信息
    // 然后更新 allOrgData

    wx.navigateTo({
      url: '../addOrg/addOrg?node=' + JSON.stringify(node),
    })
  },



  // 处理组件上报的选择事件
  handleSelect(e) {
    const {
      org_id,
      node
    } = e.detail || {};
    console.log('handleSelect received:', org_id, node);
    if (!node) return;
    this.setData({
      selectedNode: node
    });
  },

  // 确认选择（这里示例为打印并可进一步处理，例如返回上页或回调）
  confirmSelection() {
    const sel = this.data.selectedNode;
    if (!sel) return;
    console.log('用户确认选择组织:', sel);
    // 这里可以通过 wx.navigateBack 或自定义回调将 sel 返回给上游
    // 将选择通过页面通信传回上一页：优先调用上一页的回调函数 onOrgSelected，
    // 如果没有回调则通过 setData 写入上一页的 selectedOrg 字段。
    const pages = getCurrentPages();
    if (pages && pages.length >= 2) {
      const prevPage = pages[pages.length - 2];
      try {
        if (prevPage && typeof prevPage.onOrgSelected === 'function') {
          prevPage.onOrgSelected(sel);
        } else if (prevPage) {
          prevPage.setData({
            selectedOrg: sel
          });
        }
      } catch (err) {
        console.warn('confirmSelection: failed to notify previous page', err);
      }
    }
    // 返回上一页
    wx.navigateBack({
      delta: 1
    });
  },

  clearSelection() {
    this.setData({
      selectedNode: null
    });
  },

  handleEdit(e) {
    console.log("handleEdit e = ", JSON.stringify(e))
    const node = e.detail.node
    // 这里可以添加编辑节点的逻辑
    // 例如弹出表单让用户修改节点信息
    // 然后更新 allOrgData 中对应的节点

    wx.navigateTo({
      url: '../editOrg/editOrg?node=' + JSON.stringify(node),
    })
  },

  // 处理刷新事件：清除已加载标记并重新加载子节点
  handleRefresh(e) {
    let that = this;
    console.log("handleRefresh")
    let org_id, node
    if (e) {
      console.log("点击的节点")
      org_id = e.detail.org_id
      node = e.detail.node
    } else if (!!that.data.addRootNode) {
      console.log("有add节点")
      org_id = that.data.addRootNode.org_id
      node = that.data.addRootNode
      that.data.addRootNode = null;
    } else {
      console.log("没有节点")
      return;
    }

    if (org_id == -1) { //2025.11.18 admin账号点击刷新，直接清空
      console.log("根节点刷新，直接清空数据，重新查")
      that.setData({
        rootOrgData: [],
        debugData: null,
        loadedNodes: null
      })
      that.queryRootNode()
      return;
    }

    const parentId = (typeof org_id === 'number') ? org_id : parseInt(org_id);
    if (Number.isNaN(parentId)) return;
    console.log('handleRefresh for', parentId, node);
    // 1) 收集当前已存在的该节点的所有后代 id（用于清除它们的 loaded 状态）
    const collectDescendantIds = (nodes, targetId) => {
      const result = [];
      const helper = (list) => {
        for (const n of list) {
          if (n.org_id === targetId) {
            // 收集其下的所有子孙 id
            const collectAll = (children) => {
              if (!children || children.length === 0) return;
              for (const c of children) {
                result.push(c.org_id);
                if (c.children && c.children.length > 0) collectAll(c.children);
              }
            };
            collectAll(n.children || []);
            return true;
          }
          if (n.children && n.children.length > 0) {
            if (helper(n.children)) return true;
          }
        }
        return false;
      };
      helper(this.data.rootOrgData);
      return result;
    };

    const descendantIds = collectDescendantIds(this.data.rootOrgData, parentId);

    // 2) 立即清空该节点的 children（让 UI 立即反馈）
    const newRoot = JSON.parse(JSON.stringify(this.data.rootOrgData));
    this.findAndUpdateNode(newRoot, parentId, []);
    this.setData({
      rootOrgData: newRoot
    }, () => {
      // 3) 重置父及所有后代的加载状态
      const updatedLoaded = {
        ...this.data.loadedNodes
      };
      updatedLoaded[parentId] = false;
      for (const id of descendantIds) updatedLoaded[id] = false;

      // 4) 同时清除这些后代在 expandedNodes 中的展开标记，保证 UI 上箭头和子节点为收起状态
      const newExpanded = {
        ...this.data.debugData.expandedNodes
      };
      for (const id of descendantIds) {
        if (Object.prototype.hasOwnProperty.call(newExpanded, id)) {
          delete newExpanded[id];
        }
      }

      // 一次性更新 loadedNodes 和 expandedNodes，然后重新加载父节点的子数据
      this.setData({
        loadedNodes: updatedLoaded,
        'debugData.expandedNodes': newExpanded
      }, () => {
        this.loadChildNodes(parentId);
      });
    });
  },

  // 递归查找并更新指定节点的children
  findAndUpdateNode(nodes, targetId, children) {
    console.log("findAndUpdateNode")
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].org_id === targetId) {
        // 找到目标节点，更新其children
        nodes[i].children = children;
        // 如果有子节点，确保标记为非叶子
        if (children && children.length > 0) {
          nodes[i].isLeaf = false;
        } else {
          nodes[i].isLeaf = true;
        }
        return true;
      }
      // 递归查找子节点
      if (nodes[i].children && nodes[i].children.length > 0) {
        if (this.findAndUpdateNode(nodes[i].children, targetId, children)) {
          return true;
        }
      }
    }
    return false;
  },

  // 查找节点引用（用于设置 _loading 标识）
  findNode(nodes, targetId) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].org_id === targetId) return nodes[i];
      if (nodes[i].children && nodes[i].children.length > 0) {
        const found = this.findNode(nodes[i].children, targetId);
        if (found) return found;
      }
    }
    return null;
  },

  // 模拟加载子节点数据的方法
  loadChildNodes(parentId) {
    // 支持状态：undefined/false | 'loading' | 'loaded' | 'error'
    const state = this.data.loadedNodes[parentId];
    if (state === 'loaded') {
      console.log(`节点 ${parentId} 的子数据已加载，跳过`);
      return;
    }
    if (state === 'loading') {
      console.log(`节点 ${parentId} 的子数据正在加载，跳过`);
      return;
    }

    console.log(`开始异步加载节点 ${parentId} 的子数据 (mock)`);

    // 标记为 loading
    const updatedLoadedNodes = {
      ...this.data.loadedNodes
    };
    updatedLoadedNodes[parentId] = 'loading';
    // 在 rootOrgData 中设置 _loading 标识
    const tempRoot = JSON.parse(JSON.stringify(this.data.rootOrgData));
    const nodeRef = this.findNode(tempRoot, parentId);
    if (nodeRef) nodeRef._loading = true;
    this.setData({
      loadedNodes: updatedLoadedNodes,
      rootOrgData: tempRoot
    });

    // 模拟异步请求延迟
    // setTimeout(() => {
    //   let newNodes = [];
    //   if (parentId === 1) {
    //     newNodes = [...this.data.group2];
    //     console.log('异步加载 group2 数据:', newNodes);
    //   } else if (parentId === 3) {
    //     newNodes = [...this.data.group3];
    //     console.log('异步加载 group3 数据:', newNodes);
    //   } else if (parentId === 4) {
    //     newNodes = [...this.data.group4];
    //     console.log('异步加载 group4 数据:', newNodes);
    //   } else if (parentId === 6) {
    //     newNodes = [...this.data.group5];
    //     console.log('异步加载 group5 数据:', newNodes);
    //   }

    //   // 根据 mock 映射，确保新加载的节点正确标记 isLeaf（如果该节点还有下级模拟数据，则不是叶子）
    //   const mockChildrenMap = {
    //     1: 'group2',
    //     3: 'group3',
    //     4: 'group4',
    //     6: 'group5'
    //   };
    //   if (newNodes && newNodes.length > 0) {
    //     newNodes = newNodes.map(n => ({
    //       ...n,
    //       isLeaf: !(Object.prototype.hasOwnProperty.call(mockChildrenMap, n.org_id))
    //     }));
    //   }

    //   // 应用更新：填充 children 并将状态设为 loaded
    //   const finalRoot = JSON.parse(JSON.stringify(this.data.rootOrgData));
    //   if (newNodes.length > 0) {
    //     this.findAndUpdateNode(finalRoot, parentId, newNodes);
    //   } else {
    //     // 若没有子节点，也确保 children 为空数组
    //     this.findAndUpdateNode(finalRoot, parentId, []);
    //   }

    //   // 清除 loading 标识并更新 loadedNodes
    //   const updatedLoadedNodes2 = {
    //     ...this.data.loadedNodes
    //   };
    //   updatedLoadedNodes2[parentId] = 'loaded';
    //   const parentNode = this.findNode(finalRoot, parentId);
    //   if (parentNode && parentNode._loading) parentNode._loading = false;

    //   this.setData({
    //     rootOrgData: finalRoot,
    //     loadedNodes: updatedLoadedNodes2
    //   }, () => {
    //     console.log('异步子数据加载完成 (mock) for', parentId);
    //     console.log('updated rootOrgData (snippet):', JSON.stringify(finalRoot, null, 2).slice(0, 400));
    //   });
    // }, 600);

    // 实际应用中，这里可能是一个API请求
    // wx.request({
    //   url: 'your-api-url',
    //   data: { parent_id: parentId },
    //   success: (res) => {
    //     const newNodes = res.data;
    //     const updatedRootOrgData = JSON.parse(JSON.stringify(this.data.rootOrgData));
    //     this.findAndUpdateNode(updatedRootOrgData, parentId, newNodes);
    //     this.setData({
    //       rootOrgData: updatedRootOrgData
    //     });
    //   }
    // });

    //先注释
    this.queryTreeNode(parentId)
  }
})