import apiClient from './client';
import type { ApiResponse } from './client';

// 회원가입 요청 데이터 타입
export interface SignupRequest {
  nickname: string;
  birth: string; // yyyy-MM-dd 형식
  gender: 'MALE' | 'FEMALE';
  profileImage?: string;
  city: string;
  district: string;
  categories: string[];
}

// 회원가입 응답 데이터 타입
export interface SignupResponse {
  userId: number;
  nickname: string;
  message: string;
}

// 회원가입 API 호출
export const signup = async (signupData: SignupRequest): Promise<ApiResponse<SignupResponse>> => {
  return await apiClient.post<SignupResponse>('/auth/signup', signupData);
};

// 로그아웃 API 호출
export const logoutUser = async (): Promise<ApiResponse<null>> => {
  return await apiClient.post<null>('/auth/logout');
};

type UserStatus = 'GUEST' | 'ACTIVE' | 'INACTIVE';

// 현재 사용자 정보 조회 API 호출
export const getCurrentUser = async (): Promise<ApiResponse<{
  userId: number;
  kakaoId: number;
  nickname: string;
  status: UserStatus;
  profileImage: string;
}>> => {
  return apiClient.get<{
    userId: number;
    kakaoId: number;
    nickname: string;
    status: UserStatus;
    profileImage: string;
  }>('/auth/me');
};

// 회원 탈퇴 API 호출
export const withdrawUser = async (): Promise<ApiResponse<null>> => {
  return await apiClient.post<null>('/auth/withdraw');
};