import apiClient from './client';
import type { MyPageResponse } from '../types/endpoints/user.api';

export const getMyPage = async (): Promise<MyPageResponse> => {
  const response = await apiClient.get<MyPageResponse>('/users/mypage');
  return response.data;
};