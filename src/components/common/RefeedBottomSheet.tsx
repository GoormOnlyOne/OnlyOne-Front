import { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import userProfile from '../../assets/user_profile.jpg';
import apiClient from '../../api/client';
import { showApiErrorToast } from './Toast/ToastProvider';
import { type Meeting } from '../domain/meeting/MeetingCard';

interface RefeedBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (selectedClub: Meeting, content: string) => void;
	feedId: number | null;
}

export const RefeedBottomSheet = ({
	isOpen,
	onClose,
	onConfirm,
	feedId,
}: RefeedBottomSheetProps) => {
	const [myClubs, setMyClubs] = useState<Meeting[]>([]);
	const [clubsLoading, setClubsLoading] = useState(false);
	const [selectedClub, setSelectedClub] = useState<Meeting | null>(null);
	const [refeedContent, setRefeedContent] = useState('');

	useEffect(() => {
		if (isOpen && feedId) {
			loadMyClubs();
		}
	}, [isOpen, feedId]);

	const loadMyClubs = async () => {
		try {
			setClubsLoading(true);
			const response = await apiClient.get('/search/user');
			const clubsData = response.data || [];
			setMyClubs(clubsData);
		} catch (error) {
			console.error('내 모임 목록 로드 실패:', error);
			setMyClubs([]);
		} finally {
			setClubsLoading(false);
		}
	};

	const handleClubSelect = (club: Meeting) => {
		setSelectedClub(club);
	};

	const handleConfirm = () => {
		if (selectedClub) {
			onConfirm(selectedClub, refeedContent);
		}
	};

	const handleClose = () => {
		setSelectedClub(null);
		setMyClubs([]);
		setRefeedContent('');
		onClose();
	};

	return (
		<BottomSheet
			isOpen={isOpen}
			onClose={handleClose}
			title="리피드할 모임 선택"
			maxHeight="80vh"
		>
			<div className="flex flex-col h-full">
				<div className="flex-1 overflow-y-auto">
					{clubsLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
							<div className="text-gray-500">내 모임을 불러오는 중...</div>
						</div>
					) : myClubs.length > 0 ? (
						<div className="p-4 space-y-3">
							<div className="text-sm text-gray-600 mb-4">
								리피드할 내 모임을 선택해주세요
							</div>
							{myClubs.map(club => (
								<div
									key={club.clubId}
									onClick={() => handleClubSelect(club)}
									className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
										selectedClub?.clubId === club.clubId
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:bg-gray-50'
									}`}
								>
									<div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
										{club.image ? (
											<img
												src={club.image}
												className="w-full h-full object-cover"
												alt={club.name}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<i className="ri-group-line text-xl text-gray-400"></i>
											</div>
										)}
									</div>

									<div className="flex-1">
										<div className="font-medium text-gray-900">
											{club.name}
										</div>
										<div className="text-sm text-gray-500">
											멤버 {club.memberCount}명
										</div>
									</div>

									<div className="w-5 h-5 flex-shrink-0">
										<div
											className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
												selectedClub?.clubId === club.clubId
													? 'border-blue-500 bg-blue-500'
													: 'border-gray-300 bg-white'
											}`}
										>
											{selectedClub?.clubId === club.clubId && (
												<div className="w-2 h-2 bg-white rounded-full"></div>
											)}
										</div>
									</div>
								</div>
							))}

							<div className="mt-6 pt-4 border-t border-gray-200">
								<div className="mb-3">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										리피드 메시지 (선택사항)
									</label>
									<textarea
										value={refeedContent}
										onChange={e => setRefeedContent(e.target.value)}
										placeholder="이 피드에 대한 생각을 공유해보세요..."
										className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										rows={3}
										maxLength={300}
									/>
									<div className="text-right text-xs text-gray-500 mt-1">
										{refeedContent.length}/300
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="text-center py-12">
							<i className="ri-group-line text-5xl text-gray-300 mb-4"></i>
							<div className="text-lg font-medium text-gray-600 mb-2">
								가입한 모임이 없습니다
							</div>
							<div className="text-sm text-gray-400">
								모임에 가입한 후 다른 모임으로 리피드해보세요
							</div>
						</div>
					)}
				</div>

				{myClubs.length > 0 && (
					<div className="p-4 border-t bg-white">
						<button
							onClick={handleConfirm}
							disabled={!selectedClub}
							className={`w-full py-3 rounded-lg font-medium transition-colors ${
								selectedClub
									? 'bg-blue-500 text-white hover:bg-blue-600'
									: 'bg-gray-200 text-gray-400 cursor-not-allowed'
							}`}
						>
							{selectedClub
								? `"${selectedClub.name}"으로 리피드하기`
								: '모임을 선택해주세요'}
						</button>
					</div>
				)}
			</div>
		</BottomSheet>
	);
};