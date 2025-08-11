import apiClient from './client';
import type {
  MyPageResponse,
  ProfileResponse,
  ProfileUpdateRequest,
} from '../types/endpoints/user.api';

export const getMyPage = async (): Promise<MyPageResponse> => {
  const response = await apiClient.get<MyPageResponse>('/users/mypage');
  return response.data;
};

export const getUserProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/users/profile');
  return response.data;
};

export const updateUserProfile = async (
  data: ProfileUpdateRequest,
): Promise<void> => {
  await apiClient.put('/users/profile', data);
};
