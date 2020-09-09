import http from './http'
import constant from './constant'
import axios from 'axios'
// import websocket from './websocket'
export default {
  // test
  test: params => http.post('/test/index', params),
}
