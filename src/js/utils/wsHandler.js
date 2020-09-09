import constant from './constant'
import {
  Toast
} from './components'

let wsHandler = {
  // 处理 ws 返回的内容
  resolve(messageId, message) {
    const WS_CODE = constant.WS_CODE
    if (messageId != WS_CODE.HEART_SUCCESS) {
      console.log('receive messageId', messageId)
      console.log('receive message', message)
    }
    switch (messageId) {
      // 心跳成功
      case WS_CODE.HEART_SUCCESS: {
        console.log('心跳返回')
        break
      }
      // 错误
      case WS_CODE.ERROR: {
        console.log('ws error, errCode:' + message.errCode + ', errMsg:' + message.errMsg)
        Toast({
          message: message.errMsg,
          position: 'middle',
          duration: 2000
        });
        break
      }
    }

  }

}
export {
  wsHandler
}