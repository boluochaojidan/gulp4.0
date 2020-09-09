import constant from 'utils/constant'
import md5 from 'js-md5'

/**
 * 获取 url 上的单个参数
 * @param {*} variable 参数名
 */
export const getUrlParam = function (variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return (false);
}

/**
 * 生成sign签名
 */
export const getSign = (time) => {
  return md5(time + '@' + constant.SECRET_IMAGE_KEY)
}

/**
 * 生成UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 子元素滚动到容器顶部（目前仅支持 jq对象）
 * @param {*} container 容器，即父元素
 * @param {*} target 目标元素，容器里面的子元素
 */
export const scrollTop = function (container, target) {
  container.scrollTop(container.scrollTop() + target.offset().top - container.offset().top)
}
/**
 * 禁止冒泡
 * @param {*} e 事件对象
 */
export const stopBubble = function (e) {
  //如果提供了事件对象，则这是一个非IE浏览器 
  if (e && e.stopPropagation)
    //因此它支持W3C的stopPropagation()方法 
    e.stopPropagation();
  else
    //否则，我们需要使用IE的方式来取消事件冒泡 
    window.event.cancelBubble = true;
}
/**
 * base64位图片转码文件流
 */
export const base64toFile = function (dataurl, filename = 'file') {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let suffix = mime.split('/')[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, {
    type: mime
  })
}
/**
 * 文件流转为 base64
 * @param {*} file 
 */
export const fileToBase64 = function (file) {
  var URL = window.URL || window.webkitURL;
  return URL.createObjectURL(file);
}
/**
 * 关闭页面监听
 * @param callback 回调方法
 */
export const closePageListener = function (callback) {
  let isClose = false
  window.onbeforeunload = function () {
    execute()
  }
  window.onunload = function () {
    execute()
  }

  function execute() {
    if (isClose) {
      return
    }
    isClose = true
    callback()
  }
}
// 深拷贝（json 方式，无法拷贝对象中方法）
export const deepClone = function (obj) {
  var _obj = JSON.stringify(obj),
    objClone = JSON.parse(_obj);
  return objClone;
}

/**
 * 密码加密
 * @param {*} password 
 */
let md5Pwd = function (password) {
  return md5(md5(password.toLowerCase()) + constant.SECRET_KEY)
}
export {
  md5Pwd
}
