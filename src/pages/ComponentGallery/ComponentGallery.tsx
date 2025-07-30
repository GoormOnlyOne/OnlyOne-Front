import { useState } from "react";
import "tailwindcss";
import Navigation from '../../components/common/Navigation';
import Modal from "../../components/common/Modal";
import ProfileImageUpload, { type ProfileImage } from "../../components/common/ProfileImage";
import OtherChatMessage from "../Chat/OtherChatMessage";
import DefaultImage from "../../assets/user_profile.jpg";
import MyChatMessage from "../Chat/MyChatMessage";
import AddressSelector, { type AddressData } from "../../components/common/AddressSelector";

export const ComponentGallery = () => {
  // 모달
  const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(true);

  const handleCancel = () => {
    alert('취소 버튼을 눌렀습니다.');
    setIsDefaultModalOpen(false);
  };

  const handleConfirm = () => {
    alert('확인 버튼을 눌렀습니다.');
    setIsDefaultModalOpen(false);
  };

  // 이미지
  const handleImageSelect = (image: ProfileImage) => {
    alert(`이미지가 선택되었습니다: ${image.name}`);
  }

  const handleImageRemove = () => {
    alert('이미지가 제거되었습니다');
  };

  // 주소
  const [address, setAddress] = useState<AddressData>({
    city: "",
    district: "",
    isComplete: false
  });

  const handleAddressChange = (newAddress: AddressData) => {
    setAddress(newAddress);
    console.log('선택된 주소: ', newAddress);
  }

  const handleAddressSubmit = () => {
    if(address.isComplete) {
      console.log(`선택된 주소: ${address.city} ${address.district}`);
    } else {
      console.log('시/도, 시/군/구를 모두 선택해주세요');
    }
  }
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

      {/* 상대방이 보낸 채팅 메시지 테스트 */}
      <OtherChatMessage
        profileImage={DefaultImage}
        username='다른 사용자'
        message='ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ채팅입니다.'
        timestamp={new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
        showProfile={true}
        userId={2}
      />
      <OtherChatMessage
        profileImage={DefaultImage}
        username='다른 사용자'
        message='ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ채팅입니다.'
        timestamp={new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
        showProfile={false}
        userId={2}
      />

      {/* 내가 보낸 채팅 메시지 */}
      <MyChatMessage
        message="이거는 내채팅이여~~~~~~~~~~~~~~~~~~~~~~~~~~~~~👍ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ"
        timestamp={new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
        isRead={false}
        userId={1}
      />

      {/* 주소 선택 */}
      <AddressSelector 
        onAddressChange={handleAddressChange}
        initialCity="서울"
        initialDistrict="종로구"
        className="mb-4"
      />
    </div>
  );
};
