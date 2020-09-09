
// 常量
const env = '/* @echo NODE_ENV */'
const isIOS = !(navigator.userAgent.indexOf("Android") > -1) && (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent))

export default {
  // 版本号
  VERSION: '1.0.0',
  isIOS: isIOS,
  // 密码加密 key
  SECRET_KEY: '111',
  API_KEY: env == 'prod' ? '123' : '123',
  env,
  baseUrl: env=='prod' ? 'https://baidu.com'  : env == 'test' ? 'http://10.0.0.14:8088' : '/api',
  websocketUrl: env == 'prod' ? 'wss://wss.abc.com' : 'ws://10.0.0.14:9880',
  // websocket 码
  WS_CODE: {
    // 心跳
    HEART: 1000,
    HEART_SUCCESS: 2000,
    // 错误
    ERROR: 9999,
  }

}