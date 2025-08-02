import { useState } from "react";
import "tailwindcss";
import Navigation from '../../components/common/Navigation';
import Modal from "../../components/common/Modal";
import ProfileImageUpload, { type ProfileImage } from "../../components/common/ProfileImage";
import OtherChatMessage from "../../components/domain/chat/OtherChatMessage";
import DefaultImage from "../../assets/user_profile.jpg";
import MyChatMessage from "../../components/domain/chat/MyChatMessage";
import AddressSelector, { type AddressData } from "../../components/common/AddressSelector";
import TabBar from "../../components/common/TabBar";
import type { TabItem } from "../../components/common/TabBar";
import ChatRoomList, { type ChatRoom } from "../../components/domain/chat/ChatRoomList";
import ScheduleList from "../../components/domain/meeting/ScheduleList";
import ParticipantInfo from "../../components/domain/meeting/ParticipantInfo";

export const ComponentGallery = () => {
	// 모달
	const [isDefaultModalOpen, setIsDefaultModalOpen] = useState(true);

	const handleCancel = () => {
		console.log('취소 버튼을 눌렀습니다.');
		setIsDefaultModalOpen(false);
	};

	const handleConfirm = () => {
		console.log('확인 버튼을 눌렀습니다.');
		setIsDefaultModalOpen(false);
	};

	// 이미지
	const handleImageSelect = (image: ProfileImage) => {
		console.log(`이미지가 선택되었습니다: ${image.name}`);
	}

	const handleImageRemove = () => {
		console.log('이미지가 제거되었습니다');
	};

	// 주소
	const [address, setAddress] = useState<AddressData>({
		city: "",
		district: "",
		isComplete: false
	});

	const handleAddressChange = (address: AddressData) => {
		setAddress(address);
		console.log(address);
	}


	// 채팅방 더미 데이터
	const dummyChatRooms: ChatRoom[] = [
		{
			id: 1,
			type: 'CLUB',
			name: '한강 러닝 크루',
			lastMessage: '오늘 모임 어떠셨나요? 다들 수고하셨습니다!',
			lastMessageTime: new Date('2024-01-15T14:30:00'),
			memberCount: 25,
			unreadCount: 3
		},
		{
			id: 2,
			type: 'SCHEDULE',
			name: '1월 20일 북한산 등반',
			lastMessage: '날씨가 좋을 것 같네요. 준비물 챙겨주세요~',
			lastMessageTime: new Date('2024-01-15T12:15:00'),
			memberCount: 8,
			unreadCount: 0
		},
		{
			id: 3,
			type: 'CLUB',
			name: '요리 클래스',
			lastMessage: '다음 주 메뉴 투표 올렸어요!',
			lastMessageTime: new Date('2024-01-15T10:45:00'),
			memberCount: 15,
			unreadCount: 7
		},
		{
			id: 4,
			type: 'SCHEDULE',
			name: '1월 25일 와인 테이스팅',
			lastMessage: '장소가 변경되었습니다. 확인해주세요.',
			lastMessageTime: new Date('2024-01-14T16:20:00'),
			memberCount: 12,
			unreadCount: 1
		}
	];

	const handleChatRoomClick = (chatRoom: ChatRoom) => {
		console.log(`채팅방 클릭!! id: ${chatRoom.id} name: ${chatRoom.name}`);
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

			{/* 채팅방 리스트 */}
			<ChatRoomList
				chatRooms={dummyChatRooms}
				onChatRoomClick={handleChatRoomClick}
			/>

			{/* 일정 리스트 */}
			<ScheduleList />

			{/* 참여 현황 리스트 */}
			<ParticipantInfo
				nickname="홍길동"
				profileImage={DefaultImage}
			/>
			<ParticipantInfo
				nickname="김철수"
				profileImage={null}
			/>
			<ParticipantInfo
				nickname="이영희"
				profileImage={DefaultImage}
			/>
			<ParticipantInfo
				nickname="박민수"
				profileImage={null}
			/>

			{/* 정산 현황 리스트 */}

			<ParticipantInfo
				nickname="홍길동"
				profileImage={DefaultImage}
				settlementStatus="REQUESTED"
			/>
			<ParticipantInfo
				nickname="김철수"
				profileImage={null}
				settlementStatus="COMPLETED"
			/>
			<ParticipantInfo
				nickname="이영희"
				profileImage={DefaultImage}
				settlementStatus="FAILED"
			/>
			<ParticipantInfo
				nickname="박민수"
				profileImage={null}
				settlementStatus="REQUESTED"
			/>
		</div>
	);
};