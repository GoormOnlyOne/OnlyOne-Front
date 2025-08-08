import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import apiClient from '../../../api/client';
import Modal from '../../common/Modal';

interface Meeting {
	clubId: number;
	name: string;
	description: string;
	interest: string;
	district: string;
	memberCount: number;
	image: string;
	joined: boolean;
}

interface MeetingCardProps {
	meeting: Meeting;
	onJoinSuccess?: (clubId: number) => void;
}

export default function MeetingCard({ meeting, onJoinSuccess }: MeetingCardProps) {
	const navigate = useNavigate();
	const [isJoining, setIsJoining] = useState(false);
	const [showJoinModal, setShowJoinModal] = useState(false);

	const handleMeetingClick = () => {
		if (showJoinModal) return;
		navigate(`/meeting/${meeting.clubId}`);
	};

	const handleJoinClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isJoining) { // 이미 가입 중
			return;
		}
		setShowJoinModal(true);
	};

	const handleConfirmJoin = async () => {
		setIsJoining(true);
		setShowJoinModal(false);

		try {
			const response = await apiClient.get(`/clubs/${meeting.clubId}/join`);

			if (response.success) {
				// 가입 성공 시 상위 컴포넌트에 알림
				if (onJoinSuccess) {
					onJoinSuccess(meeting.clubId);
				}

				// 모임 상세 페이지로 이동
				navigate(`/meeting/${meeting.clubId}`);
			}
		} catch (error: any) {
			console.error('가입 실패:', error);

			// API 에러 메시지 표시
			const errorMessage = error?.data?.message || '모임 가입에 실패했습니다.';
			alert(errorMessage);
		} finally {
			setIsJoining(false);
		}
	};

	return (
		<div
			className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
			onClick={handleMeetingClick}
		>
			<div className="relative">
				<img
					src={meeting.image}
					alt={meeting.name}
					className="w-full h-48 object-cover"
				/>
				<span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
					{meeting.interest}
				</span>
				<button
					className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full hover:bg-white transition-colors"
					onClick={e => {
						e.stopPropagation();
					}}
				>
					<i className="ri-heart-line text-gray-600"></i>
				</button>
			</div>

			<div className="p-4">
				<h3 className="font-semibold text-gray-800 mb-2">
					{meeting.name}
				</h3>
				<p className="text-sm text-gray-600ㅡ mb-3 line-clamp-2">
					{meeting.description}
				</p>

				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<div className="flex items-center text-sm text-gray-600">
							<i className="ri-map-pin-line mr-2"></i>
							<span>{meeting.district}</span>
						</div>

						<div className="flex items-center text-sm text-gray-600">
							<i className="ri-group-line mr-2"></i>
							<span>멤버 {meeting.memberCount}명</span>
						</div>
					</div>

					{!meeting.joined && (
						<button
							onClick={handleJoinClick}
							disabled={isJoining}
							className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isJoining ? '가입중...' : '가입하기'}
						</button>
					)}
					{meeting.joined && (
						<div className="flex items-center text-sm text-green-600 font-medium">
							<i className="ri-check-line mr-1"></i>
							가입됨
						</div>
					)}
				</div>
			</div>

			{/* 가입 확인 모달 */}
			<Modal
				isOpen={showJoinModal}
				onClose={() => setShowJoinModal(false)}
				onConfirm={handleConfirmJoin}
				title={`"${meeting.name}" \n가입하시겠습니까?`}
				cancelText="취소"
				confirmText="가입하기"
			/>
		</div>
	);
}