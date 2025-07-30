import { useState } from "react";
import "tailwindcss";
import Navigation from '../../components/common/Navigation';
import Modal from "../../components/common/Modal";
import ProfileImageUpload, {type ProfileImage} from "../../components/common/ProfileImage";

export const ComponentGallery = () => {
  // 모달 상태 관리
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(true);

  const handleCancel = () => {
    alert('취소 버튼을 눌렀습니다.');
    setIsDefaultModalOpen(false);
  };

  const handleConfirm = () => {
    alert('확인 버튼을 눌렀습니다.');
    setIsDefaultModalOpen(false);
  };

  const handleImageSelect = (image: ProfileImage) => {
    alert(`이미지가 선택되었습니다: ${image.name}`);
  } 
  
  const handleImageRemove = () => {
    alert('이미지가 제거되었습니다');
  };

  return (
    <div>
      <h1>공통 컴포넌트 테스트 용 페이지</h1>

      {/* 공통 컴포넌트 나열 */}

      <Navigation />

      <div className="bg-blue-500 text-white p-4">
        테스트
      </div>

      {/* 모달 */}
      <Modal
        isOpen={isDefaultModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="건강한 산책 모임 탈퇴하시겠습니까?"
      /> 

      <button 
        title="메롱" 
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => alert('메롱!')}
      >
        버튼
      </button>

      {/* 프로필 이미지 업로드 테스트 */}
      <ProfileImageUpload 
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        maxSizeInMB={5}
      />
    </div>
  );
};

export { ComponentGallery as default } from './ComponentGallery';