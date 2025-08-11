declare global {
  interface Window {
    Kakao: any;
  }
}

export const initKakao = () => {
  const kakaoKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoKey);
    console.log('Kakao SDK initialized~:', window.Kakao.isInitialized());
  }
};

export const kakaoLogin = () => {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

  console.log('카카오 로그인 URL:', kakaoAuthUrl);

  window.location.href = kakaoAuthUrl;
};
