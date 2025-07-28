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
    </div>
  );
};

export { Home as default } from './Home';