import axios from 'axios';
import { Message, MessageBox } from 'element-ui';
import store from '../store';
import router from '../router';

// 创建axios实例
const service = axios.create({
  timeout: 5000 // 请求超时时间
});

// request拦截器
service.interceptors.request.use(config => {
   return config;
}, error => {
  // Do something with request error
  console.log(error); // for debug
  Promise.reject(error);
});

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (!res.success) {
      if (res.code === 100602 || res.msg === 'token已过期') { //exchangeToken接口没有code，只有msg
        if (router.history.current.path !== '/login') {
          MessageBox.confirm('Token 过期了，您可以取消继续留在该页面，或者重新登录', '确定登出', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            store.dispatch('FedLogOut').then(() => {
              router.push('/login');
              //location.reload();// 为了重新实例化vue-router对象 避免bug
            });
          });
        }
      } else if (res.msg === '120') {
        // 报120时，统一登录平台标志
      } else {
        Message({
          message: res.msg,
          type: 'error',
          duration: 1500
        });
      }
      return Promise.reject(res);
    } else {
      return response.data;
    }
  },
  error => {
    console.log(error.response);// for debug
    error.message = error.message === 'timeout of 5000ms exceeded' ? '连接服务器超时！' : error.message;
    Message({
      message: error.message || error.msg,
      type: 'error',
      duration: 1500
    });
    return Promise.reject(error);
  }
);

export default service;
