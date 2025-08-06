import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 응답 타입
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  success: boolean;
}

// 에러 응답 타입
export interface ApiError {
  success: false;
  data: ApiErrorPayload;
  status?: number;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  validation: any;
}

type ErrorHandler = (err: ApiError) => void;

class ApiClient {
  private instance: AxiosInstance;
  private onError?: ErrorHandler;

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
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const refreshRes = await this.post<{ accessToken: string }>(
                '/auth/refresh',
                { refreshToken },
              );
              if (refreshRes.success) {
                const newToken = refreshRes.data.accessToken;
                localStorage.setItem('accessToken', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.instance(originalRequest);
              }
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
      },
    );
  }

  // GET 요청
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      // AxiosResponse<ApiResponse<T>>
      const response = await this.instance.get<ApiResponse<T>>(url, config);
      // response.data 는 ApiResponse<T> 형태
      return response.data;
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
      const response = await this.instance.post<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
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
      const response = await this.instance.patch<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
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
      const response = await this.instance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // 에러 처리
  public setErrorHandler(fn: ErrorHandler) {
    this.onError = fn;
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error) && error.response?.data) {
      const payload = error.response.data as {
        success: boolean;
        data: ApiErrorPayload;
      };
      return {
        success: false,
        data: payload.data,
        status: error.response.status,
      };
    }
    return {
      success: false,
      data: {
        code: 'UNKNOWN_ERROR',
        message: '알 수 없는 오류가 발생했습니다.',
        validation: null,
      },
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
