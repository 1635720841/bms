const baseUrl = 'https://www.swslink.net'; // TODO: 替换为实际接口地址


function get(url, data = {}, header = {}, showLoading = false) {
  const defaultHeader = { 'Content-Type': 'application/json' };
  const finalHeader = Object.assign({}, defaultHeader, header);
  
  // 显示加载中
  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method: 'GET',
      data,
      header: finalHeader,
      success: res => {
        // 隐藏加载中
        if (showLoading) {
          wx.hideLoading();
        }
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject({ status: res.statusCode, msg: res.errMsg || '请求失败', res });
        }
      },
      fail: err => {
        // 隐藏加载中
        if (showLoading) {
          wx.hideLoading();
        }
        reject({ status: -1, msg: err.errMsg || '网络错误', err });
      }
    });
  });
}


function post(url, data = {}, header = {}) {
  const defaultHeader = { 'Content-Type': 'application/json' };
  const finalHeader = Object.assign({}, defaultHeader, header);
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method: 'POST',
      data,
      header: finalHeader,
      success: res => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject({ status: res.statusCode, msg: res.errMsg || '请求失败', res });
        }
      },
      fail: err => reject({ status: -1, msg: err.errMsg || '网络错误', err })
    });
  });
}

module.exports = {
  get,
  post,
  baseUrl
};
