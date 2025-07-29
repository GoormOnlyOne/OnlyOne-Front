import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function DefaultLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 고정 헤더 - 높이를 명시적으로 설정 */}
      <div className="h-14 flex-shrink-0">
        <Header />
      </div>
      
      {/* 스크롤 가능한 메인 영역 */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
      
      {/* 고정 푸터 - 높이를 명시적으로 설정 */}
      <div className="h-16 flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
}