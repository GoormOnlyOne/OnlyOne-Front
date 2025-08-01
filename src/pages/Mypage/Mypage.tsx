import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProfileImageUpload from '../../components/common/ProfileImage';
import Modal from '../../components/common/Modal';

export const Mypage = () => {
  const userInfo = {
    nickname: "별명",
    gender: "지역(시/도) · 성별/연령 · 성별",
    interests: ["관심사 1", "관심사 2", "관심사 3"]
  };

  // 임시 포인트 데이터
  const userPoints = 15000;

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
    setIsLogout(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 프로필 섹션 */}
      <div className="px-4 bg-white">
        <div className="flex flex-col items-center py-8">
          {/* 프로필 이미지 */}
          <ProfileImageUpload
            maxSizeInMB={5}
            editable={false}
          />

          {/* 사용자 정보 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{userInfo.nickname}</h2>
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
      </div>

      {/* 포인트 섹션 */}
      <div className="bg-white mt-2">
        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <i className="ri-coin-line text-2xl text-blue-600 mr-2"></i>
                  <h3 className="text-lg font-semibold text-gray-800">보유 포인트</h3>
                </div>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-blue-600">
                    {userPoints.toLocaleString()}
                  </span>
                  <span className="text-lg text-gray-600 ml-1">P</span>
                </div>
              </div>
              <Link
                to="/wallet"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg flex items-center"
              >
                <i className="ri-add-circle-line text-lg mr-2"></i>
                충전하기
              </Link>
            </div>
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
                <span className="text-base text-gray-900 font-medium">관심 모임</span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>

            <Link
              to="/mypage/profile"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-edit-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">프로필 수정하기</span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>

            <Link
              to="/mypage/settlement"
              className="flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-file-list-3-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">정산내역 확인하기</span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </Link>

            <button
              onClick={onClickLogout}
              className="w-full flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-delete-bin-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">로그아웃</span>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>

            <button
              onClick={onClickWithdraw}
              className="w-full flex items-center justify-between py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center">
                <i className="ri-logout-circle-r-line text-xl text-gray-700 mr-3"></i>
                <span className="text-base text-gray-900 font-medium">탈퇴하기</span>
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