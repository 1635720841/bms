const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}


// 防抖
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(fn, gapTime = 300) {
  let lastTime = null;
  return function (...args) {
    const now = Date.now();
    if (!lastTime || now - lastTime > gapTime) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

//校验手机号
function validatePhoneNumber(phoneNumber) {
  // 使用正则表达式进行校验
  let regex = /^1[3456789]\d{9}$/;
  return regex.test(phoneNumber);
}

  // 验证IP地址格式
  function validateIPAddress(address) {
    // 校验IP:端口或域名:端口格式
    if (address.includes(':')) {
      const [host, port] = address.split(':');
      const portNum = parseInt(port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return false;
      }

      // 校验IP部分
      const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (ipRegex.test(host)) {
        return true;
      }

      // 校验域名部分
      const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
      if (domainRegex.test(host)) {
        return true;
      }

      return false;
    } else {
      return false;
    }


  }

  // 校验税号
   function isValidUSCC(code) {
    // 检查长度是否为18位
    if (code.length !== 18) {
        return false;
    }
    
    // 检查是否全为数字或大写字母
    const pattern = /^[0-9A-Z]+$/;
    if (!pattern.test(code)) {
        return false;
    }
    
    return true;
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}
 

module.exports = {
  formatTime,
  debounce,
  throttle,
  validatePhoneNumber,
  validateIPAddress,
  isValidUSCC,
  validateEmail
}
