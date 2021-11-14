
import axios from 'axios'
import { Message } from 'element-ui'
 
// create an axios instance
const service = axios.create({
  baseURL: '/api',
  timeout: 80000 // request timeout
})

// export function request(config) {
//   return new Promise((resolve, reject) => {
//       //创建axios实例
//       const instance = axios.creat({
//           baseURL: '',
//           timeout: 50000
//       })
//       //发送真正的网络请求
//       instance(config)
//           .then(res => {
//               // console.log(res) //要回调出去
//               resolve(res) //回调
//           })
//           .catch(err => {
//               // console.log(err) //要回调出去
//               reject(err) //回调
//           })
//   })
// }
 
// request interceptor
service.interceptors.request.use(
 
  config => {
    // Do something before request is sent
    // if (token) {
    //   // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
    //   config.headers.Authorization = token 
      
    // }
    return config
  },
  error => {
    // Do something with request error
    // console.log("出错啦",error) // for debug
    Promise.reject(error)
  }
)
 
// response interceptor
service.interceptors.response.use(
  response => response,
 
  error => {
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)
 
export default service