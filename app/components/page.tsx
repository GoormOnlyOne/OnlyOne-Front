export default function ComponentGallery() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          공통 컴포넌트 테스트 용 페이지
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            여기에 공통 컴포넌트들을 나열할 예정입니다.
          </p>
          
          {/* 공통 컴포넌트 나열 */}
        </div>
      </div>
    </div>
  );
}