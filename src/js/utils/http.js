import axios from 'axios'
import constant from './constant'
import apiFormat from './apiFormat'
import { md5Pwd, generateUUID } from './common'
import { storeData } from './store'

let baseUrl = constant.baseUrl

axios.defaults.withCredentials = true

// http request 拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

axios.interceptors.response.use(
  response => {
    if (response && response.status === 200) {
      return response.data
    } else {
      console.log('response', response)
      // alert('status error: ' + response.status)
      return false
    }
  },
  error => {
    console.log(error);
    return Promise.reject(error)
  }
)
const commonKey = constant.API_KEY

// 游客登录
function handleVisitorLogin() {
  storeData.userInfo = ''
  storeData.sessionId = md5Pwd(generateUUID())
  // 初始化 ws
  // websocket.send(constant.WS_CODE.LOGIN, {
  //   key: res.sessionId,
  //   plat: 4,
  //   version: 1,
  // })
}

function getSessionId() {
  storeData.sessionId = md5Pwd(generateUUID())
  return storeData.sessionId
}

const post = async (url, data = {}) => {
  if (!storeData.sessionId && url !== '/login/login') {
    await handleVisitorLogin()
  }
  const sessionInfo = {
    sessionId: storeData.sessionId ? storeData.sessionId : getSessionId(),
    platId: 4,
    appVer: 100,
    params: data
  }
  console.log('基本传参：', data)
  const params = apiFormat.initByte(`${JSON.stringify(sessionInfo)}`, commonKey)
  return axios({
    method: 'post',
    baseURL: baseUrl,
    url,
    responseType: 'blob',
    timeout: 30000,
    data: params,
    headers: {
      'Content-Type': 'application/json charset=utf-8'
    },
  }).then(async res => {
    const jsonData = await apiFormat.initJson(res, commonKey)
    console.log(jsonData);
    if(jsonData.code == 200 ) {
      return jsonData
    }else if(jsonData.code == 101 ) {
      storeData.userInfo = ''
      storeData.sessionId = md5Pwd(generateUUID())
      storeData.isLogin = 0
      window.location.replace(window.location.origin + '/login/index.html')
    } else {
      $.hidePreloader()
      $.toast(jsonData.message, 3000, 'error')
      return false
    }
  }).catch(err => {
    return Promise.reject(err)
  })
}

export default {
  post
}
