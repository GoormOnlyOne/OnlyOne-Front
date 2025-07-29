import "tailwindcss";
import Navigation from '../../components/common/Navigation';

export const ComponentGallery = () => {
  return (
    <div>
        <h1>공통 컴포넌트 테스트 용 페이지</h1>

        {/* 공통 컴포넌트 나열 */}

        <Navigation />

        <div className="bg-blue-500 text-white p-4">
          테스트
        </div>
    </div>
  );
};

export { ComponentGallery as default } from './ComponentGallery';