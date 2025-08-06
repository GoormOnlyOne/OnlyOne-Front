import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 응답 타입
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// 에러 응답 타입
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // 요청 인터셉터
    this.instance.interceptors.request.use(
      config => {
        // 토큰이 있다면 헤더에 추가
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const originalRequest = error.config;

        // 401 에러 처리 (토큰 만료 등)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // 리프레시 토큰으로 새 액세스 토큰 받기
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.post('/auth/refresh', {
                refreshToken,
              });
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);

              // 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // 리프레시도 실패하면 AuthContext에 알려서 로그아웃 처리
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // AuthContext에 인증 오류 알림
            window.dispatchEvent(new CustomEvent('auth-error'));
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },3
    );
  }

  // GET 요청
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST 요청
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(
        url,
        data,
        config,
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH 요청
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.patch(
        url,
        data,
        config,
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE 요청
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete(
        url,
        config,
      );
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 에러 처리
  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message:
          error.response?.data?.message ||
          error.message ||
          '알 수 없는 오류가 발생했습니다.',
        status: error.response?.status,
        code: error.code,
      };
    }

    return {
      message: '알 수 없는 오류가 발생했습니다.',
    };
  }
}

// 싱글톤 인스턴스 생성 및 export
const apiClient = new ApiClient();
export default apiClient;

// 사용 예시:
/*
// 1. User 타입 정의
interface User {
  id: number;
  name: string;
  email: string;
}

// 2. GET 요청
const getUsers = async () => {
  try {
    const response = await apiClient.get<User[]>('/users');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

// 3. POST 요청
const createUser = async (userData: Omit<User, 'id'>) => {
  try {
    const response = await apiClient.post<User>('/users', userData);
    console.log('Created user:', response.data);
  } catch (error) {
    console.error(error);
  }
};

// 4. PATCH 요청
const updateUser = async (userId: number, updates: Partial<User>) => {
  try {
    const response = await apiClient.patch<User>(`/users/${userId}`, updates);
    console.log('Updated user:', response.data);
  } catch (error) {
    console.error(error);
  }
};

// 5. DELETE 요청
const deleteUser = async (userId: number) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    console.log('Deleted successfully');
  } catch (error) {
    console.error(error);
  }
};
*/
