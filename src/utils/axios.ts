import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// TRẠM KIỂM SOÁT ĐẦU RA (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Local Storage
    const token = localStorage.getItem('token');
    
    // Nếu có token, tự động gắn vào Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// TRẠM KIỂM SOÁT ĐẦU VÀO (Response Interceptor)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu BE báo lỗi 401 (Hết hạn Token hoặc Token giả), tự động đuổi ra ngoài
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default api;