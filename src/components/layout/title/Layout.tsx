import { useLocation, Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function TitleLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams();
  const [ dynamicTitle, setDynamicTitle ] = useState('');
  
  useEffect(() => {
    if (params.id && pathname.startsWith('/meeting/') && pathname !== '/meeting/create') {

      // API 호출 예시
      fetchMeetingTitle(params.id);
    }
  }, [params.id, pathname]);
  
  const fetchMeetingTitle = async (meetingId: string) => {
    try {
      // TODO: 실제 API 호출 코드
      // const response = await fetch(`/api/meetings/${meetingId}`);
      // const data = await response.json();
      // setDynamicTitle(data.title);
      
      // 임시 예시
      setDynamicTitle(`모임 ${meetingId}`);
    } catch (error) {
      console.error('Failed to fetch meeting title:', error);
      setDynamicTitle('모임 상세');
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
    
    case pathname === '/mypage/settlement':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '정산내역 확인하기',
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
      };
      break;

    // 정산 현황, 참여 현황
    case pathname.includes('/meeting/') && pathname.includes('/schedule/') && pathname.endsWith('/participation'):
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
    </div>
  );
}