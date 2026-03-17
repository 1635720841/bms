Component({
  properties: {
    // 组织数据列表（树形结构）
    org_list: {
      type: Array,
      value: []
    },
    // 展开状态，完全由父组件控制
    expandedNodes: {
      type: Object,
      value: {}
    },
    // 是否有新增权限
    isAdd: {
      type: Boolean,
      value: false
    },
    // 是否有编辑权限
    isEdit: {
      type: Boolean,
      value: false
    },
    // 是否单选
    isSingleRadio: {
      type: Boolean,
      value: false
    },
    // 选中的组织
    selectedOrg:{
      type:Object,
      value:null
    }
  },

  methods: {

    // 处理节点点击事件
    toggleNode(e) {
      // 如果事件来自子组件（child component triggerEvent），则直接透传 upwards
      if (e && e.detail && typeof e.detail.org_id !== 'undefined') {
        // 直接将子组件的 payload 透传给父层（page 或上层组件）
        this.triggerEvent('toggle', e.detail);
        return;
      }

      // dataset 可以在 currentTarget 或 target 上，优先取 currentTarget
      // dataset 可以在 currentTarget 或 target 上，优先取 currentTarget 的 id
      let rawId = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) ||
        (e.target && e.target.dataset && e.target.dataset.id);
      // 如果没有 id，尝试使用 idx（当前层索引）回退查找
      let idx = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.idx) ||
        (e.target && e.target.dataset && e.target.dataset.idx);
      if (typeof rawId === 'undefined' || rawId === null) {
        if (typeof idx !== 'undefined' && idx !== null) {
          // idx 来自当前层 org_list
          const list = this.properties.org_list || [];
          const entry = list[parseInt(idx)];
          if (entry) rawId = entry.org_id;
        }
      }
      console.log('component.toggleNode rawId:', rawId, 'type:', typeof rawId);
      if (typeof rawId === 'undefined' || rawId === null) {
        // 详细调试信息：打印 dataset 帮助定位触发元素
        try {
          console.warn('toggleNode: rawId undefined — dumping datasets:', {
            currentTarget: e.currentTarget && e.currentTarget.dataset,
            target: e.target && e.target.dataset
          });
        } catch (err) {
          console.warn('toggleNode: failed to dump datasets', err);
        }
        return;
      }

      const nodeId = parseInt(rawId);
      if (Number.isNaN(nodeId)) return;

      const currentNode = this.properties.org_list.find(item => item.org_id === nodeId);
      if (!currentNode) {
        console.warn('toggleNode: node not found in org_list for id', nodeId, this.properties.org_list);
      }
      //存储点击的节点；
      this.setData({
        selectNode: currentNode
      })
      if (currentNode?.isLeaf) return;

      // 尝试传递 node 对象，减少父层查找
      const nodeObj = this.properties.org_list.find(item => item.org_id === nodeId) || null;
      this.triggerEvent('toggle', {
        org_id: nodeId,
        node: nodeObj
      }, {
        bubbles: true,
        composed: true
      });
    },

    // 处理添加子节点事件
    addChild(e) {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      const rawId = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) ||
        (e.target && e.target.dataset && e.target.dataset.id);
      if (typeof rawId === 'undefined' || rawId === null) return;
      const nodeId = parseInt(rawId);
      if (Number.isNaN(nodeId)) return;
      const nodeObj = this.properties.org_list.find(item => item.org_id === nodeId) || null;
      this.triggerEvent('add', {
        org_id: nodeId,
        node: nodeObj
      }, {
        bubbles: true,
        composed: true
      });
    },

    // 处理编辑节点事件
    editNode(e) {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      const rawId = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) ||
        (e.target && e.target.dataset && e.target.dataset.id);
      if (typeof rawId === 'undefined' || rawId === null) return;
      const nodeId = parseInt(rawId);
      if (Number.isNaN(nodeId)) return;
      const nodeObj = this.properties.org_list.find(item => item.org_id === nodeId) || null;
      this.triggerEvent('edit', {
        org_id: nodeId,
        node: nodeObj
      }, {
        bubbles: true,
        composed: true
      });
    },

    // 处理选择节点事件（将选中节点向上通知 page）
    selectNode(e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      const rawId = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) ||
        (e.target && e.target.dataset && e.target.dataset.id);
      let idx = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.idx) ||
        (e.target && e.target.dataset && e.target.dataset.idx);
      let nodeId = null;
      if (typeof rawId === 'undefined' || rawId === null) {
        if (typeof idx !== 'undefined' && idx !== null) {
          const list = this.properties.org_list || [];
          const entry = list[parseInt(idx)];
          if (entry) nodeId = entry.org_id;
        }
      } else {
        nodeId = parseInt(rawId);
      }
      if (!nodeId) return;
      const nodeObj = (this.properties.org_list || []).find(item => item.org_id === nodeId) || null;
      this.triggerEvent('select', {
        org_id: nodeId,
        node: nodeObj
      }, {
        bubbles: true,
        composed: true
      });
    },

    // 刷新节点（触发父层重新加载该节点的 children）
    refreshNode(e) {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
      const rawId = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) ||
        (e.target && e.target.dataset && e.target.dataset.id);
      let idx = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.idx) ||
        (e.target && e.target.dataset && e.target.dataset.idx);
      let nodeId = null;
      if (typeof rawId === 'undefined' || rawId === null) {
        if (typeof idx !== 'undefined' && idx !== null) {
          const list = this.properties.org_list || [];
          const entry = list[parseInt(idx)];
          if (entry) nodeId = entry.org_id;
        }
      } else {
        nodeId = parseInt(rawId);
      }
      if (!nodeId) return;
      const nodeObj = (this.properties.org_list || []).find(item => item.org_id === nodeId) || null;
      this.triggerEvent('refresh', {
        org_id: nodeId,
        node: nodeObj
      }, {
        bubbles: true,
        composed: true
      });
    }
  }
})