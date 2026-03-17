
/**
 * 日志输出工具 logUtil.js
 * 支持 info、warn、error、debug 四种级别
 * 可通过 setEnabled(true/false) 控制日志输出开关
 */

let enabled = true;

function setEnabled(flag) {
  enabled = !!flag;
}


function info(...args) {
  if (enabled) console.info('[INFO]', ...args);
}


function warn(...args) {
  if (enabled) console.warn('[WARN]', ...args);
}


function error(...args) {
  if (enabled) console.error('[ERROR]', ...args);
}


function debug(...args) {
  if (enabled) console.debug('[DEBUG]', ...args);
}


module.exports = {
  info,
  warn,
  error,
  debug,
  setEnabled
};
