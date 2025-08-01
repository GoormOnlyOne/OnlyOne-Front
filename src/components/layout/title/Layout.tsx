import { useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function TitleLayout() {
  const location = useLocation();
  const pathname = location.pathname;
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

    case pathname === '/meeting/edit':
      headerProps = {
        isBack: true,
        isTitle: true,
        titleText: '모임 수정하기',
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