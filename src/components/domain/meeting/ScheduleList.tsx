import { useState } from 'react';

export interface Schedule {
	scheduleId: number;
	name: string;
	status: string;
	scheduleTime: string;
	cost: number;
	userLimit: number;
	userCount: number;
	joined: boolean;
	leader: boolean;
	dday: string;
}

interface ScheduleListResponse {
	success: boolean;
	data: Schedule[];
}

const mockScheduleData: Schedule[] = [
	{
		scheduleId: 1,
		name: '남산 아침 등산 모임',
		status: 'READY',
		scheduleTime: '2025-07-28T09:09:25.404',
		cost: 1000,
		userLimit: 20,
		userCount: 15,
		joined: true,
		leader: true,
		dday: 'D-1'
	},
	{
		scheduleId: 2,
		name: '책모임: 어린 왕자 함께 읽기',
		status: 'ENDED',
		scheduleTime: '2025-07-29T15:00:00.000',
		cost: 0,
		userLimit: 10,
		userCount: 8,
		joined: true,
		leader: false,
		dday: 'D+1'
	}
	,
	{
		scheduleId: 3,
		name: '온라인 쿠킹 클래스: 이탈리안 파스타',
		status: 'SETTLING',
		scheduleTime: '2025-07-30T18:30:00.000',
		cost: 500,
		userLimit: 30,
		userCount: 22,
		joined: true,
		leader: false,
		dday: 'D+2'
	},
	{
		scheduleId: 4,
		name: "월요일 배드민턴",
		status: "READY",
		scheduleTime: "2025-08-01T08:00:00.000",
		cost: 5000,
		userLimit: 20,
		userCount: 15,
		joined: false,
		leader: false,
		dday: "D-3"
	},
	{
		scheduleId: 5,
		name: "화요일 탁구",
		status: "READY",
		scheduleTime: "2025-08-02T19:00:00.000",
		cost: 10000,
		userLimit: 12,
		userCount: 8,
		joined: true,
		leader: false,
		dday: "D-2"
	},
	{
		scheduleId: 6,
		name: "수요일 영화관람",
		status: "CLOSED",
		scheduleTime: "2025-07-24T19:00:00.000",
		cost: 12000,
		userLimit: 8,
		userCount: 8,
		joined: true,
		leader: false,
		dday: "D+3"
	},
	{
		scheduleId: 7,
		name: "금요일 영화관람",
		status: "READY",
		scheduleTime: "2025-07-24T19:00:00.000",
		cost: 12000,
		userLimit: 8,
		userCount: 8,
		joined: false,
		leader: false,
		dday: "D-1"
	}
];

export default function ScheduleList() {
	const [schedules] = useState<Schedule[]>(mockScheduleData);

	const formatDateTime = (dateTime: string) => {
		const date = new Date(dateTime);
		return date.toLocaleDateString('ko-KR', {
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const getDdayColor = (dday: string) => {
		if (dday === 'D-DAY') return 'bg-red-500 text-white';
		if (dday.startsWith('D-')) return 'bg-orange-500 text-white';
		return 'bg-gray-500 text-white';
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'READY':
				return 'bg-green-100 text-green-800';
			case 'ENDED':
				return 'bg-gray-100 text-gray-800';
			case 'SETTLING':
				return 'bg-orange-100 text-orange-800';
			case 'CLOSED':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'READY':
				return '모집중';
			case 'ENDED':
				return '종료됨';
			case 'SETTLING':
				return '정산중';
			case 'CLOSED':
				return '정산완료';
			default:
				return status;
		}
	};


	const handleStatusClick = (schedule: Schedule) => {
		// 참여 현황 또는 정산 현황 클릭 시 실행될 이벤트
		console.log('Status clicked:', schedule);
		// 여기에서 모달을 열거나 페이지 이동 등의 로직을 추가할 수 있습니다
		// 예: onStatusClick?.(schedule) 같은 콜백 호출
	};

	const getParticipationStatus = (schedule: Schedule) => {
		const isSettlement = schedule.status === 'ENDED' || schedule.status === 'SETTLING';
		const buttonText = isSettlement ? '정산 현황' : '참여 현황';
		const buttonClass = isSettlement
			? "bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
			: "bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer";

		return (
			<button
				onClick={() => handleStatusClick(schedule)}
				className={buttonClass}
			>
				{buttonText} ({schedule.userCount}/{schedule.userLimit === 0 ? '무제한' : schedule.userLimit})
			</button>
		);
	};

	const handleActionClick = (action: string, schedule: Schedule) => {
		console.log(`Action clicked: ${action}`, schedule);
	};

	const getActionButton = (schedule: Schedule) => {
		switch (schedule.status) {
			case 'READY':
				if (schedule.joined) {
					return (
						<button
							onClick={() => handleActionClick('나가기', schedule)}
							className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
						>
							나가기
						</button>
					);
				} else {
					return (
						<button
							onClick={() => handleActionClick('참여하기', schedule)}
							className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
						>
							참여하기
						</button>
					);
				}

			case 'ENDED':
				if (schedule.joined) {
					return (
						<button
							onClick={() => handleActionClick('정산하기', schedule)}
							className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-500 transition-colors"
						>
							정산하기
						</button>
					);
				}
				return null;

			case 'SETTLING':
				if (schedule.joined) {
					return (
						<button
							onClick={() => handleActionClick('정산하기', schedule)}
							className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-500 transition-colors"
						>
							정산하기
						</button>
					);
				}
				return null;

			case 'CLOSED':
				return null;

			default:
				return null;
		}
	};

	return (
		<div className="px-4 pb-20">
			<h2 className="text-base font-semibold text-gray-800 leading-snug mb-2">
				참여중인 일정을 확인해보세요.
			</h2>
			<div className="space-y-4">
				{schedules.map((schedule) => (
					<div key={schedule.scheduleId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
						<div className="p-4">
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1">
									<h3 className="font-semibold text-gray-800 mb-1">{schedule.name}</h3>
									<p className="text-sm text-gray-600 mb-1">
										{`일시 | ${formatDateTime(schedule.scheduleTime)}`}
									</p>
									<div className="text-sm text-gray-600">
										<span>{`인당 비용 | ${schedule.cost === 0 ? '무료' : `${schedule.cost.toLocaleString()}₩`}`}</span>
									</div>
								</div>
								<div className="flex flex-col items-end gap-2">
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${getDdayColor(schedule.dday)}`}>
										{schedule.dday}
									</span>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(schedule.status)}`}>
										{getStatusText(schedule.status)}
									</span>
								</div>
							</div>

							<div className="space-y-3">

								<div className="flex items-center justify-between">
									{getParticipationStatus(schedule)}
									{getActionButton(schedule)}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}