import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileImageUpload from '../../components/common/ProfileImage';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { withdrawUser } from '../../api/auth';
import { getMyPage } from '../../api/user';
import type { MyPageResponse } from '../../types/endpoints/user.api';
import { getInterestsInfo } from '../../utils/interest';
import Loading from '../../components/common/Loading';

export const Mypage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userInfo, setUserInfo] = useState<MyPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogout, setIsLogout] = useState(false);
  const [isWithdraw, setIsWithdraw] = useState(false);

  // 마이페이지 데이터 조회
  useEffect(() => {
    const fetchMyPageData = async () => {
      try {
        const data = await getMyPage();
        setUserInfo(data);
      } catch (error) {
        console.error('마이페이지 데이터 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, []);

  // 로그아웃 버튼
  const onClickLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLogout(true);
  };
  const handleCancelLogout = () => {
    console.log('로그아웃을 취소했습니다.');
    setIsLogout(false);
  };
  const handleConfirmLogout = async () => {
    try {
      console.log('로그아웃을 했습니다.');
      await logout();
      setIsLogout(false);
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다:', error);
      setIsLogout(false);
    }
  };

  // 탈퇴하기 버튼
  const onClickWithdraw = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsWithdraw(true);
  };
  const handleCancelWithdraw = () => {
    console.log('탈퇴하기를 취소했습니다.');
    setIsWithdraw(false);
  };
  const handleConfirmWithdraw = async () => {
    try {
      await withdrawUser();
      console.log('회원 탈퇴가 완료되었습니다.');
      await logout();
      setIsWithdraw(false);
      navigate('/login');
    } catch (error) {
      console.error('회원 탈퇴 중 오류가 발생했습니다:', error);
      setIsWithdraw(false);
    }
  };

  // 나이 계산 함수
  const calculateAge = (birth: string) => {
    const birthYear = parseInt(birth.substring(0, 4));
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1;
  };

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <Loading overlay text="로딩 중..." />
      </div>
    );
  }

  // 사용자 정보가 없을 때
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">사용자 정보를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 섹션 */}
      <div className="px-4 bg-white pb-4">
        <div className="flex flex-col items-center py-8">
          {/* 프로필 이미지 */}
          <ProfileImageUpload
            maxSizeInMB={5}
            editable={false}
            defaultImage={userInfo.profile_image}
          />

          {/* 사용자 정보 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {userInfo.nickname}
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            {userInfo.city} {userInfo.district} ·{' '}
            {userInfo.gender === 'MALE' ? '남성' : '여성'} ·{' '}
            {calculateAge(userInfo.birth)}세
          </p>

          {/* 관심사 태그 */}
          <div className="flex flex-wrap justify-center gap-2">
            {getInterestsInfo(userInfo.interests_list).map(
              (interest, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${interest.bgColor} ${interest.textColor}`}
                >
                  <i className={`${interest.icon} text-sm`} />
                  {interest.label}
                </span>
              ),
            )}
          </div>
        </div>

        {/* 포인트 섹션 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="py-6 px-6 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-800 leading-snug">
                보유 포인트
              </h3>
              <h3 className="text-base font-semibold text-gray-800 leading-snug">
                {userInfo.balance.toLocaleString()} P
              </h3>
            </div>

            {/* 충전하기 버튼 */}
            <Link
              to="/payment/charge"
              className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-sm
              px-6 py-2 rounded-full
              hover:from-brand-secondary hover:to-brand-primary transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-1"
            >
              <i className="ri-coins-line text-lg"></i>
              <span>충전하기</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 메뉴 섹션 */}
      <div className="bg-white mt-2">
        <div className="px-4 py-6">
          <div className="divide-y divide-gray-100">

            {/* @TODO: MVP에서 안보여줌 */}
            {/* <Link
              to="/mypage/interest"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-heart-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  관심 모임
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link> */}

            <Link
              to="/mypage/profile"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-edit-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  프로필 수정하기
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>

            <Link
              to="/mypage/wallet"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-file-list-3-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  정산내역 확인하기
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>
            <Link
              to="/mypage/my-meetings"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-group-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  내 모임 보기
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>
            <button
              onClick={onClickLogout}
              className="w-full flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-delete-bin-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  로그아웃
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>

            <button
              onClick={onClickWithdraw}
              className="w-full flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-logout-circle-r-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">
                  탈퇴하기
                </span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <Modal
        isOpen={isLogout}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="로그아웃 하시겠습니까?"
      />
      <Modal
        isOpen={isWithdraw}
        onClose={handleCancelWithdraw}
        onConfirm={handleConfirmWithdraw}
        title="계정을 탈퇴하시겠습니까?"
      />
    </div>
  );
};

export { Mypage as default } from './Mypage';
