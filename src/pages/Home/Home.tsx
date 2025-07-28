import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          벗킷 - 시니어 모임 서비스
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          함께하는 즐거움, 새로운 만남
        </p>
        <Link
          to="/components"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          컴포넌트 갤러리 보기
        </Link>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 h-16">
          <Link to="/home" className="flex flex-col items-center justify-center text-blue-600">
            <i className="ri-home-fill text-lg mb-1"></i>
            <span className="text-xs">홈</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-list-check text-lg mb-1"></i>
            <span className="text-xs">카테고리</span>
          </Link>
          <Link to="/nearby" className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-map-pin-line text-lg mb-1"></i>
            <span className="text-xs">내주변</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-user-line text-lg mb-1"></i>
            <span className="text-xs">프로필</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { Home as default } from './Home';