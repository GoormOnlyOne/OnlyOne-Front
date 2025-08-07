import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProfileImageUpload from '../../components/common/ProfileImage';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';

export const Mypage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const userInfo = {
    nickname: '별명',
    gender: '지역(시/도) · 성별/연령 · 성별',
    interests: ['관심사 1', '관심사 2', '관심사 3'],
    balance: '5000',
  };

  const [isLogout, setIsLogout] = useState(false);
  const [isWithdraw, setIsWithdraw] = useState(false);

  // 로그아웃 버튼
  const onClickLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLogout(true);
  };
  const handleCancelLogout = () => {
    console.log('로그아웃을 취소했습니다.');
    setIsLogout(false);
  };
  const handleConfirmLogout = () => {
    console.log('로그아웃을 했습니다.');
    logout(); // AuthContext의 logout 함수 호출
    setIsLogout(false);
    navigate('/login'); // 로그인 페이지로 리다이렉션
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
  const handleConfirmWithdraw = () => {
    console.log('탈퇴하기를 했습니다.');
    setIsWithdraw(false);
  };

  // // 충전하기 버튼
  // const onClickCharge = () => {
  //   console.log('충전하기를 했습니다.');
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 섹션 */}
      <div className="px-4 bg-white pb-4">
        <div className="flex flex-col items-center py-8">
          {/* 프로필 이미지 */}
          <ProfileImageUpload maxSizeInMB={5} editable={false} />

          {/* 사용자 정보 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {userInfo.nickname}
          </h2>
          <p className="text-sm text-gray-600 mb-3">{userInfo.gender}</p>

          {/* 관심사 태그 */}
          <div className="flex flex-wrap justify-center gap-2">
            {userInfo.interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* 포인트 섹션 */}
        <div className="mb-4 mx-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
          <div className="py-6 px-6 flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-base font-semibold text-gray-800 leading-snug">
                보유 포인트
              </h3>
              <h3 className="text-base font-semibold text-gray-800 leading-snug">
                {userInfo.balance} P
              </h3>
            </div>

            {/* 충전하기 버튼 */}
            <Link
              to="/payment/charge"
              className="bg-blue-500 text-white text-sm px-6 py-2 rounded-full hover:bg-blue-700 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-1"
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
            <Link
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
            </Link>

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

                 {/* 여기서 내 모임 보기 버튼 추가 */}
             <Link
                to="/mypage/my-meetings"
        className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
        <div className="flex items-center">
          {/* 아이콘은 리액트 아이콘 또는 리믹스아이콘 등 원하는 것으로 교체하세요 */}
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
