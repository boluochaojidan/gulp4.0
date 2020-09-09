import { wsHandler } from './wsHandler'
import constant from './constant'
import apiFormat from './apiFormat'
import { Toast } from './components'
import { md5Pwd, generateUUID } from './common'
import { storeData } from './store'
let websocketUrl = constant.websocketUrl

// websocket 对象
let that = undefined
let ws = null
let count = 0//记录重连次数
let MAX = 7; //连续重连次数
let reconTime = 0; //重连时间
let reconTimer = null;
let socketTag = 0
let currentSwUrl = ''
// 心跳 timer
let heartTimer

function getSessionId() {
  storeData.sessionId = md5Pwd(generateUUID())
  return storeData.sessionId
}

const websocket = {
  // 基本信息
  sessionInfo: {
    key: storeData.sessionId ? storeData.sessionId : getSessionId(),
    plat: 4,
    version: 1,
  },
  // 获取 websocket 实例
  // getWs() {
  //   return ws
  // },

  // 初始化 websocket
  init(callback) {
    that = this
    // 如果对象已实例化，则关闭
    if (ws && Object.keys(ws).length !== 0) {
      console.log('主动断开 ws')
      // 登出
      that.logout()
      ws.close()
    }
    // 浏览器不支持 websocket，提示用户
    if (!('WebSocket' in window) && !('MozWebSocket' in window)) {
      Toast({
        message: '您的浏览器不支持 websocket，请使用其他浏览器浏览此网页',
        position: 'bottom',
        duration: 2000
      });
      return
    }
    // 初始化 ws，并发送基本参数数据
    that.reset()
    socketTag++
    const wsuri = `${websocketUrl}/?sid=${socketTag}`
    currentSwUrl = wsuri
    ws = new WebSocket(wsuri)
    // 连接钩子
    ws.onopen = that.onopen
    ws.onmessage = that.onmessage
    ws.onclose = that.onclose
    ws.onerror = that.onerror
    return ws
  },
  onopen() {
    console.log('ws 连接成功')
    // 登录 socket 服务器
    that.send(constant.WS_CODE.LOGIN, that.sessionInfo)
    // let msgList = storeData.resendMsg
    // if(msgList && msgList.length > 0) {
    //   msgList.map( o => {
    //     that.send(o.id, o.data)
    //   })
    // }
    //发送心跳，10秒一次
    heartTimer = setInterval(function () {
      that.send(constant.WS_CODE.HEART)
    }, 1000 * 10)
  },
  onmessage(e) {
    let result = e.data
    that.receive(result).then(res => {
      wsHandler.resolve(res.messageId, res.message)
    })
  },
  onclose(e) {
    console.log('ws 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
    // 断开心跳
    clearInterval(heartTimer)
    if (e.code === 1006 && !e.wasClean) {
      that.reconnection()
    }
  },
  onerror(event) {
    if (currentSwUrl !== event.target.url) {
      console.log('onerror: wsUrl不一样')
      return
    }
    console.log('重连')
    that.reconnection()
  },
  //重连
  reconnection() {
    count = count + 1
    //1与服务器已经建立连接
    if (count >= MAX) {
      this.reset()
      reconTime = 10000
      reconTimer = setTimeout(() => {
        this.reconnectSocket()
        count = 0;
      }, reconTime)
    } else {
      //3连接已关闭或者没有链接成功
      this.reset()
      reconTimer = setTimeout(() => {
        this.reconnectSocket();
      }, 2000)
    }
  },
  reconnectSocket() {
    try {
      this.reset()
      socketTag++
      const wsuri = `${websocketUrl}/?sid=${socketTag}`
      currentSwUrl = wsuri

      ws = new WebSocket(wsuri)
      ws.onopen = that.onopen
      ws.onmessage = that.onmessage
      ws.onclose = that.onclose
      ws.onerror = that.onerror
    } catch (e) {
      console.log('报错');
      console.log(e);
    }
  },
  reset() {
    this.clearTimer()
    if (ws) {
      ws.close()
      ws = null
    }
  },

  clearTimer() {
    if (heartTimer) {
      clearInterval(heartTimer)
      heartTimer = null
    }

    if (reconTimer) {
      clearTimeout(reconTimer)
      reconTimer = null
    }
  },
  // 发送消息
  send(messageId, message) {
    if (!window.WebSocket || !ws) {
      return false
    }
    if (ws.readyState != WebSocket.OPEN) {
      console.log('wx 已断，重连')
      // Toast({
      //   message: '重连中...请稍候!',
      //   position: 'center',
      //   duration: 2000
      // });
      this.reconnection()
      return
    }
    let msg_unit8
    let sendMsg
    let length = 0
    if (message) {
      msg_unit8 = apiFormat.stringToUint8Array(JSON.stringify(message))
      sendMsg = apiFormat.getWsAesString(msg_unit8, constant.API_KEY)
      length = sendMsg.length
    }
    let buf = new ArrayBuffer(8 + length);
    let dv = new DataView(buf);
    dv.setInt8(0, 0, false);
    dv.setInt8(1, -96, false);
    // 写入协议码
    dv.setUint16(2, messageId, false);
    // 写入内容体长度
    dv.setUint32(4, length, false);
    // 写入内容体
    for (let i = 0; i < length; i++) {
      dv.setUint8(i + 8, sendMsg[i]);
    }
    ws.send(buf);
  },

  // 接收消息
  receive(result) {
    if (!result || (!(result instanceof ArrayBuffer) && !(result instanceof Blob))) {
      console.log('ws error')
      return
    }
    return new Promise(async (resolve, reject) => {
      let reader = new FileReader()
      let content = result
      // 协议码
      let messageId = ''
      // 长度
      let messageLength = ''
      // 未解密内容体
      let message = ''
      // 已解密内容体
      let msgResp = ''
      reader.readAsArrayBuffer(content)
      reader.onload = await function (e) {
        let buff = reader.result
        let dv = new DataView(buff)
        messageId = dv.getUint16(2)
        messageLength = dv.getUint32(4)
        message = buff.slice(8)
        let content
        if (messageId !== 2000) {
          content = apiFormat.getWsDAesString(new Uint8Array(message), constant.API_KEY)
          msgResp = JSON.parse(apiFormat.uint8ArrayToString(content))
        } else {
          msgResp = {}
        }
        const data = {
          // 协议码
          messageId: messageId,
          // 内容体
          message: msgResp
        }
        resolve(data)
      }
    })
  }
}

export default websocket
