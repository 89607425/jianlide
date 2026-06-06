/** Axios HTTP客户端实例配置 */

import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jianlida_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
client.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data.code !== 0) {
      // 业务错误
      if (data.code === 2003) {
        // Token过期，跳转登录
        localStorage.removeItem('jianlida_token');
        localStorage.removeItem('jianlida_user');
        window.location.href = '/';
      }
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jianlida_token');
      localStorage.removeItem('jianlida_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default client;
