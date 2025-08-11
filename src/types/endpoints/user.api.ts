export interface MyPageResponse {
  nickname: string;
  profile_image: string;
  city: string;
  district: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  interests_list: string[];
  balance: number;
}

export interface ProfileResponse {
  userId: string;
  nickname: string;
  birth: string;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage: string;
  gender: 'MALE' | 'FEMALE';
  city: string;
  district: string;
  interestsList: string[];
}

export interface ProfileUpdateRequest {
  userId: string;
  nickname: string;
  birth: string;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage: string;
  gender: 'MALE' | 'FEMALE';
  city: string;
  district: string;
  interestsList: string[];
}

export interface MyPageApiEndpoints {
  getMyPage: () => Promise<MyPageResponse>;
  getUserProfile: () => Promise<ProfileResponse>;
  updateUserProfile: (data: ProfileUpdateRequest) => Promise<void>;
}
