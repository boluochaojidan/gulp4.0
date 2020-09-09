import CryptoJS from 'crypto-js'
// import httpProto from '../proto/fy_pb'

CryptoJS.enc.u8array = {
  stringify: (wordArray) => {
    // Shortcuts
    var words = wordArray.words;
    var sigBytes = wordArray.sigBytes;
    // Convert
    var u8 = new Uint8Array(sigBytes);
    for (var i = 0; i < sigBytes; i++) {
      var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      u8[i] = byte;
    }
    return u8;
  },
  parse: (u8arr) => {
    // Shortcut
    var len = u8arr.length;
    // Convert
    var words = [];
    for (var i = 0; i < len; i++) {
      words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
  }
}

//转换为Uint8Array类型
const stringToUint8Array = (str) => {
  let uint8Array = new TextEncoder("utf-8").encode(str);
	return uint8Array;
}

const uint8ArrayToString = (fileData) => {
  return new TextDecoder("utf-8").decode(fileData)
}

// 加密方法 传入明文的uint8数组
const getAesString = (array, shareKey) => {
  var key = CryptoJS.enc.Latin1.parse(shareKey)
  var acontent = array
  // 将明文转换成WordArray
  var contentWA = CryptoJS.enc.Utf8.parse(acontent)
  // 插件要求明文是base64格式
  // var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
  // 加密 选定mode是CFB类型，无偏移量
  var encrypted = CryptoJS.AES.encrypt(contentWA, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  // 将密文转回uint8数组
  var bv = CryptoJS.enc.u8array.stringify(encrypted.ciphertext)
  return bv
}

const getDAesString = (array, shareKey) => {
  var key = CryptoJS.enc.Latin1.parse(shareKey)
  var acontent = array
  // 将密文转换成WordArray
  var contentWA = CryptoJS.enc.u8array.parse(acontent)
  // 插件要求密文是base64格式
  var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
  // 解密 选定mode是CFB类型，无偏移量
  var decrypted = CryptoJS.AES.decrypt(dcBase64String, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  // 将解密后的明文转回uint8数组
  var bv = CryptoJS.enc.u8array.stringify(decrypted)
  return bv
}

const getWsAesString = (array, shareKey) => {
  var key = CryptoJS.enc.Latin1.parse(shareKey)
  var acontent = array
  // 将明文转换成WordArray
  var contentWA = CryptoJS.enc.u8array.parse(acontent)
  // 插件要求明文是base64格式
  // var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
  // 加密 选定mode是CFB类型，无偏移量
  var encrypted = CryptoJS.AES.encrypt(contentWA, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  // 将密文转回uint8数组
  var bv = CryptoJS.enc.u8array.stringify(encrypted.ciphertext)
  // console.log(bv)
  return bv
}

const getWsDAesString = (array, shareKey) => {
  var key = CryptoJS.enc.Latin1.parse(shareKey)
  var acontent = array
  // 将密文转换成WordArray
  var contentWA = CryptoJS.enc.u8array.parse(acontent)
  // 插件要求密文是base64格式
  var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
  // 解密 选定mode是CFB类型，无偏移量
  var decrypted = CryptoJS.AES.decrypt(dcBase64String, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  // 将解密后的明文转回uint8数组
  var bv = CryptoJS.enc.u8array.stringify(decrypted)
  return bv
}

const initByte = (params, commonKey) => {
  var sendMsg = getAesString(params, commonKey)
  var length = sendMsg.length
  var buf = new ArrayBuffer(length)
  var dv = new DataView(buf)
  for (var i = 0; i < length; i++) {
      dv.setUint8(i, sendMsg[i])
  }
  return sendMsg
}

const initJson = (result, commonKey) => {
  return new Promise(resolve => {
    if (!result) return false
    const readerC = new FileReader()
    readerC.readAsArrayBuffer(result)
    readerC.onload = (e) => {
      const contentC = getDAesString(new Uint8Array(readerC.result), commonKey)
      resolve(JSON.parse(uint8ArrayToString(contentC)))
    }
  })
}

export default {
  initByte,
  initJson,
  getAesString,
  getDAesString,
  getWsAesString,
  getWsDAesString,
  uint8ArrayToString,
  stringToUint8Array
}
