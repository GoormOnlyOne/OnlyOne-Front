import React, { useState } from 'react';

interface OtherChatMessageProps {
	profileImage?: string;
	username?: string;
	message: string;
	timestamp: string;
	showProfile?: boolean; // 연속된 메시지에서 프로필 표시 여부
	userId: number;
}

const OtherChatMessage: React.FC<OtherChatMessageProps> = ({
	profileImage = '/default-avatar.png',
	username = '사용자',
	message,
	timestamp,
	showProfile = true,
	userId
}) => {
	const [imageError, setImageError] = useState(false);

	return (
		<div className="flex items-start space-x-3 mb-4" data-user-id={userId}>
			{/* 프로필 이미지 - 연속 메시지가 아닐 때만 표시 */}
			<div className="flex-shrink-0">
				{showProfile ? (
					<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
						{!imageError && (
							<img
								src={profileImage}
								alt={username}
								className="w-full h-full object-cover"
								onLoad={() => setImageError(false)}
								onError={() => setImageError(true)}
							/>
						)}
						{imageError && (
							<div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm font-medium bg-gray-300 rounded-full">
								{username.charAt(0).toUpperCase()}
							</div>
						)}
					</div>
				) : (
					<div className="w-10 h-10" /> // 빈 공간 유지
				)}
			</div>

			{/* 메시지 내용 */}
			<div className="flex-1 max-w-xs sm:max-w-md">
				{/* 사용자명 - 연속 메시지가 아닐 때만 표시 */}
				{showProfile && (
					<div className="text-sm font-medium text-gray-700 mb-1">
						{username}
					</div>
				)}

				{/* 메시지 말풍선과 시간 */}
				<div className="flex items-end space-x-2">
					<div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-2 shadow-sm">
						<p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
							{message}
						</p>
					</div>

					{/* 시간 */}
					<div className="text-xs text-gray-500 flex-shrink-0">
						{timestamp}
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtherChatMessage;