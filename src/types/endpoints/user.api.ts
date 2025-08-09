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

export interface MyPageApiEndpoints {
  getMyPage: () => Promise<MyPageResponse>;
}