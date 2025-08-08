import { useLocation, Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import apiClient from '../../../api/client';
import Modal from '../../common/Modal';
import { showToast as globalToast } from '../../common/Toast/ToastProvider';

export default function TitleLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams();

  const [dynamicTitle, setDynamicTitle] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false); // 확인 모달

  useEffect(() => {
    if (
      params.id &&
      pathname.startsWith('/meeting/') &&
      pathname !== '/meeting/create'
    ) {
      // API 호출 예시
      fetchMeetingTitle(params.id);
    }
  }, [params.id, pathname]);

  const fetchMeetingTitle = async (meetingId: string) => {
    try {
      // 임시 예시
      setDynamicTitle(`모임 ${meetingId}`);
    } catch (error) {
      console.error('Failed to fetch meeting title:', error);
      setDynamicTitle('모임 세');
    }
  };

  // 컴포넌트 내부 어딘가(함수들 밑) 추가
const confirmLeave = async () => {
  const meetingId = pathname.match(/\/meeting\/(\d+)/)?.[1];
  if (!meetingId) return;

  try {
    setLeaving(true);
    await apiClient.delete(`/clubs/${meetingId}/leave`);
    globalToast('모임에서 탈퇴하였습니다.', 'success', 2000);
    // 화면은 그대로 유지 (navigate 없음)
  } catch (e) {
    console.error('모임 탈퇴 실패:', e);
    globalToast('모임에 가입하지 않은 상태입니다. 잠시 후 다시 시도해주세요.', 'error', 2000);
  } finally {
    setLeaving(false);
    setIsLeaveModalOpen(false);
  }
};

  let headerProps = null;

  // 경로에 따른 props 설정
  switch (true) {
    case pathname === '/notice':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '알림 목록',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname === '/mypage':
      headerProps = {
        isBack: false,
        isTitle: true,
        titleText: '마이페이지',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname === '/mypage/interest':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '관심 모임',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname === '/mypage/profile':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '프로필 수정하기',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname === '/mypage/wallet':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '정산내역 확인하기',
        isLike: false,
        isOut: false,
      };
      break;

    case /^\/meeting\/\d+\/feed\/create\/?$/.test(pathname):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '게시글 생성',
        isLike: false,
        isOut: false,
      };
      break;

    case /^\/meeting\/\d+\/feed\/\d+\/edit\/?$/.test(pathname):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '게시글 수정',
        isLike: false,
        isOut: false,
      };
      break;

    case /^\/meeting\/\d+\/feed\/\d+$/.test(pathname):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '게시글',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname === '/meeting/create':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '모임 만들기',
        isLike: false,
        isOut: false,
      };
      break;

    case pathname.includes('/meeting/') && pathname.endsWith('/edit'):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '모임 수정하기',
        isLike: false,
        isOut: false,
      };
      break;

    // 모임 상세 페이지 - 동적 경로 처리
    case /^\/meeting\/\d+\/?$/.test(pathname):
      const meetingId = pathname.match(/\/meeting\/(\d+)/)?.[1];
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: meetingId || '모임 상세',
        isLike: true,
        isOut: true,
        // ✅ 헤더에 콜백/디세이블 전달
        onOut: () => setIsLeaveModalOpen(true),
        outDisabled: leaving,
      };
      break;

    // 정산 현황, 참여 현황
    case pathname.includes('/meeting/') &&
      pathname.includes('/schedule/') &&
      pathname.endsWith('/participation'):
      // URL에서 type 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: type === 'settlement' ? '정산 현황' : '참여 현황',
        isLike: false,
        isOut: false,
      };
      break;

    case /^\/meeting\/\d+\/schedule\/create\/?$/.test(pathname):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '정모 만들기',
        isLike: false,
        isOut: false,
      };
      break;

    case /^\/meeting\/\d+\/schedule\/\d+\/edit\/?$/.test(pathname):
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '정모 수정하기',
        isLike: false,
        isOut: false,
      };
      break;

    default:
      headerProps = null; // 헤더 표시 안 함
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 고정 헤더 - 높이를 명시적으로 설정 */}
      {/* 조건부 헤더 렌더링 */}
      {headerProps && (
        <div className="h-14 flex-shrink-0">
          <Header {...headerProps} />
        </div>
      )}

      {/* 스크롤 가능한 메인 영역 */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>

      {/* 고정 푸터 - 높이를 명시적으로 설정 */}
      {pathname === '/mypage' && (
        <div className="h-16 flex-shrink-0">
          <Footer />
        </div>
      )}

      {/* 탈퇴 확인 모달 */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={confirmLeave}
        title="모임에서 탈퇴하시겠습니까?"
      />
    </div>
  );
}
