import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';
import MeetingCard, {type Meeting} from './MeetingCard';
import EmptyState from '../search/EmptyState';
import Loading from '../../common/Loading';
import Modal from '../../../components/common/Modal';


interface MeetingListProps {
  mode?: 'home' | 'full' | 'my';
  apiEndpoint?: string;
  showHomeSpecialSections?: boolean;
}

export default function MeetingList({
  mode = 'home',
  apiEndpoint,
  showHomeSpecialSections = false,
}: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [partnerMeetings, setPartnerMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // 모드별 엔드포인트/사이즈 선택
  const getEndpointAndSize = () => {
    switch (mode) {
      case 'my':
        return { endpoint: '/search/user', size: 20 };
      case 'full':
        return { endpoint: apiEndpoint ?? '/search/recommendations', size: 20 };
      case 'home':
        return { endpoint: apiEndpoint ?? '/search/recommendations', size: 20 };
    }
  };

  // 데이터 로드 함수
  const loadMeetings = async (pageNum: number, isNewLoad = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const { endpoint, size } = getEndpointAndSize();

      const response = await apiClient.get<Meeting[]>(endpoint, {
        params: { page: pageNum, size },
      });

      if (response.success) {
        const newMeetings = response.data;

        if (isNewLoad) {
          setMeetings(newMeetings);
        } else {
          setMeetings(prev => [...prev, ...newMeetings]);
        }

        if (newMeetings.length < size) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('모임 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 함께하는 사람들의 모임 (특별 섹션이 활성화된 경우에만)
  const loadPartnerMeetings = async () => {
    if (!showHomeSpecialSections) return;

    try {
      const response = await apiClient.get<Meeting[]>(
        '/search/teammates-clubs',
        {
          params: { page: 0, size: 5 },
        },
      );
      if (response.success) {
        setPartnerMeetings(response.data);
      }
    } catch (error) {
      console.error('함께하는 사람들의 모임 조회 실패:', error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadMeetings(0, true);
    setPage(0);
    setHasMore(true);
    if (showHomeSpecialSections) {
      loadPartnerMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, apiEndpoint, showHomeSpecialSections]);

  // 무한 스크롤 (전체 모드에서만)
  useEffect(() => {
    if (mode !== 'full') return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadMeetings(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, hasMore, loading, mode]);

  const handleViewMorePartner = () => {
    navigate('/partner-meetings');
  };

  const handleViewMoreRecommended = () => {
    navigate('/recommended-meetings');
  };

  const handleJoinMeeting = (clubId: number) => {
    console.log(`모임 ${clubId}에 가입`);
    setAlertMsg('모임 가입이 완료되었습니다!');
    setIsAlertOpen(true);
  };

  // 홈 모드 렌더링
  if (mode === 'home') {
    return (
      <div className="px-4 pb-20">
		{loading && meetings.length === 0 && (
          <div className="py-4">
            <Loading text="로딩 중..." overlay={false} />
          </div>
        )}

        {showHomeSpecialSections && (
          <>
            {/* 맞춤 추천 모임 섹션 */}
            <div>
              <h1 className="text-base font-semibold text-gray-800 leading-snug mb-1">
                📍 내게 딱 맞는 모임을 찾아보세요!
              </h1>
              <h2 className="text-sm text-gray-400">
                내 취향{' '}
                <span className="text-[#EF7C30] font-semibold">맞춤 모임</span>
                을 소개해드려요.
              </h2>
              <div className="space-y-4 mt-2">
                {meetings.map(meeting => (
                  <MeetingCard key={meeting.clubId} meeting={meeting} />
                ))}
              </div>

              {/* 더보기 버튼 */}
              <div className="flex justify-center mt-6 mb-8">
                <button
                  onClick={handleViewMoreRecommended}
                  className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white px-4 py-2 rounded-full text-sm font-medium hover:from-brand-secondary hover:to-brand-primary transition-all duration-200 hover:shadow-md"
                >
                  더보기 →
                </button>
              </div>
            </div>

            {/* 함께하는 사람들의 모임 섹션 */}
            <div className="mb-8">
              <h1 className="text-base font-semibold text-gray-800 leading-snug mb-1">
                ⚽ 모임 친구들은 이런 활동도 해요!
              </h1>
              <h2 className="text-sm text-gray-400">
                함께하는 멤버들의{' '}
                <span className="text-[#EF7C30] font-semibold">다른 모임</span>
                도 구경해 보세요.
              </h2>

			  {loading && partnerMeetings.length === 0 && (
                <div className="py-3">
                  <Loading text="불러오는 중..." overlay={false} />
                </div>
              )}

              <div className="space-y-4 mt-2">
                {partnerMeetings.map(meeting => (
                  <MeetingCard key={meeting.clubId} meeting={meeting} />
                ))}
              </div>

              {/* 더보기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleViewMorePartner}
                  className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white px-4 py-2 rounded-full text-sm font-medium hover:from-brand-secondary hover:to-brand-primary transition-all duration-200 hover:shadow-md"
                >
                  더보기 →
                </button>
              </div>
            </div>
          </>
        )}

        {!showHomeSpecialSections && (
          <>
            {loading && meetings.length === 0 && (
              <div className="py-4">
                <Loading text="로딩 중..." overlay={false} />
              </div>
            )}
            <div className="space-y-4">
              {meetings.map(meeting => (
                <MeetingCard key={meeting.clubId} meeting={meeting} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 전체/내 모드 렌더링
  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto bg-gray-50 relative">
      {loading && meetings.length === 0 && (
        <Loading overlay text="로딩 중..." />
      )}

	  {/* 모임 목록 */}
      <div className="px-4 py-6">
        <div className="space-y-4">
          {meetings.map(meeting => (
            <MeetingCard
              key={meeting.clubId}
              meeting={meeting}
              onJoinSuccess={handleJoinMeeting}
            />
          ))}
        </div>

        {loading && meetings.length > 0 && (
          <div className="py-6">
            <Loading text="불러오는 중..." overlay={false} />
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {!loading && meetings.length === 0 && (
          <EmptyState
            title={mode === 'my' ? '가입한 모임이 없습니다' : '모임이 없습니다'}
            description={
              mode === 'my'
                ? '관심 있는 모임에 가입해보세요!'
                : '새로운 모임을 만들어보시거나 다른 조건으로 검색해보세요'
            }
            showCreateButton={mode !== 'my'}
          />
        )}
      </div>

      <Modal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => setIsAlertOpen(false)}
        title={alertMsg}
        confirmText="확인"
        cancelText="닫기"
        variant="default"
      />
    </div>
  );
}
